"use client"
import Conversion from "@/components/Conversion/Conversion"
import Menu from "@/components/Menu"
import { useSubscribeFavorites, useSubscribeLog } from "@/lib/hooks/useSubscription"


export default function MainBrowser(){
    const favorites = useSubscribeFavorites()
    const logEntries = useSubscribeLog()

    return (
        <>
            <Conversion favorites={favorites}/>
            <Menu favorites={favorites} logEntries={logEntries}/>
        </>
    )
}