import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface HeroPosition {
    x: number, 
    y: number
}
export interface Hero {
    position: HeroPosition,
    direction: string
}
export interface HeroState {
  hero: Hero
}

const initialState: HeroState = {
    hero: {
        position: {
            x: 286,
            y: 525
        },
        direction: 'down'
    }
}

export const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    goLeft: (state) => {
        state.hero.direction = 'LEFT';
        state.hero.position.x -= 10
    },
    goRight: (state) => {
        state.hero.direction = 'RIGHT';
        state.hero.position.x += 10
    },
    goUp: (state) => {
        state.hero.direction = 'UP';
        state.hero.position.y -= 10
    },
    goDown: (state) => {
        state.hero.direction = 'DOWN';
        state.hero.position.y += 10
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