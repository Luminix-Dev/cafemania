import { Grid } from "../grid/grid"

export class MapGridScene extends Phaser.Scene {
    public static grid: Grid

    public static Instance: MapGridScene;

    constructor() {
        super({});
        MapGridScene.Instance = this;
    }

    public create(): void
    {
        //this.cameras.main.setBackgroundColor(0x000)   

        //this.cameras.main.setSize(200, 200)
        //this.cameras.main.setPosition(5, 30)
        //this.cameras.main.setBackgroundColor(0x000)    
        //this.cameras.main.setZoom(1)
        this.cameras.main.setOrigin(0)
        this.cameras.main.setScroll(-20, 0)
        ///new MoveScene(this)

        //this.createGrid()

        this.drawGrid()
    }

  
    private drawGrid() {
        const graphics = this.add.graphics()

        graphics.setPosition(this.scale.gameSize.width - 30 - 150, 190)
        
        setInterval(() => {
            graphics.clear()

            const grid = MapGridScene.grid

            //graphics.fillStyle(0x000)
            //graphics.fillRect(-15, 25, 150, 150)

            if(!grid) return

            grid.getCells().map(cell => {

                graphics.fillStyle(0xffffff, 1)
                
                let a = 0;

                for (const item of cell.ocuppiedByItems)
                {
                    if(item.color == 0) continue;

                    a += 0.2;

                    //graphics.fillStyle(0xff0000, 0.2);
                }
                
               


                
                if(a > 0)
                {
                    graphics.fillStyle(0x000, a)
                }
    
                const s = 5

                graphics.fillRect(cell.x * (s + 1), 40 + (cell.y * (s + 1)), s, s)
            })
        }, 200)
    }
}