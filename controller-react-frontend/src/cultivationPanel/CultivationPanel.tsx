import React, { useState, useEffect, useRef } from 'react';
import './CultivationPanel.css';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import NumDisplayVsV from '../reusableComponents/NumericalDisplayVsV';
import CultivationValues from '../tools/CultivationValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';
import ReactSlider from "react-slider"

const CultivationPanelLight = () => {
    
    const [lightEnabledState, lightEnabledStateSet] = useState(0);
    
    useEffect(() => {
        WebsocketServers[0].send({action:"state", data: "lights"});
        window.addEventListener(CultivationValues["light"].enabled.event, () => {
            if (CultivationValues["light"].enabled.value === true) {
                lightEnabledStateSet(1);
            } else {
                lightEnabledStateSet(2);
            }
        });
    });
    
    return (
        <div className="CultivationPanelLight">
            <div className="CultivationPanelLightDutySlider">
                <ReactSlider
                    className="CultivationPanelReactSlider"
                    thumbClassName="CultivationPanelReactSliderThumb"
                    trackClassName="CultivationPanelReactSliderTrack"
                    orientation="vertical"
                    invert
                    onChange={(value, index) => {
                        CultivationValues["light"]["value"].setValue(value);
                    }}
                />
            </div>
            <div className="CultivationPanelLightdutyValue">
                <NumDisplay config={{
                    param: CultivationValues["light"]["value"],
                    unit: "%",
                }}></NumDisplay>
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
                        console.log("start");
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
                        console.log("stop");
                        lightEnabledStateSet(2);
                    }
                }}></Button>
            </div>
        </div>
    )
}

const CultivationPanelPump = () => {
    
    const [pumpEnabledState, pumpEnabledStateSet] = useState(0);
    
    useEffect(() => {
        WebsocketServers[0].send({action:"state", data: "pumps"});
        window.addEventListener(CultivationValues["pump_ton"].enabled.event, () => {
            if (CultivationValues["pump_ton"].enabled.value === true) {
                pumpEnabledStateSet(1);
            } else {
                pumpEnabledStateSet(2);
            }
        });
    });
    
    return (
        <div className="CultivationPanelPump">
            <div className="CultivationPanelPumpSliders">
                <div className="CultivationPanelPumpTonSlider">
                    <ReactSlider
                        className="CultivationPanelReactSlider"
                        thumbClassName="CultivationPanelReactSliderThumb"
                        trackClassName="CultivationPanelReactSliderTrack"
                        orientation="vertical"
                        invert
                        onChange={(value, index) => {
                            CultivationValues["pump_ton"]["value"].setValue(value);
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
                            CultivationValues["pump_toff"]["value"].setValue(value);
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

const CultivationPanel = () => {
    
    return ( 
        <div className="CultivationPanel">
            <CultivationPanelLight></CultivationPanelLight>
            <CultivationPanelPump></CultivationPanelPump>
        </div>
    )
}

export default CultivationPanel;
