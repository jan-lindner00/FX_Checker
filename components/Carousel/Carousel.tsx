import type { Rate, CarouselData } from "@/types/types"
import { Temporal } from "@js-temporal/polyfill"
import { fetchRates } from "@/lib/utils"
import CarouselBrowser from "./CarouselBrowser"
import { captureException } from "@sentry/nextjs";

export default async function Carousel(){
    
    let carouselData: (CarouselData | null)[]= []

    const dateStart = Temporal.Now.plainDateISO().subtract({days: 2}).toString()
    try{
        const data = await fetchRates({base: "EUR", from: dateStart}) as Rate[]
        if(!data) throw new Error("Failed to fetch data from Frankfurter API, but response was ok")
        
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
        captureException(error)

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
        <CarouselBrowser data={carouselData} />
    )    
        
}