import clsx from "clsx";
import type { CarouselData } from "@/app/lib/types";
import {memo} from "react"

function CarouselItem({changes, quote, base, rate}: 
    {changes: CarouselData["changes"], quote: CarouselData["quote"], base: CarouselData["base"], rate: CarouselData["rate"]})
{
    const changesClsn = clsx(`relative before:absolute before:text-[.5rem] ml-[.75rem]
        before:top-[50%] before:translate-y-[-50%] before:left-[-1rem]`, 
        (changes <= -0.005) && "text-red-500 before:content-['▼']",
        (changes >= 0.005) && "text-green-500 before:content-['▲'] before:text-green-500",
    )
    return (
        <div className="flex gap-[.625rem] py-3 px-2 md:px-3 text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px]
            border-r border-neutral-500"
        >
            <span 
                className="text-neutral-200 uppercase"
                aria-label={`${base} to ${quote} exchange`}
            >
                {base}/{quote}
            </span>
            <span 
                className="text-neutral-0"
                aria-label={`Conversion rate is ${rate}`}
            >
                {rate}
            </span>
            <span 
                className={changesClsn}
                aria-label={`Difference to yesterday is ${changes.toFixed(2)} percent`}
            >
                {changes > 0 ? "+" : ""}{changes.toFixed(2)}%
            </span>
        </div>
    )
}

export default memo(CarouselItem)