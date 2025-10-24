import w from 'ws';

const ws_clinostate = new w('ws://10.66.66.7:8080');
const ws_static = new w('ws://clinostate-static.local:8080');

ws_clinostate.on('open', function open() {
    console.log("Clinostat Connected");
    // Example of adding water to cultivation with time interval
    setInterval(()=>{
        ws_clinostate.send(JSON.stringify({
            action: "pump",
            data: {
                state: "enable_unattended",
                value: 100
            }
        }));
        setTimeout(()=>{
            ws_clinostate.send(JSON.stringify({
                action: "pump",
                    data: {
                        state: "disable",
                        value: 100
                    }
            }));
        },4000);
    }, 86400000/24);

    // Example of day and night cycle s
    setInterval(()=>{
        let hour = new Date();
        hour = hour.getHours();
        if (hour < 10) {
            console.log(hour);
            ws_clinostate.send(JSON.stringify({
                action: "light",
                data: "disable"
            }));
        } else if (hour >= 10 && hour < 22) {
            console.log(hour);
            ws_clinostate.send(JSON.stringify({
                action: "light",
                data: {
                    state: "enable",
                    duty: 6
                }
            }));
        } else if (hour >= 22) {
            console.log(hour);
            ws_clinostate.send(JSON.stringify({
                action: "light",
                data: "disable"
            }));
        }
    }, 100000);

});

ws_static.on('open', function open() {
    console.log("Static Connected");
    setInterval(()=>{
        ws_static.send(JSON.stringify({
            action: "pump",
            data: {
                state: "enable_unattended",
                value: 100
            }
        }));
        setTimeout(()=>{
            ws_static.send(JSON.stringify({
                action: "pump",
                    data: {
                        state: "disable",
                        value: 100
                    }
            }));
        },4000);
    }, 86400000/6);

    setInterval(()=>{
        let hour = new Date();
        hour = hour.getHours();
        if (hour < 10) {
            console.log(hour);
            ws_static.send(JSON.stringify({
                action: "light",
                data: "disable"
            }));
        } else if (hour >= 10 && hour < 22) {
            console.log(hour);
            ws_static.send(JSON.stringify({
                action: "light",
                data: {
                    state: "enable",
                    duty: 6
                }
            }));
        } else if (hour >= 22) {
            console.log(hour);
            ws_static.send(JSON.stringify({
                action: "light",
                data: "disable"
            }));
        }
    }, 60000);

});


