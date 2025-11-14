import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GitHub raw URL to your instructions file
const INSTRUCTIONS_URL = 'https://raw.githubusercontent.com/kusmich-ai/ios-install/main/instructions/system-prompt.txt';

// Cache the prompt so we don't fetch it every time
let cachedSystemPrompt = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getSystemPrompt() {
  const now = Date.now();
  
  // Return cached version if still fresh
  if (cachedSystemPrompt && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedSystemPrompt;
  }
  
  try {
    console.log('Fetching system prompt from GitHub...');
    const response = await fetch(INSTRUCTIONS_URL, {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch instructions: ${response.status}`);
    }
    
    cachedSystemPrompt = await response.text();
    lastFetchTime = now;
    console.log('System prompt loaded successfully');
    
    return cachedSystemPrompt;
  } catch (error) {
    console.error('Error fetching system prompt:', error);
    
    // Fallback: use cached version even if expired
    if (cachedSystemPrompt) {
      console.log('Using cached system prompt as fallback');
      return cachedSystemPrompt;
    }
    
    throw error;
  }
}

export async function POST(req) {
  const { messages, userId, baselineData } = await req.json();

    // Fetch system prompt
    const systemPrompt = await getSystemPrompt();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: systemPrompt,
      messages: messages,
    });

    return Response.json({
      content: response.content,
    });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
