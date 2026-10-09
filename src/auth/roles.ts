import type { AdminRole } from '../data/admin'

/** Server and error logs include IP addresses, so only these roles see them (matches the API). */
export const LOG_ROLES: AdminRole[] = ['Super admin', 'Risk analyst']
