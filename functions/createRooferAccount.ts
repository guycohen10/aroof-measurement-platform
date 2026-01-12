import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, fullName, companyData, selectedPlan } = body;

    console.log('🚀 Starting account creation for:', email);

    const base44 = createClientFromRequest(req);

    // Create Company
    console.log('📦 Creating company:', companyData.companyName);
    const company = await base44.asServiceRole.entities.Company.create({
      company_name: companyData.companyName,
      contact_email: email,
      contact_name: fullName,
      contact_phone: companyData.companyPhone || '',
      address_street: companyData.address || '',
      address_city: companyData.city || '',
      address_state: companyData.state || '',
      address_zip: companyData.zip || '',
      is_active: true,
      subscription_tier: selectedPlan || 'free',
      subscription_status: 'active'
    });

    console.log('✅ Company created:', company.id);

    // Create User record with extended attributes
    console.log('👤 Creating user:', email);
    const newUser = await base44.asServiceRole.entities.User.create({
      email,
      full_name: fullName,
      role: 'user',
      company_id: company.id,
      aroof_role: 'external_roofer',
      subscription_plan: selectedPlan || 'free'
    });

    console.log('✅ User created:', newUser.id);

    return Response.json({
      success: true,
      message: 'Account created successfully',
      companyId: company.id,
      userId: newUser.id,
      email
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('📋 Full error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Account creation failed'
    }, { status: 500 });
  }
});