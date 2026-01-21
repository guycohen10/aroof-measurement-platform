import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lead_id, headline, price, user_id, company_id } = await req.json();

    if (!lead_id || !price || !user_id || !company_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get Stripe secret key
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Create Stripe Checkout Session
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'mode': 'payment',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': Math.round(price * 100),
        'line_items[0][price_data][product_data][name]': headline,
        'line_items[0][quantity]': '1',
        'success_url': `${getBaseUrl(req)}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${getBaseUrl(req)}/buy-leads`,
        'metadata[lead_id]': lead_id,
        'metadata[user_id]': user_id,
        'metadata[company_id]': company_id,
      }),
    });

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.json();
      console.error('Stripe error:', error);
      return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }

    const session = await checkoutResponse.json();

    return Response.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getBaseUrl(req) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}