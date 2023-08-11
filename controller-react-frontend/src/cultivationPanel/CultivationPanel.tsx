import React, { useState } from 'react';
import './CultivationPanel.css';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import NumDisplayVsV from '../reusableComponents/NumericalDisplayVsV';
import CultivationValues from '../tools/CultivationValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';
import ReactSlider from "react-slider"

const CultivationPanel = () => {
    
    const [lightEnabledState, lightEnabledStateSet] = useState(0);
    const [pumpEnabledState, pumpEnabledStateSet] = useState(0);
    
    
    return ( 
        <div className="CultivationPanel">
            <div className="CultivationPanelLightDutySlider">
                <ReactSlider
                    className="CultivationPanelReactSlider"
                    thumbClassName="CultivationPanelReactSliderThumb"
                    trackClassName="CultivationPanelReactSliderTrack"
                    orientation="vertical"
                    invert
                    onChange={(value, index) => {
                        console.log(CultivationValues["light"]["value"].setValue(value));
                    }}
                />
            </div>
            <div className="CultivationPanelLightdutyValue">
                <NumDisplay config={{param: CultivationValues["light"]["value"]}}></NumDisplay>
            </div>
            <div className="CultivationPanelLightEnableButton">
                <Button config={{
                    parentState: lightEnabledState,
                    stateConfig: 1,
                    color: "#456454",
                    enableColor: "#00fd7a",
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "light",
                            data: {
                                state: "enable",
                                duty: CultivationValues["light"]["value"].value,
                            }
                        });
                        lightEnabledStateSet(1);
                    }
                }}></Button>
            </div>
            <div className="CultivationPanelLightDisableButton">
                <Button config={{
                    parentState: lightEnabledState,
                    stateConfig: 2,
                    color: "#591515",
                    enableColor: "#ff1a1a",
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "light",
                            data: "disable"
                        });
                        lightEnabledStateSet(2);
                    }
                }}></Button>
            </div>
            <div className="CultivationPanelPumpSliders">
                <div className="CultivationPanelPumpTonSlider">
                    <ReactSlider
                        className="CultivationPanelReactSlider"
                        thumbClassName="CultivationPanelReactSliderThumb"
                        trackClassName="CultivationPanelReactSliderTrack"
                        orientation="vertical"
                        invert
                        onChange={(value, index) => {
                            console.log(CultivationValues["pump_ton"]["value"].setValue(value));
                        }}
                    />
                </div>
                <div className="CultivationPanelPumpToffSlider">
                    <ReactSlider
                        className="CultivationPanelReactSlider"
                        thumbClassName="CultivationPanelReactSliderThumb"
                        trackClassName="CultivationPanelReactSliderTrack"
                        orientation="vertical"
                        invert
                        onChange={(value, index) => {
                            console.log(CultivationValues["pump_toff"]["value"].setValue(value));
                        }}
                    />
                </div>
            </div>
            <div className="CultivationPanelPumpValues">
                <div className="CultivationPanelPumpTonValue">
                    <NumDisplayVsV config={{param1: CultivationValues["pump_ton"]["value"], param2: CultivationValues["pump_toff"]["value"]}}></NumDisplayVsV>
                </div>
            </div>
            <div className="CultivationPanelPumpEnableButton">
                <Button config={{
                    parentState: pumpEnabledState,
                    stateConfig: 1,
                    color: "#456454",
                    enableColor: "#00fd7a",
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "pump",
                            data: {
                                state: "enable",
                                ton: CultivationValues["pump_ton"]["value"].value,
                                toff: CultivationValues["pump_toff"]["value"].value
                            }
                        });
                        pumpEnabledStateSet(1);
                    }
                }}></Button>
            </div>
            <div className="CultivationPanelPumpDisableButton">
                <Button config={{
                    parentState: pumpEnabledState,
                    stateConfig: 2,
                    color: "#591515",
                    enableColor: "#ff1a1a",
                    onclick: () => {
                        WebsocketServers[0].send({
                            action: "pump",
                            data: "disable"
                        });
                        pumpEnabledStateSet(2);
                    }
                }}></Button>
            </div>
        </div>
    )
}

export default CultivationPanel;
