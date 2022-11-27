
const doObjectsCollide = function (
    hero: { x: number, y: number }, 
    tile: { x: number, y: number }
    ): Boolean {
    return (
        hero.x <= tile.x + 36 &&
        hero.x + 24 >= tile.x &&
        hero.y <= tile.y + 12 &&
        hero.y + 36 >= tile.y
    )
}

export { doObjectsCollide }