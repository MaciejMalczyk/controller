import React, { useState } from 'react';
import './RotationPanel.css'; 
import Slider from './Slider';
import Button from './Button';
import MotorValues from '../tools/MotorValues';
import { WebsocketServers } from '../tools/Websocket';

const ButtonsPanel = () => {
    
    const [isEnabledState, isEnabledStateSet] = useState(0);
    
    return (
        <div className="RotationPanelButtons">
            <div className="RotationPanelButtonH">
                <Button config={{parentState: isEnabledState, stateConfig: 1, color: "#456454", enableColor: "#00fd7a", onclick: () => {
                    WebsocketServers[0].send({motor: 1, action: "speed", speed: MotorValues.vel1});
                    WebsocketServers[0].send({motor: 2, action: "speed", speed: MotorValues.vel2});
                    WebsocketServers[0].send({motor: 1, action: "start", speed: MotorValues.vel1});
                    WebsocketServers[0].send({motor: 2, action: "start", speed: MotorValues.vel2});
                    isEnabledStateSet(1);
                }}}></Button>
            </div>
            <div className="RotationPanelButtonL">
                <Button config={{parentState: isEnabledState, stateConfig: 2, color: "#591515", enableColor: "#ff1a1a", onclick: () => {
                    WebsocketServers[0].send({motor: 1, action: "stop", speed: MotorValues.vel1});
                    WebsocketServers[0].send({motor: 2, action: "stop", speed: MotorValues.vel2});
                    isEnabledStateSet(2);
                }}}></Button>
            </div>
        </div>
    );
}

const RotationPanel = () => {
    
    return (
        <div className="RotationPanel">
            <div className="RotationPanelSliders">
                <div className="RotationPanelSliderL">
                    <Slider config={{variable: "vel1", maxValue: 8 }}></Slider>
                </div>
                <div className="RotationPanelSliderR">
                    <Slider config={{variable: "vel2", maxValue: 5 }}></Slider>
                </div>
            </div>
            <ButtonsPanel></ButtonsPanel>
        </div>
    )
}

export default RotationPanel;
