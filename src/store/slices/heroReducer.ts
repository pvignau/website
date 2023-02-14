import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IHeroState } from '../../types'
import hero from '../../feature/hero/Hero';
const initialState: IHeroState = {
    hero
}

export const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    stopHero: (state) => {
        state.hero.isMoving = false;
    },
    goLeft: (state) => {
        state.hero.direction = 'left';
        state.hero.position.x -= 12;
        state.hero.isMoving = true;
    },
    goRight: (state) => {
        state.hero.direction = 'right';
        state.hero.position.x += 12;
        state.hero.isMoving = true;
    },
    goUp: (state) => {
        state.hero.direction = 'up';
        state.hero.position.y -= 12;
        state.hero.isMoving = true;
    },
    goDown: (state) => {
        state.hero.direction = 'down';
        state.hero.position.y += 12;
        state.hero.isMoving = true;

    },
    setHeroPosition: (state, { payload }: PayloadAction<{ x: number, y: number }>) => {
        state.hero.position = payload
    },
    setHeroDirection: (state, { payload }: PayloadAction<string>) => {
        state.hero.direction = payload
    },
    makeTalk: (state, { payload }: PayloadAction<string[]>) => {
        state.hero.isTalking = true
        state.hero.speech = payload
    },
    stopTalking: (state) => {
        state.hero.isTalking = false
        state.hero.speech = []
    },
  },
})

// Action creators are generated for each case reducer function
export const { setHeroPosition, setHeroDirection, goLeft, goRight, goUp, goDown, stopHero, makeTalk, stopTalking } = heroSlice.actions

export default heroSlice.reducer