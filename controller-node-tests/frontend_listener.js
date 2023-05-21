let ws = require('ws');

const wss = new ws.WebSocketServer({ port: 8080 });

wss.on('connection', (w) => {
  
  w.on('error', (err) => {
    console.error(err);
  });
  
  w.on('message', (data) => {
    console.log('received: %s', data);
  }); 
  
  // setInterval(() => {
  //   w.send("aaa");
  //   console.log("aaa");
  // },1000)
});
 
