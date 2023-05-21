import React, { createRef, useEffect, RefObject } from 'react';
import './Slider.css';
import MotorValues from '../tools/MotorValues';

interface SliderProps {
    config: {
        variable: string,
        maxValue: number,
    }
}

const Slider = ( props: SliderProps ) => {
    
    let pass: {
        variable: string,
        maxValue: number,
    } = {
        variable: props.config.variable,
        maxValue: props.config.maxValue
    }
    
    const SliderEffectorHidRef: RefObject<HTMLDivElement> = createRef();
    const SliderEffectorTrackValueRef: RefObject<HTMLDivElement> = createRef();
    const SliderValueRef: RefObject<HTMLDivElement> = createRef();
    const SliderRealValueRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        SliderEffectorHidRef.current!.style.marginTop = "432px";
        SliderEffectorHidRef.current!.onmousedown = () => {
            SliderEffectorTrackValueRef.current!.style.position = "relative";
        }
        SliderEffectorTrackValueRef.current!.addEventListener('mousemove', (el) => {
            let position = `${(el.offsetY-40)}px`;
            if (el.offsetY > 56 && el.offsetY < 476) {
                SliderEffectorHidRef.current!.style.marginTop = position;
            }
            if (0 < el.offsetY && el.offsetY < 500) {
                let sliderVal = SliderEffectorHidRef.current!.style.marginTop;
                MotorValues[pass.variable] = Math.round(((417 - (parseInt(sliderVal)-18))*pass.maxValue/417)*10)/10;
                SliderRealValueRef.current!.innerText = MotorValues[pass.variable].toFixed(1).toString();
            }
        });
        
        SliderEffectorTrackValueRef.current!.onmouseup = () => {
            SliderEffectorTrackValueRef.current!.style.position = "absolute";
        }
        SliderEffectorTrackValueRef.current!.onmouseleave = () => {
            SliderEffectorTrackValueRef.current!.style.position = "absolute";
        }
        
    })
    
    return (
        <div className="Slider">
            <div className="SliderEffector">
                <div className="SliderEffectorGrid">
                    <div className="SliderEffectorTrack">
                    </div>
                </div>
                <div className="SliderEffectorHid" ref={SliderEffectorHidRef}>
                </div>
                <div className="SliderEffectorTrackValue" ref={SliderEffectorTrackValueRef}> 
                </div>
                <div className="SliderValue" ref={SliderValueRef}>
                    <div className="SliderRealValue" ref={SliderRealValueRef}>
                        {MotorValues[pass.variable].toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Slider;
