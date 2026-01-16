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
    const { measurementId, companyId, rooferEmail } = await req.json();

    // Get measurement and company details
    const measurement = await base44.asServiceRole.entities.Measurement.get(measurementId);
    const company = await base44.asServiceRole.entities.Company.get(companyId);

    // Email to roofer
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: rooferEmail,
      subject: `Lead Purchased Successfully - ${measurement.property_address}`,
      body: `
Congratulations ${company.company_name}!

You've successfully purchased this lead:

Customer Information:
👤 Name: ${measurement.customer_name}
📧 Email: ${measurement.customer_email}
📞 Phone: ${measurement.customer_phone || 'Not provided'}
📍 Address: ${measurement.property_address}
📐 Roof Area: ${measurement.total_sqft ? Math.round(measurement.total_sqft).toLocaleString() : 'N/A'} sq ft

Next Steps:
1. Contact the homeowner within 24 hours
2. Schedule a site visit or provide a remote quote
3. View full measurement details in your dashboard

👉 View Lead Details: https://aroof.build/estimatorleaddetail?id=${measurementId}

Best regards,
The Aroof Team
      `
    });

    // Email to homeowner
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: measurement.customer_email,
      subject: `A Roofing Contractor Will Contact You Soon!`,
      body: `
Hello ${measurement.customer_name},

Great news! ${company.company_name} has claimed your roofing estimate request.

They will contact you within 24 hours to:
• Discuss your roofing needs
• Answer your questions
• Provide a detailed estimate

Your property: ${measurement.property_address}

If you have any questions, please contact us at support@aroof.build

Thank you for using Aroof!

Best regards,
The Aroof Team
      `
    });

    return Response.json({ success: true }, { headers });

  } catch (error) {
    console.error('Confirmation email error:', error);
    return Response.json({ 
      error: error.message 
    }, { headers, status: 500 });
  }
});