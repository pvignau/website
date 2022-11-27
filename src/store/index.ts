import heroReducer from "./slices/heroReducer"
import mapReducer from "./slices/mapReducer"
import rootReducer from "./slices/rootReducer"
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {
    root: rootReducer,
    hero: heroReducer,
    map: mapReducer
  },
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch