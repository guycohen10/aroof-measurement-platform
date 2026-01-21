import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the requesting user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is owner or admin
    const isOwnerOrAdmin = user.aroof_role === 'company_owner' || 
                          user.aroof_role === 'external_roofer' || 
                          user.role === 'admin';
    
    if (!isOwnerOrAdmin) {
      return Response.json({ success: false, error: 'Only company owners can invite team members' }, { status: 403 });
    }

    const { email, name, role, company_id } = await req.json();

    console.log("INVITE ATTEMPT:", { email, name, role, company_id });

    // Validate required fields
    if (!email) {
      return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
    }
    if (!name) {
      return Response.json({ success: false, error: 'Name is required' }, { status: 400 });
    }
    if (!role) {
      return Response.json({ success: false, error: 'Role is required' }, { status: 400 });
    }

    // Verify the requesting user has permission for this company
    if (user.company_id !== company_id && user.role !== 'admin') {
      return Response.json({ success: false, error: 'Cannot invite users to other companies' }, { status: 403 });
    }

    // Get the app URL for redirect
    const appUrl = Deno.env.get('BASE44_APP_URL') || 'aroof.build';
    const protocol = appUrl.includes('localhost') ? 'http://' : 'https://';
    const redirectUrl = `${protocol}${appUrl}/rooferlogin`;

    console.log('Redirect URL:', redirectUrl);

    // Use service role to invite user with proper redirect URL
    await base44.asServiceRole.users.inviteUser(email, 'user', redirectUrl);
    
    console.log('Invite sent, waiting for user creation...');
    
    // Wait for user creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Find and update the newly created user with full profile
    const allUsers = await base44.asServiceRole.entities.User.list();
    const newUser = allUsers.find(u => u.email === email);
    
    if (!newUser) {
      console.warn('User invited but not found immediately');
      return Response.json({ 
        success: true,
        message: 'Invite sent. User profile will be updated when they accept.'
      });
    }

    // Update with company details and role
    await base44.asServiceRole.entities.User.update(newUser.id, {
      full_name: name,
      company_id: company_id,
      company_name: user.company_name,
      aroof_role: role,
      is_company_owner: false
    });

    console.log('User profile updated successfully');

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
    console.error('INVITE FAILED:', error);
    // Return clean error response without 500 status to prevent crash loops
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to invite user'
    }, { status: 200 }); // Return 200 with success:false instead of 500
  }
});