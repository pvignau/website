export interface IHeroPosition {
    x: number, 
    y: number
}

export interface IHero {
    position: IHeroPosition,
    direction: string,
    isMoving: boolean,
    isTalking: boolean,
    speech: string[]
}

export interface IHeroState {
    hero: IHero
}

export interface ITileMeta {
    action: string,
    value: string
}
export interface ITile {
    x: number,
    y: number,
    meta: ITileMeta
}