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
                Object.keys(data.motors).forEach((it) => {
                    MotorValues[Number(it)].velocity.setValue(data.motors[it].speed);
                    MotorValues[Number(it)].enabled.setValue(data.motors[it].enabled);
                });
                CultivationValues["light"].value.setValue(data.lights[0].duty);
                CultivationValues["light"].enabled.setValue(data.lights[0].enabled);
                CultivationValues["pump_ton"].value.setValue(data.pumps[0].ton);
                CultivationValues["pump_toff"].value.setValue(data.pumps[0].toff);
                CultivationValues["pump_ton"].enabled.setValue(data.pumps[0].enabled);
                
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
