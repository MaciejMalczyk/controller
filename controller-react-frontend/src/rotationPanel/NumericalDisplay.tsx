import React, { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplay.css';
import MotorValues from '../tools/MotorValues';

interface NumDisplayProps {
    config: {
        backgroundColor?: string,
        fontColor?: string,
        variable?: string,
    }
}

const NumDisplay = ( props: NumDisplayProps ) => {
    
    let pass: {
        backgroundColor?: string,
        fontColor?: string,
        variable: string,
    } = {
        backgroundColor: props.config.backgroundColor || "#373737",
        fontColor: props.config.fontColor || "#ffffff",
        variable: props.config.variable || "999",
    }
    
    
    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValueRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(MotorValues[pass.variable].event, () => {
            if (NumDisplayValueRef.current) {
                NumDisplayValueRef.current!.innerText = `${MotorValues[pass.variable].value}`;
            }
        });
        if (pass.backgroundColor) {
            NumDisplayRef.current!.style.background = pass.backgroundColor;
        }
        if (pass.fontColor) {
            NumDisplayValueRef.current!.style.color = pass.fontColor;
        }
        
    });
    
    return(
        <div className="NumDisplay" ref={NumDisplayRef}> 
            <div className="NumDisplayValue" ref={NumDisplayValueRef}>{0}
            </div>
        </div>
    )
}

export default NumDisplay;
