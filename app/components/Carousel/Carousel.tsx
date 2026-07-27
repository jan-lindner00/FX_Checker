import type { Rate, CarouselData } from "@/app/types/types"
import { Temporal } from "@js-temporal/polyfill"
import CarouselInner from "@/app/components/Carousel/CarouselInner"
import { fetchRates } from "@/app/lib/utils"

export default async function Carousel(){
    let carouselData: CarouselData[] = []
    try{
        const dateStart = Temporal.Now.plainDateISO().subtract({days: 2}).toString()
        const {data, error} = await fetchRates(`https://api.frankfurter.dev/v2/rates?from=${dateStart}`)

        if(error || !data){
            throw new Error(error)
        }

        const dataLatest = data.filter((d: Rate) => d.date === data[data.length-1].date)
        const dataStart = data.filter((d: Rate) => d.date === data[0].date)

        carouselData = dataLatest.map((dataObj: Rate) => {
            const data = dataStart.find((i:Rate) => i.quote === dataObj.quote)
            if(data){
                return ({
                    ...dataObj,
                    changes: data.rate > 0 ? (dataObj.rate - data.rate)/data.rate * 100 : 0
                })
            }else{
                return ({
                    ...dataObj,
                    changes: 0
                })
            }
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