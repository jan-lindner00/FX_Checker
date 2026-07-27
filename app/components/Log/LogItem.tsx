import { LogEntry} from "@/app/types/types";
import Image from "next/image";
import DeleteIcon from "@/public/images/icon-delete.svg"
import ArrowRight from "@/public/images/icon-arrow-right.svg"
import { formatCurrency } from "@/app/lib/utils";
import { Temporal } from "@js-temporal/polyfill";
import { memo } from "react";

function LogItem({id, created_at, base, quote, base_amount, receive_amount, deleteEntry }:
    {id: LogEntry["id"], created_at: LogEntry["created_at"], base: LogEntry["base"], quote: LogEntry["quote"],
        base_amount: LogEntry["base_amount"], receive_amount: LogEntry["receive_amount"], deleteEntry: (id: string) => void }
){
    function calcTimeSince(){
        const timeCreated = Temporal.PlainDateTime.from(created_at)
        const timeNow = Temporal.Now.plainDateTimeISO()
        const yearsSince = timeNow.since(timeCreated).years
        if(yearsSince > 0){
            return yearsSince + "Y"
        }
        const hoursSince = timeNow.since(timeCreated).hours
        if(hoursSince > 24){
            return timeCreated.toLocaleString("en-GB", {day: "2-digit", month: "short"})
        }
        if(hoursSince > 0){
            return hoursSince + "H"
        }
        const minutesSince = timeNow.since(timeCreated).minutes
        if(minutesSince > 0){
            return minutesSince + "M"
        }
        return "Now"
    }

    return (
        <div className="flex justify-between gap-3 md:gap-4 p-3 md:px-4 md:py-5
         bg-neutral-600 border border-neutral-500 rounded-[.625rem]">
            <div className="flex flex-col md:grid md:grid-cols-[4rem_1fr] items-start md:items-center gap-1 md:gap-4">
                <p className="text-[.875rem] tracking-[1px] leading-[1.2] text-neutral-200">
                    {calcTimeSince()}
                </p>
                <div className="leading-[1.2] w-fit flex items-center gap-2 text-[.875rem] text-neutral-0 tracking-[1px] uppercase">
                    <p>{base}</p>
                    <Image 
                        className="block" 
                        src={ArrowRight} alt={"converted to"}
                     />
                    <p>{quote}</p>
                </div>
            </div>
             <div className="flex items-center gap-[.625rem] md:gap-4">
                <div className="w-fit text-right flex flex-col gap-[calc(2rem/16)] md:flex-row gap-x-5 tracking-[1px] text-[1rem] leading-[1.2]">
                    <p className="text-neutral-0">{formatCurrency(base_amount)}</p>
                    <p className="text-lime-500">{formatCurrency(receive_amount)}</p>
                </div>
                <button 
                    className="h-8 w-8 flex items-center justify-center rounded-[.5rem] hover:bg-neutral-500 border bg-neutral-600 border-neutral-500"
                    onClick={() => deleteEntry(id)}
                    aria-label="Delete this log entry"
                >
                        <Image src={DeleteIcon} alt="Bin"/>
                </button>
            </div>
        </div>
    )
}

export default memo(LogItem)