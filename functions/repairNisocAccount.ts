import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Update the nisoc28@gmail.com user account
    const result = await base44.asServiceRole.entities.User.update(
      { email: 'nisoc28@gmail.com' },
      {
        company_id: 'cmp_NISOC_FIX',
        aroof_role: 'external_roofer',
        company_name: 'Nisoc Roofing'
      }
    );

    return Response.json({
      success: true,
      message: 'User nisoc28@gmail.com repaired successfully',
      updates: {
        company_id: 'cmp_NISOC_FIX',
        aroof_role: 'external_roofer',
        company_name: 'Nisoc Roofing'
      },
      result
    });

  } catch (error) {
    console.error('Repair error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});