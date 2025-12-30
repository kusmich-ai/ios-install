'use client';

import Link from 'next/link';

// Colors
const COLORS = {
  background: "#000000",
  textPrimary: "#F5F2EC",
  textDim: "rgba(245, 242, 236, 0.5)",
  textMuted: "rgba(245, 242, 236, 0.35)",
  accent: "#ff9e19",
  accentDim: "rgba(255, 158, 25, 0.15)",
  cardBg: "rgba(255, 255, 255, 0.03)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
};

// Tool Card Component
function ToolCard({ 
  icon, 
  title, 
  duration, 
  frequency, 
  description, 
  href 
}: { 
  icon: string;
  title: string;
  duration: string;
  frequency: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        style={{
          backgroundColor: COLORS.cardBg,
          border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255, 158, 25, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 158, 25, 0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = COLORS.cardBorder;
          e.currentTarget.style.backgroundColor = COLORS.cardBg;
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 400, 
              color: COLORS.textPrimary,
              margin: 0,
              fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
            }}>
              {title}
            </h3>
          </div>
          <span style={{ 
            fontSize: '0.8rem', 
            color: COLORS.accent,
            fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
          }}>
            {duration}
          </span>
        </div>
        <p style={{ 
          fontSize: '0.75rem', 
          color: COLORS.textMuted, 
          margin: '0 0 0.75rem 0',
          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {frequency}
        </p>
        <p style={{ 
          fontSize: '0.85rem', 
          color: COLORS.textDim, 
          margin: '0 0 1rem 0',
          lineHeight: 1.5,
          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {description}
        </p>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          color: COLORS.accent,
          fontSize: '0.85rem',
          fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          <span>Begin</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// Pillar Card Component
function PillarCard({ 
  number, 
  title, 
  subtitle,
  points 
}: { 
  number: string;
  title: string;
  subtitle: string;
  points: string[];
}) {
  return (
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        flex: 1,
        minWidth: '280px',
      }}
    >
      <div style={{ 
        fontSize: '0.7rem', 
        color: COLORS.accent, 
        letterSpacing: '0.15em',
        marginBottom: '0.5rem',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        PILLAR {number}
      </div>
      <h3 style={{ 
        fontSize: '1.1rem', 
        fontWeight: 400, 
        color: COLORS.textPrimary,
        margin: '0 0 0.25rem 0',
        fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '0.8rem', 
        color: COLORS.textDim, 
        margin: '0 0 1rem 0',
        fontStyle: 'italic',
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {subtitle}
      </p>
      <ul style={{ 
        margin: 0, 
        paddingLeft: '1rem',
        fontSize: '0.8rem',
        color: COLORS.textDim,
        lineHeight: 1.8,
        fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {points.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    </div>
  );
}

// Section Header Component
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 style={{
      fontSize: '0.75rem',
      fontWeight: 500,
      letterSpacing: '0.2em',
      color: COLORS.accent,
      textTransform: 'uppercase',
      marginBottom: '1.5rem',
      fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {title}
    </h2>
  );
}

// Main Page Component
export default function AwakenWith5Page() {
  const fontHeading = {
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 300 as const,
  };

  const fontBody = {
    fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontWeight: 400 as const,
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
        ...fontBody,
      }}
    >
      {/* Hero Section */}
      <header
        style={{
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontSize: '0.7rem',
            fontWeight: 500,
            letterSpacing: '0.2em',
            color: COLORS.accent,
            textTransform: 'uppercase',
            marginBottom: '1rem',
          }}
        >
          Awaken with 5
        </p>
        <h1
          style={{
            ...fontHeading,
            fontSize: 'clamp(2rem, 6vw, 2.75rem)',
            marginBottom: '2rem',
            letterSpacing: '0.02em',
          }}
        >
          Preparation Guide
        </h1>
        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.125rem)',
            color: COLORS.textDim,
            lineHeight: 1.7,
            fontStyle: 'italic',
            maxWidth: '540px',
            margin: '0 auto',
          }}
        >
          "5-MeO doesn't require you to learn anything.<br />
          It requires you to let go of everything you think you are."
        </p>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        
        {/* Purpose Section */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="The Purpose of Preparation" />
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {/* Not About */}
            <div
              style={{
                backgroundColor: COLORS.cardBg,
                border: `1px solid ${COLORS.cardBorder}`,
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ 
                fontSize: '0.9rem', 
                fontWeight: 400, 
                color: COLORS.textMuted,
                margin: '0 0 1rem 0',
              }}>
                Preparation is <span style={{ color: 'rgba(255,100,100,0.7)' }}>not</span> about:
              </h3>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: COLORS.textDim,
                lineHeight: 2,
              }}>
                <li>Trying to "achieve" anything</li>
                <li>Fixing yourself</li>
                <li>Spiritual performance</li>
                <li>Forcing or expecting outcomes</li>
              </ul>
            </div>

            {/* Is About */}
            <div
              style={{
                backgroundColor: 'rgba(255, 158, 25, 0.05)',
                border: `1px solid rgba(255, 158, 25, 0.15)`,
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              <h3 style={{ 
                fontSize: '0.9rem', 
                fontWeight: 400, 
                color: COLORS.textDim,
                margin: '0 0 1rem 0',
              }}>
                Preparation <span style={{ color: COLORS.accent }}>is</span> about:
              </h3>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: COLORS.textDim,
                lineHeight: 2,
              }}>
                <li>Tuning your nervous system into safety & openness</li>
                <li>Reducing internal friction</li>
                <li>Strengthening your "surrender reflex"</li>
                <li>Loosening identity so recognition can happen</li>
              </ul>
            </div>
          </div>

          <p style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.85rem', 
            color: COLORS.textMuted,
            lineHeight: 1.7,
          }}>
            Our protocol upgrades the NOS (Neural Operating System) so the MOS (Mental Operating System) doesn't panic when constructs dissolve.
          </p>
        </section>

        {/* Three Pillars */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="Three Foundational Pillars" />
          
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <PillarCard
              number="1"
              title="Nervous System Regulation"
              subtitle="The highest leverage variable"
              points={[
                "Increases vagal tone",
                "Inhibits fear circuitry",
                "Enhances parasympathetic dominance",
                "Reduces panic & fight/flight response",
              ]}
            />
            <PillarCard
              number="2"
              title="Surrender Conditioning"
              subtitle="Stay open while everything changes"
              points={[
                "Reduces cortical prediction rigidity",
                "Trains brain to accept rapid change",
                "Weakens self-protection reflex",
                "Strengthens interoceptive accuracy",
              ]}
            />
            <PillarCard
              number="3"
              title="Awareness Familiarization"
              subtitle="Recognize awareness itself"
              points={[
                "Primes Default Mode Network deactivation",
                "Strengthens meta-awareness",
                "Makes recognition intuitive",
                "Not conceptual — experiential",
              ]}
            />
          </div>
        </section>

        {/* Your Preparation Tools */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="Your Preparation Tools" />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ToolCard
              icon="☀️"
              title="Daily Core Ritual"
              duration="7 min"
              frequency="5-6 days per week for 4 weeks"
              description="Guided audio combining Resonance Breathing, Open Monitoring, Awareness Recognition, and Somatic Slide."
              href="/tools/aw5-prep"
            />
            <ToolCard
              icon="🌊"
              title="Surrender Simulation"
              duration="~6 min"
              frequency="1-2 days per week for 4 weeks"
              description="Progressive breath holds that train your body to remain open as intensity rises, without attempting to manage it."
              href="/tools/surrender-simulation"
            />
            <ToolCard
              icon="🔮"
              title="Identity Softening"
              duration="~5 min"
              frequency="1-2 days per week for 4 weeks"
              description="Silent inquiry that loosens identity so recognition can happen effortlessly. Not about finding who you are — but noticing what remains."
              href="/tools/identity-softening"
            />
          </div>

          {/* Optional Add-on */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.25rem',
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '12px',
            }}
          >
            <p style={{ 
              fontSize: '0.75rem', 
              color: COLORS.textMuted, 
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Optional Add-on
            </p>
            <p style={{ fontSize: '0.9rem', color: COLORS.textDim, margin: 0, lineHeight: 1.6 }}>
              <a 
                href="https://pliability.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: COLORS.accent, textDecoration: 'none' }}
              >
                Pliability
              </a>
              {' '}— disguised as mobility, it's actually an awareness primer and nervous system trainer. Follow daily routines 5+ days/week.
            </p>
          </div>
        </section>

        {/* What to Avoid */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="What to Avoid" />
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* 7 Days */}
            <div
              style={{
                backgroundColor: 'rgba(255, 100, 100, 0.05)',
                border: '1px solid rgba(255, 100, 100, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255, 130, 130, 0.9)',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
              }}>
                7 Days Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1rem',
                fontSize: '0.85rem',
                color: COLORS.textDim,
                lineHeight: 2,
              }}>
                <li>Alcohol</li>
                <li>Cannabis</li>
                <li>Heavy stimulant use</li>
              </ul>
              <p style={{ 
                fontSize: '0.75rem', 
                color: COLORS.textMuted, 
                marginTop: '0.75rem',
                marginBottom: 0,
                fontStyle: 'italic',
              }}>
                Dysregulates nervous system
              </p>
            </div>

            {/* 48 Hours */}
            <div
              style={{
                backgroundColor: 'rgba(255, 180, 100, 0.05)',
                border: '1px solid rgba(255, 180, 100, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255, 180, 100, 0.9)',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
              }}>
                48 Hours Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1rem',
                fontSize: '0.85rem',
                color: COLORS.textDim,
                lineHeight: 2,
              }}>
                <li>Psychedelics</li>
                <li>Intense breathwork</li>
                <li>Extreme cardio</li>
              </ul>
              <p style={{ 
                fontSize: '0.75rem', 
                color: COLORS.textMuted, 
                marginTop: '0.75rem',
                marginBottom: 0,
                fontStyle: 'italic',
              }}>
                Agitates the system
              </p>
            </div>

            {/* 24 Hours */}
            <div
              style={{
                backgroundColor: 'rgba(255, 220, 100, 0.05)',
                border: '1px solid rgba(255, 220, 100, 0.15)',
                borderRadius: '12px',
                padding: '1.25rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255, 220, 100, 0.9)',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
              }}>
                24 Hours Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1rem',
                fontSize: '0.85rem',
                color: COLORS.textDim,
                lineHeight: 2,
              }}>
                <li>Porn / overstimulation</li>
                <li>Social media spirals</li>
                <li>Conflict</li>
                <li>Caffeine / stimulants</li>
              </ul>
              <p style={{ 
                fontSize: '0.75rem', 
                color: COLORS.textMuted, 
                marginTop: '0.75rem',
                marginBottom: 0,
                fontStyle: 'italic',
              }}>
                Keeps MOS hyperactive
              </p>
            </div>
          </div>
        </section>

        {/* Day Before Protocol */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="Day Before Protocol" />
          
          <div
            style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🌙</span>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 400, 
                color: COLORS.textPrimary,
                margin: 0,
              }}>
                Evening Prep (10 minutes)
              </h3>
            </div>
            
            <ol style={{ 
              margin: '0 0 1.5rem 0', 
              paddingLeft: '1.5rem',
              fontSize: '0.9rem',
              color: COLORS.textDim,
              lineHeight: 2,
            }}>
              <li>Complete the Daily Core Ritual</li>
              <li>1 minute: Light gratitude + identity softening</li>
            </ol>

            <p style={{ 
              fontSize: '0.85rem', 
              color: COLORS.textMuted, 
              margin: '0 0 0.75rem 0',
              fontWeight: 500,
            }}>
              Then:
            </p>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.5rem',
              fontSize: '0.9rem',
              color: COLORS.textDim,
              lineHeight: 2,
            }}>
              <li>Early bedtime</li>
              <li>Very light protein/carbs, no heavy meals</li>
              <li>Hydration</li>
              <li>No screens 90 mins before sleep</li>
              <li>No important decisions or intense conversations</li>
            </ul>

            <p style={{ 
              marginTop: '1.25rem',
              marginBottom: 0,
              fontSize: '0.85rem', 
              color: COLORS.textMuted,
              fontStyle: 'italic',
            }}>
              Let the nervous system settle into safety.
            </p>
          </div>
        </section>

        {/* Morning Of */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="Morning of Ceremony" />
          
          <div
            style={{
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '12px',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.25rem' }}>☀️</span>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 400, 
                color: COLORS.textPrimary,
                margin: 0,
              }}>
                The Day Has Arrived
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  1. Follow your normal routine
                </p>
                <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, margin: 0 }}>
                  Don't be weird. Predictability = safety.
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  2. Fast (or very light meal if needed)
                </p>
                <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, margin: 0 }}>
                  We don't want your stomach full of food.
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  3. "Allow Everything" mantra
                </p>
                <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, margin: 0 }}>
                  Repeat internally: "I am unconditionally open to allow any unfolding."
                </p>
              </div>
            </div>

            {/* Mantra highlight */}
            <div
              style={{
                marginTop: '1.5rem',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 158, 25, 0.08)',
                border: '1px solid rgba(255, 158, 25, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <p style={{ 
                fontSize: '1rem', 
                color: COLORS.accent,
                margin: 0,
                fontStyle: 'italic',
                lineHeight: 1.6,
              }}>
                "I am unconditionally open to allow any unfolding."
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <p style={{ fontSize: '0.75rem', color: COLORS.textMuted }}>
            Part of the{' '}
            <a
              href="https://unbecoming.app"
              style={{ color: 'rgba(255, 158, 25, 0.6)', textDecoration: 'none' }}
            >
              IOS System
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
