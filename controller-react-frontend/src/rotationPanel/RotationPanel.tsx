import React, { useState } from 'react';
import './RotationPanel.css'; 
import Slider from './Slider';
import Button from './Button';
import NumDisplay from './NumericalDisplay';
import MotorValues from '../tools/MotorValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';

const InfoPanel = () => {
    
    const [isEnabledState, isEnabledStateSet] = useState(0);
    
    return (
        <div className="RotationInfoPanel">
            <div className="NumericalDisplayLeft">
                <NumDisplay config={{variable: "vel1"}}></NumDisplay>
            </div>
            <div className="NumericalDisplayRight">
                <NumDisplay config={{variable: "vel2"}}></NumDisplay>
            </div>
            <div className="RotationPanelButtonStart">
                <Button config={{parentState: isEnabledState, stateConfig: 1, color: "#456454", enableColor: "#00fd7a", onclick: () => {
                    WebsocketServers[0].send({motor: 1, action: "speed", speed: MotorValues.vel1.value});
                    WebsocketServers[0].send({motor: 2, action: "speed", speed: MotorValues.vel2.value});
                    WebsocketServers[0].send({motor: 1, action: "start", speed: MotorValues.vel1.value});
                    WebsocketServers[0].send({motor: 2, action: "start", speed: MotorValues.vel2.value});
                    isEnabledStateSet(1);
                }}}></Button>
            </div>
            <div className="RotationPanelButtonStop">
                <Button config={{parentState: isEnabledState, stateConfig: 2, color: "#591515", enableColor: "#ff1a1a", onclick: () => {
                    WebsocketServers[0].send({motor: 1, action: "stop", speed: MotorValues.vel1.value});
                    WebsocketServers[0].send({motor: 2, action: "stop", speed: MotorValues.vel2.value});
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
                    <Slider config={{variable: "vel1", maxValue: config.motor1_max_speed }}></Slider>
                </div>
                <div className="RotationPanelSliderR">
                    <Slider config={{variable: "vel2", maxValue: config.motor2_max_speed }}></Slider>
                </div>
            </div>
            <InfoPanel></InfoPanel>
        </div>
    )
}

export default RotationPanel;
