import { store } from "../../store"
import type { ITile } from '../../types';
import { doObjectsCollide } from "./collisionHelper";

const ObjectMoveHelper = {
    getTiles (): ITile[] {
      return store.getState().map.tiles
    },
    getHeroFuturePosition (direction: string,speed: number) {
      switch (direction) {
        case 'up':
          return {...store.getState().hero.hero.position, y: store.getState().hero.hero.position.y - speed}
        case 'down':
          return {...store.getState().hero.hero.position, y: store.getState().hero.hero.position.y + speed}
        case 'left':
          return {...store.getState().hero.hero.position, x: store.getState().hero.hero.position.x - speed};
        case 'right':
          return {...store.getState().hero.hero.position, x: store.getState().hero.hero.position.x + speed}
      }
      return store.getState().hero.hero.position
    },
    getUpBlockingTile (speed: number): null | ITile {
        const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('up', speed), tiles[i])) {
            return tiles[i];
          }
        }
        return null;
    },
    getDownBlockingTile (speed: number): null | ITile {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('down', speed), tiles[i])) {
            return tiles[i];
          }
        }
        return null;
    },
    getLeftBlockingTile (speed: number): null | ITile {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('left', speed), tiles[i])) {
            return tiles[i];
          }
        }
        return null;
    },
    getRightBlockingTile (speed: number): null | ITile {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('right', speed), tiles[i])) {
            return tiles[i];
          }
        }
        return null;
    },
}

export { ObjectMoveHelper }