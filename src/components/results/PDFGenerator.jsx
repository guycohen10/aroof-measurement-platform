import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Note: In production, install jsPDF: npm install jspdf jspdf-autotable

const AROOF_BLUE = [41, 98, 149];
const AROOF_ORANGE = [255, 140, 66];

export const generateHomeownerPDF = async (measurement, user, estimate) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Helper to add footer
  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `Page ${pageNum} | Report ID: ${measurement.report_id || 'N/A'} | Aroof.build | (555) 123-4567`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      `This estimate prepared exclusively for ${user?.name}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  };

  // PAGE 1 - Cover Page
  doc.setFillColor(...AROOF_BLUE);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.text('AROOF', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('Roof Measurement & Cost Estimate', pageWidth / 2, 50, { align: 'center' });
  
  // Property Address
  doc.setTextColor(0);
  doc.setFontSize(24);
  doc.text(measurement.property_address, pageWidth / 2, 110, { align: 'center', maxWidth: pageWidth - 40 });
  
  // Report Details
  doc.setFontSize(12);
  doc.text(`Report Date: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, 140, { align: 'center' });
  doc.text(`Report ID: ${measurement.report_id || 'N/A'}`, pageWidth / 2, 150, { align: 'center' });
  
  // About Section
  doc.setFontSize(14);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('Professional Roofing Services', pageWidth / 2, 180, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  const aboutText = [
    'Licensed & Insured',
    '15+ Years in Business',
    '1,000+ Projects Completed',
    'A+ Customer Satisfaction'
  ];
  aboutText.forEach((line, i) => {
    doc.text(line, pageWidth / 2, 195 + (i * 8), { align: 'center' });
  });
  
  addFooter(1);

  // PAGE 2 - Measurements
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('Aerial Measurement View', 20, 30);
  
  // Placeholder for satellite image
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 40, pageWidth - 40, 100, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Satellite Image with Measurement Overlays', pageWidth / 2, 90, { align: 'center' });
  doc.text('(Image would be embedded here in production)', pageWidth / 2, 100, { align: 'center' });
  
  // Measurement Summary
  doc.setFillColor(...AROOF_BLUE);
  doc.rect(20, 150, pageWidth - 40, 15, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('Measurement Summary', 25, 160);
  
  doc.setTextColor(0);
  doc.setFontSize(20);
  doc.text(`Total Roof Area: ${measurement.total_sqft?.toLocaleString() || 0} sq ft`, 25, 180);
  
  // Sections table
  if (measurement.measurement_data?.sections?.length > 0) {
    const tableData = measurement.measurement_data.sections.map(section => [
      section.name,
      `${section.area_sqft.toLocaleString()} sq ft`
    ]);
    
    doc.autoTable({
      startY: 190,
      head: [['Section', 'Area']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: AROOF_BLUE },
      margin: { left: 25, right: 25 }
    });
  }
  
  const finalY = doc.lastAutoTable?.finalY || 220;
  doc.setFontSize(10);
  doc.text(`Measurement Date: ${format(new Date(measurement.created_date), 'MMMM d, yyyy')}`, 25, finalY + 15);
  doc.text('Measurement Method: Satellite Imagery Analysis', 25, finalY + 22);
  doc.text('Accuracy: ±2%', 25, finalY + 29);
  
  addFooter(2);

  // PAGE 3 - Cost Estimate
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('Aroof Professional Estimate', 20, 30);
  
  if (estimate) {
    // Pricing table
    const pricingData = [
      ['Roof Area', `${measurement.total_sqft?.toLocaleString() || 0} sq ft`, '-'],
      ['Material Cost', `${measurement.total_sqft} sq ft × $${(estimate.material_cost / measurement.total_sqft).toFixed(2)}`, `$${estimate.material_cost.toLocaleString()}`],
      ['Labor Cost', `${measurement.total_sqft} sq ft × $${(estimate.labor_cost / measurement.total_sqft).toFixed(2)}`, `$${estimate.labor_cost.toLocaleString()}`],
      ['Waste Factor (10%)', '10% of materials + labor', `$${estimate.waste_factor.toLocaleString()}`],
      ['Permits & Fees', '-', `$${estimate.additional_fees.toLocaleString()}`]
    ];
    
    doc.autoTable({
      startY: 40,
      head: [['Item', 'Calculation', 'Amount']],
      body: pricingData,
      foot: [['SUBTOTAL', '', `$${estimate.subtotal.toLocaleString()}`]],
      theme: 'striped',
      headStyles: { fillColor: AROOF_BLUE },
      footStyles: { fillColor: AROOF_ORANGE, fontStyle: 'bold' },
      margin: { left: 20, right: 20 }
    });
    
    // Estimated Range
    const rangeY = doc.lastAutoTable.finalY + 20;
    doc.setFillColor(...AROOF_BLUE);
    doc.rect(20, rangeY, pageWidth - 40, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text('Estimated Total Range', pageWidth / 2, rangeY + 12, { align: 'center' });
    doc.setFontSize(20);
    doc.text(`$${estimate.low_estimate.toLocaleString()} - $${estimate.high_estimate.toLocaleString()}`, pageWidth / 2, rangeY + 24, { align: 'center' });
  }
  
  // What's Included
  const includedY = doc.lastAutoTable.finalY + 60;
  doc.setFontSize(14);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('What\'s Included:', 20, includedY);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  const inclusions = [
    'Asphalt shingle roofing materials',
    'Professional installation by licensed contractors',
    'Tear-off and disposal of old roof',
    'Underlayment and ice/water shield',
    'Complete cleanup and final inspection',
    'Comprehensive workmanship warranty'
  ];
  inclusions.forEach((item, i) => {
    doc.text(`✓ ${item}`, 25, includedY + 10 + (i * 7));
  });
  
  // Important Notes
  const notesY = includedY + 60;
  doc.setFillColor(255, 248, 220);
  doc.rect(20, notesY, pageWidth - 40, 35, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Important Notes:', 25, notesY + 8);
  doc.text('• This estimate is based on standard asphalt shingles', 25, notesY + 15);
  doc.text('• Final price may vary based on roof pitch, complexity, and material selection', 25, notesY + 21);
  doc.text('• Estimate valid for 30 days from report date', 25, notesY + 27);
  
  addFooter(3);

  // PAGE 4 - Next Steps
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('Ready to Move Forward?', 20, 30);
  
  // Option 1
  doc.setFillColor(255, 248, 220);
  doc.rect(20, 40, pageWidth - 40, 45, 'F');
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('1. Schedule Free Inspection', 25, 50);
  doc.setFontSize(10);
  doc.text('Our team will inspect your roof and provide detailed assessment', 25, 58);
  doc.setFontSize(16);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Call: (555) 123-4567', 25, 70);
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text('Email: contact@aroof.build | Online: Aroof.build/schedule', 25, 78);
  
  // Option 2
  doc.rect(20, 95, pageWidth - 40, 30, 'F');
  doc.setFontSize(14);
  doc.text('2. Request Detailed Quote', 25, 105);
  doc.setFontSize(10);
  doc.text('Need more specific pricing or have questions?', 25, 113);
  doc.text('Contact us for a personalized consultation', 25, 119);
  
  // Option 3
  doc.rect(20, 135, pageWidth - 40, 25, 'F');
  doc.setFontSize(14);
  doc.text('3. Financing Options Available', 25, 145);
  doc.setFontSize(10);
  doc.text('Ask about our flexible financing plans to make your project affordable', 25, 153);
  
  // About Aroof
  doc.setFontSize(14);
  doc.setTextColor(...AROOF_BLUE);
  doc.text('Why Choose Aroof?', 20, 180);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  const benefits = [
    '✓ Licensed & Insured',
    '✓ 15+ Years Experience',
    '✓ 1,000+ Projects Completed',
    '✓ A+ Customer Satisfaction',
    '✓ Free Inspections',
    '✓ Comprehensive Warranties'
  ];
  
  let col = 0;
  benefits.forEach((benefit, i) => {
    const x = 25 + (col * 90);
    const y = 190 + ((i % 3) * 8);
    doc.text(benefit, x, y);
    if ((i + 1) % 3 === 0) col++;
  });
  
  addFooter(4);

  return doc;
};

export const generateRooferPDF = async (measurement, user) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const addWatermark = () => {
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(40);
    doc.text('Measured with Aroof.build', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45,
      opacity: 0.3
    });
  };
  
  const addFooter = (pageNum) => {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${pageNum} | Measured with Aroof.build | Report ID: ${measurement.report_id || 'N/A'}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // PAGE 1 - Cover Page
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Powered by', pageWidth - 40, 15);
  doc.setFontSize(12);
  doc.text('Aroof.build', pageWidth - 40, 20);
  
  doc.setFontSize(28);
  doc.setTextColor(0);
  doc.text('Professional Roof', pageWidth / 2, 80, { align: 'center' });
  doc.text('Measurement Report', pageWidth / 2, 95, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text(measurement.property_address, pageWidth / 2, 120, { align: 'center', maxWidth: pageWidth - 40 });
  
  doc.setFontSize(12);
  doc.text(`Report Date: ${format(new Date(), 'MMMM d, yyyy')}`, pageWidth / 2, 145, { align: 'center' });
  doc.text(`Report ID: ${measurement.report_id || 'N/A'}`, pageWidth / 2, 155, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Prepared by:', pageWidth / 2, 180, { align: 'center' });
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(user?.business_name || user?.name, pageWidth / 2, 190, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Measured using Aroof.build Technology', pageWidth / 2, 205, { align: 'center' });
  
  addWatermark();
  addFooter(1);

  // PAGE 2 - Measurements
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Roof Measurements', 20, 30);
  
  // Total Area Box
  doc.setFillColor(...AROOF_ORANGE);
  doc.rect(20, 40, pageWidth - 40, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text('TOTAL ROOF AREA', pageWidth / 2, 52, { align: 'center' });
  doc.setFontSize(32);
  doc.text(`${measurement.total_sqft?.toLocaleString() || 0} sq ft`, pageWidth / 2, 70, { align: 'center' });
  
  // Section Breakdown
  if (measurement.measurement_data?.sections?.length > 0) {
    const tableData = measurement.measurement_data.sections.map(section => {
      const perimeter = Math.round(section.area_sqft * 0.4); // Rough estimate
      return [
        section.name,
        section.area_sqft.toLocaleString(),
        perimeter.toLocaleString(),
        section.notes || '-'
      ];
    });
    
    const totalPerimeter = tableData.reduce((sum, row) => sum + parseFloat(row[2].replace(',', '')), 0);
    
    doc.autoTable({
      startY: 90,
      head: [['Section', 'Area (sq ft)', 'Perimeter (ft)', 'Notes']],
      body: tableData,
      foot: [['TOTAL', measurement.total_sqft.toLocaleString(), totalPerimeter.toLocaleString(), '-']],
      theme: 'striped',
      headStyles: { fillColor: AROOF_ORANGE },
      footStyles: { fillColor: [100, 100, 100], fontStyle: 'bold' },
      margin: { left: 20, right: 20 }
    });
  }
  
  // Additional Data
  const dataY = doc.lastAutoTable?.finalY + 20 || 180;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Number of sections: ${measurement.measurement_data?.sections?.length || 0}`, 20, dataY);
  doc.text(`Measurement method: Satellite imagery analysis`, 20, dataY + 7);
  doc.text(`Accuracy: ±2% typical`, 20, dataY + 14);
  doc.text(`Measurement date: ${format(new Date(measurement.created_date), 'MMMM d, yyyy h:mm a')}`, 20, dataY + 21);
  
  addWatermark();
  addFooter(2);

  // PAGE 3 - Aerial View
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Satellite Measurement View', 20, 30);
  
  // Image placeholder with watermark
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 40, pageWidth - 40, 140, 'F');
  
  // Watermark on image
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('Measured with', pageWidth / 2 - 30, pageHeight / 2 - 10, { angle: -30 });
  doc.text('Aroof.build', pageWidth / 2 - 20, pageHeight / 2 + 5, { angle: -30 });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('High-resolution satellite image with measurement overlays', pageWidth / 2, 110, { align: 'center' });
  doc.text('(Watermarked image embedded in production version)', pageWidth / 2, 118, { align: 'center' });
  
  // Legend
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Section Legend:', 20, 195);
  
  if (measurement.measurement_data?.sections) {
    doc.setFontSize(9);
    measurement.measurement_data.sections.forEach((section, i) => {
      const y = 203 + (i * 7);
      doc.setFillColor(100 + i * 30, 150 - i * 20, 200);
      doc.rect(20, y - 4, 4, 4, 'F');
      doc.text(`${section.name}: ${section.area_sqft.toLocaleString()} sq ft`, 27, y);
    });
  }
  
  addWatermark();
  addFooter(3);

  // PAGE 4 - Material Estimation
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Material Quantity Estimates', 20, 30);
  
  doc.setFillColor(255, 240, 220);
  doc.rect(20, 35, pageWidth - 40, 12, 'F');
  doc.setFontSize(10);
  doc.setTextColor(100, 50, 0);
  doc.text('⚠ These are estimates only. Verify before ordering materials.', 25, 42);
  
  const totalArea = measurement.total_sqft || 0;
  const wasteArea = Math.round(totalArea * 1.1);
  
  const materialsData = [
    ['Base area', 'Measured', `${totalArea.toLocaleString()} sq ft`],
    ['With 10% waste', '+10%', `${wasteArea.toLocaleString()} sq ft`],
    ['3-tab shingles', '÷ 33.3 sq ft/bundle', `${Math.ceil(wasteArea / 33.3)} bundles`],
    ['Architectural shingles', '÷ 32 sq ft/bundle', `${Math.ceil(wasteArea / 32)} bundles`],
    ['Underlayment', '÷ 400 sq ft/roll', `${Math.ceil(wasteArea / 400)} rolls`],
    ['Ridge cap', 'Perimeter × 0.3', `${Math.round(totalArea * 0.15)} linear ft`],
    ['Starter strip', 'Perimeter', `${Math.round(totalArea * 0.15)} linear ft`],
    ['Ice/water shield', '10% of area', `${Math.round(totalArea * 0.1)} sq ft`]
  ];
  
  doc.autoTable({
    startY: 52,
    head: [['Material', 'Calculation', 'Quantity Needed']],
    body: materialsData,
    theme: 'striped',
    headStyles: { fillColor: AROOF_ORANGE },
    margin: { left: 20, right: 20 }
  });
  
  // Considerations
  const consY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Additional Considerations:', 20, consY);
  
  doc.setFontSize(9);
  const considerations = [
    '☐ Valleys present (add 15% to underlayment)',
    '☐ Steep pitch (add safety equipment, time)',
    '☐ Multiple stories (add staging costs)',
    '☐ Chimneys/skylights (add flashing materials)'
  ];
  considerations.forEach((item, i) => {
    doc.text(item, 25, consY + 8 + (i * 7));
  });
  
  // Custom Notes
  if (measurement.roofer_notes) {
    const notesY = consY + 45;
    doc.setFontSize(12);
    doc.text('Custom Notes:', 20, notesY);
    doc.setFontSize(9);
    const notes = doc.splitTextToSize(measurement.roofer_notes, pageWidth - 50);
    doc.text(notes, 25, notesY + 8);
  }
  
  addWatermark();
  addFooter(4);

  // PAGE 5 - Disclaimer
  doc.addPage();
  
  doc.setFontSize(18);
  doc.setTextColor(...AROOF_ORANGE);
  doc.text('Report Details & Disclaimer', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  const disclaimerText = [
    'MEASUREMENT METHODOLOGY:',
    'This measurement report was generated using satellite imagery analysis technology provided by Aroof.build.',
    'Measurements are calculated using advanced algorithms with typical accuracy of ±2%.',
    '',
    'PROPER USE:',
    'This report is provided for estimation purposes only. All measurements should be verified on-site before:',
    '• Ordering materials',
    '• Providing final quotes to clients',
    '• Beginning work',
    '',
    'ACCURACY & LIMITATIONS:',
    '• Measurements derived from satellite imagery may have ±2% variance',
    '• Roof pitch, complexity, and condition should be verified in person',
    '• Weather conditions and image quality can affect accuracy',
    '• This report does not constitute a warranty or guarantee',
    '',
    'DISCLAIMER:',
    'This measurement report is provided as-is. Aroof.build and its technology partners make no warranties,',
    'express or implied, regarding the accuracy or completeness of this data. Always verify critical',
    'measurements on-site before ordering materials or providing final quotes to clients.',
    ''
  ];
  
  let currentY = 45;
  disclaimerText.forEach(line => {
    if (line.includes(':')) {
      doc.setFontSize(11);
      doc.setTextColor(...AROOF_ORANGE);
    } else if (line.startsWith('•')) {
      doc.setFontSize(9);
      doc.setTextColor(80);
    } else {
      doc.setFontSize(9);
      doc.setTextColor(0);
    }
    
    const lines = doc.splitTextToSize(line, pageWidth - 40);
    doc.text(lines, 20, currentY);
    currentY += lines.length * 5 + 2;
  });
  
  // Report prepared by
  currentY += 10;
  doc.setFillColor(240, 240, 240);
  doc.rect(20, currentY, pageWidth - 40, 35, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text('Report Prepared By:', 25, currentY + 10);
  doc.setFontSize(10);
  doc.text(user?.business_name || user?.name, 25, currentY + 18);
  doc.text(`${user?.phone || ''}`, 25, currentY + 24);
  doc.text(`${user?.email || ''}`, 25, currentY + 30);
  
  addWatermark();
  addFooter(5);

  return doc;
};

export const downloadPDF = (doc, filename) => {
  doc.save(filename);
};