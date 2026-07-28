"use client"
import { useCallback } from "react"
import FavoriteItem from "@/components/Favorites/FavoriteItem"
import supabaseClient from "@/lib/supabase/client"
import { useSubscribeFavorites } from "@/lib/hooks/useSubscription"

export default function Favorites(){
    const favorites = useSubscribeFavorites()

    const removeFavorite = useCallback(async (base: string, quote: string)=>{
        const {error} = await supabaseClient
            .from("favorites")
            .delete()
            .eq("base", base)
            .eq("quote", quote)
        if(error){
            console.error("Error deleting item from favorites: ", error.message)
        }
    },[])

    if(favorites.length === 0){
        return (
            <div className="py-[2.5rem] text-center flex flex-col items-center gap-4">
                <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">No pinned pairs yet</h3>
                <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
                    {"Pin a pair to track its rate here. Tap the star icon on any conversion or comparison row."}
                </span>
            </div>
        )
    }

    return (
        <section className="bg-neutral-700 border border-neutral-600 p-4 md:p-5 mt-5 rounded-[1rem]">
            <div className="flex gap-y-[.625rem] gap-x-[.875rem] flex-wrap justify-between leading-[1.2]
            mb-4 md:mb-5 items-center text-neutral-0 uppercase">
                <h3 className="text-[1rem] text-neutral-0 text-medium w-fit">
                    Pinned Pairs
                </h3>
                <span className="text-[.75rem] tracking-[.5px] text-neutral-200">{favorites.length} {favorites.length === 1 ? "Favorite": "Favorites"}</span>
            </div>
            <div className="grid grid-col-1 gap-3 h-max">
                {favorites.map((data) => (
                    <FavoriteItem key={data.base + data.quote} removeFavorite={removeFavorite} {...data} />
                ))}
            </div>
        </section>
    )
}