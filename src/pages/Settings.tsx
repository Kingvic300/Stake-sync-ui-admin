import { Megaphone } from 'lucide-react'
import { useState } from 'react'
import { ReasonSheet } from '../components/ReasonSheet'
import { Strikes } from '../components/DayGrid'
import { Button, Field, PageHeader, Toggle } from '../components/ui'
import { cx } from '../lib/format'
import { inputClass } from '../lib/styles'
import { useAdmin } from '../state/context'
import { useToast } from '../toast/context'
import { Select } from '../components/Select'

const structures = [
  { name: 'Gentle', free: 3, penalties: [5, 10, 15], used: 61 },
  { name: 'Standard', free: 2, penalties: [10, 15, 20], used: 28 },
  { name: 'Strict', free: 1, penalties: [15, 25, 35], used: 11 },
]

export function Settings() {
  const { log, requestApproval } = useAdmin()
  const toast = useToast()
  const [rules, setRules] = useState({ disputeHours: 48, reviewSlaHours: 24, fourEyesOver: 50, autoOutage: true })
  const [editing, setEditing] = useState<string | null>(null)
  const [banner, setBanner] = useState('')
  const [tone, setTone] = useState<'info' | 'warning'>('warning')
  const [live, setLive] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 lg:px-12 2xl:px-16">
      <PageHeader title="Settings" intro="Platform rules that apply to every challenge. Changes are logged, and changes to money rules need a second admin." />

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-3xl bg-surface p-5 ring-1 ring-line/70 sm:p-7">
          <h2 className="text-xl font-bold">Approved penalty structures</h2>
          <p className="mt-1 text-[15px] text-slate">Creators can only pick from these. Existing challenges keep the structure they started with.</p>
          <ul className="mt-5 divide-y divide-line">
            {structures.map((s) => (
              <li key={s.name} className="flex flex-wrap items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 font-semibold">
                    {s.name}
                    <Strikes total={s.free} used={0} size={14} />
                  </div>
                  <div className="text-sm text-slate">
                    {s.free} free, then {s.penalties.join('%, ')}% of the stake. Used by {s.used}% of challenges
                  </div>
                </div>
                <Button size="sm" variant="secondary" onClick={() => setEditing(s.name)}>
                  Propose change
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-surface p-5 ring-1 ring-line/70 sm:p-7">
          <h2 className="text-xl font-bold">Platform rules</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label="Dispute window" hint="Hours after a result">
              <input
                inputMode="numeric"
                value={rules.disputeHours}
                onChange={(e) => setRules({ ...rules, disputeHours: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                className={inputClass}
              />
            </Field>
            <Field label="Review target" hint="Hours to decide a dispute">
              <input
                inputMode="numeric"
                value={rules.reviewSlaHours}
                onChange={(e) => setRules({ ...rules, reviewSlaHours: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                className={inputClass}
              />
            </Field>
            <Field label="Second approval above" hint="USD at stake when confirming a failure">
              <input
                inputMode="numeric"
                value={rules.fourEyesOver}
                onChange={(e) => setRules({ ...rules, fourEyesOver: Number(e.target.value.replace(/\D/g, '')) || 0 })}
                className={inputClass}
              />
            </Field>
          </div>
          <div className="mt-5 flex items-start justify-between gap-6 rounded-2xl bg-ground p-4">
            <div>
              <div className="font-semibold">Automatic outage protection</div>
              <p className="text-sm text-slate">Mark a provider degraded when fewer than 97% of checks succeed for 15 minutes. Results stay pending instead of failing.</p>
            </div>
            <Toggle checked={rules.autoOutage} onChange={(v) => setRules({ ...rules, autoOutage: v })} label="Automatic outage protection" />
          </div>
          <Button
            className="mt-5"
            onClick={() => {
              log('Updated platform rules', 'Settings', `Disputes ${rules.disputeHours}h, review ${rules.reviewSlaHours}h, second approval over $${rules.fourEyesOver}`)
              toast({ title: 'Platform rules saved' })
            }}
          >
            Save rules
          </Button>
        </section>

        <section className="rounded-3xl bg-surface p-5 ring-1 ring-line/70 sm:p-7 xl:col-span-2">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Megaphone size={20} /> Incident banner
          </h2>
          <p className="mt-1 text-[15px] text-slate">Shows at the top of the member app for everyone. Use it for outages and anything that affects money.</p>
          {live && (
            <div className={cx('mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 text-[15px]', tone === 'warning' ? 'bg-gold-soft text-gold-ink' : 'bg-cobalt-soft text-cobalt-deep')}>
              <span>
                <span className="font-semibold">Live now:</span> {live}
              </span>
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => {
                  setLive(null)
                  log('Removed incident banner', 'Member app', 'Incident resolved')
                  toast({ title: 'Banner removed' })
                }}
              >
                Remove
              </button>
            </div>
          )}
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
            <Field label="Message">
              <input
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                maxLength={140}
                placeholder="Solana is slow right now. Results are pending and nobody will be penalised."
                className={inputClass}
              />
            </Field>
            <Field label="Style">
              <Select
                label="Style"
                value={tone}
                onChange={setTone}
                options={[
                  { value: 'warning' as const, label: 'Warning' },
                  { value: 'info' as const, label: 'Information' },
                ]}
              />
            </Field>
            <Button
              disabled={banner.trim().length < 10}
              onClick={() => {
                setLive(banner.trim())
                log('Published incident banner', 'Member app', banner.trim())
                toast({ title: 'Banner is live', body: 'Everyone sees it at the top of the app.' })
                setBanner('')
              }}
            >
              Publish banner
            </Button>
          </div>
        </section>
      </div>

      {editing && (
        <ReasonSheet
          title={`Propose a change to ${editing}`}
          confirm="Propose"
          fourEyes
          effect="Penalty structures affect people’s money, so a second admin must approve. Challenges already running keep the structure they started with."
          onConfirm={(reason) => {
            requestApproval('Change penalty structure', editing, reason)
            toast({ tone: 'info', title: 'Sent for a second approval' })
          }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
