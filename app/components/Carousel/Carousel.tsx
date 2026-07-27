import type { Rate, CarouselData } from "@/app/types/types"
import { Temporal } from "@js-temporal/polyfill"
import CarouselInner from "@/app/components/Carousel/CarouselInner"
import { fetchRates } from "@/app/lib/utils"

export default async function Carousel(){
    let carouselData: (CarouselData | null)[]= []
    try{
        const dateStart = Temporal.Now.plainDateISO().subtract({days: 2}).toString()
        const {data, error} = await fetchRates(`https://api.frankfurter.dev/v2/rates?from=${dateStart}`)
        
        if(error || !data){
            throw new Error(error)
        }

        const mappedRates = new Map<string, Rate[]>()
        data.forEach(rateObj => {
            if(!mappedRates.has(rateObj.quote)){
                mappedRates.set(rateObj.quote, [rateObj])
            }
            const newEntry = mappedRates.get(rateObj.quote) || []
            newEntry?.push(rateObj)
            mappedRates.set(rateObj.quote, newEntry)
        })

        carouselData = [...mappedRates.keys()].map((key: string) => {
            const ratesArray = mappedRates.get(key)
            if(ratesArray && ratesArray.length > 0){
                const latestRateObj = ratesArray[ratesArray.length-1]
                const startRateObj = ratesArray[0]
                if(startRateObj.rate > 0){
                    return ({
                        base: latestRateObj.base,
                        quote: latestRateObj.quote,
                        date: latestRateObj.date,
                        rate: latestRateObj.rate,
                        changes: (latestRateObj.rate - startRateObj.rate)/startRateObj.rate * 100
                    })
                }else{
                    return ({
                        base: latestRateObj.base,
                        quote: latestRateObj.quote,
                        date: latestRateObj.date,
                        rate: latestRateObj.rate,
                        changes: 0
                    })
                }
            }
            return null
        })

    }catch(error){
        if(typeof error === "string"){
            console.error("Error: ", error)
        }else if(error instanceof Error){
            console.error("Error: ", error.message)
        }else{
            console.error("An unexpected error occured during fetching rates")
        }
        
        return (
            <section className="flex">
                <div className="bg-red-500 text-neutral-900 w-auto py-3 px-2 md:px-4 font-medium text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px] flex justify-center items-center">
                    <p className="uppercase">No live data</p>
                </div>
                <div className="bg-neutral-700 text-neutral-200 py-3 px-2 md:px-4 w-full">
                    <p className="text-center uppercase text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px]">No live rates available</p>
                </div>
            </section>
        )
    }

    return(
        <section className="flex">
            <div className="bg-lime-500 min-w-[108px] md:min-w-[138px] text-neutral-900 font-medium text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px]
            w-[6.375rem] md:w-[8.625rem] py-3 px-2 md:px-4 flex justify-end items-center relative">
                <p className="before:content-[''] before:absolute before:w-[6px] before:h-[5px]
                before:rounded-full before:bg-neutral-900 before:bottom-[calc(50%-3px)] 
                before:left-[.5rem] md:before:left-[1rem] before:shadow-[0_0_0_2px_#42EB0502] uppercase">
                    Live Markets
                </p>
            </div>
            <div className="scroller overflow-scroll scrollbar-none bg-neutral-700 text-neutral-0">
                <CarouselInner ratesData={carouselData}/>
            </div>
        </section>
    )    
        
}