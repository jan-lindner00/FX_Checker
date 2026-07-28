"use client"
import { useContext } from "react"
import { FavoritesContext, LogContext } from "@/app/context/SubscribeContext"

export function useSubscribeFavorites() {
  return useContext(FavoritesContext)
}

export function useSubscribeLog() {
  return useContext(LogContext)
}