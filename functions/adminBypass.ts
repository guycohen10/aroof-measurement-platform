import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// EMERGENCY ADMIN BYPASS - Returns all data without auth checks
Deno.serve(async (req) => {
  try {
    const { entity, operation } = await req.json();
    const base44 = createClientFromRequest(req);
    
    // Bypass all auth - use service role for everything
    let result;
    
    switch(entity) {
      case 'leads':
        result = await base44.asServiceRole.entities.Measurement.list('-created_date', 1000);
        break;
      case 'users':
        result = await base44.asServiceRole.entities.User.list();
        break;
      case 'territories':
        result = await base44.asServiceRole.entities.Territory.list();
        break;
      case 'companies':
        result = await base44.asServiceRole.entities.Company.list();
        break;
      case 'transactions':
        const measurements = await base44.asServiceRole.entities.Measurement.list('-created_date', 500);
        result = measurements.filter(m => m.purchased_by && m.lead_price);
        break;
      default:
        result = [];
    }
    
    return Response.json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      data: [] 
    }, { status: 200 }); // Return 200 even on error so frontend doesn't break
  }
});