import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Debug } from '../debug/debug';
import { ThreeModelManager } from './threeModelManager';

export interface ThreeModel {
    object: THREE.Group
    mixer?: THREE.AnimationMixer
    clip?: THREE.AnimationClip
}

export default class Three {
    public static size = new Phaser.Math.Vector2(175*1.2, 200*1.2)
    public static camera: THREE.OrthographicCamera
    public static scene: THREE.Scene
    public static renderer: THREE.WebGLRenderer
    private static _initialized: boolean = false;

    public static init() {

        if(this._initialized) return;
        this._initialized = true;

        Debug.log("three init");

        const size = this.size
        const frustumSize = 5.5;
        const aspect = size.x / size.y //window.innerWidth / window.innerHeight;
        const camera = this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );

        camera.position.set( -200, 200, 200 );

        const scene = this.scene = new THREE.Scene();

        //scene.background = new THREE.Color( 0xff0000 )

        camera.lookAt( scene.position );

        const renderer = this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, preserveDrawingBuffer: true } );
        renderer.setPixelRatio( 1 );
        renderer.setSize( size.x, size.y );

        const light = new THREE.AmbientLight( 0xffffff, 1 );
        scene.add( light );

        //document.body.appendChild( this.renderer.domElement );
    }

    public static setAngle(model: ThreeModel, deg: number) {
        model.object.rotation.y = Phaser.Math.DegToRad(deg);
    }

    public static animate() {
        this.renderer.render( this.scene, this.camera );
    }

    public static async loadGLTFModel(path: string, loadAnimation?: boolean) {
        return new Promise<ThreeModel>(async (resolve) => {
            
            
            const scene = this.scene;
            const hasLoaded = ThreeModelManager.hasLoaded(path);
            const gltf = await ThreeModelManager.get(path);
            const object = hasLoaded ? gltf.scene.clone() : gltf.scene
            scene.add(object);
        

            const result: ThreeModel = {
                object: object
            }

            if(loadAnimation) {
                const mixer = new THREE.AnimationMixer(object);
                const clip = gltf.animations[0]
                const anim = mixer.clipAction(clip)

                result.mixer = mixer
                result.clip = clip

                anim.reset()
                anim.play()
            }
            resolve(result)
        })
    }

    public static setModelToObject(model: ThreeModel, object: THREE.Object3D) {
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        object.getWorldPosition( pos );
        object.getWorldQuaternion( quat );
    
        model.object.position.set(pos.x, pos.y, pos.z)
        model.object.quaternion.set(quat.x, quat.y, quat.z, quat.w)
    }

    public static setAnimationFrame(model: ThreeModel, frame: number, totalFrames: number) {

        if(!model.clip || !model.mixer) return;

        /*
        console.log(this._clip.duration)

        this._anim.time = frame * (this._clip.duration / totalFrames)
        this._mixer.update(0)

        console.log(`setAnimFrame`, frame, totalFrames, this._clip.duration / totalFrames * (frame), this._clip.duration)
        */
        const timeInSeconds = frame * ((model.clip.duration - (model.clip.duration*0.01)) / (totalFrames-1))
        const animMixer: any = model.mixer
        
        //console.log(this._clip.duration)


        animMixer.time=0;
            for(var i=0;i<animMixer._actions.length;i++){
            animMixer._actions[i].time=0;
        }
        animMixer.update(timeInSeconds)
    }

    public static getImageData() {
        const canvas = Three.renderer.domElement
        const gl = Three.renderer.getContext()

        const pixelBuffer = new Uint8Array(canvas.width * canvas.height * 4);   

        console.log(gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer))

        return pixelBuffer
    }
}