class Websocket {
    ws: WebSocket;
    
    constructor(address: string) {
        this.ws = new WebSocket(`ws://${address}`);
        this.start();
        setInterval(()=>{
            this.send({action: "ping"});
        },2000);
    }
    
    start() {
        this.ws.onerror = (err) => {
            console.log(err);
        }
        
        this.ws.onopen = () => {
            //console.log("ws open");
        }
        
        this.ws.onmessage = (data) => {
            console.log(JSON.stringify(data.data));
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
