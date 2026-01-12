import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, password, fullName, companyData, selectedPlan } = await req.json();

    console.log('Creating roofer account for:', email);

    // Step 1: Create Company first
    const company = await base44.asServiceRole.entities.Company.create({
      company_name: companyData.companyName,
      contact_phone: companyData.companyPhone,
      contact_email: email,
      contact_name: fullName,
      address_street: companyData.address,
      address_city: companyData.city,
      address_state: companyData.state,
      address_zip: companyData.zip,
      is_active: true,
      subscription_tier: selectedPlan || 'free',
      subscription_status: selectedPlan === 'free' ? 'active' : 'trial',
      trial_end_date: selectedPlan !== 'free' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : null
    });

    console.log('Company created:', company.id);

    // Step 2: Create User directly in database with service role
    const newUser = await base44.asServiceRole.entities.User.create({
      email: email,
      full_name: fullName,
      role: 'user',
      company_id: company.id,
      company_name: companyData.companyName,
      aroof_role: 'external_roofer',
      phone: companyData.companyPhone,
      subscription_plan: selectedPlan || 'free',
      subscription_status: 'active',
      measurements_used_this_month: 0,
      measurements_limit: selectedPlan === 'unlimited' ? 99999 : (selectedPlan === 'pro' ? 100 : (selectedPlan === 'starter' ? 20 : 3)),
      next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.log('User created:', newUser.id);

    return Response.json({
      success: true,
      message: 'Account created successfully. Please check your email to set your password.',
      companyId: company.id,
      userEmail: email,
      userId: newUser.id
    });

  } catch (err) {
    console.error('createRooferAccount error:', err);
    console.error('Error stack:', err.stack);
    return Response.json({
      success: false,
      error: err.message || 'Failed to create account',
      details: err.stack
    }, { status: 500 });
  }
});