'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // CHANGED: next/navigation instead of next/router
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Heart,
  Brain,
  Activity,
  Pill,
  User
} from 'lucide-react';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ScreeningResponse {
  // Crisis Indicators (B1)
  suicidalThoughts: boolean;
  hallucinations: boolean;
  delusions: boolean;
  acuteCrisis: boolean;
  recentHospitalization: boolean;
  currentlyHospitalized: boolean;
  
  // Psychiatric Diagnoses (B2)
  diagnoses: string[];
  currentTreatment: string;
  recentSymptoms: string[];
  traumaHistory: string;
  
  // Medical Conditions (C)
  cardiovascular: string[];
  respiratory: string[];
  neurological: string[];
  otherMedical: string[];
  
  // Medications (D)
  medications: string[];
  
  // Substance Use (F)
  alcoholUse: string;
  substanceUse: string[];
  addiction: string;
  
  // Comprehension & Consent (G)
  understandsNotTreatment: boolean;
  understandsConsultProfessionals: boolean;
  understandsResponsibility: boolean;
  understandsCrisisUse: boolean;
  certifiesHonesty: boolean;
}

type ClearanceStatus = 'granted' | 'granted_modified' | 'pending' | 'denied' | 'wait';

interface ClearanceResult {
  status: ClearanceStatus;
  reasons: string[];
  modifications: string[];
  warnings: string[];
  requiresAction: string[];
}

export default function ScreeningPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(1);
  const [responses, setResponses] = useState<Partial<ScreeningResponse>>({
    diagnoses: [],
    recentSymptoms: [],
    cardiovascular: [],
    respiratory: [],
    neurological: [],
    otherMedical: [],
    medications: [],
    substanceUse: []
  });
  const [clearanceResult, setClearanceResult] = useState<ClearanceResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Replace the useEffect in your screening page with this:

useEffect(() => {
  async function checkAuth() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      // Check if already completed screening
      // Wrap in try-catch to handle missing table gracefully
      try {
        const { data: screening, error } = await supabase
          .from('screening_responses')
          .select('clearance_status')
          .eq('user_id', user.id)
          .single();

        // Only redirect if we successfully got data AND status is granted
        if (!error && screening && screening.clearance_status === 'granted') {
          router.push('/legal-agreements');
          return;
        }
      } catch (tableError) {
        // Table doesn't exist or other error - just continue to show the form
        console.log('Could not check screening status (table may not exist yet):', tableError);
      }

      setUser(user);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/auth/signin');
    }
  }

  checkAuth();
}, [router]);

  const handleCheckboxChange = (field: keyof ScreeningResponse, value: any) => {
    setResponses(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: keyof ScreeningResponse, value: string) => {
    setResponses(prev => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  const evaluateClearance = (): ClearanceResult => {
    const result: ClearanceResult = {
      status: 'granted',
      reasons: [],
      modifications: [],
      warnings: [],
      requiresAction: []
    };

    // HARD STOPS - Auto-exclusion
    if (responses.suicidalThoughts || responses.hallucinations || responses.delusions || 
        responses.acuteCrisis || responses.recentHospitalization || responses.currentlyHospitalized) {
      result.status = 'denied';
      result.reasons.push('Active mental health crisis detected - immediate professional support required');
      return result;
    }

    // Psychotic disorders
    if (responses.diagnoses?.some(d => 
      ['schizophrenia', 'schizoaffective', 'psychotic', 'did'].includes(d.toLowerCase())
    )) {
      result.status = 'denied';
      result.reasons.push('Diagnosis requires psychiatric supervision - professional clearance needed');
      return result;
    }

    // Active addiction
    if (responses.addiction === 'active') {
      result.status = 'denied';
      result.reasons.push('Active addiction detected - specialized treatment required first');
      return result;
    }

    // Cardiovascular hard stops
    if (responses.cardiovascular?.some(c => 
      ['recent_heart_attack', 'recent_surgery', 'uncontrolled_hypertension'].includes(c)
    )) {
      result.status = 'pending';
      result.reasons.push('Cardiovascular condition requires medical clearance');
      result.requiresAction.push('Upload medical clearance from cardiologist');
      return result;
    }

    // Respiratory hard stops
    if (responses.respiratory?.some(r => 
      ['poorly_controlled_asthma', 'copd', 'emphysema', 'pneumothorax'].includes(r)
    )) {
      result.status = 'pending';
      result.reasons.push('Respiratory condition requires medical clearance');
      result.requiresAction.push('Upload medical clearance from pulmonologist');
      return result;
    }

    // Neurological hard stops
    if (responses.neurological?.includes('epilepsy') || 
        responses.neurological?.includes('recent_concussion')) {
      result.status = 'pending';
      result.reasons.push('Neurological condition requires medical clearance');
      result.requiresAction.push('Upload medical clearance from neurologist');
      return result;
    }

    // STRONG WARNINGS - Granted with modifications
    const highRiskDiagnoses = ['bipolar', 'ptsd', 'cptsd', 'bpd', 'personality', 'dissociative', 'eating'];
    if (responses.diagnoses?.some(d => highRiskDiagnoses.some(risk => d.toLowerCase().includes(risk)))) {
      result.status = 'granted_modified';
      result.warnings.push('Your diagnosis requires professional consultation before starting');
      result.modifications.push('Strongly recommend consulting mental health provider');
      result.modifications.push('Enable trauma-sensitive modifications');
    }

    // Cardiovascular warnings
    if (responses.cardiovascular && responses.cardiovascular.length > 0 && 
        !responses.cardiovascular.some(c => ['recent_heart_attack', 'recent_surgery', 'uncontrolled_hypertension'].includes(c))) {
      result.status = result.status === 'granted' ? 'granted_modified' : result.status;
      result.warnings.push('Cardiovascular condition detected - modifications required');
      result.modifications.push('Skip all cold/heat exposure practices');
      result.modifications.push('Modify breathwork - shorter duration, gentler rhythm');
    }

    // Pregnancy
    if (responses.otherMedical?.includes('pregnancy')) {
      result.status = result.status === 'granted' ? 'granted_modified' : result.status;
      result.warnings.push('Pregnancy detected - cold/heat exposure contraindicated');
      result.modifications.push('Skip cold plunge and sauna practices');
      result.modifications.push('Gentle breathwork only');
    }

    // Recent trauma
    if (responses.traumaHistory === 'recent') {
      result.warnings.push('Recent trauma - trauma-informed approach recommended');
      result.modifications.push('Enable trauma-sensitive mode with shorter practices');
    }

    // Medications
    if (responses.medications && responses.medications.length > 0) {
      result.warnings.push('Current medications may interact with practices');
      result.modifications.push('Do not adjust medications based on IOS progress');
      result.modifications.push('Consult prescriber about this program');
    }

    return result;
  };

  const handleSubmit = async () => {
    const clearance = evaluateClearance();
    setClearanceResult(clearance);

    // Save to database
    try {
      const { error } = await supabase
        .from('screening_responses')
        .upsert({
          user_id: user.id,
          responses: responses,
          clearance_status: clearance.status,
          clearance_reasons: clearance.reasons,
          clearance_modifications: clearance.modifications,
          clearance_warnings: clearance.warnings,
          clearance_actions_required: clearance.requiresAction,
          completed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user metadata
      await supabase.auth.updateUser({
        data: { screening_completed: true, clearance_status: clearance.status }
      });

      setShowResults(true);
    } catch (error) {
      console.error('Error saving screening:', error);
      alert('Error saving screening. Please try again.');
    }
  };

  const handleContinue = () => {
    if (clearanceResult?.status === 'granted' || clearanceResult?.status === 'granted_modified') {
      router.push('/legal-agreements');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (showResults && clearanceResult) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {clearanceResult.status === 'granted' && (
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
              )}
              {clearanceResult.status === 'granted_modified' && (
                <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-yellow-500" />
                </div>
              )}
              {clearanceResult.status === 'pending' && (
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-10 h-10 text-blue-500" />
                </div>
              )}
              {clearanceResult.status === 'denied' && (
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
              )}
            </div>

            {/* Status Title */}
            <h1 className="text-3xl font-bold text-center mb-4">
              {clearanceResult.status === 'granted' && 'Access Granted'}
              {clearanceResult.status === 'granted_modified' && 'Access Granted with Modifications'}
              {clearanceResult.status === 'pending' && 'Clearance Pending'}
              {clearanceResult.status === 'denied' && 'Access Denied'}
            </h1>

            {/* Status Message */}
            <div className="mb-8">
              {clearanceResult.status === 'granted' && (
                <p className="text-zinc-400 text-center">
                  You are cleared to use the IOS System with standard protocols.
                </p>
              )}
              {clearanceResult.status === 'granted_modified' && (
                <p className="text-zinc-400 text-center">
                  You are cleared with specific safety modifications in place.
                </p>
              )}
              {clearanceResult.status === 'pending' && (
                <p className="text-zinc-400 text-center">
                  Medical clearance required before access is granted.
                </p>
              )}
              {clearanceResult.status === 'denied' && (
                <p className="text-zinc-400 text-center">
                  Based on your responses, the IOS System is not appropriate at this time.
                </p>
              )}
            </div>

            {/* Reasons */}
            {clearanceResult.reasons.length > 0 && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-red-400 mb-2">Important:</h3>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {clearanceResult.reasons.map((reason, idx) => (
                    <li key={idx}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {clearanceResult.warnings.length > 0 && (
              <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-2">Cautions:</h3>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {clearanceResult.warnings.map((warning, idx) => (
                    <li key={idx}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modifications */}
            {clearanceResult.modifications.length > 0 && (
              <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <h3 className="font-semibold text-blue-400 mb-2">Required Modifications:</h3>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {clearanceResult.modifications.map((mod, idx) => (
                    <li key={idx}>• {mod}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions Required */}
            {clearanceResult.requiresAction.length > 0 && (
              <div className="mb-8 bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h3 className="font-semibold text-zinc-200 mb-2">Next Steps:</h3>
                <ul className="space-y-1 text-sm text-zinc-300">
                  {clearanceResult.requiresAction.map((action, idx) => (
                    <li key={idx}>• {action}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Crisis Resources (if denied) */}
            {clearanceResult.status === 'denied' && clearanceResult.reasons.some(r => r.includes('crisis')) && (
              <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                <h3 className="font-semibold text-red-400 mb-4">Immediate Resources:</h3>
                <div className="space-y-3 text-sm text-zinc-300">
                  <div>
                    <div className="font-medium text-zinc-200">If you are in immediate danger:</div>
                    <div>Call 911 or go to your nearest emergency room</div>
                  </div>
                  <div>
                    <div className="font-medium text-zinc-200">Mental Health Crisis:</div>
                    <div>988 Suicide & Crisis Lifeline (US) - Call or text 988</div>
                    <div>Crisis Text Line - Text HOME to 741741</div>
                    <div>Canada Suicide Prevention - 1-833-456-4566</div>
                  </div>
                  <div className="text-zinc-400 text-xs mt-4">
                    Your safety is the priority. The IOS System will be available to you in the future once you are stable with professional support.
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {(clearanceResult.status === 'granted' || clearanceResult.status === 'granted_modified') && (
              <button
                onClick={handleContinue}
                className="w-full bg-[#ff9e19] hover:bg-[#ff9e19]/90 text-zinc-950 font-semibold py-4 px-6 rounded-lg transition-colors"
              >
                Continue to Legal Agreements
              </button>
            )}

            {clearanceResult.status === 'denied' && (
              <p className="text-center text-sm text-zinc-500">
                Please seek professional support. You may return when stable.
              </p>
            )}

            {clearanceResult.status === 'pending' && (
              <p className="text-center text-sm text-zinc-500">
                Contact support@yourdomain.com to submit medical clearance.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main screening form
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Safety Screening</h1>
          <p className="text-zinc-400 text-lg">
            This screening protects your safety and helps us determine if the IOS System is appropriate for you.
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Estimated time: 5-7 minutes • All responses are confidential
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">Section {currentSection} of 5</span>
            <span className="text-sm text-zinc-400">{Math.round((currentSection / 5) * 100)}%</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div 
              className="bg-[#ff9e19] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          
          {/* SECTION 1: Crisis Indicators */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Mental Health Safety Check</h2>
                  <p className="text-zinc-400">These questions help ensure the IOS System is safe for you right now.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.suicidalThoughts || false}
                    onChange={(e) => handleCheckboxChange('suicidalThoughts', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I am currently having thoughts of suicide or self-harm</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.hallucinations || false}
                    onChange={(e) => handleCheckboxChange('hallucinations', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I am currently experiencing hallucinations (seeing or hearing things that aren't there)</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.delusions || false}
                    onChange={(e) => handleCheckboxChange('delusions', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I am currently experiencing delusions (fixed false beliefs)</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.acuteCrisis || false}
                    onChange={(e) => handleCheckboxChange('acuteCrisis', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I am currently in a mental health crisis or severe emotional distress</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.recentHospitalization || false}
                    onChange={(e) => handleCheckboxChange('recentHospitalization', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I have been hospitalized for psychiatric reasons within the past 6 months</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.currentlyHospitalized || false}
                    onChange={(e) => handleCheckboxChange('currentlyHospitalized', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I am currently in a psychiatric hospital or crisis facility</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* SECTION 2: Psychiatric History */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Mental Health History</h2>
                  <p className="text-zinc-400">Select any diagnoses you have received (check all that apply).</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'depression', label: 'Depression' },
                  { value: 'anxiety', label: 'Anxiety Disorder' },
                  { value: 'bipolar', label: 'Bipolar Disorder' },
                  { value: 'ptsd', label: 'PTSD' },
                  { value: 'cptsd', label: 'Complex PTSD' },
                  { value: 'ocd', label: 'OCD' },
                  { value: 'adhd', label: 'ADHD' },
                  { value: 'autism', label: 'Autism Spectrum' },
                  { value: 'schizophrenia', label: 'Schizophrenia' },
                  { value: 'schizoaffective', label: 'Schizoaffective Disorder' },
                  { value: 'psychotic', label: 'Psychotic Disorder' },
                  { value: 'did', label: 'Dissociative Identity Disorder' },
                  { value: 'dissociative', label: 'Other Dissociative Disorder' },
                  { value: 'bpd', label: 'Borderline Personality Disorder' },
                  { value: 'personality', label: 'Other Personality Disorder' },
                  { value: 'eating', label: 'Eating Disorder' },
                ].map((diagnosis) => (
                  <label key={diagnosis.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={responses.diagnoses?.includes(diagnosis.value) || false}
                      onChange={() => handleArrayToggle('diagnoses', diagnosis.value)}
                      className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                    />
                    <span className="text-sm text-zinc-200">{diagnosis.label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Current Mental Health Treatment
                </label>
                <select
                  value={responses.currentTreatment || ''}
                  onChange={(e) => handleCheckboxChange('currentTreatment', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-[#ff9e19] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="none">No current treatment</option>
                  <option value="psychiatrist">Psychiatrist</option>
                  <option value="psychologist">Psychologist</option>
                  <option value="therapist">Therapist/Counselor</option>
                  <option value="other">Other provider</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Trauma History
                </label>
                <select
                  value={responses.traumaHistory || ''}
                  onChange={(e) => handleCheckboxChange('traumaHistory', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-[#ff9e19] focus:border-transparent"
                >
                  <option value="">Select an option</option>
                  <option value="none">No significant trauma</option>
                  <option value="recent">Trauma within past year</option>
                  <option value="past">Trauma more than 1 year ago</option>
                  <option value="childhood">Childhood trauma</option>
                  <option value="multiple">Multiple traumatic experiences</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION 3: Medical Conditions */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Medical Health</h2>
                  <p className="text-zinc-400">Select any medical conditions that apply to you.</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Cardiovascular Conditions</h3>
                <div className="space-y-2">
                  {[
                    { value: 'heart_disease', label: 'Heart disease' },
                    { value: 'arrhythmia', label: 'Irregular heartbeat' },
                    { value: 'recent_heart_attack', label: 'Recent heart attack (within 6 months)' },
                    { value: 'stroke_history', label: 'History of stroke' },
                    { value: 'controlled_hypertension', label: 'High blood pressure (controlled)' },
                    { value: 'uncontrolled_hypertension', label: 'High blood pressure (uncontrolled)' },
                    { value: 'recent_surgery', label: 'Recent cardiac surgery (within 6 months)' },
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={responses.cardiovascular?.includes(condition.value) || false}
                        onChange={() => handleArrayToggle('cardiovascular', condition.value)}
                        className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Respiratory Conditions</h3>
                <div className="space-y-2">
                  {[
                    { value: 'well_controlled_asthma', label: 'Asthma (well controlled)' },
                    { value: 'poorly_controlled_asthma', label: 'Asthma (poorly controlled)' },
                    { value: 'copd', label: 'COPD' },
                    { value: 'emphysema', label: 'Emphysema' },
                    { value: 'pneumothorax', label: 'History of collapsed lung' },
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={responses.respiratory?.includes(condition.value) || false}
                        onChange={() => handleArrayToggle('respiratory', condition.value)}
                        className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Neurological Conditions</h3>
                <div className="space-y-2">
                  {[
                    { value: 'epilepsy', label: 'Epilepsy or seizure disorder' },
                    { value: 'recent_concussion', label: 'Concussion within past 6 months' },
                    { value: 'migraine', label: 'Chronic migraine' },
                    { value: 'tbi', label: 'Traumatic brain injury history' },
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={responses.neurological?.includes(condition.value) || false}
                        onChange={() => handleArrayToggle('neurological', condition.value)}
                        className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Other Conditions</h3>
                <div className="space-y-2">
                  {[
                    { value: 'pregnancy', label: 'Currently pregnant' },
                    { value: 'diabetes', label: 'Diabetes' },
                    { value: 'autoimmune', label: 'Autoimmune disease' },
                    { value: 'chronic_pain', label: 'Chronic pain condition' },
                  ].map((condition) => (
                    <label key={condition.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={responses.otherMedical?.includes(condition.value) || false}
                        onChange={() => handleArrayToggle('otherMedical', condition.value)}
                        className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{condition.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Medications & Substances */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Pill className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Medications & Substances</h2>
                  <p className="text-zinc-400">Help us understand any medications or substances you're currently using.</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Current Medications (select all that apply)</h3>
                <div className="space-y-2">
                  {[
                    { value: 'antidepressants', label: 'Antidepressants (SSRIs, SNRIs, etc.)' },
                    { value: 'anti_anxiety', label: 'Anti-anxiety medications' },
                    { value: 'mood_stabilizers', label: 'Mood stabilizers' },
                    { value: 'antipsychotics', label: 'Antipsychotics' },
                    { value: 'adhd_meds', label: 'ADHD medications' },
                    { value: 'beta_blockers', label: 'Beta blockers' },
                    { value: 'blood_pressure', label: 'Blood pressure medications' },
                    { value: 'blood_thinners', label: 'Blood thinners' },
                    { value: 'seizure_meds', label: 'Seizure medications' },
                  ].map((med) => (
                    <label key={med.value} className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={responses.medications?.includes(med.value) || false}
                        onChange={() => handleArrayToggle('medications', med.value)}
                        className="w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                      />
                      <span className="text-sm text-zinc-200">{med.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Alcohol Use Frequency
                </label>
                <select
                  value={responses.alcoholUse || ''}
                  onChange={(e) => handleCheckboxChange('alcoholUse', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-[#ff9e19] focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  <option value="never">Never</option>
                  <option value="rarely">Rarely (1-2 times per month)</option>
                  <option value="occasionally">Occasionally (1-2 times per week)</option>
                  <option value="regularly">Regularly (3-4 times per week)</option>
                  <option value="frequently">Frequently (5+ times per week)</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Substance Use Disorder / Addiction Status
                </label>
                <select
                  value={responses.addiction || ''}
                  onChange={(e) => handleCheckboxChange('addiction', e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 focus:ring-2 focus:ring-[#ff9e19] focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="none">No history of addiction</option>
                  <option value="past">Past addiction, no longer an issue</option>
                  <option value="recovery">In recovery (sober for 6+ months)</option>
                  <option value="active">Currently in active addiction</option>
                </select>
              </div>
            </div>
          )}

          {/* SECTION 5: Consent */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-6 h-6 text-[#ff9e19]" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Understanding & Consent</h2>
                  <p className="text-zinc-400">Please confirm your understanding of these important points.</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.understandsNotTreatment || false}
                    onChange={(e) => handleCheckboxChange('understandsNotTreatment', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I understand the IOS System is NOT medical or mental health treatment</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.understandsConsultProfessionals || false}
                    onChange={(e) => handleCheckboxChange('understandsConsultProfessionals', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I understand I should consult healthcare professionals about any health conditions</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.understandsResponsibility || false}
                    onChange={(e) => handleCheckboxChange('understandsResponsibility', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I understand I am responsible for my own safety and should discontinue use if I experience adverse effects</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.understandsCrisisUse || false}
                    onChange={(e) => handleCheckboxChange('understandsCrisisUse', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I understand I should use emergency services (911, 988) if experiencing a crisis</div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 bg-zinc-800/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={responses.certifiesHonesty || false}
                    onChange={(e) => handleCheckboxChange('certifiesHonesty', e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 text-[#ff9e19] focus:ring-[#ff9e19] focus:ring-offset-zinc-900"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-zinc-200">I certify that all information provided is truthful and complete to the best of my knowledge</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-zinc-800">
            <button
              onClick={() => setCurrentSection(prev => Math.max(1, prev - 1))}
              disabled={currentSection === 1}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800/50 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-100 font-medium rounded-lg transition-colors"
            >
              Previous
            </button>

            {currentSection < 5 ? (
              <button
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-6 py-3 bg-[#ff9e19] hover:bg-[#ff9e19]/90 text-zinc-950 font-semibold rounded-lg transition-colors"
              >
                Next Section
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!responses.understandsNotTreatment || !responses.understandsConsultProfessionals || 
                          !responses.understandsResponsibility || !responses.understandsCrisisUse || 
                          !responses.certifiesHonesty}
                className="px-8 py-3 bg-[#ff9e19] hover:bg-[#ff9e19]/90 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-semibold rounded-lg transition-colors"
              >
                Submit Screening
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
