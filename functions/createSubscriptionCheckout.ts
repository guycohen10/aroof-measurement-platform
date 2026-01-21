import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId, email, userId } = await req.json();

    if (!priceId || !email || !userId) {
      return Response.json({ 
        error: 'Missing required fields: priceId, email, userId' 
      }, { status: 400 });
    }

    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    // Step 1: Search for existing Stripe customer with this email
    console.log('Searching for existing Stripe customer:', email);
    
    let customerId;
    const customerSearchResponse = await fetch(
      `https://api.stripe.com/v1/customers/search?query=email:"${email}"`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${stripeSecret}`,
        },
      }
    );

    const customerSearchData = await customerSearchResponse.json();
    
    if (customerSearchData.data && customerSearchData.data.length > 0) {
      // Customer exists
      customerId = customerSearchData.data[0].id;
      console.log('Found existing Stripe customer:', customerId);
    } else {
      // Step 2: Create new Stripe customer
      console.log('Creating new Stripe customer for email:', email);
      
      const createCustomerResponse = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecret}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'email': email,
          'metadata[userId]': userId,
          'description': `Roofing contractor signup`
        }),
      });

      const customerData = await createCustomerResponse.json();

      if (!createCustomerResponse.ok) {
        console.error('Stripe customer creation error:', customerData);
        return Response.json({ 
          error: 'Failed to create Stripe customer',
          details: customerData.error?.message || JSON.stringify(customerData)
        }, { status: 400 });
      }

      customerId = customerData.id;
      console.log('Created new Stripe customer:', customerId);
    }

    // Step 3: Create checkout session
    console.log('Creating checkout session for customer:', customerId);
    
    const baseUrl = getBaseUrl(req);
    
    const checkoutResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'payment_method_types[0]': 'card',
        'mode': 'subscription',
        'customer': customerId,
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'subscription_data[trial_period_days]': '7',
        'success_url': `${baseUrl}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${baseUrl}/roofer-signup`,
      }),
    });

    const sessionData = await checkoutResponse.json();

    if (!checkoutResponse.ok) {
      console.error('Stripe checkout creation error:', sessionData);
      return Response.json({ 
        error: 'Failed to create checkout session',
        details: sessionData.error?.message || JSON.stringify(sessionData)
      }, { status: 400 });
    }

    console.log('✅ Checkout session created:', sessionData.id);

    return Response.json({ 
      sessionId: sessionData.id,
      url: sessionData.url 
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return Response.json({ 
      error: 'Unexpected error: ' + error.message,
      details: error.stack
    }, { status: 500 });
  }
});

function getBaseUrl(req) {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}