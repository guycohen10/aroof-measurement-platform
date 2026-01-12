import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const base44 = createClientFromRequest(req);

    // ONLY Create Company with Service Role
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

    return new Response(JSON.stringify({
      success: true,
      companyId: company.id
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    console.error('Create company error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});