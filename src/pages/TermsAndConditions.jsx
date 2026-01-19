import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Scale, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to={createPageUrl("Homepage")}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Terms and Conditions</h1>
          <p className="text-slate-600 text-lg">Last updated: January 18, 2025</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              {/* Acceptance of Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  1. Acceptance of Terms
                </h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  By accessing or using Aroof ("Service," "Platform," "we," "us," or "our"), you agree to be bound by these Terms and Conditions. If you do not agree, do not use our Service.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  These Terms constitute a legally binding agreement between you and Aroof.
                </p>
              </section>

              {/* Description of Service */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  2. Description of Service
                </h2>
                <p className="text-slate-700 mb-4">
                  Aroof is a roofing measurement and contractor management platform that provides:
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-3">For Homeowners:</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Free satellite-based roof measurements</li>
                    <li>• AI-powered roof visualizations</li>
                    <li>• Roofing contractor directory and quote requests</li>
                    <li>• Project cost estimation tools</li>
                    <li>• Optional premium measurement reports ($3-5)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-3">For Roofing Contractors:</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Customer relationship management (CRM) tools</li>
                    <li>• Lead generation and purchase capabilities</li>
                    <li>• Measurement and estimation tools</li>
                    <li>• Business management features</li>
                    <li>• Directory profile and marketing tools</li>
                  </ul>
                </div>
              </section>

              {/* Eligibility */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  3. Eligibility
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.1 Age Requirement</h3>
                <p className="text-slate-700">You must be at least 18 years old to use Aroof.</p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.2 Authority</h3>
                <p className="text-slate-700">
                  If using Aroof on behalf of a business, you represent that you have authority to bind that entity to these Terms.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.3 Compliance</h3>
                <p className="text-slate-700">You agree to comply with all applicable laws.</p>
              </section>

              {/* Account Registration */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  4. Account Registration
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.1 Account Creation</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Provide accurate, current, and complete information</li>
                  <li>• Maintain and update your information</li>
                  <li>• Keep your password secure</li>
                  <li>• Notify us immediately of unauthorized access</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.2 Account Responsibility</h3>
                <p className="text-slate-700">You are responsible for all activities under your account.</p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.3 Account Termination</h3>
                <p className="text-slate-700">
                  We reserve the right to suspend or terminate accounts that violate these Terms.
                </p>
              </section>

              {/* Subscription Plans */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  5. Subscription Plans (For Contractors)
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">5.1 Plan Tiers</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Free:</strong> Basic profile in contractor directory</li>
                  <li>• <strong>Pro ($99/month):</strong> Full CRM access, lead management, custom branding</li>
                  <li>• <strong>Unlimited ($249/month):</strong> Unlimited leads, priority support, advanced analytics</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">5.2 Billing</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Subscriptions renew automatically</li>
                  <li>• Payment methods: Credit card, debit card, PayPal</li>
                  <li>• Prices subject to change with 30 days notice</li>
                  <li>• No refunds for partial months</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">5.3 Lead Purchases</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Leads purchased separately from subscriptions</li>
                  <li>• Non-refundable once delivered</li>
                  <li>• Pricing varies by lead quality</li>
                  <li>• Shared leads may be sold to multiple contractors (max 5)</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">5.4 Cancellation</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Cancel anytime through account settings</li>
                  <li>• Access continues until end of billing period</li>
                  <li>• No refunds for unused subscription time</li>
                </ul>
              </section>

              {/* Measurement Accuracy Disclaimer */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-red-200">
                  6. Measurement Accuracy Disclaimer
                </h2>

                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-yellow-900 mb-2">IMPORTANT DISCLAIMER</h4>
                      <p className="text-yellow-800 leading-relaxed">
                        Our measurements are estimates only. Always verify with on-site inspection by licensed professionals.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">6.1 Technology Limitations</h3>
                <p className="text-slate-700 mb-3">
                  Our measurements use satellite imagery and AI algorithms. While generally accurate (±2-5%), factors may affect precision including tree coverage, image resolution, roof complexity, and weather conditions.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">6.2 Professional Verification</h3>
                <p className="text-slate-700 mb-3">
                  <strong>MEASUREMENTS ARE ESTIMATES ONLY.</strong> Always verify with on-site inspection by licensed professionals before ordering materials, signing contracts, or making financial commitments.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">6.3 Liability Disclaimer</h3>
                <p className="text-slate-700 mb-3">We are NOT liable for:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Measurement inaccuracies</li>
                  <li>• Material overages or shortages</li>
                  <li>• Project cost overruns</li>
                  <li>• Decisions based on our estimates</li>
                </ul>
              </section>

              {/* User Conduct */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  7. User Conduct
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">7.1 Prohibited Activities</h3>
                <p className="text-slate-700 mb-3">You may NOT:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Provide false or misleading information</li>
                  <li>• Impersonate others</li>
                  <li>• Upload viruses or harmful code</li>
                  <li>• Scrape or data mine the platform</li>
                  <li>• Reverse engineer our software</li>
                  <li>• Use automated bots</li>
                  <li>• Spam, harass, or abuse other users</li>
                  <li>• Violate intellectual property rights</li>
                  <li>• Engage in fraudulent transactions</li>
                  <li>• Use Service for illegal purposes</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">7.2 Contractor-Specific Prohibitions</h3>
                <p className="text-slate-700 mb-3">Contractors may NOT:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Operate without proper licenses and insurance</li>
                  <li>• Misrepresent qualifications</li>
                  <li>• Contact homeowners outside platform without consent</li>
                  <li>• Share or resell purchased leads</li>
                  <li>• Create fake reviews</li>
                  <li>• Discriminate based on protected characteristics</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">7.3 Consequences</h3>
                <p className="text-slate-700">
                  Violations may result in account suspension, termination, forfeiture of fees, and legal action.
                </p>
              </section>

              {/* Intellectual Property */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  8. Intellectual Property
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">8.1 Aroof Property</h3>
                <p className="text-slate-700">
                  All content, features, and functionality are owned by Aroof and protected by copyright, trademark, and other laws.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">8.2 User Content License</h3>
                <p className="text-slate-700">
                  By uploading content, you grant Aroof a worldwide, non-exclusive, royalty-free license to display, reproduce, and distribute your content.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">8.3 Contractor Profiles</h3>
                <p className="text-slate-700">
                  Contractors grant permission to display their business information publicly in our directory.
                </p>
              </section>

              {/* Third-Party Services */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  9. Third-Party Services
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">9.1 Integrated Services</h3>
                <p className="text-slate-700">
                  Aroof uses third-party services (Google Maps, Replicate.com, payment processors). Your use is subject to their terms.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">9.2 No Endorsement</h3>
                <p className="text-slate-700">
                  Inclusion in our directory does not constitute endorsement. We do not guarantee quality of contractors.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">9.3 Disputes</h3>
                <p className="text-slate-700">
                  Disputes with third parties are solely between you and that party.
                </p>
              </section>

              {/* Payment Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  10. Payment Terms
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">10.1 Fees</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Homeowners:</strong> Free basic measurements, $3-5 for premium reports</li>
                  <li>• <strong>Contractors:</strong> Subscription fees plus per-lead charges</li>
                  <li>• All fees in U.S. Dollars</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">10.2 Payment Processing</h3>
                <p className="text-slate-700">
                  Processed through secure third-party providers (Stripe, PayPal).
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">10.3 Refund Policy</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Digital Products:</strong> No refunds once delivered</li>
                  <li>• <strong>Subscriptions:</strong> No refunds for partial months</li>
                  <li>• <strong>Disputed Charges:</strong> Contact support@aroof.build within 30 days</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">10.4 Late Payments</h3>
                <p className="text-slate-700">
                  Failure to pay may result in service suspension, account termination, and legal action.
                </p>
              </section>

              {/* Disclaimers and Warranties */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-red-200">
                  11. Disclaimers and Warranties
                </h2>

                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-900 mb-3">11.1 "AS IS" Service</h3>
                  <p className="text-red-800 leading-relaxed">
                    AROOF IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.
                  </p>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">11.2 Professional Advice</h3>
                <p className="text-slate-700">
                  Aroof is NOT a substitute for professional roofing advice. Consult licensed professionals.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">11.3 Contractor Screening</h3>
                <p className="text-slate-700">
                  While we verify licenses, we do NOT conduct comprehensive background checks or guarantee contractor quality.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-red-200">
                  12. Limitation of Liability
                </h2>

                <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-bold text-red-900 mb-3">12.1 Damages Cap</h3>
                  <p className="text-red-800 leading-relaxed mb-3">
                    AROOF'S TOTAL LIABILITY SHALL NOT EXCEED THE GREATER OF:
                  </p>
                  <ul className="space-y-2 text-red-800">
                    <li>• Fees you paid in the past 12 months</li>
                    <li>• $100</li>
                  </ul>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">12.2 Excluded Damages</h3>
                <p className="text-slate-700 mb-3">WE ARE NOT LIABLE FOR:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Indirect, incidental, or consequential damages</li>
                  <li>• Lost profits or revenue</li>
                  <li>• Data loss or corruption</li>
                  <li>• Personal injury or property damage</li>
                  <li>• Third-party actions</li>
                </ul>
              </section>

              {/* Indemnification */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  13. Indemnification
                </h2>
                <p className="text-slate-700">
                  You agree to indemnify and hold harmless Aroof from any claims arising from your violation of these Terms or your use of the Service.
                </p>
              </section>

              {/* Dispute Resolution */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  14. Dispute Resolution
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">14.1 Informal Resolution</h3>
                <p className="text-slate-700">
                  Contact support@aroof.build before filing formal claims.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">14.2 Binding Arbitration</h3>
                <p className="text-slate-700">
                  Disputes shall be settled by binding arbitration in Dallas, Texas under AAA Commercial Arbitration Rules.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">14.3 Class Action Waiver</h3>
                <p className="text-slate-700 font-bold">
                  YOU WAIVE THE RIGHT TO PARTICIPATE IN CLASS ACTIONS.
                </p>
              </section>

              {/* Governing Law */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  15. Governing Law
                </h2>
                <p className="text-slate-700">
                  These Terms are governed by Texas law. Exclusive venue is Dallas County, Texas.
                </p>
              </section>

              {/* Changes to Terms */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  16. Changes to Terms
                </h2>
                <p className="text-slate-700">
                  We may modify these Terms at any time. Changes will be posted with updated date. Material changes communicated 30 days in advance.
                </p>
              </section>

              {/* Termination */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  17. Termination
                </h2>
                <p className="text-slate-700">
                  We may suspend or terminate accounts for Terms violations, non-payment, or extended inactivity. Upon termination, access ceases and data may be deleted after 30 days.
                </p>
              </section>

              {/* General Provisions */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  18. General Provisions
                </h2>
                <ul className="space-y-3 text-slate-700">
                  <li>• <strong>Entire Agreement:</strong> These Terms and Privacy Policy constitute the entire agreement</li>
                  <li>• <strong>Severability:</strong> If any provision is unenforceable, remaining provisions remain in effect</li>
                  <li>• <strong>No Waiver:</strong> Failure to enforce any right does not waive that right</li>
                  <li>• <strong>Assignment:</strong> You may not assign these Terms</li>
                  <li>• <strong>Force Majeure:</strong> We are not liable for delays due to circumstances beyond control</li>
                </ul>
              </section>

              {/* Contact Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-200">
                  19. Contact Information
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Legal</p>
                        <a href="mailto:legal@aroof.build" className="text-blue-600 hover:underline font-semibold">
                          legal@aroof.build
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Support</p>
                        <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline font-semibold">
                          support@aroof.build
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Phone</p>
                        <a href="tel:+18502389727" className="text-blue-600 hover:underline font-semibold">
                          (850) 238-9727
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Address</p>
                        <p className="text-slate-900 font-semibold">Aroof Legal Department</p>
                        <p className="text-slate-700">Dallas, TX 75252</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Acknowledgment */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-200">
                  20. Acknowledgment
                </h2>
                <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white rounded-2xl p-8 text-center">
                  <p className="text-lg font-bold leading-relaxed">
                    BY USING AROOF, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS AND CONDITIONS.
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home CTA */}
        <div className="mt-12 text-center">
          <Link to={createPageUrl("Homepage")}>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Aroof. All rights reserved.
          </p>
          <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
            <Link to={createPageUrl("PrivacyPolicy")} className="hover:text-white">Privacy Policy</Link>
            <span>•</span>
            <Link to={createPageUrl("TermsAndConditions")} className="hover:text-white">Terms of Service</Link>
            <span>•</span>
            <a href="mailto:support@aroof.build" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}