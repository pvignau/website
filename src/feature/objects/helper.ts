import { IHero } from "../../types"

import { store } from "../../store"
import { doObjectsCollide } from "./collisionHelper";

const ObjectMoveHelper = {
    
    canMoveUp (object: IHero, speed: number) {
        let canMove = true;
        store.getState().map.collisionTiles.forEach((tile: {x: number, y: number }) => {
            if (doObjectsCollide({...store.getState().hero.hero.position, y: store.getState().hero.hero.position.y - speed}, tile)) {
              canMove = false;
            }
          })
        return canMove;
    },
    canMoveDown (object: IHero, speed: number) {
        let canMove = true;
        store.getState().map.collisionTiles.forEach((tile: {x: number, y: number }) => {
            if (doObjectsCollide({...store.getState().hero.hero.position, y: store.getState().hero.hero.position.y + speed}, tile)) {
              canMove = false;
            }
          })
        return canMove;
    },
    canMoveLeft (object: IHero, speed: number) {
        let canMove = true;
        store.getState().map.collisionTiles.forEach((tile: {x: number, y: number }) => {
            if (doObjectsCollide({...store.getState().hero.hero.position, x: store.getState().hero.hero.position.x - speed}, tile)) {
              canMove = false;
            }
          })
        return canMove;
    },
    canMoveRight (object: IHero, speed: number) {
        let canMove = true;
        store.getState().map.collisionTiles.forEach((tile: {x: number, y: number }) => {
            if (doObjectsCollide({...store.getState().hero.hero.position, x: store.getState().hero.hero.position.x + speed}, tile)) {
              canMove = false;
            }
          })
        return canMove;
    },
}

export { ObjectMoveHelper }