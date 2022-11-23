
const doObjectsCollide = function (
    hero: { x: number, y: number }, 
    collisionTile: { x: number, y: number }
    ): Boolean {
    return (
        hero.x <= collisionTile.x + 36 &&
        hero.x + 36 >= collisionTile.x &&
        hero.y <= collisionTile.y + 36 &&
        hero.y + 36 >= collisionTile.y
    )
}

export { doObjectsCollide }