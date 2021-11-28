import { Tile } from "./tile"

export class TileCollisionFactory
{
    public static getBlockCollisionPoints(offsetX: number[], offsetY: number[], height: number): Phaser.Math.Vector2[]
    {
        const x = Tile.SIZE.x
        const y = Tile.SIZE.y
        const h = height

        const points: Phaser.Math.Vector2[] = [
            new Phaser.Math.Vector2( x/2,   -h),
            new Phaser.Math.Vector2( x,     y/2 - h ),
            new Phaser.Math.Vector2( x,     y/2 ),
            new Phaser.Math.Vector2( x/2,   y),
            new Phaser.Math.Vector2( 0,     y/2),
            new Phaser.Math.Vector2( 0,     y/2 - h)
        ]

        points[0].add(this.moveAlongXY(offsetX[0], 0))
        points[4].add(this.moveAlongXY(offsetX[0], 0))
        points[5].add(this.moveAlongXY(offsetX[0], 0))


        points[1].add(this.moveAlongXY(-offsetX[1], 0))
        points[2].add(this.moveAlongXY(-offsetX[1], 0))
        points[3].add(this.moveAlongXY(-offsetX[1], 0))

        points[0].add(this.moveAlongXY(0, offsetY[0]))
        points[1].add(this.moveAlongXY(0, offsetY[0]))
        points[2].add(this.moveAlongXY(0, offsetY[0]))

        points[3].add(this.moveAlongXY(0, -offsetY[1]))
        points[4].add(this.moveAlongXY(0, -offsetY[1]))
        points[5].add(this.moveAlongXY(0, -offsetY[1]))

        return points
    }

    public static getWallCollisionPoints(atFrontTile: boolean, offsetX: number[], offsetY: number[], wallSize: number): Phaser.Math.Vector2[]
    {
        const x = Tile.SIZE.x
        const y = Tile.SIZE.y
        const h = 232

        const points: Phaser.Math.Vector2[] = [
            new Phaser.Math.Vector2( x/2,   -h),
            new Phaser.Math.Vector2( x,     y/2 - h ),
            new Phaser.Math.Vector2( x,     y/2 ),
            new Phaser.Math.Vector2( x/2,   y),
            new Phaser.Math.Vector2( 0,     y/2),
            new Phaser.Math.Vector2( 0,     y/2 - h)
        ]

        const frontOfTile = atFrontTile
        const size = wallSize
    
        if(!frontOfTile)
        {
            points[3].add(this.moveAlongXY(0, -100 + size))
            points[4].add(this.moveAlongXY(0, -100 + size))
            points[5].add(this.moveAlongXY(0, -100 + size))
        } else {
            points[0].add(this.moveAlongXY(0, 100 - size))
            points[1].add(this.moveAlongXY(0, 100 - size))
            points[2].add(this.moveAlongXY(0, 100 - size))
        }

        points[0].add(this.moveAlongXY(offsetX[0], 0))
        points[5].add(this.moveAlongXY(offsetX[0], 0))
        points[4].add(this.moveAlongXY(offsetX[0], 0))

        points[1].add(this.moveAlongXY(-offsetX[1], 0))
        points[2].add(this.moveAlongXY(-offsetX[1], 0))
        points[3].add(this.moveAlongXY(-offsetX[1], 0))
     
        points[0].y += offsetY[0]
        points[1].y += offsetY[0]
        points[5].y += offsetY[0]

        points[2].y -= offsetY[1]
        points[3].y -= offsetY[1]
        points[4].y -= offsetY[1]   

        return points
    }

    public static moveAlongXY(moveX: number, moveY: number): Phaser.Math.Vector2
    {
        var baseTileSize = Tile.SIZE
        var pos = new Phaser.Math.Vector2(0, 0)

        pos.x += moveX * baseTileSize.x / 2 / 100
        pos.y += moveX * baseTileSize.y / 2 / 100

        pos.x += moveY * -baseTileSize.x / 2 / 100
        pos.y += moveY * baseTileSize.y / 2 / 100

        return pos
    }
}