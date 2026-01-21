import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify admin access
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Step 1: Create Company
    const company = await base44.asServiceRole.entities.Company.create({
      id: 'cmp_NISOC_FIX_01',
      company_name: 'Nisoc Roofing',
      contact_email: 'nisoc28@gmail.com',
      is_active: true,
      subscription_tier: 'starter',
      subscription_status: 'trial',
      trial_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Step 2: Create User entity record
    const userRecord = await base44.asServiceRole.entities.User.create({
      email: 'nisoc28@gmail.com',
      role: 'user',
      aroof_role: 'external_roofer',
      company_id: 'cmp_NISOC_FIX_01',
      company_name: 'Nisoc Roofing',
      is_company_owner: true
    });

    return Response.json({
      success: true,
      message: 'User and Company created successfully',
      company,
      userRecord
    });

  } catch (error) {
    console.error('Force create error:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});