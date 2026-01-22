import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const { email, name, company, plan } = await req.json();
    const base44 = createClientFromRequest(req);

    // Create Supabase admin client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 1. Check if user exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
    if (existingUsers && existingUsers.length > 0) {
       return Response.json({ error: "User already exists. Please log in." }, { status: 400 });
    }

    // 2. Create Company
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

    // 3. Create User with Supabase Admin API
    console.log(`Creating auth user: ${email}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: false,
      user_metadata: {
        full_name: name,
        company_name: company,
        company_id: newCompany.id,
        aroof_role: 'external_roofer'
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      // Cleanup: delete the company
      await base44.asServiceRole.entities.Company.delete(newCompany.id);
      throw new Error(`Failed to create user: ${authError.message}`);
    }

    console.log(`Auth user created: ${authData.user.id}`);

    // 4. Send invite email
    console.log('Sending invite email...');
    const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email);
    
    if (inviteError) {
      console.warn('Invite email warning:', inviteError.message);
      // Non-critical - user exists, they can use forgot password
    }

    // 5. Link User entity to Company
    console.log('Waiting for User entity creation...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const userEntities = await base44.asServiceRole.entities.User.filter({ email });
    if (userEntities && userEntities.length > 0) {
      const userEntity = userEntities[0];
      console.log(`Updating User entity ${userEntity.id}`);
      
      await base44.asServiceRole.entities.User.update(userEntity.id, { 
        company_id: newCompany.id,
        aroof_role: 'external_roofer',
        full_name: name
      });
      
      console.log('User linked to company');
    } else {
      console.warn('User entity not found - will link on first login');
    }

    return Response.json({ 
      success: true,
      companyId: newCompany.id,
      userId: authData.user.id,
      message: 'Account created. Check your email to set your password.'
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return Response.json({ 
      error: error.message || "Registration failed" 
    }, { status: 400 });
  }
});