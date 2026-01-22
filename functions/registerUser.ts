import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // 1. Capture the REAL password from the request
    const { email, name, company, plan, password } = await req.json();
    const base44 = createClientFromRequest(req);

    // 2. Create Company FIRST (Standard Client or Service Role if available)
    // We need the ID to link the user.
    const newCompany = await base44.asServiceRole.entities.Company.create({
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: plan || 'starter',
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (!newCompany?.id) throw new Error("Failed to create Company");

    // 3. Sign Up User with REAL PASSWORD (Public Method)
    // usage of 'base44.auth.signUp' allows public registration without admin keys.
    const authMethod = base44.auth.signUp || base44.auth.register;
    
    const { data, error } = await authMethod({
      email: email,
      password: password, // <--- CRITICAL: Use the user's chosen password
      options: {
        data: {
          full_name: name,
          company_name: company,
          company_id: newCompany.id,
          aroof_role: 'external_roofer'
        }
      }
    });

    if (error) {
      // Cleanup company if auth fails
      await base44.asServiceRole.entities.Company.delete(newCompany.id);
      throw new Error(error.message);
    }

    // 4. Ensure Link (Safety Net)
    await new Promise(r => setTimeout(r, 1000));
    
    // Attempt to link user to company again to be safe
    // Note: The options.data in signUp might handle this automatically if RLS/Triggers allow, 
    // but explicit update ensures it.
    try {
        const users = await base44.asServiceRole.entities.User.filter({ email });
        if (users?.[0]) {
           await base44.asServiceRole.entities.User.update(users[0].id, { 
              company_id: newCompany.id,
              aroof_role: 'external_roofer',
              full_name: name
           });
        }
    } catch (linkError) {
        console.warn("Secondary linking failed, but user created:", linkError);
    }

    // Return response
    const userId = data?.user?.id || data?.id;
    return Response.json({ success: true, userId: userId });

  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});