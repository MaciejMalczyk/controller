import { createRef, useEffect, RefObject } from 'react';
import './Button.css';

interface ButtonProps {
    parentState?: number,
    stateConfig?: number,
    color?: string,
    enableColor?: string,
    onclick?: () => void
}

const Button = ({
    parentState = 0,
    stateConfig = 0,
    color = "#373737",
    enableColor = "#373737",
    onclick,
}: ButtonProps) => {
    
    
    const ButtonRef: RefObject<HTMLDivElement> = createRef();
    const ButtonDivRef: RefObject<HTMLDivElement> = createRef();
    const ButtonEnabledRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (color) {
            ButtonRef.current!.style.background = color;
        }
        
        if (enableColor) {
            ButtonEnabledRef.current!.style.background = enableColor;
        }
        
        if (parentState === stateConfig) {
            
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
                onclick!();
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
