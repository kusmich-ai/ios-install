export type StageId = 1 | 2 | 3 | 4 | 5 | 6;

export const stageAttribution = {
  1: {
    unlockTitle: "Stage 1 — Neural Priming",
    unlockBody:
      "The goal here isn’t calm. It’s access.\nSome days you’ll feel regulated. Some days nothing will change.\nBoth mean the system is training.",
    ritualMicrocopy:
      "Training access, not chasing a feeling."
  },
  2: {
    unlockTitle: "Stage 2 — Embodied Awareness",
    unlockBody:
      "This isn’t to feel better.\nIt’s to teach awareness where to live when the body is moving.",
    ritualMicrocopy:
      "Training awareness in motion."
  },
  3: {
    unlockTitle: "Stage 3 — Identity Mode",
    unlockBody:
      "The action itself doesn’t matter.\nThe brain updates identity from evidence, not intention.\nThis is evidence.",
    ritualMicrocopy:
      "Evidence installs identity."
  },
  4: {
    unlockTitle: "Stage 4 — Flow Mode",
    unlockBody:
      "Flow Blocks don’t create flow.\nThey reveal your current attention limits.\nFragmentation means the system is working.",
    ritualMicrocopy:
      "The point is the edge."
  },
  5: {
    unlockTitle: "Stage 5 — Relational Coherence",
    unlockBody:
      "This isn’t about kindness or forgiveness.\nIt trains regulation in the presence of threat cues.",
    ritualMicrocopy:
      "Training regulation in relationship."
  },
  6: {
    unlockTitle: "Stage 6 — Integration",
    unlockBody:
      "This isn’t reflection.\nIt’s memory consolidation.\nThe lesson matters less than the encoding.",
    ritualMicrocopy:
      "Encode the day. Don’t analyze it."
  }
} as const;
