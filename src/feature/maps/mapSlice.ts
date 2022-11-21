import { createSlice } from '@reduxjs/toolkit'

const initialState: {collisionTiles: {x: Number, y: Number}[]} = {
    collisionTiles: []
}

export const mapSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    setCollisionTiles: (state, action) => {
        state.collisionTiles = action.payload;
    },
    getCollisionTiles: (state): any => { // FIXE type
        return state.collisionTiles;
    }
  },
})

// Action creators are generated for each case reducer function
export const { getCollisionTiles, setCollisionTiles } = mapSlice.actions

export default mapSlice.reducer