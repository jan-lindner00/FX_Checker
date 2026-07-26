import clsx from "clsx";
import {memo} from "react"

function HistoryInfoCard({heading, value, changed=0, percent=false}: 
    {heading: string, value: number, changed?: number, percent?: boolean}){
    return(
        <div className="flex flex-col gap-5 px-5 py-3 rounded-[1rem] w-full md:w-max 
        bg-neutral-700 text-neutral-100 text-[.875rem] leading-[1.2] tracking-[1px]
        border border-neutral-600 uppercase">
            <p>{heading}</p>
            <p className={clsx("text-[1.25rem] tracking-[-.5px]",(changed===0) && "text-neutral-0",
                 (changed > 0) && "text-green-500", (changed < 0) && "text-red-500")}
            >
                <span className="text-[1rem]">{(changed > 0) ? "▲ " : (changed < 0) ? "▼ ": ""}</span>
                {(changed > 0)&& "+"}
                {percent? value.toFixed(2) : value.toFixed(4)}{percent && "%"}
            </p>
        </div>
    )
}

export default memo(HistoryInfoCard)