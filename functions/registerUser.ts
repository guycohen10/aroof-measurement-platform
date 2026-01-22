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
    // Note: If base44.auth.signUp is not available, we fall back to register, but passing options relies on signUp support.
    // We'll try to use the underlying register method if signUp isn't explicitly exposed, 
    // but the user requested this specific logic.
    
    // Check if signUp exists, otherwise try register which might be the wrapper
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
    
    // We need to find the user to ensure the link
    // Note: filter might need to run as service role to see the user immediately if RLS applies? 
    // Usually new users are visible to themselves or admins. Service role is safest.
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users?.[0]) {
       // Ensure the metadata fields are actually set on the entity
       await base44.asServiceRole.entities.User.update(users[0].id, { 
          company_id: newCompany.id,
          aroof_role: 'external_roofer',
          full_name: name
       });
    }

    // Return format matching Supabase response structure somewhat, or just success
    // The user asked for: return new Response(JSON.stringify({ success: true, userId: data.user?.id }));
    // data.user might be inside data if the method returns {data, error} or just the response object
    const userId = data?.user?.id || data?.id || users?.[0]?.id;
    
    return Response.json({ success: true, userId: userId });

  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});