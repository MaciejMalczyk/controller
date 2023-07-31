//use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt, SinkExt};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio::{
    task,
    sync::{
        Mutex, MutexGuard,
        mpsc:: {
            unbounded_channel,
            UnboundedSender,
        },
    },
};

use std::{
    net::SocketAddr,
    sync::{
        Arc, 
    },
    collections::HashMap,
};

use serde::Deserialize;
use serde_json::{ json, Value, Value::Null };

use crate::devices::{ Devices };

pub type PeerMap = Arc<Mutex<HashMap<SocketAddr, UnboundedSender<Message>>>>;
pub struct WsServer {
    state: PeerMap,
    devices: Devices,
}

#[derive(Deserialize, Debug)]
struct MotorMsg {
    action: String,
    data: Option<Value>,
}

impl WsServer {
    pub fn init(state: PeerMap, devices: Devices ) -> WsServer {
        WsServer {
            state: state,
            devices: devices,
        }
    }
    
    pub async fn spawn(&mut self) {
        let srv_addr = ("0.0.0.0:8080").to_string();
        let try_socket = TcpListener::bind(&srv_addr).await;
        let listener = try_socket.expect("Failed to bind");
        
        println!("Listening on: {}", srv_addr);

        // Let's spawn the handling of each connection in a separate task.
        while let Ok((stream, addr)) = listener.accept().await {
            tokio::spawn(connection(self.state.clone(), stream, addr, self.devices.clone()));
        }
        
        
        async fn connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr, mut devices: Devices) {
            //listen for connection
            println!("New connection: {}", addr);
            
            //await handshake of websocket connection
            let websocket_stream = tokio_tungstenite::accept_async(raw_stream)
                .await
                .expect("Handshake error");
            
            //if hanshake is ok, print that is ok
            println!("Connection established: {}", addr);
            
            let (tx, _rx) = unbounded_channel::<Message>();
            peer_map.lock().await.insert(addr, tx);
            let (mut out, mut inc) = websocket_stream.split();
            
            let _listener_task = task::spawn({
                async move {
                    loop {
                        tokio::select! {
                            msg = inc.next() => {
                                match msg {
                                    //add spindown for every motor
                                    Some(Err(..)) => {
                                        println!("Connection break");
                                        peer_map.lock().await.remove(&addr);
                                        break;
                                    },
                                    Some(msg) => {
                                        let message: MotorMsg = match serde_json::from_str(&msg.unwrap().to_text().unwrap()) {
                                            Ok(message) => message,
                                            Err(_) => return {
                                                peer_map.lock().await.remove(&addr);
                                            },
                                        };
                                        let action = message.action.as_str();
                                        match action {
                                            "motors" => {
                                                let data = message.data.unwrap();
                                                let mut enable: [bool; 2] = [false, false];
                                                let mut speed: [f64; 2] = [0.0, 0.0];
                                                for (k, v) in data.as_object().unwrap() {
                                                    let mut iter = 0;
                                                    for i in v.as_array().unwrap() {
                                                        if k == "enable" {
                                                            enable[iter] = i.as_bool().unwrap();
                                                            iter += 1;
                                                        } else if k == "speed" {
                                                            speed[iter] = i.as_f64().unwrap();
                                                        }
                                                    }
                                                }
                                                for (id, val) in enable.iter().enumerate() {
                                                    if val == &true {
                                                        task::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("REASON").clone();
                                                            async move {
                                                                //set rotational speed of motor
                                                                motor_clone.handle.lock().await.set_speed(speed[id]);
                                                                //disable physical motor lock on driver
                                                                motor_clone.stop.lock().await.set(0).unwrap();
                                                                //enable stepping function
                                                                motor_clone.handle.lock().await.enable();
                                                                loop {
                                                                    //make MutexGuard to motor instance to listen chages of what step returns
                                                                    let mut motor_guard = MutexGuard::map(motor_clone.handle.lock().await, |f| f);
                                                                    if motor_guard.step().await == true {
                                                                        //if motor_guard.step() returns true, enable motor lock
                                                                        motor_clone.stop.lock().await.set(1).unwrap();
                                                                        //break loop
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    } else if val == &false {
                                                        task::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("REASON").clone();
                                                            async move {
                                                                let mut motor_guard = MutexGuard::map(motor_clone.handle.lock().await, |f| f);
                                                                motor_guard.disable();
                                                            }
                                                        });
                                                    }
                                                }
                                                
                                            },
                                            "ping" => {
                                                let info = json!({"action": "pong"});
                                                out.send(Message::Text(serde_json::to_string(&info).unwrap())).await.ok();
                                            },
                                            "state" => {
                                                for (n,val) in devices.motors.iter_mut() {
                                                    let info = json!({
                                                        "action": "state",
                                                        "motor": n,
                                                        "speed": *val.clone().speed.lock().await,
                                                        "enabled": *val.clone().enabled.lock().await,
                                                    });
                                                    out.send(Message::Text(serde_json::to_string(&info).unwrap())).await.ok();
                                                }
                                            },
                                            "lights" => {
                                                let data = message.data.unwrap();
                                                println!("{:?}", data["enable"]);
                                                if data["enable"] == true {
                                                    task::spawn({
                                                        let light_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        async move {
                                                            light_clone.handle.lock().await.enable();
                                                            loop {
                                                                let mut light_guard = MutexGuard::map(light_clone.handle.lock().await, |f| f);
                                                                if light_guard.pwm().await == true {
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    });
                                                }
                                                if data["enable"] == false {
                                                    println!("dxx");
                                                    task::spawn({
                                                        let light_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        async move {
                                                            let mut light_guard = MutexGuard::map(light_clone.handle.lock().await, |f| f);
                                                            light_guard.disable();
                                                        }
                                                    });
                                                }
                                            },
                                            "sensors" => {                                                
                                            }
                                            &_ => println!("{:?}", message)
                                        }
                                    }
                                    None => {
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}
