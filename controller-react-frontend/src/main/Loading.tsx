import React, { createRef, RefObject, useEffect } from 'react';
import "./Loading.css";
import Icons from '../tools/svg/Icons';

const Loading = (props: 
    {connected: boolean}
) => {
    
    const LoadingRef: RefObject<HTMLDivElement> = createRef();
    const LoadingIconRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        let blink: ReturnType<typeof setTimeout>
        let color = "a1beb0";
        if (!props.connected) {
            LoadingIconRef.current!.setAttribute("style",`
                -webkit-mask: url(${Icons["icon_rotation"]}) no-repeat center / contain;
                background-color: ${("#ffffff")};
            `);
            blink = setInterval(()=>{
                if (color === "#a1beb0") {
                    LoadingIconRef.current!.style.backgroundColor = "#a1beb0";
                    color = "#ffffff";
                } else {
                    LoadingIconRef.current!.style.backgroundColor = "#ffffff";
                    color = "#a1beb0";
                }
            }, 1000)
        }
        
        return () => {
            clearInterval(blink);
        }
    })
    
    return(
        <div>
            {!props.connected && 
            <div className="Loading" ref={LoadingRef}>
                <div className="LoadingIcon" ref={LoadingIconRef}>
                </div>
            </div>
            }
        </div>
    )
}

export default Loading;
