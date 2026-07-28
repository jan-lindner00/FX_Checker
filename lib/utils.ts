import { Temporal } from "@js-temporal/polyfill";
import type { LogEntry, FetchRatesParams } from "@/types/types";
import supabaseClient from "@/lib/supabase/client"; 
import { addBreadcrumb, withScope, captureException } from "@sentry/nextjs";
import {  PostgrestError } from "@supabase/supabase-js";

export class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        public body?: unknown
    ){
        super(`API Error ${status}: ${statusText}`)
        this.name = "ApiError"
    }
} 

export class NetworkError extends Error {
    constructor(message: string, public cause?: unknown){
        super(message)
        this.name = "NetworkError"
    }
} 

export async function fetchRates<T>({base, quotes, from, group}: FetchRatesParams, cache=false): Promise<T>{
    let lastError: unknown
    const retries = 2
    const timeOutMs = 20000
    const retryDelayMs = 500

    const searchParams = new URLSearchParams()
    if(base) searchParams.set("base", base)
    if(quotes) searchParams.set("quotes", quotes)
    if(from) searchParams.set("from", from)
    if(group) searchParams.set("group", group)
        
    const url = `https://api.frankfurter.dev/v2/rates?${searchParams.toString()}`

    for(let attempt = 0; attempt <= retries; attempt++ ){
        const controller = new AbortController()
        const timeout = setTimeout(()=> {controller.abort()
            console.log("aborted")
        }, timeOutMs)
        
        addBreadcrumb({
            category: "http",
            message: `Fetching ${url} (attempt: ${attempt + 1})`,
            level: "info"
        })

        try{
            let res
            if(cache){
                res = await fetch(url, {signal: controller.signal, cache: "force-cache"})
            }else{
                res = await fetch(url, {signal: controller.signal, next: {revalidate: 1800}})
            } 
            clearTimeout(timeout)
            if(!res.ok){
                let body: unknown
                 try{
                    body = await res.json()
                }catch(error){
                    body = await res.text().catch(() => undefined)
                }
                throw new ApiError(res.status, res.statusText, body)
            }
           
            const contentLength = res.headers.get("content-length")
            if(res.status === 204 || contentLength === "0"){
                return undefined as T
            }
            return await res.json()
        }catch(error){
           clearTimeout(timeout)
           lastError = error

           const isClientError = error instanceof ApiError && error.status < 500
           const isAbort = error instanceof DOMException && error.name === "AbortError"
           const isFinalAttempt = isClientError || attempt === retries

           if(isFinalAttempt){
                const finalError = isAbort
                    ? new NetworkError(`Request timed out after ${timeOutMs}ms`, error)
                    : error instanceof ApiError
                    ? error
                    : new NetworkError(`Network request failed`, error)
                withScope((scope)=> {
                    scope.setTag("url", url)
                    scope.setLevel(error instanceof ApiError && isClientError ? "warning" : "error")

                    if(error instanceof ApiError){
                        scope.setContext("response", {
                            status: error.status,
                            statusText: error.statusText,
                            body: error.body
                        })
                    }
                    scope.setContext("request", {
                        method: "GET",
                        attempt: attempt + 1,
                    })

                    captureException(finalError)
                })
                throw finalError
           }
           await new Promise(resolve => {
            setTimeout(resolve, retryDelayMs)
           })
        }
    }
    throw lastError
}

export async function trySupabase<T>(operation: () => PromiseLike<{data: T | null, error: PostgrestError | null}>): Promise<{success: boolean, data?: T | undefined, error?: string | undefined  }>
{
    try{
        const {data, error} = await operation()
        if(error){
            const expectedCodes = ["PGRST116"]
            const isExpected = expectedCodes.includes(error.code)

            if(!isExpected){
                withScope(scope => {
                    scope.setTag("supabase.code", error.code)
                    scope.setContext("supabase_error", {...error})
                    scope.setLevel("error")
                    captureException(new Error(error.message))
                })

                return {success: false, error: error.message}
            }
        }
        if(data === null){
            return { success: false, error: "No data returned"}
        }
        return {success: true, data}
    }catch(error){
        captureException(error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }
    }
}

export async function fetchFavorites() {
    const {success, data, error} = await trySupabase(() => (
        supabaseClient
            .from("favorites")
            .select(`
            base,
            quote    
            `)
        )
    ) 
    if(!success || error){
        return null
    }
    return data
}

export async function fetchLogEntries() {
    const {success, data, error} = await trySupabase(()=>(
        supabaseClient
        .from("log_entries")
        .select()
        .order("created_at", {ascending: false})
    ))
     
    if(!success || error){
        return null
    }
    return data
} 

export async function handleFavChange(base: string, abbreviation: string, isFavorite: boolean){
    if(!isFavorite){
        await supabaseClient
            .from("favorites")
            .insert({
                base: base,
                quote: abbreviation
            })
    }else{
        await supabaseClient
            .from("favorites")
            .delete()
            .eq("base", base)
            .eq("quote", abbreviation)
    }
}

export const currencies = [
    { countryCode: "AE", abbreviation: "AED", name: "UAE Dirham" },
    { countryCode: "AR", abbreviation: "ARS", name: "Argentine Peso" },
    { countryCode: "AU", abbreviation: "AUD", name: "Australian Dollar" },
    { countryCode: "BD", abbreviation: "BDT", name: "Bangladeshi Taka" },
    { countryCode: "BH", abbreviation: "BHD", name: "Bahraini Dinar" },
    { countryCode: "BR", abbreviation: "BRL", name: "Brazilian Real" },
    { countryCode: "CA", abbreviation: "CAD", name: "Canadian Dollar" },
    { countryCode: "CH", abbreviation: "CHF", name: "Swiss Franc" },
    { countryCode: "CL", abbreviation: "CLP", name: "Chilean Peso" },
    { countryCode: "CN", abbreviation: "CNY", name: "Chinese Yuan" },
    { countryCode: "CO", abbreviation: "COP", name: "Colombian Peso" },
    { countryCode: "CZ", abbreviation: "CZK", name: "Czech Koruna" },
    { countryCode: "DK", abbreviation: "DKK", name: "Danish Krone" },
    { countryCode: "EG", abbreviation: "EGP", name: "Egyptian Pound" },
    { countryCode: "EU", abbreviation: "EUR", name: "Euro", isPopular: true},
    { countryCode: "GB", abbreviation: "GBP", name: "British Pound Sterling", isPopular: true },
    { countryCode: "HK", abbreviation: "HKD", name: "Hong Kong Dollar" },
    { countryCode: "HN", abbreviation: "HNL", name: "Honduran Lempira" },
    { countryCode: "HT", abbreviation: "HTG", name: "Haitian Gourde" },
    { countryCode: "HU", abbreviation: "HUF", name: "Hungarian Forint" },
    { countryCode: "ID", abbreviation: "IDR", name: "Indonesian Rupiah" },
    { countryCode: "IN", abbreviation: "INR", name: "Indian Rupee" },
    { countryCode: "IS", abbreviation: "ISK", name: "Icelandic Krona" },
    { countryCode: "JO", abbreviation: "JOD", name: "Jordanian Dinar" },
    { countryCode: "JP", abbreviation: "JPY", name: "Japanese Yen", isPopular: true },
    { countryCode: "KE", abbreviation: "KES", name: "Kenyan Shilling" },
    { countryCode: "KR", abbreviation: "KRW", name: "South Korean Won" },
    { countryCode: "KW", abbreviation: "KWD", name: "Kuwaiti Dinar" },
    { countryCode: "LB", abbreviation: "LBP", name: "Lebanese Pound" },
    { countryCode: "LK", abbreviation: "LKR", name: "Sri Lankan Rupee" },
    { countryCode: "MA", abbreviation: "MAD", name: "Moroccan Dirham" },
    { countryCode: "MX", abbreviation: "MXN", name: "Mexican Peso" },
    { countryCode: "MY", abbreviation: "MYR", name: "Malaysian Ringgit" },
    { countryCode: "NG", abbreviation: "NGN", name: "Nigerian Naira" },
    { countryCode: "NO", abbreviation: "NOK", name: "Norwegian Krone" },
    { countryCode: "NP", abbreviation: "NPR", name: "Nepalese Rupee" },
    { countryCode: "NZ", abbreviation: "NZD", name: "New Zealand Dollar" },
    { countryCode: "OM", abbreviation: "OMR", name: "Omani Rial" },
    { countryCode: "PE", abbreviation: "PEN", name: "Peruvian Sol" },
    { countryCode: "PH", abbreviation: "PHP", name: "Philippine Peso" },
    { countryCode: "PK", abbreviation: "PKR", name: "Pakistani Rupee" },
    { countryCode: "PL", abbreviation: "PLN", name: "Polish Zloty" },
    { countryCode: "QA", abbreviation: "QAR", name: "Qatari Rial" },
    { countryCode: "RO", abbreviation: "RON", name: "Romanian Leu" },
    { countryCode: "RU", abbreviation: "RUB", name: "Russian Ruble" },
    { countryCode: "SA", abbreviation: "SAR", name: "Saudi Riyal" },
    { countryCode: "SE", abbreviation: "SEK", name: "Swedish Krona" },
    { countryCode: "SG", abbreviation: "SGD", name: "Singapore Dollar" },  
    { countryCode: "TH", abbreviation: "THB", name: "Thai Baht" },
    { countryCode: "TR", abbreviation: "TRY", name: "Turkish Lira" },
    { countryCode: "TW", abbreviation: "TWD", name: "New Taiwan Dollar" },
    { countryCode: "UA", abbreviation: "UAH", name: "Ukrainian Hryvnia" },
    { countryCode: "US", abbreviation: "USD", name: "United States Dollar", isPopular: true },
    { countryCode: "VN", abbreviation: "VND", name: "Vietnamese Dong" },
    { countryCode: "ZA", abbreviation: "ZAR", name: "South African Rand" }
];

export const compareCurrencies = [
    { countryCode: "EU", abbreviation: "EUR", name: "Euro"},
    { countryCode: "US", abbreviation: "USD", name: "United States Dollar" },
    { countryCode: "GB", abbreviation: "GBP", name: "British Pound Sterling"},
    { countryCode: "JP", abbreviation: "JPY", name: "Japanese Yen" },
    { countryCode: "CH", abbreviation: "CHF", name: "Swiss Franc" },
    { countryCode: "CA", abbreviation: "CAD", name: "Canadian Dollar" },
    { countryCode: "AU", abbreviation: "AUD", name: "Australian Dollar" },
    { countryCode: "IN", abbreviation: "INR", name: "Indian Rupee" },
    { countryCode: "CN", abbreviation: "CNY", name: "Chinese Yuan" },
    { countryCode: "BD", abbreviation: "BDT", name: "Bangladeshi Taka" }
]

export const currencyAbbreviations = currencies.map(cur => cur.abbreviation)

export function formatCurrency(amount: string): string{
    const numericAmount = parseFloat(amount)
    if(isNaN(numericAmount) || numericAmount <= 0){
        return "0.00"
    }
    const formattedAmount = `${parseFloat(numericAmount.toFixed(2)).toLocaleString("en-US")}`
    if(!formattedAmount.includes(".")){
        return formattedAmount + ".00"
    }
    if(formattedAmount.includes(".") && formattedAmount.split(".")[1].length < 2){
        return formattedAmount + "0"
    }
    return formattedAmount
}

export function calcSetAmount(amount: string):string{
    if(amount === ""){
        return ""
    }
    if(parseFloat(amount) > 10000000){
        return "10000000"
    }
    if(amount.split(".")[1]?.length > 2){
        return [amount.split(".")[0], amount.split(".")[1].slice(0, 2)].join(".")
    }
    if(amount.includes(".")){
        return [amount.split(".")[0], amount.split(".")[1]].join(".")
    }
    return amount   
}

export function getFromParamFetch(timeline: string){
    if(timeline === "month"){
        return Temporal.Now.plainDateISO().subtract({months: 1}).toString()
    }
    else if(timeline === "3months"){
        return Temporal.Now.plainDateISO().subtract({months: 3}).toString()
    }
    else if(timeline === "6months"){
        return Temporal.Now.plainDateISO().subtract({months: 6}).toString()
    }
    else if(timeline === "year"){
        return Temporal.Now.plainDateISO().subtract({years: 1}).toString()
    }
    else if(timeline === "5years"){
        return Temporal.Now.plainDateISO().subtract({years: 5}).toString()
    }
    else{
        return Temporal.Now.plainDateISO().subtract({days: 6}).toString()
    } 
}

export function getGroupParamFetch(timeline: string){
    if(timeline === "3months" || timeline === "6months" || timeline === "year"){
        return "week"
    }else if(timeline === "5years"){
        return "month"
    }
    return null
}

export function isSafeNext(next: string | null): string {
  if (!next) return '/dashboard'
  if (!next.startsWith('/')) return '/dashboard'
  if (next.startsWith('//') || next.startsWith('/\\')) return '/dashboard'
  return next
}

export function getInitials(name:string | undefined){
    if(!name){
        return "G"
    }
    if(name.split(" ").length === 1){
        return name[0].toUpperCase()
    }
    const names = name.split(" ")
    return (names[0][0] + names[names.length-1][0]).toUpperCase()
}

export function convertToCSV(data: LogEntry[]) {
    if (!data.length) return "";

    const headers = Object.keys(data[0]) as (keyof LogEntry)[]
    const rowsArr = data.map((entry: LogEntry)=>{
        const row = headers.map((key: (keyof LogEntry))=>{
            const value: string | number = entry[key] ?? "" 
            const escaped = typeof value === "number" ? Number(value).toFixed(2).replace(/"/g, '""') : String(value).replace(/"/g, '""');
            return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
        }).join(",")
        return row
    })
    const csvRows = [
        headers.join(","),
        ...rowsArr
    ];

    return csvRows.join("\n");
}

export function downloadCSV(data: LogEntry[], filename = `exchange-${Temporal.Now.plainDateTimeISO().toString()}.csv`) {
    const csvContent = convertToCSV(data);
    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}