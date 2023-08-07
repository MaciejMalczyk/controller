import React, { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplayVsV.css';

interface NumDisplayVsVProps {
    config: {
        backgroundColor?: string,
        fontColor?: string,
        param1?: any,
        param2?: any,
    }
}

const NumDisplayVsV = ( props: NumDisplayVsVProps ) => {
    
    let pass: {
        backgroundColor?: string,
        fontColor?: string,
        param1: any,
        param2: any,
    } = {
        backgroundColor: props.config.backgroundColor || "#373737",
        fontColor: props.config.fontColor || "#ffffff",
        param1: props.config.param1 || 999,
        param2: props.config.param2 || 999,
    }
    
    
    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValue1Ref: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValue2Ref: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(pass.param1.event, () => {
            if (NumDisplayValue1Ref.current) {
                NumDisplayValue1Ref.current!.innerText = `${pass.param1.value}/`;
            }
        });
        window.addEventListener(pass.param2.event, () => {
            if (NumDisplayValue2Ref.current) {
                NumDisplayValue2Ref.current!.innerText = `${pass.param2.value}`;
            }
        });
        if (pass.backgroundColor) {
            NumDisplayRef.current!.style.background = pass.backgroundColor;
        }
        if (pass.fontColor) {
            NumDisplayValue1Ref.current!.style.color = pass.fontColor;
        }
        
    });
    
    return(
        <div className="NumDisplayVsV" ref={NumDisplayRef}> 
            <div className="NumDisplayVsVValue" ref={NumDisplayValue1Ref}>{0}{"/"}</div>
            <div className="NumDisplayVsVValue" ref={NumDisplayValue2Ref}>{0}</div>
        </div>
    )
}

export default NumDisplayVsV;
