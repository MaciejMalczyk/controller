import { useState, useEffect } from 'react';
import './Main.css';
import Switch from './Switch';
import Loading from './Loading';
import RotationPanel from '../rotationPanel/RotationPanel';
import CultivationPanel from '../cultivationPanel/CultivationPanel';
import { WebsocketServers, InitWs } from '../tools/Websocket';
import config from '../config.json';

InitWs(config.backend_addr, 0);

const Main = () => {
    
    const [showRotation, setShowRotation] = useState(false);
    const [showCultivation, setShowCultivation] = useState(false);
    const [connected, setConnected] = useState(false);
    
    useEffect(()=>{
        window.addEventListener(WebsocketServers[0].connected.event, ()=>{
            setConnected(WebsocketServers[0].connected.value);
            console.log(WebsocketServers[0].connected)
        })
        document.title = config.title;
    })
    
    return (
        <div>
            <Loading
                connected={connected}
            ></Loading>
            <div id="MainGrid">
                <div id="Switches">
                    <Switch
                        name="RotationPanel"
                        icon="icon_rotation"
                        enabled={showRotation}
                        onclick={() => {
                            if (showRotation === false) {
                                setShowRotation(true);
                            } else {
                                setShowRotation(false);
                            }
                        }}
                    />
                    <Switch
                        name="CultivationPanel"
                        icon="icon_cultivation"
                        enabled={showCultivation}
                        onclick={() => {
                            if (showCultivation === false) {
                                setShowCultivation(true);
                            } else {
                                setShowCultivation(false);
                            }
                        }}
                    />
                </div>
                <div id="Panels">
                    { showRotation && <RotationPanel></RotationPanel> }
                    { showCultivation && <CultivationPanel></CultivationPanel> }
                </div>
            </div>
        </div>
    )
}

export default Main;
