let ws = require('ws');

// const w = new ws('ws://clinostate.local:8080');
const w = new ws('ws://127.0.0.1:8080');

w.on('error', console.error);

w.on('open', function open() {
    setTimeout(()=>{
      let msg = {
        action: "lights",
        data: {
          enable: true,
        }
      }
      w.send(JSON.stringify(msg));
    },2);
    setTimeout(()=>{
      let msg = {
        action: "lights",
        data: {
          enable: false,
        }
      }
      w.send(JSON.stringify(msg));
    },4000);
});

w.on('message', function message(data) {
  console.log('received: %s', data);
}); 
