import React, { createRef, RefObject } from 'react';
import './Main.css';
import Switch from './Switch';
import RotationPanel from '../rotationPanel/RotationPanel';
import { InitWs } from '../tools/Websocket';
import config from '../config.json';

InitWs(config.backend_addr);

const Main = () => {
    
    const RotationPanelRef: RefObject<HTMLDivElement> = createRef();
    const CultivationPanelRef: RefObject<HTMLDivElement> = createRef();
    const DataPanelRef: RefObject<HTMLDivElement> = createRef();
    
    return (
        <div id="MainGrid">
            <div id="Switches">
                <Switch config={{name: "RotationPanel", icon: "icon_rotation", onclick: () => {
                    if ( RotationPanelRef.current!.style.display === "block") {
                        RotationPanelRef.current!.style.display = "none";
                    } else {
                        RotationPanelRef.current!.style.display = "block";
                    }
                    
                }}}></Switch>
                <Switch config={{name: "CultivationPanel", icon: "icon_cultivation", onclick: () => {console.log("a")}}}></Switch>
                <Switch config={{name: "a", onclick: () => {console.log("a")}}}></Switch>
            </div>
            <div id="Panels">
                <div ref={RotationPanelRef} style={{display: "block"}}>
                    <RotationPanel></RotationPanel>
                </div>
            </div>
        </div>
    )
}

export default Main;
