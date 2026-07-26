import Image from "next/image";
import {useState, useEffect, useRef, useId, memo} from "react"
import { currencies } from "@/app/lib/utils";
import useDebounce from "@/app/lib/hooks/useDebounce";
import ArrowDown from "@/public/images/icon-chevron-down.svg"
import CurrencyItem from "@/app/components/Conversion/CurrencyItem";
import IconSearch from "@/public/images/icon-search.svg"

function CurrencyDropdown({startTransition, search="base", selected}:
    {startTransition: React.TransitionStartFunction, search: string, selected: string}
){
    const [currenciesArr, setCurrenciesArr] = useState(currencies)
    const [toggle, setToggle] = useState<boolean>(false)
    const [searchBarVal, setSearchBarVal] = useState("")
    const freshLoad = useRef(true)
    const id = useId()

    const selectedCurrency = currencies.find(curr => curr.abbreviation === selected.toUpperCase()) || (search === "base" ? (
            { countryCode: "EU", abbreviation: "EUR", name: "Euro", isPopular: true}) : (
            { countryCode: "US", abbreviation: "USD", name: "United States Dollar", isPopular: true }
        ))
    const debouncedSearch = useDebounce(searchBarVal, 400)

    const popular = currenciesArr.filter(cur => cur.isPopular === true)
    const others = currenciesArr.filter(cur => cur.isPopular !== true)

    useEffect(()=>{
        if(freshLoad.current === true){
            freshLoad.current = false
            return
        }
        setCurrenciesArr(() => {
            if(debouncedSearch === ""){
                return currencies
            }
            const newCurArr = currencies.filter((cur)=>{
                return cur.abbreviation.toLowerCase().includes(debouncedSearch.toLowerCase()) || cur.name.toLowerCase().includes(debouncedSearch.toLowerCase())
            })
            return newCurArr
        })

    }, [debouncedSearch])
    
    useEffect(()=>{
        const closeDropdown = (e: PointerEvent)=> {
            if(!(e.target instanceof HTMLElement)){
                return
            }
            if(e.target.dataset.dropdown === search){
                return
            }
            setToggle(false)
        }
        document.body.addEventListener("click", closeDropdown)

        return () => { document.body.removeEventListener("click", closeDropdown)}
    }, 
    [])
 
    return (
        <section className="md:relative">
            <button
                data-dropdown={search}
                className="bg-neutral-500 border text-[.875rem] text-neutral-0 leading-[1.2] tracking-[1px] border-solid border-neutral-400 flex items-center gap-2 p-[.625rem] md:p-3 rounded-[.5rem]"
                type="button"
                onClick={() => setToggle(prev => !prev)}
                aria-expanded={toggle}
                aria-controls={id}
            >
                <Image 
                    className="w-[1.25rem] rounded-full"
                    src={`/images/flags/${selectedCurrency.countryCode.toLowerCase()}.webp`}
                    alt={`Flag of ${selectedCurrency.countryCode}`}
                    width={200}
                    height={200}
                />
                {selectedCurrency.abbreviation}
                <Image
                    className={toggle ? "rotate-180" : ""}
                    src={ArrowDown}
                    alt={toggle ? "Arrow up" : "Arrow down"}
                />
            </button>
            {toggle && (
                <div
                data-dropdown={search}
                id={id} 
                className={`shadow-menu absolute z-1000 w-[calc(100vw-4rem)] rounded-[.5rem] p-2 max-w-[376px] bottom-0 translate-y-[calc(100%+.25rem)] right-0 ${search === "base" ? "md:right-[-84px] lg:right-0 ": ""}
                    bg-neutral-600 max-h-[458px] md:max-h-[466px] border border-neutral-400 overflow-scroll`}>
                    <form data-dropdown={search} className="h-12 w-full mb-[.625rem]">
                        <label data-dropdown={search} className="currency-search flex h-full border rounded-[.375rem] border-solid border-neutral-200">
                            <div data-dropdown={search} className="flex items-center px-3">
                                <Image data-dropdown={search} src={IconSearch} alt="Search Goggles" />
                            </div>
                            <input
                                data-dropdown={search} 
                                className="w-full text-neutral-0 text-[.75rem] leading-[1.2] tracking-[.5px] pr-3
                                    placeholder:text-neutral-200 placeholder:text-[.75rem] placeholder:text-leading-[1.2] 
                                    placeholder:tracking-[.5px]"
                                type="text"
                                value={searchBarVal}
                                onInput={(e) => setSearchBarVal(e.currentTarget.value)}
                                placeholder="Search currencies..."
                            />
                        </label>
                    </form>
                    <form>
                    {popular.length > 0 && (
                        <>
                            <div
                            data-dropdown={search} 
                            className="flex justify-between p-2 text-neutral-200 text-[.75rem] 
                            leading-[1.2] tracking-[.5px] border-b border-solid border-neutral-500 uppercase">
                                <span data-dropdown={search}>Popular</span>
                                <span data-dropdown={search}>{popular.length}</span>
                            </div>
                            {popular.map((cur, index)=>{
                                return (
                                    <CurrencyItem 
                                        key={index}
                                        search={search}
                                        selected={cur.abbreviation === selectedCurrency.abbreviation}
                                        startTransition={startTransition}
                                        {...cur}
                                    />
                                )
                            })}
                        </>
                    )}
                    {others.length > 0 && (
                        <>
                            <div 
                            data-dropdown={search}
                            className="mt-1 flex justify-between p-2 text-neutral-200 text-[.75rem] 
                            leading-[1.2] tracking-[.5px] border-b border-solid border-neutral-500 uppercase">
                                <span data-dropdown={search}>Other currencies</span>
                                <span data-dropdown={search}>{others.length}</span>
                            </div>
                            {others.map((cur, index)=>{
                                return (
                                    <CurrencyItem 
                                        key={index} 
                                        search={search} 
                                        selected={cur.abbreviation === selectedCurrency.abbreviation} 
                                        startTransition={startTransition}
                                        {...cur}
                                    />
                                )
                            })}
                        </>
                    )}
                    </form>
                </div>
            )}
        </section>
    )
}

export default memo(CurrencyDropdown)