let ws = require('ws');

const w = new ws('ws://clinostate.local:8080');
// const w = new ws('ws://127.0.0.1:8080');

let test_msgs = [
  { action: "ping" },
  { action: "state", data: "motors" },
  { action: "state", data: "lights" },
  { action: "state", data: "pumps" },
];

let test_responses = [
  { action: "pong" },
  { action: "state", 
    motors: {
      speed: "number",
      enabled: "boolean",
      n: "number"
    }
  },
  { action: "state",
    lights: {
      duty: "number",
      enabled: "boolean"
    }
  },
  { action: "state", 
    pumps: {
      enabled: "boolean",
      moisture: "number",
      from_interface: "number"
    }
  }
];
let test_results = {
  pong: false,
  motors: false,
  lights: false,
  pumps: false
}

function state_test(ws, msg_id) {
    let device = test_msgs[msg_id].data;
    ws.send(JSON.stringify(test_msgs[msg_id]));
}

w.on('error', console.error);

w.on('open', function open() {
  for (let i = 0; i <= 3; i++) {
    state_test(w,i);
  }
  
  
});

w.on('message', (data) => {
  let d = JSON.parse(data);
  test_responses.forEach((el) => {
    let keys = Object.keys(el);
    if (d["action"] === el["action"]) {
      if (d[keys[1]]) {
        let d_key_1_length = d[keys[1]].length;
        let d_key_1_check = 0;
        d[keys[1]].forEach((tel) => {
          let inf = Object.keys(tel);
          let inf_length = inf.length;
          let inf_check = 0;
          inf.forEach((dat) => {
            if ( el[keys[1]][dat] === typeof(tel[dat]) ) {
              inf_check++;
            }
          });
          if (inf_length === inf_check) {
            d_key_1_check++;
          }
        });
        if (d_key_1_length === d_key_1_check) {
          test_results[keys[1]] = true;
        }
      } else {
        if (d["action"] === "pong") {
          test_results["pong"] = true;
        }
      }
    }
  });
  console.log(test_results);
});



