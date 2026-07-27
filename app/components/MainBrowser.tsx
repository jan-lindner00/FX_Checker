"use client"
import Conversion from "@/app/components/Conversion/Conversion"
import Menu from "@/app/components/Menu"
import { useSubscribeFavorites, useSubscribeLog } from "@/app/lib/hooks/useSubscription"


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