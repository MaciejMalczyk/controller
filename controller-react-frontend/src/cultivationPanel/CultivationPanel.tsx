import { useState, useEffect } from 'react';
import './CultivationPanel.css';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import TextBox from '../reusableComponents/TextBox';
import CultivationValues from '../tools/CultivationValues';
import WaterTimer from './WaterTimer'
import { WebsocketServers } from '../tools/Websocket';
import ReactSlider from "react-slider";
import config from '../config.json';


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
                    disabled={((lightEnabledState === 2) ? false : true)}
                    max={config.light_max_value}
                    defaultValue={CultivationValues["light"]["value"].value}
                    onChange={(value) => {
                        CultivationValues["light"]["value"].setValue(value);
                    }}
                />
            </div>
            <div className="CultivationPanelLightdutyValue">
                <NumDisplay
                    param={CultivationValues["light"]["value"]}
                    unit="%"
                ></NumDisplay>
            </div>
            <div className="CultivationPanelLightTagName">
                <TextBox 
                    text="Light intensity"
                    backgroundColor="rgb(55, 55, 55)"
                    fontColor="#ffffff"
                ></TextBox>
            </div>
            <div className="CultivationPanelLightEnableButton">
                <Button
                    parentState = {lightEnabledState}
                    stateConfig = {1}
                    color = "#456454"
                    enableColor = "#00fd7a"
                    onclick = {() => {
                        WebsocketServers[0].send({
                            action: "light",
                            data: {
                                state: "enable",
                                duty: CultivationValues["light"]["value"].value,
                            }
                        });
                        lightEnabledStateSet(1);
                    }}
                ></Button>
            </div>
            <div className="CultivationPanelLightDisableButton">
                <Button
                    parentState = {lightEnabledState}
                    stateConfig = {2}
                    color = "#591515"
                    enableColor = "#ff1a1a"
                    onclick = {() => {
                        WebsocketServers[0].send({
                            action: "light",
                            data: "disable"
                        });
                        lightEnabledStateSet(2);
                    }}
                ></Button>
            </div>
        </div>
    )
}

const CultivationPanelPump = () => {
    
    return (
        <div className="CultivationPanelPump">
            <WaterTimer></WaterTimer>
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
