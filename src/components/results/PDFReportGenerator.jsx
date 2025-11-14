import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";

export default function PDFReportGenerator({ measurement, onGenerate, satelliteImageData, diagramImageData, userBranding }) {
  const [generating, setGenerating] = React.useState(false);

  const handleGeneratePDF = async () => {
    setGenerating(true);
    
    try {
      // Extract data
      const sections = measurement?.measurement_data?.sections || [];
      const photos = measurement?.photos || [];
      const flatArea = measurement?.measurement_data?.total_flat_sqft || measurement.total_sqft || 0;
      const adjustedArea = measurement?.measurement_data?.total_adjusted_sqft || measurement.total_sqft || flatArea;
      
      console.log('📄 Generating PDF with captured images and custom branding...');
      
      // Open print-friendly view in new window
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generatePrintableHTML({
        measurement,
        sections,
        photos,
        flatArea,
        adjustedArea,
        satelliteImageData,
        diagramImageData,
        branding: userBranding
      }));
      printWindow.document.close();
      
      // Wait for content to load
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Trigger print
      printWindow.print();
      setGenerating(false);
      if (onGenerate) onGenerate();
      
    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <Button
      size="lg"
      className="h-16 px-10 text-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-xl"
      onClick={handleGeneratePDF}
      disabled={generating}
    >
      {generating ? (
        <>
          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
          Preparing Report...
        </>
      ) : (
        <>
          <Printer className="w-6 h-6 mr-3" />
          Generate PDF Report
        </>
      )}
    </Button>
  );
}

function generatePrintableHTML({ measurement, sections, photos, flatArea, adjustedArea, satelliteImageData, diagramImageData, branding }) {
  const totalSquares = (adjustedArea / 100).toFixed(2);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate estimates
  const materialCost = Math.round(adjustedArea * 4);
  const laborCost = Math.round(adjustedArea * 3);
  const wasteCost = Math.round((materialCost + laborCost) * 0.10);
  const lowEstimate = Math.round((materialCost + laborCost + wasteCost) * 0.90);
  const highEstimate = Math.round((materialCost + laborCost + wasteCost) * 1.10);
  
  // Use custom branding or default Aroof branding
  const companyName = branding?.company_name || 'Aroof';
  const companyLogo = branding?.logo_url || null;
  const companyAddress = branding?.address || '6810 Windrock Rd, Dallas, TX 75252';
  const companyPhone = branding?.phone || '(850) 238-9727';
  const companyEmail = branding?.email || 'contact@aroof.build';
  const brandColor = branding?.primary_color || '#1e40af';
  const footerText = branding?.footer_text || "DFW's #1 Roofing Company - Licensed & Insured";
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${companyName} - Roof Measurement Report - ${measurement.property_address}</title>
  <style>
    @media print {
      @page {
        size: letter;
        margin: 0;
      }
      body {
        margin: 0;
        padding: 0;
      }
      .page-break {
        page-break-after: always;
        break-after: page;
      }
      .no-print {
        display: none !important;
      }
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: white;
    }
    
    .page {
      width: 8.5in;
      min-height: 11in;
      padding: 0.75in;
      margin: 0 auto;
      background: white;
      position: relative;
    }
    
    .header {
      background: linear-gradient(135deg, ${brandColor} 0%, ${adjustBrightness(brandColor, -15)} 100%);
      color: white;
      padding: 30px;
      margin: -0.75in -0.75in 30px -0.75in;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .header-left {
      flex: 1;
    }
    
    .header-logo {
      max-width: 150px;
      max-height: 60px;
      margin-bottom: 10px;
    }
    
    .header h1 {
      font-size: ${companyLogo ? '28px' : '36px'};
      font-weight: 700;
      margin-bottom: 5px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .cover-title {
      font-size: 28px;
      font-weight: 700;
      color: ${brandColor};
      margin: 20px 0 15px 0;
      text-align: center;
    }
    
    .property-address {
      font-size: 18px;
      color: #334155;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .measurement-date {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 25px;
      text-align: center;
    }
    
    .satellite-container {
      border: 3px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      margin: 25px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: #f1f5f9;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .satellite-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .image-placeholder {
      color: #94a3b8;
      font-size: 14px;
      text-align: center;
      padding: 40px;
    }
    
    .image-caption {
      text-align: center;
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
      font-style: italic;
    }
    
    .summary-box {
      background: linear-gradient(135deg, ${hexToRgba(brandColor, 0.1)} 0%, ${hexToRgba(brandColor, 0.2)} 100%);
      border: 3px solid ${brandColor};
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 25px 0;
    }
    
    .big-number {
      font-size: 56px;
      font-weight: 700;
      color: ${brandColor};
      line-height: 1;
    }
    
    .big-label {
      font-size: 18px;
      color: #475569;
      margin-top: 8px;
    }
    
    .squares-label {
      font-size: 22px;
      font-weight: 600;
      color: ${adjustBrightness(brandColor, 20)};
      margin-top: 12px;
    }
    
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 20px 0;
    }
    
    .detail-item {
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid ${brandColor};
    }
    
    .detail-label {
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .detail-value {
      font-size: 16px;
      color: #1e293b;
      font-weight: 700;
      margin-top: 4px;
    }
    
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: ${brandColor};
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid ${brandColor};
    }
    
    .diagram-container {
      border: 3px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      background: #f1f5f9;
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .diagram-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .legend-box {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px solid #cbd5e1;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .legend-title {
      font-size: 14px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
      font-size: 11px;
      color: #475569;
    }
    
    .legend-color {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      border: 2px solid #64748b;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 12px;
    }
    
    thead {
      background: ${brandColor};
      color: white;
    }
    
    th {
      padding: 10px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
    }
    
    td {
      padding: 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .highlight-row {
      background: #10b981 !important;
      color: white !important;
      font-weight: 700;
    }
    
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 15px 0;
    }
    
    .photo-item {
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .photo-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }
    
    .photo-caption {
      padding: 8px;
      background: #f8fafc;
      font-size: 10px;
      color: #475569;
    }
    
    .note-box {
      background: #fef3c7;
      border: 2px solid #fbbf24;
      border-radius: 8px;
      padding: 12px;
      margin: 15px 0;
      font-size: 11px;
      color: #92400e;
    }
    
    .cta-box {
      background: linear-gradient(135deg, ${brandColor} 0%, ${adjustBrightness(brandColor, -15)} 100%);
      color: white;
      padding: 25px;
      border-radius: 12px;
      text-align: center;
      margin: 30px 0;
    }
    
    .cta-box h2 {
      font-size: 24px;
      margin-bottom: 8px;
    }
    
    .contact-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 15px 0;
    }
    
    .contact-item {
      font-size: 12px;
      line-height: 1.8;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 15px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      font-size: 10px;
      color: #64748b;
    }
    
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 30px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    
    .print-button:hover {
      background: #059669;
    }
    
    ${branding ? '.branding-badge { background: ' + hexToRgba(brandColor, 0.1) + '; border: 2px solid ' + brandColor + '; padding: 8px 16px; border-radius: 6px; display: inline-block; margin: 10px 0; font-weight: 600; color: ' + brandColor + '; }' : ''}
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Save as PDF</button>

  <!-- PAGE 1: COVER PAGE WITH SATELLITE IMAGE -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : ''}
        <h1>${companyName}</h1>
        <p>${footerText}</p>
      </div>
      ${branding ? '<div class="branding-badge">Custom Branded Report</div>' : ''}
    </div>
    
    <h2 class="cover-title">PROFESSIONAL ROOF MEASUREMENT REPORT</h2>
    <p class="property-address">${measurement.property_address}</p>
    <p class="measurement-date">Measured on ${today}</p>
    
    <!-- SATELLITE IMAGE (CAPTURED FROM PAGE) -->
    <div class="satellite-container">
      ${satelliteImageData ? `
        <img src="${satelliteImageData}" alt="Satellite view of property" />
      ` : `
        <div class="image-placeholder">Satellite imagery captured from measurement tool</div>
      `}
    </div>
    <p class="image-caption">Satellite View - ${measurement.property_address}</p>
    
    <div class="summary-box">
      <div class="big-number">${Math.round(adjustedArea).toLocaleString()}</div>
      <div class="big-label">Square Feet</div>
      <div class="squares-label">${totalSquares} Squares</div>
    </div>
    
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label">Sections Measured</div>
        <div class="detail-value">${sections.length}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Flat Area</div>
        <div class="detail-value">${Math.round(flatArea).toLocaleString()} sq ft</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Measurement Method</div>
        <div class="detail-value">Satellite Imagery</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Accuracy</div>
        <div class="detail-value">±2-5%</div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>${companyName}</strong></p>
      <p>📞 ${companyPhone} | ✉️ ${companyEmail}</p>
      <p>${companyAddress}</p>
      <p style="margin-top: 10px;">Page 1</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 2: MEASUREMENT DIAGRAM -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Measurement Diagram & Section Analysis</p>
      </div>
    </div>
    
    <h2 class="section-title">📐 Roof Sections Measured</h2>
    
    <!-- MEASUREMENT DIAGRAM (CAPTURED FROM PAGE) -->
    <div class="diagram-container">
      ${diagramImageData ? `
        <img src="${diagramImageData}" alt="Measurement diagram with sections" />
      ` : `
        <div class="image-placeholder">Measurement diagram showing color-coded sections</div>
      `}
    </div>
    <p class="image-caption">Color-coded sections showing measured roof areas</p>
    
    <!-- SECTION LEGEND -->
    <div class="legend-box">
      <div class="legend-title">Section Details:</div>
      ${sections.map((section, idx) => {
        const colors = ['#4A90E2', '#10b981', '#f97316', '#a855f7', '#ef4444'];
        return `
          <div class="legend-item">
            <div class="legend-color" style="background: ${colors[idx % 5]};"></div>
            <div>
              <strong>Section ${idx + 1}:</strong> 
              ${section.pitch || 'flat'} pitch • 
              ${Math.round(section.flat_area_sqft || 0).toLocaleString()} sq ft (flat) • 
              ${Math.round(section.adjusted_area_sqft || 0).toLocaleString()} sq ft (adjusted)
            </div>
          </div>
        `;
      }).join('')}
    </div>
    
    <div class="note-box">
      <strong>📏 Measurement Methodology:</strong> Sections traced using high-resolution satellite imagery. 
      Areas calculated using GPS coordinates with pitch adjustments for accurate 3D surface area.
    </div>
    
    <div class="footer">
      <p>${companyName} | ${companyPhone} | ${companyEmail} | Page 2</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 3: DETAILED MEASUREMENTS -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Detailed Roof Measurements</p>
      </div>
    </div>
    
    <h2 class="section-title">📏 Line Measurements</h2>
    <table>
      <thead>
        <tr>
          <th>Component</th>
          <th>Length (ft)</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Eaves</strong></td>
          <td>${(measurement.eaves_ft || 0).toFixed(1)} ft</td>
          <td>Bottom edges (gutter installation)</td>
        </tr>
        <tr>
          <td><strong>Rakes</strong></td>
          <td>${(measurement.rakes_ft || 0).toFixed(1)} ft</td>
          <td>Sloped perimeter edges</td>
        </tr>
        <tr>
          <td><strong>Ridges</strong></td>
          <td>${(measurement.ridges_ft || 0).toFixed(1)} ft</td>
          <td>Top peaks (need ridge cap)</td>
        </tr>
        <tr>
          <td><strong>Hips</strong></td>
          <td>${(measurement.hips_ft || 0).toFixed(1)} ft</td>
          <td>External corners (need hip cap)</td>
        </tr>
        <tr>
          <td><strong>Valleys</strong></td>
          <td>${(measurement.valleys_ft || 0).toFixed(1)} ft</td>
          <td>Internal corners (water channels)</td>
        </tr>
        <tr>
          <td><strong>Steps</strong></td>
          <td>${(measurement.steps_ft || 0).toFixed(1)} ft</td>
          <td>Wall intersections</td>
        </tr>
      </tbody>
    </table>
    
    <h2 class="section-title">📐 Section Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Section</th>
          <th>Pitch</th>
          <th>Flat Area</th>
          <th>Adjusted Area</th>
        </tr>
      </thead>
      <tbody>
        ${sections.map((section, idx) => `
          <tr>
            <td><strong>${section.name || `Section ${idx + 1}`}</strong></td>
            <td>${section.pitch || 'flat'}</td>
            <td>${(section.flat_area_sqft || 0).toLocaleString()} sq ft</td>
            <td>${(section.adjusted_area_sqft || 0).toLocaleString()} sq ft</td>
          </tr>
        `).join('')}
        <tr class="highlight-row">
          <td colspan="2"><strong>TOTAL</strong></td>
          <td><strong>${Math.round(flatArea).toLocaleString()} sq ft</strong></td>
          <td><strong>${Math.round(adjustedArea).toLocaleString()} sq ft</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      <p>${companyName} | ${companyPhone} | ${companyEmail} | Page 3</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 4: WASTE & PRICING -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Material Estimates & Pricing</p>
      </div>
    </div>
    
    <h2 class="section-title">📦 Material Estimates with Waste Factor</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Actual</th>
          <th>+5%</th>
          <th>+10%</th>
          <th style="background: #10b981;">+12% ⭐</th>
          <th>+15%</th>
          <th>+20%</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Squares</strong></td>
          <td>${totalSquares}</td>
          <td>${(totalSquares * 1.05).toFixed(2)}</td>
          <td>${(totalSquares * 1.10).toFixed(2)}</td>
          <td style="background: #d1fae5; font-weight: 700;">${(totalSquares * 1.12).toFixed(2)}</td>
          <td>${(totalSquares * 1.15).toFixed(2)}</td>
          <td>${(totalSquares * 1.20).toFixed(2)}</td>
        </tr>
        <tr>
          <td><strong>Area (sq ft)</strong></td>
          <td>${Math.round(adjustedArea).toLocaleString()}</td>
          <td>${Math.round(adjustedArea * 1.05).toLocaleString()}</td>
          <td>${Math.round(adjustedArea * 1.10).toLocaleString()}</td>
          <td style="background: #d1fae5; font-weight: 700;">${Math.round(adjustedArea * 1.12).toLocaleString()}</td>
          <td>${Math.round(adjustedArea * 1.15).toLocaleString()}</td>
          <td>${Math.round(adjustedArea * 1.20).toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="note-box">
      <strong>✓ Recommended:</strong> +12% waste factor for standard installations with valleys and hips
    </div>
    
    <h2 class="section-title">💰 Estimated Project Cost</h2>
    <table>
      <tbody>
        <tr>
          <td><strong>Materials</strong></td>
          <td>${Math.round(adjustedArea).toLocaleString()} sq ft × $4.00/sq ft</td>
          <td style="text-align: right; font-weight: 700;">$${materialCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td><strong>Labor</strong></td>
          <td>${Math.round(adjustedArea).toLocaleString()} sq ft × $3.00/sq ft</td>
          <td style="text-align: right; font-weight: 700;">$${laborCost.toLocaleString()}</td>
        </tr>
        <tr>
          <td><strong>Waste Factor</strong></td>
          <td>10% of materials + labor</td>
          <td style="text-align: right; font-weight: 700;">$${wasteCost.toLocaleString()}</td>
        </tr>
        <tr class="highlight-row">
          <td colspan="2"><strong>ESTIMATED COST RANGE</strong></td>
          <td style="text-align: right; font-size: 14px;"><strong>$${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="note-box">
      <strong>Note:</strong> This is a preliminary estimate based on standard conditions. Final pricing may vary based on roof complexity, material selection, and current market rates. Contact us for a detailed quote.
    </div>
    
    <div class="footer">
      <p>${companyName} | ${companyPhone} | ${companyEmail} | Page 4</p>
    </div>
  </div>
  
  ${photos.length > 0 ? `
    <div class="page-break"></div>
    
    <!-- PAGE 5: SITE PHOTOS -->
    <div class="page">
      <div class="header">
        <div class="header-left">
          ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
          <p>Site Photos (${photos.length})</p>
        </div>
      </div>
      
      <h2 class="section-title">📸 Site Photos</h2>
      
      <div class="photos-grid">
        ${photos.slice(0, 6).map((photo, idx) => `
          <div class="photo-item">
            <img src="${photo.url}" alt="Site photo ${idx + 1}" />
            ${photo.caption ? `<div class="photo-caption"><strong>Photo ${idx + 1}:</strong> ${photo.caption}</div>` : `<div class="photo-caption">Photo ${idx + 1}</div>`}
          </div>
        `).join('')}
      </div>
      
      ${photos.length > 6 ? `<p class="image-caption">Showing first 6 of ${photos.length} photos</p>` : ''}
      
      <div class="footer">
        <p>${companyName} | ${companyPhone} | ${companyEmail} | Page 5</p>
      </div>
    </div>
  ` : ''}
  
  <div class="page-break"></div>
  
  <!-- FINAL PAGE: CONTACT & CTA -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Ready to Get Started?</p>
      </div>
    </div>
    
    <div class="cta-box">
      <h2>Schedule Your FREE Roof Inspection</h2>
      <p style="font-size: 14px; margin-top: 8px;">Our licensed roofing experts are here to help</p>
    </div>
    
    <h2 class="section-title">📞 Contact ${companyName}</h2>
    
    <div class="contact-grid">
      <div class="contact-item">
        <strong>📞 Phone:</strong><br>
        ${companyPhone}
      </div>
      <div class="contact-item">
        <strong>✉️ Email:</strong><br>
        ${companyEmail}
      </div>
      <div class="contact-item">
        <strong>📍 Address:</strong><br>
        ${companyAddress}
      </div>
      ${branding?.website ? `
      <div class="contact-item">
        <strong>🌐 Website:</strong><br>
        ${branding.website}
      </div>
      ` : ''}
    </div>
    
    <h2 class="section-title">⭐ Why Choose ${companyName}?</h2>
    
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label">Licensed & Insured</div>
        <div class="detail-value">Texas Certified</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Experience</div>
        <div class="detail-value">Trusted in DFW</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Quality</div>
        <div class="detail-value">Premium Materials</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Warranty</div>
        <div class="detail-value">Workmanship Guarantee</div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>This report was generated using ${companyName}'s measurement system</strong></p>
      <p>For questions or to schedule a free inspection, call ${companyPhone}</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} ${companyName}. ${footerText}</p>
      ${branding ? '<p style="margin-top: 10px; font-size: 9px; color: #94a3b8;">Custom branded report powered by Aroof.build</p>' : ''}
    </div>
  </div>
  
  <script>
    window.onload = function() {
      setTimeout(() => {
        console.log('PDF report ready - Click "Save as PDF" button or use Ctrl/Cmd+P');
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

// Helper functions for color manipulation
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}