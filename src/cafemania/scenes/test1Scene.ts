import { Camera } from "../camera/camera";
import { Debug } from "../debug/debug";
import { Gameface } from "../gameface/gameface";
import { Input } from "../input/input";
import { PlayerAnimation } from "../player/playerAnimation";
import { BonePart } from "../playerTextureFactory/bonePart";
import { PlayerSpritesheetGenerator } from "../playerTextureFactory/playerSpritesheetGenerator";
import { Button } from "../ui/button";
import { MoveScene } from "../utils/moveScene";
import { World } from "../world/world";
import { MapGridScene } from "./mapGridScene";

export class Test1Scene extends Phaser.Scene {

    constructor() {
        super({});
    }

    public async create() {
        Debug.log("Test1Scene");

        const PlayerTextureFactory = (await import("../playerTextureFactory/playerTextureFactory")).PlayerTextureFactory

        await PlayerTextureFactory.init();

        this.cameras.main.setBackgroundColor(0xffff00)

        this.add.image(0, 0, PlayerTextureFactory.canvasTextureKey).setOrigin(0, 0)



        PlayerTextureFactory.placeCameraAtSideView();

        var val = 0;
        var m = 1;
        var rot = 0;
        setInterval(() => {
            
            
            /*
            var nextFrameIndex = (currentFrame >= idleAnim.frames) ? 0 : currentFrame+1;
            var nextFrameVal = idleAnim.frameOrder[nextFrameIndex];
            console.log(currentFrame, nextFrameIndex, 'v', val, nextFrameVal)
            
            val += 0.1 * (nextFrameVal > val ? 1 : -1);
            */
           
            val += 0.015 * m;

            if(val >= (idleAnim.frames-1)) {
                val = (idleAnim.frames-1);
                m = -1;
            }
            if(val <= 0) {
                val = 0;
                m = 1;
            }

            PlayerTextureFactory.setAngle(rot += 0.3);
            PlayerTextureFactory.setAnimationFrame(val);
            PlayerTextureFactory.animate();
        })

        const idleAnim = PlayerAnimation.Animations["Idle"];
        
        setTimeout(async () => {
            var t = Date.now();
            await PlayerTextureFactory.attachModelToBone('models/hair/2.glb', BonePart.HAIR);
            console.log(Date.now() - t);
        }, 1000);
        setTimeout(async () => {
            var t = Date.now();
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_L);
            console.log(Date.now() - t);

            var t = Date.now();
            await PlayerTextureFactory.attachModelToBone('models/shoes/1.glb', BonePart.FEET_R);
            console.log(Date.now() - t);
        }, 1000);
    

        /*
        */
        


        await PlayerTextureFactory.updateBodySkins();

        //await PlayerSpritesheetGenerator.generate();
        
        //await PlayerTextureFactory.animate();
    }

    public update(time: number, delta: number) {
        Gameface.Instance.render(delta);
    }
}