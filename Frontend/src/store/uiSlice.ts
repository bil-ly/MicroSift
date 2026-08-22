import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type ConfirmTarget = 'HALT' | 'RESUME' | 'CLOSE_POSITION' | null

const uiSlice = createSlice({
  name: 'ui',
  initialState: { confirmTarget: null as ConfirmTarget },
  reducers: {
    openConfirm: (state, action: PayloadAction<Exclude<ConfirmTarget, null>>) => { state.confirmTarget = action.payload },
    closeConfirm: (state) => { state.confirmTarget = null },
  },
})

export const { openConfirm, closeConfirm } = uiSlice.actions
export default uiSlice.reducer
