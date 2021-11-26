import { v4 as uuidv4 } from 'uuid';
import { BaseObject } from '../baseObject/baseObject';

import { Game } from "../game/game";

export class World extends BaseObject {
    public id: string = uuidv4();

    private _game: Game;

    constructor(game: Game) {
        super();
        this._game = game;
    }

    public init() {
        this.log("init");
    }
}