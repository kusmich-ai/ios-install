# Baseline Data Integration Guide

## How Baseline Data is Passed to Chat

When users complete the baseline assessment, data is passed to the chat page through **three mechanisms** for maximum reliability:

### 1. URL Query Parameters (Immediate Access)
When redirecting to `/chat`, these parameters are included:

```javascript
/chat?baseline_complete=true&rewired_index=45.2&regulation=3.20&awareness=2.80&outlook=3.50&attention=2.90&tier=Operational%20(Stabilizing)&user_id=user_1234567890_abc123
```

**Access in Chat Component:**
```javascript
import { useSearchParams } from 'next/navigation';

function ChatPage() {
  const searchParams = useSearchParams();
  
  const baselineComplete = searchParams.get('baseline_complete') === 'true';
  const rewiredIndex = parseFloat(searchParams.get('rewired_index'));
  const regulation = parseFloat(searchParams.get('regulation'));
  const awareness = parseFloat(searchParams.get('awareness'));
  const outlook = parseFloat(searchParams.get('outlook'));
  const attention = parseFloat(searchParams.get('attention'));
  const tier = searchParams.get('tier');
  const userId = searchParams.get('user_id');
  
  // Use this data to initialize the IOS System
}
```

### 2. Storage API (Persistent Access)
Three keys are stored in Supabase via your storage wrapper:

**Key 1: `baseline_{userId}`** - Full assessment data
```javascript
{
  responses: { cc1: 2, cc2: 3, ... }, // All raw responses
  scores: {
    regulation: 3.20,
    awareness: 2.80,
    outlook: 3.50,
    attention: 2.90,
    focusDiagnostic: 2.85,
    presenceTest: 2.95,
    rewiredIndex: 45.2,
    tier: "Operational (Stabilizing)"
  },
  timestamp: "2024-01-15T10:30:00.000Z",
  userId: "user_1234567890_abc123"
}
```

**Key 2: `ios_current_baseline`** - Quick access summary
```javascript
{
  userId: "user_1234567890_abc123",
  scores: { ... }, // Same as above
  timestamp: "2024-01-15T10:30:00.000Z",
  completed: true
}
```

**Key 3: `ios_baseline_complete`** - Simple flag
```javascript
"true"
```

**Access in Chat Component:**
```javascript
import { storage } from '../lib/storage';

async function loadBaselineData(userId) {
  // Method 1: Get quick summary
  const result = await storage.get('ios_current_baseline');
  if (result && result.value) {
    const baseline = JSON.parse(result.value);
    return baseline.scores;
  }
  
  // Method 2: Get full data
  const fullResult = await storage.get(`baseline_${userId}`);
  if (fullResult && fullResult.value) {
    const fullBaseline = JSON.parse(fullResult.value);
    return fullBaseline.scores;
  }
  
  return null;
}
```

### 3. LocalStorage (Browser Fallback)
If Supabase fails, data is stored in browser localStorage with same keys.

```javascript
// Access from localStorage directly
const userId = localStorage.getItem('ios_user_id');
const baselineStr = localStorage.getItem(`baseline_${userId}`);
if (baselineStr) {
  const baseline = JSON.parse(baselineStr);
  console.log(baseline.scores);
}
```

---

## Recommended Chat Page Implementation

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { storage } from '../lib/storage';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [baselineData, setBaselineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBaseline();
  }, []);

  const loadBaseline = async () => {
    // Priority 1: URL params (immediate access)
    if (searchParams.get('baseline_complete') === 'true') {
      setBaselineData({
        rewiredIndex: parseFloat(searchParams.get('rewired_index')),
        regulation: parseFloat(searchParams.get('regulation')),
        awareness: parseFloat(searchParams.get('awareness')),
        outlook: parseFloat(searchParams.get('outlook')),
        attention: parseFloat(searchParams.get('attention')),
        tier: searchParams.get('tier'),
        userId: searchParams.get('user_id')
      });
      setIsLoading(false);
      return;
    }

    // Priority 2: Storage API (persistent access)
    try {
      const result = await storage.get('ios_current_baseline');
      if (result && result.value) {
        const baseline = JSON.parse(result.value);
        setBaselineData(baseline.scores);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Error loading baseline from storage:', error);
    }

    // Priority 3: LocalStorage fallback
    const userId = localStorage.getItem('ios_user_id');
    if (userId) {
      const baselineStr = localStorage.getItem(`baseline_${userId}`);
      if (baselineStr) {
        const baseline = JSON.parse(baselineStr);
        setBaselineData(baseline.scores);
        setIsLoading(false);
        return;
      }
    }

    // No baseline found - redirect to assessment
    console.warn('No baseline data found - redirecting to assessment');
    window.location.href = '/assessment';
  };

  if (isLoading) {
    return <div>Loading baseline data...</div>;
  }

  return (
    <div>
      <h1>IOS System Installer</h1>
      <div>
        <h2>Your Baseline</h2>
        <p>REwired Index: {baselineData.rewiredIndex}</p>
        <p>Tier: {baselineData.tier}</p>
        {/* Display dashboard and start IOS installation */}
      </div>
    </div>
  );
}
```

---

## Initial Message to Claude (In Chat)

When the chat loads with baseline data, you should send an initial message to Claude:

```javascript
const initializeChat = async () => {
  if (baselineData) {
    const initialMessage = `Hey. I'm ${baselineData.userId} and I just completed my baseline assessment.

My REwired Index: ${baselineData.rewiredIndex} (${baselineData.tier})

Domain Scores:
- Regulation: ${baselineData.regulation}/5.0
- Awareness: ${baselineData.awareness}/5.0
- Outlook: ${baselineData.outlook}/5.0
- Attention: ${baselineData.attention}/5.0

Ready to start the IOS installation.`;

    // Send this message to Claude to initialize the conversation
    await sendMessageToClaude(initialMessage);
  }
};
```

---

## Data Structure Reference

### Complete Baseline Object
```typescript
interface BaselineData {
  responses: {
    [questionId: string]: number; // Raw responses to all questions
  };
  scores: {
    regulation: number;      // 0-5 scale
    awareness: number;       // 0-5 scale
    outlook: number;         // 0-5 scale
    attention: number;       // 0-5 scale (average of focus + presence)
    focusDiagnostic: number; // 0-5 scale
    presenceTest: number;    // 0-5 scale (BCT score)
    rewiredIndex: number;    // 0-100 scale
    tier: string;            // Text tier classification
  };
  timestamp: string;         // ISO datetime
  userId: string;
}
```

### Tier Classifications
- 0-20: "System Offline (Critical)"
- 21-40: "Baseline Mode (Installing...)"
- 41-60: "Operational (Stabilizing)"
- 61-80: "Optimized (Coherent)"
- 81-100: "Integrated (Embodied)"

---

## Testing

To test baseline data flow:

1. Complete assessment at `/assessment`
2. Check browser console for "✅ Baseline data saved to Supabase"
3. Verify redirect to `/chat` with URL params
4. Check Supabase `storage` table for entries with keys:
   - `baseline_{userId}`
   - `ios_current_baseline`
   - `ios_baseline_complete`
5. Verify chat page receives and displays baseline data
