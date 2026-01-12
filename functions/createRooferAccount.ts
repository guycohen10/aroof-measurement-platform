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

    // Step 2: Call auth API to create user account
    // Base44 provides auth management at the platform level
    const authResponse = await fetch(
      `${Deno.env.get('BASE44_AUTH_API_URL') || 'https://auth.base44.dev'}/api/auth/signup`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-base44-app-id': Deno.env.get('BASE44_APP_ID'),
          'x-base44-service-role': 'true'
        },
        body: JSON.stringify({
          email,
          password: body.password,
          full_name: fullName,
          company_id: company.id,
          aroof_role: 'external_roofer'
        })
      }
    );

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(error.message || 'Failed to create user account');
    }

    const authData = await authResponse.json();
    console.log('✅ User account created');

    return Response.json({
      success: true,
      message: 'Account created successfully',
      companyId: company.id,
      email,
      sessionToken: authData.session_token
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