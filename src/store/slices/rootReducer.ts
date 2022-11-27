import { createSlice } from '@reduxjs/toolkit'

const initialState: {isLoading: boolean} = {
    isLoading: true
}

export const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
        state.isLoading = action.payload;
    }
  },
})

// Action creators are generated for each case reducer function
export const { setIsLoading } = rootSlice.actions

export default rootSlice.reducer