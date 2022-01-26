import Three from "../three/three";
import { PlayerAnimation } from "../player/playerAnimation";
import { Direction } from "../utils/direction";
import { SpriteSheetOrganizer } from "../utils/spriteSheetOrganizer";
import { PlayerTextureFactory } from "./playerTextureFactory";
import { MainScene } from "../scenes/mainScene";

export interface IPlayerTextureOptions {
    animations: string[]
}

export interface IQueryItem {
    callback: () => void
    name: string
    options: IPlayerTextureOptions
}

export class PlayerSpritesheetGenerator {

    private static _query: IQueryItem[] = [];
    private static _running: boolean = false;

    public static async generate(name: string, options: IPlayerTextureOptions) {
        await new Promise<void>(resolve => {
            let queryItem: IQueryItem = {
                callback: resolve,
                name: name,
                options: options
            }

            this._query.push(queryItem)

            this.process();
        })
    }

    private static async process() {
        if(this._running) {
            console.log("Running, wait")
            return
        }

        if(this._query.length == 0) {
            console.log("Query is empty")
            return
        }

        this._running = true

        const queryItem = this._query.splice(0, 1)[0]

        console.log("Started")

        interface IFrame {
            imageData: ImageData
            frameKey: string
        }

        console.log(`[PlayerTextureFactory] Generating...`)

      
  

        const frames: IFrame[] = []
  
        let pastFrames = 0
     
        

        for (const animName in PlayerAnimation.Animations) {
            const anim = PlayerAnimation.Animations[animName]
            

            if(queryItem.options.animations.includes(animName)) {

                console.log('[PlayerTextureFactory]', `Anim ${animName}`)

                for (const direction of anim.directions)
                {
                    //console.log('[PlayerTextureFactory]', `Direction ${direction}`)

                    PlayerTextureFactory.setAngle(this.angleFromDirection(direction) || 0)

                    for (let frame = 0; frame < anim.frames; frame++)
                    {
                        //console.log('[PlayerTextureFactory]', `Frame ${frame} (${pastFrames + frame} / ${totalAnimFrames})`)

                        PlayerTextureFactory.setAnimationFrame(pastFrames + frame);
                        PlayerTextureFactory.animate()

                        //

             
                        const imageData = PlayerTextureFactory.canvas.getData(0, 0, Three.size.x, Three.size.y)

                        frames.push({
                            imageData: imageData,
                            frameKey: `${anim.name}_${direction}_${frame}`
                        })

                        //
                    }
                }
            }

            pastFrames += anim.frames
        }

        const sheet = new SpriteSheetOrganizer()

        frames.map((frame, index) => sheet.addItem(`${index}`, frame.imageData.width, frame.imageData.height))

        sheet.organize()

        const canvas = MainScene.Instance.textures.createCanvas(queryItem.name, sheet.width, sheet.height) 
        //canvas.context.fillStyle = "red"
        //canvas.context.fillRect(0, 0, canvas.width, canvas.height)

        canvas.add('MAIN', 0, 0, 0, canvas.width, canvas.height)


        frames.map((frame, index) =>
        {
            const position = sheet.getItemPosition(`${index}`)

            canvas.putData(frame.imageData, position.x, position.y)
            canvas.add(frame.frameKey, 0, position.x, position.y, frame.imageData.width, frame.imageData.height)

            //console.log(frame.frameKey)
        })

        canvas.refresh()

        //this._cachedTextures.map(texture => texture.destroy())
        //this._cachedTextures = []

        console.log("Completed")

        queryItem.callback()

        setTimeout(() => {
            this._running = false

            this.process()
        }, 0);
    }

    private static angleFromDirection(direction: Direction) {
        //0 east
        //-45 south east
        //-45*2 south
        //-45*3 south west
        //45 noth east
        //45*2 north

        //45*3 north west
        //45*4 west

        return [
            45*2,   //NORTH
            -45*2,    //SOUTH
            0,      //EAST
            45*4,   //WEST
            45*3,   //NORTH_WEST
            45,   //NORTH_EAST
            -45*3,    //SOUTH_WEST
            -45    //SOUTH_EAST
        ][direction]
    }
}