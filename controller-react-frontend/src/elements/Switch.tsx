import React, { createRef, useEffect, RefObject } from 'react';
import './Switch.css'; 
import Icons from '../tools/svg/Icons';

interface SwitchProps {
    config: {
        name?: string,
        icon?: string,
        onclick: () => void
    }
}

const Switch = ( props: SwitchProps ) => {
    
    let pass: {
        name: string,
        icon: string,
        onclick: () => void
    } = {
        name: props.config.name || "",
        icon: props.config.icon || "icon_missing",
        onclick: props.config.onclick || console.log("none")
    }
    
    const SwitchRef: RefObject<HTMLDivElement> = createRef();
    const SwitchIconRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (pass.onclick) {
            SwitchRef.current!.onclick = pass.onclick;
        }
        
        SwitchIconRef.current!.setAttribute("style",`
            -webkit-mask: url(${Icons[pass.icon]}) no-repeat center / contain;
            background-color: #373737;
        `);
    });
    
    return (
        <div className="Switch" id={pass.name} ref={SwitchRef}>
            <div className="SwitchIcon" ref={SwitchIconRef}>
            </div>
        </div>
    )
}

export default Switch;
