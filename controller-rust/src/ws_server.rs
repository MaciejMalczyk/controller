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
use serde_json::json;

use crate::devices::{ Devices };

pub type PeerMap = Arc<Mutex<HashMap<SocketAddr, UnboundedSender<Message>>>>;
pub struct WsServer {
    state: PeerMap,
    devices: Devices,
}

#[derive(Deserialize, Debug)]
struct MotorMsg {
    action: String,
    motor: Option<u8>,
    speed: Option<f32>,
}

impl WsServer {
    pub fn init(state: PeerMap, devices: Devices ) -> WsServer {
        WsServer {
            state: state,
            devices: devices,
        }
    }
    
    pub async fn spawn(&mut self) {
        let addr = ("0.0.0.0:8080").to_string();
        let try_socket = TcpListener::bind(&addr).await;
        let listener = try_socket.expect("Failed to bind");
        println!("Listening on: {}", addr);

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
                                        break;
                                    },
                                    Some(msg) => {
                                        let message: MotorMsg = serde_json::from_str(&msg.unwrap().to_text().unwrap()).unwrap();
                                        let action = message.action.as_str();
                                        match action {
                                            "start" => {
                                                println!("Motor {:?} start", message.motor.unwrap());
                                                task::spawn({
                                                    let motor_clone = devices.motors.get_mut(&message.motor.as_ref().unwrap()).expect("REASON").clone();
                                                    let stop_clone = devices.stops.get(&message.motor.as_ref().unwrap()).expect("REASON").clone();
                                                    async move {
                                                        stop_clone.lock().await.set(0).unwrap();
                                                        motor_clone.lock().await.enable();
                                                        loop {
                                                            let mut motor_guard = MutexGuard::map(motor_clone.lock().await, |f| f);
                                                            if motor_guard.step().await == true {
                                                                stop_clone.lock().await.set(1).unwrap();
                                                                break;
                                                            }
                                                        }
                                                    }
                                                });
                                            },
                                            "stop" => {
                                                println!("Motor {:?} stop", message.motor.unwrap());
                                                task::spawn({
                                                    let motor_clone = devices.motors.get_mut(&message.motor.as_ref().unwrap()).expect("REASON").clone();
                                                    async move {
                                                        let mut motor_guard = MutexGuard::map(motor_clone.lock().await, |f| f);
                                                        motor_guard.disable();
                                                    }
                                                });
                                            },
                                            "speed" => {
                                                println!("Motor {:?} speed set to {}", message.motor.unwrap(), message.speed.unwrap());
                                                let info = json!({"action": "info", "motor": message.motor.unwrap(), "speed": message.speed.unwrap()});
                                                out.send(Message::Text(serde_json::to_string(&info).unwrap())).await.ok();
                                                task::spawn({
                                                    let motor_clone = devices.motors.get_mut(&message.motor.as_ref().unwrap()).expect("REASON").clone();
                                                    async move {
                                                        motor_clone.lock().await.set_speed(message.speed.unwrap());
                                                    }
                                                });
                                            },
                                            "ping" => {
                                                let info = json!({"action": "pong"});
                                                out.send(Message::Text(serde_json::to_string(&info).unwrap())).await.ok();
                                            }
                                            &_ => {
                                                break;
                                            }
                                        }
                                    }
                                    None => break,
                                }
                            }
                        }
                    }
                }
            });
        }
    }
}
