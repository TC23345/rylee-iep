// Typed port of the former static dashboard data structures (architecture map §7).
// Pure data + helpers — no "use client", safe to import in Server Components.
//
// Module-7 fix (architecture map §8.1): MODULES[6] carries all 5 deliverables and
// `skillsForModule` derives the sidebar skill list straight from each module's
// deliverables, so every deliverable slug routes (the old sidebar hand-listed only 3).
// Dropped from the port: dead cohort machinery (COURSE_START/WEEKS/computeCohortState)
// and the unused renderDeliverableLinks.

export type ModuleStatus = "scaffold" | "pending";

export interface DeliverableLink {
  slug: string;
}

export interface Deliverable {
  text: string;
  links: DeliverableLink[];
  heading?: string;
  body?: string;
}

export interface ModuleDef {
  n: number;
  short: string;
  title: string;
  status: ModuleStatus;
  deliverables: Deliverable[];
}

export interface M1Skill {
  title: string;
  description: string;
  deliverableMatch: string;
}

export type M1LensKey = "expert" | "research" | "module";

export interface M1Lens {
  key: M1LensKey;
  num: string;
  label: string;
  hint: string;
}

export interface BusinessFile {
  file: string;
  title: string;
  desc: string;
  skill: string;
}

export interface BizGroup {
  title: string;
  slugs: string[];
}

export const PAGE_TITLES: Record<string, string> = {
  overview: "PIVOT into IEP Advocacy® — Summer 2026",
  business: "Business decisions",
  clients: "Client folders",
  artifacts: "Artifacts",
  archive: "Archive",
};

export const BUSINESS_FILES: BusinessFile[] = [
  { file: "name-candidates.md", title: "Name candidates", desc: "Shortlist and IL SoS availability checks.", skill: "business-name" },
  { file: "entity-decisions.md", title: "Entity decisions", desc: "LLC/PLLC choice, registered agent, EIN obtained (checkbox only — no numbers stored).", skill: "entity-setup" },
  { file: "insurance-decisions.md", title: "Insurance decisions", desc: "Carrier, policy type, coverage confirmed for private practice.", skill: "liability-insurance" },
  { file: "services-fees.md", title: "Services & fees", desc: "Catalog, hourly/flat rates, scope boundaries.", skill: "services-fees" },
  { file: "backend-systems.md", title: "Backend systems", desc: "Drive structure, retention policy, e-signature tool, scheduling.", skill: "backend-systems" },
  { file: "intake-process.md", title: "Intake process", desc: "Operational steps from inquiry to signed engagement.", skill: "intake-process" },
];

export const CONTEXT_PLACEHOLDERS = `[Initial Research Context - this is conducted before the module to give us an introduction to the concepts included within the heading/bullet point]

[Module Knowledge Context - this is synthesized by parsing the video transcript of the lesson into one paragraph using 5 to 7 clear, concise, and complete sentences applying the module knowledge to the concept included within the heading/bullet point]

[Rylee's Expert Context - this is input provided directly from Rylee that weighs the heaviest on any and all downstream tasks/deliverables included within the heading/bullet point]`;

export const MODULES: ModuleDef[] = [
  {
    n: 1, short: "Business of Private Pay", title: "The Business of Private Pay", status: "scaffold",
    deliverables: [
      { text: "Pick a name and register your new business entity with your state", links: [{ slug: "business-name" }, { slug: "entity-setup" }] },
      { text: "Update your liability insurance to include your new private practice", links: [{ slug: "liability-insurance" }] },
      { text: "Clearly define your set of services and fee structure", links: [{ slug: "services-fees" }] },
      { text: "Set up your back end systems for file organization and contracts", links: [{ slug: "backend-systems" }] },
      { text: "Create your custom client intake process so you can get started right away", links: [{ slug: "intake-process" }] },
    ],
  },
  {
    n: 2, short: "Navigating Special Ed", title: "Navigating the Special Education System", status: "pending",
    deliverables: [
      { text: "Learn the meaning of special education methodology, terms, and philosophies", links: [{ slug: "sped-methodology" }] },
      { text: "Build a foundation for IEP Advocacy based on your knowledge of special education", links: [{ slug: "advocacy-foundation" }] },
      { text: "Begin completing an IEP Advocacy checklist", links: [{ slug: "iep-checklist-start" }] },
    ],
  },
  {
    n: 3, short: "Expert at IEPs", title: "Becoming an Expert at IEPs", status: "pending",
    deliverables: [
      { text: "Learn and understand the 6 steps in the IEP process", links: [{ slug: "iep-process-steps" }] },
      { text: "Describe and define the eligibility for an IEP", links: [{ slug: "iep-eligibility" }] },
      { text: "Become an observation expert", links: [{ slug: "observation-expert" }] },
    ],
  },
  {
    n: 4, short: "Starting the Practice", title: "Starting your IEP Advocacy Practice", status: "pending",
    deliverables: [
      { text: "Identify who your ideal client is", links: [{ slug: "ideal-client" }] },
      { text: "Streamline your intake system", links: [{ slug: "intake-streamline" }] },
      { text: "Identify your support team and self care as an IEP advocate", links: [{ slug: "support-self-care" }] },
    ],
  },
  {
    n: 5, short: "First 5 Clients", title: "Getting your First 5 Clients", status: "pending",
    deliverables: [
      { text: "Identify your key referral sources, so you can create meaningful connections to meet new potential clients", links: [{ slug: "referral-sources" }] },
      { text: "Set up your presence online, so you can attract and nurture clients from there", links: [{ slug: "online-presence" }] },
      { text: "Learn how to attract your ideal clients online and via referrals", links: [{ slug: "client-attraction" }] },
    ],
  },
  {
    n: 6, short: "Working with Clients", title: "Working with Clients", status: "pending",
    deliverables: [
      { text: "Learn the cycle of support for your clients", links: [{ slug: "client-support-cycle" }] },
      { text: "Formulate a plan to support new clients and long term clients", links: [{ slug: "client-plans" }] },
      { text: "Develop the skills to handle conflict management and difficult conversations", links: [{ slug: "conflict-management" }] },
    ],
  },
  {
    n: 7, short: "Advanced SpEd Knowledge", title: "Advanced Special Education Knowledge", status: "pending",
    deliverables: [
      { text: "Learn about Independent Education Evaluations", links: [{ slug: "iee" }] },
      { text: "Understand ESY", links: [{ slug: "esy-disputes" }] },
      { text: "Dispute Key Terms", links: [{ slug: "dispute-key-terms" }] },
      { text: "Understand the difference between mediation and due process", links: [{ slug: "mediation-due-process" }] },
      { text: "Know how to link evaluations to the correct supports", links: [{ slug: "evaluations-to-supports" }] },
    ],
  },
  {
    n: 8, short: "Going Full Time", title: "Taking your Business Full Time", status: "pending",
    deliverables: [
      { text: "Learn when is the right time to let go of direct client work and go full time", links: [{ slug: "full-time-timing" }] },
      { text: "Make a plan for the future so you can sustain your success long term", links: [{ slug: "long-term-plan" }] },
      { text: "Plan your transition so you can leave your current job on good terms", links: [{ slug: "job-transition" }] },
    ],
  },
];

// Module-1 in-app skill pages. Slug → { title, description, deliverableMatch }.
// Presence here is what routes a slug to the rich 3-lens page vs the placeholder.
export const MODULE1_SKILLS: Record<string, M1Skill> = {
  "business-name": {
    title: "Business name",
    description: "Brainstorms private practice business names and walks the user through Illinois Secretary of State name-availability checks. Use when the user asks to brainstorm names, check business name availability, evaluate naming options, choose a name for the practice, or compare candidate names against IL filing rules. Specific to BCBA-led IEP advocacy private practice in Illinois.",
    deliverableMatch: "Pick a name and register your new business entity with your state",
  },
  "entity-setup": {
    title: "Entity setup",
    description: "Walks the user through registering an Illinois business entity for a private IEP advocacy practice — LLC vs PLLC vs sole proprietor decision, IL Secretary of State filing steps, federal EIN registration, and registered agent options. Use when the user asks about entity formation, LLC, PLLC, sole proprietorship, business registration, IL Secretary of State, EIN, registered agent, or operating agreement basics. Does not produce tax classification recommendations — defers to a CPA.",
    deliverableMatch: "Pick a name and register your new business entity with your state",
  },
  "liability-insurance": {
    title: "Liability insurance",
    description: "Walks the user through evaluating and purchasing professional liability insurance for a private IEP advocacy practice in Illinois. Use when the user asks about liability insurance, malpractice coverage, professional liability, E&O coverage, advocate insurance, HPSO, CPH Associates, or whether her NSSEO/agency coverage extends to private practice. Defers actual policy selection and premium quotes to the carrier — does not quote dollar figures.",
    deliverableMatch: "Update your liability insurance to include your new private practice",
  },
  "services-fees": {
    title: "Services & fees",
    description: "Helps the user define the services catalog and fee schedule for a private-pay IEP advocacy practice. Use when the user asks about pricing, fee schedule, what services to offer, hourly vs flat-fee, package design, scope of work, or how to price IEP meeting attendance, record reviews, or observations. Does not draft binding contract terms — those are attorney territory.",
    deliverableMatch: "Clearly define your set of services and fee structure",
  },
  "backend-systems": {
    title: "Backend systems",
    description: "Designs the back-end operational systems for a private IEP advocacy practice — cloud storage and folder structure, document retention policy, e-signature tooling for the services agreement, calendar/scheduling, and email setup. Use when the user asks about practice infrastructure, file organization, Google Drive setup, document retention, e-signature, DocuSign, scheduling tools, or how to organize client records. Hands contract language to intake-process; hands EIN/banking to entity-setup.",
    deliverableMatch: "Set up your back end systems for file organization and contracts",
  },
  "intake-process": {
    title: "Intake process",
    description: "Designs and refines the client intake process for a private IEP advocacy practice — intake form, welcome packet, services-agreement checklist (for attorney review), and the operational steps from first inquiry to signed engagement. Use when the user asks about intake forms, onboarding, welcome packets, services agreements, the steps from inquiry to signed client, or how to handle the first call. Provides templates that the /new-client command instantiates into a client folder.",
    deliverableMatch: "Create your custom client intake process so you can get started right away",
  },
};

// ORDER preserved from the former dashboard (expert → research → module); the displayed `num`
// is 01/02/03 in array order, so tab #1 ("01") is "Rylee's Expert" (architecture §8.8).
export const M1S_LENSES: M1Lens[] = [
  { key: "expert", num: "01", label: "Rylee's Expert", hint: "Weighs heaviest downstream" },
  { key: "research", num: "02", label: "Initial Research", hint: "Pre-module orientation" },
  { key: "module", num: "03", label: "Module Knowledge", hint: "Synthesized from lesson" },
];

export const BIZ_GROUPS: BizGroup[] = [
  { title: "Identity & Entity", slugs: ["business-name", "entity-setup"] },
  { title: "Risk", slugs: ["liability-insurance"] },
  { title: "Money", slugs: ["services-fees"] },
  { title: "Operations", slugs: ["backend-systems", "intake-process"] },
];

export const MODULE_BLURB: Record<number, string> = {
  1: "Pick a name, register the entity, set fees, get insured, and stand up back-end systems.",
  2: "Learn the language of special education and build the advocate-side foundation.",
  3: "Master the six-step IEP process, eligibility criteria, and observation skills.",
  4: "Define the ideal client, streamline intake, and set up your support network.",
  5: "Build referral sources and an online presence to land the first five clients.",
  6: "Run the client support cycle, plan engagements, and handle hard conversations.",
  7: "IEEs, ESY, dispute resolution, and tying evaluations to real supports.",
  8: "Sequence the leap to full-time — exit plan, long-term roadmap, clean handoff.",
};

export interface SkillIndexEntry {
  mod: ModuleDef;
  deliverable: Deliverable;
}

// Build a slug → { mod, deliverable } index from MODULES (first-wins on dup slugs).
function buildSkillIndex(): Record<string, SkillIndexEntry> {
  const idx: Record<string, SkillIndexEntry> = {};
  for (const mod of MODULES) {
    for (const d of mod.deliverables) {
      for (const l of d.links) {
        if (l.slug && !idx[l.slug]) idx[l.slug] = { mod, deliverable: d };
      }
    }
  }
  return idx;
}

export const SKILL_INDEX: Record<string, SkillIndexEntry> = buildSkillIndex();

/** Ordered, de-duped skill slugs for a module — drives the sidebar Skills accordion.
 *  Derived from deliverables so all of Module 7's 5 slugs route (architecture §8.1). */
export function skillsForModule(n: number): string[] {
  const mod = MODULES.find((m) => m.n === n);
  if (!mod) return [];
  const seen = new Set<string>();
  const slugs: string[] = [];
  for (const d of mod.deliverables) {
    for (const l of d.links) {
      if (l.slug && !seen.has(l.slug)) {
        seen.add(l.slug);
        slugs.push(l.slug);
      }
    }
  }
  return slugs;
}

export function getModule(n: number): ModuleDef | undefined {
  return MODULES.find((m) => m.n === n);
}

/** Path to a skill's SKILL.md (opened in a new tab from skill pages). */
export function skillHref(slug: string): string {
  return `.claude/skills/${slug}/SKILL.md`;
}
