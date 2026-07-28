"use client"
import {useState, useEffect, createContext} from "react"
import { fetchFavorites, fetchLogEntries } from "@/lib/utils"
import { Favorite, LogEntry } from "@/types/types"
import {v4 as uuid} from "uuid"
import supabaseClient from "@/lib/supabase/client"

export const FavoritesContext = createContext<Favorite[]>([])

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([])

  useEffect(() => {
    let cancelled = false

    async function getFavorites() {
      const data = await fetchFavorites()
      if (cancelled) return
      setFavorites(data ?? [])
    }

    getFavorites()

    const favChannel = supabaseClient
      .channel(`favorite-changes-${uuid()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "favorites" },
        () => getFavorites()
      )
      .subscribe()

    return () => {
      cancelled = true
      supabaseClient.removeChannel(favChannel)
    }
  }, [])

  return (
    <FavoritesContext.Provider value={favorites}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const LogContext = createContext<LogEntry[]>([])

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    let cancelled = false

    async function getLogEntries() {
      const data = await fetchLogEntries()
      if (cancelled) return
      setLogEntries(data ?? [])
    }

    getLogEntries()

    const logChannel = supabaseClient
      .channel(`log-changes-${uuid()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "log_entries" },
        () => getLogEntries()
      )
      .subscribe()

    return () => {
      cancelled = true
      supabaseClient.removeChannel(logChannel)
    }
  }, [])

  return (
    <LogContext.Provider value={logEntries}>
      {children}
    </LogContext.Provider>
  )
}
