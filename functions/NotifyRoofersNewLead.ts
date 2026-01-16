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
    const { measurementId, address, city, sqft, leadPrice } = await req.json();

    // Get all active roofer companies
    const companies = await base44.asServiceRole.entities.Company.filter({
      subscription_status: "active",
      is_active: true
    });

    console.log(`📧 Sending notifications to ${companies.length} active roofers`);

    // Send email to each roofer
    for (const company of companies) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: company.contact_email,
          subject: `New Roofing Lead Available - ${address}`,
          body: `
Hello ${company.company_name},

A new roofing lead is available in your area!

Property Details:
📍 Address: ${address}
🏠 Location: ${city || 'N/A'}
📐 Roof Size: ${sqft ? Math.round(sqft).toLocaleString() : 'N/A'} sq ft
💰 Lead Price: $${leadPrice || 25}

This homeowner has requested quotes from roofing contractors. Purchase this lead to get their full contact information and be the first to provide them with an estimate.

👉 View and Purchase Lead: https://aroof.build/rooferbrowseleads

First roofer to purchase gets exclusive access!

Best regards,
The Aroof Team
          `
        });
        
        console.log(`✅ Notified ${company.company_name}`);
      } catch (emailErr) {
        console.error(`Failed to notify ${company.company_name}:`, emailErr);
      }
    }

    return Response.json({ 
      success: true, 
      notified: companies.length 
    }, { headers });

  } catch (error) {
    console.error('Notification error:', error);
    return Response.json({ 
      error: error.message 
    }, { headers, status: 500 });
  }
});