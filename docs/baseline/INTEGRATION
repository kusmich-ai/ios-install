# BASELINE DATA INTEGRATION - Quick Reference

## For Building the Chat Page

When users complete the baseline assessment at `/assessment`, they are redirected to `/chat` with their baseline data. The chat page needs to receive this data to initialize the IOS System Installer.

### How Data is Passed

**1. URL Parameters** (Primary - instant access)
```
/chat?baseline_complete=true&rewired_index=45.2&regulation=3.20&awareness=2.80&outlook=3.50&attention=2.90&tier=Operational%20(Stabilizing)&user_id=user_123
```

**2. Storage Keys** (Secondary - persistent)
- `ios_current_baseline` - Quick access summary with scores
- `baseline_{userId}` - Full assessment data with all responses
- `ios_baseline_complete` - Simple completion flag

**3. localStorage** (Fallback - same keys as above)

### Chat Page Implementation

```javascript
'use client';
import { useSearchParams } from 'next/navigation';
import { storage } from '../lib/storage';

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [baselineData, setBaselineData] = useState(null);

  useEffect(() => {
    // Load from URL params first
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
    }
  }, []);

  // Send initial message to Claude with baseline data
  const initMessage = `Hey. I just completed my baseline assessment.

REwired Index: ${baselineData.rewiredIndex} (${baselineData.tier})

Domain Scores:
- Regulation: ${baselineData.regulation}/5.0
- Awareness: ${baselineData.awareness}/5.0
- Outlook: ${baselineData.outlook}/5.0
- Attention: ${baselineData.attention}/5.0

Ready to start IOS installation.`;
}
```

### Data Structure
```typescript
interface BaselineScores {
  rewiredIndex: number;      // 0-100 scale
  regulation: number;        // 0-5 scale
  awareness: number;         // 0-5 scale
  outlook: number;           // 0-5 scale
  attention: number;         // 0-5 scale
  focusDiagnostic: number;   // 0-5 scale
  presenceTest: number;      // 0-5 scale
  tier: string;              // Classification
  userId: string;
}
```

### Tier Classifications
- 0-20: "System Offline (Critical)"
- 21-40: "Baseline Mode (Installing...)"
- 41-60: "Operational (Stabilizing)"
- 61-80: "Optimized (Coherent)"
- 81-100: "Integrated (Embodied)"

### What Claude (IOS Installer) Needs

When the chat initializes, Claude needs:
1. The baseline scores (to display current state)
2. User ID (for tracking progress)
3. REwired Index and tier (to determine starting stage)

Claude will then:
- Display the baseline dashboard
- Begin the initialization sequence
- Start Stage 1 (Neural Priming) based on the baseline assessment
