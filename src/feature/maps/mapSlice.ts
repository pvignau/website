import { createSlice } from '@reduxjs/toolkit'

const initialState: {collisionTiles: {x: number, y: number}[], metaTiles: {x: number, y: number}[], mapOffset: {x: number, y: number}} = {
    collisionTiles: [],
    metaTiles: [],
    mapOffset: {x: 0, y: 0}
}

export const mapSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    setCollisionTiles: (state, action) => {
        state.collisionTiles = action.payload;
    },
    setMetaTiles: (state, action) => {
        state.metaTiles = action.payload;
    },
    setMapOffset: (state, action) => {
      state.mapOffset = action.payload;
    },
  },
})

// Action creators are generated for each case reducer function
export const { setCollisionTiles, setMetaTiles, setMapOffset } = mapSlice.actions

export default mapSlice.reducer