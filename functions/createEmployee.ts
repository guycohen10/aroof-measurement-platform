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

    console.log("INVITE ATTEMPT (Service Role):", email);

    // Validate required fields
    if (!email) {
      return Response.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Verify the requesting user has permission for this company
    if (user.company_id !== company_id && user.role !== 'admin') {
      return Response.json({ success: false, error: 'Cannot invite users to other companies' }, { status: 403 });
    }

    // CRITICAL FIX: Elevate to Service Role (Admin)
    // This bypasses RLS restrictions that hide the User entity from roofers
    const result = await base44.asServiceRole.entities.User.create({
      email: email,
      full_name: name || 'New Employee',
      role: 'user',
      company_id: company_id,
      company_name: user.company_name,
      aroof_role: role,
      is_company_owner: false
    });

    console.log('SERVICE ROLE: User created successfully:', result.id);

    return Response.json({ 
      success: true, 
      id: result.id,
      user: {
        id: result.id,
        email: email,
        full_name: name
      }
    });

  } catch (error) {
    console.error('ENTITY CREATE FAILED:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to create User entity'
    }, { status: 200 });
  }
});