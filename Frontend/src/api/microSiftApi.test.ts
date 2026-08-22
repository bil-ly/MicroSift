import { configureStore } from '@reduxjs/toolkit'
import { expect, test } from 'vitest'
import { microSiftApi } from './microSiftApi'

test('the Live endpoint returns the armed fixture through RTK Query', async () => {
  const store = configureStore({
    reducer: { [microSiftApi.reducerPath]: microSiftApi.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(microSiftApi.middleware),
  })

  const result = await store.dispatch(microSiftApi.endpoints.getLive.initiate()).unwrap()

  expect(result.straddle?.state).toBe('ARMED')
})
