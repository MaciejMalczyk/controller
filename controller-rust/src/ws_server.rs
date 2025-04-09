use futures_util::{StreamExt, SinkExt};

use tokio::net::{TcpListener, TcpStream};
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio::sync::{
        Mutex,
        mpsc:: {
            unbounded_channel,
            UnboundedSender,
        },
    };

use std::{
    net::SocketAddr,
    sync::Arc,
    collections::HashMap,
};

use serde::Deserialize;
use serde_json::{ json, Value };

use crate::{ 
    devices::Devices,
    config,
};

use mongodb::{
    Client, 
    options::ClientOptions,
    bson::{doc, Document, DateTime}, 
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
            state,
            devices,
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
            
            println!("New connection: {} | {}", addr, DateTime::now());
            
            //await handshake of websocket connection
            let websocket_stream = tokio_tungstenite::accept_async(raw_stream)
                .await
                .expect("Handshake error");
            
            //if hanshake is ok, print that is ok
            println!("Connection established: {} | {}", addr, DateTime::now());
            
            let (tx, _rx) = unbounded_channel::<Message>();
            peer_map.lock().await.insert(addr, tx);
            let (mut out, mut inc) = websocket_stream.split();
            
            let cfg = Arc::new(Mutex::new(config::read()));
            let mongo_client_options = ClientOptions::parse(
                cfg.lock().await.get("mongodb").unwrap().as_str().unwrap()
            ).await.unwrap();
            let mongo_client = Client::with_options(mongo_client_options).unwrap().clone();
            
            let _listener_task = tokio::spawn({
                async move {
                    loop {
                        tokio::select! {
                            msg = inc.next() => {
                                match msg {
                                    Some(Err(..)) => {
                                        println!("Connection break");
                                        break;
                                    },
                                    Some(msg) => {
                                        let message: MotorMsg = match serde_json::from_str::<MotorMsg>(msg.unwrap().to_text().unwrap()) {
                                            Ok(m) => { m },
                                            Err(_) => { todo!() }
                                        };
                                        let action = message.action.as_str();
                                        match action {
                                            "motors" => {
                                                let d = message.data.unwrap();
                                                println!("{}",d);
                                                let data = d.as_object().unwrap();
                                                // println!("{:?}", data);
                                                for (id, val) in data.iter().enumerate() {
                                                    let params = val.1.as_object().unwrap();
                                                    // println!("{:?}|{:?}", id, params);
                                                    if params["en"].as_bool().unwrap() {
                                                        tokio::spawn({
                                                            let mongo_client_clone = mongo_client.clone();
                                                            let speed_clone = params["spd"].as_f64().unwrap();
                                                            let cfg_clone = cfg.clone();
                                                            async move {
                                                                let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                                let coll = db.collection::<Document>("motors");
                                                                let d = doc!{
                                                                    format!("motor_{}", &id): "enabled",
                                                                    "speed": speed_clone,
                                                                    "date": DateTime::now()
                                                                };
                                                                match coll.insert_one(d,None).await {
                                                                    Ok(ok) => { println!("MongoDBClient: Data sent: {:?} | {}", ok, DateTime::now()) },
                                                                    Err(err) => { println!("MongoDBClient: No connection: Err: {:?} | {}", err, DateTime::now()) },
                                                                }
                                                            }
                                                        });

                                                        tokio::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("REASON").clone();
                                                            let speed_clone = params["spd"].as_f64().unwrap();
                                                            async move {
                                                                motor_clone.handle.lock().await.set_velocity(speed_clone).await;
                                                                motor_clone.handle.lock().await.start().await;
                                                                
                                                            }
                                                        }).await.unwrap();

                                                    } else if !(params["en"].as_bool().unwrap()) {
                                                        tokio::spawn({
                                                            let mongo_client_clone = mongo_client.clone();
                                                            let cfg_clone = cfg.clone();
                                                            async move {
                                                                let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                                let coll = db.collection::<Document>("motors");
                                                                let d = doc!{
                                                                    format!("motor_{}", &id): "disabled",
                                                                    "date": DateTime::now()
                                                                };
                                                                match coll.insert_one(d,None).await {
                                                                    Ok(ok) => { println!("MongoDBClient: Data sent: {:?} | {}", ok, DateTime::now()) },
                                                                    Err(err) => { println!("MongoDBClient: No connection: Err: {:?} | {}", err, DateTime::now()) },
                                                                }
                                                            }
                                                        });

                                                        tokio::spawn({
                                                            let motor_clone = devices.motors.get_mut(&(id as u8)).expect("Done").clone();
                                                            async move {
                                                                motor_clone.handle.lock().await.stop().await;
                                                            }
                                                        }).await.unwrap();
                                                    }
                                                }
                                                
                                            },
                                            "ping" => {
                                                let info = json!({"action": "pong"});
                                                out.send(Message::Text(serde_json::to_string(&info).unwrap())).await.ok();
                                            },
                                            "state" => {
                                                let data = message.data.unwrap();
                                                let device = data.as_str();
                                                match device {
                                                    Some("motors") => {
                                                        //temporary solved
                                                        let mut motors: [serde_json::Value; 2] = [json!({}),json!({})];
                                                        for (_n,val) in devices.motors.iter() {
                                                            let motor = json!({
                                                                "speed": val.clone().handle.lock().await.get_velocity().await,
                                                                "enabled": val.clone().handle.lock().await.get_enable().await,
                                                                "n": _n,
                                                            });
                                                            motors[*_n as usize] = motor;
                                                        }
                                                        let msg = json!({
                                                            "action": "state",
                                                            "motors": motors,
                                                            
                                                        });

                                                        out.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.ok();
                                                    }
                                                    Some("lights") => {
                                                        let mut lights = vec![];
                                                        for (_n,val) in devices.lights.iter_mut() {
                                                            let light = json!({
                                                                "duty": val.clone().handle.lock().await.get_duty().await,
                                                                "enabled": val.clone().handle.lock().await.get_status().await,
                                                            });
                                                            lights.push(light);
                                                        }
                                                        let msg = json!({
                                                            "action": "state",
                                                            "lights": lights,
                                                            
                                                        });

                                                        out.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.ok();
                                                    }
                                                    Some("pumps") => {
                                                        let mut pumps = vec![];
                                                        for (_n, val) in devices.pumps.iter_mut() {
                                                            let pump = json!({
                                                                "enabled": val.clone().handle.lock().await.get_enable().await,
                                                                "moisture": val.clone().handle.lock().await.get_moisture().await,
                                                                "from_interface": val.clone().handle.lock().await.get_from_interface().await,
                                                            });
                                                            pumps.push(pump);
                                                        }
                                                        let msg = json!({
                                                            "action": "state",
                                                            "pumps": pumps,
                                                            
                                                        });

                                                        out.send(Message::Text(serde_json::to_string(&msg).unwrap())).await.ok();
                                                    },
                                                    Some(&_) => {
                                                        println!("Unknown device");
                                                    }
                                                    None => {
                                                        println!("err");
                                                    }
                                                    
                                                }
                                            },
                                            "light" => {
                                                let data = message.data.unwrap();
                                                if data["state"] == "enable" {
                                                    tokio::spawn({
                                                        let mongo_client_clone = mongo_client.clone();
                                                        let cfg_clone = cfg.clone();
                                                        let d_clone = data.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                            let coll = db.collection::<Document>("lights");
                                                            let d = doc!{
                                                                format!("light_{}", &0): "enabled",
                                                                "duty": d_clone["duty"].as_i64().unwrap(),
                                                                "date": DateTime::now()
                                                            };
                                                            coll.insert_one(d,None).await.unwrap();
                                                        }
                                                    });

                                                    tokio::spawn({
                                                        let l_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        let d_clone = data.clone();
                                                        async move {
                                                            l_clone.handle.lock().await.pwm(d_clone["duty"].as_f64().unwrap()).await;
                                                        }
                                                    }).await.unwrap();

                                                } else if data == "disable" {
                                                    tokio::spawn({
                                                        let mongo_client_clone = mongo_client.clone();
                                                        let cfg_clone = cfg.clone();
                                                        async move {

                                                            let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                            let coll = db.collection::<Document>("lights");
                                                            let data = doc!{
                                                                format!("light_{}", &0): "disabled", 
                                                                "date": DateTime::now()
                                                            };
                                                            coll.insert_one(data,None).await.unwrap();
                                                        }
                                                    });

                                                    tokio::spawn({
                                                        let l_clone = devices.lights.get_mut(&0).expect("REASON").clone();
                                                        async move {
                                                            l_clone.handle.lock().await.stop().await;
                                                        }
                                                    }).await.unwrap();
                                                }
                                            },
                                            "pump" => {
                                                let data = message.data.unwrap();
                                                
                                                if data["type"] == "cultivation" {
                                                    let p_clone = devices.pumps.get_mut(&0).expect("Done").clone();                                              
                                                    p_clone.handle.lock().await.set_moisture(data["value"].as_f64().unwrap()).await;
                                                    println!("SENSOR MOISTURE: {}", data["value"].as_f64().unwrap());
                                                }
                                                
                                                if data["state"] == "enable" {
                                                    tokio::spawn({
                                                        let mongo_client_clone = mongo_client.clone();
                                                        let cfg_clone = cfg.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                            let coll = db.collection::<Document>("pumps");
                                                            let d = doc!{
                                                                format!("pump_{}", &0): "enabled",
                                                                "date": DateTime::now()

                                                            };
                                                            coll.insert_one(d,None).await.unwrap();
                                                        }
                                                    });

                                                    tokio::spawn({
                                                        let p_clone = devices.pumps.get_mut(&0).expect("Done").clone();
                                                        let d_clone = data.clone();
                                                        async move {
                                                            p_clone.handle.lock().await.set_from_interface(d_clone["value"].as_f64().unwrap()).await;
                                                            p_clone.handle.lock().await.start().await;
                                                        }
                                                    }).await.unwrap();

                                                }
                                                
                                                if data["state"] == "disable" {
                                                    tokio::spawn({
                                                        let mongo_client_clone = mongo_client.clone();
                                                        let cfg_clone = cfg.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                            let coll = db.collection::<Document>("pumps");
                                                            let d = doc!{
                                                                format!("pump_{}", &0): "disabled",
                                                                "date": DateTime::now()
                                                            };
                                                            coll.insert_one(d,None).await.unwrap()
                                                        }

                                                    });

                                                    tokio::spawn({
                                                        let p_clone = devices.pumps.get_mut(&0).expect("Done").clone();
                                                        async move {
                                                            p_clone.handle.lock().await.stop().await;
                                                        }
                                                    }).await.unwrap();
                                                }

                                                if data["state"] == "enable_unattended" {
                                                    tokio::spawn({
                                                        let mongo_client_clone = mongo_client.clone();
                                                        let cfg_clone = cfg.clone();
                                                        async move {
                                                            let db = mongo_client_clone.database(cfg_clone.lock().await.get("device").unwrap().as_str().unwrap());
                                                            let coll = db.collection::<Document>("pumps");
                                                            let d = doc!{
                                                                format!("pump_{}", &0): "enabled_unattended",
                                                                "date": DateTime::now()

                                                            };
                                                            coll.insert_one(d,None).await.unwrap();
                                                        }
                                                    });

                                                    tokio::spawn({
                                                        let p_clone = devices.pumps.get_mut(&0).expect("Done").clone();
                                                        async move {
                                                            p_clone.handle.lock().await.unattended_start().await;
                                                        }
                                                    }).await.unwrap();
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
