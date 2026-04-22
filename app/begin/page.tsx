'use client';

import { useState, useEffect, useRef } from "react";

const ACCENT = "#ff9e19";
const BG = "#0a0a0a";
const CARD_BG = "#111111";

function useReveal(threshold: number = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Section({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const [ref, visible] = useReveal(0.12);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 1.2s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s, transform 1.2s cubic-bezier(0.23, 1, 0.32, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "0" }}>
      <div
        style={{
          width: 1,
          height: 48,
          background: `linear-gradient(to bottom, transparent, ${ACCENT}33, transparent)`,
        }}
      />
    </div>
  );
}

export default function BeginPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@200;300;400&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: ${BG};
          --accent: ${ACCENT};
          --card: ${CARD_BG};
          --text-primary: #e8e8e8;
          --text-secondary: #888888;
          --text-dim: #555555;
          --font-display: 'Cormorant Garamond', Georgia, serif;
          --font-body: 'Outfit', -apple-system, sans-serif;
        }

        html {
          background: var(--bg);
          color: var(--text-primary);
          scroll-behavior: smooth;
          -webkit-font-smoothing: antialiased;
        }

        ::selection {
          background: ${ACCENT}33;
          color: var(--text-primary);
        }

        .begin-container {
          min-height: 100vh;
          background: var(--bg);
          font-family: var(--font-body);
          font-weight: 300;
          overflow-x: hidden;
        }

        /* Nav */
        .begin-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.2rem clamp(1.5rem, 4vw, 3rem);
          background: ${BG}dd;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .begin-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }

        .begin-nav-logo img {
          height: 28px;
          width: auto;
          opacity: 0.9;
        }

        .begin-nav-link {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.03em;
          transition: color 0.3s ease;
        }

        .begin-nav-link:hover {
          color: var(--text-primary);
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          position: relative;
        }

        .hero-title {
          font-family: var(--font-display);
          font-weight: 300;
          font-style: italic;
          font-size: clamp(2.4rem, 6vw, 4.8rem);
          letter-spacing: -0.02em;
          line-height: 1.15;
          color: var(--text-primary);
          margin-bottom: 2rem;
        }

        .hero-sub {
          font-family: var(--font-body);
          font-weight: 200;
          font-size: clamp(0.95rem, 1.8vw, 1.15rem);
          color: var(--text-secondary);
          letter-spacing: 0.04em;
          max-width: 360px;
        }

        .scroll-cue {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          animation: breathe 4s ease-in-out infinite;
        }

        .scroll-line {
          width: 1px;
          height: 32px;
          background: linear-gradient(to bottom, var(--text-dim), transparent);
        }

        @keyframes breathe {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }

        /* Content sections */
        .content-area {
          max-width: 600px;
          margin: 0 auto;
          padding: 0 2rem 8rem;
        }

        .section-gap {
          height: clamp(6rem, 12vh, 10rem);
        }

        .section-gap-sm {
          height: clamp(3rem, 6vh, 5rem);
        }

        /* Typography */
        .display-text {
          font-family: var(--font-display);
          font-weight: 300;
          font-size: clamp(1.6rem, 3.5vw, 2.4rem);
          line-height: 1.35;
          letter-spacing: -0.01em;
          color: var(--text-primary);
        }

        .body-text {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: clamp(0.95rem, 1.6vw, 1.05rem);
          line-height: 1.75;
          color: var(--text-secondary);
        }

        .body-text strong {
          color: var(--text-primary);
          font-weight: 400;
        }

        .dim-text {
          color: var(--text-dim);
          font-size: 0.9rem;
          line-height: 1.7;
        }

        .accent-text {
          color: var(--accent);
        }

        /* Stage 1 detail */
        .stage-practices {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .practice-row {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          background: #ffffff04;
          border: 1px solid #ffffff06;
        }

        .practice-icon {
          font-size: 1.1rem;
          width: 28px;
          text-align: center;
          flex-shrink: 0;
        }

        .practice-info {
          flex: 1;
        }

        .practice-name {
          font-size: 0.95rem;
          color: var(--text-primary);
          font-weight: 400;
          margin-bottom: 2px;
        }

        .practice-detail {
          font-size: 0.8rem;
          color: var(--text-dim);
          letter-spacing: 0.02em;
        }

        .practice-time {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 300;
          flex-shrink: 0;
        }

        /* Commitment card */
        .commitment-card {
          border: 1px solid #ffffff08;
          border-radius: 12px;
          padding: clamp(1.8rem, 4vw, 2.4rem);
          background: var(--card);
        }

        .commitment-label {
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-dim);
          margin-bottom: 1.5rem;
        }

        .commitment-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .commitment-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }

        .commitment-marker {
          width: 6px;
          height: 6px;
          min-width: 6px;
          border-radius: 50%;
          background: var(--accent);
          margin-top: 8px;
          opacity: 0.6;
        }

        .commitment-text {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Progression note */
        .progression-note {
          border-left: 2px solid ${ACCENT}22;
          padding-left: 1.2rem;
          margin-top: 0.5rem;
        }

        /* CTA */
        .cta-area {
          text-align: center;
          padding: 4rem 0;
        }

        .cta-btn {
          display: inline-block;
          padding: 1rem 3rem;
          font-family: var(--font-body);
          font-weight: 300;
          font-size: 1rem;
          letter-spacing: 0.06em;
          color: var(--bg);
          background: var(--accent);
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 32px ${ACCENT}22;
        }

        .cta-markers {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.4rem 1.2rem;
          margin-top: 1.2rem;
        }

        .cta-marker {
          font-size: 0.78rem;
          color: var(--text-dim);
          letter-spacing: 0.03em;
        }

        /* Footer */
        .quiet-footer {
          text-align: center;
          padding: 4rem 2rem 3rem;
          border-top: 1px solid #ffffff06;
        }

        .quiet-footer p {
          font-family: var(--font-display);
          font-style: italic;
          font-weight: 300;
          font-size: 0.95rem;
          color: var(--text-dim);
        }

        .quiet-footer .footer-copy {
          font-family: var(--font-body);
          font-style: normal;
          font-size: 0.72rem;
          color: #333;
          margin-top: 2rem;
          letter-spacing: 0.04em;
        }
      `}</style>

      <div className="begin-container">
        {/* ─── NAV ─── */}
        <nav className="begin-nav">
          <a href="https://www.unbecoming.app" className="begin-nav-logo">
            <img
              src="https://www.unbecoming.app/logol.png"
              alt="Unbecoming"
            />
          </a>
          <a href="/auth/signin" className="begin-nav-link">
            Log In
          </a>
        </nav>

        {/* ─── HERO ─── */}
        <div className="hero">
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(16px)",
              transition:
                "opacity 2s cubic-bezier(0.23, 1, 0.32, 1) 0.4s, transform 2s cubic-bezier(0.23, 1, 0.32, 1) 0.4s",
            }}
          >
            <h1 className="hero-title">Something responded.</h1>
          </div>
          <div
            style={{
              opacity: heroVisible ? 1 : 0,
              transform: heroVisible ? "translateY(0)" : "translateY(12px)",
              transition:
                "opacity 2s cubic-bezier(0.23, 1, 0.32, 1) 1.2s, transform 2s cubic-bezier(0.23, 1, 0.32, 1) 1.2s",
            }}
          >
            <p className="hero-sub">That response is the beginning.</p>
          </div>

          <div className="scroll-cue">
            <div className="scroll-line" />
          </div>
        </div>

        {/* ─── CONTENT ─── */}
        <div className="content-area">
          {/* Section 1: Orient */}
          <Section>
            <p className="body-text">
              What you felt during the film wasn't inspiration.
              It wasn't motivation. It was your nervous system
              recognizing something it already knew.
            </p>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.1}>
            <p className="body-text">
              That recognition fades without a container.
              Not because it wasn't real — but because the default
              patterns that run your operating system will reassert
              themselves within hours.
            </p>
          </Section>

          <div className="section-gap" />
          <Divider />
          <div className="section-gap" />

          {/* Section 2: What this is */}
          <Section>
            <p className="display-text" style={{ marginBottom: "1.8rem" }}>
              This is not a course.<br />
              Not therapy.<br />
              Not another thing to consume.
            </p>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.1}>
            <p className="body-text">
              <strong>The Stack</strong> is a daily ritual system — built to
              hold what just shifted, so it becomes your new baseline instead
              of a fading memory.
            </p>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.15}>
            <p className="body-text">
              Ancient wisdom practices and modern neuroscience — distilled,
              sequenced, and installed into one daily ritual that adapts to
              you. It measures where you are. It unlocks the next stage only
              when your nervous system proves it's ready. You don't advance
              by consuming more —{" "}
              <strong>you advance by demonstrating calm</strong>.
            </p>
          </Section>

          <div className="section-gap" />
          <Divider />
          <div className="section-gap" />

          {/* Section 3: Stage 1 */}
          <Section>
            <p className="display-text" style={{ marginBottom: "0.5rem" }}>
              Stage 1
            </p>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 300,
                fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)",
                color: ACCENT,
                marginBottom: "2rem",
                opacity: 0.85,
              }}
            >
              Neural Priming
            </p>
          </Section>

          <Section delay={0.1}>
            <p className="body-text" style={{ marginBottom: "0.5rem" }}>
              Stabilize the signal. Teach your nervous system
              calm — not as a concept, but as a measurable baseline.
            </p>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.15}>
            <div className="stage-practices">
              <div className="practice-row">
                <div className="practice-icon">🫁</div>
                <div className="practice-info">
                  <div className="practice-name">Resonance Breathing</div>
                  <div className="practice-detail">
                    Vagal tone · HRV training · Autonomic regulation
                  </div>
                </div>
                <div className="practice-time">5 min</div>
              </div>
              <div className="practice-row">
                <div className="practice-icon">👁</div>
                <div className="practice-info">
                  <div className="practice-name">Awareness Rep</div>
                  <div className="practice-detail">
                    Metacognitive training · Observer function
                  </div>
                </div>
                <div className="practice-time">3 min</div>
              </div>
            </div>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.1}>
            <div className="progression-note">
              <p className="dim-text">
                Stage 1 is the foundation. There are seven stages total —
                each one adding a single practice as your nervous system
                earns the capacity for it. You don't need to think about
                any of that now. Just start here.
              </p>
            </div>
          </Section>

          <div className="section-gap" />

          {/* Section 4: What it asks */}
          <Section>
            <div className="commitment-card">
              <p className="commitment-label">What this asks of you</p>
              <div className="commitment-items">
                <div className="commitment-item">
                  <div className="commitment-marker" />
                  <p className="commitment-text">
                    Eight minutes each morning for fourteen days.
                  </p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-marker" />
                  <p className="commitment-text">
                    Honesty in your self-assessments.
                  </p>
                </div>
                <div className="commitment-item">
                  <div className="commitment-marker" />
                  <p className="commitment-text">
                    Consistency over intensity. Showing up matters more than
                    performing.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <div className="section-gap-sm" />

          <Section delay={0.1}>
            <p className="dim-text" style={{ textAlign: "center" }}>
              You don't need to learn anything. You don't need to
              understand how it works. You don't need to believe in a
              single thing.
              <br />
              <br />
              Just show up.
            </p>
          </Section>

          <div className="section-gap" />
          <Divider />
          <div className="section-gap" />

          {/* CTA */}
          <Section>
            <div className="cta-area">
              <a href="/auth/signup" className="cta-btn" role="button">
                Install Stage 1
              </a>
              <div className="cta-markers">
                <span className="cta-marker">✦ Free</span>
                <span className="cta-marker">✦ No credit card</span>
                <span className="cta-marker">✦ No device required</span>
                <span className="cta-marker">✦ 8 min/day</span>
              </div>
            </div>
          </Section>

          <div className="section-gap" />

          {/* Footer */}
          <div className="quiet-footer">
            <p>
              Awareness doesn't need improvement. It needs a container.
            </p>
            <p className="footer-copy">© 2026 Unbecoming</p>
          </div>
        </div>
      </div>
    </>
  );
}
