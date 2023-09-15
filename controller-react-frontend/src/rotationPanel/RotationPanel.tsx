import React, { useEffect, useState, useRef } from 'react';
import './RotationPanel.css'; 
import Slider from '../reusableComponents/Slider';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import TextBox from '../reusableComponents/TextBox';
import MotorValues from '../tools/MotorValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';
import ReactSlider from "react-slider"

const InfoPanel = () => {
    
    const [isEnabledState, isEnabledStateSet] = useState(0);
    
    useEffect(() => {
        WebsocketServers[0].send({action:"state", data: "motors"});
        window.addEventListener(MotorValues[0].enabled.event, () => {
            if (MotorValues[0].enabled.value === true) {
                isEnabledStateSet(1);
            } else {
                isEnabledStateSet(2);
            }
        });
    });
    
    
    
    return (
        <div className="RotationInfoPanel">
            <div className="RotationPanelNumericalDisplayLeft">
                <NumDisplay config={{
                    param: MotorValues[0].velocity,
                    unit: "1/s",
                }}></NumDisplay>
            </div>
            <div className="RotationPanelNumericalDisplayRight">
                <NumDisplay config={{
                    param: MotorValues[1].velocity,
                    unit: "1/s",
                }}></NumDisplay>
            </div>
            <div className="RotationPanelButtonStart">
                <Button config={{
                    parentState: isEnabledState, 
                    stateConfig: 1, 
                    color: "#456454", 
                    enableColor: "#00fd7a", 
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "motors", data: {
                                enable: [true, true], speed: [MotorValues[0].velocity.value, MotorValues[1].velocity.value]
                            }
                        });
                        isEnabledStateSet(1);
                    }
                }}></Button>
            </div>
            <div className="RotationPanelButtonStop">
                <Button config={{
                    parentState: isEnabledState, 
                    stateConfig: 2, 
                    color: "#591515", 
                    enableColor: "#ff1a1a", 
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "motors", data: {
                                enable: [false, false], speed: [MotorValues[0].velocity.value, MotorValues[1].velocity.value]
                            }
                        });
                        isEnabledStateSet(2);
                    }
                }}></Button>
            </div>
            <div className="RotationPanelTextBoxRight">
                <TextBox
                    text="Outer frame"
                    backgroundColor="rgb(55, 55, 55)"
                    fontColor="#ffffff"
                />
            </div>
            <div className="RotationPanelTextBoxLeft">
                <TextBox
                    text="Inner frame"
                    backgroundColor="rgb(55, 55, 55)"
                    fontColor="#ffffff"
                />
            </div>
        </div>
    );
}

const RotationPanel = () => {
    
    return (
        <div className="RotationPanel">
            <div className="RotationPanelSliders">
                <div className="RotationPanelSliderL">
                    <ReactSlider
                        className="RotationPanelReactSlider"
                        thumbClassName="RotationPanelReactSliderThumb"
                        trackClassName="RotationPanelReactSliderTrack"
                        orientation="vertical"
                        invert
                        max={0.4}
                        step={0.01}
                        onChange={(value, index) => {
                            MotorValues[0]["velocity"].setValue(value);
                        }}
                    />
                </div>
                <div className="RotationPanelSliderR">
                    <ReactSlider
                        className="RotationPanelReactSlider"
                        thumbClassName="RotationPanelReactSliderThumb"
                        trackClassName="RotationPanelReactSliderTrack"
                        orientation="vertical"
                        invert
                        max={0.4}
                        step={0.01}
                        onChange={(value, index) => {
                            MotorValues[1]["velocity"].setValue(value);
                        }}
                    />
                </div>
            </div>
            <InfoPanel></InfoPanel>
        </div>
    )
}

export default RotationPanel;
