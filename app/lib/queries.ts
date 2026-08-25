import supabaseClient from "@/app/lib/supabase/client"; 
import { withScope, captureException } from "@sentry/nextjs";
import {  PostgrestError } from "@supabase/supabase-js";

export async function trySupabase<T>(operation: () => PromiseLike<{data: T | null, error: PostgrestError | null}>): 
Promise<{success: boolean, data?: T | undefined, error?: string | undefined  }>
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
        await trySupabase(()=>(
            supabaseClient
                .from("favorites")
                .insert({
                    base: base,
                    quote: abbreviation
                })
        ))
    }else{
        await trySupabase(()=>(
            supabaseClient
                .from("favorites")
                .delete()
                .eq("base", base)
                .eq("quote", abbreviation)
        ))
    }
}