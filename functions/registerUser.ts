import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company } = await req.json();

    if (!email) throw new Error("Email is required");
    if (!name) throw new Error("Name is required");
    if (!company) throw new Error("Company name is required");

    const base44 = createClientFromRequest(req);

    // 1. Create the Company Entity FIRST
    // Using service role to ensure we can create it without user auth
    console.log("Creating company for:", company);
    const newCompany = await base44.asServiceRole.entities.Company.create({
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: 'starter',
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (!newCompany || !newCompany.id) {
        throw new Error("Failed to create company record");
    }

    console.log("Company created with ID:", newCompany.id);

    // 2. Invite User (Linked to Company)
    // We pass metadata to link the user to the company immediately upon creation
    console.log("Inviting user:", email);
    await base44.users.inviteUser(email, 'user', { 
        data: { 
            name: name,
            full_name: name, 
            company_id: newCompany.id,
            aroof_role: 'external_roofer',
            'custom:company_name': company 
        } 
    });

    console.log("User invited successfully");

    return Response.json({ 
      success: true, 
      companyId: newCompany.id 
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ 
      error: error.message || 'Registration failed' 
    }, { status: 500 });
  }
});