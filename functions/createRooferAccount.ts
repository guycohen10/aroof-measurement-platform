import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const data = await req.json();
    const base44 = createClientFromRequest(req);

    const company = await base44.asServiceRole.entities.Company.create({
      company_name: data.companyData?.companyName || data.company_name,
      contact_email: data.email,
      contact_name: data.fullName || data.full_name,
      is_active: true,
      subscription_status: 'trial'
    });

    // Send user invitation
    await base44.users.inviteUser(data.email, "admin");

    return new Response(JSON.stringify({
      success: true,
      message: "Company created and invitation sent to your email!",
      companyId: company.id
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 400, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});