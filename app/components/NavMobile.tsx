import { useState, useId, useEffect, memo } from "react"
import clsx from "clsx"
import Image from "next/image"
import ArrowDown from "@/public/images/angle-down.svg"

function NavMobile({children, pathname, favLength, logLength}: 
    {children: Readonly<React.ReactNode>, pathname: string, favLength: number, logLength: number}
){
    const [toggle, setToggle] = useState<boolean>(false)
    const id = useId()

    function getActiveText(){
        switch (pathname){
            case "/dashboard": return "history"
            case "/dashboard/compare": return "compare"
            case "/dashboard/favorites": return "favorites"
            case "/dashboard/log": return "log"
            default: return ""
        }
    }

    const stylesSpan = clsx(`relative text-inherit text-neutral-0 pr-4 py-[.675rem] uppercase 
            no-underline visited:no-underline visited:text-neutral-0 rounded-[.25rem]`, 
            (getActiveText()=== "favorites") && "after:content-[attr(data-fav)]",
            (getActiveText()=== "log") && "after:content-[attr(data-log)]",
            (getActiveText() === "favorites" || getActiveText()=== "log") && `pr-11 after:leading-[1] after:bg-lime-800 after:text-lime-500 after:text-[.625rem] after:tracking-[.5px] after:w-5 after:h-5
            after:rounded-full after:flex after:justify-center after:items-center after:absolute after:top-[50%] after:right-[1rem] after:translate-y-[-50%]`)
        
    useEffect(()=>{
        const closeMenu = (e: PointerEvent)=> {
            if(!(e.target instanceof HTMLElement)){
                return
            }
            if(e.target.dataset.menu){
                return
            }
            setToggle(false)
        }
        document.body.addEventListener("click", closeMenu)

        return () => { document.body.removeEventListener("click", closeMenu)}
    }, 
    [])
    return (
        <>
            <button data-menu className="flex items-center justify-between bg-neutral-700 text-inherit text-neutral-0 
            uppercase rounded-[.5rem] px-3 w-full border border-neutral-400"
            aria-expanded={toggle}
            aria-controls={id}
            aria-label={toggle ? "Close navigation toggle" : "Open navigation menu"}
            onClick={() => setToggle(prev => !prev)}
            >
                <span className={stylesSpan} data-fav={favLength} data-log={logLength}>
                    {getActiveText()}
                </span>
                <Image className={clsx(toggle && "rotate-180", "w-4")} src={ArrowDown} alt="" />
            </button>
            {toggle && (
                <nav data-menu id={id} className="shadow-menu p-2 rounded-[.75rem] absolute
                bg-neutral-600 bottom-[0px] left-0 w-full flex flex-col translate-y-[calc(100%+0.5rem)]">
                    {children}
                </nav>
            )}
        </>
    )
}

export default memo(NavMobile)