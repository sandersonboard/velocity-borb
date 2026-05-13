// ===== Password gate =====
// Soft client-side gate. Anyone with browser dev tools can bypass.
// Sole purpose: keep the URL from being casually shared/indexed.

const GATE_KEY = 'velocity-borb-gate';
const GATE_PASSWORD = 'BORB';

function checkGate() {
  if (sessionStorage.getItem(GATE_KEY) === 'ok') {
    const overlay = document.getElementById('gate-overlay');
    if (overlay) overlay.classList.add('hidden');
    return true;
  }
  return false;
}

function setupGate() {
  if (checkGate()) return;

  const form = document.getElementById('gate-form');
  const input = document.getElementById('gate-input');
  const error = document.getElementById('gate-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value.trim().toUpperCase() === GATE_PASSWORD) {
      sessionStorage.setItem(GATE_KEY, 'ok');
      document.getElementById('gate-overlay').classList.add('hidden');
    } else {
      error.textContent = 'Nope.';
      input.value = '';
      input.focus();
    }
  });

  input.focus();
}

function injectGate() {
  const html = `
    <div id="gate-overlay">
      <div class="brand">Velocity <span class="beta-pill">BETA</span></div>
      <div style="color: var(--muted); font-size: 14px;">Internal preview — enter the code</div>
      <form id="gate-form">
        <input id="gate-input" type="password" maxlength="8" autocomplete="off" placeholder="••••" />
        <button class="btn btn-primary" type="submit">Enter</button>
      </form>
      <div id="gate-error"></div>
    </div>
  `;
  document.body.insertAdjacentHTML('afterbegin', html);
  setupGate();
}

// ===== Fake streaming helper =====
// Streams text character-by-character with realistic-ish jitter
async function streamText(element, text, opts = {}) {
  const baseDelay = opts.delay ?? 12; // ms per char
  const jitter = opts.jitter ?? 8;
  element.classList.add('streaming-cursor');
  element.textContent = '';
  for (let i = 0; i < text.length; i++) {
    element.textContent += text[i];
    const d = baseDelay + Math.random() * jitter;
    // longer pause on sentence breaks
    const extra = (text[i] === '.' || text[i] === '\n') ? 80 : 0;
    await sleep(d + extra);
  }
  element.classList.remove('streaming-cursor');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ===== Timer =====
function startTimer(displayEl, opts = {}) {
  const start = Date.now();
  let raf;
  function tick() {
    const elapsed = Date.now() - start;
    const m = Math.floor(elapsed / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    displayEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
    raf = requestAnimationFrame(tick);
  }
  tick();
  return () => cancelAnimationFrame(raf);
}

// ===== Shared "Helios Robotics" content =====
// Pre-baked agent outputs that get fake-streamed across the demos
const HELIOS = {
  profile: {
    companyName: 'Helios Robotics',
    industry: 'Industrial robotics (hardware + SaaS)',
    revenue: '$50-200M',
    employeeCount: 340,
    fundingStage: 'Series D',
    targetS1: 'Q1 2027',
    externalAuditor: 'Deloitte',
    soxMaturity: 'informal',
  },

  riskAssessment: {
    summary: `Based on Helios Robotics' profile (Series D industrial hardware + SaaS, $50-200M revenue, 340 employees, Deloitte engagement, Q1 2027 S-1 target), the top SOX 404 risk areas concentrate around revenue recognition complexity (hardware + multi-year SaaS contracts), inventory and cost-of-goods controls typical of hardware businesses, and ITGCs for the engineering-led tech stack. Your ~18-month runway to S-1 is workable but compressed — narratives and walkthroughs should begin within 90 days.`,
    risks: [
      {
        area: 'Revenue recognition (ASC 606)',
        rationale: 'Mixed hardware + multi-year SaaS contracts trigger complex performance-obligation allocation. Deloitte will focus here.',
        assumptions: ['Assumed contracts include both hardware delivery and ongoing SaaS', 'Assumed contract terms >12 months']
      },
      {
        area: 'Inventory & COGS',
        rationale: 'Industrial robotics implies significant inventory cycles and standard-cost variance accounting. Common audit finding for hardware businesses pre-IPO.',
        assumptions: ['Assumed inventory is material to financials', 'Assumed standard costing methodology']
      },
      {
        area: 'ITGCs — change management & access',
        rationale: 'Engineering-led 340-person org typically has loose dev-to-prod boundaries. SOX-relevant systems (NetSuite, billing, contract repo) need formal access reviews and change controls.',
        assumptions: ['Assumed cloud-hosted core systems', 'Assumed ~30% of headcount has system access']
      },
      {
        area: 'Stock-based compensation',
        rationale: 'Pre-IPO equity grants accelerate around S-1 filing — large accruals, ASC 718 modifications, 409A interplay all flagged by Deloitte.',
        assumptions: ['Assumed broad-based RSU program', 'Assumed pre-IPO equity refresh in last 12 months']
      },
      {
        area: 'Period-end close & journal entries',
        rationale: 'Informal close processes at 340-person scale typically lack JE approval thresholds and reconciliation evidence — table stakes for SOX.',
        assumptions: ['Assumed monthly close cadence', 'Assumed <5 person finance team']
      }
    ]
  },

  controls: [
    // Financial reporting — sample of 12 (the demo claims ~60)
    { id: 'FR-001', cat: 'financial_reporting', name: 'Revenue recognition — performance obligation review', owner: 'Controller', priority: 'must_have', desc: 'Monthly review of new contracts to confirm ASC 606 performance-obligation allocation matches contract terms.' },
    { id: 'FR-002', cat: 'financial_reporting', name: 'Deferred revenue rollforward', owner: 'Senior Accountant', priority: 'must_have', desc: 'Monthly rollforward of deferred revenue with tie-out to billing system and recognition schedule.' },
    { id: 'FR-003', cat: 'financial_reporting', name: 'Inventory standard-cost variance review', owner: 'Controller', priority: 'must_have', desc: 'Quarterly review of standard-cost variances with management explanation for variances >$50K or 5%.' },
    { id: 'FR-004', cat: 'financial_reporting', name: 'Inventory physical count', owner: 'Operations Lead', priority: 'must_have', desc: 'Annual full physical inventory count with cycle counts of high-value SKUs quarterly.' },
    { id: 'FR-005', cat: 'financial_reporting', name: 'COGS — bill-of-materials reconciliation', owner: 'Cost Accountant', priority: 'should_have', desc: 'Monthly reconciliation of unit-level BOM cost to standard cost in ERP.' },
    { id: 'FR-006', cat: 'financial_reporting', name: 'Stock-based comp expense accrual', owner: 'Senior Accountant', priority: 'must_have', desc: 'Monthly ASC 718 expense recognition tied to vesting schedule from cap table.' },
    { id: 'FR-007', cat: 'financial_reporting', name: 'Journal entry approval — over $25K', owner: 'Controller', priority: 'must_have', desc: 'All manual JEs over $25K require Controller approval before posting.' },
    { id: 'FR-008', cat: 'financial_reporting', name: 'Bank reconciliations', owner: 'Senior Accountant', priority: 'must_have', desc: 'Monthly bank rec for all operating, deposit, and money-market accounts within 10 business days of period close.' },
    { id: 'FR-009', cat: 'financial_reporting', name: 'Accounts payable cutoff', owner: 'AP Specialist', priority: 'must_have', desc: 'Period-end AP cutoff testing — invoices dated within the period are accrued or paid.' },
    { id: 'FR-010', cat: 'financial_reporting', name: 'Accounts receivable aging review', owner: 'AR Lead', priority: 'should_have', desc: 'Monthly AR aging review with bad-debt reserve update.' },
    { id: 'FR-011', cat: 'financial_reporting', name: 'Lease accounting — ASC 842 schedule', owner: 'Senior Accountant', priority: 'should_have', desc: 'Quarterly review of ROU asset and lease liability schedules for all real estate and equipment leases.' },
    { id: 'FR-012', cat: 'financial_reporting', name: 'Income tax provision review', owner: 'External tax provider', priority: 'must_have', desc: 'Quarterly review of income tax provision and deferred tax positions.' },
    // ITGC — sample of 8 (claim ~40)
    { id: 'IT-001', cat: 'itgc', name: 'Production access review', owner: 'IT Director', priority: 'must_have', desc: 'Quarterly review of all production system access; terminations confirmed within 24 hours.' },
    { id: 'IT-002', cat: 'itgc', name: 'Change management — code deploy approval', owner: 'Engineering Manager', priority: 'must_have', desc: 'All production code changes require pull-request review and CI passing before merge.' },
    { id: 'IT-003', cat: 'itgc', name: 'Database backup & restore testing', owner: 'IT Director', priority: 'must_have', desc: 'Monthly automated DB backups; semi-annual restore test for SOX-relevant systems.' },
    { id: 'IT-004', cat: 'itgc', name: 'Segregation of duties — financial systems', owner: 'Controller', priority: 'must_have', desc: 'No single user can both create vendors and approve payments in NetSuite.' },
    { id: 'IT-005', cat: 'itgc', name: 'Multi-factor authentication', owner: 'IT Director', priority: 'must_have', desc: 'MFA enforced for all SOX-relevant systems via SSO provider.' },
    { id: 'IT-006', cat: 'itgc', name: 'Privileged access review', owner: 'IT Director', priority: 'must_have', desc: 'Quarterly review of admin/root accounts across NetSuite, AWS production, Stripe, GitHub Org.' },
    { id: 'IT-007', cat: 'itgc', name: 'Vendor system risk assessment', owner: 'IT Director', priority: 'should_have', desc: 'Annual SOC 2 review of all SOX-relevant SaaS vendors.' },
    { id: 'IT-008', cat: 'itgc', name: 'Audit log monitoring', owner: 'Security Lead', priority: 'should_have', desc: 'Audit logs from financial systems retained 7 years, sampled monthly.' },
    // Entity-level — sample of 4 (claim ~15)
    { id: 'EL-001', cat: 'entity_level', name: 'Code of conduct attestation', owner: 'HR', priority: 'must_have', desc: 'Annual employee attestation to code of conduct, tracked in HRIS.' },
    { id: 'EL-002', cat: 'entity_level', name: 'Whistleblower hotline', owner: 'General Counsel', priority: 'must_have', desc: 'Anonymous reporting channel with audit committee oversight.' },
    { id: 'EL-003', cat: 'entity_level', name: 'Board / audit committee charter', owner: 'General Counsel', priority: 'must_have', desc: 'Audit committee meets at least quarterly with formal minutes.' },
    { id: 'EL-004', cat: 'entity_level', name: 'Authority matrix / signature authority', owner: 'CFO', priority: 'must_have', desc: 'Documented matrix of who can approve what dollar amounts.' },
  ],

  narratives: {
    'FR-001': {
      process: 'Each new contract is logged in NetSuite within 5 business days of execution. The Controller reviews each contract over $100K monthly for ASC 606 performance-obligation allocation, comparing the contract terms to the standard allocation in the system. Discrepancies flagged require explicit Controller sign-off before booking.',
      frequency: 'Monthly',
      evidence: 'Signed allocation review form per contract; NetSuite audit log',
      testApproach: 'Auditor selects sample of 25 contracts per quarter; verifies allocation review form exists and matches contract terms.',
      confidence: 'high',
    },
    'IT-001': {
      process: 'Quarterly, the IT Director exports a list of all production system accounts from Okta, AWS IAM, NetSuite, and GitHub. The list is reviewed against active HRIS roster; departed employees are confirmed terminated; orphaned accounts are flagged for removal within 5 business days.',
      frequency: 'Quarterly',
      evidence: 'Signed access review report per system; HRIS termination tickets',
      testApproach: 'Auditor selects 3 departed employees per quarter; verifies their access was terminated within 24 hours of HR notification.',
      confidence: 'high',
    },
    'FR-003': {
      process: 'At quarter-end, the Controller pulls the standard-cost variance report from NetSuite. Variances >$50K or 5% trigger a written explanation from Operations. The Controller reviews explanations and either accepts or requires further investigation.',
      frequency: 'Quarterly',
      evidence: 'Variance report with annotations; explanation memos',
      testApproach: 'Auditor selects 5 variance items per quarter; reviews explanation rationale and supporting documentation.',
      confidence: 'medium',
      lowConfidenceReason: 'Variance materiality threshold ($50K / 5%) is inferred from revenue band; should be set jointly with Deloitte.',
    },
  },

  walkthroughPlan: {
    auditor: 'Deloitte',
    sequence: [
      { id: 'W1', title: 'Period-end close walkthrough', controls: ['FR-007', 'FR-008', 'FR-009'], attendees: ['Controller', 'Senior Accountant', 'Deloitte audit senior'], pbcs: ['Sample month-end close checklist', 'JE listing >$25K for last 3 months', 'Bank rec packets'], targetWeeks: -52 },
      { id: 'W2', title: 'Revenue recognition walkthrough', controls: ['FR-001', 'FR-002'], attendees: ['Controller', 'Revenue Manager', 'Deloitte audit manager'], pbcs: ['Top 10 contracts by ARR with allocation memos', 'Deferred revenue rollforward template'], targetWeeks: -48 },
      { id: 'W3', title: 'Inventory & COGS walkthrough', controls: ['FR-003', 'FR-004', 'FR-005'], attendees: ['Controller', 'Operations Lead', 'Cost Accountant', 'Deloitte audit senior'], pbcs: ['Last physical count report', 'BOM master file', 'Standard-cost variance reports YTD'], targetWeeks: -44 },
      { id: 'W4', title: 'ITGC walkthrough', controls: ['IT-001', 'IT-002', 'IT-004', 'IT-005'], attendees: ['IT Director', 'Engineering Manager', 'Deloitte IT audit specialist'], pbcs: ['Access review evidence (Q1)', 'Sample of 10 production code-deploy approvals', 'SSO/MFA configuration export'], targetWeeks: -40 },
      { id: 'W5', title: 'Entity-level controls walkthrough', controls: ['EL-001', 'EL-002', 'EL-003', 'EL-004'], attendees: ['CFO', 'General Counsel', 'Deloitte senior manager'], pbcs: ['Code of conduct attestation records', 'Audit committee meeting minutes (last 4 quarters)', 'Authority matrix'], targetWeeks: -36 },
      { id: 'W6', title: 'Stock-based compensation walkthrough', controls: ['FR-006'], attendees: ['Controller', 'People Ops Lead', 'Deloitte audit manager'], pbcs: ['Cap table snapshot', 'Vesting schedule export', 'Recent 409A valuation'], targetWeeks: -32 },
    ],
    disclaimers: [
      'This plan is generated from public knowledge of Deloitte\'s general audit methodology and standard SOX walkthrough sequencing. Specific timing, documentation preferences, and meeting cadence should be validated with your Deloitte engagement team.',
      'Walkthroughs target Year-1 audit (~52 weeks before S-1). Adjust forward if your filing window is sooner.',
    ],
  }
};

// Make available globally for non-module pages
window.HELIOS = HELIOS;
window.streamText = streamText;
window.sleep = sleep;
window.startTimer = startTimer;
window.injectGate = injectGate;
