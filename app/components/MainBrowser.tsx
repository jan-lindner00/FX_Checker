"use client"
import { useState, useEffect } from "react"
import { createClient } from "@/app/lib/supabase/client"
import { Favorite, LogEntry } from "@/app/types/types"
import Conversion from "@/app/components/Conversion/Conversion"
import Menu from "@/app/components/Menu"
import { fetchFavorites, fetchLogEntries } from "@/app/lib/utils"


export default function MainBrowser(){
    const supabase = createClient()
    const [favorites, setFavorites] = useState<Favorite[]>([])
    const [logEntries, setLogEntries] = useState<LogEntry[]>([])

    useEffect(()=>{
        fetchFavorites(setFavorites)

        const favChannel = supabase
            .channel("fav-changes-main")
            .on(
                'postgres_changes',{
                    event: "*",
                    schema: "public",
                    table: "favorites"
                },
                () =>{
                    fetchFavorites(setFavorites)
                }
            )
            .subscribe()

        return () => {supabase.removeChannel(favChannel)}
    }, [])

    useEffect(()=>{
        fetchLogEntries(setLogEntries)

        const logChannel = supabase
            .channel("log-changes-main")
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

    return (
        <>
            <Conversion favorites={favorites}/>
            <Menu favorites={favorites} logEntries={logEntries}/>
        </>
    )
}