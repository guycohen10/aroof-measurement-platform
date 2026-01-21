import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the requesting user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is owner or admin
    const isOwnerOrAdmin = user.aroof_role === 'company_owner' || 
                          user.aroof_role === 'external_roofer' || 
                          user.role === 'admin';
    
    if (!isOwnerOrAdmin) {
      return Response.json({ error: 'Only company owners can invite team members' }, { status: 403 });
    }

    const { email, name, role, company_id } = await req.json();

    if (!email || !name || !role) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the requesting user has permission for this company
    if (user.company_id !== company_id && user.role !== 'admin') {
      return Response.json({ error: 'Cannot invite users to other companies' }, { status: 403 });
    }

    // Get the app URL for redirect
    const appUrl = Deno.env.get('BASE44_APP_URL') || 'localhost:5173';
    const protocol = appUrl.includes('localhost') ? 'http://' : 'https://';
    const redirectUrl = `${protocol}${appUrl}/rooferlogin`;

    console.log('Inviting user:', email, 'redirect:', redirectUrl);

    // Use service role to invite user with proper redirect URL
    await base44.asServiceRole.users.inviteUser(email, 'user', redirectUrl);
    
    // Wait for user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find and update the newly created user with full profile
    const allUsers = await base44.asServiceRole.entities.User.list();
    const newUser = allUsers.find(u => u.email === email);
    
    if (!newUser) {
      return Response.json({ 
        error: 'User invited but profile not found. They may need to check their email first.' 
      }, { status: 202 });
    }

    // Update with company details and role
    await base44.asServiceRole.entities.User.update(newUser.id, {
      full_name: name,
      company_id: company_id,
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
      error: error.message || 'Failed to invite user' 
    }, { status: 500 });
  }
});