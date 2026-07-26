"use client"
import { CurrencyCompare, Favorite } from "@/app/types/types";
import Image from "next/image";
import { useMemo, memo } from "react";
import StarEmpty from "@/public/images/icon-star.svg"
import StarFilledLime from "@/public/images/icon-star-filled-lime.svg"
import clsx from "clsx";
import { formatCurrency, handleFavChange } from "@/app/lib/utils";

function CompareItem({base, countryCode, abbreviation, rate, name, favorites}:
    {base: string, countryCode: CurrencyCompare["countryCode"], abbreviation: CurrencyCompare["abbreviation"],
        rate: CurrencyCompare["rate"], name: CurrencyCompare["name"], favorites: Favorite[]
    }){

    const isFavorite = useMemo(()=>{
        return (favorites.find((fav: Favorite)=> (fav.base === base && fav.quote === abbreviation)) !== undefined)
    }, [favorites, base, abbreviation])

    const stylesFavBtn = clsx("h-8 w-8 flex items-center justify-center rounded-[.5rem] border bg-neutral-600",
        isFavorite && "border-lime-500", !isFavorite && "border-neutral-500"
    )

    return (
        <div className="flex justify-between gap-3 p-3 md:px-4 bg-neutral-600 border border-neutral-500 rounded-[.625rem]">
            <div className="flex items-center gap-[.625rem] md:gap-5">
                <Image className="block w-5 rounded-full" 
                src={`/images/flags/${countryCode.toLowerCase()}.webp`} alt={`Flag of ${countryCode}`} width={200} height={200} />
                <div className="leading-[1.2] w-fit flex flex-col gap-[.375rem]">
                    <p className="text-[.875rem] text-neutral-0 tracking-[1px]">{abbreviation}</p>
                    <p className="text-[.75rem] text-neutral-200 tracking-[.5px]">{name}</p>
                </div>
            </div>
             <div className="flex items-center gap-[.625rem] md:gap-5">
                <div className="leading-[1.2] w-fit text-right flex flex-col gap-[.375rem]">
                    <p className="text-[1rem] text-neutral-0 tracking-[1px]">{formatCurrency((rate*1000).toFixed(2))}</p>
                    <p className="text-[.625rem] text-neutral-200">@ {rate}</p>
                </div>
                <button 
                    className={stylesFavBtn}
                    onClick={() => handleFavChange(base, abbreviation, isFavorite)}
                    aria-label={isFavorite ? `Remove exchange rate of ${base} to ${abbreviation} from favorites` 
                    : `Add exchange rate of ${base} to ${abbreviation} to favorites`}>
                        <Image src={isFavorite ? StarFilledLime : StarEmpty} alt={isFavorite ? "Star filled": "Star empty"}/>
                </button>
            </div>
        </div>
    )
}

export default memo(CompareItem)