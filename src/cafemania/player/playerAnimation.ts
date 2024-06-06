import { Debug } from "../debug/debug";
import { Direction } from "../utils/direction";
import { Player } from "./player";

export interface IPlayerAnim {
    name: string
    directions: Direction[]
    frames: number
    frameOrder: number[]
    frameRate: number
}


export class PlayerAnimation {

    public static Animations: {[key: string]: IPlayerAnim} = {
        'Idle': {
            name: 'Idle',
            directions: [Direction.NORTH, Direction.SOUTH, Direction.NORTH_WEST, Direction.NORTH_EAST, Direction.SOUTH_EAST],
            frames: 3,
            frameOrder: [0, 1, 2, 1],
            frameRate: 2
        },
        'Walk': {
            name: 'Walk', 
            directions: [Direction.NORTH, Direction.SOUTH, Direction.NORTH_WEST, Direction.NORTH_EAST, Direction.SOUTH_EAST],
            frames: 3,
            frameOrder: [0, 1, 2, 1],
            frameRate: 4
        },
        'Sit': {
            name: 'Sit',
            directions: [Direction.NORTH, Direction.SOUTH],
            frames: 1,
            frameOrder: [0],
            frameRate: 4
        },
        'Eat': {
            name: 'Eat',
            directions: [Direction.NORTH, Direction.SOUTH],
            frames: 3,
            frameOrder: [0, 1, 2, 1],
            frameRate: 4
        }
    }

    public static directionToAnimDir(direction: Direction) {
        const d = {dir: 0, flipped: false}

        const option = [
            [0, false],
            [1, false],
            [1, true],
            [0, true],
            [4, false],
            [5, false],
            [5, true],
            [7, false]
        ][direction]

        d.dir = option[0] as number
        d.flipped = option[1] as boolean

        // 0 - 0 e 3
        // 1 - 1 e 2
        // 4 - 4
        // 5 - 5 e 6
        // 7 - 7

        return d
    }


    private _player: Player;
    private _currentDirection: Direction;
    private _currentAnim: string = "";

    private _lastChangedFrame: number = -1;
    private _currentFrame: number = 0;

    constructor(player: Player) {
        this._player = player;
        this._currentDirection = player.direction;
    }

    public update(delta: number) {
        const now = new Date().getTime();
        const anim = PlayerAnimation.Animations[this._currentAnim];

        if(!anim) return;

        const playerDirection = this._player.direction;

        if(this._currentDirection != playerDirection) {
            this._currentDirection = playerDirection;
            this._lastChangedFrame = 0;
        }

        const totalNumOfFrames = anim.frameOrder.length;

        if(now - this._lastChangedFrame >= 1000/anim.frameRate)
        {
            this._lastChangedFrame = now;
            this._currentFrame++;
            
            //if (Debug.consoleLog) console.log(this._currentFrame, totalNumOfFrames)

            if(this._currentFrame >= totalNumOfFrames) this._currentFrame = 0;

            const frameN = anim.frameOrder[this._currentFrame];
            const dir = PlayerAnimation.directionToAnimDir(playerDirection);
            const frameKey = `${anim.name}_${dir.dir}_${frameN}`;
            const playerScale = 1.05;
            const sprite = this._player.getSprite();

            if(sprite) {
                if(sprite.texture.has(frameKey)) sprite.setFrame(frameKey);

                sprite.setScale((dir.flipped ? -1 : 1) * playerScale, playerScale);
            }
        }

        /*

        const playerDirection = this._player.direction

        if(this._oldAnim != this._currentAnim || this._currentDirection != playerDirection)
        {
            this._oldAnim = this._currentAnim
            this._currentDirection = playerDirection

            //if (Debug.consoleLog) console.log(`Animation is now ${this._currentAnim} (${this._currentDirection})`)
        
            if(!this._player.getSprite()) return

            
            const sprite = this._player.getSprite()

            if(sprite)
            {
                const animKey = `${this._currentAnim}_${playerDirection}`
                sprite.anims.play(animKey)
                sprite.setScale(1.05, 1.05)
            }

            
        }
        */
    }

    public play(anim: string, forceChange?: boolean) {
        if(this._currentAnim == anim) return;
        this._currentAnim = anim;
        this._lastChangedFrame = 0;
        //if(forceChange) this._oldAnim = ""
    }

    public getAnim() {
        return this._currentAnim;
    }
}