// lib/progress-utils.js
// Core utility functions for IOS progress tracking

/**
 * Stage configuration - practices required at each stage
 */
export const STAGE_PRACTICES = {
  1: ['hrvb_breathing', 'awareness_rep'],
  2: ['hrvb_breathing', 'awareness_rep', 'somatic_flow'],
  3: ['hrvb_breathing', 'awareness_rep', 'somatic_flow', 'micro_action'],
  4: ['hrvb_breathing', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block'],
  5: ['hrvb_breathing', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation'],
  6: ['hrvb_breathing', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief'],
  7: ['hrvb_breathing', 'awareness_rep', 'somatic_flow', 'micro_action', 'flow_block', 'co_regulation', 'nightly_debrief']
};

/**
 * Unlock thresholds for each stage transition
 */
export const UNLOCK_THRESHOLDS = {
  1: { // Stage 1 → 2
    adherencePercent: 80,
    consecutiveDays: 14,
    averageDelta: 0.3,
    requiredDomains: ['regulation', 'awareness']
  },
  2: { // Stage 2 → 3
    adherencePercent: 80,
    consecutiveDays: 14,
    averageDelta: 0.5,
    requiredDomains: ['regulation', 'awareness']
  },
  3: { // Stage 3 → 4
    adherencePercent: 80,
    consecutiveDays: 14,
    averageDelta: 0.5,
    requiredDomains: ['awareness', 'attention']
  },
  4: { // Stage 4 → 5
    adherencePercent: 80,
    consecutiveDays: 14,
    averageDelta: 0.6,
    requiredDomains: ['regulation', 'awareness', 'outlook', 'attention']
  },
  5: { // Stage 5 → 6
    adherencePercent: 85,
    consecutiveDays: 14,
    averageDelta: 0.7,
    requiredDomains: ['regulation', 'awareness', 'outlook', 'attention']
  },
  6: { // Stage 6 → 7 (manual review required)
    adherencePercent: 85,
    consecutiveDays: 21,
    averageDelta: 0.8,
    requiredDomains: ['regulation', 'awareness', 'outlook', 'attention'],
    manualReviewRequired: true
  }
};

/**
 * REwired Index tier definitions
 */
export const REWIRED_TIERS = {
  0: { min: 0, max: 20, name: 'System Offline', description: 'Critical' },
  1: { min: 21, max: 40, name: 'Baseline Mode', description: 'Installing...' },
  2: { min: 41, max: 60, name: 'Operational', description: 'Stabilizing' },
  3: { min: 61, max: 80, name: 'Optimized', description: 'Coherent' },
  4: { min: 81, max: 100, name: 'Integrated', description: 'Embodied' }
};

/**
 * Calculate adherence percentage for a given period
 * @param {Array} practiceLogs - Array of practice log entries
 * @param {number} stage - Current stage
 * @param {number} days - Number of days to calculate (default 14)
 * @returns {number} Adherence percentage (0-100)
 */
export function calculateAdherence(practiceLogs, stage, days = 14) {
  const requiredPractices = STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
  const totalRequired = requiredPractices.length * days;
  
  if (totalRequired === 0) return 0;
  
  // Count completed practices
  const completed = practiceLogs.filter(log => log.completed).length;
  
  return Math.min(100, Math.round((completed / totalRequired) * 100));
}

/**
 * Calculate consecutive days of practice completion
 * @param {Array} practiceLogs - Array of practice log entries sorted by date desc
 * @param {number} stage - Current stage
 * @returns {number} Number of consecutive days with all practices completed
 */
export function calculateConsecutiveDays(practiceLogs, stage) {
  const requiredPractices = STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
  
  // Group logs by date
  const logsByDate = {};
  practiceLogs.forEach(log => {
    const date = log.practice_date;
    if (!logsByDate[date]) {
      logsByDate[date] = new Set();
    }
    if (log.completed) {
      logsByDate[date].add(log.practice_type);
    }
  });
  
  // Sort dates descending
  const dates = Object.keys(logsByDate).sort((a, b) => new Date(b) - new Date(a));
  
  let consecutiveDays = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const completedPractices = logsByDate[date];
    
    // Check if all required practices were completed on this date
    const allCompleted = requiredPractices.every(p => completedPractices.has(p));
    
    if (allCompleted) {
      // Verify it's a consecutive day
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - consecutiveDays);
      const expectedDateStr = expectedDate.toISOString().split('T')[0];
      
      if (date === expectedDateStr) {
        consecutiveDays++;
      } else {
        break; // Gap in dates, stop counting
      }
    } else if (date === today) {
      // Today is incomplete but we might have consecutive days before
      continue;
    } else {
      break; // Incomplete day that's not today, stop counting
    }
  }
  
  return consecutiveDays;
}

/**
 * Calculate domain deltas from baseline
 * @param {Object} baselineScores - Original baseline scores
 * @param {Object} currentScores - Current weekly scores
 * @returns {Object} Delta for each domain and average
 */
export function calculateDeltas(baselineScores, currentScores) {
  const domains = ['regulation', 'awareness', 'outlook', 'attention'];
  const deltas = {};
  let totalDelta = 0;
  
  domains.forEach(domain => {
    const baseline = baselineScores[domain] || 0;
    const current = currentScores[domain] || baseline;
    deltas[domain] = Math.round((current - baseline) * 100) / 100;
    totalDelta += deltas[domain];
  });
  
  deltas.average = Math.round((totalDelta / domains.length) * 100) / 100;
  
  return deltas;
}

/**
 * Calculate REwired Index from domain scores
 * @param {Object} domainScores - Object with regulation, awareness, outlook, attention scores (0-5 each)
 * @returns {number} REwired Index (0-100)
 */
export function calculateRewiredIndex(domainScores) {
  const { regulation, awareness, outlook, attention } = domainScores;
  
  // Average of 4 domains (each 0-5) converted to 0-100 scale
  const average = (regulation + awareness + outlook + attention) / 4;
  return Math.round(average * 20); // Convert 0-5 to 0-100
}

/**
 * Get tier name from REwired Index
 * @param {number} rewiredIndex - REwired Index (0-100)
 * @returns {Object} Tier info with name and description
 */
export function getTier(rewiredIndex) {
  for (const tier of Object.values(REWIRED_TIERS)) {
    if (rewiredIndex >= tier.min && rewiredIndex <= tier.max) {
      return { name: tier.name, description: tier.description };
    }
  }
  return { name: 'Unknown', description: '' };
}

/**
 * Check if user is eligible to unlock next stage
 * @param {Object} params - Current progress data
 * @returns {Object} Eligibility result with status and missing requirements
 */
export function checkUnlockEligibility({
  currentStage,
  adherencePercentage,
  consecutiveDays,
  deltas,
  baselineScores,
  currentScores
}) {
  // Stage 7 is max
  if (currentStage >= 7) {
    return {
      eligible: false,
      reason: 'Already at maximum stage',
      missing: []
    };
  }
  
  const threshold = UNLOCK_THRESHOLDS[currentStage];
  if (!threshold) {
    return {
      eligible: false,
      reason: 'Invalid stage',
      missing: []
    };
  }
  
  const missing = [];
  
  // Check adherence
  if (adherencePercentage < threshold.adherencePercent) {
    missing.push({
      requirement: 'adherence',
      current: adherencePercentage,
      required: threshold.adherencePercent,
      message: `Adherence: ${adherencePercentage}% (need ${threshold.adherencePercent}%)`
    });
  }
  
  // Check consecutive days
  if (consecutiveDays < threshold.consecutiveDays) {
    missing.push({
      requirement: 'consecutiveDays',
      current: consecutiveDays,
      required: threshold.consecutiveDays,
      message: `Consecutive days: ${consecutiveDays} (need ${threshold.consecutiveDays})`
    });
  }
  
  // Check deltas for required domains
  const domainDeltas = calculateDeltas(baselineScores, currentScores);
  const relevantDeltas = threshold.requiredDomains.map(d => domainDeltas[d] || 0);
  const averageRelevantDelta = relevantDeltas.reduce((a, b) => a + b, 0) / relevantDeltas.length;
  
  if (averageRelevantDelta < threshold.averageDelta) {
    missing.push({
      requirement: 'delta',
      current: averageRelevantDelta,
      required: threshold.averageDelta,
      message: `Average delta: ${averageRelevantDelta.toFixed(2)} (need ${threshold.averageDelta})`
    });
  }
  
  // Check if manual review is required
  if (threshold.manualReviewRequired) {
    missing.push({
      requirement: 'manualReview',
      message: 'Manual review required for Stage 7 unlock'
    });
  }
  
  return {
    eligible: missing.length === 0,
    reason: missing.length === 0 ? 'All requirements met' : 'Requirements not met',
    missing,
    threshold
  };
}

/**
 * Get practices for a specific stage
 * @param {number} stage - Stage number (1-7)
 * @returns {Array} Array of practice IDs required for this stage
 */
export function getStagePractices(stage) {
  return STAGE_PRACTICES[stage] || STAGE_PRACTICES[1];
}

/**
 * Get human-readable practice name
 * @param {string} practiceId - Practice ID
 * @returns {string} Human-readable name
 */
export function getPracticeName(practiceId) {
  const names = {
    'hrvb_breathing': 'Resonance Breathing (HRVB)',
    'awareness_rep': 'Awareness Rep',
    'somatic_flow': 'Somatic Flow',
    'micro_action': 'Morning Micro-Action',
    'flow_block': 'Flow Block',
    'co_regulation': 'Co-Regulation Practice',
    'nightly_debrief': 'Nightly Debrief'
  };
  return names[practiceId] || practiceId;
}

/**
 * Format duration for display
 * @param {string} practiceId - Practice ID
 * @returns {string} Duration string
 */
export function getPracticeDuration(practiceId) {
  const durations = {
    'hrvb_breathing': '5-7 min',
    'awareness_rep': '2 min',
    'somatic_flow': '3 min',
    'micro_action': '2-5 min',
    'flow_block': '60-90 min',
    'co_regulation': '3-5 min',
    'nightly_debrief': '2 min'
  };
  return durations[practiceId] || '';
}
