"use client" 
import { useState, useEffect, useRef, useTransition, memo} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { formatCurrency, calcSetAmount, currencyAbbreviations, handleFavChange, fetchRates } from "@/app/lib/utils";
import CurrencyDropdown from "@/app/components/Conversion/CurrencyDropdown";
import useDebounce from "@/app/lib/hooks/useDebounce";
import { Rate } from "@/app/types/types";
import StarEmpty from "@/public/images/icon-star.svg"
import StarFilled from "@/public/images/icon-star-filled.svg"
import type { Favorite } from "@/app/types/types";
import supabaseClient from "@/app/lib/supabase/client";
import { Temporal } from "@js-temporal/polyfill";

function Conversion({favorites}: {favorites: Favorite[]}){
    const params = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()
    const [isPending, startTransition] = useTransition()
    const base = currencyAbbreviations.includes(params.get("base")?.toUpperCase() || "") ? (
      params.get("base")?.toUpperCase()) || "EUR" : "EUR"
    const quote = currencyAbbreviations.includes(params.get("quote")?.toUpperCase() || "") ? (
      params.get("quote")?.toUpperCase()) || "USD" : "USD"
    const dontUpdateSend = useRef(false)
    const dontUpdateReceive = useRef(false)
    const freshLoad = useRef(true)

    const [baseAmount, setBaseAmount] = useState<string>("")
    const [receiveAmount, setReceiveAmount] = useState<string>("")
    const [rate, setRate] = useState<number>(0)

    const isFavorite = favorites.find((fav)=> fav.base === base && fav.quote === quote) !== undefined
    
    const debouncedBaseAmount = useDebounce(baseAmount, 400)
    const debouncedReceiveAmount = useDebounce(receiveAmount, 400)

    async function handleAmountChange(recieving=true){
        try{
            const {data, error} = await fetchRates(`https://api.frankfurter.dev/v2/rates?base=${base}&quotes=${quote}`)
            if(error || !data){
                throw new Error(error)
            }
            setRate(data[0].rate)
            if(recieving){
                if(isNaN(parseFloat(debouncedBaseAmount))){
                    return setReceiveAmount("")
                }
                const amount = (parseFloat(debouncedBaseAmount) * data[0].rate).toFixed(2)
                dontUpdateSend.current = true
                return setReceiveAmount(amount)
            }
            if(isNaN(parseFloat(debouncedReceiveAmount))){
                return setBaseAmount("")
            }
            const amount = rate > 0 ? (parseFloat(debouncedReceiveAmount) / data[0].rate).toFixed(2) : ""
            dontUpdateReceive.current = true
            setBaseAmount(amount)
        }catch(error){
            if(typeof error === "string"){
                console.error("Error: ", error)
            }else if(error instanceof Error){
                console.error("Error: ", error.message)
            }else{
                console.error("An unexpected error occured during fetching rates from API")
            }
            if(recieving){
                setReceiveAmount("")
            }else{
                setBaseAmount("")
            }
            setRate(0)
        }
    }

     useEffect(()=>{
        if(dontUpdateReceive.current){
            dontUpdateReceive.current = false
            return
        }
        handleAmountChange()

    }, [quote, debouncedBaseAmount])

    useEffect(()=>{
        if(freshLoad.current){
            freshLoad.current = false
            return
        }
        if(dontUpdateSend.current == true){
            dontUpdateSend.current = false
            return
        }
        handleAmountChange(false)
    }, [base, debouncedReceiveAmount])


    function switchCurrencies(){
        const search = new URLSearchParams(params)
        search.set("base", quote)
        search.set("quote", base)
        dontUpdateSend.current = true
        
        router.replace(`${pathname}?${search.toString()}`)
    }

    async function handleLogEntry(): Promise<void>{
        if(debouncedBaseAmount === "" || debouncedReceiveAmount === "" || 
        parseFloat(debouncedBaseAmount) <= 0 || parseFloat(debouncedReceiveAmount) <= 0){
            return
        }
        const newLogEntry = {
            created_at: Temporal.Now.plainDateTimeISO().toString(),
            base: base,
            quote: quote,
            base_amount: debouncedBaseAmount,
            receive_amount: debouncedReceiveAmount
        }
        const {error} = await supabaseClient
            .from("log_entries")
            .insert(newLogEntry)
        if(error){
            console.error("Error inserting new log entry: ", error.message)
        }
    }

    return(
        <section className="max-w-[1036px] w-full">
            <h2 className="text-[1.25rem] leading-[1.2] tracking-[-.5px] text-neutral-0">Check the rate</h2>
            <div className="shadow-[0_12px_40px_rgba(0,_0,_0,_0.4)]">
                <div className="mt-4 bg-neutral-700 p-4 md:p-5 rounded-t-[1.25rem] flex flex-col md:flex-row gap-[1rem] md:gap-[1.5rem]
                border-b border-dashed border-neutral-400">
                    <div className="relative bg-neutral-600 p-4 md:p-5 rounded-[1rem] 
                    border border-solid border-neutral-500 flex justify-between items-end md:grow w-full">
                        <form aria-label={`Enter the amount you want to send in ${base}`}>
                            <label className="flex flex-col gap-5 text-[.875rem] leading-[1] tracking-[1px] 
                            text-neutral-100 flex flex-col justify-between uppercase">
                                Send
                                <div className="amount-container relative overflow-hidden mb-[.25rem] cursor-text">
                                    <p className="inline-block text-bold tracking-[-.5px] text-[2rem] text-neutral-0 rounded-[.5rem]
                                    2xl:text-[2.5rem]">
                                        {formatCurrency(baseAmount)}
                                    </p>
                                    <input 
                                        className="sr-only"
                                        type="number" 
                                        max={10000000} 
                                        min={0} 
                                        step={0.01}
                                        value={baseAmount}
                                        onChange={(e) => setBaseAmount(calcSetAmount(e.target.value))}
                                    />
                                </div>
                            </label>
                        </form>
                        <CurrencyDropdown startTransition={startTransition} search={"base"} selected={base} />
                    </div>
                    <button className="h-[3rem] max-w-[3rem] w-full self-center bg-neutral-600 bg-[url('@/public/images/icon-exchange-vertical.svg')] 
                    md:bg-[url('@/public/images/icon-exchange.svg')] bg-no-repeat bg-center
                    border-solid border border-neutral-500 rounded-[.5rem]"
                    onClick={switchCurrencies}
                    >
                    </button>
                    <div className="relative bg-neutral-600 p-4 md:p-5 rounded-[1rem]
                    border border-solid border-neutral-500 flex justify-between items-end md:grow w-full">
                        <form 
                            aria-label={`Enter the amount you want to send in ${base}`}>
                            <label className="flex flex-col gap-5 text-[.875rem] leading-[1] tracking-[1px] 
                            text-neutral-100 flex flex-col gap-5 uppercase">
                                Receive
                                <div className="amount-container relative overflow-hidden mb-[.25rem] cursor-text">
                                    <p className="inline-block text-bold tracking-[-.5px]
                                    text-[2rem] text-lime-500 rounded-[.5rem] 2xl:text-[2.5rem]"
                                    >
                                        {isPending ? ". . ." : formatCurrency(receiveAmount)}
                                    </p>
                                    <input 
                                        className="sr-only"
                                        type="number" 
                                        max={10000000} 
                                        min={0} 
                                        step={0.01}
                                        value={receiveAmount}
                                        onChange={(e) => setReceiveAmount(calcSetAmount(e.target.value))}
                                    />
                                </div>
                            </label>
                        </form>
                        <CurrencyDropdown startTransition={startTransition} search={"quote"} selected={quote} />
                    </div>
                </div>
                <div className="bg-neutral-700 
                 rounded-b-[1.25rem] p-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
                    <span className="text-neutral-0 text-[.625rem] md:text-[.75rem] md:leading-[1.2] md:tracking-[.5px]">1 {base} = {rate} {quote}</span>
                    <div className="text-[.75rem] leading-[1.3] text-medium tracking-[.5px] flex gap-3">
                        <button className={clsx(`flex items-center gap-[.625rem] px-3 py-2 rounded-[.5rem] uppercase`, 
                            isFavorite && `text-neutral-900 bg-lime-500`,
                            !isFavorite && `text-neutral-200 bg-neutral-600 border border-neutral-300`)}
                            aria-label="Add this pair to favorites"
                            onClick={() => handleFavChange(base, quote, isFavorite)}
                        >
                            <Image src={isFavorite ? StarFilled : StarEmpty} alt={isFavorite ? "Star filled" : "Star empty"} />
                            {isFavorite ? "Favorited" : "Favorite"}
                        </button>
                        <button className="flex items-center gap-[.625rem] px-3 py-2 rounded-[.5rem] text-neutral-200 bg-neutral-700
                         border border-neutral-300 hover:border-lime-500 hover:bg-lime-800 hover:text-neutral-0 uppercase"
                            aria-label="Log this conversion"
                            onClick={handleLogEntry}
                        >
                            Log Conversion
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default memo(Conversion)