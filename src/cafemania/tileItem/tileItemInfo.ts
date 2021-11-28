export interface TileItemInfoCollision {
    wallSize?: number
    isWall?: boolean
    wallAtFront?: boolean
    height: number
    x: number
    y: number
}

export enum TileItemType {
    FLOOR,
    WALL,
    STOVE,
    COUNTER,
    CHAIR,
    TABLE,
    WALL_DECORATION,
    FLOOR_DECORATION,
    DOOR
}

export enum TileItemPlaceType {
    WALL,
    FLOOR
}

export enum TileItemRotationType {
    DONT_ROTATE,
    SIDE_ONLY,
    SIDE_AND_BACK
}

export interface TileItemInfo {
    id: string
    name: string
    texture: string
    rotationType: TileItemRotationType
    type: TileItemType
    placeType: TileItemPlaceType
    size: Phaser.Math.Vector2
    layers: Phaser.Math.Vector2
    extraLayers: number
    collision: TileItemInfoCollision
    originPosition: Phaser.Math.Vector2
}