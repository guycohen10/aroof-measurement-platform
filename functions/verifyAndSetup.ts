import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { email, companyId } = await req.json();

    if (!email || !companyId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    // Get the authenticated user
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Update user with company association
    await base44.asServiceRole.entities.User.update(user.id, {
      company_id: companyId,
      aroof_role: 'external_roofer'
    });

    return Response.json({ 
      success: true,
      message: 'Account setup complete' 
    });
  } catch (error) {
    console.error('Setup error:', error);
    return Response.json({ 
      error: error.message || 'Setup failed' 
    }, { status: 500 });
  }
});