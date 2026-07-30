"use client"
import { CarouselData } from "@/app/lib/types";
import {useRef} from "react"
import CarouselInner from "@/app/components/CarouselInner";

export default function CarouselBrowser({data}: {data: (CarouselData | null)[]}){
    const scroller = useRef<HTMLDivElement>(null)
    
    return (
    <section className="flex">
        <div className="bg-lime-500 min-w-[108px] md:min-w-[138px] text-neutral-900 font-medium text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px]
        w-[6.375rem] md:w-[8.625rem] py-3 px-2 md:px-4 flex justify-end items-center relative">
            <p className="before:content-[''] before:absolute before:w-[6px] before:h-[5px]
            before:rounded-full before:bg-neutral-900 before:bottom-[calc(50%-3px)] 
            before:left-[.5rem] md:before:left-[1rem] before:shadow-[0_0_0_2px_#42EB0502] uppercase">
                Live Markets
            </p>
        </div>
        <div
            ref={scroller} 
            className="scroller overflow-scroll scrollbar-none bg-neutral-700 text-neutral-0"
        >
            <CarouselInner 
                ratesData={data}
                scroller={scroller}
            />
        </div>
        </section>
    )
}