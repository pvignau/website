
const doObjectsCollide = function (
    hero: { x: number, y: number }, 
    collisionTile: { x: number, y: number }
    ): Boolean {
        if (
            hero.x <= collisionTile.x + 12 &&
            hero.x + 12 >= collisionTile.x &&
            hero.y <= collisionTile.y + 12 &&
            hero.y + 12 >= collisionTile.y
        ) {
            console.log(hero, collisionTile);
            console.log(hero.x <= collisionTile.x + 12);
            console.log(hero.x + 12 >= collisionTile.x)
            console.log(hero.y <= collisionTile.y + 12)
            console.log(hero.y + 12 >= collisionTile.y)
        }
    return (
        hero.x <= collisionTile.x + 12 &&
        hero.x + 12 >= collisionTile.x &&
        hero.y <= collisionTile.y + 12 &&
        hero.y + 12 >= collisionTile.y
    )
}

export { doObjectsCollide }