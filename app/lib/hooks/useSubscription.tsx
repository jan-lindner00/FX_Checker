"use client"
import {useState, useEffect, useMemo, useContext, createContext} from "react"
import { fetchFavorites, fetchLogEntries } from "@/app/lib/utils"
import { Favorite, LogEntry } from "@/app/types/types"
import {v4 as uuid} from "uuid"
import supabaseClient from "@/app/lib/supabase/client"

const FavoritesContext = createContext<Favorite[]>([])

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

export function useSubscribeFavorites() {
  return useContext(FavoritesContext)
}

const LogContext = createContext<LogEntry[]>([])

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

export function useSubscribeLog() {
  return useContext(LogContext)
}