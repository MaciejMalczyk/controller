import MotorValues from '../tools/MotorValues';

class Websocket {
    ws: WebSocket;
    address: string;
    
    constructor(address: string) {
        this.address = address;
        this.ws = this.start();
    }
    
    start() {
        let ws = new WebSocket(`ws://${this.address}`);
        ws.onerror = (err) => {
            console.log(err);
        }
        
        ws.onopen = () => {
            //console.log("ws open");
            this.send({action: "state"});
        }
        
        ws.onmessage = (msg) => {
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
        ws.onclose = () => {
            setTimeout(()=>{
                this.start();
            },1000);
        }
        return ws;
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
