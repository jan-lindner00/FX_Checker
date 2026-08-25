import { Temporal } from "@js-temporal/polyfill";
import type { FetchRatesParams } from "@/app/lib/types"; 
import { addBreadcrumb, withScope, captureException } from "@sentry/nextjs";

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

export async function fetchRates<T>({base, quotes, from, group, controller}: FetchRatesParams, cache=false): Promise<T>{
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
        const timeout = setTimeout(()=> controller.abort(), timeOutMs)
        
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