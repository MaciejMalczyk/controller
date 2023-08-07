import React, { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplay.css';

interface NumDisplayProps {
    config: {
        backgroundColor?: string,
        fontColor?: string,
        param?: any,
    }
}

const NumDisplay = ( props: NumDisplayProps ) => {
    
    let pass: {
        backgroundColor?: string,
        fontColor?: string,
        param: any,
    } = {
        backgroundColor: props.config.backgroundColor || "#373737",
        fontColor: props.config.fontColor || "#ffffff",
        param: props.config.param || 999,
    }
    
    
    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValueRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(pass.param.event, () => {
            if (NumDisplayValueRef.current) {
                NumDisplayValueRef.current!.innerText = `${pass.param.value}`;
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
