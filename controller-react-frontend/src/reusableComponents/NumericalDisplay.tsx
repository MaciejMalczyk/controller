import React, { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplay.css';

type NumDisplayProps = {
    backgroundColor?: string,
    fontColor?: string,
    param: any,
    unit?: string,
    fixedPositions?: number,
};

const NumDisplay = ({
    backgroundColor = "#373737",
    fontColor = "#ffffff",
    param = 999,
    unit = "/",
    fixedPositions = 2,
}: NumDisplayProps ) => {    
    
    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValueRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayUnitRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(param.event, () => {
            if (NumDisplayValueRef.current) {
                if (param.value % 1 !== 0) {
                    NumDisplayValueRef.current!.innerText = `${param.value.toFixed(fixedPositions)}`;
                } else {
                    NumDisplayValueRef.current!.innerText = `${param.value}`;
                }
            }
        });
        if (backgroundColor) {
            NumDisplayRef.current!.style.background = backgroundColor;
        }
        if (fontColor) {
            NumDisplayValueRef.current!.style.color = fontColor;
        }
        if (unit) {
            NumDisplayUnitRef.current!.innerText = unit;
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
