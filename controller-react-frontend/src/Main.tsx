import React from 'react';
import './Main.css';
import Switch from './elements/Switch';
import RotationPanel from './elements/RotationPanel';
import { InitWs } from './tools/Websocket';

const Main = () => {
    
    InitWs();
    
    return (
        <div id="MainGrid">
            <div id="Switches">
                <Switch config={{name: "a", icon: "icon_rotation", onclick: () => {console.log("a")}}}></Switch>
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
