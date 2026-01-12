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

    // Step 2: Invite user via Base44 invite system
    console.log('📧 Inviting user via Base44 system...');
    await base44.users.inviteUser(email, 'user');

    console.log('✅ User invite sent');

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