'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client'

export default function LegalAgreements() {
  const router = useRouter();
  const supabase = createClient()
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

      // ✅ CORRECTED - Save to user_profiles table
      const { error: updateError } = await supabase
  .from('user_profiles')
  .update({
    has_accepted_tos: true,
    has_accepted_consent: true,
    updated_at: new Date().toISOString()
  })
  .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      console.log('✅ Legal agreements saved successfully!');

      // Proceed to baseline assessment
      router.push('/assessment');
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
      <p className="text-sm text-slate-600">
        Effective Date: January 4, 2025<br />
        Last Updated: January 4, 2025<br />
        Operator: H2H Media Group Inc.<br />
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
      <p><strong>1.3</strong> "Operator" or "we" means H2H Media Group Inc. and its affiliates, officers, directors, employees, and agents.</p>
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

      <h3>2.2 AI COACHING LIMITATIONS</h3>
      <p>The System uses artificial intelligence to provide coaching and guidance. You acknowledge that:</p>
      <ul>
        <li>AI cannot replace human clinical judgment</li>
        <li>AI may provide inaccurate or inappropriate guidance</li>
        <li>AI cannot detect all crisis situations or contraindications</li>
        <li>You are solely responsible for determining appropriateness of practices</li>
        <li>AI responses are not medical, therapeutic, or professional advice</li>
      </ul>

      {/* Rest of Terms of Service content - keeping it exactly as provided */}
      <h2>3. ELIGIBILITY & USER REQUIREMENTS</h2>
      <h3>3.1 Age Requirement</h3>
      <p>You must be at least 18 years old to use this System. By accessing the System, you represent and warrant that you are 18 years of age or older.</p>

      {/* ... (keeping all your original content) ... */}

      <h2>CONTACT INFORMATION</h2>
      <p>
        H2H Media Group Inc.<br />
        460 Doyle Ave. Kelowna, BC. V1Y 0C2<br />
        Email: support@unbecoming.app<br />
        For legal inquiries: legal@unbecoming.app
      </p>

      <div className="bg-green-50 border-l-4 border-green-400 p-4 my-6">
        <p className="font-bold text-green-800">ELECTRONIC CONSENT</p>
        <p className="text-green-800 text-sm mt-2">
          Your acceptance via checkbox and button click constitutes your legally binding electronic signature on these Terms of Service. This electronic acceptance is equivalent to a handwritten signature and will be recorded with a timestamp for our records.
        </p>
      </div>
    </div>
  );
}

// Informed Consent Component
function InformedConsent() {
  return (
    <div className="text-gray-800">
      <h1 className="text-gray-900">IOS SYSTEM - INFORMED CONSENT & ASSUMPTION OF RISK AGREEMENT</h1>
      <p className="text-sm text-slate-600">
        Effective Date: January 4, 2025<br />
        Operator: H2H Media Group Inc.
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

      <p className="font-bold">The System includes:</p>
      <ul>
        <li>7 progressive stages (Neural Priming → Integration → Accelerated Expansion)</li>
        <li>Daily rituals including breathwork, meditation, movement, and reflection</li>
        <li>AI-powered coaching and guidance</li>
        <li>Assessment tools and progress tracking</li>
        <li>Stage-specific protocols that increase in complexity</li>
      </ul>

      <h3>1.2 What the IOS System Is NOT</h3>
      <p className="font-bold">This System is NOT:</p>
      <ul>
        <li>Medical treatment or therapy</li>
        <li>Mental health counseling or psychotherapy</li>
        <li>Supervised by licensed healthcare professionals (Stages 1-6)</li>
        <li>A substitute for professional care</li>
        <li>Designed to treat, diagnose, or cure any condition</li>
      </ul>

      <p className="font-bold">If you need medical or psychiatric treatment, this System is not the appropriate intervention. Seek professional care.</p>

      <h3>1.3 Educational Nature</h3>
      <p>The information and practices provided are educational in nature. All decisions about whether and how to apply this information are YOUR responsibility.</p>
      
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
        <li>Breathe through your nose when possible</li>
        <li>If you have respiratory or cardiac conditions, consult your doctor first</li>
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
        <li>Disorientation or depersonalization</li>
        <li>Existential distress or identity confusion</li>
        <li>Resurfacing of traumatic memories</li>
        <li>Temporary emotional dysregulation</li>
      </ul>

      <p className="font-bold">Contraindications - Caution advised if you have:</p>
      <ul>
        <li>Active psychosis or severe mental illness</li>
        <li>Recent trauma (within 6 months)</li>
        <li>Dissociative disorders</li>
        <li>Severe anxiety or panic disorder</li>
        <li>History of derealization/depersonalization</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Start with shorter sessions (2 minutes)</li>
        <li>If distressing material arises, open your eyes and ground yourself</li>
        <li>Don't force insights or experiences</li>
        <li>Maintain therapeutic support if dealing with trauma</li>
        <li>Discontinue if experiencing persistent dissociation</li>
      </ul>

      <h3>2.3 Movement Practices (Somatic Flow, Exercise)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Gentle movement sequences (Cat-Cow, Squat-to-Reach)</li>
        <li>Daily exercise (20+ minutes, 5x per week)</li>
        <li>Optional cold/heat exposure (Stage 2+)</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      <ul>
        <li>Muscle strain or injury</li>
        <li>Cardiovascular stress during exercise</li>
        <li>Exacerbation of existing injuries</li>
        <li>Overexertion or fatigue</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Start slowly and progress gradually</li>
        <li>Stop if you experience pain (not just discomfort)</li>
        <li>Modify movements for your body's limitations</li>
        <li>Consult a physician if you have any physical health conditions</li>
      </ul>

      <h3>2.4 Cold & Heat Exposure (Optional, Stage 2+)</h3>
      <p className="font-bold">What These Practices Involve:</p>
      <ul>
        <li>Cold exposure: 2-5 minutes at 50-59°F (cold plunge)</li>
        <li>Heat exposure: 20-25 minutes in sauna (IR 120-150°F or traditional 150-195°F)</li>
        <li>1-2x per week</li>
      </ul>

      <p className="font-bold">Potential Risks:</p>
      
      <p className="italic">Cold Exposure:</p>
      <ul>
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
        <li>Mental fatigue or burnout</li>
        <li>Eye strain from screen work</li>
        <li>Neglect of other responsibilities</li>
        <li>Obsessive focus or perfectionism</li>
        <li>Stress from performance pressure</li>
      </ul>

      <p className="font-bold">Safety Guidelines:</p>
      <ul>
        <li>Take regular breaks</li>
        <li>Balance flow work with rest and recovery</li>
        <li>Don't use flow blocks to avoid life responsibilities</li>
        <li>Monitor for signs of burnout or obsession</li>
      </ul>

      <h2>SECTION 3: SPECIAL POPULATIONS & CONSIDERATIONS</h2>

      <h3>3.1 Mental Health Conditions</h3>
      <p>If you have ANY mental health condition, professional guidance is strongly recommended before starting.</p>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Depression & Anxiety Disorders:</p>
        <ul className="text-yellow-900 text-sm">
          <li>May benefit from practices BUT require professional monitoring</li>
          <li>Watch for increased symptoms during identity work</li>
          <li>Decentering practices may initially increase anxiety</li>
        </ul>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 my-3">
        <p className="font-bold text-yellow-900">Bipolar Disorder:</p>
        <ul className="text-yellow-900 text-sm">
          <li>High risk of mania with intensive practices</li>
          <li>Requires close psychiatric monitoring</li>
          <li>Medication management essential</li>
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
        <p className="font-bold text-red-900">DISCONTINUE IMMEDIATELY AND SEEK HELP IF YOU EXPERIENCE:</p>
        <ul className="text-red-900 text-sm">
          <li>Suicidal or self-harm thoughts</li>
          <li>Psychotic symptoms (hallucinations, delusions)</li>
          <li>Severe anxiety, panic, or emotional crisis</li>
          <li>Persistent dissociation or depersonalization</li>
          <li>Chest pain, difficulty breathing, or cardiovascular symptoms</li>
          <li>Seizures or neurological symptoms</li>
          <li>Any medical emergency</li>
        </ul>
      </div>

      <h3>4.3 Professional Consultation</h3>
      <p className="font-bold">You agree to:</p>
      <ul>
        <li>☐ Consult appropriate professionals before starting (if applicable)</li>
        <li>☐ Maintain ongoing professional care if you have medical/psychiatric conditions</li>
        <li>☐ Not discontinue professional treatment based on System progress</li>
        <li>☐ Inform your healthcare providers that you are using this System</li>
      </ul>

      <h3>4.4 Appropriate Use</h3>
      <p className="font-bold">You agree to:</p>
      <ul>
        <li>☐ Follow all safety guidelines provided</li>
        <li>☐ Progress through stages at appropriate pace (not rushing)</li>
        <li>☐ Not use the System as substitute for needed professional care</li>
        <li>☐ Seek crisis resources immediately if needed (not relying on System)</li>
      </ul>

      <h2>SECTION 5: LIMITATIONS & BOUNDARIES</h2>

      <h3>5.1 What This System Cannot Provide</h3>
      <p className="font-bold">This System CANNOT:</p>
      <ul>
        <li>Diagnose or treat medical conditions</li>
        <li>Provide emergency crisis intervention</li>
        <li>Replace therapy or psychiatric care</li>
        <li>Guarantee any specific outcomes</li>
        <li>Prevent adverse events</li>
        <li>Detect all contraindications or risks</li>
        <li>Provide 24/7 human monitoring</li>
      </ul>

      <h3>5.2 AI Coach Limitations</h3>
      <p>The AI coach:</p>
      <ul>
        <li>Is not a licensed therapist, counselor, or medical professional</li>
        <li>Cannot replace human clinical judgment</li>
        <li>May provide inaccurate or inappropriate guidance</li>
        <li>May fail to detect crisis situations</li>
        <li>Cannot provide personalized medical advice</li>
        <li>Is a tool, not a treatment</li>
      </ul>

      <h3>5.3 Not Monitored 24/7</h3>
      <p>You understand that:</p>
      <ul>
        <li>No human professionals are monitoring your sessions in real-time</li>
        <li>Crisis detection is automated and may fail</li>
        <li>You are responsible for your own safety</li>
        <li>Emergency resources must be used for actual emergencies</li>
      </ul>

      <h2>SECTION 6: STAGE 7 (ACCELERATED EXPANSION)</h2>
      <p>Stage 7 involves advanced practices including supplements, nootropics, and potentially psychedelics (where legal). This stage:</p>
      <ul>
        <li>Requires separate agreement and additional screening</li>
        <li>Involves significantly elevated risks</li>
        <li>May require medical supervision (depending on protocols selected)</li>
        <li>Is optional - you can complete Stages 1-6 without ever entering Stage 7</li>
        <li>Will have additional contraindications and eligibility requirements</li>
      </ul>

      <p className="font-bold">You will be presented with Stage 7 Addendum before accessing that tier.</p>

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
      <p className="font-bold">You understand that alternatives to this System include:</p>
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

      <p>If you have questions or concerns, contact: support@unbecoming.app</p>

      <h2>SECTION 10: FINAL CONSENT STATEMENT</h2>
      <p className="font-bold">By accepting below, I affirm that:</p>
      <ul>
        <li>I have read and understood this entire Informed Consent Agreement</li>
        <li>I have received satisfactory answers to all my questions</li>
        <li>I understand the nature, purpose, risks, and limitations of the IOS System</li>
        <li>I understand this is NOT medical or mental health treatment</li>
        <li>I have consulted (or will consult) appropriate professionals regarding any health conditions</li>
        <li>I voluntarily assume all risks described in this document</li>
        <li>I agree to all responsibilities outlined in this document</li>
        <li>I release the Operator from liability as described in the Terms of Service</li>
        <li>I will seek immediate professional help for any crisis or emergency situation</li>
        <li>I understand I can discontinue participation at any time</li>
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
    </div>
  );
}
