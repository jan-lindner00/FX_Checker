"use client"
import NavLink from "@/app/components/NavLink";
import { usePathname, useSearchParams } from "next/navigation";
import NavMobile from "@/app/components/NavMobile";
import { memo } from "react";
import type { Favorite, LogEntry } from "@/app/lib/types";

function Menu({favorites, logEntries}: 
    {favorites: Favorite[], logEntries: LogEntry[]}
): React.ReactNode{
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const search = new URLSearchParams(searchParams)

    return(
        <section className="w-full h-full mt-[2.5rem] md:mt-[calc(2.66rem)] text-neutral-0 text-[1rem] leading-[1.2] tracking-[1px]">
            <div className="border-b border-neutral-600 h-8 w-full hidden md:block">
                <NavLink href={`/dashboard/?${search.toString()}`} isActive={pathname === "/dashboard"}>
                    history
                </NavLink>
                <NavLink href={`/dashboard/compare?${search.toString()}`} isActive={pathname === "/dashboard/compare"}>
                    compare
                </NavLink>
                <NavLink href={`/dashboard/favorites?${search.toString()}`}
                 isActive={pathname === "/dashboard/favorites"} number={favorites.length}>
                    Favorites
                </NavLink>
                <NavLink href={`/dashboard/log?${search.toString()}`}
                 isActive={pathname === "/dashboard/log"} number={logEntries.length}>
                    Log
                </NavLink>
            </div>
            <div className="md:hidden relative">
                <NavMobile pathname={pathname} favLength={favorites.length} logLength={logEntries.length}>
                    <NavLink href={`/dashboard/?${search.toString()}`}
                        isActive={pathname === "/"} isMobile={true}>
                        history
                    </NavLink>
                    <NavLink href={`/dashboard/compare?${search.toString()}`}
                     isActive={pathname === "/compare"} isMobile={true}>
                        compare
                    </NavLink>
                    <NavLink href={`/dashboard/favorites?${search.toString()}`}
                    isActive={pathname === "/favorites"} number={favorites.length} isMobile={true}>
                        Favorites
                    </NavLink>
                    <NavLink href={`/dashboard/log?${search.toString()}`}
                    isActive={pathname === "/log"} number={logEntries.length} isMobile={true}>
                        Log
                    </NavLink>
                </NavMobile>
            </div>
        </section>
    )
}

export default memo(Menu)