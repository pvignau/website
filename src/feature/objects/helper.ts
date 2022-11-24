import { store } from "../../store"
import { doObjectsCollide } from "./collisionHelper";

const ObjectMoveHelper = {
    getTiles () {
      return [...store.getState().map.collisionTiles, ...store.getState().map.metaTiles]
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
    canMoveUp (speed: number) {
        const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('up', speed), tiles[i])) {
            console.log(tiles[i]);
            return tiles[i];
          }
        }
        return true;
    },
    canMoveDown (speed: number) {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('down', speed), tiles[i])) {
            console.log(tiles[i]);
            return tiles[i];
          }
        }
        return true;
    },
    canMoveLeft (speed: number) {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('left', speed), tiles[i])) {
            console.log(tiles[i]);
            return tiles[i];
          }
        }
        return true;
    },
    canMoveRight (speed: number) {
      const tiles = this.getTiles();
        for(let i = 0; i <tiles.length; i++) {
          if (doObjectsCollide(this.getHeroFuturePosition('right', speed), tiles[i])) {
            console.log(tiles[i]);
            return tiles[i];
          }
        }
        return true;
    },
}

export { ObjectMoveHelper }