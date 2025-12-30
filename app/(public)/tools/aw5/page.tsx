'use client';

import Link from 'next/link';

// Colors - matching awakenwith5.com light aesthetic
const COLORS = {
  background: "#FAF9F7",
  backgroundAlt: "#F5F3F0",
  textPrimary: "#1a1a1a",
  textSecondary: "#4a4a4a",
  textMuted: "#7a7a7a",
  accent: "#c9a227", // warm gold
  accentHover: "#b8922a",
  cardBg: "#FFFFFF",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  divider: "rgba(0, 0, 0, 0.06)",
};

// Tool Card Component - More prominent with button
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
    <div
      style={{
        backgroundColor: COLORS.cardBg,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem' }}>{icon}</span>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 500, 
            color: COLORS.textPrimary,
            margin: 0,
            fontFamily: "'Cormorant Garamond', Georgia, serif",
          }}>
            {title}
          </h3>
        </div>
        <span style={{ 
          fontSize: '0.85rem', 
          color: COLORS.accent,
          fontWeight: 500,
          fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
          {duration}
        </span>
      </div>
      
      <p style={{ 
        fontSize: '0.8rem', 
        color: COLORS.textMuted, 
        margin: '0 0 1rem 0',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {frequency}
      </p>
      
      <p style={{ 
        fontSize: '0.95rem', 
        color: COLORS.textSecondary, 
        margin: '0 0 1.5rem 0',
        lineHeight: 1.6,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {description}
      </p>
      
      <Link href={href} style={{ textDecoration: 'none' }}>
        <button
          style={{
            padding: '0.875rem 1.75rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            backgroundColor: COLORS.accent,
            color: '#fff',
            border: 'none',
            borderRadius: '100px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.accentHover;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.accent;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Begin Practice
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </Link>
    </div>
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
        borderRadius: '16px',
        padding: '1.75rem',
        flex: 1,
        minWidth: '280px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      }}
    >
      <div style={{ 
        fontSize: '0.7rem', 
        color: COLORS.accent, 
        letterSpacing: '0.15em',
        marginBottom: '0.5rem',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        fontWeight: 600,
      }}>
        PILLAR {number}
      </div>
      <h3 style={{ 
        fontSize: '1.1rem', 
        fontWeight: 500, 
        color: COLORS.textPrimary,
        margin: '0 0 0.25rem 0',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}>
        {title}
      </h3>
      <p style={{ 
        fontSize: '0.85rem', 
        color: COLORS.textMuted, 
        margin: '0 0 1rem 0',
        fontStyle: 'italic',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}>
        {subtitle}
      </p>
      <ul style={{ 
        margin: 0, 
        paddingLeft: '1.25rem',
        fontSize: '0.85rem',
        color: COLORS.textSecondary,
        lineHeight: 1.9,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
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
      fontWeight: 600,
      letterSpacing: '0.2em',
      color: COLORS.accent,
      textTransform: 'uppercase',
      marginBottom: '1.5rem',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {title}
    </h2>
  );
}

// Main Page Component
export default function AwakenWith5Page() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
      `}</style>

      {/* Hero Section */}
      <header
        style={{
          padding: '4rem 1.5rem 3rem',
          textAlign: 'center',
          maxWidth: '760px',
          margin: '0 auto',
        }}
      >
        <p
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
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
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(2.25rem, 6vw, 3rem)',
            fontWeight: 500,
            marginBottom: '2.5rem',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          Preparation Guide
        </h1>
        <p
          style={{
            fontSize: 'clamp(1.05rem, 3vw, 1.2rem)',
            color: COLORS.textSecondary,
            lineHeight: 1.8,
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          5-MeO through our Awaken with 5 experience doesn't require you to "learn" anything. It requires you to let go of everything you think you are.
        </p>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '940px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        
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
                borderRadius: '16px',
                padding: '1.75rem',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              }}
            >
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 500, 
                color: COLORS.textMuted,
                margin: '0 0 1rem 0',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                Preparation is <span style={{ color: '#c45c5c' }}>not</span> about:
              </h3>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.95rem',
                color: COLORS.textSecondary,
                lineHeight: 2.1,
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
                backgroundColor: 'rgba(201, 162, 39, 0.06)',
                border: `1px solid rgba(201, 162, 39, 0.2)`,
                borderRadius: '16px',
                padding: '1.75rem',
              }}
            >
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 500, 
                color: COLORS.textSecondary,
                margin: '0 0 1rem 0',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                Preparation <span style={{ color: COLORS.accent }}>is</span> about:
              </h3>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.95rem',
                color: COLORS.textSecondary,
                lineHeight: 2.1,
              }}>
                <li>Tuning your nervous system into safety & openness</li>
                <li>Reducing internal friction</li>
                <li>Strengthening your "surrender reflex"</li>
                <li>Loosening identity so recognition can happen</li>
              </ul>
            </div>
          </div>

          <p style={{ 
            marginTop: '1.75rem', 
            fontSize: '0.95rem', 
            color: COLORS.textSecondary,
            lineHeight: 1.7,
            textAlign: 'center',
            maxWidth: '700px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            Our Preparation protocol upgrades the NOS (Neural Operating System) so the MOS (Mental Operating System) doesn't panic when constructs dissolve. It's simple, easy to follow and allows you to have the best overall experience possible.
          </p>
        </section>

        {/* Three Pillars */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="Three Foundational Pillars" />
          
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.25rem',
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

        {/* Divider */}
        <div style={{ 
          height: '1px', 
          backgroundColor: COLORS.divider, 
          margin: '3rem 0',
        }} />

        {/* Your Preparation Tools - More prominent */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <SectionHeader title="Your Preparation Tools" />
            <p style={{ 
              fontSize: '1.05rem', 
              color: COLORS.textSecondary,
              maxWidth: '500px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}>
              Three guided practices to prepare your system for the experience.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <ToolCard
              icon="☀️"
              title="Daily Core Ritual"
              duration="7 min"
              frequency="5-6 days per week for 4 weeks"
              description="Guided audio combining Resonance Breathing, Open Monitoring, Awareness Recognition, and Somatic Slide. This is your foundational daily practice."
              href="/tools/aw5-prep"
            />
            <ToolCard
              icon="🌊"
              title="Surrender Simulation"
              duration="~6 min"
              frequency="1-2 days per week for 4 weeks"
              description="Progressive breath holds that train your body to remain open as intensity rises, without attempting to manage it. Builds your surrender reflex."
              href="/tools/surrender-simulation"
            />
            <ToolCard
              icon="🔮"
              title="Identity Softening"
              duration="~5 min"
              frequency="1-2 days per week for 4 weeks"
              description="Silent inquiry that loosens identity so recognition can happen effortlessly. Not about finding who you are — but noticing what remains when the story stops."
              href="/tools/identity-softening"
            />
          </div>

          {/* Optional Add-on */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: COLORS.cardBg,
              border: `1px solid ${COLORS.cardBorder}`,
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <p style={{ 
              fontSize: '0.7rem', 
              color: COLORS.textMuted, 
              margin: '0 0 0.5rem 0',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Optional Add-on
            </p>
            <p style={{ fontSize: '0.95rem', color: COLORS.textSecondary, margin: 0, lineHeight: 1.6 }}>
              <a 
                href="https://pliability.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: COLORS.accent, textDecoration: 'none', fontWeight: 500 }}
              >
                Pliability
              </a>
              {' '}— disguised as mobility, it's actually an awareness primer and nervous system trainer. Follow daily routines 5+ days/week.
            </p>
          </div>
        </section>

        {/* Divider */}
        <div style={{ 
          height: '1px', 
          backgroundColor: COLORS.divider, 
          margin: '3rem 0',
        }} />

        {/* What to Avoid */}
        <section style={{ marginBottom: '4rem' }}>
          <SectionHeader title="What to Avoid" />
          
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* 7 Days */}
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: '#B91C1C',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                7 Days Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: COLORS.textSecondary,
                lineHeight: 2,
              }}>
                <li>Alcohol</li>
                <li>Cannabis</li>
                <li>Heavy stimulant use</li>
              </ul>
              <p style={{ 
                fontSize: '0.8rem', 
                color: COLORS.textMuted, 
                marginTop: '1rem',
                marginBottom: 0,
                fontStyle: 'italic',
              }}>
                Dysregulates nervous system
              </p>
            </div>

            {/* 48 Hours */}
            <div
              style={{
                backgroundColor: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: '#C2410C',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                48 Hours Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: COLORS.textSecondary,
                lineHeight: 2,
              }}>
                <li>Psychedelics</li>
                <li>Intense breathwork</li>
                <li>Extreme cardio</li>
              </ul>
              <p style={{ 
                fontSize: '0.8rem', 
                color: COLORS.textMuted, 
                marginTop: '1rem',
                marginBottom: 0,
                fontStyle: 'italic',
              }}>
                Agitates the system
              </p>
            </div>

            {/* 24 Hours */}
            <div
              style={{
                backgroundColor: '#FEFCE8',
                border: '1px solid #FEF08A',
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <h4 style={{ 
                fontSize: '0.75rem', 
                color: '#A16207',
                letterSpacing: '0.1em',
                margin: '0 0 1rem 0',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                24 Hours Before
              </h4>
              <ul style={{ 
                margin: 0, 
                paddingLeft: '1.25rem',
                fontSize: '0.9rem',
                color: COLORS.textSecondary,
                lineHeight: 2,
              }}>
                <li>Porn / overstimulation</li>
                <li>Social media spirals</li>
                <li>Conflict</li>
                <li>Caffeine / stimulants</li>
              </ul>
              <p style={{ 
                fontSize: '0.8rem', 
                color: COLORS.textMuted, 
                marginTop: '1rem',
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
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🌙</span>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 500, 
                color: COLORS.textPrimary,
                margin: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                Evening Prep (10 minutes)
              </h3>
            </div>
            
            <ol style={{ 
              margin: '0 0 1.5rem 0', 
              paddingLeft: '1.5rem',
              fontSize: '0.95rem',
              color: COLORS.textSecondary,
              lineHeight: 2.1,
            }}>
              <li>Complete the Daily Core Ritual</li>
              <li>1 minute: Light gratitude + identity softening</li>
            </ol>

            <p style={{ 
              fontSize: '0.9rem', 
              color: COLORS.textPrimary, 
              margin: '0 0 0.75rem 0',
              fontWeight: 600,
            }}>
              Then:
            </p>
            <ul style={{ 
              margin: 0, 
              paddingLeft: '1.5rem',
              fontSize: '0.95rem',
              color: COLORS.textSecondary,
              lineHeight: 2.1,
            }}>
              <li>Early bedtime</li>
              <li>Very light protein/carbs, no heavy meals</li>
              <li>Hydration</li>
              <li>No screens 90 mins before sleep</li>
              <li>No important decisions or intense conversations</li>
            </ul>

            <p style={{ 
              marginTop: '1.5rem',
              marginBottom: 0,
              fontSize: '0.9rem', 
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
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>☀️</span>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 500, 
                color: COLORS.textPrimary,
                margin: 0,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                The Day Has Arrived
              </h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <p style={{ 
                  fontSize: '1rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  1. Follow your normal routine
                </p>
                <p style={{ fontSize: '0.9rem', color: COLORS.textMuted, margin: 0 }}>
                  Don't be weird. Predictability = safety.
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '1rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  2. Fast (or very light meal if needed)
                </p>
                <p style={{ fontSize: '0.9rem', color: COLORS.textMuted, margin: 0 }}>
                  We don't want your stomach full of food.
                </p>
              </div>
              
              <div>
                <p style={{ 
                  fontSize: '1rem', 
                  color: COLORS.textPrimary,
                  margin: '0 0 0.25rem 0',
                  fontWeight: 500,
                }}>
                  3. "Allow Everything" mantra
                </p>
                <p style={{ fontSize: '0.9rem', color: COLORS.textMuted, margin: 0 }}>
                  Repeat internally throughout the morning.
                </p>
              </div>
            </div>

            {/* Mantra highlight */}
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: 'rgba(201, 162, 39, 0.08)',
                border: '1px solid rgba(201, 162, 39, 0.25)',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <p style={{ 
                fontSize: '1.15rem', 
                color: COLORS.textPrimary,
                margin: 0,
                fontStyle: 'italic',
                lineHeight: 1.6,
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}>
                "I am unconditionally open to allow any unfolding."
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ 
          textAlign: 'center', 
          paddingTop: '2rem',
          borderTop: `1px solid ${COLORS.divider}`,
        }}>
          <p style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>
            Part of the{' '}
            <a
              href="https://awakenwith5.com"
              style={{ color: COLORS.accent, textDecoration: 'none', fontWeight: 500 }}
            >
              Awaken with 5
            </a>
            {' '}experience
          </p>
        </footer>
      </main>
    </div>
  );
}
