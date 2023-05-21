//use futures_channel::mpsc::{unbounded, UnboundedSender};
use futures_util::{StreamExt};

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

use crate::devices::Motors;

pub type PeerMap = Arc<Mutex<HashMap<SocketAddr, UnboundedSender<Message>>>>;
pub struct WsServer {
    state: PeerMap,
    motors: Motors,
}

#[derive(Deserialize, Debug)]
struct MotorMsg {
    motor: u8,
    action: String,
    speed: f32,
}

impl WsServer {
    pub fn init(state: PeerMap, motors: Motors) -> WsServer {
        WsServer {
            state: state,
            motors: motors,
        }
    }
    
    pub async fn spawn(&mut self) {
        let addr = ("0.0.0.0:8080").to_string();
        let try_socket = TcpListener::bind(&addr).await;
        let listener = try_socket.expect("Failed to bind");
        println!("Listening on: {}", addr);

        // Let's spawn the handling of each connection in a separate task.
        while let Ok((stream, addr)) = listener.accept().await {
            tokio::spawn(connection(self.state.clone(), stream, addr, self.motors.clone()));
        }
        
        
        async fn connection(peer_map: PeerMap, raw_stream: TcpStream, addr: SocketAddr, mut motors: Motors) {
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
            let (_out, mut inc) = websocket_stream.split();
            
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
                                                println!("Motor {:?} start", message.motor);
                                                task::spawn({
                                                    let motor_clone = motors.get_mut(&message.motor).expect("REASON").clone();
                                                    async move {
                                                        motor_clone.lock().await.enable();
                                                        loop {
                                                            let mut motor_guard = MutexGuard::map(motor_clone.lock().await, |f| f);
                                                            if motor_guard.step().await == true {
                                                                break;
                                                            }
                                                        }
                                                    }
                                                });
                                            },
                                            "stop" => {
                                                println!("Motor {:?} stop", message.motor);
                                                task::spawn({
                                                    let motor_clone = motors.get_mut(&message.motor).expect("REASON").clone();
                                                    async move {
                                                        let mut motor_guard = MutexGuard::map(motor_clone.lock().await, |f| f);
                                                        motor_guard.disable();
                                                    }
                                                });
                                            },
                                            "speed" => {
                                                println!("Motor {:?} speed set to {}", message.motor, message.speed);
                                                task::spawn({
                                                    let motor_clone = motors.get_mut(&message.motor).expect("REASON").clone();
                                                    async move {
                                                        motor_clone.lock().await.set_speed(message.speed);
                                                    }
                                                });
                                            },
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
