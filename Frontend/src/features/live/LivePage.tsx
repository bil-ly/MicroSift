import { useEffect, useState } from 'react'
import { useClosePositionMutation, useGetLiveQuery, useHaltTradingMutation, useResumeTradingMutation } from '../../api/microSiftApi'
import { formatReleaseCountdown, getLivePhase } from '../../lib/liveTime'

const lifecycle = ['IDLE', 'ARMED', 'PLACED', 'FILLED', 'CLOSED']

export function LivePage() {
  const { data, isError, isLoading, fulfilledTimeStamp } = useGetLiveQuery(undefined, { pollingInterval: 2000, refetchOnFocus: true, refetchOnReconnect: true })
  const [now, setNow] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [confirm, setConfirm] = useState<'halt' | 'resume' | 'close' | null>(null)
  const [halt] = useHaltTradingMutation()
  const [resume] = useResumeTradingMutation()
  const [close] = useClosePositionMutation()
  useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(id) }, [])

  if (!data && isLoading) return <main className="live-loading">Connecting to runner…</main>
  if (!data) return <main className="live-loading">Runner unreachable — no Live state received.</main>

  const event = data.nextEvent
  const phase = event ? getLivePhase(data.serverTime, event.releaseAt) : 'FAR'
  const staleSeconds = isError && fulfilledTimeStamp ? Math.max(0, Math.floor((now - fulfilledTimeStamp) / 1000)) : 0
  const terminal = ['NO_FILL', 'DOUBLE_FILLED', 'ABORTED'].includes(data.straddle?.state ?? '')
  const action = async () => {
    if (confirm === 'halt') await halt()
    if (confirm === 'resume') await resume()
    if (confirm === 'close') await close()
    setConfirm(null)
  }

  return <main className="live-page">
    <header className={`guard ${data.guard.halted ? 'halted' : !data.runnerConnected ? 'degraded' : data.straddle?.state === 'ARMED' ? 'armed' : ''}`}>
      {data.guard.halted ? `Trading halted — ${data.guard.haltReason}` : !data.runnerConnected ? `Runner unreachable — last seen ${new Date(data.runnerLastSeen).toLocaleTimeString()}` : data.straddle?.state === 'ARMED' ? `Armed — ${event?.name}` : 'System idle'}
      {isError && <span>Data stale — {staleSeconds}s</span>}
    </header>
    {!event ? <p className="empty-state">No upcoming events. Check the calendar feed.</p> : <>
      <section className={`countdown ${phase}`}>
        <div className="label">NEXT EVENT · {event.currency} · HIGH IMPACT</div>
        <div className="countdown-value">{phase === 'FAR' ? `${event.name} in ${formatReleaseCountdown(data.serverTime, event.releaseAt)}` : formatReleaseCountdown(data.serverTime, event.releaseAt)}</div>
        <h1>{event.name} <span>{event.pair}</span></h1>
        {phase === 'ORDERS_LIVE' && <div className="countdown-progress" />}
      </section>
      <section className="lifecycle" aria-label="Straddle lifecycle">
        {terminal ? <div className={`terminal ${data.straddle?.state}`}>{data.straddle?.state}</div> : lifecycle.map((state) => <div key={state} className={lifecycle.indexOf(state) <= lifecycle.indexOf(data.straddle?.state ?? 'IDLE') ? 'done' : ''}><b>{state}</b><small>{data.straddle?.transitions.find((item) => item.state === state)?.at ? new Date(data.straddle.transitions.find((item) => item.state === state)!.at).toLocaleTimeString() : ''}</small></div>)}
      </section>
      {['PRE_FLIGHT', 'ARM_WINDOW'].includes(phase) && <section className="panel checks"><h2>PRE-FLIGHT CHECKS</h2>
        <p>Sizing available <strong className={event.preflight.sizingAvailable ? 'ok' : 'bad'}>{event.preflight.sizingAvailable ? '✓' : '✗'}</strong><span>{event.sizing ? `distance ${event.sizing.distancePips}p · n=${event.sizing.sampleN}` : 'no sizing'}</span></p>
        <p>Spread within limit <strong className={event.preflight.spreadOk ? 'ok' : 'bad'}>{event.preflight.spreadOk ? '✓' : '✗'}</strong><span>{data.spread?.currentPips}p / {data.guard.maxSpreadPips}p limit</span></p>
        <p>Broker session <strong className={event.preflight.brokerSession ? 'ok' : 'bad'}>{event.preflight.brokerSession ? '✓' : '✗'}</strong></p>
        <p>Reconciliation clean <strong className={event.preflight.reconcileClean ? 'ok' : 'bad'}>{event.preflight.reconcileClean ? '✓' : '✗'}</strong><span>{event.preflight.failureReason}</span></p>
      </section>}
      {data.spread && <section className="panel spread"><h2>SPREAD · LAST 60S</h2><div className={data.spread.currentPips > data.guard.maxSpreadPips ? 'metric bad' : 'metric'}>{data.spread.currentPips.toFixed(1)} <small>PIPS</small></div><div className="spark" aria-label="Spread history">{data.spread.history.map((point, i) => <i key={point.t} style={{ height: `${Math.min(100, point.pips / data.guard.maxSpreadPips * 100)}%`, left: `${i / 59 * 100}%` }} />)}<em style={{ bottom: `${100 / data.guard.maxSpreadPips * 100}%` }}>LIMIT {data.guard.maxSpreadPips}p</em></div></section>}
      {data.pendingOrders.length > 0 && <section className="panel orders"><h2>PENDING ORDERS</h2>{data.pendingOrders.map((order) => <p key={order.side}><b>{order.side} STOP</b><strong>{order.triggerPrice.toFixed(5)}</strong><span>{order.distanceFromPricePips > 0 ? '+' : ''}{order.distanceFromPricePips}p from price</span></p>)}</section>}
      {data.position && <section className="panel position"><h2>{data.position.side === 'BUY' ? 'LONG' : 'SHORT'} {event.pair}</h2><p>Entry <strong>{data.position.entryPrice.toFixed(5)}</strong> <span className="bad">slipped {data.position.entrySlippagePips.toFixed(1)}p</span></p><p>Current <strong>{data.position.currentPrice.toFixed(5)}</strong></p><div className={data.position.unrealisedPips >= 0 ? 'metric ok' : 'metric bad'}>{data.position.unrealisedPips >= 0 ? '+' : ''}{data.position.unrealisedPips.toFixed(1)} pips</div><p>SL {data.position.slPrice.toFixed(5)} · TP {data.position.tpPrice.toFixed(5)}</p></section>}
    </>}
    {!data.runnerConnected && !dismissed && <aside className="runner-overlay"><button onClick={() => setDismissed(true)}>Dismiss</button><p>RUNNER UNREACHABLE</p><span>Last seen {new Date(data.runnerLastSeen).toLocaleTimeString()}</span></aside>}
    <footer className="live-controls"><button className="halt-button" onClick={() => setConfirm(data.guard.halted ? 'resume' : 'halt')}>{data.guard.halted ? 'Resume trading' : 'Halt trading'}</button>{data.position && <button className="close-button" onClick={() => setConfirm('close')}>Close position now</button>}</footer>
    {confirm && <div className="confirm"><div><p>{confirm === 'close' ? `Close ${data.position?.side === 'BUY' ? 'LONG' : 'SHORT'} ${event?.pair} at market?` : confirm === 'halt' ? 'Halt trading? New events will not be armed. Any open position stays open.' : 'Resume trading?'}</p><button onClick={() => setConfirm(null)}>Cancel</button><button className="close-button" onClick={action}>{confirm === 'halt' ? 'Halt trading' : confirm === 'resume' ? 'Resume trading' : 'Close position'}</button></div></div>}
  </main>
}
