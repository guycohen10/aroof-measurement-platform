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

    // Use service role to create user with password
    // Base44 SDK uses different method for user creation with service role
    const result = await base44.asServiceRole.functions.invoke('createUser', {
      email,
      password,
      metadata: {
        full_name: name,
        company_id: user.company_id,
        company_name: user.company_name,
        aroof_role: role,
        is_company_owner: false
      }
    });

    if (result.data?.error) {
      throw new Error(result.data.error);
    }

    const newUser = result.data;

    return Response.json({ 
      success: true, 
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: name
      }
    });

  } catch (error) {
    console.error('Create employee error:', error);
    return Response.json({ 
      error: error.message || 'Failed to create employee' 
    }, { status: 500 });
  }
});