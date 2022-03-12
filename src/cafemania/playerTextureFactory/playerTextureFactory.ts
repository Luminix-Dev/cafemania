import * as THREE from 'three';

import { AssetManager } from "../assetManager/assetManager";
import { PlayerAnimation } from "../player/playerAnimation";
import { GameScene } from '../scenes/gameScene';
import Three, { ThreeModel } from "../three/three";
import { BonePart } from "./bonePart";

export class PlayerTextureFactory {
    public static get canvas() { return this._canvas; } 
    public static get canvasTextureKey() { return this._canvasTextureKey; } 

    private static _canvas: Phaser.Textures.CanvasTexture;
    private static _canvasTextureKey: string = "PlayerTextureFactory_Canvas";


    private static _skinColor: string = "#ff0000";

    private static _playerModel: ThreeModel;
    
    private static _boneObjects = new Map<BonePart, ThreeModel>();

    //private static _hairModel?: ThreeModel
    //private static _shoesLModel?: ThreeModel
    //private static _shoesRModel?: ThreeModel
    
    public static async init() {
        window['PlayerTextureFactory'] = PlayerTextureFactory;

        const textureManager = GameScene.Instance.textures;

        const canvas = this._canvas = textureManager.createCanvas(this.canvasTextureKey, Three.size.x, Three.size.y);
        
        await Three.init();

        console.log("loading player model...")

        const playerModel = this._playerModel = await Three.loadGLTFModel(AssetManager.ASSETS_URL + 'models/player.glb', true);
        playerModel.object.position.set(0, 0.7, 0);

        console.log("player model loaded")

        



        this.animate();
        
        //Three.appendRenderer();
    }

    public static async attachModelToBone(modelPath: string, bone: BonePart) {
        const hairModel = await Three.loadGLTFModel(AssetManager.ASSETS_URL + modelPath, false);
        this._boneObjects.set(bone, hairModel);
    }

    public static getBoneObject(bone: BonePart) {
        var boneName = "";
        
        switch(bone) {
            case BonePart.HAIR:
                boneName = "Hair"
                break;
            case BonePart.FEET_L:
                boneName = "FeetL"
                break;
            case BonePart.FEET_R:
                boneName = "FeetR"
                break;
        }

        const playerModel = this._playerModel;
        return playerModel.object.getObjectByName(boneName);
    }

    public static setAnimationFrame(frame: number) {
        Three.setAnimationFrame(this._playerModel, frame, this.getTotalAnimFrames())
    }

    public static getTotalAnimFrames() {
        let totalAnimFrames = 0;
        for (const animName in PlayerAnimation.Animations) totalAnimFrames += PlayerAnimation.Animations[animName].frames
        return totalAnimFrames;
    }

    public static setAngle(degrees: number) {
        Three.setRotation(this._playerModel, 0, Phaser.Math.DegToRad(degrees), 0);
    }

    public static placeCameraAtDefaultPosition() {
        Three.camera.position.set( -1, 1, 1 );
        Three.camera.lookAt( 0, 0, 0 );
        Three.camera.zoom = 40;
        Three.camera.updateProjectionMatrix();
    }

    public static placeCameraAtSideView() {
        Three.camera.position.set( -1, -0.1, 0 );
        Three.camera.lookAt(0, -0.1, 0);
        Three.camera.zoom = 34;
        Three.camera.updateProjectionMatrix();
    }

    public static async updateBodySkins() {
        const textureManager = this.getTextureManager();
        const skinColor = this._skinColor;


        if(textureManager.exists('PlayerTextureFactory_SkinTexture')) textureManager.get('PlayerTextureFactory_SkinTexture').destroy();
        const skinTexture = await this.createPixelColorTexture('PlayerTextureFactory_SkinTexture', skinColor);
        

        const headTexture = await this.generateTempSkin('PlayerTextureFactory_HeadTexture', [skinTexture, textureManager.get('player/eye')!], 300, 300)
        const bodyTexture = await this.generateTempSkin('PlayerTextureFactory_BodyTexture', [skinTexture], 300, 300)
        const legsTexture = await this.generateTempSkin('PlayerTextureFactory_LegsTexture', [skinTexture], 300, 300)
     
        await this.applyTextureToObject(headTexture, this._playerModel.object.getObjectByName("Head_1")!)
        await this.applyTextureToObject(skinTexture, this._playerModel.object.getObjectByName("Body")!)
        await this.applyTextureToObject(skinTexture, this._playerModel.object.getObjectByName("Legs")!)
    }

    public static updateBoneParts() {
        
        const keys = Array.from(this._boneObjects.keys());

        for (const bonePart of keys) {
            const model = this._boneObjects.get(bonePart)!;

            const object = this.getBoneObject(bonePart);

            Three.setModelToObject(model, object);
        }

    }
    
    public static setSkinColor(color: string) {
        this._skinColor = color;
    }

    public static animate() {
        this.updateBoneParts();

        Three.animate();

        const canvas = this._canvas;
        canvas.clear();
        //canvas.context.fillStyle = "green";
        //canvas.context.fillRect(0, 0, Three.size.x, Three.size.y);
        canvas.context.drawImage(Three.renderer.domElement, 0, 0);
        canvas.refresh();
    }

    public static getFullImageData() {
        return this.canvas.getData(0, 0, Three.size.x, Three.size.y);
    }

    private static createPixelColorTexture(textureName: string, color: string) {
        const textureManager = this.getTextureManager();
        if(textureManager.exists(textureName)) { textureManager.get(textureName).destroy(); }

        const canvas = textureManager.createCanvas(textureName, 1, 1);
        canvas.context.fillStyle = color;
        canvas.context.fillRect(0, 0, 1, 1);
        canvas.refresh();

        return canvas;
    }

    private static async applyTextureToObject(texture: Phaser.Textures.CanvasTexture, object: THREE.Object3D) {
        const threeTexture = new THREE.CanvasTexture(texture.getCanvas());
        threeTexture.flipY = false;

        await this.applyThreeTextureToObject(threeTexture, object);
    }

    private static async generateTempSkin(name: string, textures: Phaser.Textures.Texture[], width: number, height: number) {
        const textureManager = this.getTextureManager();
        
        if(textureManager.exists(name)) textureManager.get(name).destroy();
        
        return await this.createMixedTexture(name, textures, width, height);
    }

    private static createMixedTexture(name: string, textures: Phaser.Textures.Texture[], width: number, height: number) {
        const textureManager = this.getTextureManager();
        const canvasTexture = textureManager.createCanvas(name, width, height)

        for (const t of textures) {
            const texture = textureManager.get(t)
            canvasTexture.context.drawImage(texture.getSourceImage() as HTMLImageElement , 0, 0, width, height)
        }

        canvasTexture.refresh()
        
        return canvasTexture;
    }

    private static async applyThreeTextureToObject(texture: THREE.CanvasTexture, object: THREE.Object3D) {
        await object.traverse(o => {
            if(o instanceof THREE.Mesh) {
                o.material.map = texture;
            }
        })
    }

    private static getTextureManager() {
        return GameScene.Instance.textures;
    }
}