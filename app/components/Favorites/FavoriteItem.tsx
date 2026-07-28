import Image from "next/image";
import StarFilledLime from "@/public/images/icon-star-filled-lime.svg"
import ArrowRight from "@/public/images/icon-arrow-right.svg"
import { CarouselData, Favorite } from "@/app/types/types"
import clsx from "clsx";
import { useEffect, useState, memo, useTransition } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { fetchRates } from "@/app/lib/utils";
import { usePathname, useRouter } from "next/navigation";

function FavoriteItem({base, quote, removeFavorite}:
    {base: Favorite["base"], quote: Favorite["quote"], removeFavorite: (base: string, quote: string) => void }
){
    const pathname = usePathname()
    const {replace} = useRouter()
    const [isPending, startTransition] = useTransition()
    const [favData, setFavData] = useState<CarouselData | null>(null)

    function compareFavorites(){
        const searchParams = new URLSearchParams()
        searchParams.set("base", base)
        searchParams.set("quote", quote)
        startTransition(()=>{
            replace(`${pathname}?${searchParams.toString()}`)
        })
    }

    

    useEffect(()=>{
        async function fetchFavData(){
            try{
                const dateStart = Temporal.Now.plainDateISO().subtract({days: 2}).toString()
                const {data, error} = await fetchRates(`https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quote}&from=${dateStart}`)
                
                if(error || !data){
                    throw new Error(error)
                }
                
                const dataObj = {
                    ...data[data.length-1],
                    changes: data[0]?.rate !== 0 ? ((data[data.length-1].rate - data[0].rate) / data[0]?.rate * 100) : 0
                }
                setFavData(dataObj)
            }catch(error){
                if(typeof error === "string"){
                    console.error("Error: ", error)
                }else if(error instanceof Error){
                    console.error("Error: ", error.message)
                }else{
                    console.error("An unexpected error occured during fetching rates")
                }
            }
        }

        fetchFavData()
    }, [])

    if(!favData){
        return null
    }

    const stylesChanges = clsx("text-[.625rem]", (favData.changes >= 0.005) && "text-green-500", (favData.changes <= -0.005) && "text-red-500",
    (favData.changes < 0.005 && favData.changes > - 0.005) && "text-neutral-0")

    return (
        <div
            role="button"
            onClick={compareFavorites}
            aria-pressed={isPending}
            tabIndex={0}
            onKeyDown={(e)=>{
                if(e.key === "Enter" || e.key == " " || e.key === "Spacebar"){
                    compareFavorites()
                }
            }}
            aria-label={`Compare ${base} and ${quote}`}
            className="flex justify-between gap-3 p-3 md:px-4 bg-neutral-600 border border-neutral-500 rounded-[.625rem]">
            <div className="flex items-center gap-[.625rem] md:gap-5">
                <div className="leading-[1.2] w-fit flex items-center gap-2 text-[.875rem] text-neutral-0 tracking-[1px] uppercase">
                    <p>{base}</p>
                    <Image 
                        className="block" 
                        src={ArrowRight} alt={"converted to"}
                     />
                    <p>{quote}</p>
                </div>
            </div>
             <div className="flex items-center gap-[.625rem] md:gap-5">
                <div className="leading-[1.2] w-fit text-right flex flex-col gap-[.375rem]">
                    <p className="text-[1rem] text-neutral-0 tracking-[1px]">{favData.rate}</p>
                    <p className={stylesChanges}>
                        <span className="text-[.5rem]">{favData.changes >= 0.005 ? "▲ " : favData.changes <= -0.005 ? "▼ " : ""}</span>
                        {favData.changes.toFixed(2)}%
                    </p>
                </div>
                <button 
                    className="h-8 w-8 flex items-center justify-center rounded-[.5rem] border bg-neutral-600 border-lime-500"
                    onClick={(e) =>{ 
                        e.stopPropagation()
                        removeFavorite(base, quote)
                    }}
                    aria-label={`Remove conversion of ${base} to ${quote} from favorites`}>
                        <Image src={StarFilledLime} alt="Star filled"/>
                </button>
            </div>
        </div>
    )
}

export default memo(FavoriteItem)