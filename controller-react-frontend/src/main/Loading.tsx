import { createRef, RefObject, useEffect } from 'react';
import "./Loading.css";
import Icons from '../tools/svg/Icons';

interface LoadingProps {
    connected: boolean
}

const Loading = ({
    connected = false
}:LoadingProps) => {
    
    const LoadingRef: RefObject<HTMLDivElement> = createRef();
    const LoadingIconRef: RefObject<HTMLDivElement> = createRef();
    
    useEffect(() => {
        let blink: ReturnType<typeof setTimeout>
        let color = "a1beb0";
        if (!connected) {
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
            {!connected &&
            <div className="Loading" ref={LoadingRef}>
                <div className="LoadingContainer">
                    <div className="LoadingIcon" ref={LoadingIconRef}>
                    </div>
                    <div className="LoadingText">
                        No connection to controller...
                    </div>
                </div>
            </div>
            }
        </div>
    )
}

export default Loading;
