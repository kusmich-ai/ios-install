import React from 'react';
import Link from 'next/link';
import { FileText, ChevronRight } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = 'January 4, 2025';
  const version = '1.0';

  const sections = [
    { num: 1, title: 'Definitions' },
    { num: 2, title: 'Nature of Service — Critical Disclaimers' },
    { num: 3, title: 'Eligibility & User Requirements' },
    { num: 4, title: 'Contact Information' },
    { num: 5, title: 'Electronic Consent' },
  ];

  return (
    <div id="top" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-orange-500" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated} • v{version}
              </p>
            </div>
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
              <p className="text-gray-600">H2H Media Group Inc.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Registered Address</p>
              <p className="text-gray-600">460 Doyle Ave. Kelowna, BC. V1Y 0C2</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Effective Date</p>
              <p className="text-gray-600">{lastUpdated}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Contact</p>
              <a
                href="mailto:support@unbecoming.app"
                className="text-orange-500 hover:text-orange-600"
              >
                support@unbecoming.app
              </a>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <nav className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200 print:break-after">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {sections.map((item) => (
              <a
                key={item.num}
                href={`#section-${item.num}`}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="font-semibold text-orange-500">{item.num}.</span>
                <span className="group-hover:text-orange-500 transition-colors">
                  {item.title}
                </span>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </nav>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6 rounded-r-lg">
          <p className="font-bold text-yellow-800">IMPORTANT — READ CAREFULLY BEFORE USE</p>
          <p className="text-yellow-800 text-sm mt-2">
            BY ACCESSING OR USING UNBECOMING, YOU ACKNOWLEDGE THAT YOU HAVE READ,
            UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND ALL ASSOCIATED
            AGREEMENTS.
          </p>
          <p className="text-yellow-800 text-sm font-bold mt-2">
            IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE UNBECOMING.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 prose prose-gray max-w-none">

          {/* Section 1: Definitions */}
          <section id="section-1" className="scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Definitions</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>1.1</strong> &ldquo;System&rdquo; means the UNbecoming platform, including
              all associated software, protocols, AI coaching interfaces, assessment tools,
              and related materials.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>1.2</strong> &ldquo;User&rdquo; or &ldquo;you&rdquo; means any individual accessing
              or using the System.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>1.3</strong> &ldquo;Operator&rdquo; or &ldquo;we&rdquo; means H2H Media Group Inc.
              and its affiliates, officers, directors, employees, and agents.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>1.4</strong> &ldquo;Protocols&rdquo; means the neural and mental practices,
              exercises, and techniques provided through the System.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              <strong>1.5</strong> &ldquo;Stage 7&rdquo; means the Accelerated Expansion tier, which
              requires separate agreement and involves advanced integration techniques.
            </p>
          </section>

          {/* Section 2: Nature of Service */}
          <section id="section-2" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Nature of Service — Critical Disclaimers
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.1 Not Medical or Mental Health Treatment
            </h3>
            <p className="font-bold text-gray-800 mb-2">UNBECOMING IS NOT:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>Medical treatment, diagnosis, or therapy</li>
              <li>Mental health counseling or psychotherapy</li>
              <li>A substitute for professional medical or psychiatric care</li>
              <li>A treatment for any medical or psychological condition</li>
              <li>Supervised by licensed healthcare professionals</li>
            </ul>
            <p className="font-bold text-gray-800 mb-2">UNBECOMING IS:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>An educational self-development program</li>
              <li>A personal optimization protocol</li>
              <li>A training system for attention, regulation, and performance</li>
              <li>Designed for generally healthy individuals seeking performance enhancement</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.2 AI Coaching Limitations
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The System uses artificial intelligence to provide coaching and guidance. You
              acknowledge that:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>AI cannot replace human clinical judgment</li>
              <li>AI may provide inaccurate or inappropriate guidance</li>
              <li>AI cannot detect all crisis situations or contraindications</li>
              <li>You are solely responsible for determining appropriateness of practices</li>
              <li>AI responses are not medical, therapeutic, or professional advice</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.3 No Professional Relationship
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Use of UNbecoming does not establish a doctor-patient, therapist-client,
              counselor-client, or any other professional relationship between you and
              UNbecoming, its operators, contributors, or AI systems. Nothing in the System
              should be construed as creating such a relationship.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.4 Voluntary Participation
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Your participation is entirely voluntary. You may discontinue use of UNbecoming
              at any time, for any reason, without notice. Skipping any practice, exercise, or
              prompt is permitted at any point.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
              2.5 Suitability & Contraindications
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The practices offered through UNbecoming may not be appropriate for everyone.
              In particular, you should consult a qualified healthcare professional before
              using UNbecoming if you have or suspect any of the following:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
              <li>A diagnosed psychiatric condition (including but not limited to PTSD, psychotic disorders, dissociative disorders, severe depression or anxiety)</li>
              <li>A history of serious cardiovascular, respiratory, or neurological conditions</li>
              <li>Recent surgery, injury, or any condition affected by deep breathing or focused attention practices</li>
              <li>Pregnancy</li>
              <li>Active substance dependency</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-3">
              You are solely responsible for determining whether any practice is appropriate
              for your circumstances. If you experience adverse effects, discontinue use
              immediately and consult a qualified professional.
            </p>
          </section>

          {/* Section 3: Eligibility */}
          <section id="section-3" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Eligibility & User Requirements
            </h2>

            <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">3.1 Age Requirement</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              You must be at least 18 years old to use this System. By accessing the System,
              you represent and warrant that you are 18 years of age or older.
            </p>
          </section>

          {/* Section 4: Contact */}
          <section id="section-4" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Contact Information</h2>
            <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
              <div className="space-y-2 text-gray-800">
                <p>
                  <strong>Company:</strong> H2H Media Group Inc.
                </p>
                <p>
                  <strong>Address:</strong> 460 Doyle Ave. Kelowna, BC. V1Y 0C2
                </p>
                <p>
                  <strong>General:</strong>{' '}
                  <a
                    href="mailto:support@unbecoming.app"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    support@unbecoming.app
                  </a>
                </p>
                <p>
                  <strong>Legal:</strong>{' '}
                  <a
                    href="mailto:legal@unbecoming.app"
                    className="text-orange-600 hover:text-orange-700"
                  >
                    legal@unbecoming.app
                  </a>
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Electronic Consent */}
          <section id="section-5" className="scroll-mt-20 mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Electronic Consent</h2>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
              <p className="font-bold text-green-800">ELECTRONIC CONSENT</p>
              <p className="text-green-800 text-sm mt-2">
                Your acceptance via checkbox and button click constitutes your legally binding
                electronic signature on these Terms of Service. This electronic acceptance is
                equivalent to a handwritten signature and will be recorded with a timestamp for
                our records.
              </p>
            </div>
          </section>

          {/* Final Acknowledgment */}
          <section className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-gray-100 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Acknowledgment</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using UNbecoming, you acknowledge that you have read, understood, and
                agree to these Terms of Service.
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
                  <a
                    href="mailto:support@unbecoming.app"
                    className="text-orange-500 hover:text-orange-600"
                  >
                    support@unbecoming.app
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Back to Top */}
        <div className="mt-8 text-center print:hidden">
          <a
            href="#top"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            <span>Back to Top</span>
          </a>
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
              <Link
                href="/privacy"
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
