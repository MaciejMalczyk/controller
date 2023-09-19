import MotorValues from '../tools/MotorValues';
import CultivationValues from '../tools/CultivationValues';

class Websocket {
    ws: WebSocket;
    address: string;
    
    constructor(address: string) {
        this.address = address;
        this.ws = this.start();
    }
    
    start() {
        this.ws = new WebSocket(`ws://${this.address}`);
        this.ws.onerror = (err) => {
            console.log(err);
        }
        
//         ws.onopen = () => {
//         }
        
        this.ws.onmessage = (msg) => {
            let data = JSON.parse(msg.data);
            console.log(data);
            if (data.action === "state") {
                if (data.motors) {
                    Object.keys(data.motors).forEach((it) => {
                        MotorValues[Number(it)].velocity.setValue(data.motors[it].speed);
                        MotorValues[Number(it)].enabled.setValue(data.motors[it].enabled);
                        console.log(data.motors[it].n);
                    });
                } else if (data.lights) {
                    CultivationValues["light"].value.setValue(data.lights[0].duty);
                    CultivationValues["light"].enabled.setValue(data.lights[0].enabled);
                } else if (data.pumps) {
                    CultivationValues["pump"].enabled.setValue(data.pumps[0].enabled);
                    CultivationValues["pump"].value.setValue(data.pumps[0].from_interface);
                }
            }
        }
        this.ws.onclose = () => {
            setTimeout(()=>{
                this.start();
            },1000);
        }
        return this.ws;
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
