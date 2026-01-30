import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

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
        if (lead.purchase_count >= 3) {
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

        // 3. Process Purchase (In a real app, this would deduct credits/charge card)
        // For now, we just record the transaction
        
        // 4. Create LeadPurchase Record
        await base44.entities.LeadPurchase.create({
            lead_id: lead_id,
            company_id: companyId,
            user_id: user.id,
            purchase_date: new Date().toISOString(),
            price_paid: price || 25.00 // Default price if not provided
        });

        // 5. Update Lead Count & Status
        const newCount = (lead.purchase_count || 0) + 1;
        
        // If this is the first purchase, add company to assigned_company_id (if we want to track primary owner)
        // But for marketplace, we track via LeadPurchase. 
        // We can leave assigned_company_id null or use it for the "first" buyer if needed.
        // The requirement says "My Purchased Leads" checks LeadPurchase table, so we rely on that.
        
        await base44.entities.Lead.update(lead_id, {
            purchase_count: newCount,
            // If sold out, maybe update status? Or just keep as New/Unpurchased until someone "works" it?
            // Requirement says: "Once purchase_count reaches 3, lead no longer appears in Hot Leads"
            // We handle visibility in frontend/query logic.
        });

        return Response.json({ success: true, new_count: newCount });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});