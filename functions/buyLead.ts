import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@^14.14.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { lead_id, price } = await req.json();

        if (!lead_id) {
            return Response.json({ error: 'Lead ID is required' }, { status: 400 });
        }

        const companyId = user.company_id;
        if (!companyId) {
            return Response.json({ error: 'User must belong to a company to buy leads' }, { status: 400 });
        }

        // 1. Fetch Lead
        const lead = await base44.entities.Lead.get(lead_id);
        if (!lead) {
            return Response.json({ error: 'Lead not found' }, { status: 404 });
        }

        // 2. Validate Purchase Eligibility
        if ((lead.purchase_count || 0) >= 3) {
            return Response.json({ error: 'Lead is no longer available (sold out)' }, { status: 400 });
        }

        // Check if already purchased by this company
        const existingPurchases = await base44.entities.LeadPurchase.filter({
            lead_id: lead_id,
            company_id: companyId
        });

        if (existingPurchases.length > 0) {
            return Response.json({ error: 'You have already purchased this lead' }, { status: 400 });
        }

        // 3. Process Stripe Payment
        const company = await base44.entities.Company.get(companyId);
        if (!company || !company.stripe_customer_id) {
            return Response.json({ error: 'No payment method found. Please add a payment method in Company Settings.' }, { status: 400 });
        }

        const purchasePrice = price || 25.00;
        const amountInCents = Math.round(purchasePrice * 100);

        try {
            // Attempt to charge the customer's default payment method immediately
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: 'usd',
                customer: company.stripe_customer_id,
                description: `Lead Purchase: ${lead.address || 'Lead #' + lead_id}`,
                confirm: true,
                off_session: true, // Indicates the customer is not on-session (using saved card)
                automatic_payment_methods: {
                    enabled: true,
                    allow_redirects: 'never' // Fail if redirect is required (we want instant buy)
                }
            });

            if (paymentIntent.status !== 'succeeded') {
                return Response.json({ error: `Payment failed with status: ${paymentIntent.status}` }, { status: 400 });
            }

        } catch (stripeError) {
            console.error('Stripe Payment Error:', stripeError);
            return Response.json({ error: `Payment failed: ${stripeError.message}` }, { status: 400 });
        }
        
        // 4. Create LeadPurchase Record (Only reached if payment succeeds)
        await base44.entities.LeadPurchase.create({
            lead_id: lead_id,
            company_id: companyId,
            user_id: user.id,
            purchase_date: new Date().toISOString(),
            price_paid: purchasePrice
        });

        // 5. Update Lead Count
        const newCount = (lead.purchase_count || 0) + 1;
        
        await base44.entities.Lead.update(lead_id, {
            purchase_count: newCount,
        });

        return Response.json({ success: true, new_count: newCount });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});