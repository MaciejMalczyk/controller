import MotorValues from '../tools/MotorValues';
import CultivationValues from '../tools/CultivationValues';
import StateBool from '../tools/StateBool';


class Websocket {
    ws: WebSocket;
    address: string;
    connected: StateBool;
    
    constructor(address: string) {
        this.address = address;
        this.ws = this.start();
        this.connected = new StateBool(false);
    }
    
    start() {
        this.ws = new WebSocket(`ws://${this.address}`);
        this.ws.onerror = (err) => {
            this.connected.setValue(false);
            console.log(err);
        }
        
        this.ws.onopen = () => {
            setTimeout(()=>{
                this.send({action:"state", data: "motors"});
                this.send({action:"state", data: "lights"});
                this.send({action:"state", data: "pumps"});
            },200)
            setInterval(()=>{
                if (this.ws.readyState === 1) {
                    this.send({action:"ping"});
                }
            },2000)
            this.connected.setValue(true);
        }
        
        this.ws.onmessage = (msg) => {
            
            let data = JSON.parse(msg.data);
            if (data.action === "state") {
                if (data.motors) {
                    Object.keys(data.motors).forEach((it) => {
                        MotorValues[data.motors[it].n].velocity.setValue(data.motors[data.motors[it].n].speed);
                        MotorValues[data.motors[it].n].enabled.setValue(data.motors[data.motors[it].n].enabled);
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
// console.log(WebsocketServers);

function InitWs(address: string, id: number) {
    WebsocketServers[id] = new Websocket(address);
}

export { WebsocketServers, InitWs };
