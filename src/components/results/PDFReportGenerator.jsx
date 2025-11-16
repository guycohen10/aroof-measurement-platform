import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

export default function PDFReportGenerator({ measurement, satelliteImageData, diagramImageData, userBranding, onGenerate }) {
  const [generating, setGenerating] = React.useState(false);

  const generatePrintableHTML = () => {
    const sections = measurement?.measurement_data?.sections || [];
    const photos = measurement?.photos || [];
    const flatArea = measurement?.measurement_data?.total_flat_sqft || measurement.total_sqft || 0;
    const adjustedArea = measurement?.measurement_data?.total_adjusted_sqft || measurement.total_sqft || flatArea;
    
    const totalSquares = (adjustedArea / 100).toFixed(2);
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    const materialCost = Math.round(adjustedArea * 4);
    const laborCost = Math.round(adjustedArea * 3);
    const wasteCost = Math.round((materialCost + laborCost) * 0.10);
    const lowEstimate = Math.round((materialCost + laborCost + wasteCost) * 0.90);
    const highEstimate = Math.round((materialCost + laborCost + wasteCost) * 1.10);
    
    const branding = userBranding;
    const companyName = branding?.company_name || 'Aroof';
    const companyLogo = branding?.logo_url || null;
    const companyAddress = branding?.address || '6810 Windrock Rd, Dallas, TX 75252';
    const companyPhone = branding?.phone || '(850) 238-9727';
    const companyEmail = branding?.email || 'contact@aroof.build';
    const primaryColor = branding?.primary_color || '#1e40af';
    const footerText = branding?.footer_text || "DFW's #1 Roofing Company - Licensed & Insured";

    const satelliteImageSrc = measurement.satellite_image || satelliteImageData;
    const diagramImageSrc = measurement.measurement_diagram || diagramImageData;

    const logoHtml = companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" style="max-width: 150px; max-height: 60px; margin-bottom: 10px;" />` : '';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Roof Measurement Report - ${measurement.property_address}</title>
  <style>
    @media print {
      @page { size: letter; margin: 0; }
      body { margin: 0; padding: 0; }
      .page-break { page-break-after: always; break-after: page; }
      .no-print { display: none !important; }
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
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
      background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -15)} 100%);
      color: white;
      padding: 30px;
      margin: -0.75in -0.75in 30px -0.75in;
      border-radius: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .header-left { flex: 1; }
    .header-logo { max-width: 150px; max-height: 60px; margin-bottom: 10px; }
    .header h1 { font-size: ${companyLogo ? '28px' : '36px'}; font-weight: 700; margin-bottom: 5px; }
    .header p { font-size: 14px; opacity: 0.9; }
    
    .cover-title {
      font-size: 28px;
      font-weight: 700;
      color: ${primaryColor};
      margin: 20px 0 15px 0;
      text-align: center;
    }
    
    .property-address {
      font-size: 18px;
      color: #334155;
      margin-bottom: 8px;
      text-align: center;
    }
    
    .summary-box {
      background: linear-gradient(135deg, ${hexToRgba(primaryColor, 0.1)} 0%, ${hexToRgba(primaryColor, 0.2)} 100%);
      border: 3px solid ${primaryColor};
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 25px 0;
    }
    
    .big-number {
      font-size: 56px;
      font-weight: 700;
      color: ${primaryColor};
      line-height: 1;
    }
    
    .big-label { font-size: 18px; color: #475569; margin-top: 8px; }
    
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
      border-left: 4px solid ${primaryColor};
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
      color: ${primaryColor};
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid ${primaryColor};
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
      font-size: 12px;
    }
    
    thead { background: ${primaryColor}; color: white; }
    th { padding: 10px; text-align: left; font-weight: 600; font-size: 11px; }
    td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    tbody tr:nth-child(even) { background: #f8fafc; }
    
    .highlight-row {
      background: #10b981 !important;
      color: white !important;
      font-weight: 700;
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
    
    .print-button:hover { background: #059669; }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Save as PDF</button>

  <!-- PAGE 1: COVER -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : ''}
        <h1>${companyName}</h1>
        <p>${footerText}</p>
      </div>
    </div>
    
    <h2 class="cover-title">PROFESSIONAL ROOF MEASUREMENT REPORT</h2>
    <p class="property-address">${measurement.property_address}</p>
    <p style="text-align: center; color: #64748b; font-size: 13px; margin-bottom: 25px;">Measured on ${today}</p>
    
    ${satelliteImageSrc ? `
      <div style="border: 3px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 20px;">
        <img 
          src="${satelliteImageSrc}" 
          alt="Satellite view"
          style="width: 100%; height: auto; display: block;"
        />
      </div>
      <p style="text-align: center; color: #64748b; font-size: 12px;">
        High-resolution satellite imagery
      </p>
    ` : ''}
    
    <div class="summary-box">
      <div class="big-number">${Math.round(adjustedArea).toLocaleString()}</div>
      <div class="big-label">Square Feet</div>
      <div style="font-size: 22px; font-weight: 600; color: ${adjustBrightness(primaryColor, 20)}; margin-top: 12px;">
        ${totalSquares} Squares
      </div>
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
      <div>
        ${logoHtml}
        <h1 style="margin: 0; font-size: 28px;">${companyName}</h1>
        <p style="margin: 5px 0 0 0;">Measurement Diagram</p>
      </div>
    </div>

    <h2 class="section-title">📐 Measurement Diagram</h2>
    <p style="color: #64748b; margin-bottom: 20px;">
      Color-coded sections showing measured roof areas
    </p>
    
    ${diagramImageSrc ? `
      <div style="border: 3px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
        <img 
          src="${diagramImageSrc}" 
          alt="Measurement diagram"
          style="width: 100%; height: auto; display: block;"
        />
      </div>
    ` : ''}

    ${sections.length > 0 ? `
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; border: 2px solid #e5e7eb;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px; color: #1e293b;">Section Legend:</h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${sections.map((section, idx) => `
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: ${section.color || '#3b82f6'};
                flex-shrink: 0;
              "></div>
              <span style="font-size: 13px; color: #475569; font-weight: 600;">
                ${section.name || `Section ${idx + 1}`}: 
                ${Math.round(section.adjusted_area_sqft || section.flat_area_sqft).toLocaleString()} sq ft
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-top: 30px;">
      <h3 style="margin: 0 0 12px 0; font-size: 16px; opacity: 0.9;">Total Roof Area</h3>
      <div style="font-size: 42px; font-weight: bold; margin: 0;">
        ${Math.round(adjustedArea).toLocaleString()}
      </div>
      <div style="font-size: 18px; margin-top: 4px; opacity: 0.9;">square feet</div>
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
        <p>Detailed Measurements</p>
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
          <td>Top peaks (ridge cap)</td>
        </tr>
        <tr>
          <td><strong>Hips</strong></td>
          <td>${(measurement.hips_ft || 0).toFixed(1)} ft</td>
          <td>External corners</td>
        </tr>
        <tr>
          <td><strong>Valleys</strong></td>
          <td>${(measurement.valleys_ft || 0).toFixed(1)} ft</td>
          <td>Internal corners</td>
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
  
  <!-- PAGE 4: PRICING -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Material & Pricing Estimates</p>
      </div>
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
          <td>10%</td>
          <td style="text-align: right; font-weight: 700;">$${wasteCost.toLocaleString()}</td>
        </tr>
        <tr class="highlight-row">
          <td colspan="2"><strong>ESTIMATED RANGE</strong></td>
          <td style="text-align: right; font-size: 14px;"><strong>$${lowEstimate.toLocaleString()} - $${highEstimate.toLocaleString()}</strong></td>
        </tr>
      </tbody>
    </table>
    
    <div class="note-box">
      <strong>Note:</strong> Preliminary estimate based on standard conditions. Contact us for a detailed quote.
    </div>

    ${photos.length > 0 ? `
      <h2 class="section-title">📸 Site Photos</h2>
      <div class="photos-grid">
        ${photos.slice(0, 4).map((photo, idx) => `
          <div class="photo-item">
            <img src="${photo.url}" alt="Photo ${idx + 1}" />
            ${photo.caption ? `<div style="padding: 8px; background: #f8fafc; font-size: 10px;">${photo.caption}</div>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}
    
    <div class="footer">
      <p>${companyName} | ${companyPhone} | ${companyEmail} | Page 4</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- FINAL PAGE: CONTACT -->
  <div class="page">
    <div class="header">
      <div class="header-left">
        ${companyLogo ? `<img src="${companyLogo}" alt="${companyName} Logo" class="header-logo" />` : '<h1>' + companyName + '</h1>'}
        <p>Ready to Get Started?</p>
      </div>
    </div>
    
    <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${adjustBrightness(primaryColor, -15)} 100%); color: white; padding: 25px; border-radius: 12px; text-align: center; margin: 30px 0;">
      <h2 style="font-size: 24px; margin-bottom: 8px;">Schedule Your FREE Roof Inspection</h2>
      <p style="font-size: 14px; margin-top: 8px;">Our licensed roofing experts are here to help</p>
    </div>
    
    <h2 class="section-title">📞 Contact ${companyName}</h2>
    
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0;">
      <div style="font-size: 12px; line-height: 1.8;">
        <strong>📞 Phone:</strong><br>${companyPhone}
      </div>
      <div style="font-size: 12px; line-height: 1.8;">
        <strong>✉️ Email:</strong><br>${companyEmail}
      </div>
      <div style="font-size: 12px; line-height: 1.8;">
        <strong>📍 Address:</strong><br>${companyAddress}
      </div>
    </div>
    
    <div class="footer">
      <p><strong>© ${new Date().getFullYear()} ${companyName}. ${footerText}</strong></p>
      <p>For questions or to schedule, call ${companyPhone}</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  const handleGeneratePDF = async () => {
    setGenerating(true);
    
    try {
      console.log('📄 Generating PDF...');
      
      const printWindow = window.open('', '_blank');
      printWindow.document.write(generatePrintableHTML());
      printWindow.document.close();
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      onClick={handleGeneratePDF}
      disabled={generating}
      className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg font-bold shadow-xl"
    >
      {generating ? (
        <>
          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
          Generating PDF Report...
        </>
      ) : (
        <>
          <FileText className="w-6 h-6 mr-3" />
          Generate PDF Report
        </>
      )}
    </Button>
  );
}

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