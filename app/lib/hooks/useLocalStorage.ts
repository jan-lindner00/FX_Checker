"use client"
import { useSyncExternalStore, useCallback, useState } from "react";

export default function useLocalStorage<T>(key: string, initialValue: Array<T>): [Array<T>, (newValue: Array<T>) => void]{
    const subscribe = useCallback((callback: () => void): (() => void) => {
        window.addEventListener("storage", callback)
        return () => { window.removeEventListener("storage", callback)}
    }, [])

    const getData = useCallback((): Array<T> => {
        const item = localStorage?.getItem(key)
        return item ? JSON.parse(item) : initialValue
    }, [key, initialValue])

    const [cachedDataSnapshot, setCachedDataSnapshot] = useState<Array<T>>([])

    const getSnapshot = useCallback(():Array<T> => {
        const currentData = getData()
        if(currentData.length !== cachedDataSnapshot.length || currentData.toString() !== cachedDataSnapshot.toString()){
            setCachedDataSnapshot([...currentData])

        }
        return cachedDataSnapshot
    }, [cachedDataSnapshot, getData])

    const getServerSnapshot = useCallback((): Array<T> =>{
        return initialValue        
    }, [initialValue])

    const value: Array<T> = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    
    const setValue = useCallback((newValue: Array<T>) => {
        localStorage.setItem(key, JSON.stringify(newValue))
        window.dispatchEvent(new Event("storage"))
    }, [key])

    return [value, setValue]
}