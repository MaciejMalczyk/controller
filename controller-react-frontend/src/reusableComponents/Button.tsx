import React, { createRef, useEffect, RefObject } from 'react';
import './Button.css';

interface ButtonProps {
    config: {
        parentState?: number,
        stateConfig?: number,
        color?: string,
        enableColor?: string,
        onclick?: () => void
    }
}

const Button = ( props: ButtonProps) => {
    
    let pass: {
        parentState?: number,
        stateConfig?: number,
        color?: string,
        enableColor?: string,
        onclick?: () => void
    } = {
        parentState: props.config.parentState || 0,
        stateConfig: props.config.stateConfig || 0,
        color: props.config.color || "#373737",
        enableColor: props.config.enableColor || "#373737",
        onclick: props.config.onclick
    }
    
    const ButtonRef: RefObject<HTMLDivElement> = createRef();
    const ButtonDivRef: RefObject<HTMLDivElement> = createRef();
    const ButtonEnabledRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (pass.color) {
            ButtonRef.current!.style.background = pass.color;
        }
        
        if (pass.enableColor) {
            ButtonEnabledRef.current!.style.background = pass.enableColor;
        }
        
        if (pass.parentState === pass.stateConfig) {
            
            ButtonRef.current!.style.opacity = "0";
            ButtonEnabledRef.current!.style.opacity = "1";
            
            ButtonDivRef.current!.onmouseover = () => {};
            ButtonDivRef.current!.onmouseleave = () => {};
            
        } else {
            ButtonRef.current!.style.opacity = "1";
            ButtonEnabledRef.current!.style.opacity = "0";
            
            ButtonDivRef.current!.onmouseover = () => {
                ButtonRef.current!.style.opacity = "0.8";
                ButtonEnabledRef.current!.style.opacity = "0.2";
            }
            
            ButtonDivRef.current!.onmouseleave = () => {
                ButtonRef.current!.style.opacity = "1";
                ButtonEnabledRef.current!.style.opacity = "0";
            }
            
            ButtonEnabledRef.current!.onclick = () => {
                pass.onclick!();
            }
        }
    });
    
    return(
        <div className="ButtonDiv" ref={ButtonDivRef}> 
            <div className="Button" ref={ButtonRef}>
            </div>
            <div className="ButtonEnabled" ref={ButtonEnabledRef}>
            </div>
        </div>
    )
}

export default Button;
