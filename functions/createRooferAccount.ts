import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { email, fullName, companyData, selectedPlan } = body;

    console.log('🚀 Creating account for:', email);

    const base44 = createClientFromRequest(req);

    // DEBUG: Log available methods
    console.log('🔍 DEBUG: base44 keys:', Object.keys(base44));
    console.log('🔍 DEBUG: base44.auth keys:', base44.auth ? Object.keys(base44.auth) : 'auth is undefined');
    console.log('🔍 DEBUG: base44.asServiceRole keys:', base44.asServiceRole ? Object.keys(base44.asServiceRole) : 'asServiceRole is undefined');
    
    if (base44.auth) {
      console.log('🔍 DEBUG: base44.auth methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(base44.auth)));
    }
    
    if (base44.asServiceRole && base44.asServiceRole.auth) {
      console.log('🔍 DEBUG: base44.asServiceRole.auth keys:', Object.keys(base44.asServiceRole.auth));
    }
    
    console.log('🔍 DEBUG: base44.users exists?', !!base44.users);
    if (base44.users) {
      console.log('🔍 DEBUG: base44.users methods:', Object.keys(base44.users));
    }

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

    // Step 2: Use inviteUser (automated invite flow)
    console.log('📧 Inviting user...');
    await base44.users.inviteUser(email, 'user');

    console.log('✅ User invited');

    return Response.json({
      success: true,
      message: 'Account created! Please check your email to set your password.',
      companyId: company.id,
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