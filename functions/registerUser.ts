import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, password, name, company } = await req.json();

    // Input validation
    if (!email || !password || !name || !company) {
      return Response.json({ error: 'Email, password, name, and company are required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    // Check if user already exists
    try {
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
      if (existingUsers && existingUsers.length > 0) {
        return Response.json({ error: 'User already exists' }, { status: 400 });
      }
    } catch (checkError) {
      console.log('User check error (may be expected):', checkError.message);
    }

    // Create company record first
    const companyId = 'cmp_' + Date.now();
    await base44.asServiceRole.entities.Company.create({
      company_id: companyId,
      company_name: company,
      contact_email: email,
      contact_name: name,
      subscription_status: 'trial',
      is_active: true
    });

    // Create user with password (using auth signup)
    const newUser = await base44.asServiceRole.auth.signUp({
      email,
      password,
      full_name: name,
      company_id: companyId,
      aroof_role: 'external_roofer',
      role: 'user'
    });

    return Response.json({ 
      success: true, 
      message: 'Account created successfully. You can now log in.',
      companyId,
      userId: newUser.id
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Determine if this is a user error or server error
    const isUserError = error.message.includes('already exists') || 
                        error.message.includes('invalid') ||
                        error.message.includes('required');
    
    return Response.json({ 
      error: error.message || 'Registration failed. Please try again.' 
    }, { status: isUserError ? 400 : 500 });
  }
});