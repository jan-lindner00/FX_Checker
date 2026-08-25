"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { memo } from "react";
import Image from "next/image";
import Checkmark from "@/public/images/icon-check.svg"

function CurrencyItem({selected, search, abbreviation, countryCode, name, startTransition}:
     {selected: boolean, search:string, abbreviation: string, countryCode: string, name: string, 
        startTransition: React.TransitionStartFunction}
){
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    function setSearchParams(){
        const params = new URLSearchParams(searchParams)
        if(search === "quote"){
            params.set("quote", abbreviation)
        }else{
            params.set("base", abbreviation)
        }
        startTransition(()=>{
            router.replace(`${pathname}?${params.toString()}`)
        })
    }

    return (
        <label>
            <div 
                data-dropdown={search}
                className="currency-select relative flex items-center justify-between py-2 md:py-3 px-2 hover:border hover:border-neutral-200"
            >
                <input
                    data-dropdown={search}
                    className="sr-only"
                    type="radio"
                    checked={selected}
                    name={`currency-${search}`} 
                    aria-label={`Select currency ${abbreviation} from country ${abbreviation}`}
                    onChange={setSearchParams}
                 />
                <div  data-dropdown={search} className="flex items-center gap-3">
                    <Image 
                        data-dropdown={search}
                        className="w-5 rounded-full pointer-events-none"
                        src={`/images/flags/${countryCode.toLowerCase()}.webp`}
                        alt=""
                        width={200}
                        height={200}
                    />
                    <span 
                    data-dropdown={search}
                    className="text-neutral-0 text-[.875rem] leading-[1.2] tracking-[1px]">{abbreviation}</span>
                    <span 
                    data-dropdown={search}
                    className="text-neutral-200 text-[.75rem] leading-[1.2] tracking-[.5px]">{name}</span>
                </div>
                {selected && <Image data-dropdown={search} src={Checkmark} alt="" />}
            </div>
        </label>
    )
}

export default memo(CurrencyItem)