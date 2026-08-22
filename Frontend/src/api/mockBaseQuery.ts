import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { liveArmed, liveHalted, liveWinning } from '../mocks/fixtures/live'
import type { LiveState } from '../types/api'

type MockArgs = { url: string; method?: string }

export const mockBaseQuery: BaseQueryFn<MockArgs, LiveState, { status: number; data: string }> = async ({ url, method }) => {
  if (url === '/api/live' && (!method || method === 'GET')) return { data: liveArmed }
  if (url === '/api/live/halt' && method === 'POST') return { data: liveHalted }
  if (url === '/api/live/resume' && method === 'POST') return { data: liveArmed }
  if (url === '/api/live/close-position' && method === 'POST') return { data: { ...liveWinning, position: null } }
  return { error: { status: 404, data: `No fixture for ${method ?? 'GET'} ${url}` } }
}
