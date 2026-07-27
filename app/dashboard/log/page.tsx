"use client" 
import Image from "next/image";
import LogItem from "@/app/components/Log/LogItem";
import { LogEntry } from "@/app/types/types";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Temporal } from "@js-temporal/polyfill";
import IconDownload from "@/public/images/icon-download.svg"
import { createClient } from "@/app/lib/supabase/client";
import { downloadCSV, fetchLogEntries } from "@/app/lib/utils";

export default function Log(){
    const supabase = createClient()
    const [logEntries, setLogEntries] = useState<LogEntry[]>([])
    const [isPending, setIsPending] = useState<boolean>(false)

    const sortedEntries: LogEntry[] = useMemo(()=>{
        return [...logEntries].sort((a,b) => {return (Temporal.PlainDateTime.from(a.created_at).since(Temporal.PlainDateTime.from(b.created_at)).microseconds > 0 ? -1 : (
            Temporal.PlainDateTime.from(b.created_at).since(Temporal.PlainDateTime.from(a.created_at)).microseconds > 0 ? 1 : 0
        ))})
    }, [logEntries])

    const deleteEntry = useCallback(async(id: string) =>{
        const {error} = await supabase
            .from("log_entries")
            .delete()
            .eq("id", id)
        if(error){
            console.error("Error deleting log entry: ", error.message)
        }
    }, [supabase])

    async function deleteAllLogEntries(){
        const {data} = await supabase.auth.getUser()
        const {error} = await supabase
            .from("log_entries")
            .delete()
            .eq("user_id", data?.user?.id)
        if(error){
            console.error("Error deleting all log entries: ", error.message)
        }
    }

    useEffect(()=>{
        fetchLogEntries(setLogEntries)

        const logChannel = supabase
            .channel("log-changes")
            .on(
                'postgres_changes',{
                    event: "*",
                    schema: "public",
                    table: "log_entries"
                },
                () =>{
                    fetchLogEntries(setLogEntries)
                }
            )
            .subscribe()

        return () => {supabase.removeChannel(logChannel)}
    }, [])

    function download(){
        setIsPending(true)
        downloadCSV(sortedEntries)
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
                {sortedEntries.map(entry =>(
                    <LogItem key={entry.id} deleteEntry={deleteEntry} {...entry}/>
                ))}
            </div>
        </section>
    )
}