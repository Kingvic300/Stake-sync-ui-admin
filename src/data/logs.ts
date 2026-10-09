// Shapes returned by the API's /admin/logs and /admin/errors endpoints, plus demo data for when
// the app runs without an API.

export type LogLevel = 'info' | 'warn' | 'error'
export type LogKind = 'request' | 'app' | 'security' | 'error'

export interface LogEntry {
  id: string
  at: string
  level: LogLevel
  kind: LogKind
  context: string
  message: string
  requestId: string | null
  method: string | null
  path: string | null
  status: number | null
  durationMs: number | null
  user: { name: string; handle: string } | null
  ip: string | null
  userAgent: string | null
  meta: Record<string, unknown>
  errorGroupId: string | null
  hasStack: boolean
}

export interface LogDetail extends LogEntry {
  stack: string | null
  related: LogEntry[]
}

export interface LogStats {
  hours: number
  requests: number
  serverErrors: number
  clientErrors: number
  errors: number
  security: number
  warnings: number
  p50: number
  p95: number
  errorRate: number
  openErrors: number
  series: { hour: string; requests: number; errors: number }[]
  slowest: { path: string; p95: number; count: number }[]
  securityEvents: { event: string; count: number }[]
}

export interface ErrorGroupRow {
  id: string
  message: string
  context: string
  where: string | null
  count: number
  last24h: number
  usersAffected: number
  firstSeen: string
  lastSeen: string
  status: 'open' | 'resolved'
  resolvedBy: string | null
  resolvedAt: string | null
  resolution: string | null
}

export interface ErrorDetail extends ErrorGroupRow {
  stack: string | null
  lastRequestId: string | null
  occurrences: LogEntry[]
}

// ---------- demo data ----------

const base = new Date('2026-10-08T17:47:00Z').getTime()
const ago = (min: number) => new Date(base - min * 60_000).toISOString()
let n = 0
const id = () => `00000000-0000-4000-8000-${String(++n).padStart(12, '0')}`
const rid = () => `5c7485b9-12f2-4f53-9c97-${String(n).padStart(12, '0')}`
const people = {
  ladipo: { name: 'Ladipo Samuel', handle: 'ladipo' },
  hailey: { name: 'Hailey Okafor', handle: 'hailey' },
  builder: { name: 'builder_4471', handle: 'builder_4471' },
  ada: { name: 'Ada Nwankwo', handle: 'ada' },
}
const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'

function req(min: number, method: string, path: string, status: number, ms: number, user: LogEntry['user'], ip = '102.89.34.12'): LogEntry {
  return {
    id: id(),
    at: ago(min),
    level: status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info',
    kind: 'request',
    context: 'HTTP',
    message: `${method} ${path} ${status} ${ms}ms`,
    requestId: rid(),
    method,
    path,
    status,
    durationMs: ms,
    user,
    ip,
    userAgent: ua,
    meta: {},
    errorGroupId: null,
    hasStack: false,
  }
}

function other(min: number, level: LogLevel, kind: LogKind, context: string, message: string, extra: Partial<LogEntry> = {}): LogEntry {
  return { id: id(), at: ago(min), level, kind, context, message, requestId: null, method: null, path: null, status: null, durationMs: null, user: null, ip: null, userAgent: null, meta: {}, errorGroupId: null, hasStack: false, ...extra }
}

export const demoErrors: ErrorDetail[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    message: 'getSignaturesForAddress failed: 429 Too Many Requests',
    context: 'Indexer',
    where: 'Indexer',
    count: 214,
    last24h: 41,
    usersAffected: 0,
    firstSeen: ago(60 * 30),
    lastSeen: ago(3),
    status: 'open',
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    stack: 'Error: getSignaturesForAddress failed: 429 Too Many Requests\n    at Connection.getSignaturesForAddress (@solana/web3.js/lib/index.cjs.js:7801:13)\n    at IndexerService.poll (dist/modules/payments/indexer.service.js:58:57)',
    lastRequestId: null,
    occurrences: [],
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    message: 'Cannot read properties of null (reading \'wallet\')',
    context: 'HTTP',
    where: 'POST /api/challenges/:id/freeze',
    count: 6,
    last24h: 6,
    usersAffected: 4,
    firstSeen: ago(300),
    lastSeen: ago(22),
    status: 'open',
    resolvedBy: null,
    resolvedAt: null,
    resolution: null,
    stack: "TypeError: Cannot read properties of null (reading 'wallet')\n    at ParticipationService.freeze (dist/modules/challenges/participation.service.js:212:58)\n    at ChallengesController.freeze (dist/modules/challenges/challenges.controller.js:131:35)",
    lastRequestId: '5c7485b9-12f2-4f53-9c97-000000000099',
    occurrences: [],
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    message: 'connect ETIMEDOUT 140.82.112.6:443',
    context: 'Verification',
    where: 'Verification',
    count: 38,
    last24h: 0,
    usersAffected: 0,
    firstSeen: ago(60 * 50),
    lastSeen: ago(60 * 26),
    status: 'resolved',
    resolvedBy: 'Tunde Bakare',
    resolvedAt: ago(60 * 24),
    resolution: 'GitHub outage declared; checks were retried and excused',
    stack: 'Error: connect ETIMEDOUT 140.82.112.6:443\n    at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1636:16)',
    lastRequestId: null,
    occurrences: [],
  },
]

export const demoLogs: LogEntry[] = [
  req(0.2, 'GET', '/api/challenges/discover', 200, 48, people.ladipo),
  other(0.5, 'warn', 'security', 'login_failed', 'Failed sign-in', { ip: '41.58.201.9', meta: { email: 'hailey@example.com', knownAccount: true } }),
  req(1, 'POST', '/api/challenges/30-days-of-code/messages', 201, 61, people.hailey, '105.112.44.7'),
  other(2, 'warn', 'security', 'rate_limited', 'Rate limit hit on POST /api/auth/login', { ip: '41.58.201.9', requestId: rid(), method: 'POST', path: '/api/auth/login' }),
  other(3, 'error', 'error', 'Indexer', 'getSignaturesForAddress failed: 429 Too Many Requests', { errorGroupId: demoErrors[0].id, hasStack: true }),
  req(4, 'GET', '/api/me/challenges', 200, 132, people.ladipo),
  req(5, 'POST', '/api/challenges/solana-builder-30/join', 200, 812, people.builder, '102.89.1.77'),
  other(6, 'info', 'app', 'Lifecycle', 'Settled Week of Photos: 18 finishers'),
  other(8, 'warn', 'security', 'account_locked', 'Account locked after 8 failed sign-ins', { ip: '41.58.201.9', user: people.hailey }),
  req(9, 'GET', '/api/admin/disputes', 200, 37, people.ada, '197.210.65.3'),
  other(11, 'warn', 'app', 'Rent', 'Rent top-up for 7Gk3…q9Xa failed: insufficient funds in platform wallet'),
  req(12, 'GET', '/api/challenges?category=Fitness&sort=trending', 200, 95, null, '105.112.9.31'),
  req(14, 'POST', '/api/verification/proofs/photo', 201, 1430, people.hailey, '105.112.44.7'),
  req(16, 'GET', '/api/users/ladipo', 200, 41, null, '154.120.81.2'),
  req(22, 'POST', '/api/challenges/30-days-of-code/freeze', 500, 18, people.ladipo),
  other(22, 'error', 'error', 'HTTP', "Cannot read properties of null (reading 'wallet')", { errorGroupId: demoErrors[1].id, hasStack: true, requestId: '5c7485b9-12f2-4f53-9c97-000000000099', method: 'POST', path: '/api/challenges/30-days-of-code/freeze', user: people.ladipo }),
  other(25, 'warn', 'security', 'admin_forbidden', 'Blocked admin request to GET /api/admin/escrow', { ip: '197.210.65.3', user: people.ada }),
  req(27, 'POST', '/api/auth/login', 401, 182, null, '41.58.201.9'),
  req(31, 'GET', '/api/payments/wallet', 200, 640, people.builder, '102.89.1.77'),
  other(35, 'info', 'app', 'ChainWorker', 'Recorded 6 verification results on-chain'),
  req(40, 'POST', '/api/payments/onramp', 200, 22, people.ladipo),
  other(44, 'warn', 'security', 'refresh_token_reuse', 'An old refresh token was reused; the session was ended', { user: people.builder }),
  req(52, 'DELETE', '/api/messages/8f1c', 204, 17, people.ada, '197.210.65.3'),
  other(58, 'info', 'app', 'Bootstrap', 'API on :3000 (mainnet-beta)'),
]

demoErrors[0].occurrences = demoLogs.filter((l) => l.errorGroupId === demoErrors[0].id)
demoErrors[1].occurrences = demoLogs.filter((l) => l.errorGroupId === demoErrors[1].id)

export const demoStats: LogStats = {
  hours: 24,
  requests: 48_210,
  serverErrors: 37,
  clientErrors: 1_904,
  errors: 61,
  security: 212,
  warnings: 19,
  p50: 54,
  p95: 612,
  errorRate: 0.08,
  openErrors: 2,
  series: Array.from({ length: 24 }, (_, i) => ({
    hour: new Date(base - (23 - i) * 3_600_000).toISOString(),
    requests: Math.round(1200 + 1600 * Math.sin(((i + 4) / 24) * Math.PI) ** 2 + (i % 5) * 40),
    errors: i === 17 ? 14 : i % 7 === 0 ? 3 : i % 3 === 0 ? 1 : 0,
  })),
  slowest: [
    { path: 'POST /api/verification/proofs/photo', p95: 1840, count: 412 },
    { path: 'POST /api/challenges/:id/join', p95: 960, count: 388 },
    { path: 'GET /api/payments/wallet', p95: 710, count: 2_904 },
  ],
  securityEvents: [
    { event: 'login_failed', count: 141 },
    { event: 'rate_limited', count: 44 },
    { event: 'account_locked', count: 9 },
    { event: 'admin_forbidden', count: 6 },
    { event: 'invalid_wallet_signature', count: 7 },
    { event: 'refresh_token_reuse', count: 2 },
  ],
}

/** Plain names for security event codes. */
export const securityLabels: Record<string, string> = {
  login_failed: 'Failed sign-in',
  admin_login_failed: 'Failed admin sign-in',
  admin_login_non_admin: 'Non-admin tried admin sign-in',
  login_locked: 'Attempt on locked account',
  account_locked: 'Account locked',
  admin_2fa_failed: 'Wrong two-step code',
  refresh_token_reuse: 'Reused session token',
  invalid_wallet_signature: 'Bad wallet signature',
  admin_forbidden: 'Blocked admin request',
  admin_ip_blocked: 'Admin access from unknown network',
  rate_limited: 'Rate limit hit',
}
