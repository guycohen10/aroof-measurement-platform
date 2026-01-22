import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, password, name, company } = await req.json();

    if (!email || !password || !name || !company) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Use service role to invite the user
    // Base44 manages auth - we invite users who then set their password
    const result = await base44.asServiceRole.users.inviteUser(email, 'user');

    // Create company record
    const companyId = 'cmp_' + Date.now();
    await base44.asServiceRole.entities.Company.create({
      company_id: companyId,
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      is_active: true
    });

    return Response.json({ 
      success: true, 
      message: 'Invitation sent. Check your email to set up your account.',
      companyId 
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ 
      error: error.message || 'Registration failed' 
    }, { status: 500 });
  }
});