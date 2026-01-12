import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { email, fullName, companyData, selectedPlan } = await req.json();

    // Step 1: Invite user (creates account with email)
    await base44.asServiceRole.users.inviteUser(email, "user");

    // Step 2: Create Company
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

    // Step 3: Find and update user with company data
    const users = await base44.asServiceRole.entities.User.filter({ email });
    
    if (users && users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, {
        full_name: fullName,
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
    }

    return Response.json({
      success: true,
      message: 'Account created successfully',
      companyId: company.id,
      userEmail: email
    });

  } catch (err) {
    console.error('createRooferAccount error:', err);
    return Response.json({
      success: false,
      error: err.message || 'Failed to create account'
    }, { status: 500 });
  }
});