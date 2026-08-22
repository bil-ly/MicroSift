import { describe, expect, test } from 'vitest'
import { formatReleaseCountdown, getLivePhase } from './liveTime'

const releaseAt = '2026-09-04T12:30:00.000Z'

describe('getLivePhase', () => {
  test('uses amber pre-flight phase from T-5m until T-2m', () => {
    expect(getLivePhase('2026-09-04T12:26:00.000Z', releaseAt)).toBe('ARM_WINDOW')
  })

  test('counts up after release', () => {
    expect(formatReleaseCountdown('2026-09-04T12:30:47.000Z', releaseAt)).toBe('+00:47')
  })
})
