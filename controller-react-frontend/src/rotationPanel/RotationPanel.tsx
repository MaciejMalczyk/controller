import React, { useState } from 'react';
import './RotationPanel.css'; 
import Slider from '../reusableComponents/Slider';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import MotorValues from '../tools/MotorValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';

const InfoPanel = () => {
    
    const [isEnabledState, isEnabledStateSet] = useState(0);
    
    window.addEventListener(MotorValues[1].enabled.event, () => {
        if (MotorValues[1].enabled.value === 1) {
            isEnabledStateSet(1);
        } else {
            isEnabledStateSet(2);
        }
    });
    
    return (
        <div className="RotationInfoPanel">
            <div className="RotationPanelNumericalDisplayLeft">
                <NumDisplay config={{param: MotorValues[1].velocity}}></NumDisplay>
            </div>
            <div className="RotationPanelNumericalDisplayRight">
                <NumDisplay config={{param: MotorValues[2].velocity}}></NumDisplay>
            </div>
            <div className="RotationPanelButtonStart">
                <Button config={{parentState: isEnabledState, stateConfig: 1, color: "#456454", enableColor: "#00fd7a", onclick: () => {
                    WebsocketServers[0].send({
                        action: "motors", data: {
                            enable: [true, true], speed: [MotorValues[1].velocity.value, MotorValues[2].velocity.value]
                        }
                    });
                    isEnabledStateSet(1);
                }}}></Button>
            </div>
            <div className="RotationPanelButtonStop">
                <Button config={{parentState: isEnabledState, stateConfig: 2, color: "#591515", enableColor: "#ff1a1a", onclick: () => {
                    WebsocketServers[0].send({
                        action: "motors", data: {
                            enable: [false, false], speed: [MotorValues[1].velocity.value, MotorValues[2].velocity.value]
                        }
                    });
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
                    <Slider config={{maxValue: config.motor1_max_speed, param: MotorValues[1].velocity}}></Slider>
                </div>
                <div className="RotationPanelSliderR">
                    <Slider config={{maxValue: config.motor2_max_speed, param: MotorValues[2].velocity}}></Slider>
                </div>
            </div>
            <InfoPanel></InfoPanel>
        </div>
    )
}

export default RotationPanel;
