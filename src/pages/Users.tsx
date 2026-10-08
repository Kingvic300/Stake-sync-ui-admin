import { Search } from 'lucide-react'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ReasonSheet } from '../components/ReasonSheet'
import { Sheet } from '../components/Sheet'
import { Avatar, Button, PageHeader, ProviderMark, Tag } from '../components/ui'
import { adminUsers, type AdminUser } from '../data/admin'
import { cx, usd } from '../lib/format'
import { inputClass } from '../lib/styles'
import { useAdmin } from '../state/context'
import { useToast } from '../toast/context'

type Filter = 'all' | 'risk' | 'restricted' | 'basic'
type Act = 'enhanced' | 'chat' | 'suspend'

export function Users() {
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [acting, setActing] = useState<Act | null>(null)
  const { log, requestApproval } = useAdmin()
  const toast = useToast()
  const open = adminUsers.find((u) => u.person.handle === params.get('u'))

  const list = adminUsers.filter((u) => {
    if (q && !`${u.person.name} ${u.person.handle} ${u.email}`.toLowerCase().includes(q.toLowerCase())) return false
    if (filter === 'risk') return u.risk >= 50
    if (filter === 'restricted') return u.status !== 'Active'
    if (filter === 'basic') return u.level === 'Basic'
    return true
  })

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 lg:px-12 2xl:px-16">
      <PageHeader title="Users" intro="Everyone on Stake-Sync. Open a person to see their accounts, challenges and risk, and take action." />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1 sm:max-w-sm">
          <span className="sr-only">Search users</span>
          <Search size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, username or email" className={cx(inputClass, 'pl-11')} />
        </label>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ['all', 'Everyone'],
              ['risk', 'High risk'],
              ['restricted', 'Restricted'],
              ['basic', 'Basic level'],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className={cx('h-9 rounded-full px-4 text-sm font-semibold ring-1 ring-inset', filter === k ? 'bg-ink text-white ring-ink' : 'bg-surface ring-line hover:ring-slate/40')}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-3xl bg-surface ring-1 ring-line/70">
        <table className="w-full text-[15px]">
          <thead>
            <tr className="border-b border-line text-left text-sm text-slate">
              <th className="px-5 py-3 font-normal">Person</th>
              <th className="hidden py-3 font-normal lg:table-cell">Level</th>
              <th className="hidden py-3 text-right font-normal xl:table-cell">Active</th>
              <th className="hidden py-3 text-right font-normal xl:table-cell">Finished</th>
              <th className="hidden py-3 text-right font-normal md:table-cell">Staked</th>
              <th className="py-3 pl-6 font-normal">Risk</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((u) => (
              <tr key={u.person.handle} className="cursor-pointer hover:bg-ground/60" onClick={() => setParams({ u: u.person.handle })}>
                <td className="px-5 py-3">
                  <button type="button" className="flex items-center gap-3 text-left" onClick={() => setParams({ u: u.person.handle })}>
                    <Avatar person={u.person} size={32} />
                    <span>
                      <span className="block font-semibold">{u.person.name}</span>
                      <span className="block max-w-[16rem] truncate text-sm text-slate">{u.email}</span>
                    </span>
                  </button>
                </td>
                <td className="hidden py-3 lg:table-cell">{u.level}</td>
                <td className="hidden py-3 text-right tabular xl:table-cell">{u.active}</td>
                <td className="hidden py-3 text-right tabular xl:table-cell">{u.completed}</td>
                <td className="hidden py-3 text-right tabular md:table-cell">{usd(u.staked)}</td>
                <td className="py-3 pl-6">
                  <RiskPill n={u.risk} />
                </td>
                <td className="px-5 py-3">
                  <Tag tone={u.status === 'Active' ? 'plain' : 'gold'}>{u.status}</Tag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="px-5 py-10 text-center text-slate">No one matches. Try a different search or filter.</p>}
      </div>

      {open && !acting && <UserSheet u={open} onClose={() => setParams({})} onAct={setActing} />}
      {open && acting && (
        <ReasonSheet
          title={acting === 'enhanced' ? 'Require enhanced verification' : acting === 'chat' ? 'Mute in chats' : `Suspend @${open.person.handle}`}
          confirm={acting === 'enhanced' ? 'Require it' : 'Mute for 7 days'}
          tone={acting === 'suspend' ? 'danger' : 'primary'}
          fourEyes={acting === 'suspend'}
          effect={
            acting === 'enhanced'
              ? `${open.person.name} will need an identity check before joining staked or sponsored challenges. Current challenges continue.`
              : acting === 'chat'
                ? `${open.person.name} can still take part, but can’t post in any chat for 7 days.`
                : `${open.person.name} can’t log in. Active stakes stay in escrow and settle by each challenge’s rules.`
          }
          onConfirm={(reason) => {
            if (acting === 'suspend') {
              requestApproval('Suspend account', `@${open.person.handle}`, reason)
              toast({ tone: 'info', title: 'Sent for a second approval' })
            } else {
              log(acting === 'enhanced' ? 'Required enhanced verification' : 'Muted in chats', `@${open.person.handle}`, reason)
              toast({ title: acting === 'enhanced' ? 'Enhanced verification required' : 'Muted for 7 days', body: `@${open.person.handle}` })
            }
          }}
          onClose={() => setActing(null)}
        />
      )}
    </div>
  )
}

function RiskPill({ n }: { n: number }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-sm font-semibold tabular', n >= 80 ? 'text-miss' : n >= 50 ? 'text-gold-ink' : 'text-calm')}>
      <span className={cx('size-2 rounded-full', n >= 80 ? 'bg-miss' : n >= 50 ? 'bg-gold' : 'bg-calm')} />
      {n}
    </span>
  )
}

function UserSheet({ u, onClose, onAct }: { u: AdminUser; onClose: () => void; onAct: (a: Act) => void }) {
  return (
    <Sheet title={u.person.name} onClose={onClose} width={560}>
      <div className="flex items-center gap-4">
        <Avatar person={u.person} size={56} />
        <div>
          <div className="text-slate">@{u.person.handle}</div>
          <div className="text-sm text-slate">
            {u.email}, joined {new Date(u.joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-4">
        {[
          ['Level', u.level],
          ['Active', String(u.active)],
          ['Finished', String(u.completed)],
          ['Staked now', usd(u.staked)],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-3.5">
            <dt className="text-xs text-slate">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 flex items-center justify-between rounded-2xl bg-ground px-4 py-3">
        <span className="text-[15px]">Risk score</span>
        <RiskPill n={u.risk} />
      </div>
      <h3 className="mt-6 font-sans text-sm font-semibold text-slate">Connected for verification</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {u.accounts.map((a) => (
          <li key={a} className="inline-flex items-center gap-2 rounded-full bg-ground px-3 py-1.5 text-sm font-semibold">
            <ProviderMark provider={a} size={14} /> {a}
          </li>
        ))}
      </ul>
      <h3 className="mt-6 font-sans text-sm font-semibold text-slate">Actions</h3>
      <div className="mt-2 grid gap-2">
        <Button variant="secondary" onClick={() => onAct('enhanced')}>
          Require enhanced verification
        </Button>
        <Button variant="secondary" onClick={() => onAct('chat')}>
          Mute in chats for 7 days
        </Button>
        <Button variant="secondary" className="text-[oklch(52%_0.19_23)]" onClick={() => onAct('suspend')}>
          Suspend account
        </Button>
      </div>
      <p className="mt-4 text-sm text-slate">No admin action can move this person’s escrowed money.</p>
    </Sheet>
  )
}
