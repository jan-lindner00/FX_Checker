"use client"
import {useState, useEffect, useMemo} from "react"
import { useSearchParams } from "next/navigation";
import { currencyAbbreviations, fetchRates, getFromParamFetch, getGroupParamFetch } from "@/lib/utils";
import HistoryBrowserComponent from "@/components/History/HistoryBrowserComponent";
import type { ChartData, Rate } from "@/types/types";

export default function History() {
  const params = useSearchParams()
  const base = params.get("base")
  const quote = params.get("quote")
  const baseUpper = base && currencyAbbreviations.includes(base.toUpperCase()) ? base.toUpperCase() : "EUR"
  const quoteUpper = quote && currencyAbbreviations.includes(quote.toUpperCase()) ? quote.toUpperCase() : "USD"
  const [timeline, setTimeline] = useState<"week" | "month" | "3months" | "6months" | "year" | "5years">("week")
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const rateOpen = chartData[0]?.rate || 0 
  const rateLatest = chartData[chartData.length-1]?.rate || 0
  const difference = rateLatest - rateOpen
  const differencePercent = rateOpen > 0 ? (
    parseFloat((difference / rateOpen * 100).toFixed(2))
  ) : 0

  const historyProps = useMemo(()=>{
    return({
      base: baseUpper,
      quote: quoteUpper,
      rateOpen: rateOpen,
      rateLatest: rateLatest,
      difference: difference,
      differncePercent: differencePercent,
      chartData: chartData,
      timeline: timeline,
      setTimeline: setTimeline
    })
  }, [chartData, baseUpper, quoteUpper, rateOpen, rateLatest,
    difference, differencePercent, timeline]
  )

  useEffect(()=>{
    async function fetchChartData(){
        setIsLoading(true)
        const data = await fetchRates({base: baseUpper, quotes: quoteUpper, from: getFromParamFetch(timeline), group: getGroupParamFetch(timeline) }, true)
        if(!data){
          return setIsLoading(false)
        }
        const mappedData = data.map((data: Rate) => {
          return ({
            rate: data.rate,
            time: data.date
        })})
        setChartData(mappedData)
        setIsLoading(false)
    }
    
    fetchChartData()
  }, [baseUpper, quoteUpper, timeline])

  if(isLoading || chartData.length === 0){
    return (
      <div className="py-[2.5rem] text-center flex flex-col items-center gap-4">
        <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">No history data available</h3>
        <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
            {`We couldn't load rate history for ${baseUpper}/${quoteUpper} right now. This usually clears up in a minute.`}
        </span>
    </div>
    )
  }

  return (
      <HistoryBrowserComponent historyProps={historyProps} />
  );
}
