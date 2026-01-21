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

    // Use service role to invite user
    await base44.asServiceRole.users.inviteUser(email, 'user');
    
    // Wait for user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find and update the newly created user with full profile
    const allUsers = await base44.asServiceRole.entities.User.list();
    const newUser = allUsers.find(u => u.email === email);
    
    if (!newUser) {
      throw new Error('User created but not found in database');
    }

    // Update with company details and role
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
      message: 'Invite sent successfully'
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create employee' 
    }, { status: 500 });
  }
});