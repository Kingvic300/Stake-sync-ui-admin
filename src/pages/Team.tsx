import { Check, ShieldAlert, UserPlus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Sheet } from '../components/Sheet'
import { Avatar, Button, Field, PageHeader, Tag } from '../components/ui'
import { admins as seed, permissions, type AdminRole } from '../data/admin'
import { cx } from '../lib/format'
import { inputClass } from '../lib/styles'
import { timeAgo } from '../lib/time'
import { useAdmin } from '../state/context'
import { useToast } from '../toast/context'
import { Select } from '../components/Select'

const roles: AdminRole[] = ['Super admin', 'Moderator', 'Risk analyst', 'Support', 'Finance (view only)']

export function Team() {
  const { log } = useAdmin()
  const toast = useToast()
  const [team, setTeam] = useState(seed)
  const [inviting, setInviting] = useState(false)
  const missing2fa = team.filter((a) => !a.twoFactor)

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 lg:px-12 2xl:px-16">
      <PageHeader
        title="Team and roles"
        intro="Who can do what in admin. Roles limit each person to the work they need, and nobody can move escrowed funds."
        actions={
          <Button onClick={() => setInviting(true)}>
            <UserPlus size={17} /> Invite an admin
          </Button>
        }
      />

      {missing2fa.length > 0 && (
        <p role="status" className="mb-5 flex items-start gap-3 rounded-2xl bg-miss-soft p-4 text-[15px] text-[oklch(45%_0.17_23)]">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" />
          {missing2fa.map((a) => a.person.name).join(', ')} {missing2fa.length === 1 ? 'hasn’t' : 'haven’t'} set up two-step verification. They can’t take actions until they do.
        </p>
      )}

      <div className="overflow-x-auto rounded-3xl bg-surface ring-1 ring-line/70">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="border-b border-line text-left text-sm text-slate">
              <th className="px-5 py-3 font-normal">Admin</th>
              <th className="py-3 font-normal">Role</th>
              <th className="hidden py-3 font-normal md:table-cell">Two-step</th>
              <th className="hidden px-5 py-3 font-normal lg:table-cell">Last active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {team.map((a) => (
              <tr key={a.email}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar person={a.person} size={32} />
                    <span className="min-w-0">
                      <span className="block font-semibold">{a.person.name}</span>
                      <span className="block truncate text-sm text-slate">{a.email}</span>
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <Select
                    look="compact"
                    label={`Role for ${a.person.name}`}
                    value={a.role}
                    onChange={(role) => {
                      setTeam((t) => t.map((x) => (x.email === a.email ? { ...x, role } : x)))
                      log('Changed admin role', a.person.name, `Now ${role}`)
                      toast({ title: 'Role updated', body: `${a.person.name} is now ${role}.` })
                    }}
                    options={roles.map((r) => ({ value: r, label: r }))}
                  />
                </td>
                <td className="hidden py-3 md:table-cell">{a.twoFactor ? <Tag tone="cobalt">On</Tag> : <Tag tone="gold">Not set up</Tag>}</td>
                <td className="hidden px-5 py-3 text-slate lg:table-cell">{timeAgo(a.lastActive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-2xl font-bold">What each role can do</h2>
      <div className="mt-4 overflow-x-auto rounded-3xl bg-surface ring-1 ring-line/70">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="border-b border-line text-left text-sm text-slate">
              <th className="px-5 py-3 font-normal">Action</th>
              {roles.map((r) => (
                <th key={r} className="px-3 py-3 text-center font-normal">
                  {r}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {permissions.map((p) => (
              <tr key={p.action} className={cx(p.roles.length === 0 && 'bg-ground/70')}>
                <td className="px-5 py-3 font-medium">
                  {p.action}
                  {p.roles.length === 0 && <span className="block text-sm font-normal text-slate">Handled only by the escrow program</span>}
                </td>
                {roles.map((r) => (
                  <td key={r} className="px-3 py-3 text-center">
                    {p.roles.includes(r) ? (
                      <Check size={17} strokeWidth={3} className="mx-auto text-calm" aria-label="Allowed" />
                    ) : (
                      <X size={15} className="mx-auto text-slate/40" aria-label="Not allowed" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {inviting && (
        <InviteAdmin
          onClose={() => setInviting(false)}
          onInvite={(email, role) => {
            log('Invited admin', email, `Role: ${role}`)
            toast({ title: 'Invitation sent', body: `${email} joins as ${role} after setting up two-step verification.` })
          }}
        />
      )}
    </div>
  )
}

function InviteAdmin({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: AdminRole) => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<AdminRole>('Support')
  const ok = /^[^\s@]+@stakesync\.app$/.test(email.trim())

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!ok) return
    onInvite(email.trim(), role)
    onClose()
  }

  return (
    <Sheet
      title="Invite an admin"
      onClose={onClose}
      footer={
        <Button type="submit" form="invite-admin" className="w-full" disabled={!ok}>
          Send invitation
        </Button>
      }
    >
      <form id="invite-admin" onSubmit={submit} className="space-y-4">
        <Field label="Work email" hint="Must be a @stakesync.app address">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Role" hint="Start with the least access they need. You can change it later.">
          <Select label="Role" value={role} onChange={setRole} options={roles.map((r) => ({ value: r, label: r }))} />
        </Field>
        <p className="text-sm text-slate">They must set up two-step verification before they can sign in.</p>
      </form>
    </Sheet>
  )
}
