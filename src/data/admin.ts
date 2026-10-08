// Placeholder admin data until the NestJS admin endpoints exist. Shapes mirror PRD §11, §21, §29 and §32.
import type { Person, Provider } from './types'

export const NOW = '2026-10-08T17:47:00Z'

const p = (name: string, handle: string, hue: number): Person => ({ name, handle, hue })
export const users = {
  ladipo: p('Ladipo Samuel', 'ladipo', 225),
  hailey: p('Hailey Okafor', 'hailey', 340),
  samuel: p('Samuel Adeyemi', 'samuel', 30),
  ife: p('Ifeoluwa Eze', 'ife', 95),
  kemi: p('Kemi Alabi', 'kemi', 10),
  dayo: p('Dayo Ogun', 'dayo', 195),
  chidi: p('Chidi Okeke', 'chidi', 140),
  zainab: p('Zainab Bello', 'zainab', 310),
  builder: p('builder_4471', 'builder_4471', 60),
  builder2: p('builder_4472', 'builder_4472', 62),
  builder3: p('builder_4473', 'builder_4473', 64),
  quick: p('quickgains', 'quickgains', 120),
  dan: p('devnet_dan', 'devnet_dan', 300),
  musa: p('Musa Ibrahim', 'musa', 60),
}

export type AdminRole = 'Super admin' | 'Moderator' | 'Risk analyst' | 'Support' | 'Finance (view only)'

export const admins: { person: Person; email: string; role: AdminRole; twoFactor: boolean; lastActive: string }[] = [
  { person: p('Victor Oladimeji', 'victor', 250), email: 'victor@stakesync.app', role: 'Super admin', twoFactor: true, lastActive: '2026-10-08T17:40:00Z' },
  { person: p('Ada Nwankwo', 'ada', 330), email: 'ada@stakesync.app', role: 'Moderator', twoFactor: true, lastActive: '2026-10-08T17:12:00Z' },
  { person: p('Tunde Bakare', 'tunde', 170), email: 'tunde@stakesync.app', role: 'Risk analyst', twoFactor: true, lastActive: '2026-10-08T16:05:00Z' },
  { person: p('Grace Udo', 'grace', 350), email: 'grace@stakesync.app', role: 'Support', twoFactor: false, lastActive: '2026-10-07T19:30:00Z' },
  { person: p('Ibrahim Musa', 'ibrahim', 60), email: 'ibrahim@stakesync.app', role: 'Finance (view only)', twoFactor: true, lastActive: '2026-10-08T11:00:00Z' },
]

export const permissions: { action: string; roles: AdminRole[] }[] = [
  { action: 'Decide disputes', roles: ['Super admin', 'Moderator'] },
  { action: 'Review photo and camera proof', roles: ['Super admin', 'Moderator', 'Support'] },
  { action: 'Restrict an account', roles: ['Super admin', 'Risk analyst'] },
  { action: 'Declare a provider outage', roles: ['Super admin', 'Risk analyst'] },
  { action: 'Unlist or pause a challenge', roles: ['Super admin', 'Moderator'] },
  { action: 'Approve organizations', roles: ['Super admin', 'Support'] },
  { action: 'View escrow and transactions', roles: ['Super admin', 'Risk analyst', 'Finance (view only)'] },
  { action: 'Move escrowed funds', roles: [] },
  { action: 'Manage team and roles', roles: ['Super admin'] },
]

export type ProviderStatus = 'operational' | 'degraded' | 'outage'
export const providerHealth: { provider: Provider; status: ProviderStatus; success: number; latency: number; retrying: number; note: string }[] = [
  { provider: 'GitHub', status: 'operational', success: 99.6, latency: 420, retrying: 3, note: 'Last incident Oct 6, 2h, no penalties applied' },
  { provider: 'Solana', status: 'degraded', success: 96.1, latency: 1850, retrying: 41, note: 'Solana RPC slow since 4:10 pm. Checks are retrying' },
  { provider: 'LeetCode', status: 'operational', success: 98.8, latency: 640, retrying: 0, note: 'No issues in 14 days' },
  { provider: 'Strava', status: 'operational', success: 99.2, latency: 510, retrying: 2, note: 'No issues in 9 days' },
  { provider: 'Camera', status: 'operational', success: 97.4, latency: 0, retrying: 0, note: 'On-device; 12 sets queued for audit' },
  { provider: 'Health', status: 'operational', success: 99.0, latency: 0, retrying: 0, note: 'Mobile app syncs nightly' },
  { provider: 'Photo', status: 'operational', success: 100, latency: 0, retrying: 0, note: '18 photos waiting for review' },
]

export type DisputeStatus = 'New' | 'In review' | 'Waiting on user' | 'Approved' | 'Failure confirmed'
export interface AdminDispute {
  id: string
  user: Person
  challenge: string
  provider: Provider
  day: number
  opened: string
  due: string
  status: DisputeStatus
  priority: 'High' | 'Normal'
  reason: string
  locked: number
  evidence: string[]
  events: { at: string; source: string; text: string }[]
}

export const disputes: AdminDispute[] = [
  {
    id: 'd-1042',
    user: users.ladipo,
    challenge: 'UNILAG DSA Grind',
    provider: 'LeetCode',
    day: 9,
    opened: '2026-10-03T12:20:00Z',
    due: '2026-10-09T12:20:00Z',
    status: 'Waiting on user',
    priority: 'Normal',
    reason: 'Two accepted submissions (Medium) were not counted toward my total.',
    locked: 5,
    evidence: ['Note: both accepted before 11 pm on Oct 3', 'https://leetcode.com/submissions/detail/1181…'],
    events: [
      { at: '2026-10-03T21:58:00Z', source: 'LeetCode API', text: 'Accepted: 238. Product of Array Except Self (Medium)' },
      { at: '2026-10-03T22:31:00Z', source: 'LeetCode API', text: 'Accepted: 56. Merge Intervals (Medium)' },
      { at: '2026-10-03T23:59:00Z', source: 'Verifier', text: 'Day 9 check: 0 new problems counted (both marked previously solved)' },
      { at: '2026-10-04T09:00:00Z', source: 'Moderator', text: 'Ada started review' },
    ],
  },
  {
    id: 'd-1101',
    user: users.ife,
    challenge: '30 Days of Code',
    provider: 'GitHub',
    day: 17,
    opened: '2026-10-08T07:40:00Z',
    due: '2026-10-08T19:40:00Z',
    status: 'New',
    priority: 'High',
    reason: 'Power cut all evening. I pushed at 11:52 pm but GitHub shows it at 12:04 am.',
    locked: 20,
    evidence: ['Commit 9f3a2c1 authored 23:52 WAT, pushed 00:04 WAT'],
    events: [
      { at: '2026-10-07T22:52:00Z', source: 'GitHub API', text: 'Commit 9f3a2c1 authored (ife/expense-tracker), 46 lines' },
      { at: '2026-10-07T23:04:00Z', source: 'GitHub API', text: 'Push event received for 9f3a2c1' },
      { at: '2026-10-07T23:00:00Z', source: 'Verifier', text: 'Day 17 closed with no push events. Strike 2 used' },
    ],
  },
  {
    id: 'd-1098',
    user: users.kemi,
    challenge: 'Lagos 10K Build-up',
    provider: 'Strava',
    day: 4,
    opened: '2026-10-07T15:10:00Z',
    due: '2026-10-09T15:10:00Z',
    status: 'In review',
    priority: 'Normal',
    reason: 'My watch synced late. The run was on Sunday morning.',
    locked: 15,
    evidence: ['Strava activity 11829… recorded Oct 5, 06:12'],
    events: [
      { at: '2026-10-06T21:00:00Z', source: 'Verifier', text: 'Week 1 closed with 3 of 4 runs' },
      { at: '2026-10-07T08:14:00Z', source: 'Strava API', text: 'Activity 11829… created (start time Oct 5, 06:12), 5.2 km GPS' },
    ],
  },
  {
    id: 'd-0977',
    user: users.ladipo,
    challenge: 'Solana Ship Month',
    provider: 'Solana',
    day: 22,
    opened: '2026-09-23T08:00:00Z',
    due: '2026-09-25T08:00:00Z',
    status: 'Approved',
    priority: 'Normal',
    reason: 'Deployment was made from a second wallet I own, linked after the fact.',
    locked: 0,
    evidence: ['Signed message from wallet 9xQ…T2'],
    events: [{ at: '2026-09-24T11:30:00Z', source: 'Moderator', text: 'Wallet ownership confirmed by signature. Approved' }],
  },
]

export interface ProofReview {
  id: string
  user: Person
  challenge: string
  kind: 'photo' | 'camera'
  submitted: string
  note?: string
  reps?: number
  flags: string[]
  hue: number
}

export const proofReviews: ProofReview[] = [
  { id: 'pr-1', user: users.zainab, challenge: 'Read 20 Pages a Day', kind: 'photo', submitted: '2026-10-08T16:20:00Z', note: 'Finished chapter 6, page 142', flags: [], hue: 40 },
  { id: 'pr-2', user: users.musa, challenge: 'Read 20 Pages a Day', kind: 'photo', submitted: '2026-10-08T15:02:00Z', note: 'Page 88', flags: ['94% match with a photo submitted by @builder_4472'], hue: 200 },
  { id: 'pr-3', user: users.kemi, challenge: '100 Push-ups a Day', kind: 'camera', submitted: '2026-10-08T14:40:00Z', reps: 100, flags: [], hue: 150 },
  { id: 'pr-4', user: users.builder2, challenge: 'Read 20 Pages a Day', kind: 'photo', submitted: '2026-10-08T13:55:00Z', note: 'Page 88', flags: ['Photo taken Oct 2 according to its metadata'], hue: 200 },
  { id: 'pr-5', user: users.chidi, challenge: '100 Push-ups a Day', kind: 'camera', submitted: '2026-10-08T12:10:00Z', reps: 100, flags: ['100 reps in 58 seconds, faster than 99% of sets'], hue: 10 },
  { id: 'pr-6', user: users.hailey, challenge: 'Read 20 Pages a Day', kind: 'photo', submitted: '2026-10-08T11:30:00Z', note: 'Page 214, nearly done!', flags: [], hue: 280 },
]

export interface RiskFlag {
  id: string
  user: Person
  score: number
  status: 'Open' | 'Watching' | 'Restricted' | 'Cleared'
  signals: string[]
  linked: Person[]
  value: number
  raised: string
}

export const riskFlags: RiskFlag[] = [
  {
    id: 'rf-31',
    user: users.builder,
    score: 92,
    status: 'Open',
    signals: ['Funded from the same wallet as 3 other new accounts', 'Accounts created within 6 minutes of each other', 'Identical devnet deployment bytecode as @builder_4472'],
    linked: [users.builder2, users.builder3],
    value: 30,
    raised: '2026-10-08T06:10:00Z',
  },
  {
    id: 'rf-30',
    user: users.dan,
    score: 78,
    status: 'Open',
    signals: ['Same transaction submitted as proof by two accounts', 'GitHub account created 3 days ago'],
    linked: [users.quick],
    value: 10,
    raised: '2026-10-07T11:05:00Z',
  },
  {
    id: 'rf-27',
    user: users.chidi,
    score: 41,
    status: 'Watching',
    signals: ['Camera sets much faster than typical', 'Otherwise a 64-day clean history'],
    linked: [],
    value: 10,
    raised: '2026-10-06T09:00:00Z',
  },
  {
    id: 'rf-22',
    user: users.quick,
    score: 85,
    status: 'Restricted',
    signals: ['Advertised an auto-commit bot in chat', 'Linked to @devnet_dan by shared device'],
    linked: [users.dan],
    value: 0,
    raised: '2026-10-05T18:30:00Z',
  },
]

export const reports: { id: string; author: Person; challenge: string; body: string; reason: string; reporters: number; at: string }[] = [
  { id: 'rep-1', author: users.quick, challenge: '30 Days of Code', body: 'DM me for a bot that auto-commits every day, guaranteed payout', reason: 'Spam or scam', reporters: 4, at: '2026-10-07T19:40:00Z' },
  { id: 'rep-2', author: users.dan, challenge: '30-Day Solana Builder Challenge', body: 'just copy my program id lol nobody checks', reason: 'Encouraging cheating', reporters: 2, at: '2026-10-08T10:15:00Z' },
  { id: 'rep-3', author: users.samuel, challenge: '30 Days of Code', body: 'Anyone else find the strikes too harsh? I think 5 would be fairer.', reason: 'Off topic', reporters: 1, at: '2026-10-08T12:30:00Z' },
]

export interface AdminUser {
  person: Person
  email: string
  joined: string
  level: 'Basic' | 'Verified user' | 'Enhanced'
  active: number
  completed: number
  staked: number
  risk: number
  status: 'Active' | 'Restricted' | 'Suspended'
  accounts: Provider[]
}

export const adminUsers: AdminUser[] = [
  { person: users.ladipo, email: 'ladipo@example.com', joined: '2025-03-02', level: 'Verified user', active: 3, completed: 39, staked: 35, risk: 4, status: 'Active', accounts: ['GitHub', 'Solana', 'LeetCode'] },
  { person: users.hailey, email: 'hailey@example.com', joined: '2025-06-01', level: 'Enhanced', active: 2, completed: 51, staked: 30, risk: 2, status: 'Active', accounts: ['GitHub', 'Solana'] },
  { person: users.ife, email: 'ife@example.com', joined: '2026-01-14', level: 'Verified user', active: 1, completed: 28, staked: 20, risk: 12, status: 'Active', accounts: ['GitHub'] },
  { person: users.kemi, email: 'kemi@example.com', joined: '2025-09-09', level: 'Verified user', active: 2, completed: 36, staked: 25, risk: 6, status: 'Active', accounts: ['Strava', 'Camera'] },
  { person: users.chidi, email: 'chidi@example.com', joined: '2025-08-20', level: 'Verified user', active: 1, completed: 44, staked: 10, risk: 41, status: 'Active', accounts: ['Strava', 'Camera'] },
  { person: users.builder, email: 'b4471@mailinator.com', joined: '2026-10-07', level: 'Basic', active: 1, completed: 0, staked: 10, risk: 92, status: 'Active', accounts: ['GitHub', 'Solana'] },
  { person: users.builder2, email: 'b4472@mailinator.com', joined: '2026-10-07', level: 'Basic', active: 2, completed: 0, staked: 10, risk: 88, status: 'Active', accounts: ['GitHub', 'Solana', 'Photo'] },
  { person: users.quick, email: 'quick@proton.me', joined: '2026-09-28', level: 'Basic', active: 0, completed: 0, staked: 0, risk: 85, status: 'Restricted', accounts: ['GitHub'] },
  { person: users.dan, email: 'dan@example.com', joined: '2026-10-05', level: 'Basic', active: 1, completed: 0, staked: 10, risk: 78, status: 'Active', accounts: ['GitHub', 'Solana'] },
  { person: users.zainab, email: 'zainab@example.com', joined: '2025-11-02', level: 'Verified user', active: 2, completed: 38, staked: 5, risk: 3, status: 'Active', accounts: ['LeetCode', 'Photo'] },
]

export interface AdminChallenge {
  id: string
  title: string
  host: string
  status: 'Open' | 'Live' | 'Settling' | 'Ended' | 'Paused'
  participants: number
  escrow: number
  sponsor: number
  verifyRate: number
  disputes: number
  flagged?: string
  providers: Provider[]
  address: string
}

export const adminChallenges: AdminChallenge[] = [
  { id: '30-days-of-code', title: '30 Days of Code', host: 'Stake-Sync', status: 'Live', participants: 842, escrow: 16840, sponsor: 5000, verifyRate: 98.9, disputes: 6, providers: ['GitHub'], address: '7xKX…9fLp' },
  { id: 'solana-builder-30', title: '30-Day Solana Builder Challenge', host: 'Superteam Nigeria', status: 'Live', participants: 488, escrow: 4880, sponsor: 10000, verifyRate: 95.2, disputes: 3, flagged: '3 linked accounts under review', providers: ['GitHub', 'Solana'], address: '3mPq…Ct8w' },
  { id: 'unilag-dsa-grind', title: 'UNILAG DSA Grind', host: 'UNILAG CS Society', status: 'Live', participants: 20, escrow: 100, sponsor: 0, verifyRate: 99.1, disputes: 1, providers: ['LeetCode'], address: '9aRt…Lk2Q' },
  { id: 'lagos-10k-buildup', title: 'Lagos 10K Build-up', host: 'Kemi Alabi', status: 'Open', participants: 1290, escrow: 19350, sponsor: 2500, verifyRate: 99.3, disputes: 1, providers: ['Strava'], address: '4hYe…Pq0Z' },
  { id: 'pushups-100', title: '100 Push-ups a Day', host: 'Kemi Alabi', status: 'Open', participants: 734, escrow: 7340, sponsor: 1200, verifyRate: 97.4, disputes: 0, providers: ['Camera'], address: '2wQs…Mn4R' },
  { id: 'read-20-pages', title: 'Read 20 Pages a Day', host: 'Amara Nwosu', status: 'Open', participants: 410, escrow: 0, sponsor: 300, verifyRate: 100, disputes: 0, flagged: 'Duplicate photos detected', providers: ['Photo'], address: '8nBv…Xc1T' },
  { id: 'ship-month-oct', title: 'Solana Ship Month', host: 'Superteam Nigeria', status: 'Settling', participants: 312, escrow: 3744, sponsor: 6000, verifyRate: 97.0, disputes: 0, providers: ['GitHub', 'Solana'], address: '5tGh…Rr6M' },
]

export const adminOrgs: { name: string; slug: string; kind: string; members: number; challenges: number; sponsored: number; plan: 'Community' | 'Organization' | 'Sponsored campaign'; verification: 'Verified' | 'Pending' | 'Rejected'; applied: string; hue: number }[] = [
  { name: 'Superteam Nigeria', slug: 'superteam-ng', kind: 'Community', members: 1840, challenges: 14, sponsored: 16000, plan: 'Organization', verification: 'Verified', applied: '2025-01-10', hue: 250 },
  { name: 'UNILAG CS Society', slug: 'unilag-cs', kind: 'University', members: 214, challenges: 6, sponsored: 0, plan: 'Community', verification: 'Verified', applied: '2025-04-02', hue: 205 },
  { name: 'Lagos Runners Club', slug: 'lagos-runners', kind: 'Community', members: 2650, challenges: 9, sponsored: 2500, plan: 'Organization', verification: 'Verified', applied: '2025-05-19', hue: 25 },
  { name: 'Ingressive Campus', slug: 'ingressive', kind: 'Community', members: 640, challenges: 11, sponsored: 6000, plan: 'Sponsored campaign', verification: 'Verified', applied: '2025-07-11', hue: 170 },
  { name: 'Paystack Engineering', slug: 'paystack-eng', kind: 'Company', members: 120, challenges: 0, sponsored: 0, plan: 'Organization', verification: 'Pending', applied: '2026-10-07', hue: 200 },
  { name: 'FitLagos Brand', slug: 'fitlagos', kind: 'Brand', members: 3, challenges: 0, sponsored: 0, plan: 'Sponsored campaign', verification: 'Pending', applied: '2026-10-08', hue: 20 },
]

export const txAlerts: { id: string; at: string; kind: string; detail: string; amount: number; severity: 'High' | 'Medium' | 'Low'; signature: string }[] = [
  { id: 'tx-1', at: '2026-10-08T06:02:00Z', kind: 'Shared funding source', detail: '4 new accounts funded from wallet 6Gh…Wq3 within 6 minutes', amount: 40, severity: 'High', signature: '3Kq…pV8' },
  { id: 'tx-2', at: '2026-10-08T14:20:00Z', kind: 'Large sponsor deposit', detail: 'Superteam Nigeria funded 10,000 USDC to 3mPq…Ct8w', amount: 10000, severity: 'Low', signature: '5yN…Rd2' },
  { id: 'tx-3', at: '2026-10-07T22:41:00Z', kind: 'Rapid join and claim', detail: '@quickgains joined 3 no-stake challenges in 2 minutes', amount: 0, severity: 'Medium', signature: '—' },
]

export const settlements: { challenge: string; finishers: number; returned: number; rewards: number; forfeited: number; status: 'Ready to settle' | 'Waiting for disputes' | 'Settled'; checks: string[] }[] = [
  { challenge: 'Solana Ship Month', finishers: 271, returned: 3252, rewards: 6000, forfeited: 492, status: 'Ready to settle', checks: ['All verifications final', 'No open disputes', 'Totals match escrow balance'] },
  { challenge: 'Run 100 km in June', finishers: 188, returned: 2820, rewards: 1500, forfeited: 615, status: 'Settled', checks: ['Settled Jul 3 by program'] },
  { challenge: 'UNILAG DSA Grind', finishers: 0, returned: 0, rewards: 0, forfeited: 0, status: 'Waiting for disputes', checks: ['1 open dispute holds $5'] },
]

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  target: string
  reason: string
}

export const audit: AuditEntry[] = [
  { id: 'a-9', at: '2026-10-08T17:20:00Z', actor: 'Ada Nwankwo', action: 'Requested evidence', target: 'Dispute D-1042', reason: 'Need links to both submissions' },
  { id: 'a-8', at: '2026-10-08T16:12:00Z', actor: 'Tunde Bakare', action: 'Opened risk review', target: '@builder_4471', reason: 'Shared funding wallet' },
  { id: 'a-7', at: '2026-10-08T16:10:00Z', actor: 'System', action: 'Marked provider degraded', target: 'Solana RPC', reason: 'Success rate under 97% for 15 minutes' },
  { id: 'a-6', at: '2026-10-08T12:00:00Z', actor: 'Victor Oladimeji', action: 'Approved organization', target: 'Ingressive Campus', reason: 'Business documents verified' },
  { id: 'a-5', at: '2026-10-07T19:55:00Z', actor: 'Ada Nwankwo', action: 'Restricted chat', target: '@quickgains', reason: 'Scam message reported by 4 members' },
  { id: 'a-4', at: '2026-10-06T22:30:00Z', actor: 'Tunde Bakare', action: 'Declared outage', target: 'GitHub, Oct 6 20:40–22:40', reason: 'API errors; 214 checks protected from penalties' },
]

export const kpis = {
  activeChallenges: 41,
  participants: 6912,
  escrow: 52254,
  sponsorPools: 25000,
  verifyRate: 98.4,
  falseFailures: 0.3,
  openDisputes: 3,
  medianDisputeHours: 19,
  weekly: [5120, 5480, 5910, 6240, 6530, 6912],
}
