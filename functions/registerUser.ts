import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company, plan } = await req.json();
    const base44 = createClientFromRequest(req);

    // 1. Check if user exists (using Service Role for full access)
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers && existingUsers.length > 0) {
       return Response.json({ error: "User already exists. Please log in." }, { status: 400 });
    }

    // 2. Create Company (Service Role)
    console.log(`Creating company: ${company}`);
    const newCompany = await base44.asServiceRole.entities.Company.create({
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: plan || 'starter',
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (!newCompany?.id) {
        throw new Error("Failed to create company");
    }

    // 3. Create User (Admin Mode)
    // We try to use the auth admin api if available, otherwise fallback to inviteUser
    // Note: base44.asServiceRole.auth might not be documented but we try it as requested
    // If it fails, we will catch it and try standard invite
    try {
        console.log(`Creating user via admin auth: ${email}`);
        const { data: authUser, error: authError } = await base44.asServiceRole.auth.admin.createUser({
            email: email,
            email_confirm: true, 
            user_metadata: { 
                full_name: name, 
                company_name: company,
                selected_plan: plan || 'starter'
            }
        });
        if (authError) throw authError;

        console.log(`Sending invite email to: ${email}`);
        await base44.asServiceRole.auth.admin.inviteUserByEmail(email);
    } catch (e) {
        console.warn("Admin auth creation failed, falling back to standard invite:", e.message);
        // Fallback to standard invite if admin auth fails (e.g. if property doesn't exist)
        await base44.users.inviteUser(email, 'user');
    }

    // 4. Link User to Company (Service Role)
    // We wait briefly for the user record to be created by the invite
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const users = await base44.asServiceRole.entities.User.filter({ email });
    const user = users[0];

    if (user) {
        console.log(`Linking user ${user.id} to company ${newCompany.id}`);
        // We can set custom attributes here
        await base44.asServiceRole.entities.User.update(user.id, { 
            company_id: newCompany.id,
            aroof_role: 'external_roofer',
            full_name: name,
            // Store plan in metadata if needed, but it's on company
        });
    }

    return Response.json({ 
      success: true,
      companyId: newCompany.id 
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({ 
      error: error.message || "Registration failed" 
    }, { status: 400 });
  }
});