
import React from "react";
import { format } from "date-fns";

// Generate homeowner PDF content as HTML
export const generateHomeownerPDFContent = (measurement, sections, totalArea, estimate) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Aroof - Roof Measurement Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
      padding: 40px;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #64748b;
      font-size: 14px;
    }
    .success-badge {
      background: #10b981;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      margin: 20px 0;
      font-weight: bold;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    .info-item {
      padding: 10px;
      background: #f8fafc;
      border-radius: 6px;
    }
    .info-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
    }
    .area-box {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 20px 0;
    }
    .area-box .number {
      font-size: 60px;
      font-weight: bold;
      margin: 10px 0;
    }
    .area-box .label {
      font-size: 20px;
      opacity: 0.9;
    }
    .estimate-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      margin: 20px 0;
    }
    .estimate-box .amount {
      font-size: 48px;
      font-weight: bold;
      margin: 10px 0;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .breakdown-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .breakdown-table td:first-child {
      color: #64748b;
    }
    .breakdown-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .breakdown-table tr.total td {
      border-top: 2px solid #1e40af;
      padding-top: 15px;
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
    }
    .included-list {
      list-style: none;
      padding: 0;
    }
    .included-list li {
      padding: 8px 0 8px 30px;
      position: relative;
    }
    .included-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #10b981;
      font-weight: bold;
      font-size: 18px;
    }
    .cta-section {
      background: #1e40af;
      color: white;
      padding: 30px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    .cta-section h2 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    .cta-section p {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 20px;
    }
    .trust-badges {
      display: flex;
      justify-content: space-around;
      margin: 20px 0;
      text-align: center;
    }
    .trust-badge {
      flex: 1;
    }
    .trust-badge .icon {
      font-size: 24px;
      margin-bottom: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    .disclaimer {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      color: #78350f;
      margin: 20px 0;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Aroof</div>
    <div class="subtitle">Professional Roofing Solutions | Aroof.build</div>
    <div class="success-badge">✓ Measurement Complete</div>
  </div>

  <div class="section">
    <div class="section-title">Property Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Property Address</div>
        <div class="info-value">${measurement.property_address}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Customer Name</div>
        <div class="info-value">${measurement.customer_name || 'N/A'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Measurement Date</div>
        <div class="info-value">${format(new Date(measurement.created_date), 'MMMM d, yyyy')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Measurement Method</div>
        <div class="info-value">Satellite Imagery (±2-5% accuracy)</div>
      </div>
    </div>
  </div>

  <div class="area-box">
    <div class="label">Total Roof Area</div>
    <div class="number">${totalArea.toLocaleString()}</div>
    <div class="label">square feet</div>
  </div>

  ${sections.length > 1 ? `
  <div class="section">
    <div class="section-title">Section Breakdown</div>
    ${sections.map((section, index) => `
      <div class="info-item" style="margin-bottom: 10px;">
        <div class="info-label">${section.name}</div>
        <div class="info-value">${section.area_sqft.toLocaleString()} sq ft</div>
      </div>
    `).join('')}
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Aroof Cost Estimate</div>
    
    <div class="estimate-box">
      <div style="font-size: 14px; opacity: 0.9;">Estimated Price Range</div>
      <div class="amount">$${estimate.low.toLocaleString()} - $${estimate.high.toLocaleString()}</div>
      <div style="font-size: 14px; opacity: 0.9;">Based on ${estimate.materialType}</div>
    </div>

    <table class="breakdown-table">
      <tr>
        <td>Roof Area</td>
        <td>${totalArea.toLocaleString()} sq ft</td>
      </tr>
      <tr>
        <td>Material Cost</td>
        <td>$${estimate.materialCost.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Labor Cost</td>
        <td>$${estimate.laborCost.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Waste Factor (10%)</td>
        <td>$${estimate.wasteCost.toLocaleString()}</td>
      </tr>
      <tr class="total">
        <td>Subtotal</td>
        <td>$${estimate.subtotal.toLocaleString()}</td>
      </tr>
    </table>

    <div class="disclaimer">
      <strong>Important:</strong> Estimate based on standard conditions. Final price may vary based on roof pitch, complexity, and material selection. Valid for 30 days.
    </div>
  </div>

  <div class="section">
    <div class="section-title">What's Included</div>
    <ul class="included-list">
      <li>Premium roofing materials</li>
      <li>Professional installation</li>
      <li>Old roof removal and disposal</li>
      <li>Underlayment and ice shield</li>
      <li>Full cleanup</li>
      <li>Workmanship warranty</li>
    </ul>
  </div>

  <div class="cta-section">
    <h2>Ready to Get Started?</h2>
    <p>Aroof - Your Trusted Roofing Partner</p>
    <div class="trust-badges">
      <div class="trust-badge">
        <div class="icon">⭐⭐⭐⭐⭐</div>
        <div>Rated 4.9/5</div>
        <div>500+ Customers</div>
      </div>
      <div class="trust-badge">
        <div class="icon">🛡️</div>
        <div>Licensed &</div>
        <div>Insured</div>
      </div>
      <div class="trust-badge">
        <div class="icon">🏆</div>
        <div>10-Year</div>
        <div>Warranty</div>
      </div>
      <div class="trust-badge">
        <div class="icon">💰</div>
        <div>Financing</div>
        <div>Available</div>
      </div>
    </div>
    <p style="margin-top: 20px; font-size: 18px;">
      📞 Call us: (555) 555-5555<br>
      📧 Email: info@aroof.build<br>
      🌐 Visit: www.aroof.build
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 60px; padding-top: 30px; border-top: 3px solid #2563eb; text-align: center; color: #64748b;">
    <div style="margin-bottom: 20px;">
      <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">Aroof</div>
      <p style="margin: 5px 0; font-size: 14px;">6810 Windrock Rd, Dallas, TX 75252</p>
      <p style="margin: 5px 0; font-size: 14px;">Phone: (850) 238-9727 | Email: contact@aroof.build</p>
      <p style="margin: 5px 0; font-size: 14px;">Website: Aroof.build</p>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">Licensed & Insured in Texas | Texas Licensed Roofing Contractor</p>
    <p style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} Aroof. All rights reserved.</p>
  </div>
</body>
</html>`;
  
  return html;
};

// Generate roofer PDF content as HTML with watermark
export const generateRooferPDFContent = (measurement, sections, totalArea, reportId, user, calculations) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Aroof - Professional Roof Measurement Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
      padding: 40px;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 80px;
      font-weight: bold;
      color: rgba(0, 0, 0, 0.05);
      white-space: nowrap;
      pointer-events: none;
      z-index: 999;
    }
    .header {
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #334155;
    }
    .logo {
      font-size: 20px;
      color: #64748b;
      margin-bottom: 5px;
    }
    .report-id {
      font-size: 32px;
      font-weight: bold;
      color: #1e293b;
      margin: 10px 0;
    }
    .header-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 15px;
    }
    .info-item {
      padding: 10px 0;
    }
    .info-label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .area-box {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 40px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    .area-box .label {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 10px;
    }
    .area-box .number {
      font-size: 72px;
      font-weight: bold;
      margin: 15px 0;
    }
    .area-box .sublabel {
      font-size: 24px;
      opacity: 0.9;
    }
    .section {
      margin: 30px 0;
      padding: 20px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1e293b;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e2e8f0;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .breakdown-table thead tr {
      background: #f1f5f9;
      border-bottom: 2px solid #cbd5e1;
    }
    .breakdown-table th {
      padding: 12px;
      text-align: left;
      font-weight: bold;
      color: #475569;
      font-size: 12px;
      text-transform: uppercase;
    }
    .breakdown-table td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .breakdown-table tbody tr:hover {
      background: #f8fafc;
    }
    .breakdown-table tfoot tr {
      background: #f1f5f9;
      font-weight: bold;
    }
    .breakdown-table tfoot td {
      border-top: 2px solid #cbd5e1;
      padding-top: 15px;
      color: #f97316;
      font-size: 16px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 15px 0;
    }
    .detail-box {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
    }
    .material-section {
      background: #eff6ff;
      border: 1px solid #3b82f6;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .material-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 15px;
    }
    .calc-box {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 15px;
    }
    .calc-box .label {
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
    }
    .calc-box .value {
      font-size: 18px;
      font-weight: bold;
      color: #f97316;
    }
    .note-box {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 15px;
      border-radius: 8px;
      font-size: 12px;
      color: #78350f;
      margin: 15px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 11px;
    }
    .branding {
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      text-align: center;
    }
    .branding .logo-text {
      font-size: 24px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="watermark">Measured with Aroof.build</div>

  <div class="header">
    <div class="logo">Professional Measurement Report</div>
    <div class="report-id">Report ID: ${reportId}</div>
    <div class="header-info">
      <div class="info-item">
        <div class="info-label">Property Address</div>
        <div class="info-value">${measurement.property_address}</div>
      </div>
      ${user?.business_name ? `
      <div class="info-item">
        <div class="info-label">Measured By</div>
        <div class="info-value">${user.business_name}</div>
      </div>
      ` : ''}
      <div class="info-item">
        <div class="info-label">Measurement Date</div>
        <div class="info-value">${format(new Date(measurement.created_date), 'MMMM d, yyyy')}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Report Generated</div>
        <div class="info-value">${format(new Date(), 'MMMM d, yyyy h:mm a')}</div>
      </div>
    </div>
  </div>

  <div class="area-box">
    <div class="label">Total Roof Area</div>
    <div class="number">${totalArea.toLocaleString()}</div>
    <div class="sublabel">square feet</div>
  </div>

  ${sections.length > 0 ? `
  <div class="section">
    <div class="section-title">Section Breakdown</div>
    <table class="breakdown-table">
      <thead>
        <tr>
          <th>Section</th>
          <th style="text-align: right;">Area (sq ft)</th>
          ${sections[0]?.perimeter ? '<th style="text-align: right;">Perimeter (ft)</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${sections.map(section => `
        <tr>
          <td style="font-weight: 600;">${section.name}</td>
          <td style="text-align: right; color: #f97316; font-weight: bold;">${section.area_sqft.toLocaleString()}</td>
          ${section.perimeter ? `<td style="text-align: right;">${Math.round(section.perimeter).toLocaleString()}</td>` : ''}
        </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr>
          <td>TOTAL</td>
          <td style="text-align: right;">${totalArea.toLocaleString()}</td>
          ${sections[0]?.perimeter ? `<td style="text-align: right;">${Math.round(calculations.totalPerimeter).toLocaleString()}</td>` : ''}
        </tr>
      </tfoot>
    </table>
  </div>
  ` : ''}

  <div class="section">
    <div class="section-title">Measurement Details</div>
    <div class="details-grid">
      <div class="detail-box">
        <div class="info-label">Method</div>
        <div class="info-value">Satellite Imagery</div>
      </div>
      <div class="detail-box">
        <div class="info-label">Accuracy</div>
        <div class="info-value">±2-5%</div>
      </div>
      <div class="detail-box">
        <div class="info-label">Sections Measured</div>
        <div class="info-value">${sections.length || 1}</div>
      </div>
    </div>
  </div>

  <div class="material-section">
    <div class="section-title" style="border: none; color: #1e40af;">Material Estimation Helper</div>
    
    <div class="note-box">
      <strong>Note:</strong> These are estimates for planning purposes. Always verify quantities before ordering materials.
    </div>

    <div class="section-title" style="font-size: 16px; margin-top: 20px;">Base Calculations</div>
    <div class="material-grid">
      <div class="calc-box">
        <div class="label">Base roof area</div>
        <div class="value">${totalArea.toLocaleString()} sq ft</div>
      </div>
      <div class="calc-box">
        <div class="label">Add 10% waste</div>
        <div class="value">${calculations.wasteArea.toLocaleString()} sq ft</div>
      </div>
    </div>

    <div class="section-title" style="font-size: 16px; margin-top: 20px;">Shingles Needed</div>
    <div class="material-grid">
      <div class="calc-box">
        <div class="label">3-tab (33.3 sq ft/bundle)</div>
        <div class="value">${calculations.shingles3Tab} bundles</div>
      </div>
      <div class="calc-box">
        <div class="label">Architectural (32 sq ft/bundle)</div>
        <div class="value">${calculations.shinglesArch} bundles</div>
      </div>
    </div>

    <div class="section-title" style="font-size: 16px; margin-top: 20px;">Other Materials</div>
    <div class="material-grid">
      <div class="calc-box">
        <div class="label">Underlayment (400 sq ft/roll)</div>
        <div class="value">${calculations.underlayment} rolls</div>
      </div>
      <div class="calc-box">
        <div class="label">Ridge cap (estimate)</div>
        <div class="value">${calculations.ridgeCap} linear ft</div>
      </div>
      <div class="calc-box">
        <div class="label">Starter strips</div>
        <div class="value">${calculations.starterStrips} linear ft</div>
      </div>
    </div>
  </div>

  ${measurement.roofer_notes ? `
  <div class="section">
    <div class="section-title">Project Notes</div>
    <div class="detail-box">
      <p style="white-space: pre-wrap;">${measurement.roofer_notes}</p>
    </div>
  </div>
  ` : ''}

  <div class="branding">
    <div class="logo-text">Aroof</div>
    <p style="color: #64748b; font-size: 14px;">Professional Measurement Platform | Aroof.build</p>
    <p style="color: #64748b; font-size: 12px; margin-top: 10px;">
      This report is designed for roofing professionals and contractors.<br>
      No pricing included - your professional tool for accurate measurements.
    </p>
  </div>

  <!-- Footer -->
  <div style="margin-top: 60px; padding-top: 30px; border-top: 3px solid #2563eb; text-align: center; color: #64748b;">
    <div style="margin-bottom: 20px;">
      <div style="font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 10px;">Aroof</div>
      <p style="margin: 5px 0; font-size: 14px;">6810 Windrock Rd, Dallas, TX 75252</p>
      <p style="margin: 5px 0; font-size: 14px;">Phone: (850) 238-9727 | Email: contact@aroof.build</p>
      <p style="margin: 5px 0; font-size: 14px;">Website: Aroof.build</p>
    </div>
    <p style="font-size: 12px; color: #94a3b8;">Licensed & Insured in Texas | Texas Licensed Roofing Contractor</p>
    <p style="font-size: 12px; color: #94a3b8;">© ${new Date().getFullYear()} Aroof. All rights reserved.</p>
    <p style="font-size: 10px; color: #cbd5e1; margin-top: 20px;">CONFIDENTIAL WATERMARK - FOR AUTHORIZED USE ONLY</p>
  </div>
</body>
</html>`;
  
  return html;
};

// Download HTML as file
export const downloadPDF = (htmlContent, filename) => {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
