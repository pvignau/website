
const doObjectsCollide = function (
    hero: { x: number, y: number }, 
    collisionTile: { x: number, y: number }
    ): Boolean {
        if (
            hero.x <= collisionTile.x + 36 &&
            hero.x + 36 >= collisionTile.x &&
            hero.y <= collisionTile.y + 36 &&
            hero.y + 50 >= collisionTile.y
        ) {
            console.log(hero, collisionTile);
            console.log(hero.x <= collisionTile.x + 36);
            console.log(hero.x + 36 >= collisionTile.x)
            console.log(hero.y <= collisionTile.y + 36)
            console.log(hero.y + 50 >= collisionTile.y)
        }
    return (
        hero.x <= collisionTile.x + 36 &&
        hero.x + 36 >= collisionTile.x &&
        hero.y <= collisionTile.y + 36 &&
        hero.y + 50 >= collisionTile.y
    )
}

export { doObjectsCollide }