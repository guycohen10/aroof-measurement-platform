import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, name, company } = await req.json();

    // Input validation
    if (!email || !name || !company) {
      return Response.json({ error: 'Email, name, and company are required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if user already exists
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
      if (existingUsers && existingUsers.length > 0) {
        return Response.json({ error: 'An account with this email already exists' }, { status: 400 });
      }
    } catch (checkError) {
      console.log('User check (expected if user does not exist):', checkError.message);
    }

    // Create company record
    const company_id = 'cmp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const companyRecord = await base44.asServiceRole.entities.Company.create({
      company_id: company_id,
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      subscription_tier: 'starter',
      is_active: true,
      trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 day trial
    });

    // Invite user - this sends an email with a link to set password
    // The user will be redirected to the app after clicking the link
    await base44.users.inviteUser(email, 'user');

    // Store company metadata for later association
    // When user accepts invite and logs in, we'll update their profile with company_id
    console.log('Company created:', company_id);
    console.log('User invited:', email);
    
    return Response.json({ 
      success: true, 
      message: 'Invitation sent successfully. Please check your email to set your password and activate your account.',
      companyId: company_id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Determine if this is a user error or server error
    const isUserError = error.message.includes('already exists') || 
                        error.message.includes('invalid') ||
                        error.message.includes('required') ||
                        error.message.includes('duplicate');
    
    return Response.json({ 
      error: error.message || 'Registration failed. Please try again.' 
    }, { status: isUserError ? 400 : 500 });
  }
});