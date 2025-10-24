import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import './RotationPanel.css'; 
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import TextBox from '../reusableComponents/TextBox';
import MotorValues from '../tools/MotorValues';
import { WebsocketServers } from '../tools/Websocket';
import ReactSlider from "react-slider"
import config from '../config.json';

interface InfoPanelInterface {
    isEnabledState: number;
    isEnabledStateSet: Dispatch<SetStateAction<number>>;
}

function InfoPanel({
    isEnabledState,
    isEnabledStateSet,
}: InfoPanelInterface) {

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
                <NumDisplay
                    param={MotorValues[0].velocity}
                    unit="1/s"
                    fixedPositions={3}
                ></NumDisplay>
            </div>
            <div className="RotationPanelNumericalDisplayRight">
                <NumDisplay
                    param={MotorValues[1].velocity}
                    unit="1/s"
                    fixedPositions={3}
                ></NumDisplay>
            </div>
            <div className="RotationPanelButtonStart">
                <Button
                    parentState={isEnabledState}
                    stateConfig={1}
                    color="#456454"
                    enableColor="#00fd7a"
                    onclick = {() => {
                        WebsocketServers[0].send({
                            action: "motors", data: {
                                0: {
                                    en: true,
                                    spd: MotorValues[0].velocity.value,
                                },
                                1: {
                                    en: true,
                                    spd: MotorValues[1].velocity.value,
                                }
                            }
                        });
                        isEnabledStateSet(1);
                    }}
                ></Button>
            </div>
            <div className="RotationPanelButtonStop">
                <Button
                    parentState = {isEnabledState}
                    stateConfig = {2}
                    color ="#591515"
                    enableColor = "#ff1a1a"
                    onclick = {() => {
                        WebsocketServers[0].send({
                            action: "motors", data: {
                                0: {
                                    en: false,
                                    spd: MotorValues[0].velocity.value,
                                },
                                1: {
                                    en: false,
                                    spd: MotorValues[1].velocity.value,
                                }
                            }
                        });
                        isEnabledStateSet(2);
                    }}
                ></Button>
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
    
    const [isEnabledState, isEnabledStateSet] = useState(0);

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
                        disabled={((isEnabledState === 2) ? false : true)}
                        max={config.motor_max_value}
                        step={config.motor_step_value}
                        defaultValue={MotorValues[0]["velocity"].value}
                        onChange={(value) => {
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
                        disabled={((isEnabledState === 2) ? false : true)}
                        max={config.motor_max_value}
                        step={config.motor_step_value}
                        defaultValue={MotorValues[1]["velocity"].value}
                        onChange={(value) => {
                            MotorValues[1]["velocity"].setValue(value);
                        }}
                    />
                </div>
            </div>
            <InfoPanel
                isEnabledState={isEnabledState}
                isEnabledStateSet={isEnabledStateSet}
            />
        </div>
    )
}

export default RotationPanel;
