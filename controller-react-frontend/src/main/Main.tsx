import React, { createRef, RefObject, useState } from 'react';
import './Main.css';
import Switch from './Switch';
import RotationPanel from '../rotationPanel/RotationPanel';
import CultivationPanel from '../cultivationPanel/CultivationPanel';
import { InitWs } from '../tools/Websocket';
import config from '../config.json';

InitWs(config.backend_addr, 0);

const Main = () => {
    
    const [showRotation, setShowRotation] = useState(false);
    const [showCultivation, setShowCultivation] = useState(false);
    
    return (
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
                <Switch config={{name: "a", enabled: false, onclick: () => {console.log("a")}}}></Switch>
            </div>
            <div id="Panels">
                { showRotation && <RotationPanel></RotationPanel> }
                { showCultivation && <CultivationPanel></CultivationPanel> }
            </div>
        </div>
    )
}

export default Main;
