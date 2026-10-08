import { createContext, useContext } from 'react'
import type { AdminDispute, AuditEntry, DisputeStatus, ProofReview, ProviderStatus, RiskFlag } from '../data/admin'
import type { Provider } from '../data/types'

export interface Approval {
  id: string
  action: string
  target: string
  reason: string
  requestedBy: string
  at: string
}

export interface Outage {
  provider: Provider
  from: string
  to: string
  protected: number
}

export interface AdminStore {
  disputes: AdminDispute[]
  reviews: ProofReview[]
  risks: RiskFlag[]
  reportIds: string[]
  audit: AuditEntry[]
  approvals: Approval[]
  outages: Outage[]
  health: Record<string, ProviderStatus>
  log: (action: string, target: string, reason: string) => void
  setDispute: (id: string, status: DisputeStatus, reason: string) => void
  resolveReview: (id: string, approved: boolean, reason: string) => void
  setRisk: (id: string, status: RiskFlag['status'], reason: string) => void
  resolveReport: (id: string, action: string, reason: string) => void
  requestApproval: (action: string, target: string, reason: string) => void
  decideApproval: (id: string, approve: boolean) => void
  declareOutage: (o: Outage, reason: string) => void
}

export const AdminStoreContext = createContext<AdminStore | null>(null)

export function useAdmin() {
  const v = useContext(AdminStoreContext)
  if (!v) throw new Error('useAdmin must be used inside <AdminStoreProvider>')
  return v
}
