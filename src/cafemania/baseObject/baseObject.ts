import { Debug } from "../debug/debug";

export class BaseObject {
    public static useColor: boolean = true;

    public log(...args) {

        if(!BaseObject.useColor) {
            if (Debug.consoleLog) console.log.apply(this, [`[${this.constructor.name}]`].concat(args));
            return;
        }
        if (Debug.consoleLog) console.log.apply(this, [`%c${this.constructor.name}`, "color: #0058B2"].concat(args));
    }
}