import React from 'react';
import Link from 'next/link';
import { FileText, Download, ChevronRight } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "November 15, 2025";
  const version = "1.0";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm print:static">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-orange-500" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
                <p className="text-sm text-gray-500">
                  Last updated: {lastUpdated} • v{version}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors print:hidden"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Company Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-gray-700">Operator</p>
              <p className="text-gray-600">H2H Media Group</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Contact</p>
              <a href="mailto:hello@h2hmediagroup.com" className="text-orange-500 hover:text-orange-600">
                hello@h2hmediagroup.com
              </a>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Effective Date</p>
              <p className="text-gray-600">November 15, 2025</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Data Location</p>
              <p className="text-gray-600">US East (N. Virginia)</p>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200 print:break-after-page">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { num: 1, title: "Introduction & Scope" },
              { num: 2, title: "Information We Collect" },
              { num: 3, title: "How We Use Your Information" },
              { num: 4, title: "Legal Basis for Processing (GDPR)" },
              { num: 5, title: "Data Storage & Security" },
              { num: 6, title: "Data Sharing & Disclosure" },
              { num: 7, title: "International Data Transfers" },
              { num: 8, title: "Your Privacy Rights" },
              { num: 9, title: "Data Retention" },
              { num: 10, title: "Cookies & Tracking Technologies" },
              { num: 11, title: "Children's Privacy" },
              { num: 12, title: "Changes to This Policy" },
              { num: 13, title: "Contact Information" },
              { num: 14, title: "Cookie Policy" },
              { num: 15, title: "Health Information Privacy" },
              { num: 16, title: "California Privacy Rights (CCPA)" },
            ].map((item) => (
              <a
                key={item.num}
                href={`#section-${item.num}`}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="font-semibold text-orange-500">{item.num}.</span>
                <span className="group-hover:text-orange-500 transition-colors">{item.title}</span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </nav>

        {/* Policy Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 prose prose-gray max-w-none">
          
          {/* Section 1: Introduction & Scope */}
          <section id="section-1" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction & Scope</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.1 Our Commitment to Privacy</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The IOS System collects and processes sensitive personal information, including health-related data and mental state information. 
              We take your privacy extremely seriously and are committed to protecting your personal information.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy explains:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>What information we collect</li>
              <li>Why we collect it</li>
              <li>How we use, store, and protect it</li>
              <li>Your rights and choices regarding your information</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.2 Who This Policy Applies To</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              This Privacy Policy applies to all users of the IOS System, regardless of location.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <p className="font-semibold text-blue-900 mb-2">For Canadian Users:</p>
              <p className="text-blue-800 text-sm">This policy complies with Canada's Personal Information Protection and Electronic Documents Act (PIPEDA).</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
              <p className="font-semibold text-purple-900 mb-2">For European Union Users:</p>
              <p className="text-purple-800 text-sm">This policy complies with the General Data Protection Regulation (GDPR). You have enhanced rights described in Section 8.</p>
            </div>
            <div className="bg-gray-50 border-l-4 border-gray-500 p-4 mb-4">
              <p className="font-semibold text-gray-900 mb-2">For Users in Other Jurisdictions:</p>
              <p className="text-gray-800 text-sm">Local privacy laws may provide additional protections. This policy provides our baseline privacy protections globally.</p>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">1.3 Acceptance of This Policy</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By using the IOS System, you consent to the collection, use, and processing of your information as described in this Privacy Policy.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-900 font-semibold">
                If you do not agree with this Privacy Policy, do not use the IOS System.
              </p>
            </div>
          </section>

          {/* Section 2: Information We Collect */}
          <section id="section-2" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.1 Information You Provide Directly</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Account Information:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Name (full legal name)</li>
                <li>Email address</li>
                <li>Date of birth / Age</li>
                <li>Country of residence</li>
                <li>Emergency contact information</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Medical & Psychiatric Information:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Mental health diagnoses and history</li>
                <li>Physical health conditions</li>
                <li>Current medications (names, dosages, prescribers)</li>
                <li>Substance use history</li>
                <li>Healthcare provider information</li>
                <li>Medical screening questionnaire responses</li>
                <li>Professional reference information (Stage 7)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Baseline Assessment Data:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Calm Core Assessment (perceived stress)</li>
                <li>Observer Index (decentering/meta-awareness)</li>
                <li>Vitality Index (positive affect)</li>
                <li>Focus Diagnostic (attentional control)</li>
                <li>Presence Test (breath counting performance)</li>
                <li>REwired Index scores</li>
                <li>Domain scores (Regulation, Awareness, Outlook, Attention)</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Daily Practice & Performance Data:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Practice completion logs (adherence tracking)</li>
                <li>Self-reported ratings (calm, focus, energy)</li>
                <li>Weekly delta scores</li>
                <li>Stage progression data</li>
                <li>Unlock eligibility metrics</li>
              </ul>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Reflections & Communications:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Daily check-in responses</li>
                <li>Reflection journal entries</li>
                <li>Nightly debrief insights</li>
                <li>Meta-reflection responses</li>
                <li>Identity selections and micro-actions</li>
                <li>Flow block descriptions and performance tags</li>
                <li>AI coach conversation logs</li>
                <li>Communication with support team</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.2 Information Collected Automatically</h3>
            
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Usage Data:</h4>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Login times and frequency</li>
                <li>Features accessed</li>
                <li>Time spent on platform</li>
                <li>Interaction patterns with AI coach</li>
                <li>Device type and browser</li>
                <li>IP address</li>
                <li>Session duration</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.3 Information from Third Parties</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">Payment Processor (Stripe):</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li>Payment confirmation</li>
                <li>Billing address</li>
                <li>Transaction history</li>
                <li>We do NOT store credit card information</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-gray-800 mb-2">Email Service (Resend):</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1 text-sm">
                <li>Email delivery status</li>
                <li>Open and click tracking (anonymized)</li>
              </ul>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">2.4 Information We Do NOT Collect</h3>
            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <p className="font-semibold text-green-900 mb-2">We do NOT collect:</p>
              <ul className="list-disc pl-6 text-green-800 space-y-1 text-sm">
                <li>Government-issued ID numbers (SSN, SIN, passport numbers)</li>
                <li>Credit card information (handled by payment processor)</li>
                <li>Precise geolocation data</li>
                <li>Biometric data (fingerprints, facial recognition)</li>
                <li>Genetic or biological samples</li>
              </ul>
            </div>
          </section>

          {/* Simplified sections for remaining content - you can expand these as needed */}
          
          <section id="section-3" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use your information to provide and operate the IOS System, ensure safety, communicate with you, 
              improve our services, and comply with legal obligations.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="font-semibold text-yellow-900 mb-2">Important:</p>
              <p className="text-yellow-800 text-sm">
                We do NOT sell your personal information to third parties or use your health data for advertising purposes.
              </p>
            </div>
          </section>

          <section id="section-4" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              For EU users, we process your data based on: explicit consent, contractual necessity, legitimate interests, 
              legal obligations, and vital interests.
            </p>
          </section>

          <section id="section-5" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Storage & Security</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900 mb-2">Primary Storage:</p>
              <ul className="list-disc pl-6 text-blue-800 space-y-1 text-sm">
                <li><strong>Platform:</strong> Supabase (cloud database)</li>
                <li><strong>Infrastructure:</strong> AWS (Amazon Web Services)</li>
                <li><strong>Location:</strong> US East (N. Virginia)</li>
                <li><strong>Security:</strong> Encryption at rest and in transit</li>
              </ul>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-2">⚠️ Security Limitations:</p>
              <p className="text-red-800 text-sm">
                No system is 100% secure. By using the IOS System, you acknowledge and accept inherent security risks 
                associated with internet-based platforms.
              </p>
            </div>
          </section>

          <section id="section-6" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing & Disclosure</h2>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <p className="font-semibold text-green-900 text-lg mb-2">We Do NOT Sell Your Data</p>
              <p className="text-green-800 text-sm">
                We do not sell, rent, or trade your personal information to third parties for their marketing purposes.
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We share data only with trusted service providers (Supabase, AWS, Stripe, Resend, Anthropic) who are 
              contractually obligated to protect your information.
            </p>
          </section>

          <section id="section-7" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data may be transferred to and processed in the United States (US East N. Virginia data center). 
              We implement appropriate safeguards including Standard Contractual Clauses for EU users.
            </p>
          </section>

          <section id="section-8" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Your Privacy Rights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Right to Access</h4>
                <p className="text-gray-700 text-sm">Request a copy of your personal data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Right to Correction</h4>
                <p className="text-gray-700 text-sm">Request correction of inaccurate data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Right to Deletion</h4>
                <p className="text-gray-700 text-sm">Request deletion of your personal data</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Right to Object</h4>
                <p className="text-gray-700 text-sm">Object to certain processing activities</p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To exercise your rights, contact us at{' '}
              <a href="mailto:hello@h2hmediagroup.com" className="text-orange-500 hover:text-orange-600 font-semibold">
                hello@h2hmediagroup.com
              </a>
            </p>
          </section>

          <section id="section-9" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We retain your data only as long as necessary. Account data is deleted 30 days after closure, 
              with permanent deletion (including backups) within 90 days.
            </p>
          </section>

          <section id="section-10" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies & Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use essential cookies for authentication and functionality, plus optional analytics cookies. 
              See Section 14 for detailed Cookie Policy.
            </p>
          </section>

          <section id="section-11" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Children's Privacy</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 mb-2">Age Restriction:</p>
              <p className="text-red-800">
                The IOS System is NOT intended for individuals under 18 years of age. 
                We do not knowingly collect information from children under 18.
              </p>
            </div>
          </section>

          <section id="section-12" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this policy from time to time. Material changes will be communicated via email 
              at least 30 days in advance.
            </p>
          </section>

          <section id="section-13" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6">
              <h3 className="font-bold text-orange-900 text-lg mb-4">Privacy Contact</h3>
              <div className="space-y-2 text-gray-800">
                <p><strong>Email:</strong> <a href="mailto:hello@h2hmediagroup.com" className="text-orange-600 hover:text-orange-700">hello@h2hmediagroup.com</a></p>
                <p><strong>Company:</strong> H2H Media Group</p>
                <p><strong>Response Time:</strong> 48 hours for inquiries, 30 days for formal requests</p>
              </div>
            </div>
          </section>

          <section id="section-14" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Cookie Policy</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Cookies are small text files stored on your device. We use essential cookies for authentication 
              and optional analytics cookies to improve our service.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Cookie Reference Table</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Cookie Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Purpose</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Essential?</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">sb-auth-token</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Authentication</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Session</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Yes</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">sb-refresh-token</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Session refresh</td>
                    <td className="px-4 py-3 text-sm text-gray-700">7 days</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Yes</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">user-preferences</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Store settings</td>
                    <td className="px-4 py-3 text-sm text-gray-700">1 year</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Yes</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">_analytics_session</td>
                    <td className="px-4 py-3 text-sm text-gray-700">Usage statistics</td>
                    <td className="px-4 py-3 text-sm text-gray-700">2 years</td>
                    <td className="px-4 py-3 text-sm"><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">No</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="section-15" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Health Information Privacy & HIPAA-Style Protections</h2>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 mb-6">
              <p className="font-semibold text-purple-900 mb-2">HIPAA-Inspired Protections</p>
              <p className="text-purple-800 text-sm">
                While H2H Media Group is not a HIPAA-covered entity under US law (we are a Canadian corporation 
                providing wellness coaching, not healthcare services), we voluntarily adopt HIPAA-inspired protections 
                to ensure your health information receives the highest standard of privacy and security.
              </p>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Health Information We Collect</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
              <li><strong>Mental Health:</strong> Self-reported history, current status, emotional tracking</li>
              <li><strong>Physical Health:</strong> Medications, conditions, sleep patterns, HRV data</li>
              <li><strong>Behavioral Health:</strong> Practice adherence, assessments, reflections</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Security Safeguards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Administrative</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Privacy training</li>
                  <li>• Risk assessments</li>
                  <li>• Incident response</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Technical</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• AES-256 encryption</li>
                  <li>• TLS 1.3 in transit</li>
                  <li>• Access logging</li>
                </ul>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Physical</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• AWS data centers</li>
                  <li>• Access restrictions</li>
                  <li>• Secure disposal</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="section-16" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. California Privacy Rights (CCPA)</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              California residents have additional rights under the CCPA including rights to know, delete, correct, 
              and opt-out of sale (though we do not sell personal information).
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <p className="font-semibold text-blue-900 mb-2">Exercise Your CCPA Rights:</p>
              <p className="text-blue-800 text-sm">
                Email <a href="mailto:hello@h2hmediagroup.com" className="text-blue-600 hover:text-blue-700 font-semibold">hello@h2hmediagroup.com</a> with 
                "California Privacy Rights" in the subject line. We will respond within 45 days.
              </p>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Acknowledgment</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using the IOS System, you acknowledge that you have read, understood, and agree to this Privacy Policy, 
                including the Cookie Policy and Health Information Privacy practices described herein.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold">Last Updated</p>
                  <p>{lastUpdated}</p>
                </div>
                <div>
                  <p className="font-semibold">Version</p>
                  <p>{version}</p>
                </div>
                <div>
                  <p className="font-semibold">Contact</p>
                  <a href="mailto:hello@h2hmediagroup.com" className="text-orange-500 hover:text-orange-600">
                    hello@h2hmediagroup.com
                  </a>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Back to Top Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <span>Back to Top</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600">
              <p>© 2025 H2H Media Group. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/contact" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 1.5cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:static {
            position: static !important;
          }
          
          .print\\:break-after-page {
            page-break-after: always;
          }
          
          h2 {
            page-break-after: avoid;
          }
          
          h3, h4 {
            page-break-after: avoid;
          }
          
          section {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
