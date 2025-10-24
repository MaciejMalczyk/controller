import { createRef, useEffect, RefObject } from 'react';
import './NumericalDisplayVsV.css';

interface NumDisplayVsVProps {
    backgroundColor?: string,
    fontColor?: string,
    param1?: any,
    param2?: any,
}

const NumDisplayVsV = ( {
    backgroundColor = "#373737",
    fontColor = "#ffffff",
    param1 = 999,
    param2 = 999,
}: NumDisplayVsVProps ) => {

    const NumDisplayRef: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValue1Ref: RefObject<HTMLDivElement> = createRef();
    const NumDisplayValue2Ref: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        window.addEventListener(param1.event, () => {
            if (NumDisplayValue1Ref.current) {
                NumDisplayValue1Ref.current!.innerText = `${param1.value}/`;
            }
        });
        window.addEventListener(param2.event, () => {
            if (NumDisplayValue2Ref.current) {
                NumDisplayValue2Ref.current!.innerText = `${param2.value}`;
            }
        });
        if (backgroundColor) {
            NumDisplayRef.current!.style.background = backgroundColor;
        }
        if (fontColor) {
            NumDisplayValue1Ref.current!.style.color = fontColor;
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
