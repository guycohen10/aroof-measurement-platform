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

    // 3. Invite User
    // Note: We use the standard inviteUser. 
    // If this is called unauthenticated, it depends on app settings.
    // If it fails, we catch it.
    console.log(`Inviting user: ${email}`);
    await base44.users.inviteUser(email, 'user');

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