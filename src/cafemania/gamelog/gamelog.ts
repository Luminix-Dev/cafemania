import { Debug } from "../debug/debug";

const request = require('request');

export class Gamelog {
    public static URL = "https://dmdassc.glitch.me/gamelog/log";
    public static LOCAL_URL = "http://127.0.0.1:3000/gamelog/log";
    public static SERVICE_NAME = "cafemania";
    public static forceSendToMainServer = false;

    public static log(address: string, message: string) {
        let url = this.URL
        let isLocal = address.includes("127.0.0.1");

        if(isLocal && !this.forceSendToMainServer)
            url = this.LOCAL_URL;

        const data = {
            service: this.SERVICE_NAME,
            address: address,
            message: message,
            sendPing: !isLocal,
            isLocal: isLocal
        }

        if (Debug.consoleLog) console.log("[gamelog] post", url, data)

        request.post(
            url,
            { headers: {'user-agent': `service-${this.SERVICE_NAME}`}, json: data },
            function (error, response, body) {

                if(error) {
                    if (Debug.consoleLog) console.log("[gamelog] post error");
                    return
                }

                if (response.statusCode == 200) {
                    if (Debug.consoleLog) console.log("[gamelog] post ok");
                }
            }
        );
    }
}