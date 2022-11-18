import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IHeroState } from '../../types'
import hero from './Hero';
hero.position = {x: 286, y: 525};
const initialState: IHeroState = {
    hero
}

export const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    goLeft: (state) => {
        state.hero.direction = 'left';
        state.hero.position.x -= 20;
    },
    goRight: (state) => {
        state.hero.direction = 'right';
        state.hero.position.x += 20;
    },
    goUp: (state) => {
        state.hero.direction = 'up';
        state.hero.position.y -= 20;
    },
    goDown: (state) => {
        state.hero.direction = 'down';
        state.hero.position.y += 20;
    },
    setHeroPosition: (state, { payload }: PayloadAction<{ x: number, y: number }>) => {
        state.hero.position = payload
    },
    setHeroDirection: (state, { payload }: PayloadAction<string>) => {
        state.hero.direction = payload
    }
  },
})

// Action creators are generated for each case reducer function
export const { goLeft, goRight, goUp, goDown } = heroSlice.actions

export default heroSlice.reducer