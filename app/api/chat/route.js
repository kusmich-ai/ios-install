// ============================================
// app/api/chat/route.js - ADD micro_action_extraction CONTEXT
// ============================================

// Find your context switch statement in route.js
// It probably looks something like this:
//
// let maxTokens = 2048;
// let temperature = 0.7;
// 
// switch (context) {
//   case 'micro_action_setup':
//     maxTokens = 2048;
//     temperature = 0.7;
//     break;
//   case 'flow_block_setup':
//     ...
// }

// ADD THIS NEW CASE after your existing cases:

case 'micro_action_extraction':
  // Low temperature for consistent structured JSON output
  // Small token limit since we only need a JSON object
  maxTokens = 500;
  temperature = 0.3;
  break;


// ============================================
// FULL EXAMPLE CONTEXT SWITCH (for reference)
// ============================================

/*
let maxTokens = 2048;  // default
let temperature = 0.7; // default

switch (context) {
  case 'micro_action_setup':
    maxTokens = 2048;
    temperature = 0.7;
    break;
    
  case 'micro_action_extraction':  
    maxTokens = 500;
    temperature = 0.3;
    break;
    
  case 'flow_block_setup':
    maxTokens = 2048;
    temperature = 0.7;
    break;
    
  case 'flow_block_extraction':
    maxTokens = 500;
    temperature = 0.3;
    break;
    
  case 'weekly_check_in':
    maxTokens = 1024;
    temperature = 0.5;
    break;
    
  default:
    // Use defaults
    break;
}
*/


// ============================================
// IF YOUR ROUTE.JS ALSO HANDLES SYSTEM PROMPTS
// ============================================
// Make sure extraction calls (which already include system prompt) 
// don't get a duplicate system prompt added.
// 
// Check if your route has logic like:
// 
// const hasSystemPrompt = messages.some(m => m.role === 'system');
// const finalMessages = hasSystemPrompt 
//   ? messages 
//   : [{ role: 'system', content: systemPrompt }, ...messages];
//
// If not, you may need to add this check to prevent double system prompts.
