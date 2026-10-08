import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { ReasonSheet } from '../components/ReasonSheet'
import { Button, Field, PageHeader, ProviderMark } from '../components/ui'
import { providerHealth } from '../data/admin'
import type { Provider } from '../data/types'
import { statusStyle } from '../lib/adminStyles'
import { cx } from '../lib/format'
import { inputClass } from '../lib/styles'
import { useAdmin } from '../state/context'
import { useToast } from '../toast/context'
import { Select } from '../components/Select'

/**
 * PRD §32: provider failures must never become user penalties. Declaring an outage marks every
 * check in the window as "provider down" so strikes and penalties can't apply.
 */
export function Health() {
  const { health, outages, declareOutage } = useAdmin()
  const toast = useToast()
  const [provider, setProvider] = useState<Provider>('Solana')
  const [from, setFrom] = useState('2026-10-08T16:10')
  const [to, setTo] = useState('2026-10-08T20:00')
  const [confirming, setConfirming] = useState(false)
  const hours = Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / 3_600_000)
  const protectedChecks = Math.round(hours * (provider === 'GitHub' ? 120 : provider === 'Solana' ? 45 : 30))
  const valid = hours > 0 && hours <= 72

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 lg:px-12 2xl:px-16">
      <PageHeader title="Verification health" intro="How each verification source is doing. When one fails, declare an outage so nobody is penalised for it." />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {providerHealth.map((p) => {
          const st = statusStyle[health[p.provider]]
          return (
            <li key={p.provider} className={cx('rounded-3xl bg-surface p-5 ring-1', health[p.provider] === 'operational' ? 'ring-line/70' : 'ring-gold/50')}>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2.5 font-semibold">
                  <ProviderMark provider={p.provider} size={20} /> {p.provider}
                </span>
                <span className={cx('inline-flex items-center gap-1.5 text-xs font-bold', st.text)}>
                  <span className={cx('size-2 rounded-full', st.dot)} /> {st.label}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <dt className="text-slate">Verified</dt>
                  <dd className="font-display text-lg font-semibold tabular">{p.success}%</dd>
                </div>
                <div>
                  <dt className="text-slate">Latency</dt>
                  <dd className="font-display text-lg font-semibold tabular">{p.latency ? `${(p.latency / 1000).toFixed(1)}s` : 'Device'}</dd>
                </div>
                <div>
                  <dt className="text-slate">Retrying</dt>
                  <dd className="font-display text-lg font-semibold tabular">{p.retrying}</dd>
                </div>
              </dl>
              <p className="mt-3 text-sm text-slate">{p.note}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-3xl bg-surface p-5 ring-1 ring-line/70 sm:p-7">
          <h2 className="text-xl font-bold">Declare an outage</h2>
          <p className="mt-1 text-[15px] text-slate">Every check from this source in the window becomes “provider down”. No strikes or penalties can apply to them.</p>
          <div className="mt-5 space-y-4">
            <Field label="Source">
              <Select
                label="Source"
                value={provider}
                onChange={setProvider}
                options={providerHealth.map((p) => ({ value: p.provider, label: p.provider, icon: <ProviderMark provider={p.provider} size={16} /> }))}
              />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="From">
                <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className={inputClass} />
              </Field>
              <Field label="To">
                <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className={inputClass} />
              </Field>
            </div>
            <p className={cx('rounded-2xl p-4 text-[15px]', valid ? 'bg-calm-soft text-calm' : 'bg-miss-soft text-miss')}>
              {valid ? (
                <span className="flex items-center gap-2">
                  <ShieldCheck size={18} /> About {protectedChecks.toLocaleString('en-US')} checks will be protected.
                </span>
              ) : (
                'Choose a window between a few minutes and 72 hours.'
              )}
            </p>
            <Button className="w-full" disabled={!valid} onClick={() => setConfirming(true)}>
              Declare outage
            </Button>
          </div>
        </section>

        <section className="rounded-3xl bg-surface p-5 ring-1 ring-line/70 sm:p-7">
          <h2 className="text-xl font-bold">Outage history</h2>
          <ul className="mt-4 divide-y divide-line">
            {[...outages, { provider: 'GitHub' as Provider, from: 'Oct 6, 20:40', to: '22:40', protected: 214 }].map((o, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                <ProviderMark provider={o.provider} size={18} />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{o.provider}</div>
                  <div className="text-sm text-slate">
                    {o.from} to {o.to}
                  </div>
                </div>
                <span className="text-sm font-semibold text-calm tabular">{o.protected} protected</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {confirming && (
        <ReasonSheet
          title={`Declare a ${provider} outage`}
          confirm="Declare outage"
          presets={['Provider status page reports an incident', 'Error rate above threshold', 'Users reporting missing data']}
          effect={`Checks from ${provider} between ${from.replace('T', ' ')} and ${to.replace('T', ' ')} will be marked provider down. Affected users get a notification that nothing counted against them.`}
          onConfirm={(reason) => {
            declareOutage({ provider, from: from.replace('T', ' '), to: to.replace('T', ' '), protected: protectedChecks }, reason)
            toast({ title: `${provider} outage declared`, body: `${protectedChecks.toLocaleString('en-US')} checks protected from penalties.` })
          }}
          onClose={() => setConfirming(false)}
        />
      )}
    </div>
  )
}
