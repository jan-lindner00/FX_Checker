import Carousel from "@/app/components/Carousel"
import HeaderBrowser from "./HeaderBrowser"
import { Suspense } from "react"

export default function Header(){

    return(
        <header>
            <HeaderBrowser />
            <Suspense fallback={(
                <section className="flex">
                <div className="bg-lime-500 text-neutral-900 min-w-[108px] md:min-w-[138px] py-3 px-2 md:px-4 font-medium text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px] flex justify-center items-center">
                    <p className="uppercase">Loading</p>
                </div>
                <div className="bg-neutral-700 text-neutral-200 py-3 px-2 md:px-4 w-full">
                    <p className="text-center uppercase text-[.625rem] md:text-[.75rem] leading-[1.2] tracking-[.5px]">Loading rates...</p>
                </div>
            </section>
            )}>
                <Carousel />
            </Suspense>
        </header>
    )
}
