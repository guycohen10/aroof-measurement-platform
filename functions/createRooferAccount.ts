import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const base44 = createClientFromRequest(req);

    // Step 1: Create Company
    const company = await base44.asServiceRole.entities.Company.create({
      company_name: data.companyData?.companyName || data.company_name,
      contact_email: data.email,
      contact_name: data.fullName || data.full_name,
      contact_phone: data.companyData?.companyPhone,
      address_street: data.companyData?.address,
      address_city: data.companyData?.city,
      address_state: data.companyData?.state,
      address_zip: data.companyData?.zip,
      is_active: true,
      subscription_status: 'trial',
      subscription_tier: data.selectedPlan || 'free'
    });

    // Step 2: Create Auth User
    const newUser = await base44.asServiceRole.auth.signUp({
      email: data.email,
      password: data.password,
      full_name: data.fullName || data.full_name
    });

    // Step 3: Update User Metadata
    await base44.asServiceRole.auth.updateUser(newUser.id, {
      company_id: company.id,
      aroof_role: 'external_roofer',
      subscription_plan: data.selectedPlan || 'free',
      measurements_used_this_month: 0
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Account created successfully! You can now log in.",
      companyId: company.id,
      userId: newUser.id
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Signup error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});