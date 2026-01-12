import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, fullName, companyData, selectedPlan } = await req.json();
    const base44 = createClientFromRequest(req);

    // Create Company record
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

    // Return success - company created, user must be invited manually via dashboard
    return Response.json({ 
      success: true, 
      companyId: company.id,
      message: 'Company created. User invitation will be sent separately.'
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 400 });
  }
});