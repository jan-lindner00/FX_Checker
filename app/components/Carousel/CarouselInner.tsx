"use client"
import {useEffect, useMemo, useRef, memo, RefObject} from "react"
import type { CarouselData } from "@/app/types/types"
import CarouselItem from "@/app/components/Carousel/CarouselItem"

function CarouselInner({ratesData, scroller}:
    {ratesData: (CarouselData | null)[], scroller: RefObject<HTMLDivElement | null>}
){
    const data = useMemo(() => ratesData, [ratesData])
    const freshLoad = useRef(true)
    const scrollerInner = useRef<HTMLDivElement>(null)

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
    }, [data])

    return (
        <div 
            ref={scrollerInner}
            className="scroller-inner w-max flex" 
            aria-live="polite"
        >
          {data.map((item) => {
            if(item !== null){
                return <CarouselItem key={item.base + item.quote} {...item} />
            }
          })}  
        </div>
    )
}

export default memo(CarouselInner)