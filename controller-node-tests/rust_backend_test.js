let ws = require('ws');

const w = new ws('ws://rockpro64.local:8080');
// const w = new ws('ws://127.0.0.1:8080');

w.on('error', console.error);

w.on('open', function open() {
    setTimeout(()=>{
      let msg = {
        motor: 1,
        action: "speed",
        speed: 6.8
      }
      w.send(JSON.stringify(msg));
    },2);
    setTimeout(()=>{
      let msg = {
        motor: 1,
        action: "start",
        speed: 0
      }
      w.send(JSON.stringify(msg));
    },1000);
    
    setTimeout(()=>{
      let msg = {
        motor: 1,
        action: "stop",
        speed: 0
      }
      w.send(JSON.stringify(msg));
    },20000)
    setTimeout(()=>{
      let msg = {
        motor: 2,
        action: "speed",
        speed: 3.6
      }
      w.send(JSON.stringify(msg));
    },2);
    setTimeout(()=>{
      let msg = {
        motor: 2,
        action: "start",
        speed: 0
      }
      w.send(JSON.stringify(msg));
    },3000);
    
    setTimeout(()=>{
      let msg = {
        motor: 2,
        action: "stop",
        speed: 0
      }
      w.send(JSON.stringify(msg));
    },17000)
});

w.on('message', function message(data) {
  console.log('received: %s', data);
}); 
