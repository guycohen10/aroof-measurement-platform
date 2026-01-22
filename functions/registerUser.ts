import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company } = await req.json();

    // 1. Validate
    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!company) {
      return Response.json({ error: 'Company name is required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // 2. Check if user already exists (to prevent 500 errors)
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
      if (existingUsers && existingUsers.length > 0) {
        return Response.json({ error: 'User already exists. Please log in.' }, { status: 400 });
      }
    } catch (checkError) {
      console.log('User check (expected if new user):', checkError.message);
    }

    // 3. Create company record
    const company_id = 'cmp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    await base44.asServiceRole.entities.Company.create({
      company_id: company_id,
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: 'starter',
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    // 4. Invite User
    // Uses standard inviteUser flow. Redirect is handled by frontend interceptor on Homepage if platform redirect fails.
    await base44.users.inviteUser(email, 'user');

    console.log('Company created:', company_id);
    console.log('User invited:', email);
    
    return Response.json({ 
      success: true, 
      message: 'Setup link sent to your email',
      companyId: company_id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    const isUserError = error.message.includes('already exists') || 
                        error.message.includes('invalid') ||
                        error.message.includes('required');
    
    return Response.json({ 
      error: error.message || 'Registration failed. Please try again.' 
    }, { status: isUserError ? 400 : 500 });
  }
});