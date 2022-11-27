import { IHero } from "../../types"

const getHeroCenteredMapOffset = function (hero: IHero) {
    return {
        x: (Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) / 2) - (hero.position.x + (28 / 2)),
        y: (Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) / 2) - (hero.position.y + (32 / 2))
    }
}

export { getHeroCenteredMapOffset }