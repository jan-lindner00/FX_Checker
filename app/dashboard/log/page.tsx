"use client" 
import Image from "next/image";
import LogItem from "@/app/components/LogItem";
import { useCallback, useState } from "react";
import IconDownload from "@/public/images/icon-download.svg"
import supabaseClient from "@/app/lib/supabase/client";
import { trySupabase } from "@/app/lib/utils";
import { downloadCSV } from "@/app/lib/clientUtils";
import { useSubscribeLog } from "@/app/lib/hooks/useSubscription";

export default function Log(){
    const logEntries = useSubscribeLog()
    const [isPending, setIsPending] = useState<boolean>(false)

    const deleteEntry = useCallback(async(id: string) =>{
        await trySupabase(() => (
            supabaseClient
                .from("log_entries")
                .delete()
                .eq("id", id)
            )
        )
    }, [])

    async function deleteAllLogEntries(){
        const {data} = await supabaseClient.auth.getUser()
        if(!data?.user?.id){
            return
        }
        await trySupabase(() => (
            supabaseClient
                .from("log_entries")
                .delete()
                .eq("user_id", data.user.id)
        ))
    }

    function download(){
        setIsPending(true)
        downloadCSV(logEntries)
        setIsPending(false)
    }
    
    if(logEntries.length === 0){
        return (
             <div className="py-[2.5rem] text-center flex flex-col items-center gap-4">
                <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">No conversions logged yet</h3>
                <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
                    {"Every conversion is recorded here automatically when you tap LOG CONVERSION. Your log is private to this session and this browser."}
                </span>
            </div>
        )
    }

    return (
        <section className="bg-neutral-700 border border-neutral-600 p-4 md:p-5 mt-5 rounded-[1rem]">
            <div className="flex gap-[.625rem] md:gap-[.875rem] items-start flex-col md:flex-row md:items-center md:justify-between leading-[1.2]
            mb-4 md:mb-5 items-center text-neutral-0 uppercase">
                <h3 className="text-[1rem] text-neutral-0 text-medium w-fit">
                    Conversion log
                </h3>
                <div className="w-full md:w-fit flex justify-between items-center gap-4">
                    <span className="text-[.75rem] tracking-[.5px] text-neutral-200">
                        {logEntries.length} logged
                    </span>
                    <div className="flex gap-3 items-center">
                        <button className="w-9 h-9 flex justify-center items-center
                        tracking-[.5px] text-neutral-200 bg-neutral-600 hover:bg-neutral-700 border border-neutral-400 rounded-[.5rem]"
                        onClick={download}
                        disabled={isPending}
                        aria-disabled={isPending}
                        aria-label="Export log to .csv"
                        >
                            <Image src={IconDownload} alt="Download" className="w-5" />
                        </button>
                        <button className="px-3 py-2 text-[.75rem] 
                        tracking-[.5px] text-neutral-200 bg-neutral-600 hover:bg-neutral-700 border border-neutral-400 rounded-[.5rem]"
                        onClick={deleteAllLogEntries}
                        disabled={isPending}
                        aria-disabled={isPending}
                        >
                            clear all
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-col-1 gap-3 h-max">
                {logEntries.map(entry =>(
                    <LogItem key={entry.id} deleteEntry={deleteEntry} {...entry}/>
                ))}
            </div>
        </section>
    )
}