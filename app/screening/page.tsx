import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Phone, 
  Mail,
  Heart,
  Brain,
  Pill,
  AlertTriangle,
  Shield
} from 'lucide-react';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScreeningData {
  // Section 1: Crisis Indicators
  suicidalIdeation: boolean | null;
  hallucinationsDelusions: boolean | null;
  recentHospitalization: boolean | null;

  // Section 2: Psychiatric Diagnoses
  psychoticDisorders: string[];
  highRiskConditions: string[];
  moderateRiskConditions: string[];
  currentlyInTreatment: string;
  recentSymptoms: string[];

  // Section 3: Cardiovascular
  cardiovascularHardStops: string[];
  cardiovascularWarnings: string[];

  // Section 4: Respiratory
  respiratoryHardStops: string[];
  respiratoryWarnings: string[];

  // Section 5: Neurological
  neurologicalHardStops: string[];
  neurologicalWarnings: string[];

  // Section 6: Other Medical
  otherMedicalHardStops: string[];
  otherMedicalWarnings: string[];

  // Section 7: Medications
  psychiatricMeds: string[];
  cardiovascularMeds: string[];
  otherMeds: string[];

  // Section 8: Substance Use
  alcoholFrequency: string;
  recreationalDrugs: string[];
  substanceUseDisorder: string;

  // Section 9: Consent
  understandingChecks: boolean[];
  honestyChecks: boolean[];
}

type ScreeningOutcome = 'granted' | 'granted_modified' | 'pending' | 'denied';

interface ScreeningResult {
  outcome: ScreeningOutcome;
  flags: string[];
  disabledPractices: string[];
  message: string;
  crisisResources?: boolean;
}

export default function MedicalScreening() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ScreeningData>({
    // Section 1
    suicidalIdeation: null,
    hallucinationsDelusions: null,
    recentHospitalization: null,

    // Section 2
    psychoticDisorders: [],
    highRiskConditions: [],
    moderateRiskConditions: [],
    currentlyInTreatment: '',
    recentSymptoms: [],

    // Section 3
    cardiovascularHardStops: [],
    cardiovascularWarnings: [],

    // Section 4
    respiratoryHardStops: [],
    respiratoryWarnings: [],

    // Section 5
    neurologicalHardStops: [],
    neurologicalWarnings: [],

    // Section 6
    otherMedicalHardStops: [],
    otherMedicalWarnings: [],

    // Section 7
    psychiatricMeds: [],
    cardiovascularMeds: [],
    otherMeds: [],

    // Section 8
    alcoholFrequency: '',
    recreationalDrugs: [],
    substanceUseDisorder: '',

    // Section 9
    understandingChecks: Array(8).fill(false),
    honestyChecks: Array(4).fill(false)
  });

  const [result, setResult] = useState<ScreeningResult | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    } else {
      router.push('/signup');
    }
  };

  const evaluateScreening = (): ScreeningResult => {
    const flags: string[] = [];
    const disabledPractices: string[] = [];

    // SECTION 1: CRISIS INDICATORS (HARD STOP)
    if (formData.suicidalIdeation || formData.hallucinationsDelusions || formData.recentHospitalization) {
      return {
        outcome: 'denied',
        flags: ['crisis_indicator'],
        disabledPractices: [],
        message: 'crisis',
        crisisResources: true
      };
    }

    // SECTION 2: PSYCHOTIC DISORDERS (HARD STOP)
    if (formData.psychoticDisorders.length > 0) {
      return {
        outcome: 'denied',
        flags: ['psychotic_disorder'],
        disabledPractices: [],
        message: 'psychotic_disorder'
      };
    }

    // SECTION 2: HIGH-RISK MENTAL HEALTH (STRONG WARNING)
    if (formData.highRiskConditions.length > 0) {
      flags.push('high_risk_mental_health');
    }

    // SECTION 2: RECENT SYMPTOMS (STRONG WARNING)
    if (formData.recentSymptoms.length > 0 && !formData.recentSymptoms.includes('none')) {
      flags.push('active_symptoms');
    }

    // SECTION 3: CARDIOVASCULAR HARD STOPS
    if (formData.cardiovascularHardStops.length > 0) {
      return {
        outcome: 'pending',
        flags: ['cardiovascular_risk'],
        disabledPractices: [],
        message: 'cardiovascular_clearance'
      };
    }

    // SECTION 3: CARDIOVASCULAR WARNINGS
    if (formData.cardiovascularWarnings.length > 0) {
      flags.push('cardiovascular_caution');
      disabledPractices.push('cold_exposure', 'heat_exposure');
    }

    // SECTION 4: RESPIRATORY HARD STOPS
    if (formData.respiratoryHardStops.length > 0) {
      return {
        outcome: 'pending',
        flags: ['respiratory_risk'],
        disabledPractices: [],
        message: 'respiratory_clearance'
      };
    }

    // SECTION 4: RESPIRATORY WARNINGS
    if (formData.respiratoryWarnings.length > 0) {
      flags.push('respiratory_caution');
    }

    // SECTION 5: NEUROLOGICAL HARD STOPS
    if (formData.neurologicalHardStops.length > 0) {
      return {
        outcome: 'pending',
        flags: ['neurological_risk'],
        disabledPractices: [],
        message: 'neurological_clearance'
      };
    }

    // SECTION 5: NEUROLOGICAL WARNINGS
    if (formData.neurologicalWarnings.length > 0) {
      flags.push('neurological_caution');
    }

    // SECTION 6: PREGNANCY
    if (formData.otherMedicalHardStops.includes('pregnancy')) {
      flags.push('pregnancy');
      disabledPractices.push('cold_exposure', 'heat_exposure');
    }

    // SECTION 6: OTHER MEDICAL WARNINGS
    if (formData.otherMedicalWarnings.length > 0) {
      flags.push('medical_condition');
    }

    // SECTION 7: MEDICATION INTERACTIONS
    if (formData.psychiatricMeds.length > 0 || formData.cardiovascularMeds.length > 0) {
      flags.push('medication_interaction');
    }

    // SECTION 8: ACTIVE ADDICTION (HARD STOP)
    if (formData.substanceUseDisorder === 'active') {
      return {
        outcome: 'denied',
        flags: ['active_addiction'],
        disabledPractices: [],
        message: 'active_addiction'
      };
    }

    // SECTION 8: RECOVERY OR FREQUENT USE
    if (formData.substanceUseDisorder === 'recovery' || 
        ['frequently', 'daily'].includes(formData.alcoholFrequency)) {
      flags.push('substance_use_caution');
    }

    // Determine final outcome
    if (flags.length === 0 && disabledPractices.length === 0) {
      return {
        outcome: 'granted',
        flags: [],
        disabledPractices: [],
        message: 'cleared'
      };
    } else {
      return {
        outcome: 'granted_modified',
        flags,
        disabledPractices,
        message: 'cleared_with_modifications'
      };
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Evaluate screening
      const screeningResult = evaluateScreening();
      setResult(screeningResult);

      // Store in database
      const { error: screeningError } = await supabase
        .from('medical_psychiatric_screening')
        .insert({
          user_id: userId,
          screening_data: formData,
          outcome: screeningResult.outcome,
          flags: screeningResult.flags,
          disabled_practices: screeningResult.disabledPractices,
          created_at: new Date().toISOString()
        });

      if (screeningError) throw screeningError;

      // Update user_progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .update({
          screening_completed: true,
          screening_result: screeningResult.outcome,
          screening_flags: screeningResult.flags,
          practices_disabled: screeningResult.disabledPractices
        })
        .eq('user_id', userId);

      if (progressError) throw progressError;

      // Send notification if denied or pending
      if (screeningResult.outcome === 'denied' || screeningResult.outcome === 'pending') {
        await fetch('/api/notify-support', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            outcome: screeningResult.outcome,
            flags: screeningResult.flags,
            message: screeningResult.message
          })
        });
      }

      // Scroll to top to see result
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error submitting screening:', error);
      alert('There was an error submitting your screening. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (result?.outcome === 'granted' || result?.outcome === 'granted_modified') {
      router.push('/assessment');
    }
  };

  const updateFormData = (field: keyof ScreeningData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof ScreeningData, value: string) => {
    const currentArray = formData[field] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData(field, newArray);
  };

  const toggleBooleanArray = (field: 'understandingChecks' | 'honestyChecks', index: number) => {
    const currentArray = formData[field];
    const newArray = [...currentArray];
    newArray[index] = !newArray[index];
    updateFormData(field, newArray);
  };

  const canProceedToNextSection = (): boolean => {
    switch (currentSection) {
      case 1:
        return formData.suicidalIdeation !== null && 
               formData.hallucinationsDelusions !== null && 
               formData.recentHospitalization !== null;
      case 2:
        return formData.currentlyInTreatment !== '';
      case 3:
        return true; // All cardiovascular questions are optional checkboxes
      case 4:
        return true; // All respiratory questions are optional checkboxes
      case 5:
        return true; // All neurological questions are optional checkboxes
      case 6:
        return true; // All other medical questions are optional checkboxes
      case 7:
        return true; // All medication questions are optional checkboxes
      case 8:
        return formData.alcoholFrequency !== '' && formData.substanceUseDisorder !== '';
      case 9:
        return formData.understandingChecks.every(c => c) && formData.honestyChecks.every(c => c);
      default:
        return false;
    }
  };

  // If screening result is shown, display result page
  if (result) {
    return (
      <div className="min-h-screen bg-zinc-950 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Crisis Resources */}
          {result.crisisResources && (
            <div className="bg-red-950 border-2 border-red-500 rounded-lg p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    IMMEDIATE ACCESS DENIED - CRISIS SUPPORT NEEDED
                  </h2>
                  <p className="text-red-200 mb-4">
                    Based on your responses, this system is not appropriate for you at this time. 
                    You need immediate professional support.
                  </p>
                </div>
              </div>

              <div className="bg-red-900/50 rounded-lg p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white mb-4">CRISIS RESOURCES:</h3>
                
                <div className="flex items-center gap-3 text-red-100">
                  <Phone className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-semibold">If in immediate danger:</p>
                    <p>Call <span className="text-white font-bold">911</span> or go to nearest emergency room</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-red-100">
                  <Phone className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-semibold">988 Suicide & Crisis Lifeline (US)</p>
                    <p>Call or text <span className="text-white font-bold">988</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-red-100">
                  <Phone className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-semibold">Crisis Text Line</p>
                    <p>Text <span className="text-white font-bold">HOME</span> to <span className="text-white font-bold">741741</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-red-100">
                  <Phone className="w-5 h-5 text-red-400" />
                  <div>
                    <p className="font-semibold">Canada:</p>
                    <p><span className="text-white font-bold">1-833-456-4566</span></p>
                  </div>
                </div>
              </div>

              <p className="text-red-200 mt-6 text-center">
                Your safety is the priority. This system will be available when you're stable 
                with professional support in place.
              </p>
            </div>
          )}

          {/* Psychotic Disorder */}
          {result.message === 'psychotic_disorder' && (
            <div className="bg-red-950 border-2 border-red-500 rounded-lg p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <XCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ACCESS DENIED - PROFESSIONAL SUPERVISION REQUIRED
                  </h2>
                  <p className="text-red-200 mb-4">
                    Based on your diagnosis, this system is not appropriate without close psychiatric supervision. 
                    Awareness and meditation practices may worsen symptoms of psychosis or dissociation.
                  </p>
                </div>
              </div>

              <div className="bg-red-900/50 rounded-lg p-6 space-y-3 text-red-100">
                <p className="font-semibold">We strongly recommend:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Discussing this program with your psychiatrist</li>
                  <li>Seeking programs designed specifically for your condition</li>
                  <li>Establishing stable baseline mental health first</li>
                </ul>
              </div>

              <div className="mt-6 text-center">
                <p className="text-red-200 mb-2">
                  If your psychiatrist provides written clearance, contact:
                </p>
                <a href="mailto:support@unbecoming.app" className="text-[#ff9e19] hover:text-[#ff9e19]/80 font-semibold inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@unbecoming.app
                </a>
              </div>
            </div>
          )}

          {/* Active Addiction */}
          {result.message === 'active_addiction' && (
            <div className="bg-red-950 border-2 border-red-500 rounded-lg p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <XCircle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ACCESS DENIED - ACTIVE ADDICTION
                  </h2>
                  <p className="text-red-200 mb-4">
                    You've indicated active addiction. This system is not appropriate at this time.
                  </p>
                </div>
              </div>

              <div className="bg-red-900/50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="font-semibold text-white mb-2">Why:</p>
                  <ul className="list-disc list-inside space-y-1 text-red-100 ml-4">
                    <li>Substances interfere with neural practices</li>
                    <li>Practices may trigger or worsen substance use</li>
                    <li>You need specialized addiction treatment</li>
                  </ul>
                </div>

                <div>
                  <p className="font-semibold text-white mb-2">Resources:</p>
                  <div className="space-y-2 text-red-100 ml-4">
                    <p>• SAMHSA National Helpline: <span className="text-white font-bold">1-800-662-4357</span></p>
                    <p>• Narcotics Anonymous: <a href="https://www.na.org" target="_blank" className="text-[#ff9e19] hover:underline">https://www.na.org</a></p>
                    <p>• Alcoholics Anonymous: <a href="https://www.aa.org" target="_blank" className="text-[#ff9e19] hover:underline">https://www.aa.org</a></p>
                  </div>
                </div>
              </div>

              <p className="text-red-200 mt-6 text-center">
                This system will be here when you're ready. Your recovery is the priority.
              </p>
            </div>
          )}

          {/* Medical Clearance Required */}
          {result.outcome === 'pending' && (
            <div className="bg-yellow-950 border-2 border-yellow-500 rounded-lg p-8 mb-8">
              <div className="flex items-start gap-4 mb-6">
                <AlertTriangle className="w-8 h-8 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    ACCESS PENDING - MEDICAL CLEARANCE REQUIRED
                  </h2>
                  <p className="text-yellow-200 mb-4">
                    {result.message === 'cardiovascular_clearance' && 
                      'Certain practices (breathwork, cold exposure) pose significant risk and are contraindicated for your cardiovascular condition.'}
                    {result.message === 'respiratory_clearance' && 
                      'Breathwork practices pose significant risk for your respiratory condition.'}
                    {result.message === 'neurological_clearance' && 
                      'Based on your neurological condition, certain practices require medical supervision.'}
                  </p>
                </div>
              </div>

              <div className="bg-yellow-900/50 rounded-lg p-6 text-yellow-100">
                <p className="font-semibold mb-3">You MUST obtain written medical clearance from your physician before using this system.</p>
                <p className="mb-4">Please have your doctor contact us to submit clearance:</p>
                <a href="mailto:support@unbecoming.app" className="text-[#ff9e19] hover:text-[#ff9e19]/80 font-semibold inline-flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@unbecoming.app
                </a>
              </div>
            </div>
          )}

          {/* Cleared (Standard or Modified) */}
          {(result.outcome === 'granted' || result.outcome === 'granted_modified') && (
            <div className="bg-zinc-900 border-2 border-[#ff9e19] rounded-lg p-8">
              <div className="flex items-start gap-4 mb-6">
                <CheckCircle className="w-8 h-8 text-[#ff9e19] flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {result.outcome === 'granted' 
                      ? 'ACCESS GRANTED - Ready to Begin' 
                      : 'ACCESS GRANTED - Modified Protocols'}
                  </h2>
                  <p className="text-zinc-300">
                    {result.outcome === 'granted' 
                      ? 'You are cleared to use the IOS System with standard protocols. Proceed to baseline assessment.'
                      : 'You are cleared to use the IOS System with the following safety modifications:'}
                  </p>
                </div>
              </div>

              {result.outcome === 'granted_modified' && (
                <div className="bg-zinc-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Safety Modifications:</h3>
                  
                  {result.disabledPractices.length > 0 && (
                    <div className="mb-4">
                      <p className="text-zinc-300 font-semibold mb-2">Practices Disabled:</p>
                      <ul className="list-disc list-inside space-y-1 text-zinc-400 ml-4">
                        {result.disabledPractices.map((practice, index) => (
                          <li key={index}>{practice.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.flags.length > 0 && (
                    <div>
                      <p className="text-zinc-300 font-semibold mb-2">Active Monitoring For:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {result.flags.map((flag, index) => (
                          <div key={index} className="flex items-center gap-2 text-zinc-400">
                            <Shield className="w-4 h-4 text-[#ff9e19]" />
                            <span>{flag.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-[#ff9e19] hover:bg-[#ff9e19]/90 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Continue to Baseline Assessment
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main screening form
  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Medical & Psychiatric Screening</h1>
          <p className="text-zinc-400">Required for safe system access • 5-7 minutes</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Section {currentSection} of 9</span>
            <span className="text-sm text-zinc-400">{Math.round((currentSection / 9) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-[#ff9e19] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / 9) * 100}%` }}
            />
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          {/* SECTION 1: CRISIS INDICATORS */}
          {currentSection === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Crisis Indicators</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">Are you currently having thoughts of suicide or self-harm?</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.suicidalIdeation === true}
                        onChange={() => updateFormData('suicidalIdeation', true)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">Yes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.suicidalIdeation === false}
                        onChange={() => updateFormData('suicidalIdeation', false)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Are you currently experiencing hallucinations or delusions?</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.hallucinationsDelusions === true}
                        onChange={() => updateFormData('hallucinationsDelusions', true)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">Yes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.hallucinationsDelusions === false}
                        onChange={() => updateFormData('hallucinationsDelusions', false)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Have you been hospitalized for psychiatric reasons within the past 6 months?</p>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.recentHospitalization === true}
                        onChange={() => updateFormData('recentHospitalization', true)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">Yes</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        checked={formData.recentHospitalization === false}
                        onChange={() => updateFormData('recentHospitalization', false)}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">No</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: PSYCHIATRIC DIAGNOSES */}
          {currentSection === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Psychiatric History</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">Have you ever been diagnosed with any of the following?</p>
                  
                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Psychotic Disorders:</p>
                    <div className="space-y-2">
                      {['Schizophrenia', 'Schizoaffective Disorder', 'Psychotic Disorder', 'Dissociative Identity Disorder (DID)'].map(condition => (
                        <label key={condition} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.psychoticDisorders.includes(condition)}
                            onChange={() => toggleArrayItem('psychoticDisorders', condition)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">High-Risk Conditions:</p>
                    <div className="space-y-2">
                      {['Bipolar I or II', 'PTSD or Complex PTSD', 'Borderline Personality Disorder', 'Other Personality Disorder', 'Dissociative Disorder', 'Severe Eating Disorder'].map(condition => (
                        <label key={condition} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.highRiskConditions.includes(condition)}
                            onChange={() => toggleArrayItem('highRiskConditions', condition)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Other Conditions:</p>
                    <div className="space-y-2">
                      {['Major Depression', 'Generalized Anxiety', 'Panic Disorder', 'OCD', 'ADHD', 'None of the above'].map(condition => (
                        <label key={condition} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.moderateRiskConditions.includes(condition)}
                            onChange={() => toggleArrayItem('moderateRiskConditions', condition)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Are you currently receiving treatment from a mental health professional?</p>
                  <div className="space-y-2">
                    {['Yes - Psychiatrist', 'Yes - Psychologist/Therapist', 'No'].map(option => (
                      <label key={option} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.currentlyInTreatment === option}
                          onChange={() => updateFormData('currentlyInTreatment', option)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">In the past 3 months, have you experienced any of the following?</p>
                  <div className="space-y-2">
                    {['Suicidal thoughts', 'Self-harm behaviors', 'Severe panic attacks', 'Frequent dissociation', 'Manic episodes', 'Severe depression', 'None of the above'].map(symptom => (
                      <label key={symptom} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.recentSymptoms.includes(symptom)}
                          onChange={() => toggleArrayItem('recentSymptoms', symptom)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{symptom}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CARDIOVASCULAR */}
          {currentSection === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Cardiovascular Health</h2>
              </div>

              <div className="space-y-6">
                <p className="text-white font-semibold mb-3">Do you have any cardiovascular conditions?</p>
                
                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Critical Conditions:</p>
                  <div className="space-y-2">
                    {['Recent heart attack (within 6 months)', 'Recent cardiac surgery', 'Severe heart failure', 'Uncontrolled high blood pressure'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cardiovascularHardStops.includes(condition)}
                          onChange={() => toggleArrayItem('cardiovascularHardStops', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Other Conditions:</p>
                  <div className="space-y-2">
                    {['Heart disease', 'Arrhythmia', 'Controlled high blood pressure', 'Pacemaker', 'Stroke history', 'None of the above'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.cardiovascularWarnings.includes(condition)}
                          onChange={() => toggleArrayItem('cardiovascularWarnings', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: RESPIRATORY */}
          {currentSection === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Respiratory Health</h2>
              </div>

              <div className="space-y-6">
                <p className="text-white font-semibold mb-3">Do you have any respiratory conditions?</p>
                
                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Critical Conditions:</p>
                  <div className="space-y-2">
                    {['Poorly controlled asthma', 'COPD or emphysema', 'History of collapsed lung'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.respiratoryHardStops.includes(condition)}
                          onChange={() => toggleArrayItem('respiratoryHardStops', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Other Conditions:</p>
                  <div className="space-y-2">
                    {['Well-controlled asthma', 'Sleep apnea', 'Chronic bronchitis', 'None of the above'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.respiratoryWarnings.includes(condition)}
                          onChange={() => toggleArrayItem('respiratoryWarnings', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: NEUROLOGICAL */}
          {currentSection === 5 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Neurological Health</h2>
              </div>

              <div className="space-y-6">
                <p className="text-white font-semibold mb-3">Do you have any neurological conditions?</p>
                
                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Critical Conditions:</p>
                  <div className="space-y-2">
                    {['Epilepsy or seizure disorder', 'Concussion within past 6 months'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.neurologicalHardStops.includes(condition)}
                          onChange={() => toggleArrayItem('neurologicalHardStops', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Other Conditions:</p>
                  <div className="space-y-2">
                    {['Migraine disorder', 'Multiple sclerosis', 'Traumatic brain injury history', 'Stroke history', 'None of the above'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.neurologicalWarnings.includes(condition)}
                          onChange={() => toggleArrayItem('neurologicalWarnings', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: OTHER MEDICAL */}
          {currentSection === 6 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Other Medical Conditions</h2>
              </div>

              <div className="space-y-6">
                <p className="text-white font-semibold mb-3">Do you have any of the following?</p>
                
                <div className="mb-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.otherMedicalHardStops.includes('pregnancy')}
                        onChange={() => toggleArrayItem('otherMedicalHardStops', 'pregnancy')}
                        className="w-4 h-4"
                      />
                      <span className="text-zinc-300">Pregnancy</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-400 text-sm mb-2">Other Conditions:</p>
                  <div className="space-y-2">
                    {['Active cancer or in treatment', 'Immunocompromised', 'Recent surgery', 'Chronic pain condition', 'Autoimmune disease', 'None of the above'].map(condition => (
                      <label key={condition} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.otherMedicalWarnings.includes(condition)}
                          onChange={() => toggleArrayItem('otherMedicalWarnings', condition)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: MEDICATIONS */}
          {currentSection === 7 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Pill className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Current Medications</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">Are you currently taking any of the following?</p>
                  
                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Psychiatric Medications:</p>
                    <div className="space-y-2">
                      {['Antidepressants', 'Anti-anxiety medications', 'Mood stabilizers', 'Antipsychotics', 'ADHD medications'].map(med => (
                        <label key={med} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.psychiatricMeds.includes(med)}
                            onChange={() => toggleArrayItem('psychiatricMeds', med)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{med}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Cardiovascular Medications:</p>
                    <div className="space-y-2">
                      {['Beta blockers', 'Blood pressure medications', 'Blood thinners'].map(med => (
                        <label key={med} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.cardiovascularMeds.includes(med)}
                            onChange={() => toggleArrayItem('cardiovascularMeds', med)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{med}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-zinc-400 text-sm mb-2">Other:</p>
                    <div className="space-y-2">
                      {['Seizure medications', 'None of the above'].map(med => (
                        <label key={med} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.otherMeds.includes(med)}
                            onChange={() => toggleArrayItem('otherMeds', med)}
                            className="w-4 h-4"
                          />
                          <span className="text-zinc-300">{med}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SUBSTANCE USE */}
          {currentSection === 8 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Substance Use</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">How often do you currently consume alcohol?</p>
                  <div className="space-y-2">
                    {['Never', 'Rarely (1-2 times/month)', 'Occasionally (1-2 times/week)', 'Regularly (3-4 times/week)', 'Frequently (5+ times/week)', 'Daily'].map(freq => (
                      <label key={freq} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.alcoholFrequency === freq}
                          onChange={() => updateFormData('alcoholFrequency', freq)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{freq}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Do you use any recreational drugs?</p>
                  <div className="space-y-2">
                    {['Cannabis/Marijuana', 'Cocaine, Methamphetamine, or Opioids', 'Other drugs', 'None'].map(drug => (
                      <label key={drug} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.recreationalDrugs.includes(drug)}
                          onChange={() => toggleArrayItem('recreationalDrugs', drug)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{drug}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Have you ever been diagnosed with substance use disorder?</p>
                  <div className="space-y-2">
                    {[
                      { value: 'active', label: 'Yes - currently in active addiction' },
                      { value: 'recovery', label: 'Yes - in recovery' },
                      { value: 'no', label: 'No' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.substanceUseDisorder === option.value}
                          onChange={() => updateFormData('substanceUseDisorder', option.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-zinc-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: CONSENT */}
          {currentSection === 9 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-[#ff9e19]" />
                <h2 className="text-2xl font-bold text-white">Understanding & Consent</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-white font-semibold mb-3">Please confirm your understanding:</p>
                  <div className="space-y-3">
                    {[
                      'I understand this system is NOT medical or mental health treatment',
                      'I understand I need to consult professionals about any health conditions',
                      'I understand the system cannot replace professional care',
                      'I\'m responsible for my own safety',
                      'I\'ll discontinue use if I experience adverse effects',
                      'I\'ll use emergency services (911, 988) if experiencing crisis',
                      'I have read the Terms of Service and Informed Consent Agreement',
                      'I voluntarily choose to participate'
                    ].map((statement, index) => (
                      <label key={index} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.understandingChecks[index]}
                          onChange={() => toggleBooleanArray('understandingChecks', index)}
                          className="w-4 h-4 mt-1"
                        />
                        <span className="text-zinc-300">{statement}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white font-semibold mb-3">Acknowledgment of Honesty:</p>
                  <div className="space-y-3">
                    {[
                      'I certify all information is truthful and complete to the best of my knowledge',
                      'I understand providing false information may result in serious harm',
                      'I agree to update this information if my health status changes significantly',
                      'I accept responsibility for accuracy of my responses'
                    ].map((statement, index) => (
                      <label key={index} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.honestyChecks[index]}
                          onChange={() => toggleBooleanArray('honestyChecks', index)}
                          className="w-4 h-4 mt-1"
                        />
                        <span className="text-zinc-300">{statement}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {currentSection > 1 && (
            <button
              onClick={() => setCurrentSection(prev => prev - 1)}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Previous
            </button>
          )}

          {currentSection < 9 ? (
            <button
              onClick={() => setCurrentSection(prev => prev + 1)}
              disabled={!canProceedToNextSection()}
              className="flex-1 bg-[#ff9e19] hover:bg-[#ff9e19]/90 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
            >
              Next Section
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceedToNextSection() || loading}
              className="flex-1 bg-[#ff9e19] hover:bg-[#ff9e19]/90 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-lg transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Screening'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
