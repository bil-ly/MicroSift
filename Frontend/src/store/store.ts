import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { microSiftApi } from '../api/microSiftApi'
import uiReducer from './uiSlice'

export const store = configureStore({
  reducer: { [microSiftApi.reducerPath]: microSiftApi.reducer, ui: uiReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(microSiftApi.middleware),
})

setupListeners(store.dispatch)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
