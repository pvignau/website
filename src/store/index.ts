import heroReducer from "../feature/hero/heroSlice"
import mapReducer from "../feature/maps/mapSlice"
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    hero: heroReducer,
    map: mapReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch