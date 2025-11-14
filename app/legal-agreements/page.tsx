'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LegalAgreements() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'tos' | 'consent'>('tos');
  const [tosAccepted, setTosAccepted] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canProceed = tosAccepted && consentAccepted;

  const handleAccept = async () => {
    if (!canProceed) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Store legal acceptance with timestamp
      const { error: dbError } = await supabase
        .from('legal_acceptances')
        .insert({
          user_id: user.id,
          tos_accepted: true,
          tos_accepted_at: new Date().toISOString(),
          consent_accepted: true,
          consent_accepted_at: new Date().toISOString(),
          tos_version: '1.0',
          consent_version: '1.0'
        });

      if (dbError) throw dbError;

      // Mark onboarding step complete
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({ 
          legal_agreements_accepted: true,
          legal_acceptance_date: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Proceed to baseline assessment
      router.push('/baseline');
    } catch (err) {
      console.error('Error accepting agreements:', err);
      setError('Failed to save your acceptance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Legal Agreements
          </h1>
          <p className="text-slate-300 text-lg">
            Please review and accept both documents to continue
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('tos')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'tos'
                ? 'bg-[#ff9e19] text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Terms of Service
            {tosAccepted && <span className="ml-2">✓</span>}
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'consent'
                ? 'bg-[#ff9e19] text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            Informed Consent
            {consentAccepted && <span className="ml-2">✓</span>}
          </button>
        </div>

        {/* Document Display */}
<div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
  <div className="h-[500px] overflow-y-auto p-8 prose prose-gray max-w-none text-gray-800">
    {activeTab === 'tos' ? <TermsOfService /> : <InformedConsent />}
  </div>
</div>

        {/* Acceptance Checkboxes */}
        <div className="bg-slate-800 rounded-lg p-6 mb-6">
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={tosAccepted}
                onChange={(e) => setTosAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-slate-800"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors">
                I have read and agree to the <strong>Terms of Service</strong>. I understand this is NOT medical or mental health treatment and that I am responsible for consulting appropriate professionals regarding any health conditions.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-slate-600 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-slate-800"
              />
              <span className="text-slate-300 group-hover:text-white transition-colors">
                I have read and agree to the <strong>Informed Consent & Assumption of Risk Agreement</strong>. I acknowledge and voluntarily assume all risks described, and I agree to seek professional help for any medical or psychiatric concerns.
              </span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 py-4 px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
          >
            Back
          </button>
          <button
            onClick={handleAccept}
            disabled={!canProceed || isSubmitting}
            className="flex-1 py-4 px-6 bg-[#ff9e19] hover:bg-[#ff8800] disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
          >
            {isSubmitting ? 'Processing...' : 'Accept & Continue to Baseline'}
          </button>
        </div>

        {/* Helper Text */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Both agreements must be accepted to proceed. Your acceptance will be recorded with a timestamp.
        </p>
      </div>
    </div>
  );
}

// Terms of Service Component
function TermsOfService() {
  return (
        <div className="text-gray-800">
      <h1 className="text-gray-900">INTEGRATED OPERATING SYSTEM (IOS) - TERMS OF SERVICE</h1>
      {/* rest of content */}
    </div>
  );
}
    <>
      <h1>INTEGRATED OPERATING SYSTEM (IOS) - TERMS OF SERVICE</h1>
      <p className="text-sm text-slate-600">
        Effective Date: Jan 4 2025<br />
        Last Updated: Jan 4 2025<br />
        Operator: H2H Media Group<br />
        Registered Address: 460 Doyle Ave. Kelowna, BC. V1Y 0C2
      </p>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-6">
        <p className="font-bold text-yellow-800">IMPORTANT - READ CAREFULLY BEFORE USE</p>
        <p className="text-yellow-800 text-sm mt-2">
          BY ACCESSING OR USING THE IOS SYSTEM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND ALL ASSOCIATED AGREEMENTS.
        </p>
        <p className="text-yellow-800 text-sm font-bold mt-2">
          IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SYSTEM.
        </p>
      </div>

      <h2>1. DEFINITIONS</h2>
      <p><strong>1.1</strong> "System" or "IOS" means the Integrated Operating System, including all associated software, protocols, AI coaching interfaces, assessment tools, and related materials.</p>
      <p><strong>1.2</strong> "User" or "you" means any individual accessing or using the System.</p>
      <p><strong>1.3</strong> "Operator" or "we" means [Your Canadian Corporation Name] and its affiliates, officers, directors, employees, and agents.</p>
      <p><strong>1.4</strong> "Protocols" means the neural and mental practices, exercises, and techniques provided through the System.</p>
      <p><strong>1.5</strong> "Stage 7" means the Accelerated Expansion tier, which requires separate agreement and involves advanced integration techniques.</p>

      <h2>2. NATURE OF SERVICE - CRITICAL DISCLAIMERS</h2>
      <h3>2.1 NOT MEDICAL OR MENTAL HEALTH TREATMENT</h3>
      <p className="font-bold">THE IOS SYSTEM IS NOT:</p>
      <ul>
        <li>Medical treatment, diagnosis, or therapy</li>
        <li>Mental health counseling or psychotherapy</li>
        <li>A substitute for professional medical or psychiatric care</li>
        <li>A treatment for any medical or psychological condition</li>
        <li>Supervised by licensed healthcare professionals (Stages 1-6)</li>
      </ul>
      
      <p className="font-bold">THE IOS SYSTEM IS:</p>
      <ul>
        <li>An educational self-development program</li>
        <li>A personal optimization protocol</li>
        <li>A training system for attention, regulation, and performance</li>
        <li>Designed for generally healthy individuals seeking performance enhancement</li>
      </ul>

      <h3>2.2 NO DOCTOR-PATIENT OR THERAPIST-CLIENT RELATIONSHIP</h3>
      <p>No doctor-patient, therapist-client, or healthcare provider relationship is created by using this System. The AI coach is not a licensed mental health professional, medical doctor, or therapist.</p>

      <h3>2.3 REQUIREMENT TO CONSULT PROFESSIONALS</h3>
      <p>You are solely responsible for consulting appropriate licensed professionals regarding:</p>
      <ul>
        <li>Any medical conditions or concerns</li>
        <li>Any mental health conditions or concerns</li>
        <li>Medication interactions or contraindications</li>
        <li>Suitability of practices for your individual circumstances</li>
      </ul>
      <p className="font-bold">THE SYSTEM DOES NOT PROVIDE MEDICAL ADVICE. All decisions regarding your health and well-being are YOUR responsibility.</p>

      <h2>3. ELIGIBILITY & USER REPRESENTATIONS</h2>
      <h3>3.1 Age Requirement</h3>
      <p>You must be at least 18 years of age to use this System. By using the System, you represent and warrant that you are 18 or older.</p>

      <h3>3.2 Mental Health Requirements</h3>
      <p>By using this System, you represent and warrant that you:</p>
      <p className="font-bold">✓ Do NOT currently have:</p>
      <ul>
        <li>Active suicidal or self-harm ideation</li>
        <li>Active psychosis or hallucinations</li>
        <li>Severe untreated psychiatric conditions</li>
        <li>Recent psychiatric hospitalization (within 6 months)</li>
        <li>Acute mental health crisis requiring immediate intervention</li>
      </ul>

      <p className="font-bold">✓ Have consulted with a licensed healthcare provider if you have:</p>
      <ul>
        <li>Any diagnosed mental health condition</li>
        <li>Any prescribed psychiatric medication</li>
        <li>History of psychotic episodes, mania, or severe dissociation</li>
        <li>Post-traumatic stress disorder (PTSD) or complex trauma</li>
        <li>Severe anxiety, panic disorder, or depression</li>
      </ul>

      <h3>3.3 Medical Requirements</h3>
      <p>By using this System, you represent and warrant that you:</p>
      <p className="font-bold">✓ Do NOT currently have (or have consulted a physician regarding):</p>
      <ul>
        <li>Severe cardiovascular disease or recent cardiac events</li>
        <li>Uncontrolled hypertension</li>
        <li>Epilepsy or seizure disorders</li>
        <li>Pregnancy (for certain practices)</li>
        <li>Any condition contraindicated for breathwork, cold exposure, or sustained attention exercises</li>
      </ul>

      <p className="font-bold">✓ Will consult appropriate medical professionals before engaging in:</p>
      <ul>
        <li>Breathwork practices (if you have respiratory conditions)</li>
        <li>Cold exposure protocols (if you have cardiovascular concerns)</li>
        <li>Any practice that may interact with your medical conditions or medications</li>
      </ul>

      <h3>3.4 Screening Requirement</h3>
      <p>Prior to first use, you must complete the Medical/Psychiatric Screening Questionnaire honestly and accurately. Providing false information may result in immediate termination of access and potential harm to yourself.</p>

      <h2>4. ASSUMPTION OF RISK</h2>
      <h3>4.1 Voluntary Participation</h3>
      <p>Your participation in the IOS System is entirely voluntary. You acknowledge and accept all risks associated with:</p>
      <ul>
        <li>Breathwork and respiratory exercises</li>
        <li>Meditation and awareness practices</li>
        <li>Physical movement protocols</li>
        <li>Cold and heat exposure (if applicable)</li>
        <li>Sustained attention training</li>
        <li>Psychological inquiry and self-reflection practices</li>
        <li>Identity and belief examination techniques</li>
      </ul>

      <h3>4.2 Known Risks</h3>
      <p>You acknowledge awareness of potential risks, including but not limited to:</p>
      <p className="font-bold">Psychological Risks:</p>
      <ul>
        <li>Temporary increase in anxiety or emotional distress</li>
        <li>Surfacing of difficult memories or emotions</li>
        <li>Psychological destabilization if practices are misapplied</li>
        <li>Discomfort during decentering or identity inquiry practices</li>
        <li>Increased awareness of distressing thought patterns</li>
      </ul>

      <p className="font-bold">Physical Risks:</p>
      <ul>
        <li>Lightheadedness, dizziness, or hyperventilation from breathwork</li>
        <li>Cardiovascular stress from cold exposure</li>
        <li>Muscle strain from movement practices</li>
        <li>Fatigue from sustained attention training</li>
        <li>Exacerbation of pre-existing conditions</li>
      </ul>

      <h3>4.3 Assumption of All Risks</h3>
      <p className="font-bold">YOU EXPRESSLY ASSUME ALL RISKS, KNOWN AND UNKNOWN, ARISING FROM YOUR USE OF THE SYSTEM.</p>
      <p>You acknowledge that the Operator has recommended consulting with licensed professionals and that you bear sole responsibility for any consequences of choosing to proceed without such consultation.</p>

      <h2>5. LIMITATIONS OF LIABILITY</h2>
      <h3>5.1 Maximum Liability</h3>
      <p className="font-bold">TO THE FULLEST EXTENT PERMITTED BY LAW, THE OPERATOR'S TOTAL LIABILITY FOR ANY CLAIMS ARISING FROM YOUR USE OF THE SYSTEM SHALL NOT EXCEED THE AMOUNT YOU PAID FOR ACCESS TO THE SYSTEM IN THE 12 MONTHS PRECEDING THE CLAIM.</p>

      <h3>5.2 Exclusion of Consequential Damages</h3>
      <p className="font-bold">THE OPERATOR SHALL NOT BE LIABLE FOR:</p>
      <ul>
        <li>Indirect, incidental, special, consequential, or punitive damages</li>
        <li>Psychological harm, emotional distress, or mental suffering</li>
        <li>Physical injury or medical complications</li>
        <li>Lost profits, lost data, or lost opportunities</li>
        <li>Damage to relationships or reputation</li>
        <li>Any harm arising from practices performed outside System guidelines</li>
        <li>Any harm arising from failure to seek appropriate professional care</li>
      </ul>

      <h3>5.3 No Warranties</h3>
      <p>THE SYSTEM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF:</p>
      <ul>
        <li>Merchantability or fitness for a particular purpose</li>
        <li>Non-infringement</li>
        <li>Accuracy, reliability, or completeness of content</li>
        <li>Specific results or outcomes</li>
      </ul>

      <h3>5.4 Acknowledgment of Limitations</h3>
      <p>You acknowledge that:</p>
      <ul>
        <li>Individual responses to practices vary significantly</li>
        <li>The System cannot guarantee any specific outcome</li>
        <li>The AI coach operates within programmatic limitations and may not detect all crisis situations</li>
        <li>Technical errors, glitches, or data loss may occur</li>
        <li>The System is not a substitute for professional judgment</li>
      </ul>

      <h2>6. USER OBLIGATIONS</h2>
      <h3>6.1 Honest Disclosure</h3>
      <p>You agree to:</p>
      <ul>
        <li>Provide accurate information during screening and assessments</li>
        <li>Update your status if medical or psychiatric conditions change</li>
        <li>Immediately discontinue use if contraindicated symptoms emerge</li>
        <li>Seek professional help if experiencing crisis or severe distress</li>
      </ul>

      <h3>6.2 Responsible Use</h3>
      <p>You agree to:</p>
      <ul>
        <li>Follow all safety guidelines provided by the System</li>
        <li>Not exceed recommended practice durations or intensities</li>
        <li>Discontinue any practice that causes pain, distress, or adverse effects</li>
        <li>Not rely on the System for emergency mental health support</li>
        <li>Use crisis resources (988 Suicide & Crisis Lifeline, local emergency services) if needed</li>
      </ul>

      <h3>6.3 Prohibited Uses</h3>
      <p>You agree NOT to:</p>
      <ul>
        <li>Use the System as a substitute for professional medical or mental health treatment</li>
        <li>Proceed with practices contraindicated for your conditions</li>
        <li>Share your account or allow others to use the System under your credentials</li>
        <li>Use the System while under the influence of substances that impair judgment</li>
        <li>Attempt to reverse engineer, hack, or manipulate System functionality</li>
        <li>Misrepresent your eligibility or medical/psychiatric status</li>
      </ul>

      <h2>7. CRISIS PROTOCOLS</h2>
      <h3>7.1 System Limitations</h3>
      <p className="font-bold">THE SYSTEM IS NOT DESIGNED FOR CRISIS INTERVENTION.</p>
      <p>The AI coach is programmed to recognize certain crisis indicators, but it:</p>
      <ul>
        <li>Cannot replace human clinical judgment</li>
        <li>May fail to detect all crisis situations</li>
        <li>Cannot provide emergency intervention</li>
        <li>Is not monitored 24/7 by human professionals</li>
      </ul>

      <h3>7.2 Emergency Resources</h3>
      <p>If you are experiencing a mental health crisis:</p>
      <p className="font-bold">Immediate Danger:</p>
      <ul>
        <li>Call 911 (US/Canada) or local emergency services</li>
        <li>Go to nearest emergency room</li>
      </ul>
      <p className="font-bold">Suicidal Thoughts or Crisis:</p>
      <ul>
        <li>National Suicide Prevention Lifeline: 988 (US)</li>
        <li>Crisis Text Line: Text HOME to 741741</li>
        <li>Canada Suicide Prevention Service: 1-833-456-4566</li>
      </ul>
      <p className="font-bold">International:</p>
      <ul>
        <li>International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/</li>
      </ul>

      <h3>7.3 Discontinuation Requirement</h3>
      <p>You agree to immediately discontinue use and seek professional help if you experience:</p>
      <ul>
        <li>Suicidal or self-harm thoughts</li>
        <li>Psychotic symptoms (hallucinations, delusions)</li>
        <li>Severe anxiety or panic attacks</li>
        <li>Dissociation or depersonalization</li>
        <li>Severe emotional destabilization</li>
        <li>Any other acute psychiatric symptoms</li>
      </ul>

      <h2>8. DATA & PRIVACY</h2>
      <h3>8.1 Data Collection</h3>
      <p>The System collects and stores:</p>
      <ul>
        <li>Assessment responses and baseline scores</li>
        <li>Daily practice adherence data</li>
        <li>Self-reported ratings and reflections</li>
        <li>Performance metrics</li>
        <li>AI conversation logs</li>
      </ul>

      <h3>8.2 Data Use</h3>
      <p>Your data is used to:</p>
      <ul>
        <li>Track your progress through stages</li>
        <li>Provide personalized coaching</li>
        <li>Calculate metrics and unlock eligibility</li>
        <li>Improve System functionality</li>
      </ul>

      <h3>8.3 Data Security</h3>
      <p>Data is stored on secure cloud infrastructure (Supabase). While we implement industry-standard security measures, no system is 100% secure. You acknowledge the inherent risks of internet-based data storage.</p>

      <h3>8.4 Full Privacy Policy</h3>
      <p>Complete data handling practices are detailed in our separate Privacy Policy, which is incorporated by reference into these Terms.</p>

      <h2>9. STAGE 7 - ACCELERATED EXPANSION</h2>
      <h3>9.1 Separate Agreement Required</h3>
      <p>Access to Stage 7 requires:</p>
      <ul>
        <li>Completion of Stages 1-6 with demonstrated competence</li>
        <li>Submission and approval of written application</li>
        <li>Execution of separate Stage 7 Addendum agreement</li>
        <li>Additional medical clearances as required</li>
      </ul>

      <h3>9.2 Stage 7 Scope</h3>
      <p>Stage 7 may involve:</p>
      <ul>
        <li>Advanced neural optimization protocols</li>
        <li>Discussion of supplementation and nootropics</li>
        <li>Neurofeedback and brain entrainment technologies</li>
        <li>Integration protocols (which may reference, but do not provide, access to controlled substances)</li>
      </ul>

      <h3>9.3 No Provision of Controlled Substances</h3>
      <p className="font-bold">THE SYSTEM DOES NOT:</p>
      <ul>
        <li>Provide, prescribe, or recommend controlled substances</li>
        <li>Facilitate access to illegal substances</li>
        <li>Supervise or guide use of any controlled substances</li>
        <li>Replace medical supervision for any substance use</li>
      </ul>
      <p>Any information provided is educational only and does not constitute medical advice.</p>

      <h2>10. MODIFICATIONS & TERMINATION</h2>
      <h3>10.1 Right to Modify</h3>
      <p>We reserve the right to modify these Terms at any time. Continued use after modifications constitutes acceptance of revised Terms.</p>

      <h3>10.2 Right to Terminate</h3>
      <p>We may terminate or suspend your access immediately if:</p>
      <ul>
        <li>You violate these Terms</li>
        <li>You provide false information during screening</li>
        <li>Continued use poses risk to you or others</li>
        <li>Required for legal or safety reasons</li>
      </ul>

      <h3>10.3 No Refund Upon Termination</h3>
      <p>Fees paid are non-refundable if access is terminated for Terms violations.</p>

      <h2>11. INDEMNIFICATION</h2>
      <p>You agree to indemnify, defend, and hold harmless the Operator and its affiliates from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:</p>
      <ul>
        <li>Your use or misuse of the System</li>
        <li>Your violation of these Terms</li>
        <li>Your violation of any third-party rights</li>
        <li>Any false or misleading information you provide</li>
        <li>Any harm resulting from your failure to seek appropriate professional care</li>
      </ul>

      <h2>12. DISPUTE RESOLUTION</h2>
      <h3>12.1 Governing Law</h3>
      <p>These Terms are governed by the laws of British Columbia, Canada, without regard to conflict of law principles.</p>

      <h3>12.2 Arbitration Agreement</h3>
      <p>Any dispute arising from these Terms or use of the System shall be resolved through binding arbitration in accordance with Canadian Arbitration Association Rules.</p>
      <p className="font-bold">YOU WAIVE YOUR RIGHT TO:</p>
      <ul>
        <li>Jury trial</li>
        <li>Court litigation</li>
        <li>Class action participation</li>
      </ul>

      <h3>12.3 Exception for Emergency Relief</h3>
      <p>Either party may seek emergency injunctive relief in court if necessary to prevent immediate harm.</p>

      <h2>13. SEVERABILITY</h2>
      <p>If any provision of these Terms is found unenforceable, the remaining provisions remain in full force and effect.</p>

      <h2>14. ENTIRE AGREEMENT</h2>
      <p>These Terms, together with the Informed Consent Agreement, Screening Questionnaire, Privacy Policy, and Stage 7 Addendum (if applicable), constitute the entire agreement between you and the Operator.</p>

      <h2>15. ACKNOWLEDGMENT & ACCEPTANCE</h2>
      <p className="font-bold">BY CLICKING THE ACCEPT AND CONTINUE TO BASELINE BUTTON OR BY ACCESSING THE SYSTEM, YOU ACKNOWLEDGE THAT:</p>
      <ul>
        <li>☐ You have read and understood these Terms in their entirety</li>
        <li>☐ You have had opportunity to consult legal counsel if desired</li>
        <li>☐ You meet all eligibility requirements</li>
        <li>☐ You understand this is NOT medical or mental health treatment</li>
        <li>☐ You understand the risks and assume them voluntarily</li>
        <li>☐ You agree to seek professional help for any medical or psychiatric concerns</li>
        <li>☐ You agree to use crisis resources if experiencing emergency</li>
        <li>☐ You release the Operator from liability as outlined herein</li>
      </ul>
      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <p className="font-bold text-green-800">ELECTRONIC CONSENT</p>
        <p className="text-green-800 text-sm mt-2">
          Your acceptance via checkbox and button click constitutes your legally binding electronic signature on this Informed Consent & Assumption of Risk Agreement. This electronic acceptance is equivalent to a handwritten signature and will be recorded with a timestamp for our records.
        </p>
      </div>
    </>
  );
}

// Informed Consent Component
function InformedConsent() {
  return (
    <>
          <div className="text-gray-800">
      <h1 className="text-gray-900">IOS SYSTEM - INFORMED CONSENT & ASSUMPTION OF RISK AGREEMENT</h1>
      {/* rest of content */}
    </div>
  );
}
      <h1>IOS SYSTEM - INFORMED CONSENT & ASSUMPTION OF RISK AGREEMENT</h1>
      <p className="text-sm text-slate-600">
        Effective Date: [INSERT DATE]<br />
        Operator: H2H Media Group Inc
      </p>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-6">
        <p className="font-bold text-red-800">PURPOSE OF THIS DOCUMENT</p>
        <p className="text-red-800 text-sm mt-2">
          This Informed Consent Agreement provides detailed information about the IOS System practices, associated risks, and your responsibilities as a participant. This is a legally binding document. Please read it carefully and ask questions if anything is unclear.
        </p>
        <p className="text-red-800 text-sm font-bold mt-2">
          You must accept this agreement separately from the Terms of Service to access the System.
        </p>
      </div>

      <h2>SECTION 1: UNDERSTANDING THE IOS SYSTEM</h2>
      <h3>1.1 What the IOS System Is</h3>
      <p>The Integrated Operating System (IOS) is a self-directed educational program designed to train nervous system regulation, cognitive flexibility, and sustained attention through systematic daily practices.</p>
      <p>The System operates through 7 progressive stages:</p>
      <ul>
        <li>Stages 1-6: Core training protocols (breathwork, awareness training, movement, identity work, flow states, integration)</li>
        <li>Stage 7: Advanced protocols requiring separate agreement and medical supervision</li>
      </ul>
      <p>The System uses:</p>
      <ul>
        <li>AI-guided coaching and prompts</li>
        <li>Self-assessment tools</li>
        <li>Structured daily practices</li>
        <li>Progress tracking and metrics</li>
        <li>Adaptive difficulty progression</li>
      </ul>

      <h3>1.2 What the IOS System Is NOT</h3>
      <p className="font-bold">This System is NOT:</p>
      <ul>
        <li>❌ Medical treatment - It does not diagnose, treat, cure, or prevent any disease or medical condition</li>
        <li>❌ Psychotherapy or mental health treatment - It is not a substitute for therapy, counseling, or psychiatric care</li>
        <li>❌ Supervised by healthcare professionals - The AI coach is not a licensed doctor, therapist, psychologist, or mental health professional (Stages 1-6)</li>
        <li>❌ Crisis intervention - It is not designed to handle mental health emergencies or acute distress</li>
        <li>❌ One-size-fits-all - Individual responses vary; practices that benefit one person may not suit another</li>
      </ul>

      <h3>1.3 Educational Purpose</h3>
      <p>The IOS System provides educational information about nervous system regulation, attention training, and cognitive practices. All decisions about whether and how to apply this information are YOUR responsibility.</p>
      <p className="font-bold">You are encouraged to:</p>
      <ul>
        <li>Consult licensed healthcare providers about any medical or mental health concerns</li>
        <li>Discuss these practices with your doctor if you have any health conditions</li>
        <li>Seek professional guidance if you experience adverse effects</li>
        <li>Use your own judgment about what practices are appropriate for you</li>
      </ul>

      <h2>SECTION 2: DETAILED RISK DISCLOSURE</h2>

      <h3>2.1 Breathwork & Respiratory Practices (HRVB, Resonance Breathing)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Controlled breathing at specific rhythms (typically 4-second inhale, 6-second exhale)</li>
        <li>5-7 minute daily sessions</li>
        <li>Designed to increase heart rate variability and vagal tone</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Lightheadedness or dizziness</li>
        <li>Hyperventilation if rhythm is not followed correctly</li>
        <li>Tingling sensations in extremities</li>
        <li>Temporary anxiety or emotional release</li>
        <li>Exacerbation of respiratory conditions</li>
        <li>Rare: Fainting, panic response</li>
      </ul>

      <p className="font-bold">Contraindications - Do NOT perform breathwork if you have:</p>
      <ul>
        <li>Severe asthma or COPD</li>
        <li>Recent pneumothorax (collapsed lung)</li>
        <li>Severe cardiovascular disease</li>
        <li>Pregnancy (without medical clearance)</li>
        <li>Epilepsy or seizure disorders</li>
        <li>Severe anxiety or panic disorder (without professional guidance)</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Always practice seated or lying down</li>
        <li>Stop immediately if you feel faint, dizzy, or experience chest pain</li>
        <li>Never practice while driving or operating machinery</li>
        <li>Breathe through your nose when possible; if you must breathe through mouth, do so gently</li>
        <li>If you have any respiratory or cardiac conditions, consult your doctor first</li>
      </ul>

      <h3>2.2 Awareness & Meditation Practices (Awareness Rep, Decentering)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>2-5 minute guided awareness exercises</li>
        <li>Training attention on present-moment experience</li>
        <li>Observing thoughts and sensations without engagement</li>
        <li>Inquiry into the nature of identity and awareness</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Increased awareness of uncomfortable thoughts or emotions</li>
        <li>Temporary increase in anxiety as suppressed material surfaces</li>
        <li>Disorientation or "spacey" feeling after practice</li>
        <li>Confrontation with difficult memories or realizations</li>
        <li>Depersonalization or derealization (feeling detached from self or reality)</li>
        <li>Existential discomfort from examining identity structures</li>
      </ul>

      <p className="font-bold">Contraindications - Use with EXTREME caution or avoid if you have:</p>
      <ul>
        <li>Active psychosis or hallucinations</li>
        <li>Severe dissociative disorders</li>
        <li>Acute trauma or PTSD without professional support</li>
        <li>Current severe depression with impaired reality testing</li>
        <li>Recent severe emotional trauma (within 6 months)</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Start with shorter durations and gradually increase</li>
        <li>Practice in a safe, comfortable environment</li>
        <li>Ground yourself afterward (feel feet on floor, notice surroundings)</li>
        <li>Seek professional support if distressing material emerges</li>
        <li>Stop immediately if you experience dissociation or severe distress</li>
      </ul>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 my-4">
        <p className="font-bold text-blue-800">Important Note on Decentering Practices:</p>
        <p className="text-blue-800 text-sm mt-2">
          Decentering practices involve examining the nature of thoughts, emotions, and identity. While beneficial for most people, these practices can be destabilizing if:
        </p>
        <ul className="text-blue-800 text-sm mt-2">
          <li>You are currently in crisis</li>
          <li>You have fragile sense of self due to trauma</li>
          <li>You are experiencing active mental health symptoms</li>
        </ul>
        <p className="text-blue-800 text-sm mt-2">
          If you experience persistent dissociation, detachment from reality, or worsening mental health symptoms, discontinue these practices immediately and consult a mental health professional.
        </p>
      </div>

      <h3>2.3 Physical Movement Practices (Somatic Flow)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Gentle movement synchronized with breath (Cat-Cow, Squat-to-Reach)</li>
        <li>3 minute daily sessions</li>
        <li>Designed to enhance body awareness and cerebrospinal circulation</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Muscle strain or soreness</li>
        <li>Joint discomfort</li>
        <li>Dizziness from position changes</li>
        <li>Loss of balance</li>
        <li>Exacerbation of existing injuries</li>
        <li>Rare: Falls or acute injury</li>
      </ul>

      <p className="font-bold">Contraindications - Modify or avoid if you have:</p>
      <ul>
        <li>Recent surgery or injury</li>
        <li>Severe osteoporosis</li>
        <li>Balance disorders</li>
        <li>Acute joint inflammation</li>
        <li>Pregnancy (without medical clearance)</li>
        <li>Any condition affecting mobility or balance</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Move within comfortable range of motion</li>
        <li>Never force or strain</li>
        <li>Stop if you experience pain (discomfort is okay, pain is not)</li>
        <li>Modify positions as needed for your body</li>
        <li>Practice on stable, non-slip surface</li>
        <li>Consult a physical therapist if you have mobility concerns</li>
      </ul>

      <h3>2.4 Cold & Heat Exposure (Stage 1-2 Optional, Stage 3+ Recommended)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Cold exposure: 2-5 minutes in 50-59°F water or cold shower</li>
        <li>Heat exposure: 20-25 minutes in sauna (120-195°F depending on type)</li>
        <li>1-2 times per week</li>
        <li>Designed to enhance neural adaptability and stress resilience</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <p className="italic">Cold Exposure:</p>
      <ul>
        <li>Hypothermia if exposure is too long</li>
        <li>Cardiovascular stress (increased heart rate and blood pressure)</li>
        <li>Shock response</li>
        <li>Numbness or frostbite (if temperature too low)</li>
        <li>Exacerbation of Raynaud's disease</li>
      </ul>

      <p className="italic">Heat Exposure:</p>
      <ul>
        <li>Dehydration</li>
        <li>Heat exhaustion or heat stroke</li>
        <li>Cardiovascular stress</li>
        <li>Dizziness or fainting</li>
        <li>Burns from hot surfaces</li>
      </ul>

      <p className="font-bold">ABSOLUTE CONTRAINDICATIONS - Do NOT practice if you have:</p>
      <ul>
        <li>Cardiovascular disease, heart conditions, or recent cardiac events</li>
        <li>Uncontrolled hypertension</li>
        <li>Pregnancy</li>
        <li>Raynaud's disease or severe circulation problems</li>
        <li>History of frostbite</li>
        <li>Cold urticaria (allergic reaction to cold)</li>
      </ul>

      <p className="font-bold">Relative Contraindications - Consult physician first:</p>
      <ul>
        <li>Any heart condition</li>
        <li>High or low blood pressure</li>
        <li>Diabetes</li>
        <li>Peripheral neuropathy</li>
        <li>Autoimmune conditions</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Start conservatively (shorter duration, less extreme temperature)</li>
        <li>Never practice alone if possible</li>
        <li>Have warm-up protocol ready for cold exposure</li>
        <li>Stay hydrated for heat exposure</li>
        <li>Exit immediately if feeling faint, nauseated, or experiencing chest discomfort</li>
        <li>Gradual temperature changes (don't jump from sauna into ice water)</li>
      </ul>

      <h3>2.5 Sustained Attention & Flow State Training (Stage 4+)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>60-90 minute blocks of single-task focused work</li>
        <li>Elimination of distractions (no phone, notifications off)</li>
        <li>Progressive difficulty calibration</li>
        <li>Daily practice 5x per week</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Mental fatigue or exhaustion</li>
        <li>Eye strain from sustained screen work (if applicable)</li>
        <li>Physical discomfort from prolonged sitting</li>
        <li>Frustration or anxiety if challenge level is inappropriate</li>
        <li>Neglect of other important activities if not balanced</li>
        <li>Workaholism or compulsive productivity patterns</li>
      </ul>

      <p className="font-bold">Contraindications - Use with caution if you have:</p>
      <ul>
        <li>ADHD (may require modified approach)</li>
        <li>Anxiety disorders (performance pressure may trigger symptoms)</li>
        <li>Obsessive-compulsive tendencies</li>
        <li>Burnout or chronic stress</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Start with 60 minutes and gradually increase</li>
        <li>Take breaks if experiencing discomfort</li>
        <li>Use proper ergonomics for seated work</li>
        <li>Balance flow work with rest and recovery</li>
        <li>Adjust difficulty if consistently too easy or too hard</li>
        <li>Monitor for signs of overwork or burnout</li>
      </ul>

      <h3>2.6 Identity & Belief Examination (Stage 3+)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Daily micro-actions reinforcing chosen identity</li>
        <li>Cognitive reframing of automatic interpretations (Reframe Protocol)</li>
        <li>Examination of self-concept and belief structures</li>
        <li>Integration of new behavioral patterns</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Discomfort when confronting limiting beliefs</li>
        <li>Temporary identity confusion during transition periods</li>
        <li>Anxiety when releasing old patterns</li>
        <li>Grief over past self-concept</li>
        <li>Relationship changes as identity shifts</li>
        <li>Resistance or self-sabotage patterns emerging</li>
      </ul>

      <p className="font-bold">Contraindications - Use with caution if you have:</p>
      <ul>
        <li>Fragile or poorly-integrated sense of self</li>
        <li>Recent major life transitions or losses</li>
        <li>Personality disorders (requires professional guidance)</li>
        <li>Active identity crisis</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Change gradually; avoid forcing rapid transformation</li>
        <li>Maintain social support during identity shifts</li>
        <li>Seek professional guidance if experiencing significant distress</li>
        <li>Remember: the goal is expansion, not replacement of core values</li>
        <li>Take breaks if feeling overwhelmed</li>
      </ul>

      <h3>2.7 Psychological Inquiry & Meta-Reflection (Stage 2+)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Weekly reflection on patterns and insights</li>
        <li>Examination of thought processes and assumptions</li>
        <li>Inquiry into the nature of awareness</li>
        <li>Integration of learning from daily experience</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Confrontation with uncomfortable truths about oneself</li>
        <li>Increased self-criticism or judgment</li>
        <li>Rumination or over-analysis</li>
        <li>Emotional release as insights emerge</li>
        <li>Temporary increase in self-doubt during growth periods</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Balance inquiry with self-compassion</li>
        <li>If reflection becomes rumination, shift to somatic grounding</li>
        <li>Seek support if insights are overwhelming</li>
        <li>Remember: awareness of problems is not the same as the problems worsening</li>
      </ul>

      <h2>SECTION 3: SPECIAL POPULATIONS & CONSIDERATIONS</h2>

      <h3>3.1 Mental Health Conditions</h3>
      <p className="font-bold">If you have ANY diagnosed mental health condition, you MUST:</p>
      <ul>
        <li>✓ Consult with your mental health provider before starting this program</li>
        <li>✓ Inform your provider about the specific practices involved</li>
        <li>✓ Continue any prescribed treatment and medication</li>
        <li>✓ Monitor for changes in symptoms</li>
        <li>✓ Discontinue practices that worsen your condition</li>
      </ul>

      <p className="font-bold">Specific Conditions Requiring Extra Caution:</p>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Depression:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Awareness practices may temporarily increase awareness of negative thoughts</li>
          <li>Flow state training may feel impossible during depressive episodes</li>
          <li>Monitor for worsening symptoms</li>
          <li>Ensure you have professional support in place</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Anxiety Disorders:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Breathwork may initially increase anxiety before it decreases</li>
          <li>Performance-focused practices may trigger anxiety</li>
          <li>Start with shorter durations and progress gradually</li>
          <li>Have grounding techniques ready</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Trauma / PTSD:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Somatic and awareness practices may surface traumatic material</li>
          <li>Dissociation risk with decentering practices</li>
          <li>Strongly recommend working with trauma-informed therapist concurrently</li>
          <li>Have safety plan and grounding protocols in place</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Bipolar Disorder:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Intensive practices during manic phases may increase activation</li>
          <li>Depressive phases may make practices feel impossible</li>
          <li>Close monitoring essential</li>
          <li>Coordinate with psychiatrist</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Psychotic Disorders:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Meditation and decentering practices may worsen symptoms</li>
          <li>Reality testing may be compromised</li>
          <li>Generally not recommended without close psychiatric supervision</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Dissociative Disorders:</p>
        <ul className="text-yellow-900 text-sm">
          <li>High risk of destabilization with awareness practices</li>
          <li>Not recommended without specialized therapeutic support</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">OCD:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Flow state practices may feed compulsive patterns</li>
          <li>Meta-reflection may become rumination</li>
          <li>Professional guidance strongly recommended</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Eating Disorders:</p>
        <ul className="text-yellow-900 text-sm">
          <li>Identity work and performance tracking may trigger disordered patterns</li>
          <li>Requires concurrent professional treatment</li>
        </ul>
      </div>

      <h3>3.2 Medications</h3>
      <p className="font-bold">If you are taking ANY psychiatric medications, you MUST:</p>
      <ul>
        <li>✓ Consult your prescribing physician before starting</li>
        <li>✓ Be aware of potential interactions (especially with breathwork, cold exposure)</li>
        <li>✓ Monitor for any changes in medication effects</li>
        <li>✓ NEVER adjust medication dosage based on System recommendations</li>
      </ul>

      <p className="font-bold">Medications of Particular Concern:</p>
      
      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 my-3">
        <p className="font-bold text-blue-900">SSRIs / SNRIs / Antidepressants:</p>
        <ul className="text-blue-900 text-sm">
          <li>May interact with intensive breathwork</li>
          <li>Identity work may affect self-perception; do not adjust medication without medical guidance</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 my-3">
        <p className="font-bold text-blue-900">Benzodiazepines:</p>
        <ul className="text-blue-900 text-sm">
          <li>Cold exposure may affect cardiovascular response</li>
          <li>Do not discontinue medication based on improved regulation</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 my-3">
        <p className="font-bold text-blue-900">Stimulants (ADHD medications):</p>
        <ul className="text-blue-900 text-sm">
          <li>May affect heart rate during breathwork and cold exposure</li>
          <li>Flow state training may feel different on vs off medication</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 my-3">
        <p className="font-bold text-blue-900">Antipsychotics:</p>
        <ul className="text-blue-900 text-sm">
          <li>Meditation practices may affect symptom perception</li>
          <li>Close monitoring essential</li>
        </ul>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 my-3">
        <p className="font-bold text-blue-900">Beta Blockers / Blood Pressure Medications:</p>
        <ul className="text-blue-900 text-sm">
          <li>Cold exposure and breathwork affect cardiovascular system</li>
          <li>Medical clearance required</li>
        </ul>
      </div>

      <h3>3.3 Physical Health Conditions</h3>
      <p className="font-bold">Consult your physician before starting if you have:</p>
      
      <p className="italic font-semibold">Cardiovascular:</p>
      <ul>
        <li>Any heart condition (arrhythmia, CAD, heart failure, etc.)</li>
        <li>High or low blood pressure</li>
        <li>History of stroke or TIA</li>
        <li>Peripheral vascular disease</li>
      </ul>

      <p className="italic font-semibold">Respiratory:</p>
      <ul>
        <li>Asthma or COPD</li>
        <li>Sleep apnea</li>
        <li>Any chronic respiratory condition</li>
      </ul>

      <p className="italic font-semibold">Neurological:</p>
      <ul>
        <li>Epilepsy or seizure disorders</li>
        <li>Migraine disorders</li>
        <li>Multiple sclerosis</li>
        <li>Parkinson's disease</li>
      </ul>

      <p className="italic font-semibold">Other:</p>
      <ul>
        <li>Diabetes (especially for cold/heat exposure)</li>
        <li>Thyroid disorders</li>
        <li>Autoimmune conditions</li>
        <li>Chronic pain conditions</li>
        <li>Pregnancy or breastfeeding</li>
      </ul>

      <h2>SECTION 4: YOUR RESPONSIBILITIES</h2>

      <h3>4.1 Honest Disclosure</h3>
      <p className="font-bold">You agree to:</p>
      <ul>
        <li>☐ Provide accurate information during all screenings and assessments</li>
        <li>☐ Disclose all relevant medical and psychiatric conditions</li>
        <li>☐ Disclose all medications you are taking</li>
        <li>☐ Update your information if your health status changes</li>
        <li>☐ Not withhold information that might affect your safety</li>
      </ul>
      
      <p className="font-bold">Providing false information may result in:</p>
      <ul>
        <li>Serious harm to yourself</li>
        <li>Immediate termination of access</li>
        <li>Voiding of all liability protections</li>
      </ul>

      <h3>4.2 Active Monitoring</h3>
      <p className="font-bold">You agree to:</p>
      <ul>
        <li>☐ Monitor yourself for adverse effects during and after practices</li>
        <li>☐ Track any changes in physical or mental health symptoms</li>
        <li>☐ Discontinue practices that cause distress or harm</li>
        <li>☐ Seek professional evaluation if concerning symptoms emerge</li>
        <li>☐ Not ignore warning signs or "push through" harmful experiences</li>
      </ul>

      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <p className="font-bold text-red-800">Warning Signs Requiring Immediate Discontinuation:</p>
        <ul className="text-red-800 text-sm mt-2">
          <li>Suicidal or self-harm thoughts</li>
          <li>Psychotic symptoms (hallucinations, delusions, paranoia)</li>
          <li>Severe panic or anxiety attacks</li>
          <li>Persistent dissociation or depersonalization</li>
          <li>Worsening of pre-existing mental health conditions</li>
          <li>Chest pain, difficulty breathing, or cardiovascular symptoms</li>
          <li>Any symptom that feels medically urgent</li>
        </ul>
      </div>

      <h3>4.3 Appropriate Use</h3>
      <p className="font-bold">You agree to:</p>
      <ul>
        <li>☐ Use the System as a supplement to (not replacement for) professional care</li>
        <li>☐ Follow all safety guidelines provided</li>
        <li>☐ Not exceed recommended practice durations or intensities</li>
        <li>☐ Practice in safe, appropriate environments</li>
        <li>☐ Not practice while impaired by substances</li>
        <li>☐ Seek emergency help if experiencing crisis (not rely on System)</li>
      </ul>

      <h3>4.4 Crisis Protocol</h3>
      <p className="font-bold">You acknowledge and agree that:</p>
      <ul>
        <li>☐ The System is NOT designed for crisis intervention</li>
        <li>☐ The AI coach cannot replace emergency services or crisis counseling</li>
        <li>☐ You will call 911 or go to emergency room for medical emergencies</li>
        <li>☐ You will call 988 (Suicide & Crisis Lifeline) for mental health crises</li>
        <li>☐ You will not rely on the System during acute psychiatric emergencies</li>
      </ul>
      <p className="text-sm italic">International Users: You are responsible for knowing your local emergency numbers and crisis resources.</p>

      <h2>SECTION 5: DATA COLLECTION & PRIVACY</h2>

      <h3>5.1 Sensitive Data Collection</h3>
      <p>The System collects sensitive information about your:</p>
      <ul>
        <li>Mental state (mood, stress levels, subjective wellbeing)</li>
        <li>Psychological patterns (thought patterns, emotional responses)</li>
        <li>Physical state (HRV if measured, perceived energy)</li>
        <li>Performance metrics (focus quality, adherence)</li>
        <li>Personal reflections and insights</li>
      </ul>

      <p>This data is used to:</p>
      <ul>
        <li>Track your progress through stages</li>
        <li>Provide personalized coaching</li>
        <li>Calculate metrics and determine stage unlocks</li>
        <li>Improve System functionality</li>
      </ul>

      <h3>5.2 Data Storage & Security</h3>
      <p className="font-bold">Your data is:</p>
      <ul>
        <li>Stored on secure cloud infrastructure (Supabase)</li>
        <li>Protected with industry-standard security measures</li>
        <li>Not shared with third parties except as required by law</li>
        <li>Subject to our Privacy Policy</li>
      </ul>

      <p className="font-bold">However:</p>
      <ul>
        <li>No system is 100% secure</li>
        <li>Data breaches, though unlikely, are possible</li>
        <li>You assume the risk of internet-based data storage</li>
      </ul>

      <h3>5.3 Research & Improvement</h3>
      <p>We may use anonymized, aggregated data to:</p>
      <ul>
        <li>Improve System effectiveness</li>
        <li>Conduct research on protocol outcomes</li>
        <li>Publish findings (all data fully de-identified)</li>
      </ul>

      <h2>SECTION 6: UNDERSTANDING OF LIMITATIONS</h2>

      <h3>6.1 AI Coach Limitations</h3>
      <p className="font-bold">You understand that the AI coach:</p>
      <ul>
        <li>☐ Is not a human professional and cannot replace human judgment</li>
        <li>☐ Operates within programmatic constraints and may miss important cues</li>
        <li>☐ Cannot detect all crisis situations or mental health emergencies</li>
        <li>☐ May provide generic responses that don't fit your specific situation</li>
        <li>☐ Cannot adapt to nuances beyond its programming</li>
        <li>☐ May experience technical errors or glitches</li>
      </ul>

      <h3>6.2 No Guaranteed Outcomes</h3>
      <p className="font-bold">You understand that:</p>
      <ul>
        <li>☐ Individual responses to practices vary widely</li>
        <li>☐ Benefits experienced by others may not occur for you</li>
        <li>☐ Some people may experience no benefit or adverse effects</li>
        <li>☐ Results depend on many factors beyond the System's control</li>
        <li>☐ The System makes no promises or guarantees of specific outcomes</li>
      </ul>

      <h3>6.3 Personal Responsibility</h3>
      <p className="font-bold">You acknowledge that:</p>
      <ul>
        <li>☐ You are ultimately responsible for decisions about your health and wellbeing</li>
        <li>☐ The System provides education and tools, but cannot make decisions for you</li>
        <li>☐ You bear all risk of choosing to participate</li>
        <li>☐ You will use your own judgment and seek professional guidance as needed</li>
        <li>☐ You will not hold the Operator liable for your choices</li>
      </ul>

      <h2>SECTION 7: VOLUNTARY PARTICIPATION</h2>

      <h3>7.1 Freedom to Discontinue</h3>
      <p className="font-bold">You understand that:</p>
      <ul>
        <li>☐ Participation is completely voluntary</li>
        <li>☐ You may discontinue use at any time without penalty</li>
        <li>☐ You may skip any practices that feel inappropriate for you</li>
        <li>☐ You may proceed at your own pace</li>
        <li>☐ No one will pressure you to continue if you wish to stop</li>
      </ul>

      <h3>7.2 No Coercion</h3>
      <p className="font-bold">You affirm that:</p>
      <ul>
        <li>☐ You are participating of your own free will</li>
        <li>☐ No one has coerced or pressured you to use this System</li>
        <li>☐ You have had adequate time to consider this decision</li>
        <li>☐ You have had opportunity to ask questions</li>
        <li>☐ You have had opportunity to consult with professionals or advisors</li>
      </ul>

      <h2>SECTION 8: ACKNOWLEDGMENT OF ALTERNATIVES</h2>
      <p>You understand that alternatives to this System include:</p>
      <ul>
        <li>Traditional psychotherapy or counseling</li>
        <li>Medical treatment for mental health conditions</li>
        <li>Conventional fitness and wellness programs</li>
        <li>Meditation or mindfulness classes with human instructors</li>
        <li>Other self-development programs or books</li>
        <li>Professional coaching with licensed practitioners</li>
      </ul>

      <h2>SECTION 9: QUESTIONS & UNDERSTANDING</h2>
      <p className="font-bold">Before accepting, ask yourself:</p>
      <ul>
        <li>Do I understand what the IOS System is and is not?</li>
        <li>Do I understand the risks involved in the practices?</li>
        <li>Have I disclosed all relevant medical and psychiatric information?</li>
        <li>Do I understand my responsibilities as a participant?</li>
        <li>Do I understand that this is not medical or mental health treatment?</li>
        <li>Am I comfortable assuming the risks described?</li>
        <li>Do I have questions I need answered before proceeding?</li>
      </ul>

      <p>If you have questions or concerns, contact: [Support Email]</p>

      <h2>SECTION 10: FINAL CONSENT STATEMENT</h2>
      <p className="font-bold">By accepting below, I affirm that:</p>
      <ul>
        <li>☐ I have read and understood this entire Informed Consent Agreement</li>
        <li>☐ I have received satisfactory answers to all my questions</li>
        <li>☐ I understand the nature, purpose, risks, and limitations of the IOS System</li>
        <li>☐ I understand this is NOT medical or mental health treatment</li>
        <li>☐ I have consulted (or will consult) appropriate professionals regarding any health conditions</li>
        <li>☐ I voluntarily assume all risks described in this document</li>
        <li>☐ I agree to all responsibilities outlined in this document</li>
        <li>☐ I release the Operator from liability as described in the Terms of Service</li>
        <li>☐ I will seek immediate professional help for any crisis or emergency situation</li>
        <li>☐ I understand I can discontinue participation at any time</li>
      </ul>

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <p className="font-bold text-green-800">ELECTRONIC CONSENT</p>
        <p className="text-green-800 text-sm mt-2">
          Your acceptance via checkbox and button click constitutes your legally binding electronic signature on this Informed Consent & Assumption of Risk Agreement. This electronic acceptance is equivalent to a handwritten signature and will be recorded with a timestamp for our records.
        </p>
      </div>

      <p className="text-sm text-center italic text-slate-600 mt-8">
        KEEP A COPY OF THIS DOCUMENT FOR YOUR RECORDS<br />
        You may print or save this page at any time
      </p>
    </>
  );
}
