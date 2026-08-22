export type StraddleState =
  | 'IDLE'
  | 'ARMED'
  | 'PLACED'
  | 'FILLED'
  | 'CLOSED'
  | 'NO_FILL'
  | 'DOUBLE_FILLED'
  | 'ABORTED'

export interface LiveState {
  serverTime: string
  runnerConnected: boolean
  runnerLastSeen: string
  guard: {
    halted: boolean
    haltReason: string | null
    maxSpreadPips: number
    dailyLossPips: number
    dailyLossCapPips: number
  }
  nextEvent: {
    id: string
    name: string
    currency: string
    impact: 'high' | 'medium' | 'low'
    releaseAt: string
    pair: string
    sizing: {
      distancePips: number
      slPips: number
      tpPips: number
      computedAt: string
      sampleN: number
    } | null
    preflight: {
      sizingAvailable: boolean
      spreadOk: boolean
      brokerSession: boolean
      reconcileClean: boolean
      failureReason: string | null
    }
  } | null
  straddle: { id: string; state: StraddleState; transitions: { state: string; at: string }[] } | null
  spread: { currentPips: number; history: { t: string; pips: number }[] } | null
  pendingOrders: {
    side: 'BUY' | 'SELL'
    triggerPrice: number
    distanceFromPricePips: number
    expiresAt: string
  }[]
  position: {
    side: 'BUY' | 'SELL'
    entryPrice: number
    currentPrice: number
    unrealisedPips: number
    entrySlippagePips: number
    slPrice: number
    tpPrice: number
    timeStopAt: string
  } | null
}

export type LivePhase = 'FAR' | 'PRE_FLIGHT' | 'ARM_WINDOW' | 'ORDERS_LIVE' | 'POST_RELEASE'
