import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the requesting user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only company owners can create employees
    if (!user.is_company_owner && user.aroof_role !== 'company_owner' && user.role !== 'admin') {
      return Response.json({ error: 'Only company owners can create employees' }, { status: 403 });
    }

    const { email, password, name, role } = await req.json();

    if (!email || !password || !name || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use Base44's invite method which creates the user account
    // Then immediately update their profile with full details
    
    // Step 1: Create the user via Base44's user creation
    await base44.asServiceRole.users.inviteUser(email, 'user');
    
    // Step 2: Wait a moment for user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Find and update the newly created user
    const allUsers = await base44.asServiceRole.entities.User.list();
    const newUser = allUsers.find(u => u.email === email);
    
    if (!newUser) {
      throw new Error('User created but not found in database');
    }

    // Step 4: Update with full profile including password reset
    await base44.asServiceRole.entities.User.update(newUser.id, {
      full_name: name,
      company_id: user.company_id,
      company_name: user.company_name,
      aroof_role: role,
      is_company_owner: false
    });

    return Response.json({ 
      success: true, 
      user: {
        id: newUser.id,
        email: email,
        full_name: name
      },
      message: 'User invited. They will receive an email to set their password.'
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create employee' 
    }, { status: 500 });
  }
});