import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    const base44 = createClientFromRequest(req);

    // Get leads that are >24 hours old and not purchased
    const allLeads = await base44.asServiceRole.entities.Measurement.filter({
      available_for_purchase: true,
      lead_status: "new",
      agrees_to_quotes: true
    });

    const unpurchasedLeads = allLeads.filter(lead => {
      if (lead.purchased_by) return false;
      
      const createdDate = new Date(lead.created_date);
      const hoursSinceCreated = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60);
      
      return hoursSinceCreated >= 24 && !lead.reminder_sent;
    });

    console.log(`Found ${unpurchasedLeads.length} unpurchased leads >24 hours old`);

    // Get all active roofers for reminder
    const companies = await base44.asServiceRole.entities.Company.filter({
      subscription_status: "active",
      is_active: true
    });

    for (const lead of unpurchasedLeads) {
      // Send reminder to all roofers
      for (const company of companies) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: company.contact_email,
            subject: `⏰ Reminder: Unclaimed Lead - ${lead.property_address}`,
            body: `
Hello ${company.company_name},

This roofing lead has been available for 24 hours and is still unclaimed:

📍 Address: ${lead.property_address}
📐 Roof Size: ${lead.total_sqft ? Math.round(lead.total_sqft).toLocaleString() : 'N/A'} sq ft
💰 Lead Price: $${lead.lead_price || 25}

Don't miss out on this opportunity! Purchase this lead before another contractor does.

👉 Purchase Lead: https://aroof.build/rooferbrowseleads

Best regards,
The Aroof Team
            `
          });
        } catch (err) {
          console.error(`Failed to send reminder to ${company.company_name}:`, err);
        }
      }

      // Mark reminder as sent
      await base44.asServiceRole.entities.Measurement.update(lead.id, {
        reminder_sent: true
      });
    }

    return Response.json({ 
      success: true,
      checked: allLeads.length,
      reminders_sent: unpurchasedLeads.length
    }, { headers });

  } catch (error) {
    console.error('Check unpurchased leads error:', error);
    return Response.json({ 
      error: error.message 
    }, { headers, status: 500 });
  }
});