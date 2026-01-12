import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const { email, fullName, companyData, selectedPlan } = await req.json();
  const base44 = createClientFromRequest(req);

  const company = await base44.asServiceRole.entities.Company.create({
    company_name: companyData.companyName,
    contact_email: email,
    contact_name: fullName,
    is_active: true,
    subscription_tier: selectedPlan || 'basic',
    subscription_status: 'trial'
  });

  return Response.json({ success: true, companyId: company.id });
});