import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Shield, Mail, Phone, MapPin } from "lucide-react";

export default function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600 text-lg">Last updated: January 18, 2025</p>
        </div>

        <Card className="shadow-xl">
          <CardContent className="p-8 md:p-12">
            <div className="prose prose-slate max-w-none">
              {/* Introduction */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  1. Introduction
                </h2>
                <p className="text-slate-700 leading-relaxed mb-4">
                  Welcome to Aroof ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our roofing measurement and contractor management platform.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  By using Aroof, you agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </section>

              {/* Information We Collect */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  2. Information We Collect
                </h2>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">2.1 Information You Provide Directly</h3>
                
                <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-3">For Homeowners:</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Name, email address, phone number</li>
                    <li>• Property address and location coordinates</li>
                    <li>• Roof measurements and property photos</li>
                    <li>• Communication preferences (SMS/email opt-ins)</li>
                    <li>• Payment information (for optional premium reports)</li>
                  </ul>
                </div>

                <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-6 rounded-r-lg">
                  <h4 className="font-bold text-slate-900 mb-3">For Roofing Contractors:</h4>
                  <ul className="space-y-2 text-slate-700">
                    <li>• Business name, contact information, and address</li>
                    <li>• Professional licenses and insurance information</li>
                    <li>• Business details (service areas, specializations)</li>
                    <li>• Payment information for subscriptions and lead purchases</li>
                    <li>• CRM data (customer records, project details, notes)</li>
                    <li>• Employee information (names, roles, access permissions)</li>
                  </ul>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">2.2 Information Collected Automatically</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                  <li>• <strong>Device Information:</strong> IP address, browser type, operating system</li>
                  <li>• <strong>Location Data:</strong> Geolocation from IP address and property addresses entered</li>
                  <li>• <strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, preference cookies</li>
                  <li>• <strong>Google Maps Data:</strong> Satellite imagery, geocoding results, map interactions</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">2.3 Information from Third Parties</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Google Solar API:</strong> Roof area calculations, building footprints, solar potential data</li>
                  <li>• <strong>Google Maps:</strong> Satellite imagery, geocoding, mapping services</li>
                  <li>• <strong>Replicate.com:</strong> AI-generated roof visualizations</li>
                  <li>• <strong>Payment Processors:</strong> Transaction verification and fraud prevention data</li>
                  <li>• <strong>Lead Sources:</strong> Third-party lead generation platforms</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  3. How We Use Your Information
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.1 To Provide and Improve Our Services</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Calculate accurate roof measurements using satellite technology</li>
                  <li>• Generate cost estimates and professional reports</li>
                  <li>• Create AI-powered roof visualizations</li>
                  <li>• Match homeowners with qualified roofing contractors</li>
                  <li>• Process payments and manage subscriptions</li>
                  <li>• Provide customer support and respond to inquiries</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.2 For Communication</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Send appointment reminders and project updates via SMS/email</li>
                  <li>• Notify contractors of new leads and opportunities</li>
                  <li>• Send service updates and platform announcements</li>
                  <li>• Respond to customer service requests</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.3 For Business Operations</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Maintain and improve platform functionality</li>
                  <li>• Conduct analytics and research</li>
                  <li>• Prevent fraud, abuse, and security threats</li>
                  <li>• Comply with legal obligations</li>
                  <li>• Process payments and maintain financial records</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">3.4 For Marketing (With Your Consent)</h3>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• Send promotional offers and platform updates</li>
                  <li>• Display personalized content</li>
                  <li>• Conduct surveys and collect feedback</li>
                </ul>
                <p className="text-slate-600 italic mt-3 ml-4">
                  You can opt out of marketing communications at any time.
                </p>
              </section>

              {/* How We Share Your Information */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  4. How We Share Your Information
                </h2>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.1 With Roofing Contractors</h3>
                <p className="text-slate-700 mb-3">
                  When you request quotes or use our contractor directory, we share:
                </p>
                <ul className="space-y-2 text-slate-700 ml-4 mb-4">
                  <li>• Your name, contact information, and property address</li>
                  <li>• Roof measurements and photos you've uploaded</li>
                  <li>• Project details and preferences</li>
                </ul>
                <p className="text-slate-600 italic ml-4">
                  You control which contractors receive your information through our platform.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.2 With Service Providers</h3>
                <p className="text-slate-700 mb-3">We share data with trusted third parties:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• <strong>Google LLC:</strong> Maps, geocoding, and solar data analysis</li>
                  <li>• <strong>Replicate.com:</strong> AI roof visualization generation</li>
                  <li>• <strong>Payment Processors:</strong> Stripe, PayPal</li>
                  <li>• <strong>Cloud Hosting:</strong> AWS, Google Cloud</li>
                  <li>• <strong>Email/SMS Services:</strong> Twilio, SendGrid</li>
                  <li>• <strong>Analytics:</strong> Google Analytics</li>
                </ul>
                <p className="text-slate-600 italic mt-3 ml-4">
                  These providers are contractually obligated to protect your data.
                </p>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.3 For Legal Compliance</h3>
                <p className="text-slate-700 mb-3">We may disclose information when required by law:</p>
                <ul className="space-y-2 text-slate-700 ml-4">
                  <li>• In response to subpoenas or court orders</li>
                  <li>• To protect our rights, property, or safety</li>
                  <li>• To prevent fraud or investigate violations</li>
                  <li>• In connection with business transfers</li>
                </ul>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 mt-6">4.4 With Your Consent</h3>
                <p className="text-slate-700">
                  We may share information with other parties when you explicitly authorize us to do so.
                </p>
              </section>

              {/* Data Retention */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  5. Data Retention
                </h2>
                <ul className="space-y-3 text-slate-700">
                  <li>• <strong>Homeowner Data:</strong> Retained for 3 years after last activity</li>
                  <li>• <strong>Contractor Data:</strong> Retained for duration of subscription plus 7 years for financial records</li>
                  <li>• <strong>Measurement Records:</strong> Retained for 5 years</li>
                  <li>• <strong>Deleted Data:</strong> Permanently removed within 30 days of deletion request</li>
                </ul>
                <p className="text-slate-600 mt-4">
                  You may request data deletion at any time by contacting <a href="mailto:support@aroof.build" className="text-blue-600 hover:underline font-semibold">support@aroof.build</a>
                </p>
              </section>

              {/* Your Privacy Rights */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  6. Your Privacy Rights
                </h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.1 Access and Portability</h3>
                    <p className="text-slate-700">Request a copy of your personal data in a structured format.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.2 Correction</h3>
                    <p className="text-slate-700">Update or correct inaccurate information through your account settings.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.3 Deletion</h3>
                    <p className="text-slate-700">Request deletion of your personal data (subject to legal retention requirements).</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.4 Opt-Out</h3>
                    <ul className="space-y-2 text-slate-700 ml-4">
                      <li>• <strong>Marketing:</strong> Unsubscribe from promotional emails</li>
                      <li>• <strong>SMS:</strong> Reply STOP to any text message</li>
                      <li>• <strong>Cookies:</strong> Adjust browser settings</li>
                      <li>• <strong>Analytics:</strong> Use Google Analytics opt-out browser add-on</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.5 California Privacy Rights (CCPA)</h3>
                    <p className="text-slate-700">
                      California residents have additional rights including right to know, right to delete, and right to opt-out. We do <strong>NOT</strong> sell personal information.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">6.6 European Privacy Rights (GDPR)</h3>
                    <p className="text-slate-700">
                      EU/EEA residents have rights including access, rectification, erasure, portability, and right to lodge complaints.
                    </p>
                  </div>

                  <p className="text-slate-600 bg-slate-100 p-4 rounded-lg">
                    To exercise your rights, contact us at <a href="mailto:privacy@aroof.build" className="text-blue-600 hover:underline font-semibold">privacy@aroof.build</a>
                  </p>
                </div>
              </section>

              {/* Data Security */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  7. Data Security
                </h2>
                <p className="text-slate-700 mb-4">
                  We implement industry-standard security measures:
                </p>
                <ul className="space-y-3 text-slate-700 ml-4">
                  <li>• <strong>Encryption:</strong> TLS/SSL for data in transit, AES-256 for data at rest</li>
                  <li>• <strong>Access Controls:</strong> Role-based permissions and multi-factor authentication</li>
                  <li>• <strong>Monitoring:</strong> 24/7 security monitoring</li>
                  <li>• <strong>Audits:</strong> Regular security assessments</li>
                  <li>• <strong>Incident Response:</strong> Documented breach notification procedures</li>
                </ul>
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg mt-6">
                  <p className="text-slate-700 italic">
                    No system is 100% secure. We cannot guarantee absolute security.
                  </p>
                </div>
              </section>

              {/* Children's Privacy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  8. Children's Privacy
                </h2>
                <p className="text-slate-700">
                  Aroof is not intended for users under 18 years of age. We do not knowingly collect information from children.
                </p>
              </section>

              {/* International Data Transfers */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  9. International Data Transfers
                </h2>
                <p className="text-slate-700">
                  Our services are based in the United States. If you access Aroof from outside the U.S., your information may be transferred to, stored, and processed in the U.S.
                </p>
              </section>

              {/* Third-Party Links */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  10. Third-Party Links
                </h2>
                <p className="text-slate-700">
                  Our platform may contain links to third-party websites. We are not responsible for their privacy practices.
                </p>
              </section>

              {/* Changes to This Privacy Policy */}
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-slate-900 mb-4 pb-3 border-b-2 border-blue-200">
                  11. Changes to This Privacy Policy
                </h2>
                <p className="text-slate-700">
                  We may update this Privacy Policy periodically. Changes will be posted with an updated date. Material changes will be communicated via email.
                </p>
              </section>

              {/* Contact Us */}
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-6 pb-3 border-b-2 border-blue-200">
                  12. Contact Us
                </h2>
                <div className="bg-gradient-to-br from-blue-50 to-slate-50 border-2 border-blue-200 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Get in Touch</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Email</p>
                        <a href="mailto:privacy@aroof.build" className="text-blue-600 hover:underline font-semibold">
                          privacy@aroof.build
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
                        <p className="text-slate-900 font-semibold">Aroof Privacy Team</p>
                        <p className="text-slate-700">Dallas, TX 75252</p>
                      </div>
                    </div>
                  </div>
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
            <a href="#" className="hover:text-white">Terms of Service</a>
            <span>•</span>
            <a href="mailto:support@aroof.build" className="hover:text-white">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}