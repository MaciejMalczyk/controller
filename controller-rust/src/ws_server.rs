//use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt, SinkExt};
use chrono::prelude::*;

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
use serde_json::{ json, Value };

use crate::{ 
    devices::{ Devices },
    config,
};

use mongodb::{
    Client, 
    options::{ClientOptions, FindOptions},
    bson::{doc, Document}, 
};


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
            let cfg = config::read();
            
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
            
            let mongo_client = Client::with_options(ClientOptions::parse(cfg.get("mongodb").unwrap().as_str().unwrap()).await.unwrap()).unwrap().clone();

            
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
                                                            iter += 1;
                                                        }
                                                    }
                                                }
                                                for (id, val) in enable.iter().enumerate() {
                                                    if val == &true {
                                                        task::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("REASON").clone();
                                                            let mongo_client_clone = mongo_client.clone();
                                                            async move {
                                                                motor_clone.handle.lock().await.set_speed(speed[id]);
                                                                motor_clone.stop.lock().await.set(0).unwrap();
                                                                motor_clone.handle.lock().await.enable();
                                                                
                                                                let db = mongo_client_clone.database("clinostate");
                                                                let coll = db.collection::<Document>("motors");
                                                                let local_time: DateTime<Local> = Local::now();
                                                                let d = doc!{
                                                                    format!("motor_{}", &id): "enabled", 
                                                                    "speed": speed[id],
                                                                    "time": format!("{}", local_time)
                                                                };
                                                                coll.insert_one(d,None).await.unwrap();
                                                                
                                                                loop {
                                                                    let mut motor_guard = MutexGuard::map(motor_clone.handle.lock().await, |f| f);
                                                                    if motor_guard.step().await == true {
                                                                        motor_clone.stop.lock().await.set(1).unwrap();
                                                                        break;
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    } else if val == &false {
                                                        task::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("REASON").clone();
                                                            let mongo_client_clone = mongo_client.clone();
                                                            async move {
                                                                let mut motor_guard = MutexGuard::map(motor_clone.handle.lock().await, |f| f);
                                                                motor_guard.disable();
                                                                let db = mongo_client_clone.database("clinostate");
                                                                let coll = db.collection::<Document>("motors");
                                                                let local_time: DateTime<Local> = Local::now();
                                                                let d = doc!{format!("motor_{}", &id): "disabled", "time": format!("{}", local_time)};
                                                                coll.insert_one(d,None).await.unwrap();
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
                                                //add other devices
                                                let mut motors = vec![];
                                                for (_n,val) in devices.motors.iter_mut() {
                                                    let motor = json!({
                                                        "speed": val.clone().handle.lock().await.rot_per_s,
                                                        "enabled": !val.clone().handle.lock().await.disable,
                                                    });
                                                    motors.push(motor);
                                                }
                                                let mut lights = vec![];
                                                for (_n,val) in devices.lights.iter_mut() {
                                                    let light = json!({
                                                        "duty": val.clone().handle.lock().await.duty,
                                                        "enabled": *val.clone().handle.lock().await.switch.lock().await,
                                                    });
                                                    lights.push(light);
                                                }
                                                let mut pumps = vec![];
                                                for (_n,val) in devices.pumps.iter_mut() {
                                                    let pump = json!({
                                                        "ton": val.clone().handle.lock().await.ton,
                                                        "toff": val.clone().handle.lock().await.toff,
                                                        "enabled": *val.clone().handle.lock().await.switch.lock().await,
                                                    });
                                                    pumps.push(pump);
                                                }
                                                let msg = json!({
                                                    "action": "state",
                                                    "motors": motors,
                                                    "lights": lights,
                                                    "pumps": pumps,
                                                });
                                                
                                                out.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.ok();
                                            },
                                            "light" => {
                                                let data = message.data.unwrap();
                                                if data["state"] == "enable" {
                                                    task::spawn({
                                                        let l_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        let mongo_client_clone = mongo_client.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database("clinostate");
                                                            let coll = db.collection::<Document>("lights");
                                                            let local_time: DateTime<Local> = Local::now();
                                                            let d = doc!{
                                                                format!("light_{}", &0): "enabled",
                                                                "duty": data["duty"].as_i64().unwrap(),
                                                                "time": format!("{}", local_time)
                                                            };
                                                            coll.insert_one(d,None).await.unwrap();
                                                            l_clone.handle.lock().await.pwm(data["duty"].as_u64().unwrap()).await;
                                                        }
                                                    });
                                                } else if data == "disable" {
                                                    task::spawn({
                                                        let l_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        let mongo_client_clone = mongo_client.clone();
                                                        async move {
                                                            l_clone.handle.lock().await.stop().await;
                                                            let db = mongo_client_clone.database("clinostate");
                                                            let coll = db.collection::<Document>("lights");
                                                            let local_time: DateTime<Local> = Local::now();
                                                            let data = doc!{format!("light_{}", &0): "disabled", "time": format!("{}", local_time)};
                                                            coll.insert_one(data,None).await.unwrap();
                                                        }
                                                    });
                                                }
                                                
                                                
                                            },
                                            "pump" => {
                                                let data = message.data.unwrap();
                                                if data["state"] == "enable" {
                                                    task::spawn({
                                                        let p_clone = devices.pumps.get_mut(&0).expect("REASON").clone();
                                                        let mongo_client_clone = mongo_client.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database("clinostate");
                                                            let coll = db.collection::<Document>("pumps");
                                                            let local_time: DateTime<Local> = Local::now();
                                                            let d = doc!{
                                                                format!("pump_{}", &0): "enabled",
                                                                "ton": data["ton"].as_i64().unwrap(),
                                                                "toff": data["toff"].as_i64().unwrap(),
                                                                "time": format!("{}", local_time)
                                                            };
                                                            coll.insert_one(d,None).await.unwrap();
                                                            p_clone.handle.lock().await.pwm(data["ton"].as_u64().unwrap(), data["toff"].as_u64().unwrap()).await;
                                                        }
                                                    });
                                                } else if data == "disable" {
                                                    task::spawn({
                                                        let p_clone = devices.pumps.get_mut(&0).expect("REASON").clone();
                                                        let mongo_client_clone = mongo_client.clone();
                                                        async move {
                                                            p_clone.handle.lock().await.stop().await;
                                                            let db = mongo_client_clone.database("clinostate");
                                                            let coll = db.collection::<Document>("pumps");
                                                            let local_time: DateTime<Local> = Local::now();
                                                            let d = doc!{format!("pump_{}", &0): "disabled", "time": format!("{}", local_time)};
                                                            coll.insert_one(d,None).await.unwrap();
                                                        }
                                                    });
                                                }
                                                
                                                
                                            }
                                            &_ => println!("{:?}", message)
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
