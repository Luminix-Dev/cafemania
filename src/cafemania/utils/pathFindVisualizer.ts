import { World } from "../world/world";
import { PathFind } from "./pathFind";

export class PathFindVisualizer {
    public readonly pathFind: PathFind;
    public showPathOnly: boolean = false;

    private _graphics: Phaser.GameObjects.Graphics;
    private _container: Phaser.GameObjects.Container;
    private _world: World;
    private _drawTime: number = 0;

    constructor(pathFind: PathFind, world: World) {
        this.pathFind = pathFind;
        this._world = world;
    }

    public createContainer(scene: Phaser.Scene) {
        this._container = scene.add.container();
        this._graphics = scene.add.graphics();
        this._container.add(this._graphics);
        this.draw();
        return this._container;
    }

    public destroy() {
        this._graphics.destroy();
        this._container.destroy();
    }

    private draw() {
        this._drawTime = 0;

        const graphics = this._graphics;
        const pathFind = this.pathFind;
        const world = this._world;

        graphics.clear();

        pathFind.getNodes().forEach(node => {
            
            const position = world.tileMap.getTile(node.x, node.y).position;

            graphics.fillStyle(0x000000);

            if(node.walkable) {
                graphics.fillStyle(0xd7d7d7);
            }

            if(pathFind.frontier.includes(node)) {
                graphics.fillStyle(0x02ad9d);
            }

            if(pathFind.path.includes(node)) {
                graphics.fillStyle(0x0000ff);
            }

            let drawCircle = true;
            const isPath = pathFind.path.includes(node);

            if(this.showPathOnly) {
                if(!isPath) drawCircle = false;
            }

            if(drawCircle) graphics.fillCircle(position.x, position.y, 5);


            if(node.cameFrom) {
                const cameFromPosition = world.tileMap.getTile(node.cameFrom.x, node.cameFrom.y).position;
                const angle = Phaser.Math.Angle.BetweenPoints(position, cameFromPosition);

                const pos = {
                    x: Math.cos(angle) * 20,
                    y: Math.sin(angle) * 20
                }

                if(drawCircle) {
                    graphics.lineStyle(3, 0x000000)
                    graphics.lineBetween(position.x, position.y, position.x + pos.x, position.y + pos.y);
                }
            }

            //graphics.fillStyle(0xff0000);
            //graphics.fillCircle(tile.position.x, tile.position.y, 10);
            
            //tile.position

            
        })
    }

    public render(dt: number) {
        this._drawTime += dt;
        if(this._drawTime < 500) return;

        this.draw();
        
    }
}