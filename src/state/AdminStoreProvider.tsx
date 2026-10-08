import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAdminAuth } from '../auth/context'
import { audit as seedAudit, disputes as seedDisputes, proofReviews, providerHealth, riskFlags, reports } from '../data/admin'
import { AdminStoreContext, type Approval, type Outage } from './context'

let seq = 100

/**
 * Admin actions in one place. Every action needs a reason and lands in the audit log;
 * high-impact ones go to a second admin for approval (four-eyes rule).
 */
export function AdminStoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAdminAuth()
  const actor = session?.name ?? 'Unknown admin'
  const [disputes, setDisputes] = useState(seedDisputes)
  const [reviews, setReviews] = useState(proofReviews)
  const [risks, setRisks] = useState(riskFlags)
  const [reportIds, setReportIds] = useState(reports.map((r) => r.id))
  const [audit, setAudit] = useState(seedAudit)
  const [outages, setOutages] = useState<Outage[]>([])
  const [health, setHealth] = useState<Record<string, (typeof providerHealth)[number]['status']>>(() =>
    Object.fromEntries(providerHealth.map((p) => [p.provider, p.status])),
  )
  const [approvals, setApprovals] = useState<Approval[]>([
    { id: 'ap-1', action: 'Restrict account', target: '@builder_4472', reason: 'Linked to a 3-account funding cluster', requestedBy: 'Tunde Bakare', at: '2026-10-08T16:20:00Z' },
  ])

  const log = useCallback(
    (action: string, target: string, reason: string) => {
      seq += 1
      setAudit((a) => [{ id: `a-${seq}`, at: new Date().toISOString(), actor, action, target, reason }, ...a])
    },
    [actor],
  )

  const value = useMemo(
    () => ({
      disputes,
      reviews,
      risks,
      reportIds,
      audit,
      approvals,
      outages,
      health,
      log,
      setDispute: (id: string, status: (typeof disputes)[number]['status'], reason: string) => {
        setDisputes((d) => d.map((x) => (x.id === id ? { ...x, status, locked: status === 'Approved' ? 0 : x.locked } : x)))
        log(status === 'Approved' ? 'Approved completion' : status === 'Failure confirmed' ? 'Confirmed failure' : `Set dispute to ${status}`, `Dispute ${id.toUpperCase()}`, reason)
      },
      resolveReview: (id: string, approved: boolean, reason: string) => {
        setReviews((r) => r.filter((x) => x.id !== id))
        log(approved ? 'Approved proof' : 'Rejected proof', `Review ${id}`, reason)
      },
      setRisk: (id: string, status: (typeof risks)[number]['status'], reason: string) => {
        setRisks((r) => r.map((x) => (x.id === id ? { ...x, status } : x)))
        log(`Marked ${status.toLowerCase()}`, `Risk flag ${id}`, reason)
      },
      resolveReport: (id: string, action: string, reason: string) => {
        setReportIds((r) => r.filter((x) => x !== id))
        log(action, `Report ${id}`, reason)
      },
      requestApproval: (action: string, target: string, reason: string) => {
        seq += 1
        setApprovals((a) => [{ id: `ap-${seq}`, action, target, reason, requestedBy: actor, at: new Date().toISOString() }, ...a])
        log(`Requested approval: ${action}`, target, reason)
      },
      decideApproval: (id: string, approve: boolean) => {
        const item = approvals.find((a) => a.id === id)
        setApprovals((a) => a.filter((x) => x.id !== id))
        if (item) log(approve ? `Approved: ${item.action}` : `Declined: ${item.action}`, item.target, `Second approver for request by ${item.requestedBy}`)
      },
      declareOutage: (o: Outage, reason: string) => {
        setOutages((all) => [o, ...all])
        setHealth((h) => ({ ...h, [o.provider]: 'outage' }))
        log('Declared outage', `${o.provider}, ${o.from} to ${o.to}`, `${reason}. ${o.protected} checks protected from penalties`)
      },
    }),
    [disputes, reviews, risks, reportIds, audit, approvals, outages, health, log, actor],
  )

  return <AdminStoreContext.Provider value={value}>{children}</AdminStoreContext.Provider>
}
