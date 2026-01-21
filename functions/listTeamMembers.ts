import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate the requesting user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id } = await req.json();

    // Verify user belongs to the company they're querying
    if (user.company_id !== company_id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Use service role to list all users
    const allUsers = await base44.asServiceRole.entities.User.list();
    
    // Filter to company members
    const teamMembers = allUsers.filter(u => u.company_id === company_id);

    return Response.json({ 
      success: true, 
      team: teamMembers 
    });

  } catch (error) {
    console.error('List team error:', error);
    return Response.json({ 
      error: error.message || 'Failed to list team members' 
    }, { status: 500 });
  }
});