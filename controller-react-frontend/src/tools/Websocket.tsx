import MotorValues from '../tools/MotorValues';

class Websocket {
    ws: WebSocket;
    
    constructor(address: string) {
        this.ws = new WebSocket(`ws://${address}`);
        this.start();
    }
    
    start() {
        this.ws.onerror = (err) => {
            console.log(err);
        }
        
        this.ws.onopen = () => {
            //console.log("ws open");
            this.send({action: "state"});
        }
        
        this.ws.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            console.log(data);
            if (data.action === "state") {
                Object.keys(MotorValues).forEach((it) => {
                    if (it === `${data.motor}`) {
                        MotorValues[Number(it)].velocity.setValue(Math.round(data.speed*10)/10);
                        MotorValues[Number(it)].enabled.setValue(Number(data.enabled));
                    }
                })
            }
        }
        this.ws.onclose = () => {
            setTimeout(()=>{ 
                this.start();
            },1000);
        }
    }
    
    send(obj: object) {
        this.ws.send(JSON.stringify(obj));
    }
    
    
}

let WebsocketServers: { [key: number]: Websocket } = [];

let iterator = 0;

function InitWs(address: string) {
    WebsocketServers[iterator] = new Websocket(address);
    iterator += 1;
}

export { WebsocketServers, InitWs };
