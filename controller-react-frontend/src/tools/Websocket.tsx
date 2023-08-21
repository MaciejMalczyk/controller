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
        
//         ws.onopen = () => {
//         }
        
        ws.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            console.log(data);
            if (data.action === "state") {
                //FIXME
                Object.keys(MotorValues).forEach((it) => {
                    if (it === `${data.motor}`) {
                        MotorValues[Number(it)].velocity.setValue(Number(data.speed));
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

function InitWs(address: string, id: number) {
    WebsocketServers[id] = new Websocket(address);
}

export { WebsocketServers, InitWs };
