"use client"
import {useEffect, useMemo, useRef, memo, RefObject} from "react"
import type { CarouselData } from "@/app/lib/types"
import CarouselItem from "@/app/components/CarouselItem"

function CarouselInner({ratesData, scroller}:
    {ratesData: (CarouselData | null)[], scroller: RefObject<HTMLDivElement | null>}
){
    const data = useMemo(() => ratesData, [ratesData])
    const freshLoad = useRef(true)
    const scrollerInner = useRef<HTMLDivElement>(null)
    const scrollerInnerCurrent = scrollerInner.current

    useEffect(()=>{
        if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            addAnimation()
        }

        function addAnimation(){
            if(!scroller.current){
                return
            }
            
            scroller.current.setAttribute("data-animated", "true")
            if(!scrollerInner.current){
                return
            }
            const scrollerContent = Array.from(scrollerInner.current.children) as HTMLElement[]

            scrollerContent.forEach(item => {
                const duplicatedItem= item.cloneNode(true) as HTMLElement
                duplicatedItem.setAttribute("aria-hidden", "true")
                scrollerInner.current?.appendChild(duplicatedItem)
            })
        }

        return () => {
            const duplicates = scrollerInnerCurrent?.querySelectorAll("[aria-hidden=true]")
            duplicates?.forEach(item => {
                scrollerInnerCurrent?.removeChild(item)
            })
        }
    }, [])

    useEffect(()=>{
        if(freshLoad.current === true){
            freshLoad.current = false
            return
        }

        if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            refreshAnimation()
        }

        function refreshAnimation(){
            if(!scroller.current){
                return
            }
            if(!scrollerInner.current){
                return
            }
            const duplicates = scrollerInner.current.querySelectorAll("[aria-hidden=true]")
            duplicates.forEach(item => {
                scrollerInner.current?.removeChild(item)
            })

            const scrollerContent = Array.from(scrollerInner.current.children) as HTMLElement[]

            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true) as HTMLElement
                duplicatedItem.setAttribute("aria-hidden", "true")
                scrollerInner.current?.appendChild(duplicatedItem)
            })
        }

        return () => {
            const duplicates = scrollerInnerCurrent?.querySelectorAll("[aria-hidden=true]")
            duplicates?.forEach(item => {
                scrollerInnerCurrent?.removeChild(item)
            })
        }
    }, [data])

    return (
        <div 
            ref={scrollerInner}
            className="scroller-inner w-max flex" 
            aria-live="polite"
        >
          {data.map((item) => {
            return item ? <CarouselItem key={item.base + item.quote} {...item} /> : null
          })}  
        </div>
    )
}

export default memo(CarouselInner)