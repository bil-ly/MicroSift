import type { LivePhase } from '../types/api'

const minute = 60_000

export function getLivePhase(serverTime: string, releaseAt: string): LivePhase {
  const delta = new Date(releaseAt).getTime() - new Date(serverTime).getTime()
  if (delta > 15 * minute) return 'FAR'
  if (delta > 5 * minute) return 'PRE_FLIGHT'
  if (delta > 2 * minute) return 'ARM_WINDOW'
  if (delta >= 0) return 'ORDERS_LIVE'
  return 'POST_RELEASE'
}

export function formatReleaseCountdown(serverTime: string, releaseAt: string): string {
  const deltaSeconds = Math.floor((new Date(releaseAt).getTime() - new Date(serverTime).getTime()) / 1000)
  const absolute = Math.abs(deltaSeconds)
  const minutes = Math.floor(absolute / 60)
  const seconds = absolute % 60
  const value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  return deltaSeconds < 0 ? `+${value}` : value
}
