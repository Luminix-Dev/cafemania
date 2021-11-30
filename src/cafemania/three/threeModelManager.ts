import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { Debug } from '../debug/debug';

export class ThreeModelManager {
    private static _models = new Map<string, GLTF>();

    public static hasLoaded(path: string) {
        return this._models.has(path);
    }

    public static async get(path: string) {
        if(!this.hasLoaded(path)) await this.load(path);

        const object = this._models.get(path)!;
        return object;
    }

    public static load(path: string) {
        const onProgress = () => console.log("onProgress")
        const onError = (error) => console.log("onError", error)

        const models = this._models;

        Debug.log(`loading model ${path}...`)

        return new Promise<GLTF>(resolve => {
            const loader = new GLTFLoader();
            loader.load(path, function(gltf) {
                
                Debug.log(`loaded`)

                models.set(path, gltf);
                resolve(gltf)
    
            }, onProgress, onError);
        })
    }
}