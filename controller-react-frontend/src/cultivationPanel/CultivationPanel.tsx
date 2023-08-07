import React, { useState } from 'react';
import './CultivationPanel.css';
import Slider from '../reusableComponents/Slider';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import NumDisplayVsV from '../reusableComponents/NumericalDisplayVsV';
import CultivationValues from '../tools/CultivationValues';
import { WebsocketServers } from '../tools/Websocket';
import config from '../config.json';

const CultivationPanel = () => {
    
    const [lightEnabledState, lightEnabledStateSet] = useState(0);
    const [pumpEnabledState, pumpEnabledStateSet] = useState(0);
    
    
    return ( 
        <div className="CultivationPanel">
            <div className="CultivationPanelLightDutySlider">
                <Slider config={{maxValue: 20, param: CultivationValues["light"]["value"] }}></Slider>
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
                        WebsocketServers[0].send({});
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
                        WebsocketServers[0].send({});
                    }
                }}></Button>
            </div>
            <div className="CultivationPanelPumpSliders">
                <div className="CultivationPanelPumpTonSlider">
                    <Slider config={{maxValue: 20, param: CultivationValues["pump_ton"]["value"]}}></Slider>
                </div>
                <div className="CultivationPanelPumpToffSlider">
                    <Slider config={{maxValue: 20, param: CultivationValues["pump_toff"]["value"] }}></Slider>
                </div>
            </div>
            <div className="CultivationPanelPumpValues">
                <div className="CultivationPanelPumpTonValue">
                    <NumDisplayVsV config={{param1: CultivationValues["pump_ton"]["value"], param2: CultivationValues["pump_toff"]["value"]}}></NumDisplayVsV>
                </div>
            </div>
            <div className="CultivationPanelPumpEnableButton">
                <Button config={{
                    parentState: lightEnabledState,
                    stateConfig: 1,
                    color: "#456454",
                    enableColor: "#00fd7a",
                    onclick: () => {
                        WebsocketServers[0].send({});
                    }
                }}></Button>
            </div>
            <div className="CultivationPanelPumpDisableButton">
                <Button config={{
                    parentState: lightEnabledState,
                    stateConfig: 2,
                    color: "#591515",
                    enableColor: "#ff1a1a",
                    onclick: () => {
                        WebsocketServers[0].send({});
                    }
                }}></Button>
            </div>
        </div>
    )
}

export default CultivationPanel;
