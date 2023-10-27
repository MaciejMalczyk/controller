import React, { createRef, RefObject, useState, useEffect } from 'react';
import './Main.css';
import Switch from './Switch';
import Loading from './Loading';
import RotationPanel from '../rotationPanel/RotationPanel';
import CultivationPanel from '../cultivationPanel/CultivationPanel';
import { WebsocketServers, InitWs } from '../tools/Websocket';
import config from '../config.json';

InitWs(config.backend_addr, 0);

const Main = () => {
    
    const [showRotation, setShowRotation] = useState(false);
    const [showCultivation, setShowCultivation] = useState(false);
    const [connected, setConnected] = useState(false);
    
    useEffect(()=>{
        addEventListener(WebsocketServers[0].connected.event, ()=>{
            setConnected(true);
        })
    })
    
    return (
        <div>
            <Loading
                connected={connected}
            ></Loading>
            <div id="MainGrid">
                <div id="Switches">
                    <Switch config={{name: "RotationPanel", 
                                    icon: "icon_rotation", 
                                    enabled: showRotation,
                                    onclick: () => {
                                        if (showRotation === false) {
                                            setShowRotation(true);
                                        } else {
                                            setShowRotation(false);
                                        }
                                    }
                    }}></Switch>
                    <Switch config={{name: "CultivationPanel", 
                                    icon: "icon_cultivation", 
                                    enabled: showCultivation,
                                    onclick: () => {
                                        if (showCultivation === false) {
                                            setShowCultivation(true);
                                        } else {    
                                            setShowCultivation(false);
                                        }
                                    }
                    }}></Switch>
                </div>
                <div id="Panels">
                    { showRotation && <RotationPanel></RotationPanel> }
                    { showCultivation && <CultivationPanel></CultivationPanel> }
                </div>
            </div>
        </div>
    )
}

export default Main;
