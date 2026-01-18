import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Find user by email
    const users = await base44.asServiceRole.entities.User.list();
    const targetUser = users.find(u => u.email === 'greenteamdallas@gmail.com');
    
    if (!targetUser) {
      return Response.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    // Update user to admin with emergency credentials
    await base44.asServiceRole.entities.User.update(targetUser.id, {
      role: 'admin',
      aroof_role: 'god_admin',
      account_status: 'active'
    });
    
    return Response.json({ 
      success: true, 
      message: 'Emergency reset complete. User is now admin.',
      note: 'Password must be reset through authentication provider (Supabase)'
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});