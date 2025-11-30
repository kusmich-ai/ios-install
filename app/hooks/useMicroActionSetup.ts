// useMicroActionSetup.ts
// Hook to manage the Morning Micro-Action identity installation flow

import { useState, useCallback } from 'react';
import { 
  MicroActionSetupState, 
  MicroActionSetupStep,
  initialMicroActionState,
  microActionTemplates,
  renderMicroActionTemplate,
  getNextMicroActionStep,
  microActionAPIPrompts
} from './microActionTemplates';

interface UseMicroActionSetupProps {
  userId: string;
  onComplete: (identity: string, action: string) => void;
  onAPICall: (prompt: string, context: string) => Promise<string>;
}

interface SetupMessage {
  role: 'assistant' | 'user';
  content: string;
  quickReplies?: string[];
}

export function useMicroActionSetup({ userId, onComplete, onAPICall }: UseMicroActionSetupProps) {
  const [state, setState] = useState<MicroActionSetupState>(initialMicroActionState);
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<SetupMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Start the setup flow
  const startSetup = useCallback(async (existingIdentity?: string, existingAction?: string) => {
    setIsActive(true);
    
    // Check if returning user
    const isReturning = !!(existingIdentity && existingAction);
    
    const newState: MicroActionSetupState = {
      ...initialMicroActionState,
      isFirstTime: !isReturning,
      previousIdentity: existingIdentity || null,
      previousAction: existingAction || null,
      step: 'detect_context'
    };
    
    setState(newState);
    
    // Show first message
    const template = microActionTemplates.detect_context;
    setMessages([{
      role: 'assistant',
      content: template.message,
      quickReplies: template.quickReplies
    }]);
  }, []);

  // Process user response
  const processResponse = useCallback(async (userResponse: string) => {
    if (!isActive || isProcessing) return;
    
    setIsProcessing(true);
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userResponse }]);
    
    // Get next step
    const { nextStep, requiresAPI } = getNextMicroActionStep(state.step, state, userResponse);
    
    // Update state based on current step and response
    let updatedState = { ...state };
    
    // Handle state updates based on current step
    switch (state.step) {
      case 'detect_context':
        updatedState.isFirstTime = userResponse.toLowerCase().includes('first');
        break;
      
      case 'friction_discovery':
      case 'friction_followup':
        updatedState.frictionDescription = userResponse;
        break;
      
      case 'identity_type':
        updatedState.identityType = userResponse.toLowerCase().includes('capacity') 
          ? 'additive' 
          : 'subtractive';
        break;
      
      case 'identity_phrasing':
      case 'identity_refinement':
        // Extract identity from response (user types "I am..." or we parse it)
        const identityMatch = userResponse.match(/["""](.+?)["""]|I am (.+)|I'm (.+)/i);
        if (identityMatch) {
          updatedState.chosenIdentity = identityMatch[1] || identityMatch[2] || identityMatch[3];
        } else {
          updatedState.chosenIdentity = userResponse.trim();
        }
        break;
      
      case 'identity_confirmation':
        if (userResponse.toLowerCase().includes('right') || userResponse.toLowerCase().includes('yes')) {
          // Identity confirmed, filters already passed conceptually
        }
        break;
      
      case 'filter_concrete':
        updatedState.identityPassedFilters.concrete = 
          !userResponse.toLowerCase().includes('off') && 
          !userResponse.toLowerCase().includes('not sure') &&
          userResponse.length > 20; // They gave a substantive answer
        break;
      
      case 'filter_coherent':
        updatedState.identityPassedFilters.coherent = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('align');
        break;
      
      case 'filter_containable':
        updatedState.identityPassedFilters.containable = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('can see');
        break;
      
      case 'filter_compelling':
        updatedState.identityPassedFilters.compelling = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('feel');
        break;
      
      case 'action_discovery':
        updatedState.chosenAction = userResponse.trim();
        break;
      
      case 'action_atomic':
        updatedState.actionPassedTests.atomic = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('even on');
        break;
      
      case 'action_congruent':
        updatedState.actionPassedTests.congruent = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('clearly');
        break;
      
      case 'action_emotional':
        updatedState.actionPassedTests.emotional = 
          userResponse.toLowerCase().includes('alignment') || 
          userResponse.toLowerCase().includes('yes');
        break;
      
      case 'commitment':
        updatedState.committed = 
          userResponse.toLowerCase().includes('yes') || 
          userResponse.toLowerCase().includes('commit');
        if (updatedState.committed) {
          updatedState.sprintStartDate = new Date().toISOString();
        }
        break;
    }
    
    updatedState.step = nextStep;
    setState(updatedState);
    
    // Generate response
    let responseContent = '';
    let quickReplies: string[] | undefined;
    
    if (requiresAPI) {
      // Call API for adaptive coaching
      const apiPrompt = getAPIPrompt(state.step, updatedState, userResponse);
      if (apiPrompt) {
        try {
          responseContent = await onAPICall(apiPrompt, `Micro-Action Setup: ${state.step}`);
        } catch (error) {
          console.error('API call failed:', error);
          responseContent = "Let me rephrase that. " + getFallbackMessage(state.step, updatedState);
        }
      }
    } else {
      // Use template
      const templateKey = getTemplateKey(nextStep, updatedState);
      if (templateKey && templateKey in microActionTemplates) {
        const template = microActionTemplates[templateKey as keyof typeof microActionTemplates];
        responseContent = renderMicroActionTemplate(templateKey as keyof typeof microActionTemplates, updatedState);
        if ('quickReplies' in template) {
          quickReplies = template.quickReplies;
        }
      }
    }
    
    // Add assistant message
    if (responseContent) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: responseContent,
        quickReplies 
      }]);
    }
    
    // Check if complete
    if (nextStep === 'complete' && updatedState.chosenIdentity && updatedState.chosenAction) {
      onComplete(updatedState.chosenIdentity, updatedState.chosenAction);
      setIsActive(false);
    }
    
    setIsProcessing(false);
  }, [state, isActive, isProcessing, onAPICall, onComplete]);

  // Cancel setup
  const cancelSetup = useCallback(() => {
    setIsActive(false);
    setState(initialMicroActionState);
    setMessages([]);
  }, []);

  return {
    isActive,
    state,
    messages,
    isProcessing,
    startSetup,
    processResponse,
    cancelSetup,
    currentQuickReplies: messages[messages.length - 1]?.quickReplies
  };
}

// Helper: Get API prompt for current step
function getAPIPrompt(
  step: MicroActionSetupStep, 
  state: MicroActionSetupState, 
  userResponse: string
): string | null {
  switch (step) {
    case 'friction_discovery':
    case 'friction_followup':
      return microActionAPIPrompts.friction_followup(state, userResponse);
    
    case 'identity_phrasing':
    case 'identity_refinement':
      return microActionAPIPrompts.identity_refinement(state, userResponse);
    
    case 'filter_concrete':
    case 'filter_coherent':
    case 'filter_containable':
    case 'filter_compelling':
    case 'filter_refinement':
      const failedFilter = !state.identityPassedFilters.concrete ? 'concrete'
        : !state.identityPassedFilters.coherent ? 'coherent'
        : !state.identityPassedFilters.containable ? 'containable'
        : 'compelling';
      return microActionAPIPrompts.filter_refinement(state, failedFilter, userResponse);
    
    case 'action_atomic':
    case 'action_congruent':
    case 'action_emotional':
    case 'action_refinement':
      const failedTest = !state.actionPassedTests.atomic ? 'atomic'
        : !state.actionPassedTests.congruent ? 'congruent'
        : 'emotional';
      return microActionAPIPrompts.action_refinement(state, failedTest, userResponse);
    
    default:
      return null;
  }
}

// Helper: Get template key for step
function getTemplateKey(step: MicroActionSetupStep, state: MicroActionSetupState): string {
  switch (step) {
    case 'welcome_first':
      return 'welcome_first';
    case 'welcome_returning':
      return 'welcome_returning';
    case 'friction_discovery':
      return 'friction_discovery';
    case 'identity_type':
      return 'identity_type';
    case 'identity_phrasing':
      return state.identityType === 'additive' ? 'identity_type_additive' : 'identity_type_subtractive';
    case 'filter_concrete':
      return state.identityPassedFilters.concrete ? 'filter_concrete_pass' : 'filter_concrete';
    case 'filter_coherent':
      return state.identityPassedFilters.coherent ? 'filter_coherent_pass' : 'filter_coherent';
    case 'filter_containable':
      return state.identityPassedFilters.containable ? 'filter_containable_pass' : 'filter_containable';
    case 'filter_compelling':
      return state.identityPassedFilters.compelling ? 'filter_compelling_pass' : 'filter_compelling';
    case 'action_discovery':
      return 'action_discovery';
    case 'action_atomic':
      return state.actionPassedTests.atomic ? 'action_atomic_pass' : 'action_atomic';
    case 'action_congruent':
      return state.actionPassedTests.congruent ? 'action_congruent_pass' : 'action_congruent';
    case 'action_emotional':
      return state.actionPassedTests.emotional ? 'action_emotional_pass' : 'action_emotional';
    case 'contract_creation':
      return 'contract_creation';
    case 'commitment':
      return 'commitment';
    case 'close':
      return 'close';
    default:
      return step;
  }
}

// Helper: Fallback message if API fails
function getFallbackMessage(step: MicroActionSetupStep, state: MicroActionSetupState): string {
  switch (step) {
    case 'friction_followup':
      return "Tell me more about that. What specifically feels most misaligned right now?";
    case 'identity_refinement':
      return `So you're working with "${state.chosenIdentity}" - does that phrasing feel right, or should we adjust it?`;
    case 'filter_refinement':
      return "That's helpful. Let me ask the question differently - what would this look like in practice?";
    case 'action_refinement':
      return "Let's try a smaller version. What's the tiniest proof of this identity you could do in under 2 minutes?";
    default:
      return "Let's continue. What feels most true to you?";
  }
}
