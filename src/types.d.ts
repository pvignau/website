export interface IHeroPosition {
    x: number, 
    y: number
}

export interface IHero {
    position: IHeroPosition,
    direction: string,
    isMoving: boolean
}

export interface IHeroState {
    hero: IHero
}