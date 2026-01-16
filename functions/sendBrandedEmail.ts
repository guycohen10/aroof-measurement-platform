import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      to,
      subject,
      body,
      companyId,
      includeLogo = true
    } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let company = null;
    if (companyId && includeLogo) {
      const companies = await base44.entities.Company.filter({ id: companyId });
      company = companies[0];
    }

    // Build email body with branding
    let emailBody = body;

    if (includeLogo && company) {
      if (company.company_logo_url) {
        emailBody = `
<div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
  <img src="${company.company_logo_url}" alt="${company.company_name}" style="max-height: 60px; max-width: 200px;" />
</div>

${body}

<div style="margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
  <strong>${company.company_name}</strong><br>
  ${company.contact_phone ? `📱 ${company.contact_phone}<br>` : ''}
  ${company.contact_email ? `📧 ${company.contact_email}<br>` : ''}
  ${company.address_street ? `📍 ${company.address_street}, ${company.address_city}, ${company.address_state} ${company.address_zip}` : ''}
</div>
        `.trim();
      } else {
        emailBody = `
<div style="margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px;">
  <h2 style="margin: 0; color: #1e293b;">${company.company_name}</h2>
</div>

${body}

<div style="margin-top: 30px; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b;">
  <strong>${company.company_name}</strong><br>
  ${company.contact_phone ? `📱 ${company.contact_phone}<br>` : ''}
  ${company.contact_email ? `📧 ${company.contact_email}<br>` : ''}
  ${company.address_street ? `📍 ${company.address_street}, ${company.address_city}, ${company.address_state} ${company.address_zip}` : ''}
</div>
        `.trim();
      }
    }

    // Send email using Core integration
    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body: emailBody,
      from_name: company?.company_name
    });

    return Response.json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
});