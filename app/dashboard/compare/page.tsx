"use client"
import type { CurrencyCompare, Rate } from "@/app/lib/types";
import {useState, useEffect, useMemo } from "react"
import { compareCurrencies, currencyAbbreviations} from "@/app/lib/currencies";
import { fetchRates } from "@/app/lib/rates";
import CompareItem from "@/app/components/Compare/CompareItem";
import { useSearchParams } from "next/navigation";
import { useSubscribeFavorites } from "@/app/lib/hooks/useSubscription";
import { captureException } from "@sentry/nextjs";
import NoDataAvailable from "@/app/components/NoDataAvailable";
import { AbortError } from "@/app/lib/rates";

export default function Compare(){
    const params =  useSearchParams()
    const base = params.get("base")
    const quote = params.get("quote")
    const baseUpper = base && currencyAbbreviations.includes(base.toUpperCase()) ? base.toUpperCase() : "EUR"
    const quoteUpper = quote && currencyAbbreviations.includes(quote.toUpperCase()) ? quote.toUpperCase() : "USD"
    const filteredCurrencies = useMemo(()=>{
        return compareCurrencies.filter(cur=> !(cur.abbreviation === baseUpper || cur.abbreviation === quoteUpper))
    }, [baseUpper, quoteUpper])
    const [rates, setRates] = useState<CurrencyCompare[]>([])
    const [isFetchError, setIsFetchError] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const favorites = useSubscribeFavorites()

    useEffect(()=>{
        const controller = new AbortController()
        const getRates = async() => {
            setIsFetchError(false)
            setIsLoading(true)
            try{
                const data = await fetchRates({base: baseUpper, quotes: filteredCurrencies.map(cur => cur.abbreviation).join(","), controller}) as Rate[]
                if(!data) throw new Error("Failed to fetch data from Frankfurter API, but response was ok")
                const compareData = filteredCurrencies.map(currency => {
                    const rate = data.find((data: Rate) => data.quote === currency.abbreviation)?.rate || 0
                    return {
                        ...currency,
                        rate: rate
                    }
                })
                setRates(compareData)
            }catch(error){
                if (error instanceof AbortError && error.name === "AbortError") return
                captureException(error)
                setIsFetchError(true)
            }finally{
                if (controller.signal.aborted) return
                setIsLoading(false)
            }
        }

        getRates()

        return () => {
            controller.abort()
        }
    }, [baseUpper, quoteUpper, filteredCurrencies])


    if(isLoading){
        return(
            <NoDataAvailable 
                heading="Loading..."
                text="We are loading the ccomparison data. This could take up to a minute."
            />
        )
    }
    if(isFetchError){
        return (
            <NoDataAvailable 
                heading="Failed to fetch compare data"
                text={`We couldn't load comparison data for ${baseUpper} from Frankfurter API. Please try again.`}
            />
        )
    }

    if(rates.length === 0){
         return(
            <NoDataAvailable 
                heading="No comparison available"
                text="Please wait while the comparison data is loading."
            />
        )
    }
       
    return (
        <section className="bg-neutral-700 border border-neutral-600 p-4 md:p-5 mt-5 rounded-[1rem]">
            <div className="flex gap-y-[.625rem] gap-x-[.875rem] flex-wrap justify-between leading-[1.2]
            mb-4 md:mb-5 items-center text-neutral-0 uppercase">
                <h3 className="text-[.875rem] tracking-[1px] text-neutral-200 w-fit">
                    Multi-currency 
                    <span className="text-[1rem] text-neutral-0 text-medium"> 1,000 from {baseUpper}</span>
                </h3>
                <span className="text-[.75rem] tracking-[.5px] text-neutral-200">{rates.length} pairs</span>
            </div>
            <div className="grid grid-col-1 gap-3 h-max">
                {rates.map(data => (
                    <CompareItem  key={data.name} base={baseUpper} favorites={favorites} {...data} />
                ))}
            </div>
        </section>
    )
}