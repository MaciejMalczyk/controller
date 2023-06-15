import React from 'react';
import './Main.css';
import Switch from './rotationPanel/Switch';
import RotationPanel from './rotationPanel/RotationPanel';
import { InitWs } from './tools/Websocket';
import config from './config.json';

InitWs(config.backend_addr);

const Main = () => {
    
    return (
        <div id="MainGrid">
            <div id="Switches">
                <Switch config={{name: "RotationPanel", icon: "icon_rotation", onclick: () => {console.log("a")}}}></Switch>
                <Switch config={{name: "a", onclick: () => {console.log("a")}}}></Switch>
                <Switch config={{name: "a", onclick: () => {console.log("a")}}}></Switch>
            </div>
            <div id="Panels">
                <RotationPanel></RotationPanel>
            </div>
        </div>
    )
}

export default Main;
