import clsx from "clsx";
import Link from "next/link";
import { memo } from "react";

function NavLink({isActive, href, number= -1,children, isMobile=false}:
    {isActive: boolean, href: string, number?: number, children: Readonly<React.ReactNode>, isMobile?: boolean}
){
    const stylesSpan = clsx(`relative`, 
        (number >= 0) && `pr-4 after:content-[attr(data-number)] after:leading-[1] after:bg-lime-800 after:text-lime-500 after:text-[.625rem] 
        after:tracking-[.5px] after:w-5 after:h-5 after:rounded-full after:flex after:justify-center after:items-center 
        after:absolute after:top-[50%] after:right-[-1rem] after:translate-y-[-50%]`)
    
    const stylesLink = clsx(`relative text-inherit px-4 py-[1rem] md:py-[calc(10.5rem/16)] uppercase 
        no-underline visited:no-underline visited:text-inherit rounded-[.25rem]`, 
        (isActive && !isMobile) && `before:content-[''] before:absolute before:bottom-0 before:left-0 before:w-full before:h-[2px] 
        before:bg-lime-500 before:translate-y-[100%]`,
        (isActive && isMobile) && "hidden",
        isMobile && "border-b border-neutral-400 last:border-none",
        (number >= 0) && "pr-8")

    return (
        <Link href={href} className={stylesLink} aria-current={isActive ? "page" : "false"}>
            <span className={stylesSpan} data-number={number}>
                {children}
            </span>
        </Link>
    )
}

export default memo(NavLink)