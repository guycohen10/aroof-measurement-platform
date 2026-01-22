import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company, plan } = await req.json();
    const base44 = createClientFromRequest(req);

    // 1. Check if user exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers && existingUsers.length > 0) {
       return Response.json({ error: "User already exists. Please log in." }, { status: 400 });
    }

    // 2. Create Company using Service Role
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

    console.log(`Company created: ${newCompany.id}`);

    // 3. Create User via Public Registration
    // Since we don't have Admin API access (no secrets), we use the public signup flow
    // with a temporary password, then trigger a password reset flow.
    const tempPassword = crypto.randomUUID() + "Aa1!";
    console.log(`Registering user: ${email}`);
    
    // Attempt registration
    let authUser = null;
    try {
        const result = await base44.auth.register(email, tempPassword);
        // SDK might return { user, session } or just user, or throw
        authUser = result.user || result; 
    } catch (e) {
        // If registration fails, cleanup company
        console.error("Auth register failed:", e);
        await base44.asServiceRole.entities.Company.delete(newCompany.id);
        throw new Error(`Failed to create user account: ${e.message}`);
    }

    if (!authUser?.id) {
        await base44.asServiceRole.entities.Company.delete(newCompany.id);
        throw new Error("User registration completed but no ID returned");
    }

    console.log(`Auth user created: ${authUser.id}`);

    // 4. Update User Entity with Role & Company
    // We need to wait for the entity to be created (if triggered) or update it
    console.log('Linking user to company...');
    
    // Retry loop to ensure User entity exists before updating
    let userLinked = false;
    for (let i = 0; i < 5; i++) {
        try {
            await base44.asServiceRole.entities.User.update(authUser.id, { 
                company_id: newCompany.id,
                aroof_role: 'external_roofer',
                full_name: name
            });
            userLinked = true;
            break;
        } catch (e) {
            console.log(`Attempt ${i+1} to link user failed, retrying...`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    if (!userLinked) {
        console.warn("Could not link user to company immediately. They may need to contact support or it will sync later.");
    } else {
        console.log('User successfully linked');
    }

    // 5. Send "Invite" (Password Reset) Email
    // Since we used a dummy password, we send a reset link so they can set their own
    console.log('Sending password reset email...');
    try {
        await base44.auth.resetPasswordRequest(email);
    } catch (e) {
        console.warn("Failed to send password reset email:", e);
    }

    return Response.json({ 
      success: true,
      companyId: newCompany.id,
      userId: authUser.id,
      message: 'Account created. Please check your email to set your password.'
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({ 
      error: error.message || "Registration failed" 
    }, { status: 400 });
  }
});