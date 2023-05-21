class Websocket {
    ws: WebSocket;
    
    constructor() {
        // this.ws = new WebSocket("ws://rockpro64.local:8080");
        this.ws = new WebSocket("ws://127.0.0.1:8080");
        this.start();
    }
    
    start() {
        //console.log("starting")
        //this.ws = new WebSocket("ws://rockpro64.local:8080");
        
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

function InitWs() {
    WebsocketServers[iterator] = new Websocket();
}

export { WebsocketServers, InitWs};
