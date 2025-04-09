let w = require('ws');

const ws = new w('ws://clinostate-static.local:8080');

ws.on('message', (data) => {

    console.log(JSON.parse(data));

});

ws.on('open', () => {
    ws.send(JSON.stringify(
        {
            action: "pump",
            data: {
                state: "enable_unattended",
            }
        }
    ));
    setTimeout(()=>{
        ws.send(JSON.stringify(
            {
                action: "pump",
                data: {
                    state: "disable",
                }
            }

        ))
    },1000);
});
