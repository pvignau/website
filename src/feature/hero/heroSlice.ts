import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { IHeroState } from '../../types'
import hero from './Hero';
hero.position = {x: 286, y: 525};
const initialState: IHeroState = {
    hero
}
function rectangleCollision(rect1: { x: number, y: number }, rect2: { x: number, y: number }): Boolean {
    console.log(rect1.x, rect1.y);
    console.log(rect2);
    return (
        rect1.x <= rect2.x + 12 &&
        rect1.x + 12 >= rect2.x &&
        rect1.y <= rect2.y + 12 &&
        rect1.y + 12 >= rect2.y
    )
}

export const heroSlice = createSlice({
  name: 'hero',
  initialState,
  reducers: {
    goLeft: (state) => {
        state.hero.direction = 'left';
        if (!rectangleCollision(
            {
                x: state.hero.position.x + 313, 
                y: state.hero.position.y + 15
            },
            { x: 683, y: 588 }
        )) {
            state.hero.position.x -= 12;
        }
    },
    goRight: (state) => {
        state.hero.direction = 'right';
        if (!rectangleCollision(
            {
                x: state.hero.position.x + 313, 
                y: state.hero.position.y + 15
            },
            { x: 683, y: 588 }
        )) {
            state.hero.position.x += 12;
        }
    },
    goUp: (state) => {
        state.hero.direction = 'up';
        if (!rectangleCollision(
            {
                x: state.hero.position.x + 313, 
                y: state.hero.position.y + 15
            },
            { x: 683, y: 588 }
        )) {
            state.hero.position.y -= 12;
        }
    },
    goDown: (state) => {
        state.hero.direction = 'down';
        if (!rectangleCollision(
            {
                x: state.hero.position.x + 313, 
                y: state.hero.position.y + 15
            },
            { x: 683, y: 588 }
        )) {
            state.hero.position.y += 12;
        }

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