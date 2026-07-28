"use client"
import type { CurrencyCompare, Rate } from "@/types/types";
import {useState, useEffect } from "react"
import { compareCurrencies, currencyAbbreviations, fetchRates } from "@/lib/utils";
import CompareItem from "@/components/Compare/CompareItem";
import { useSearchParams } from "next/navigation";
import { useSubscribeFavorites } from "@/lib/hooks/useSubscription";

export default function Compare(){
    const params =  useSearchParams()
    const base = params.get("base")
    const quote = params.get("quote")
    const baseUpper = base && currencyAbbreviations.includes(base.toUpperCase()) ? base.toUpperCase() : "EUR"
    const quoteUpper = quote && currencyAbbreviations.includes(quote.toUpperCase()) ? quote.toUpperCase() : "USD"
    const filteredCurrencies = compareCurrencies.filter(cur=> !(cur.abbreviation === baseUpper || cur.abbreviation === quoteUpper))
    const [rates, setRates] = useState<CurrencyCompare[]>([])
    const favorites = useSubscribeFavorites()

    useEffect(()=>{
        const getRates = async() => {
            const data = await fetchRates({base: baseUpper, quotes: filteredCurrencies.map(cur => cur.abbreviation).join(",")})
            if(!data){
                return
            }
            const compareData = filteredCurrencies.map(currency => {
                const rate = data.find((data: Rate) => data.quote === currency.abbreviation)?.rate || 0
                return {
                    ...currency,
                    rate: rate
                }
            })
            setRates(compareData)
        }

        getRates()
    }, [baseUpper, quoteUpper, filteredCurrencies])

    if(rates.length === 0){
         return(
            <div className="py-[2.5rem] text-center flex flex-col items-center gap-4">
                <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">No comparison available</h3>
                <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
                    {"Enter an amount in SEND above to see what your money is worth in other currencies."}
                </span>
            </div>
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