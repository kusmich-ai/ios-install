'use client';

import { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [tableOpen, setTableOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -30px 0px' }
    );

    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Mono:wght@300;400;500&family=Instrument+Sans:wght@400;500;600&display=swap');

        :root {
          --bg: #080808;
          --bg2: #0e0e0e;
          --bg3: #141414;
          --amber: #ff9e19;
          --amber-dim: rgba(255,158,25,0.1);
          --amber-mid: rgba(255,158,25,0.4);
          --white: #f0ede8;
          --white-dim: rgba(240,237,232,0.5);
          --white-faint: rgba(240,237,232,0.1);
          --border: rgba(255,158,25,0.18);
          --border-subtle: rgba(240,237,232,0.07);
          --red-dim: rgba(255,80,80,0.08);
          --red: rgba(255,100,100,0.6);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        body {
          background: var(--bg);
          color: var(--white);
          font-family: 'Instrument Sans', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }

        .container {
          max-width: 920px;
          margin: 0 auto;
          padding: 0 32px;
          position: relative;
          z-index: 1;
        }

        section { position: relative; }

        /* NAV */
        nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to bottom, rgba(8,8,8,0.96), transparent);
          backdrop-filter: blur(10px);
        }

        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 400;
          color: var(--white);
          letter-spacing: 0.04em;
          text-decoration: none;
        }
        .nav-logo span { color: var(--amber); }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .nav-login {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--white-dim);
          text-decoration: none;
          padding: 8px 16px;
          border: 1px solid var(--border-subtle);
          transition: all 0.2s;
        }
        .nav-login:hover { color: var(--white); border-color: rgba(240,237,232,0.2); }

        .nav-cta {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--amber);
          text-decoration: none;
          border: 1px solid var(--amber);
          padding: 8px 20px;
          transition: all 0.2s;
        }
        .nav-cta:hover { background: var(--amber); color: #080808; }

        /* HERO */
        #hero {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 120px 32px 80px;
          overflow: hidden;
        }

        #hero .glow-orb {
          width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(255,158,25,0.07) 0%, transparent 68%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-glow 7s ease-in-out infinite alternate;
        }

        @keyframes pulse-glow {
          from { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          to   { opacity: 1;   transform: translate(-50%, -50%) scale(1.12); }
        }

        .hero-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 28px;
          opacity: 0;
          animation: fade-up 0.8s ease 0.2s forwards;
        }

        .hero-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(46px, 7.5vw, 84px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -0.01em;
          color: var(--white);
          margin-bottom: 10px;
          opacity: 0;
          animation: fade-up 0.8s ease 0.4s forwards;
        }
        .hero-headline em { font-style: italic; color: var(--amber); }
        .hero-headline strong { font-weight: 600; }

        .hero-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 2.8vw, 26px);
          font-weight: 300;
          font-style: italic;
          color: var(--white-dim);
          margin-bottom: 52px;
          max-width: 660px;
          line-height: 1.5;
          opacity: 0;
          animation: fade-up 0.8s ease 0.6s forwards;
        }

        .hero-cta-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          opacity: 0;
          animation: fade-up 0.8s ease 0.8s forwards;
        }

        .btn-primary {
          background: var(--amber);
          color: #080808;
          font-family: 'Instrument Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          text-decoration: none;
          padding: 16px 48px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(255,158,25,0.3); }

        .hero-proof-strip {
          display: flex;
          gap: 0;
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
        }

        .hero-proof-item {
          padding: 12px 24px;
          border-right: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hero-proof-item:last-child { border-right: none; }

        .proof-check {
          color: var(--amber);
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .proof-text {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--white-dim);
          line-height: 1.4;
        }
        .proof-text strong { color: var(--white); display: block; font-weight: 500; font-size: 11px; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* PHILOSOPHY */
        #philosophy {
          padding: 100px 0 80px;
          text-align: center;
          position: relative;
        }

        #philosophy .glow-orb {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,158,25,0.05) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .philosophy-word {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(64px, 12vw, 130px);
          font-weight: 300;
          font-style: italic;
          letter-spacing: -0.02em;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,158,25,0.3);
          margin-bottom: 36px;
          display: block;
        }

        .philosophy-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 3.5vw, 34px);
          font-weight: 300;
          line-height: 1.5;
          color: var(--white);
          max-width: 720px;
          margin: 0 auto 24px;
        }
        .philosophy-body em { font-style: italic; color: var(--amber); }

        .philosophy-clarifier {
          font-size: 15px;
          color: var(--white-dim);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* DIVIDER */
        .divider {
          width: 1px;
          height: 80px;
          background: linear-gradient(to bottom, transparent, var(--amber), transparent);
          margin: 0 auto;
        }

        /* SECTION LABELS */
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 48px;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        /* PROBLEM */
        #problem {
          padding: 100px 0;
          background: linear-gradient(to bottom, transparent, rgba(255,158,25,0.02), transparent);
        }

        .problem-lead {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(26px, 4vw, 44px);
          font-weight: 300;
          line-height: 1.3;
          max-width: 740px;
          margin-bottom: 20px;
        }
        .problem-lead em { font-style: italic; color: var(--amber); }

        .problem-para {
          color: var(--white-dim);
          font-size: 16px;
          max-width: 600px;
          line-height: 1.75;
          margin-bottom: 36px;
        }

        .tried-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          max-width: 720px;
          margin-bottom: 48px;
        }

        .tried-item {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.04em;
          color: var(--white-dim);
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 7px 14px;
          position: relative;
          transition: all 0.2s;
          cursor: default;
        }
        .tried-item::before {
          content: '✗ ';
          color: var(--red);
          font-size: 10px;
        }
        .tried-item:hover {
          border-color: var(--border);
          color: var(--white);
        }

        .tried-closing {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 2.5vw, 24px);
          font-style: italic;
          color: var(--white-dim);
          margin-bottom: 56px;
        }
        .tried-closing strong { color: var(--white); font-style: normal; }

        .problem-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-bottom: 48px;
        }

        .problem-item {
          background: var(--bg2);
          padding: 28px 32px;
          border: 1px solid var(--border-subtle);
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .problem-item:hover { border-color: var(--border); }
        .problem-item::before {
          content: attr(data-index);
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 300;
          color: rgba(255,158,25,0.05);
          position: absolute;
          top: 8px; right: 16px;
          line-height: 1;
          pointer-events: none;
        }
        .problem-item p { font-size: 14px; color: var(--white-dim); line-height: 1.65; }
        .problem-item strong { display: block; font-size: 15px; font-weight: 600; color: var(--white); margin-bottom: 8px; }

        .problem-kicker {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(24px, 3.8vw, 38px);
          font-weight: 300;
          font-style: italic;
          text-align: center;
          color: var(--white-dim);
          max-width: 640px;
          margin: 0 auto;
          line-height: 1.4;
        }
        .problem-kicker span { color: var(--white); font-style: normal; font-weight: 600; }

        /* MECHANISM */
        #mechanism { padding: 100px 0; }

        .mechanism-intro {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4.5vw, 52px);
          font-weight: 300;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .mechanism-intro em { font-style: italic; color: var(--amber); }

        .mechanism-body {
          font-size: 16px;
          color: var(--white-dim);
          max-width: 620px;
          margin-bottom: 20px;
          line-height: 1.75;
        }

        .sequence-callout {
          background: var(--amber-dim);
          border: 1px solid var(--border);
          border-left: 3px solid var(--amber);
          padding: 20px 28px;
          max-width: 620px;
          margin-bottom: 56px;
        }

        .sequence-callout p {
          font-size: 14px;
          color: var(--white);
          line-height: 1.65;
        }
        .sequence-callout strong { color: var(--amber); }

        .table-wrapper { position: relative; }

        .table-toggle-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg2);
          border: 1px solid var(--border);
          padding: 16px 24px;
          cursor: pointer;
          user-select: none;
          margin-bottom: 2px;
          transition: background 0.2s;
        }
        .table-toggle-bar:hover { background: var(--bg3); }

        .table-toggle-label {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--amber);
        }

        .table-toggle-hint {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--white-dim);
          display: flex;
          align-items: center;
          gap: 8px;
          transition: color 0.2s;
        }
        .table-toggle-bar:hover .table-toggle-hint { color: var(--white); }

        .toggle-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
          font-size: 14px;
        }
        .table-toggle-bar.open .toggle-arrow { transform: rotate(180deg); }

        .modality-table {
          display: none;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }
        .modality-table.open { display: flex; }

        .modality-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 2px;
        }

        .modality-cell {
          background: var(--bg2);
          padding: 18px 24px;
          border: 1px solid var(--border-subtle);
          transition: all 0.2s;
        }
        .modality-cell:hover { background: var(--bg3); border-color: var(--border); }
        .modality-cell.header-cell {
          background: transparent;
          border-color: transparent;
          padding-bottom: 10px;
        }
        .modality-cell.header-cell span {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--white-dim);
        }

        .m-name { font-size: 13px; font-weight: 600; color: var(--white); margin-bottom: 3px; }
        .m-source { font-family: 'DM Mono', monospace; font-size: 9px; color: var(--amber); letter-spacing: 0.04em; line-height: 1.4; }
        .m-mechanism { font-size: 12px; color: var(--white-dim); line-height: 1.55; }
        .m-practice { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--white-dim); letter-spacing: 0.03em; line-height: 1.5; }

        /* ── NOS / MOS ── */
        #nos-mos {
          padding: 100px 0;
          background: linear-gradient(to bottom, transparent, rgba(255,158,25,0.025), transparent);
        }

        .nos-mos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-bottom: 2px;
        }

        .nos-mos-card {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 36px 32px;
          transition: border-color 0.3s;
        }
        .nos-mos-card:hover { border-color: var(--border); }

        .nos-mos-icon {
          font-size: 22px;
          color: var(--amber);
          margin-bottom: 16px;
          display: block;
          line-height: 1;
        }

        .nos-mos-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2.8vw, 28px);
          font-weight: 400;
          color: var(--white);
          margin-bottom: 4px;
          line-height: 1.2;
        }

        .nos-mos-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 16px;
        }

        .nos-mos-body {
          font-size: 14px;
          color: var(--white-dim);
          line-height: 1.7;
          margin-bottom: 20px;
        }

        .nos-mos-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .nos-mos-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--white-dim);
          line-height: 1.5;
        }

        .nos-mos-list li::before {
          content: '✦';
          color: var(--amber);
          font-size: 8px;
          margin-top: 5px;
          flex-shrink: 0;
        }

        .nos-mos-bridge {
          background: var(--amber-dim);
          border: 1px solid var(--border);
          padding: 20px 32px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
        }

        .nos-mos-bridge-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 20px;
        }
        .nos-mos-bridge-item:first-child { padding-left: 0; }
        .nos-mos-bridge-item:not(:last-child) {
          border-right: 1px solid var(--border);
        }

        .bridge-old {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: rgba(255,100,100,0.55);
          text-decoration: line-through;
        }
        .bridge-arrow {
          color: var(--white-dim);
          font-size: 11px;
          flex-shrink: 0;
        }
        .bridge-new {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--amber);
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        /* INSIGHT QUOTE */
        #insight {
          padding: 100px 0;
          background: linear-gradient(to bottom, transparent, rgba(255,158,25,0.03), transparent);
        }

        .insight-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 4.5vw, 52px);
          font-weight: 300;
          line-height: 1.25;
          color: var(--white);
          max-width: 820px;
          position: relative;
          padding-left: 40px;
        }
        .insight-quote::before {
          content: '';
          position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 2px;
          background: var(--amber);
        }
        .insight-quote em { font-style: italic; color: var(--amber); }
        .insight-quote .accent-line {
          display: block;
          font-size: clamp(18px, 2.5vw, 28px);
          color: var(--white-dim);
          margin-top: 16px;
          font-style: italic;
        }

        /* HOW IT WORKS */
        #how { padding: 100px 0; }

        .how-intro {
          max-width: 640px;
          margin-bottom: 72px;
        }
        .how-intro h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 300;
          line-height: 1.2;
          margin-bottom: 14px;
        }
        .how-intro p { color: var(--white-dim); font-size: 15px; line-height: 1.75; }
        .how-intro .time-hint {
          margin-top: 14px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--amber);
          letter-spacing: 0.08em;
          border-left: 2px solid var(--amber);
          padding-left: 12px;
        }

        .stages-timeline { position: relative; }
        .stages-timeline::before {
          content: '';
          position: absolute;
          left: 28px; top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, var(--amber), transparent);
        }

        .stage-entry {
          display: grid;
          grid-template-columns: 56px 1fr;
          gap: 28px;
          margin-bottom: 2px;
        }

        .stage-number-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 28px;
        }

        .stage-dot {
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--amber);
          border: 2px solid var(--bg);
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .stage-entry:hover .stage-dot {
          transform: scale(1.4);
          box-shadow: 0 0 14px var(--amber);
        }

        .stage-body {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 24px 30px;
          transition: border-color 0.3s;
        }
        .stage-entry:hover .stage-body { border-color: var(--border); }

        .stage-header {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 6px;
        }
        .stage-num { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--amber); text-transform: uppercase; }
        .stage-name { font-family: 'Cormorant Garamond', serif; font-size: 21px; font-weight: 400; color: var(--white); }
        .stage-tagline { font-size: 13px; color: var(--white-dim); font-style: italic; margin-bottom: 10px; }

        .stage-practices {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 10px;
        }
        .practice-pill {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.04em;
          color: var(--amber);
          background: var(--amber-dim);
          border: 1px solid rgba(255,158,25,0.18);
          padding: 4px 11px;
        }
        .practice-pill.tool { color: var(--white-dim); background: var(--white-faint); border-color: var(--border-subtle); }

        .stage-science {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-subtle);
          font-size: 11px;
          color: var(--white-dim);
          font-family: 'DM Mono', monospace;
          line-height: 1.6;
          letter-spacing: 0.02em;
        }

        /* DAILY STACK */
        #stack {
          padding: 100px 0;
          background: linear-gradient(to bottom, transparent, rgba(255,158,25,0.025), transparent);
        }

        .stack-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
          align-items: end;
          margin-bottom: 52px;
        }
        .stack-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4.5vw, 50px);
          font-weight: 300;
          line-height: 1.2;
        }
        .stack-header p { font-size: 15px; color: var(--white-dim); line-height: 1.75; }

        .time-breakdown { display: grid; gap: 2px; }

        .time-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 15px 22px;
          transition: all 0.2s;
        }
        .time-row:hover { border-color: var(--border); background: var(--bg3); }

        .time-row-left { display: flex; align-items: center; gap: 16px; }
        .time-icon { font-size: 17px; width: 26px; text-align: center; }
        .time-label { font-size: 14px; font-weight: 500; color: var(--white); }
        .time-sub { font-family: 'DM Mono', monospace; font-size: 10px; color: var(--white-dim); margin-top: 2px; }
        .time-duration { font-family: 'DM Mono', monospace; font-size: 13px; color: var(--amber); font-weight: 500; }

        .time-total {
          background: var(--amber-dim) !important;
          border-color: var(--border) !important;
        }
        .time-total .time-label { font-weight: 600; color: var(--amber); }
        .time-total .time-duration { font-size: 16px; }

        .stack-note {
          margin-top: 16px;
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--white-dim);
          letter-spacing: 0.05em;
          line-height: 1.7;
          padding: 16px 20px;
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          border-left: 2px solid var(--amber);
        }
        .stack-note span { color: var(--amber); }

        /* VS */
        #vs { padding: 100px 0; }

        .vs-header { margin-bottom: 52px; }
        .vs-header h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4.5vw, 50px);
          font-weight: 300;
          line-height: 1.2;
          margin-bottom: 12px;
          max-width: 560px;
        }
        .vs-header p { color: var(--white-dim); font-size: 15px; max-width: 500px; line-height: 1.7; }

        .vs-grid {
          display: grid;
          grid-template-columns: 1fr 2px 1fr;
        }

        .vs-divider {
          background: var(--border);
          position: relative;
          margin: 0 8px;
        }
        .vs-divider::before {
          content: 'VS';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: var(--bg);
          padding: 6px;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          color: var(--white-dim);
        }

        .vs-col-title {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 1px solid var(--border-subtle);
        }
        .vs-col.theirs .vs-col-title { color: var(--white-dim); }
        .vs-col.ours .vs-col-title { color: var(--amber); }
        .vs-col.ours { padding-left: 32px; }
        .vs-col.theirs { padding-right: 32px; }

        .vs-list { list-style: none; }
        .vs-list li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: var(--white-dim);
          padding: 9px 0;
          border-bottom: 1px solid var(--border-subtle);
          line-height: 1.5;
        }
        .vs-list li:last-child { border-bottom: none; }
        .vs-list li .icon { font-size: 12px; margin-top: 2px; flex-shrink: 0; }
        .vs-col.ours .vs-list li { color: var(--white); }
        .vs-col.ours .vs-list li .icon { color: var(--amber); }

        .vs-unified {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2px;
          margin-top: 2px;
        }
        .vs-u-cell {
          padding: 32px 36px;
          border: 1px solid var(--border-subtle);
        }
        .vs-u-cell.grey { background: var(--bg2); border-color: var(--border-subtle); }
        .vs-u-cell.amber { background: var(--amber-dim); border-color: var(--border); }
        .vs-u-cell.stat { padding: 32px; text-align: center; }

        .vs-u-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--white-dim);
          margin-bottom: 14px;
        }
        .vs-u-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 12px;
        }
        .vs-u-price.red { color: rgba(255,100,100,0.7); }
        .vs-u-price.gold { color: var(--amber); }
        .vs-u-plus { font-size: 28px; color: var(--white-dim); }
        .vs-u-tostart { font-size: 22px; color: var(--amber); margin-left: 6px; }
        .vs-u-sub { font-size: 13px; color: var(--white-dim); line-height: 1.65; }

        .vs-u-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 60px;
          font-weight: 300;
          line-height: 1;
          margin-bottom: 10px;
        }
        .vs-u-cell.grey .vs-u-num { color: var(--white-dim); }
        .vs-u-cell.amber .vs-u-num { color: var(--amber); }

        .vs-u-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .vs-u-cell.grey .vs-u-stat-label { color: var(--white-dim); }
        .vs-u-cell.amber .vs-u-stat-label { color: var(--amber); }

        /* WHY */
        #why {
          padding: 100px 0;
          background: linear-gradient(to bottom, transparent, rgba(255,158,25,0.025), transparent);
        }

        .proof-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2px;
          margin-top: 48px;
        }

        .proof-card {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 32px;
          transition: border-color 0.3s;
        }
        .proof-card:hover { border-color: var(--border); }

        .proof-metric {
          font-family: 'Cormorant Garamond', serif;
          font-size: 54px;
          font-weight: 300;
          color: var(--amber);
          line-height: 1;
          margin-bottom: 4px;
        }
        .proof-metric-label {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--white-dim);
          margin-bottom: 14px;
        }
        .proof-desc { font-size: 13px; color: var(--white-dim); line-height: 1.65; }

        /* ── TESTIMONIALS ── */
        #testimonials {
          padding: 100px 0;
        }

        .testimonial-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2px;
          margin-bottom: 2px;
        }

        .testimonial-card {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          padding: 32px;
          transition: border-color 0.3s;
        }
        .testimonial-card:hover { border-color: var(--border); }

        .testimonial-stat {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(38px, 5vw, 56px);
          font-weight: 300;
          color: var(--amber);
          line-height: 1;
          margin-bottom: 4px;
        }

        .testimonial-stat-label {
          font-family: 'DM Mono', monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--white-dim);
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .testimonial-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(15px, 1.8vw, 18px);
          font-weight: 300;
          font-style: italic;
          color: var(--white-dim);
          line-height: 1.65;
          margin-bottom: 20px;
        }
        .testimonial-quote em { color: var(--white); font-style: normal; }

        .testimonial-byline {
          padding-top: 16px;
          border-top: 1px solid var(--border-subtle);
        }
        .testimonial-name {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--white);
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }
        .testimonial-role {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          color: var(--white-dim);
          letter-spacing: 0.06em;
        }

        .testimonial-closer {
          background: var(--amber-dim);
          border: 1px solid var(--border);
          border-left: 3px solid var(--amber);
          padding: 32px 40px;
        }

        .testimonial-closer-quote {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 3vw, 30px);
          font-weight: 300;
          font-style: italic;
          color: var(--white);
          line-height: 1.5;
          margin-bottom: 16px;
        }
        .testimonial-closer-quote em { color: var(--amber); font-style: normal; }

        .testimonial-closer-attr {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--white-dim);
          letter-spacing: 0.1em;
        }

        /* ── FAQ ── */
        #faq { padding: 100px 0; }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-top: 16px;
        }

        .faq-item {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .faq-item.open { border-color: var(--border); }

        .faq-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 24px 28px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.2s;
        }
        .faq-trigger:hover { background: var(--bg3); }

        .faq-question {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 2vw, 21px);
          font-weight: 400;
          color: var(--white);
          line-height: 1.3;
        }

        .faq-arrow {
          font-family: 'DM Mono', monospace;
          font-size: 20px;
          color: var(--amber);
          flex-shrink: 0;
          transition: transform 0.3s ease;
          line-height: 1;
        }
        .faq-item.open .faq-arrow { transform: rotate(45deg); }

        .faq-answer {
          padding: 0 28px 28px;
          font-size: 14px;
          color: var(--white-dim);
          line-height: 1.75;
          border-top: 1px solid var(--border-subtle);
          padding-top: 20px;
        }

        /* CTA */
        #cta {
          padding: 120px 0;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        #cta .glow-orb {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(255,158,25,0.09) 0%, transparent 68%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: pulse-glow 6s ease-in-out infinite alternate;
        }

        .cta-eyebrow {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 24px;
        }
        .cta-headline {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(42px, 7vw, 76px);
          font-weight: 300;
          line-height: 1.1;
          margin-bottom: 16px;
        }
        .cta-headline em { font-style: italic; color: var(--amber); }

        .cta-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(18px, 2.5vw, 24px);
          font-weight: 300;
          font-style: italic;
          color: var(--white-dim);
          max-width: 560px;
          margin: 0 auto 48px;
          line-height: 1.55;
        }

        .cta-proof-strip {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0;
          margin-top: 24px;
        }
        .cta-proof-item {
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--white-dim);
          padding: 8px 18px;
          border-right: 1px solid var(--border-subtle);
        }
        .cta-proof-item:last-child { border-right: none; }
        .cta-proof-item span { color: var(--amber); margin-right: 6px; }

        /* FOOTER */
        footer {
          padding: 36px 40px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }
        footer p { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--white-dim); letter-spacing: 0.04em; }

        .hero-note {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--white-dim);
          letter-spacing: 0.06em;
          text-align: center;
          line-height: 1.7;
          max-width: 520px;
        }

        .whatif-block {
          background: var(--bg2);
          border: 1px solid var(--border-subtle);
          border-left: 2px solid var(--amber);
          padding: 32px 36px;
          max-width: 720px;
          margin-bottom: 64px;
        }
        .whatif-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2.8vw, 28px);
          font-weight: 300;
          line-height: 1.5;
          color: var(--white);
          margin-bottom: 24px;
        }
        .whatif-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .whatif-list span {
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.1em;
          color: var(--white-dim);
          text-transform: uppercase;
        }
        .whatif-list .whatif-closer {
          color: var(--amber);
          font-weight: 500;
          margin-top: 4px;
        }

        /* SCROLL REVEAL */
        .reveal {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          nav { padding: 14px 20px; }
          .problem-grid { grid-template-columns: 1fr; }
          .modality-row { grid-template-columns: 1fr; }
          .stack-header { grid-template-columns: 1fr; gap: 28px; }
          .vs-grid { grid-template-columns: 1fr; }
          .vs-divider { display: none; }
          .vs-col { padding: 0 !important; }
          .vs-unified { grid-template-columns: 1fr; }
          .proof-grid { grid-template-columns: 1fr; }
          .nos-mos-grid { grid-template-columns: 1fr; }
          .nos-mos-bridge { grid-template-columns: 1fr; }
          .nos-mos-bridge-item { padding: 12px 0 !important; border-right: none !important; border-bottom: 1px solid var(--border); }
          .nos-mos-bridge-item:last-child { border-bottom: none; }
          .testimonial-grid { grid-template-columns: 1fr; }
          .hero-proof-strip { flex-direction: column; }
          .hero-proof-item { border-right: none; border-bottom: 1px solid var(--border-subtle); }
          .hero-proof-item:last-child { border-bottom: none; }
          .insight-quote { padding-left: 20px; font-size: clamp(20px, 5vw, 30px); }
          .cta-proof-strip { flex-direction: column; align-items: center; }
          .cta-proof-item { border-right: none; }
        }
      `}</style>

      {/* Noise texture overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.5,
        }}
      />

      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo-img" style={{ display: 'block' }}>
          <img src="logol.png" alt="unbecoming" style={{ height: '28px', display: 'block' }} />
        </a>
        <div className="nav-right">
          <a href="https://unbecoming.app/auth/signin" className="nav-login">Log In</a>
          <a href="https://unbecoming.app/auth/signup" className="nav-cta">Begin Installation</a>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="glow-orb"></div>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '820px' }}>
          <p className="hero-eyebrow">Unbecoming | The Stack</p>
          <h1 className="hero-headline">
            Every proven method<br />
            for transformation.<br />
            <em>One daily ritual.</em>
          </h1>
          <p className="hero-sub">
            Ancient wisdom practices and modern neuroscience - distilled, sequenced, and automated into one daily ritual stack that installs itself without you having to learn, understand, or believe in a single thing.
          </p>
          <div className="hero-cta-group">
            <a href="#cta" className="btn-primary">Begin Your Free Installation</a>
            <p className="hero-note">
              Stage 1 is free. Nothing Required. No Experience Needed.{' '}
              <span style={{ color: 'var(--white-dim)', fontStyle: 'italic' }}>
                (You don&apos;t need to know what any of this is. Just do it.)
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section id="philosophy">
        <div className="glow-orb"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="reveal" style={{ textAlign: 'center' }}>
            <img
              src="logol.png"
              alt="unbecoming"
              style={{ maxWidth: '420px', width: '90%', margin: '0 auto 36px', display: 'block' }}
            />
            <p className="philosophy-body">
              Transformation is not about <em>becoming more.</em><br />
              Adding more. Doing more. Fixing more.
            </p>
            <p className="philosophy-clarifier">
              It&apos;s about stripping away everything you are <em>not</em> - the patterns, the noise, the accumulated conditioning - until what was always true becomes undeniable. Unbecoming doesn&apos;t build a new you. It removes the interference between you and the version that was already there.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* PROBLEM */}
      <section id="problem">
        <div className="container">
          <p className="section-label reveal">The Real Problem</p>
          <p className="problem-lead reveal">
            You already know what you <em>should</em> be doing.
          </p>
          <p className="problem-para reveal">
            You&apos;ve done the work. Put in the time. Spent the money. You&apos;re not lazy and you&apos;re not broken. But here you are - still running the same default programs, still reacting the same ways, still hitting the same ceilings.
          </p>
          <div className="tried-list reveal">
            {[
              'Another meditation app', 'Vagus nerve stimulation device',
              'Business or personal development book', 'Online course',
              'Therapy session', 'Life coaching', 'Biohacking protocol',
              'Plant-based retreat', '"God-mode" AI prompt',
              'Morning routine from a podcast', 'Breathwork workshop',
              'Cold plunge membership', 'Journaling challenge',
              'Manifestation practice', 'Habit tracker app',
              'HRV wearable', 'Neurofeedback session', 'Affirmations',
            ].map((item) => (
              <span key={item} className="tried-item">{item}</span>
            ))}
          </div>
          <p className="tried-closing reveal">
            And yet - here you are. <strong>Still operating on the same default settings you&apos;ve had for years.</strong>
          </p>
          <div className="problem-grid reveal">
            {[
              { idx: '01', title: 'The Therapy Problem', body: 'Profound insight. Zero installation. You understand your patterns perfectly - and repeat them anyway. Insight without a daily nervous system practice to encode it changes nothing at the biological level.' },
              { idx: '02', title: 'The App Problem', body: 'Ten minutes of guided breathing in complete isolation. No progression, no context, no system. You feel better for an hour, then your default programming reasserts itself by noon.' },
              { idx: '03', title: 'The Retreat Problem', body: 'Peak experience. Then Monday happens. Without a structured daily integration practice, the most profound weekend of your life becomes a distant memory within three weeks.' },
              { idx: '04', title: 'The Course Problem', body: 'More information about transformation. Which you intellectually absorb, and then don\'t do. Knowledge was never the bottleneck. Automated, sequenced practice is.' },
              { idx: '05', title: 'The Device Problem', body: 'You get biometric data without a system to translate it into behavioral change. A readiness score tells you how you slept. It doesn\'t tell you how to rewire.' },
              { idx: '06', title: 'The Modality Problem', body: 'Each method works - in isolation. But transformation is a systems problem. No single modality addresses the nervous system, the cognitive layer, the identity layer, and the relational layer simultaneously.' },
            ].map((item) => (
              <div key={item.idx} className="problem-item" data-index={item.idx}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
          <p className="problem-kicker reveal">
            The problem was never a lack of information or tools. It was the absence of a{' '}
            <span>system that makes transformation automatic.</span>
          </p>
        </div>
      </section>

      <div className="divider"></div>

      {/* MECHANISM */}
      <section id="mechanism">
        <div className="container">
          <p className="section-label reveal">The Mechanism</p>
          <div className="whatif-block reveal">
            <p className="whatif-body">
              What if every major proven methodology for rewiring the human mind and nervous system - from ancient contemplative practice to clinical cognitive therapy to neuroscience-backed biofeedback - was already running inside your daily ritual, working on you simultaneously, in the exact developmental sequence your brain needs to actually change?
            </p>
            <div className="whatif-list">
              <span>Not a modality you have to learn.</span>
              <span>Not a technique you have to remember.</span>
              <span>Not a practice you have to believe in.</span>
              <span className="whatif-closer">Just a stack. That runs. Every day.</span>
            </div>
          </div>
          <h2 className="mechanism-intro reveal">
            We didn&apos;t invent anything.<br />
            We <em>installed</em> everything.
          </h2>
          <p className="mechanism-body reveal">
            Unbecoming is not a new theory of transformation. It is a delivery system for every proven one - sequenced in developmental order, automated into daily rituals, and tracked so you can see the rewiring in real numbers.
          </p>
          <div className="sequence-callout reveal">
            <p>
              <strong>The proprietary advantage isn&apos;t the individual methods - it&apos;s the sequence.</strong> Most transformation fails not because the tools are wrong, but because they&apos;re applied out of order. You can&apos;t install Flow without regulation. You can&apos;t install Identity without embodiment. You can&apos;t integrate without first building the observer. The sequencing is the result of mapping every major modality to its developmental prerequisite - so each stage creates the neural conditions for the next one to actually take hold.
            </p>
          </div>

          {/* COLLAPSIBLE TABLE */}
          <div className="table-wrapper reveal">
            <div
              className={`table-toggle-bar${tableOpen ? ' open' : ''}`}
              onClick={() => setTableOpen(!tableOpen)}
            >
              <span className="table-toggle-label">▸ Full Methodology Stack - 12+ Proven Frameworks</span>
              <span className="table-toggle-hint">
                Click to explore all modalities included
                <span className="toggle-arrow">▾</span>
              </span>
            </div>

            <div className={`modality-table${tableOpen ? ' open' : ''}`}>
              <div className="modality-row">
                <div className="modality-cell header-cell"><span>Method / Framework</span></div>
                <div className="modality-cell header-cell"><span>What It Does To Your Brain</span></div>
                <div className="modality-cell header-cell"><span>Where It Lives In The System</span></div>
              </div>
              {[
                {
                  name: 'HRVB Biofeedback',
                  source: 'HeartMath Institute · Decades of clinical research',
                  mechanism: 'Stimulates vagus nerve via resonance breathing. Raises RMSSD. Trains autonomic regulation - your body\'s ability to shift from threat to safety on command.',
                  practice: 'Stage 1+ → Resonance Breathing (5 min, daily)',
                },
                {
                  name: 'Polyvagal Theory',
                  source: 'Stephen Porges',
                  mechanism: 'The 7-stage architecture is a polyvagal progression - from ventral vagal stabilization to social engagement system to full integration. The sequence isn\'t arbitrary. It\'s the order your nervous system requires.',
                  practice: 'Embedded in the stage architecture itself',
                },
                {
                  name: 'Metacognitive Therapy (MCT)',
                  source: 'Adrian Wells · Outperforms CBT in multiple clinical trials',
                  mechanism: 'Strengthens the insula-PCC pathway - the neural circuit of noticing you\'re thinking. Trains the observer function so you catch reactive patterns before they run you.',
                  practice: 'Stage 1–7 → Awareness Rep (3 min, daily)',
                },
                {
                  name: 'Decentering / MBCT',
                  source: 'Segal, Williams & Teasdale · Clinically proven to prevent depressive relapse',
                  mechanism: 'Breaks thought-identity fusion. "I am anxious" becomes "there is anxiety." Interrupts the recursive loops that sustain suffering. Available as on-demand tool throughout all stages.',
                  practice: 'Stage 1+ → On-demand Decentering Practice',
                },
                {
                  name: 'CBT / Cognitive Reframing',
                  source: 'Aaron Beck · Albert Ellis (REBT)',
                  mechanism: 'The Reframe Protocol runs the full ABC model: Event → Automatic Story → Alternative Interpretations → Action → Embodied Anchor. Precision debugging for distorted meaning-making.',
                  practice: 'Stage 3+ → On-demand Reframe Protocol',
                },
                {
                  name: 'ACT - Cognitive Defusion',
                  source: 'Steven Hayes · Acceptance & Commitment Therapy',
                  mechanism: 'Unhooks identification from thought content without suppression. You don\'t change the thought - you change your relationship to it. Prevents the fusion that keeps patterns locked in place.',
                  practice: 'Stage 1+ → Embedded in Decentering Practice',
                },
                {
                  name: 'Self-Efficacy Theory',
                  source: 'Albert Bandura · Foundational behavioral science',
                  mechanism: 'Identity change requires daily evidence. The Cue generates "mastery experiences" - the exact mechanism Bandura identified as the primary driver of durable self-concept restructuring.',
                  practice: 'Stage 3+ → The Cue (2 min, daily)',
                },
                {
                  name: 'Flow State Science',
                  source: 'Csikszentmihalyi · Kotler',
                  mechanism: 'Structured induction of challenge-skill balance. Trains frontal-parietal network synchronization. With daily repetition, what once required effort becomes your default operating state.',
                  practice: 'Stage 4+ → Flow Block (60–90 min, daily)',
                },
                {
                  name: 'Loving-Kindness (Metta)',
                  source: 'Theravada Buddhist practice · 2,500 years of refinement',
                  mechanism: 'Activates the ventral vagal social engagement system. Raises oxytocin. Reduces inflammatory markers. The ancient sequence (friend → neutral → self → difficult → all beings) is the protocol.',
                  practice: 'Stage 5+ → Co-Regulation Practice (2 min, daily)',
                },
                {
                  name: 'Hippocampal Memory Consolidation',
                  source: 'Sleep neuroscience research',
                  mechanism: 'Sleep transfers episodic memory to semantic/trait memory. The Nightly Debrief happens at the precise neurological window - pre-sleep - when encoding into permanent trait-level change is most efficient.',
                  practice: 'Stage 6+ → Nightly Debrief (2 min, pre-sleep)',
                },
                {
                  name: 'BDNF Production Protocols',
                  source: 'Exercise neuroscience · Hormetic stress research',
                  mechanism: 'Exercise + HRV training + sleep = maximum BDNF output. Brain-Derived Neurotrophic Factor is the molecular fertilizer for new synaptic connections. Without it, practices don\'t consolidate.',
                  practice: 'All stages → Movement + Sleep optimization protocols',
                },
                {
                  name: 'Mastery Learning (Bloom)',
                  source: 'Benjamin Bloom · Educational neuroscience',
                  mechanism: 'You don\'t advance on time. You advance on demonstrated neural readiness. Adherence + measurable domain deltas unlock the next stage - because premature advancement destroys retention and compounding.',
                  practice: 'The unlock system - all 7 stages',
                },
                {
                  name: 'Non-Dual Inquiry',
                  source: 'Advaita Vedanta · Ramana Maharshi - translated into clinical language',
                  mechanism: '"Who is aware of the thought?" - the most powerful question in contemplative science, embedded from Stage 1. Ancient self-inquiry pointing to the same recognition modern neuroscience calls default mode network decoupling.',
                  practice: 'Stage 1+ → Decentering Practice, Meta-Reflection',
                },
              ].map((row) => (
                <div key={row.name} className="modality-row">
                  <div className="modality-cell">
                    <div className="m-name">{row.name}</div>
                    <div className="m-source">{row.source}</div>
                  </div>
                  <div className="modality-cell">
                    <div className="m-mechanism">{row.mechanism}</div>
                  </div>
                  <div className="modality-cell">
                    <div className="m-practice">{row.practice}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── NOS / MOS ── */}
      <section id="nos-mos">
        <div className="container">
          <p className="section-label reveal">The Architecture</p>
          <h2 className="mechanism-intro reveal" style={{ marginBottom: '10px' }}>
            Two systems.<br /><em>One installation.</em>
          </h2>
          <p className="mechanism-body reveal" style={{ marginBottom: '36px' }}>
            The Stack rewires both layers simultaneously because lasting change requires the hardware and the software to upgrade together.
          </p>

          <div className="nos-mos-grid reveal">
            <div className="nos-mos-card">
              <span className="nos-mos-icon">〰</span>
              <div className="nos-mos-title">Neural Operating System</div>
              <div className="nos-mos-subtitle">NOS — The Hardware</div>
              <p className="nos-mos-body">
                Your nervous system is the hardware. Most people run in constant threat-response mode, burning out the system. The NOS protocols give your body a new baseline - one of coherent regulation, not chronic activation.
              </p>
              <ul className="nos-mos-list">
                <li>Measurable HRV improvement within 14 days</li>
                <li>Vagal tone optimization through resonance training</li>
                <li>Embodied presence — awareness that lives in the body, not just the mind</li>
                <li>Threat-response rewiring at the physiological level</li>
              </ul>
            </div>

            <div className="nos-mos-card">
              <span className="nos-mos-icon">◈</span>
              <div className="nos-mos-title">Mental Operating System</div>
              <div className="nos-mos-subtitle">MOS — The Software</div>
              <p className="nos-mos-body">
                Your mind is the software. Most self-help teaches you to add more apps. The MOS protocols upgrade the entire operating system - how you process, interpret, and respond to reality itself.
              </p>
              <ul className="nos-mos-list">
                <li>Training your reticular activated system through 21-day cue training</li>
                <li>Flow state training for sustained deep work</li>
                <li>Cognitive reframing — not positive thinking, precision debugging</li>
                <li>Meta-awareness: watching the mind, not being run by it</li>
              </ul>
            </div>
          </div>

          <div className="nos-mos-bridge reveal">
            {[
              { old: 'Learning', next: 'Installation' },
              { old: 'Information', next: 'Transformation' },
              { old: 'Willpower', next: 'System Design' },
            ].map((item) => (
              <div key={item.old} className="nos-mos-bridge-item">
                <span className="bridge-old">{item.old}</span>
                <span className="bridge-arrow">→</span>
                <span className="bridge-new">{item.next}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHT QUOTE */}
      <section id="insight">
        <div className="container">
          <blockquote className="insight-quote reveal">
            Therapists deploy one of these methods.<br />
            Coaches maybe use two.<br />
            Researchers study them in isolation for careers.<br />
            Retreat programs deliver one for a weekend and call it a transformation.<br /><br />
            <em>
              Unbecoming runs all of them.<br />
              Simultaneously. In the correct developmental sequence.<br />
              As a stacked 16-minute daily ritual that installs itself.
            </em>
            <span className="accent-line">Without you needing to understand any of it.</span>
          </blockquote>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how">
        <div className="container">
          <p className="section-label reveal">The Architecture</p>
          <div className="how-intro reveal">
            <h2>Seven stages.<br />One installation.</h2>
            <p>Each stage unlocks when your nervous system demonstrates readiness - not when the calendar says so. You advance on evidence, not enthusiasm. Each new stage doesn&apos;t add homework - it adds a new installed capability.</p>
            <p className="time-hint">Starts at 8 min/day (Stage 1) → Builds to 16 min/day (full stack)</p>
          </div>

          <div className="stages-timeline">
            {[
              {
                num: '01', name: 'Neural Priming', tagline: '"Stabilize and Regulate the signal. Teach your nervous system calm coherence."',
                pills: ['🫁 Resonance Breathing - 5 min', '👁 Awareness Rep - 3 min'],
                toolPills: [],
                science: 'Installing: vagal tone baseline · metacognitive observer function · autonomic regulation capacity',
                time: '8 minutes',
              },
              {
                num: '02', name: 'Embodied Awareness', tagline: '"Bring meta-awareness into motion."',
                pills: ['+ 🧘 Somatic Flow - 2 min'],
                toolPills: [],
                science: 'Installing: proprioceptive mapping · interoceptive awareness · cerebrospinal coherence',
                time: '10 minutes',
              },
              {
                num: '03', name: 'Cue Training', tagline: '"Catch patterns before they become you."',
                pills: ['+ ⚡ The Cue - 2 min'],
                toolPills: ['🔑 Reframe Protocol unlocked'],
                science: 'Installing: reticular priming · identity-schema consolidation · salience network calibration',
                time: '12 minutes',
              },
              {
                num: '04', name: 'Flow Mode', tagline: '"Train sustained attention on performance drivers."',
                pills: ['+ 🎯 Flow Block - 60–90 min'],
                toolPills: ['🔑 Thought Hygiene unlocked'],
                science: 'Installing: frontal-parietal network synchronization · dopaminergic attention circuits · challenge-skill calibration',
                time: null,
              },
              {
                num: '05', name: 'Relational Coherence', tagline: '"Train the nervous system to stay open in connection."',
                pills: ['+ 💞 Co-Regulation - 2 min'],
                toolPills: [],
                science: 'Installing: ventral vagal social engagement circuit · oxytocin signaling · compassion and relational regulation',
                time: '14 minutes',
              },
              {
                num: '06', name: 'Integration', tagline: '"Convert insight into stable, trait-level awareness."',
                pills: ['+ 🌙 Nightly Debrief - 2 min'],
                toolPills: [],
                science: 'Installing: hippocampal-to-trait encoding · narrative integration · sleep-based consolidation of change',
                time: '16 minutes (full stack)',
              },
            ].map((stage) => (
              <div key={stage.num} className="stage-entry reveal">
                <div className="stage-number-wrap"><div className="stage-dot"></div></div>
                <div className="stage-body">
                  <div className="stage-header">
                    <span className="stage-num">Stage {stage.num}</span>
                    <span className="stage-name">{stage.name}</span>
                  </div>
                  <p className="stage-tagline">{stage.tagline}</p>
                  <div className="stage-practices">
                    {stage.pills.map((p) => <span key={p} className="practice-pill">{p}</span>)}
                    {stage.toolPills.map((p) => <span key={p} className="practice-pill tool">{p}</span>)}
                  </div>
                  <p className="stage-science">{stage.science}</p>
                  {stage.time && (
                    <p className="stage-science" style={{ marginTop: '6px', color: 'var(--amber)' }}>
                      ⟶ Total daily time: {stage.time}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Stage 7 */}
            <div className="stage-entry reveal">
              <div className="stage-number-wrap">
                <div className="stage-dot" style={{ background: 'transparent', borderColor: 'var(--amber)' }}></div>
              </div>
              <div className="stage-body" style={{ background: 'var(--amber-dim)', borderColor: 'var(--border)' }}>
                <div className="stage-header">
                  <span className="stage-num">Stage 07</span>
                  <span className="stage-name" style={{ color: 'var(--amber)' }}>Accelerated Expansion</span>
                </div>
                <p className="stage-tagline">&ldquo;Awareness engineers itself.&rdquo;</p>
                <div className="stage-practices">
                  <span className="practice-pill">Nootropics · Neurofeedback · Advanced Integration Protocols</span>
                </div>
                <p className="stage-science">Application required · Manual unlock · By invitation only</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAILY STACK */}
      <section id="stack">
        <div className="container">
          <div className="stack-header reveal">
            <h2>The complete<br />daily ritual stack.</h2>
            <p>By Stage 6, you&apos;re running the full Stack - 12+ proven modalities, stacked and operating simultaneously. Here&apos;s what the full installation actually costs you in time each day.</p>
          </div>
          <div className="time-breakdown reveal">
            {[
              { icon: '🫁', label: 'Resonance Breathing', sub: 'Vagal tone · HRV training · Autonomic regulation', time: '5 min' },
              { icon: '👁', label: 'Awareness Rep', sub: 'Metacognitive training · Observer function · Decentering', time: '3 min' },
              { icon: '🧘', label: 'Somatic Flow', sub: 'Proprioception · Embodied awareness · Spinal coherence', time: '2 min' },
              { icon: '⚡', label: 'The Cue', sub: 'Identity installation · Self-efficacy · Daily behavioral proof', time: '2 min' },
              { icon: '💞', label: 'Co-Regulation Practice', sub: 'Loving-kindness · Oxytocin activation · Social engagement system', time: '2 min' },
              { icon: '🌙', label: 'Nightly Debrief', sub: 'Hippocampal encoding · Trait-level consolidation · Sleep preparation', time: '2 min' },
            ].map((row) => (
              <div key={row.label} className="time-row">
                <div className="time-row-left">
                  <span className="time-icon">{row.icon}</span>
                  <div>
                    <div className="time-label">{row.label}</div>
                    <div className="time-sub">{row.sub}</div>
                  </div>
                </div>
                <span className="time-duration">{row.time}</span>
              </div>
            ))}
            <div className="time-row time-total">
              <div className="time-row-left">
                <span className="time-icon">🧠</span>
                <div>
                  <div className="time-label">Full Stack Runtime</div>
                  <div className="time-sub">12+ proven modalities · Running simultaneously · Every single day</div>
                </div>
              </div>
              <span className="time-duration">16 min/day</span>
            </div>
          </div>
          <div className="stack-note reveal">
            <span>→ You start Stage 1 with just 8 minutes a day.</span> Each stage adds a single practice as your nervous system earns the capacity for it. By the time you reach 16 minutes, the whole stack feels like one fluid ritual - not six separate things.
          </div>
        </div>
      </section>

      {/* VS */}
      <section id="vs">
        <div className="container">
          <div className="vs-header reveal">
            <h2>What you&apos;d need<br />to buy otherwise.</h2>
            <p>This is what The Stack replaces - if you tried to assemble and sequence it yourself.</p>
          </div>
          <div className="vs-grid reveal">
            <div className="vs-col theirs">
              <p className="vs-col-title">The DIY Route</p>
              <ul className="vs-list">
                {[
                  'HRV biofeedback device + subscription app',
                  'Weekly CBT therapy sessions',
                  'Mindfulness / meditation app subscription',
                  'Breathwork course or teacher',
                  'Performance coach for flow training',
                  'Books on polyvagal theory, MCT, ACT, Bandura (weeks to read)',
                  'Loving-kindness retreat or teacher',
                  'Someone to design the developmental sequence for you',
                  'The discipline to actually do it all, daily, in order',
                  'Zero guarantee any of it compounds into permanent change',
                ].map((item) => (
                  <li key={item}><span className="icon">→</span> {item}</li>
                ))}
              </ul>
            </div>
            <div className="vs-divider"></div>
            <div className="vs-col ours">
              <p className="vs-col-title">Unbecoming</p>
              <ul className="vs-list">
                {[
                  'Everything. Pre-sequenced. Pre-stacked. Pre-integrated.',
                  'An AI coach that detects which tool you need and offers it',
                  'Competence-based unlocking - you advance when your nervous system is ready',
                  'Measurable delta tracking across 4 domains from day one',
                  'No learning curve. No expertise required. Just the daily ritual.',
                  'No device required to start',
                  'Starts at 8 minutes a day',
                  'Stage 1 is free',
                ].map((item) => (
                  <li key={item}><span className="icon">✦</span> {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="vs-unified reveal">
            <div className="vs-u-cell grey">
              <div className="vs-u-label">DIY Estimated Monthly Cost</div>
              <div className="vs-u-price red">$800<span className="vs-u-plus">+</span></div>
              <div className="vs-u-sub">Therapy · Device · Apps · Courses · Coach<br />And you still have to figure out the sequence yourself.</div>
            </div>
            <div className="vs-u-cell amber">
              <div className="vs-u-label">Unbecoming</div>
              <div className="vs-u-price gold">Free <span className="vs-u-tostart">to start</span></div>
              <div className="vs-u-sub">Stage 1 costs nothing. No credit card.<br />The full installation is a fraction of one therapy session.</div>
            </div>
            <div className="vs-u-cell grey stat">
              <div className="vs-u-num">5-10</div>
              <div className="vs-u-stat-label">Hours/week</div>
            </div>
            <div className="vs-u-cell amber stat">
              <div className="vs-u-num">16</div>
              <div className="vs-u-stat-label">Minutes/day, full stack</div>
            </div>
            <div className="vs-u-cell grey stat">
              <div className="vs-u-num">4+</div>
              <div className="vs-u-stat-label">Apps and devices to manage</div>
            </div>
            <div className="vs-u-cell amber stat">
              <div className="vs-u-num">1</div>
              <div className="vs-u-stat-label">System. Everything included.</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY THIS WORKS */}
      <section id="why">
        <div className="container">
          <p className="section-label reveal">Why This Works</p>
          <div className="proof-grid">
            {[
              { metric: '12+', label: 'Of The Best Proven Modalities', desc: 'Not cherry-picked. Not trending. Every method included has a clinical or scientific evidence base - and a specific role in the sequence.' },
              { metric: '7–14', label: 'Days Per Stage Minimum', desc: 'Neuroplastic encoding requires repetition. You don\'t advance on enthusiasm. You advance when adherence and measurable domain deltas confirm neural readiness.' },
              { metric: '4', label: 'Clinically Measurable Domains', desc: 'Regulation, Awareness, Outlook, Attention. Tracked weekly from your baseline. You don\'t guess if it\'s working. You see it in numbers.' },
            ].map((card) => (
              <div key={card.metric} className="proof-card reveal">
                <div className="proof-metric">{card.metric}</div>
                <div className="proof-metric-label">{card.label}</div>
                <p className="proof-desc">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials">
        <div className="container">
          <p className="section-label reveal">Real Results</p>

          <div className="testimonial-grid reveal">
            <div className="testimonial-card">
              <div className="testimonial-stat">5×</div>
              <div className="testimonial-stat-label">Revenue Growth</div>
              <p className="testimonial-quote">
                &ldquo;My business did $60k the first year. $90k the next. After this protocol, I&apos;ll cross the{' '}
                <em>$300k mark.</em> Something in the way I operate completely changed.&rdquo;
              </p>
              <div className="testimonial-byline">
                <div className="testimonial-name">Jesse</div>
                <div className="testimonial-role">Entrepreneur</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stat">7</div>
              <div className="testimonial-stat-label">Consecutive $1M+ Months</div>
              <p className="testimonial-quote">
                &ldquo;Since doing this I have had <em>7 million dollar months in a row.</em> I have never done that before. Something just started clicking. Hard to describe.&rdquo;
              </p>
              <div className="testimonial-byline">
                <div className="testimonial-name">Brian</div>
                <div className="testimonial-role">Business Owner</div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stat">36</div>
              <div className="testimonial-stat-label">Days Free From Anxiety & Sleep Medication</div>
              <p className="testimonial-quote">
                &ldquo;<em>36 days without anxiety or sleep pills</em> after finishing Stage 7. Complete freedom I hadn&apos;t experienced in years.&rdquo;
              </p>
              <div className="testimonial-byline">
                <div className="testimonial-name">Martin</div>
                <div className="testimonial-role">Stage 7 Graduate</div>
              </div>
            </div>
          </div>

          <div className="testimonial-closer reveal">
            <p className="testimonial-closer-quote">
              &ldquo;This has <em>completely changed who I am</em> for the better. I am in such an amazing place and want to thank you from the bottom of my heart.&rdquo;
            </p>
            <span className="testimonial-closer-attr">— Alan</span>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq">
        <div className="container">
          <p className="section-label reveal">Common Questions</p>

          <div className="faq-list">
            {[
              {
                q: 'How is this different from meditation apps like Calm or Headspace?',
                a: 'Those apps teach you a practice. The IOS installs a complete operating system. Meditation apps address symptoms — stress, sleep, momentary calm. The Stack rewires the underlying architecture: your nervous system\'s baseline and your mind\'s default patterns. You don\'t just follow guided audio. The system tracks your readiness, advances you on competence, and adapts to your specific journey.',
              },
              {
                q: 'How much time does this actually take?',
                a: 'Stage 1 is 8 minutes a day — two practices, no equipment required. As you progress through the stages, rituals stack but they\'re designed to integrate into your existing morning and evening, not add hours to your day. The full installation at Stage 6 is 16 minutes. Most people find the ROI on that time is significant because their performance and clarity in everything else improves.',
              },
              {
                q: 'What if I\'ve tried everything and nothing has stuck?',
                a: 'That\'s exactly who this is for. You\'ve tried adding more tools, more practices, more discipline. The IOS takes a different approach: it upgrades the underlying system. If everything else has been software patches on a faulty operating system, this is the kernel update. The reason other approaches didn\'t stick isn\'t you — it\'s that they were applied without the prerequisite nervous system foundation to hold them.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`faq-item reveal${openFaq === i ? ' open' : ''}`}
              >
                <button
                  className="faq-trigger"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="faq-question">{item.q}</span>
                  <span className="faq-arrow">+</span>
                </button>
                {openFaq === i && (
                  <div className="faq-answer">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="glow-orb"></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <p className="cta-eyebrow">Begin Installation</p>
          <h2 className="cta-headline">
            You don&apos;t need to<br />learn anything.<br />
            <em>Just show up.</em>
          </h2>
          <p className="cta-sub">
            The sequence is designed. The science is embedded. The system runs itself. Your only job is 8 minutes tomorrow morning.
          </p>
          <a href="https://unbecoming.app/auth/signup" className="btn-primary">Install Stage 1 - It&apos;s Free</a>
          <div className="cta-proof-strip">
            {['No credit card', 'No device required', 'Starts at 8 min/day', 'No expertise needed', 'Scales to 16 min at full installation'].map((item) => (
              <div key={item} className="cta-proof-item"><span>✦</span> {item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2026 Unbecoming</p>
        <p>unbecoming.app</p>
      </footer>
    </>
  );
}
