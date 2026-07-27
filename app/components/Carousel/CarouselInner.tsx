"use client"
import {useEffect, useMemo, useRef, memo} from "react"
import type { CarouselData } from "@/app/types/types"
import CarouselItem from "@/app/components/Carousel/CarouselItem"
import {v4 as uuid} from "uuid"

function CarouselInner({ratesData}:{ratesData: Readonly<CarouselData[]>}){
    const data = useMemo(() => ratesData, [ratesData])
    const freshLoad = useRef(true)

    useEffect(()=>{
        const scroller = document.querySelector(".scroller")
        if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            addAnimation()
        }

        function addAnimation(){
            if(!scroller){
                return
            }
            
            scroller.setAttribute("data-animated", "true")
            const scrollerInner = scroller.querySelector(".scroller-inner")
            if(!scrollerInner){
                return
            }
            const scrollerContent = Array.from(scrollerInner.children) as HTMLElement[]

            scrollerContent.forEach(item => {
                const duplicatedItem= item.cloneNode(true) as HTMLElement
                duplicatedItem.setAttribute("aria-hidden", "true")
                scrollerInner.appendChild(duplicatedItem)
            })
        }
    }, [])

    useEffect(()=>{
        if(freshLoad.current === true){
            freshLoad.current = false
            return
        }

        const scroller = document.querySelector(".scroller")
        if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            refreshAnimation()
        }

        function refreshAnimation(){
            if(!scroller){
                return
            }
            
            const scrollerInner = scroller.querySelector(".scroller-inner")
            if(!scrollerInner){
                return
            }
            const duplicates = scrollerInner.querySelectorAll("[aria-hidden=true]")
            duplicates.forEach(item => {
                scrollerInner.removeChild(item)
            })

            const scrollerContent = Array.from(scrollerInner.children) as HTMLElement[]

            scrollerContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true) as HTMLElement
                duplicatedItem.setAttribute("aria-hidden", "true")
                scrollerInner.appendChild(duplicatedItem)
            })
        }
    }, [data])

    return (
        <div className="scroller-inner w-max flex" aria-live="polite">
          {data.map((item) => {
            return <CarouselItem key={uuid()} {...item} />
          })}  
        </div>
    )
}

export default memo(CarouselInner)