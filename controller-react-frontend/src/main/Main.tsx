import React, { createRef, RefObject, useState } from 'react';
import './Main.css';
import Switch from './Switch';
import RotationPanel from '../rotationPanel/RotationPanel';
import CultivationPanel from '../cultivationPanel/CultivationPanel';
import { InitWs } from '../tools/Websocket';
import config from '../config.json';

InitWs(config.backend_addr);

const Main = () => {
    
    const RotationPanelRef: RefObject<HTMLDivElement> = createRef();
    const CultivationPanelRef: RefObject<HTMLDivElement> = createRef();
    const DataPanelRef: RefObject<HTMLDivElement> = createRef();
    
    const [showRotation, setShowRotation] = useState(false);
    const [showCultivation, setShowCultivation] = useState(false);
    
    return (
        <div id="MainGrid">
            <div id="Switches">
                <Switch config={{name: "RotationPanel", icon: "icon_rotation", isActive: showRotation, onclick: () => {
                    if (showRotation === false) {
                        setShowRotation(true);
                    } else {
                        setShowRotation(false);
                    }
                }}}></Switch>
                <Switch config={{name: "CultivationPanel", icon: "icon_cultivation", isActive: showCultivation, onclick: () => {
                    if (showCultivation === false) {
                        setShowCultivation(true);
                    } else {    
                        setShowCultivation(false);
                    }
                }}}></Switch>
                <Switch config={{name: "a", isActive: true, onclick: () => {console.log("a")}}}></Switch>
            </div>
            <div id="Panels">
                <div ref={RotationPanelRef}>
                    { showRotation && <RotationPanel></RotationPanel> }
                </div>
                <div ref={CultivationPanelRef}>
                    { showCultivation && <CultivationPanel></CultivationPanel> }
                </div>
            </div>
        </div>
    )
}

export default Main;
