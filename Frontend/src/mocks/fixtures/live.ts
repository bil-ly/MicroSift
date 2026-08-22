import type { LiveState } from '../../types/api'

const releaseAt = '2026-09-04T12:30:00.000Z'
const spreadHistory = Array.from({ length: 60 }, (_, index) => ({
  t: new Date(Date.parse('2026-09-04T12:25:00.000Z') + index * 1000).toISOString(),
  pips: Number((0.7 + ((index * 7) % 11) / 10).toFixed(1)),
}))

const base: LiveState = {
  serverTime: '2026-09-04T12:26:00.000Z',
  runnerConnected: true,
  runnerLastSeen: '2026-09-04T12:25:59.000Z',
  guard: { halted: false, haltReason: null, maxSpreadPips: 6, dailyLossPips: -4.2, dailyLossCapPips: -40 },
  nextEvent: {
    id: 'evt-nfp-20260904', name: 'Non-Farm Payrolls', currency: 'USD', impact: 'high', releaseAt, pair: 'EURUSD',
    sizing: { distancePips: 12.4, slPips: 18, tpPips: 24, computedAt: '2026-09-01T02:00:00.000Z', sampleN: 14 },
    preflight: { sizingAvailable: true, spreadOk: true, brokerSession: true, reconcileClean: true, failureReason: null },
  },
  straddle: { id: 'straddle-nfp-20260904', state: 'ARMED', transitions: [{ state: 'ARMED', at: '2026-09-04T12:25:00.000Z' }] },
  spread: { currentPips: 0.9, history: spreadHistory },
  pendingOrders: [],
  position: null,
}

export const liveArmed: LiveState = base
export const livePlaced: LiveState = { ...base, serverTime: '2026-09-04T12:28:30.000Z', straddle: { ...base.straddle!, state: 'PLACED', transitions: [...base.straddle!.transitions, { state: 'PLACED', at: '2026-09-04T12:28:00.000Z' }] }, pendingOrders: [
  { side: 'BUY', triggerPrice: 1.08624, distanceFromPricePips: 12.4, expiresAt: '2026-09-04T12:31:00.000Z' },
  { side: 'SELL', triggerPrice: 1.08376, distanceFromPricePips: -12.4, expiresAt: '2026-09-04T12:31:00.000Z' },
] }
export const liveWinning: LiveState = { ...livePlaced, serverTime: '2026-09-04T12:37:46.000Z', straddle: { ...livePlaced.straddle!, state: 'FILLED' }, pendingOrders: [], position: { side: 'BUY', entryPrice: 1.08624, currentPrice: 1.08791, unrealisedPips: 16.7, entrySlippagePips: 1.5, slPrice: 1.08444, tpPrice: 1.08864, timeStopAt: '2026-09-04T13:00:00.000Z' } }
export const liveLosing: LiveState = { ...liveWinning, position: { ...liveWinning.position!, currentPrice: 1.0852, unrealisedPips: -10.4 } }
export const liveNoFill: LiveState = { ...base, serverTime: '2026-09-04T12:31:01.000Z', straddle: { ...base.straddle!, state: 'NO_FILL' } }
export const liveDoubleFilled: LiveState = { ...base, serverTime: '2026-09-04T12:30:03.000Z', straddle: { ...base.straddle!, state: 'DOUBLE_FILLED' } }
export const liveAborted: LiveState = { ...base, straddle: { ...base.straddle!, state: 'ABORTED' }, nextEvent: { ...base.nextEvent!, preflight: { ...base.nextEvent!.preflight, reconcileClean: false, failureReason: 'drift detected 14:22 — trading halted' } } }
export const liveHalted: LiveState = { ...base, guard: { ...base.guard, halted: true, haltReason: 'reconciliation drift' } }
export const liveNoUpcomingEvent: LiveState = { ...base, nextEvent: null, straddle: null, spread: null }
export const liveNoCalendarEvents: LiveState = { ...liveNoUpcomingEvent, runnerConnected: true }
export const liveRunnerUnreachable: LiveState = { ...base, runnerConnected: false, runnerLastSeen: '2026-09-04T12:22:10.000Z' }
