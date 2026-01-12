import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, fullName, companyData, selectedPlan } = await req.json();
    const base44 = createClientFromRequest(req);

    // Create Company
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

    // Invite User
    await base44.users.inviteUser(email, 'user');

    return Response.json({ success: true, companyId: company.id });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message, 
      stack: error.stack 
    }, { status: 400 });
  }
});