import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, fullName, companyData, selectedPlan } = body;

    console.log('🚀 Creating account for:', email);

    const base44 = createClientFromRequest(req);

    // Step 1: Create Company (via service role for public signup)
    console.log('📦 Creating company...');
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
      subscription_tier: selectedPlan || 'basic',
      subscription_status: 'trial'
    });

    console.log('✅ Company created:', company.id);

    // Step 2: Create User directly via service role
    console.log('👤 Creating user account...');
    const user = await base44.asServiceRole.entities.User.create({
      email,
      full_name: fullName,
      role: 'user',
      company_id: company.id,
      aroof_role: 'external_roofer'
    });

    console.log('✅ User created:', user.id);

    return Response.json({
      success: true,
      message: 'Account created successfully',
      companyId: company.id,
      userId: user.id,
      email
    });

  } catch (error) {
    console.error('❌ Full Error:', error);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      errorType: error.constructor.name,
      stack: error.stack
    }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});