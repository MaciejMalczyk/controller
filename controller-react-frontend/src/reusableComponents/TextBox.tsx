import React, { createRef, useEffect, RefObject } from 'react';
import './TextBox.css';

const TextBox = ( props: 
    {text: string, backgroundColor: string, fontColor: string}
) => {
    
    const TextBoxRef: RefObject<HTMLDivElement> = createRef();
    const TextBoxTextRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (props.text) {
            TextBoxTextRef.current!.innerText = `${props.text}`;
        }
        if (props.backgroundColor) {
            TextBoxRef.current!.style.background = props.backgroundColor;
        }
        if (props.fontColor) {
            TextBoxTextRef.current!.style.color = props.fontColor;
        }
    });
        
    
    return(
        <div className="TextBox" ref={TextBoxRef}> 
            <div className="TextBoxText" ref={TextBoxTextRef}>{0}
            </div>
        </div>
    )
}

export default TextBox;
