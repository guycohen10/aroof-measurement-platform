import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    const { session_id, user_id, company_id } = await req.json();

    if (!session_id || !user_id || !company_id) {
      return Response.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get Stripe secret key
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      return Response.json({ 
        success: false, 
        error: 'Stripe not configured' 
      }, { status: 500 });
    }

    // Retrieve session from Stripe
    const sessionResponse = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${session_id}`,
      {
        headers: {
          'Authorization': `Bearer ${stripeSecret}`,
        },
      }
    );

    if (!sessionResponse.ok) {
      return Response.json({ 
        success: false, 
        error: 'Session not found' 
      }, { status: 404 });
    }

    const session = await sessionResponse.json();

    // Check if payment is complete
    if (session.payment_status !== 'paid') {
      return Response.json({ 
        success: false, 
        error: 'Payment not completed' 
      });
    }

    // Extract metadata
    const leadId = session.metadata?.lead_id;
    if (!leadId) {
      return Response.json({ 
        success: false, 
        error: 'Lead ID not found in session' 
      });
    }

    // Fetch the marketplace lead
    const marketplaceLeads = await base44.asServiceRole.entities.MarketplaceLead.filter({
      id: leadId
    });

    if (!marketplaceLeads || marketplaceLeads.length === 0) {
      return Response.json({ 
        success: false, 
        error: 'Marketplace lead not found' 
      });
    }

    const marketplaceLead = marketplaceLeads[0];

    // Create Lead record in user's CRM
    const newLead = await base44.asServiceRole.entities.Lead.create({
      name: `Lead - ${marketplaceLead.zip_code}`,
      email: 'pending@example.com',
      phone: 'pending',
      address: marketplaceLead.lead_details,
      lead_status: 'New',
      assigned_company_id: company_id,
      price_sold: marketplaceLead.price
    });

    // Update MarketplaceLead to sold
    await base44.asServiceRole.entities.MarketplaceLead.update(leadId, {
      status: 'sold',
      purchased_by_company_id: company_id,
      purchased_date: new Date().toISOString()
    });

    return Response.json({ 
      success: true,
      lead_id: newLead.id,
      message: 'Lead transferred successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});