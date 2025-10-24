import { createRef, useEffect, RefObject } from 'react';
import './TextBox.css';

interface TextBoxProps {
    text: string,
    backgroundColor: string,
    fontColor: string
}

const TextBox = ({
    text = "None",
    backgroundColor = "black",
    fontColor = "white"
}: TextBoxProps ) => {
    
    const TextBoxRef: RefObject<HTMLDivElement> = createRef();
    const TextBoxTextRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        if (text) {
            TextBoxTextRef.current!.innerText = `${text}`;
        }
        if (backgroundColor) {
            TextBoxRef.current!.style.background = backgroundColor;
        }
        if (fontColor) {
            TextBoxTextRef.current!.style.color = fontColor;
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
