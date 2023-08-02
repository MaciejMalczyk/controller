let ws = require('ws');

// const w = new ws('ws://clinostate.local:8080');
const w = new ws('ws://127.0.0.1:8080');

w.on('error', console.error);

w.on('open', function open() {
    setTimeout(()=>{
      let msg = {
        action: "light",
        data: "enable",
      }
      w.send(JSON.stringify(msg));
    },2);
});

w.on('message', function message(data) {
  console.log('received: %s', data);
}); 
