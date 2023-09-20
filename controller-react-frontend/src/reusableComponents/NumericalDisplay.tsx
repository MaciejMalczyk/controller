import React, { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplay.css';

interface NumDisplayProps {
    config: {
        backgroundColor?: string,
        fontColor?: string,
        param?: any,
        unit?: string,
    }
}

const NumDisplay = ( props: NumDisplayProps ) => {
    
    let pass: {
        backgroundColor?: string,
        fontColor?: string,
        param: any,
        unit?: string,
    } = {
        backgroundColor: props.config.backgroundColor || "#373737",
        fontColor: props.config.fontColor || "#ffffff",
        param: props.config.param || 999,
        unit: props.config.unit || "/",
    }
    
    
    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValueRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayUnitRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(pass.param.event, () => {
            if (NumDisplayValueRef.current) {
                if (pass.param.value % 1 !== 0) {
                    NumDisplayValueRef.current!.innerText = `${pass.param.value.toFixed(2)}`;
                } else {
                    NumDisplayValueRef.current!.innerText = `${pass.param.value}`;
                }
            }
        });
        if (pass.backgroundColor) {
            NumDisplayRef.current!.style.background = pass.backgroundColor;
        }
        if (pass.fontColor) {
            NumDisplayValueRef.current!.style.color = pass.fontColor;
        }
        if (pass.unit) {
            NumDisplayUnitRef.current!.innerText = pass.unit;
        }
        
    });
    
    return(
        <div className="NumDisplay" ref={NumDisplayRef}> 
            <div className="NumDisplayValue" ref={NumDisplayValueRef}>{0}
            </div>
            <div className="NumDisplayUnit" ref={NumDisplayUnitRef}>{"/"}
            </div>
        </div>
    )
}

export default NumDisplay;
