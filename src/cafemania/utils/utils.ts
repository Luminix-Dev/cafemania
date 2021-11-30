export class Utils
{
    public static shuffleArray<T>(array: T[]): T[]
    {
        let currentIndex = array.length
        let randomIndex: number;

        while (0 !== currentIndex) {

            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    public static formatVector(vec: Phaser.Math.Vector2) {
        return `(${vec.x}, ${vec.y})`
    }
}