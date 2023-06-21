import React, { createRef, useEffect, RefObject } from 'react';
import './Slider.css';
import MotorValues from '../tools/MotorValues';

interface SliderProps {
    config: {
        variable: number,
        maxValue: number,
    }
}

const Slider = ( props: SliderProps ) => {
    
    let pass: {
        variable: number,
        maxValue: number,
    } = {
        variable: props.config.variable,
        maxValue: props.config.maxValue
    }
    
    const SliderRef: RefObject<HTMLDivElement> = createRef();
    const SliderHidRef: RefObject<HTMLDivElement> = createRef();
    const SliderTrackValueRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        let height = SliderRef.current!.offsetHeight - 80;
        SliderHidRef.current!.style.marginTop = `${height}px`;
        
        SliderHidRef.current!.onmousedown = () => {
            SliderTrackValueRef.current!.style.position = "relative";
        }
        SliderHidRef.current!.onmouseup = () => {
            SliderTrackValueRef.current!.style.position = "absolute";
        }
        
        SliderTrackValueRef.current!.onmouseup = () => {
            SliderTrackValueRef.current!.style.position = "absolute";
        }
        SliderTrackValueRef.current!.onmouseleave = () => {
            SliderTrackValueRef.current!.style.position = "absolute";
        }
        
        SliderTrackValueRef.current!.addEventListener('mousemove', (el) => {
            let position = `${(el.offsetY-40)}px`;
            if (el.offsetY >= 40 && el.offsetY <= height+40) {
                SliderHidRef.current!.style.marginTop = position;
                let sliderVal = SliderHidRef.current!.style.marginTop;
                MotorValues[pass.variable].velocity.setValue(Math.round(((height - (parseInt(sliderVal)))*pass.maxValue/height)*10)/10);
            }
        });
        
    })
    
    return (
        <div className="Slider" ref={SliderRef}>
            <div className="SliderHid" ref={SliderHidRef}>
            </div>
            <div className="SliderTrackGrid">
                <div className="SliderTrack"></div>
                <div className="SliderTrackValue" ref={SliderTrackValueRef}></div>
            </div>
        </div>
    )
}

export default Slider;
