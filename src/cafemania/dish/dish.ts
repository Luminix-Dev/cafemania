export interface Dish {
    id: string
    name: string
    cookTime: number
    texture: string
    servings: number
    frames: {
        cooking: number,
        eating: number
    }
}