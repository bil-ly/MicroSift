import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { mockBaseQuery } from './mockBaseQuery'
import type { LiveState } from '../types/api'

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false'

export const microSiftApi = createApi({
  reducerPath: 'microSiftApi',
  baseQuery: useMocks ? mockBaseQuery : fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' }),
  tagTypes: ['Live'],
  endpoints: (builder) => ({
    getLive: builder.query<LiveState, void>({ query: () => ({ url: '/api/live' }), providesTags: ['Live'] }),
    haltTrading: builder.mutation<LiveState, void>({ query: () => ({ url: '/api/live/halt', method: 'POST' }), invalidatesTags: ['Live'] }),
    resumeTrading: builder.mutation<LiveState, void>({ query: () => ({ url: '/api/live/resume', method: 'POST' }), invalidatesTags: ['Live'] }),
    closePosition: builder.mutation<LiveState, void>({ query: () => ({ url: '/api/live/close-position', method: 'POST' }), invalidatesTags: ['Live'] }),
  }),
})

export const { useGetLiveQuery, useHaltTradingMutation, useResumeTradingMutation, useClosePositionMutation } = microSiftApi
