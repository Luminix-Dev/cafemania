import { Input } from "../input/input";
import { GameScene } from "../scenes/gameScene";
import { NewTileCollisionFactory } from "../tile/newTileCollisionFactory";
import { Tile } from "../tile/tile";
import { TileItem } from "../tileItem/tileItem";
import { TileItemType } from "../tileItem/tileItemInfo";
import { Direction } from "../utils/direction";

export class TileHoverDetection {
    public static drawVisuals: boolean = false;

    private static _testPoint: Phaser.GameObjects.Container;
    private static _pointsDrawn: Phaser.GameObjects.Container[] = [];
    private static _polygonsDrawn: Phaser.GameObjects.Polygon[] = [];
    

    public static init() {
        this._testPoint = GameScene.drawCircleNumber("X", new Phaser.Math.Vector2(30, 30))

        Input.events.on("pointerdown", () => {
            
            /*
            const worldPos = Input.getMouseWorldPosition();
            console.log("down", worldPos)

            const tileItem = this.testTileItem(worldPos);

            console.log(tileItem)
            */
        })

        Input.events.on("pointermove", () => {
            
            //const worldPos = Input.getMouseWorldPosition();
            //const tileItem = this.testTileItem(worldPos);

            
        })

    }

    public static testTileItem(position: Phaser.Math.Vector2) {
        const tiles = this.testCollision(position);

        let hoveringTileItem: TileItem | undefined;

        for (const tile of tiles) {
            
            for (const tileItem of tile.tileItems) {
                
                if(tileItem.tileItemInfo.type == TileItemType.FLOOR || tileItem.tileItemInfo.type == TileItemType.WALL) {

                    if(hoveringTileItem) {
                        if(hoveringTileItem.tileItemInfo.type == TileItemType.WALL) continue;
                    }

                    hoveringTileItem = tileItem;
                }

            }
            
        }

        return hoveringTileItem;
    }

    private static testCollision(position: Phaser.Math.Vector2) {

        this._testPoint.setPosition(position.x, position.y)


        for (const p of this._pointsDrawn) {
            p.destroy();
        }
        this._pointsDrawn = []

        for (const p of this._polygonsDrawn) {
            p.destroy();
        }
        this._polygonsDrawn = []

        const hoveringTiles: Tile[] = [];

        for (const tile of GameScene.Instance.world.tileMap.tiles) {

            const distance = position.distance(tile.position);

            if(distance < 250) {
                let collides: boolean = false;
                let checkType = 0; //0=floor, 1=wall
                let flipWallDirection = false;

                const wall = tile.getTileItemsOfType(TileItemType.WALL)[0];


                if(wall) {
                    checkType = 1;

                    flipWallDirection = wall.direction != Direction.SOUTH

                    //wall.direction
                }

                if(this.drawVisuals) {
                    const circle = GameScene.drawCircleNumber(`${checkType}`, new Phaser.Math.Vector2(tile.position.x, tile.position.y))
                    this._pointsDrawn.push(circle);
                }

                const testPosition = new Phaser.Math.Vector2(tile.position.x - position.x, tile.position.y - position.y);

                let points: Phaser.Math.Vector2[] = [];
                 

                if(checkType == 0) {
                    points = NewTileCollisionFactory.getBlockCollisionPoints([0, 0], [0, 0], 0);
                } else {
                    points = NewTileCollisionFactory.getWallCollisionPoints(false, [0, 0], [0, 0], 0);

                            
                    
                    if(flipWallDirection) {
                        points[0].x += Tile.SIZE.x
                        points[3].x += Tile.SIZE.x

                        testPosition.x += Tile.SIZE.x/2                    
                        testPosition.y -= NewTileCollisionFactory.DOOR_HEIGHT - Tile.SIZE.y/2     
                    } else {
                        testPosition.x -= Tile.SIZE.x/2                    
                        testPosition.y -= NewTileCollisionFactory.DOOR_HEIGHT - Tile.SIZE.y/2     
                    }
                    
                }

                const shape = new Phaser.Geom.Polygon(points);

                if(shape.contains(testPosition.x, testPosition.y)) {
                    collides = true;

                    hoveringTiles.push(tile)
                }

                if(this.drawVisuals) {
                    const poly = GameScene.Instance.add.polygon(tile.position.x, tile.position.y, points, collides ? 0xff0000 : 0xffff00).setDepth(10000).setOrigin(0)
                    this._polygonsDrawn.push(poly)
                    
                }
            }
        }

        console.log(this._pointsDrawn.length)

        return hoveringTiles;
    }
}