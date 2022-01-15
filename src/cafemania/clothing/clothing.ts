export enum ClothingType {
    EYES,
    ELBOW,
    MOUTH,
    HAIR,
    MUSTACHE,
    HAT,
    GLASSES,
    PANTS,
    SHIRT,
    SHOES
}

export interface Clothing {
    id: string
    name: string
    texture: string
    model?: string
}