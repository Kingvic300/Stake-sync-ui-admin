import { ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAdminAuth } from '../auth/context'
import { Logo } from '../components/Logo'
import { Button, Field } from '../components/ui'
import { admins } from '../data/admin'
import { cx } from '../lib/format'
import { inputBase, inputClass } from '../lib/styles'

/** Email and password, then a 6-digit authenticator code. Every admin must use two-step verification. */
export function Login() {
  const { session, signIn } = useAdminAuth()
  const navigate = useNavigate()
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/'
  const [step, setStep] = useState<'password' | 'code'>('password')
  const [email, setEmail] = useState('victor@stakesync.app')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus()
  }, [step])

  if (session) return <Navigate to="/" replace />

  function submit(e: FormEvent) {
    e.preventDefault()
    if (step === 'password') {
      const admin = admins.find((a) => a.email === email.trim().toLowerCase())
      if (!admin || password.length < 8) return setError('That email and password don’t match an admin account.')
      setError('')
      return setStep('code')
    }
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code from your authenticator app.')
    setBusy(true)
    const admin = admins.find((a) => a.email === email.trim().toLowerCase())!
    signIn({ name: admin.person.name, email: admin.email, role: admin.role })
    navigate(from, { replace: true })
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_minmax(0,44%)]">
      <div className="flex flex-col px-4 py-6 sm:px-10">
        <Logo />
        <main id="main" className="flex flex-1 items-center justify-center py-10">
          <form onSubmit={submit} noValidate className="w-full max-w-[24rem]">
            <h1 className="text-4xl font-bold">{step === 'password' ? 'Admin sign in' : 'Two-step verification'}</h1>
            <p className="mt-2 text-slate">
              {step === 'password' ? 'For Stake-Sync staff only. Every action here is recorded.' : 'Open your authenticator app and enter the current code.'}
            </p>
            <div className="mt-8 space-y-4">
              {step === 'password' ? (
                <>
                  <Field label="Work email">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className={inputClass} />
                  </Field>
                  <Field label="Password">
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className={inputClass} />
                  </Field>
                </>
              ) : (
                <Field label="Authentication code">
                  <input
                    ref={codeRef}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={cx(inputBase, 'h-14 text-center font-display text-3xl font-bold tracking-[0.4em] tabular')}
                  />
                </Field>
              )}
              {error && (
                <p role="alert" className="text-sm text-miss">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" size="lg" busy={busy}>
                {step === 'password' ? 'Continue' : 'Verify and sign in'}
              </Button>
              {step === 'code' && (
                <button type="button" onClick={() => setStep('password')} className="w-full text-center text-sm font-semibold text-slate hover:text-ink">
                  Use a different account
                </button>
              )}
            </div>
          </form>
        </main>
      </div>
      <aside className="hidden flex-col justify-end bg-ink p-12 text-white lg:flex">
        <ShieldCheck size={36} className="text-gold" />
        <p className="mt-6 max-w-md font-display text-4xl leading-tight font-bold">Fair calls, on the record.</p>
        <ul className="mt-6 max-w-md space-y-2 text-white/70">
          <li>Every decision needs a reason and is written to the audit log.</li>
          <li>High-impact actions need a second admin.</li>
          <li>No one here can move escrowed funds. Settlement runs on-chain.</li>
        </ul>
      </aside>
    </div>
  )
}
