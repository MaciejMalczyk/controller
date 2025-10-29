import { useState, useEffect } from 'react';
import './WaterTimer.css';
import Button from '../reusableComponents/Button';
import NumDisplay from '../reusableComponents/NumericalDisplay';
import TextBox from '../reusableComponents/TextBox';
import ReactSlider from "react-slider";
import { WebsocketServers } from '../tools/Websocket';
import CultivationValues from '../tools/CultivationValues';
import config from '../config.json';


const WaterTimer = () => {

    const [pumpEnabledState, pumpEnabledStateSet] = useState(0);

    useEffect(() => {
        WebsocketServers[0].send({action:"state", data: "pumps"});
        window.addEventListener(CultivationValues["pump"].enabled.event, () => {
            if (CultivationValues["pump"].enabled.value === true) {
                pumpEnabledStateSet(1);
            } else {
                pumpEnabledStateSet(2);
            }
        });
    });

    return (
        <div className="WaterTimer">
            <div className="WaterTimerSelector">
                <div className="WaterTimerSelectorFrequency">
                    <ReactSlider
                        className="WaterTimerSelectorFrequencySlider"
                        thumbClassName="WaterTimerSelectorFrequencySliderThumb"
                        trackClassName="WaterTimerSelectorFrequencySliderTrack"
                        orientation="vertical"
                        invert
                        max={config.water_max_frequency}
                        min={1}
                        disabled={((pumpEnabledState === 2) ? false : true)}
                        defaultValue={CultivationValues["pump_period_freq"]["value"].value}
                        onChange={(value) => {
                            CultivationValues["pump_period_freq"]["value"].setValue(value);
                        }}
                    />
                </div>
                <div className="WaterTimerSelectorDisplay">
                    <div className="WaterTimerSelectorDisplayFrequency">
                        <NumDisplay
                            param={CultivationValues["pump_period_freq"]["value"]}
                            unit="/d"
                        ></NumDisplay>
                    </div>
                    <div className="WaterTimerSelectorDisplayDivider">
                        <TextBox
                            text="Water automation"
                            backgroundColor="rgb(55, 55, 55)"
                            fontColor="#ffffff"
                        ></TextBox>
                    </div>
                    <div className="WaterTimerSelectorDisplayPeriod">
                        <NumDisplay
                            param={CultivationValues["pump_period_period"]["value"]}
                            unit="s"
                        ></NumDisplay>
                    </div>
                </div>
                <div className="WaterTimerSelectorPeriod">
                    <ReactSlider
                        className="WaterTimerSelectorPeriodSlider"
                        thumbClassName="WaterTimerSelectorPeriodSliderThumb"
                        trackClassName="WaterTimerSelectorPeriodSliderTrack"
                        orientation="vertical"
                        invert
                        max={config.water_max_period}
                        min={1}
                        disabled={((pumpEnabledState === 2) ? false : true)}
                        defaultValue={CultivationValues["pump_period_period"]["value"].value}
                        onChange={(value) => {
                            CultivationValues["pump_period_period"]["value"].setValue(value);
                        }}
                    />
                </div>
            </div>
            <div className="WaterTimerButtons">
                <div className="WaterTimerButtonEnable">
                    <Button
                        parentState = {pumpEnabledState}
                        stateConfig = {1}
                        color = "#456454"
                        enableColor = "#00fd7a"
                        onclick = {() => {
                            WebsocketServers[0].send({
                                action: "pump",
                                data: {
                                    state: "enable_period",
                                    freq: CultivationValues["pump_period_freq"]["value"].value,
                                    period: CultivationValues["pump_period_period"]["value"].value
                                }
                            });
                            pumpEnabledStateSet(1);
                        }}
                    ></Button>
                </div>
                <div className="WaterTimerButtonDisable">
                    <Button
                        parentState = {pumpEnabledState}
                        stateConfig = {2}
                        color = "#591515"
                        enableColor = "#ff1a1a"
                        onclick = {() => {
                            WebsocketServers[0].send({
                                action: "pump",
                                data: {
                                    state: "disable",
                                }
                            });
                            pumpEnabledStateSet(2);
                        }}
                    ></Button>
                </div>
            </div>
        </div>
    )
}

export default WaterTimer;
