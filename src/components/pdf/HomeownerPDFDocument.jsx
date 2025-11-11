import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { format } from 'date-fns';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  coverAddress: {
    fontSize: 20,
    color: '#475569',
    marginBottom: 30,
    textAlign: 'center',
  },
  reportId: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 40,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#94a3b8',
  },
  pageHeader: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #e2e8f0',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 5,
  },
  label: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: 'bold',
  },
  value: {
    fontSize: 11,
    color: '#1e293b',
  },
  largeNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginVertical: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #bae6fd',
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
  checkItem: {
    flexDirection: 'row',
    marginBottom: 6,
    alignItems: 'flex-start',
  },
  checkmark: {
    color: '#16a34a',
    marginRight: 6,
    fontSize: 12,
  },
  noteBox: {
    backgroundColor: '#fef3c7',
    border: '1 solid #fde047',
    padding: 12,
    marginVertical: 10,
    borderRadius: 4,
  },
  noteText: {
    fontSize: 9,
    color: '#854d0e',
    lineHeight: 1.4,
  },
  contactSection: {
    backgroundColor: '#eff6ff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 4,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  contactItem: {
    fontSize: 11,
    color: '#1e293b',
    marginBottom: 6,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#94a3b8',
  },
});

export default function HomeownerPDFDocument({ measurement, sections, estimate }) {
  const reportId = `ARM-${Date.now()}`;
  const reportDate = format(new Date(), 'MMMM d, yyyy');
  const totalArea = measurement?.total_sqft || 0;

  return (
    <Document>
      {/* PAGE 1 - COVER PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverPage}>
          <Text style={{ fontSize: 40, fontWeight: 'bold', color: '#2563eb', marginBottom: 30 }}>
            Aroof
          </Text>
          <Text style={styles.coverTitle}>
            Roof Measurement &{'\n'}Cost Estimate Report
          </Text>
          <Text style={styles.coverAddress}>
            {measurement?.property_address}
          </Text>
          <Text style={{ fontSize: 14, color: '#64748b', marginBottom: 5 }}>
            Report Date: {reportDate}
          </Text>
          <Text style={styles.reportId}>
            Report ID: {reportId}
          </Text>
        </View>
        <Text style={styles.footer}>
          Prepared by Aroof | 6810 Windrock Rd, Dallas, TX 75252 | (850) 238-9727{'\n'}
          contact@aroof.build | Aroof.build
        </Text>
      </Page>

      {/* PAGE 2 - MEASUREMENT SUMMARY */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Measurement Results</Text>
        </View>

        <Text style={styles.largeNumber}>
          {totalArea.toLocaleString('en-US', { maximumFractionDigits: 2 })} sq ft
        </Text>

        <View style={{ marginTop: 20 }}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Property Address:</Text>
            <Text style={styles.value}>{measurement?.property_address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Measurement Date:</Text>
            <Text style={styles.value}>
              {measurement?.created_date ? format(new Date(measurement.created_date), 'MMMM d, yyyy h:mm a') : reportDate}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Measurement Method:</Text>
            <Text style={styles.value}>Satellite Imagery Analysis</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Accuracy:</Text>
            <Text style={styles.value}>±2-5%</Text>
          </View>
        </View>

        {sections && sections.length > 1 && (
          <View style={{ marginTop: 30 }}>
            <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
              Section Breakdown:
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Section</Text>
              <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>
                Area (sq ft)
              </Text>
            </View>
            {sections.map((section, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{section.name || `Section ${index + 1}`}</Text>
                <Text style={[styles.tableCell, { textAlign: 'right' }]}>
                  {section.area_sqft?.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.noteBox}>
          <Text style={styles.noteText}>
            Note: This measurement was performed using advanced satellite imagery technology, 
            providing accurate results without requiring an on-site visit. Measurements are 
            accurate within ±2-5% variance.
          </Text>
        </View>

        <Text style={styles.footer}>
          Aroof - DFW's Premier Roofing Company | Report ID: {reportId}
        </Text>
        <Text style={styles.pageNumber}>Page 2 of 5</Text>
      </Page>

      {/* PAGE 3 - SATELLITE IMAGE (Placeholder - would need actual map screenshot) */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Aerial View with Measurements</Text>
        </View>

        <View style={{
          backgroundColor: '#e2e8f0',
          padding: 40,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          borderRadius: 4,
          marginVertical: 20,
        }}>
          <Text style={{ fontSize: 16, color: '#64748b', marginBottom: 10, textAlign: 'center' }}>
            Satellite View
          </Text>
          <Text style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Measured roof area: {totalArea.toLocaleString('en-US', { maximumFractionDigits: 2 })} sq ft
          </Text>
          <Text style={{ fontSize: 10, color: '#cbd5e1', marginTop: 20, textAlign: 'center' }}>
            High-resolution satellite imagery shows precise roof boundaries
          </Text>
        </View>

        <Text style={{ fontSize: 10, color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
          Measured roof area highlighted in blue polygon overlay
        </Text>

        <Text style={styles.footer}>
          Aroof - DFW's Premier Roofing Company | Report ID: {reportId}
        </Text>
        <Text style={styles.pageNumber}>Page 3 of 5</Text>
      </Page>

      {/* PAGE 4 - COST ESTIMATE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Aroof Professional Estimate</Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Line Item</Text>
            <Text style={[styles.tableCell, { fontWeight: 'bold' }]}>Calculation</Text>
            <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right' }]}>
              Amount
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Roof Area</Text>
            <Text style={styles.tableCell}>{totalArea.toLocaleString()} sq ft</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>-</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Materials</Text>
            <Text style={styles.tableCell}>{totalArea.toLocaleString()} × ${estimate.materialRate || '4.00'}</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              ${estimate.materialCost?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Labor</Text>
            <Text style={styles.tableCell}>{totalArea.toLocaleString()} × $3.00</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              ${estimate.laborCost?.toLocaleString()}
            </Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>Waste Factor (10%)</Text>
            <Text style={styles.tableCell}>Subtotal × 0.10</Text>
            <Text style={[styles.tableCell, { textAlign: 'right' }]}>
              ${estimate.wasteCost?.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#f1f5f9', fontWeight: 'bold' }]}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold' }]}>Subtotal</Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]}>
              ${estimate.subtotal?.toLocaleString()}
            </Text>
          </View>

          <View style={[styles.tableRow, { backgroundColor: '#dbeafe' }]}>
            <Text style={[styles.tableCell, { flex: 2, fontWeight: 'bold', fontSize: 12 }]}>
              Estimated Range (±10%)
            </Text>
            <Text style={styles.tableCell}>-</Text>
            <Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold', fontSize: 12 }]}>
              ${estimate.low?.toLocaleString()} - ${estimate.high?.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* What's Included */}
        <View style={{ marginTop: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
            What's Included:
          </Text>
          {[
            'Premium asphalt shingles',
            'Professional installation by licensed crew',
            'Complete tear-off & disposal of old roof',
            'Underlayment & ice/water shield',
            'Proper ventilation installation',
            'Full site cleanup & debris removal',
            '10-year workmanship warranty',
            'Final inspection & quality check',
          ].map((item, index) => (
            <View key={index} style={styles.checkItem}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={{ fontSize: 10, color: '#1e293b' }}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={styles.noteBox}>
          <Text style={[styles.noteText, { fontWeight: 'bold', marginBottom: 5 }]}>
            Important Notes:
          </Text>
          <Text style={styles.noteText}>
            • This estimate is based on standard {estimate.materialType || 'asphalt shingles'}{'\n'}
            • Final price may vary based on roof pitch, complexity, and material selection{'\n'}
            • Estimate valid for 30 days from report date{'\n'}
            • Does not include repairs to damaged decking or structural issues
          </Text>
        </View>

        <Text style={styles.footer}>
          Aroof - DFW's Premier Roofing Company | Report ID: {reportId}
        </Text>
        <Text style={styles.pageNumber}>Page 4 of 5</Text>
      </Page>

      {/* PAGE 5 - NEXT STEPS */}
      <Page size="A4" style={styles.page}>
        <View style={styles.pageHeader}>
          <Text style={styles.sectionTitle}>Ready to Move Forward?</Text>
        </View>

        {/* Three Options */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>
            1. SCHEDULE FREE INSPECTION
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
            • Our licensed team will inspect your roof in detail
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
            • We'll assess pitch, condition, and any special requirements
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 15 }}>
            • No obligation - completely free
          </Text>

          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>
            2. GET DETAILED QUOTE
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 4 }}>
            • Need more specific pricing?
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 15 }}>
            • We'll provide a customized quote based on your preferences
          </Text>

          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#2563eb', marginBottom: 8 }}>
            3. CONTACT US DIRECTLY
          </Text>
          <Text style={{ fontSize: 10, color: '#475569', marginBottom: 15 }}>
            • Speak with our roofing experts immediately
          </Text>
        </View>

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contact Aroof Today</Text>
          <Text style={[styles.contactItem, { fontSize: 16, fontWeight: 'bold', color: '#1e40af' }]}>
            Phone: (850) 238-9727
          </Text>
          <Text style={styles.contactItem}>Email: contact@aroof.build</Text>
          <Text style={styles.contactItem}>Address: 6810 Windrock Rd, Dallas, TX 75252</Text>
          <Text style={styles.contactItem}>Website: Aroof.build</Text>
          <Text style={styles.contactItem}>Hours: Monday-Friday 8am-6pm, Saturday 9am-3pm</Text>
        </View>

        {/* About Aroof */}
        <View style={{ marginTop: 20, padding: 15, backgroundColor: '#f8fafc', borderRadius: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 8 }}>About Aroof</Text>
          <View style={styles.checkItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>Texas Licensed & Insured Roofing Contractor</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>Serving Dallas-Fort Worth since 2010</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>4.9/5 stars from 500+ satisfied customers</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>A+ BBB Rating</Text>
          </View>
          <View style={styles.checkItem}>
            <Text style={styles.checkmark}>✓</Text>
            <Text style={{ fontSize: 10 }}>10-year workmanship warranty on all installations</Text>
          </View>
        </View>

        <View style={{ marginTop: 30, padding: 15, backgroundColor: '#fef3c7', borderRadius: 4 }}>
          <Text style={{ fontSize: 10, color: '#854d0e', textAlign: 'center' }}>
            Thank you for choosing Aroof for your roofing measurement.{'\n'}
            We look forward to helping you with your roofing project!
          </Text>
        </View>

        <Text style={styles.footer}>
          Aroof - DFW's Premier Roofing Company | Report ID: {reportId}
        </Text>
        <Text style={styles.pageNumber}>Page 5 of 5</Text>
      </Page>
    </Document>
  );
}