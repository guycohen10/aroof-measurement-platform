import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    fontSize: 60,
    color: 'rgba(255, 255, 255, 0.3)',
    transform: 'rotate(-45deg)',
    top: '50%',
    left: '50%',
    fontWeight: 'bold',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  coverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  reportId: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 30,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
  },
  pageHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  largeNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginVertical: 25,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '2 solid #93c5fd',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e2e8f0',
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 10,
    color: '#1e293b',
  },
  disclaimerBox: {
    backgroundColor: '#fef3c7',
    border: '1 solid #fde047',
    padding: 12,
    marginVertical: 15,
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#854d0e',
    lineHeight: 1.4,
  },
  checkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    border: '1 solid #64748b',
    marginRight: 8,
    borderRadius: 2,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#94a3b8',
  },
  watermarkText: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    fontSize: 8,
    color: '#cbd5e1',
  },
});

export default function RooferPDFDocument({ measurement, sections, rooferNotes }) {
  const reportId = `ARM-${Date.now()}`;
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  const totalArea = measurement?.total_sqft || 0;
  const rooferName = measurement?.customer_name || 'Professional Roofer';

  // Calculate material estimates
  const wasteArea = Math.round(totalArea * 1.1);
  const threeTabBundles = Math.ceil(wasteArea / 33.3);
  const archBundles = Math.ceil(wasteArea / 32);
  const underlaymentRolls = Math.ceil(wasteArea / 400);
  
  // Calculate perimeter (approximate from sections)
  let totalPerimeter = 0;
  if (sections && sections.length > 0) {
    sections.forEach(section => {
      if (section.perimeter) {
        totalPerimeter += section.perimeter;
      } else if (section.area_sqft) {
        // Rough approximation if perimeter not available
        totalPerimeter += Math.sqrt(section.area_sqft) * 4;
      }
    });
  } else {
    // Rough approximation for single section
    totalPerimeter = Math.sqrt(totalArea) * 4;
  }
  totalPerimeter = Math.round(totalPerimeter);

  const ridgeCap = Math.round(totalPerimeter * 0.3);
  const starterStrips = totalPerimeter;
  const iceWaterShield = Math.round(totalArea * 0.1);

  return (
    <Document>
      {/* PAGE 1 - COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={{ fontSize: 16, color: '#2563eb', marginBottom: 5 }}>
            Aroof.build
          </Text>
          <Text style={styles.coverTitle}>
            Professional Roof{'\n'}Measurement Report
          </Text>
          <Text style={{ fontSize: 16, color: '#475569', marginBottom: 5, textAlign: 'center' }}>
            {measurement?.property_address}
          </Text>
          <Text style={{ fontSize: 12, color: '#64748b', marginTop: 20 }}>
            Report Date: {reportDate}
          </Text>
          <Text style={styles.reportId}>Report ID: {reportId}</Text>
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: '#64748b', marginBottom: 5 }}>
              Prepared by:
            </Text>
            <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#1e293b' }}>
              {rooferName}
            </Text>
          </View>
        </View>
        <Text style={styles.footer}>
          Measured using Aroof.build Technology{'\n'}
          Advanced Satellite Measurement System
        </Text>
        <Text style={styles.watermarkText}>Measured with Aroof.build</Text>
      </Page>

      {/* PAGE 2 - MEASUREMENT DATA */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Roof Measurements</Text>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            TOTAL ROOF AREA
          </Text>
          <Text style={styles.largeNumber}>
            {totalArea.toLocaleString('en-US', { maximumFractionDigits: 2 })} sq ft
          </Text>
        </View>

        {/* Detailed Breakdown */}
        {sections && sections.length > 0 && (
          <View style={{ marginBottom: 30 }}>
            <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 10 }}>
              Detailed Section Breakdown:
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Section</Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>
                Area (sq ft)
              </Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>
                Perimeter (ft)
              </Text>
            </View>
            {sections.map((section, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{section.name || `Section ${index + 1}`}</Text>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {section.area_sqft?.toLocaleString('en-US', { maximumFractionDigits: 2 }) || '-'}
                </Text>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {section.perimeter?.toLocaleString('en-US', { maximumFractionDigits: 1 }) || '-'}
                </Text>
              </View>
            ))}
            <View style={[styles.tableRow, { backgroundColor: '#f1f5f9', fontWeight: 'bold' }]}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>TOTAL</Text>
              <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>
                {totalArea.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>
                {totalPerimeter.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Additional Data */}
        <View style={{ backgroundColor: '#f8fafc', padding: 15, borderRadius: 4 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Total Perimeter:</Text>
            <Text style={styles.value}>{totalPerimeter.toLocaleString()} linear feet</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Measurement Method:</Text>
            <Text style={styles.value}>Satellite Imagery Analysis</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Accuracy:</Text>
            <Text style={styles.value}>±2-5%</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Measurement Date:</Text>
            <Text style={styles.value}>
              {measurement?.created_date ? format(new Date(measurement.created_date), 'MMM d, yyyy h:mm a') : reportDate}
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Report ID: {reportId} | Page 2 of 5
        </Text>
        <Text style={styles.watermarkText}>Measured with Aroof.build</Text>
        <Text style={styles.pageNumber}>Page 2 of 5</Text>
      </Page>

      {/* PAGE 3 - AERIAL VIEW WITH WATERMARK */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Satellite Measurement View</Text>
        </View>

        <View style={{
          position: 'relative',
          backgroundColor: '#1e293b',
          padding: 40,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 450,
          borderRadius: 4,
          marginVertical: 20,
        }}>
          {/* Watermark Overlay */}
          <Text style={{
            position: 'absolute',
            fontSize: 48,
            color: 'rgba(255, 255, 255, 0.25)',
            fontWeight: 'bold',
            transform: 'rotate(-45deg)',
            textAlign: 'center',
          }}>
            Measured with{'\n'}Aroof.build
          </Text>

          <Text style={{ fontSize: 16, color: '#94a3b8', marginBottom: 15, textAlign: 'center' }}>
            Satellite View with Polygon Overlay
          </Text>
          <Text style={{ fontSize: 14, color: '#cbd5e1', marginBottom: 10, textAlign: 'center' }}>
            Total Area: {totalArea.toLocaleString('en-US', { maximumFractionDigits: 2 })} sq ft
          </Text>
          <Text style={{ fontSize: 10, color: '#64748b', marginTop: 30, textAlign: 'center' }}>
            Blue polygon overlay shows measured roof boundaries{'\n'}
            Scale and compass indicators included{'\n'}
            High-resolution satellite imagery
          </Text>

          {/* Small Aroof logo indicator */}
          <View style={{
            position: 'absolute',
            bottom: 15,
            right: 15,
            backgroundColor: 'rgba(37, 99, 235, 0.3)',
            padding: 8,
            borderRadius: 4,
          }}>
            <Text style={{ fontSize: 9, color: '#bfdbfe', fontWeight: 'bold' }}>
              Aroof.build
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 9, color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
          This measurement report includes watermarked imagery for professional use only
        </Text>

        <Text style={styles.footer}>
          Report ID: {reportId} | Page 3 of 5
        </Text>
        <Text style={styles.watermarkText}>Measured with Aroof.build</Text>
        <Text style={styles.pageNumber}>Page 3 of 5</Text>
      </Page>

      {/* PAGE 4 - MATERIAL ESTIMATES */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Material Quantity Estimates</Text>
        </View>

        <View style={styles.disclaimerBox}>
          <Text style={[styles.disclaimerText, { fontWeight: 'bold', marginBottom: 4 }]}>
            Disclaimer:
          </Text>
          <Text style={styles.disclaimerText}>
            These are estimates only. Always verify measurements and quantities before ordering materials. 
            Actual requirements may vary based on roof pitch, complexity, and waste.
          </Text>
        </View>

        {/* Material Calculations */}
        <View style={{ marginBottom: 25 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Material</Text>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Calculation</Text>
            <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>
              Quantity
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Base roof area</Text>
            <Text style={styles.tableCell}>Measured</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {totalArea.toLocaleString()} sq ft
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Add 10% waste</Text>
            <Text style={styles.tableCell}>+10%</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {wasteArea.toLocaleString()} sq ft
            </Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>3-tab shingles</Text>
            <Text style={styles.tableCell}>÷33.3 sq ft/bundle</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {threeTabBundles} bundles
            </Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#fef3c7' }]}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Architectural shingles</Text>
            <Text style={styles.tableCell}>÷32 sq ft/bundle</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {archBundles} bundles
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Underlayment</Text>
            <Text style={styles.tableCell}>÷400 sq ft/roll</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {underlaymentRolls} rolls
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Ridge cap</Text>
            <Text style={styles.tableCell}>Perimeter × 0.3</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {ridgeCap} lin ft
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Starter strips</Text>
            <Text style={styles.tableCell}>Perimeter</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {starterStrips} lin ft
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Ice & water shield</Text>
            <Text style={styles.tableCell}>10% of area</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              {iceWaterShield.toLocaleString()} sq ft
            </Text>
          </View>
        </View>

        {/* Additional Considerations */}
        <View style={{ marginBottom: 15 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
            Additional Considerations:
          </Text>
          {[
            'Valleys present (add 15% underlayment)',
            'Steep pitch (requires additional materials/safety)',
            'Multiple stories (affects staging)',
            'Chimneys/skylights (add flashing materials)',
          ].map((item, index) => (
            <View key={index} style={styles.checkBox}>
              <View style={styles.checkbox} />
              <Text style={{ fontSize: 9 }}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Custom Notes */}
        {rooferNotes && (
          <View style={{ backgroundColor: '#eff6ff', padding: 12, borderRadius: 4, marginTop: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 5 }}>
              Professional Notes:
            </Text>
            <Text style={{ fontSize: 9, color: '#1e293b' }}>{rooferNotes}</Text>
          </View>
        )}

        <Text style={styles.footer}>
          Report ID: {reportId} | Page 4 of 5
        </Text>
        <Text style={styles.watermarkText}>Measured with Aroof.build</Text>
        <Text style={styles.pageNumber}>Page 4 of 5</Text>
      </Page>

      {/* PAGE 5 - REPORT DETAILS & DISCLAIMERS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Report Details & Disclaimers</Text>
        </View>

        {/* Methodology */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>
            Measurement Methodology
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
            This report was generated using Aroof.build's advanced satellite measurement technology. 
            High-resolution satellite imagery is analyzed using proprietary algorithms to accurately 
            determine roof dimensions and area calculations. The system accounts for various roof 
            features and provides professional-grade measurements suitable for material estimation 
            and project planning.
          </Text>
        </View>

        {/* Accuracy */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>
            Accuracy Information
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', lineHeight: 1.5 }}>
            Satellite-based measurements typically have an accuracy range of ±2-5%. This variance 
            is within industry standards for preliminary estimating purposes. For critical 
            measurements or complex roof structures, on-site verification is recommended.
          </Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Text style={[styles.disclaimerText, { fontWeight: 'bold', marginBottom: 5 }]}>
            IMPORTANT DISCLAIMER
          </Text>
          <Text style={styles.disclaimerText}>
            This measurement report is provided for estimation purposes only. Measurements derived 
            from satellite imagery may have ±2-5% variance. Always verify critical measurements 
            on-site before ordering materials or providing final quotes to customers.{'\n\n'}
            This report does not constitute a warranty or guarantee of actual roof dimensions. Roof 
            pitch, complexity, condition, and structural considerations should be verified in person 
            by a qualified roofing professional.{'\n\n'}
            Material calculations provided are estimates and should be adjusted based on specific 
            project requirements, local building codes, and manufacturer specifications.
          </Text>
        </View>

        {/* Report Prepared By */}
        <View style={{ marginTop: 25, backgroundColor: '#f8fafc', padding: 15, borderRadius: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>
            Report Prepared By:
          </Text>
          <Text style={{ fontSize: 10, color: '#1e293b', marginBottom: 4 }}>
            {rooferName}
          </Text>
          {measurement?.customer_email && (
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              Email: {measurement.customer_email}
            </Text>
          )}
          {measurement?.customer_phone && (
            <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
              Phone: {measurement.customer_phone}
            </Text>
          )}
          <Text style={{ fontSize: 9, color: '#64748b', marginTop: 8, fontStyle: 'italic' }}>
            Measurement technology powered by Aroof.build
          </Text>
        </View>

        {/* Thank You */}
        <View style={{ marginTop: 30, textAlign: 'center' }}>
          <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'center' }}>
            Thank you for using Aroof.build's professional measurement service.{'\n'}
            For questions or support, visit Aroof.build
          </Text>
        </View>

        <Text style={styles.footer}>
          Report ID: {reportId} | Page 5 of 5
        </Text>
        <Text style={styles.watermarkText}>Measured with Aroof.build</Text>
        <Text style={styles.pageNumber}>Page 5 of 5</Text>
      </Page>
    </Document>
  );
}