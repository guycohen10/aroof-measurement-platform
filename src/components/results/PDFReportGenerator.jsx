import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Loader2 } from "lucide-react";

export default function PDFReportGenerator({ measurement, onGenerate }) {
  const [generating, setGenerating] = React.useState(false);

  const handleGeneratePDF = () => {
    setGenerating(true);
    
    // Extract data
    const sections = measurement?.measurement_data?.sections || [];
    const photos = measurement?.photos || [];
    const flatArea = measurement?.measurement_data?.total_flat_sqft || measurement.total_sqft || 0;
    const adjustedArea = measurement?.measurement_data?.total_adjusted_sqft || measurement.total_sqft || flatArea;
    
    // Generate satellite images URLs
    const centerLat = sections.length > 0 && sections[0].coordinates?.length > 0 
      ? sections[0].coordinates[0].lat 
      : 32.7767;
    const centerLng = sections.length > 0 && sections[0].coordinates?.length > 0
      ? sections[0].coordinates[0].lng
      : -96.7970;
    
    const satelliteImageUrl = generateSatelliteImageUrl(centerLat, centerLng, 20);
    const diagramImageUrl = generateDiagramImageUrl(sections, centerLat, centerLng);
    
    // Open print-friendly view in new window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintableHTML({
      measurement,
      sections,
      photos,
      flatArea,
      adjustedArea,
      satelliteImageUrl,
      diagramImageUrl
    }));
    printWindow.document.close();
    
    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.print();
      setGenerating(false);
      if (onGenerate) onGenerate();
    }, 1500); // Increased delay for images to load
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

// Generate Google Static Maps satellite image URL
function generateSatelliteImageUrl(lat, lng, zoom) {
  const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
  const width = 640;
  const height = 400;
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&maptype=satellite&key=${apiKey}`;
}

// Generate measurement diagram with drawn sections
function generateDiagramImageUrl(sections, centerLat, centerLng) {
  const apiKey = 'AIzaSyArjjIztBY4AReXdXGm1Mf3afM3ZPE_Tbc';
  const width = 640;
  const height = 500;
  
  let pathsParam = '';
  
  // Add each section as a polygon overlay
  sections.forEach((section, index) => {
    if (section.coordinates && section.coordinates.length > 0) {
      const color = ['0x4A90E2', '0x10b981', '0xf97316', '0xa855f7', '0xef4444'][index % 5];
      const path = section.coordinates
        .map(coord => `${coord.lat},${coord.lng}`)
        .join('|');
      
      // Close the polygon by adding first point at end
      const closedPath = path + `|${section.coordinates[0].lat},${section.coordinates[0].lng}`;
      
      pathsParam += `&path=color:${color}|weight:3|fillcolor:${color}44|${closedPath}`;
    }
  });
  
  return `https://maps.googleapis.com/maps/api/staticmap?center=${centerLat},${centerLng}&zoom=20&size=${width}x${height}&maptype=satellite${pathsParam}&key=${apiKey}`;
}

function generatePrintableHTML({ measurement, sections, photos, flatArea, adjustedArea, satelliteImageUrl, diagramImageUrl }) {
  const totalSquares = (adjustedArea / 100).toFixed(2);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Calculate estimates
  const materialCost = Math.round(adjustedArea * 4);
  const laborCost = Math.round(adjustedArea * 3);
  const wasteCost = Math.round((materialCost + laborCost) * 0.10);
  const lowEstimate = Math.round((materialCost + laborCost + wasteCost) * 0.90);
  const highEstimate = Math.round((materialCost + laborCost + wasteCost) * 1.10);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Aroof - Roof Measurement Report - ${measurement.property_address}</title>
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
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      margin: -0.75in -0.75in 30px -0.75in;
      border-radius: 0;
    }
    
    .header h1 {
      font-size: 36px;
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
      color: #1e3a8a;
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
    }
    
    .satellite-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .image-caption {
      text-align: center;
      font-size: 11px;
      color: #64748b;
      margin-top: 8px;
      font-style: italic;
    }
    
    .summary-box {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border: 3px solid #3b82f6;
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin: 25px 0;
    }
    
    .big-number {
      font-size: 56px;
      font-weight: 700;
      color: #1e3a8a;
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
      color: #0ea5e9;
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
      border-left: 4px solid #3b82f6;
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
      color: #1e3a8a;
      margin: 30px 0 15px 0;
      padding-bottom: 8px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .diagram-container {
      border: 3px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      margin: 20px 0;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
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
      background: #1e3a8a;
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
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
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
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">🖨️ Save as PDF</button>

  <!-- PAGE 1: COVER PAGE WITH SATELLITE IMAGE -->
  <div class="page">
    <div class="header">
      <h1>Aroof</h1>
      <p>DFW's #1 Roofing Company - Licensed & Insured</p>
    </div>
    
    <h2 class="cover-title">PROFESSIONAL ROOF MEASUREMENT REPORT</h2>
    <p class="property-address">${measurement.property_address}</p>
    <p class="measurement-date">Measured on ${today}</p>
    
    <!-- SATELLITE IMAGE -->
    <div class="satellite-container">
      <img 
        src="${satelliteImageUrl}" 
        alt="Satellite view of property"
        onerror="this.style.display='none'"
      />
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
      <p><strong>Aroof Roofing</strong></p>
      <p>📞 (850) 238-9727 | ✉️ contact@aroof.build | 🌐 aroof.build</p>
      <p>6810 Windrock Rd, Dallas, TX 75252</p>
      <p style="margin-top: 10px;">Page 1</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 2: MEASUREMENT DIAGRAM -->
  <div class="page">
    <div class="header">
      <h1>Aroof</h1>
      <p>Measurement Diagram & Section Analysis</p>
    </div>
    
    <h2 class="section-title">📐 Roof Sections Measured</h2>
    
    <!-- MEASUREMENT DIAGRAM -->
    <div class="diagram-container">
      <img 
        src="${diagramImageUrl}" 
        alt="Measurement diagram with sections"
        onerror="this.style.display='none'"
      />
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
      <p>Aroof | (850) 238-9727 | contact@aroof.build | Page 2</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 3: DETAILED MEASUREMENTS -->
  <div class="page">
    <div class="header">
      <h1>Aroof</h1>
      <p>Detailed Roof Measurements</p>
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
      <p>Aroof | (850) 238-9727 | contact@aroof.build | Page 3</p>
    </div>
  </div>
  
  <div class="page-break"></div>
  
  <!-- PAGE 4: WASTE & PRICING -->
  <div class="page">
    <div class="header">
      <h1>Aroof</h1>
      <p>Material Estimates & Pricing</p>
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
      <p>Aroof | (850) 238-9727 | contact@aroof.build | Page 4</p>
    </div>
  </div>
  
  ${photos.length > 0 ? `
    <div class="page-break"></div>
    
    <!-- PAGE 5: SITE PHOTOS -->
    <div class="page">
      <div class="header">
        <h1>Aroof</h1>
        <p>Site Photos (${photos.length})</p>
      </div>
      
      <h2 class="section-title">📸 Site Photos</h2>
      
      <div class="photos-grid">
        ${photos.slice(0, 6).map((photo, idx) => `
          <div class="photo-item">
            <img src="${photo.url}" alt="Site photo ${idx + 1}" onerror="this.style.display='none'" />
            ${photo.caption ? `<div class="photo-caption"><strong>Photo ${idx + 1}:</strong> ${photo.caption}</div>` : `<div class="photo-caption">Photo ${idx + 1}</div>`}
          </div>
        `).join('')}
      </div>
      
      ${photos.length > 6 ? `<p class="image-caption">Showing first 6 of ${photos.length} photos</p>` : ''}
      
      <div class="footer">
        <p>Aroof | (850) 238-9727 | contact@aroof.build | Page 5</p>
      </div>
    </div>
  ` : ''}
  
  <div class="page-break"></div>
  
  <!-- FINAL PAGE: CONTACT & CTA -->
  <div class="page">
    <div class="header">
      <h1>Aroof</h1>
      <p>Ready to Get Started?</p>
    </div>
    
    <div class="cta-box">
      <h2>Schedule Your FREE Roof Inspection</h2>
      <p style="font-size: 14px; margin-top: 8px;">Our licensed roofing experts are here to help</p>
    </div>
    
    <h2 class="section-title">📞 Contact Aroof</h2>
    
    <div class="contact-grid">
      <div class="contact-item">
        <strong>📞 Phone:</strong><br>
        (850) 238-9727
      </div>
      <div class="contact-item">
        <strong>✉️ Email:</strong><br>
        contact@aroof.build
      </div>
      <div class="contact-item">
        <strong>🌐 Website:</strong><br>
        aroof.build
      </div>
      <div class="contact-item">
        <strong>📍 Address:</strong><br>
        6810 Windrock Rd<br>
        Dallas, TX 75252
      </div>
    </div>
    
    <h2 class="section-title">⭐ Why Choose Aroof?</h2>
    
    <div class="details-grid">
      <div class="detail-item">
        <div class="detail-label">Licensed & Insured</div>
        <div class="detail-value">Texas Certified</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Experience</div>
        <div class="detail-value">Serving DFW Since 2010</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Rating</div>
        <div class="detail-value">4.9/5 Stars (500+ Reviews)</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Warranty</div>
        <div class="detail-value">10-Year Workmanship</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">BBB Rating</div>
        <div class="detail-value">A+ Accredited</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Financing</div>
        <div class="detail-value">0% Available</div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>This report was generated by Aroof's automated measurement system</strong></p>
      <p>For questions or to schedule a free inspection, call (850) 238-9727</p>
      <p style="margin-top: 15px;">© ${new Date().getFullYear()} Aroof. All rights reserved. Licensed & Insured in Texas.</p>
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