import { createRef, useEffect, RefObject } from 'react';
import './Switch.css'; 
import Icons from '../tools/svg/Icons';

interface SwitchProps {
    name?: string,
    icon?: string,
    onclick: () => void,
    enabled: any,
}

const Switch = ({
    name = "",
    icon = "icon_missing",
    onclick = () => {},
    enabled = 0,
}: SwitchProps ) => {

    const SwitchRef: RefObject<HTMLDivElement> = createRef();
    const SwitchIconRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (onclick) {
            SwitchRef.current!.onclick = () => {
                onclick();
            }
        }
        
        SwitchIconRef.current!.setAttribute("style",`
            -webkit-mask: url(${Icons[icon]}) no-repeat center / contain;
            background-color: ${((enabled ? "#ffffff" : "#373737"))};
        `);
    });
    
    return (
        <div className="Switch" id={name} ref={SwitchRef}>
            <div className="SwitchIcon" ref={SwitchIconRef}>
            </div>
        </div>
    )
}

export default Switch;
