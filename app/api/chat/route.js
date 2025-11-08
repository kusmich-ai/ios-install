import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// For now, inline the system prompt
// Later, move to GitHub and fetch it
const SYSTEM_PROMPT = `
[PASTE YOUR FULL IOS SYSTEM INSTALLER INSTRUCTIONS HERE]
`;

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
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
```

---

## **7. Add Environment Variables to Vercel**

Go to Vercel Dashboard → Your Project → Settings → Environment Variables:
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
