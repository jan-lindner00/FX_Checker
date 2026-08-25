import { SetStateAction } from "react"

export type Rate = {
    date: string,
    base: string,
    quote: string,
    rate: number
}

export type FetchRatesParams = {
    base?: string,
    quotes?: string,
    from?: string,
    group?: string | null,
    controller: AbortController
}

export type CarouselData =  Rate  & {
    changes: number
}

export type Favorite = {
    base: string,
    quote: string
}

export type LogEntry = {
    id: string,
    created_at: string,
    base: string,
    quote: string,
    base_amount: string,
    receive_amount: string
}

export type ChartData = {
    rate: number,
    time: string
}

export type HistoryProps = {
    base: string,
    quote: string,
    rateOpen: number,
    rateLatest: number,
    difference: number,
    differncePercent: number,
    chartData: ChartData[],
    timeline: string
    setTimeline: React.Dispatch<SetStateAction<"month" | "week" | "3months" | "6months" | "year" | "5years">>
}

export type CurrencyCompare = {
    countryCode: string
    abbreviation: string,
    name: string,
    rate: number
}

export type CustomTickProps ={
  x?: number;
  y?: number;
  payload?: {
    value: string | number;
    index?: number;
  };
  index?: number;
  data: ChartData[]
}

export type UserData = {
    id: string,
    created_at: string,
    email: string,
    full_name: string,
    avatar_url: string
}