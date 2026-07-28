"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useId, useRef } from "react"
import supabaseClient from "@/app/lib/supabase/client"
import Logo from "@/public/images/logo.svg"
import IconUser from "@/public/images/icon-user.svg"
import ArrowDown from "@/public/images/icon-chevron-down.svg"
import { UserData } from "@/app/types/types"
import { getInitials } from "@/app/lib/utils"
import SignOutModal from "@/app/components/SignOutModal"

export default function HeaderBrowser(){
    const id = useId()
    const [toggle, setToggle] = useState<boolean>(false)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const modalRef = useRef<HTMLDialogElement | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const freshLoad = useRef<boolean>(true)

    useEffect(()=>{
        if(freshLoad.current === true){
            freshLoad.current = false
            return
        }
        if(toggle){
            menuRef.current?.focus()
        }else{
            buttonRef.current?.focus()
        }
    }, [toggle])

    useEffect(()=>{
        async function fetchUserData(){
            const {data} = await supabaseClient.auth.getUser()
            if(!data?.user || data?.user?.is_anonymous){
                return
            }

            const {error, data: profileData} = await supabaseClient
            .from("user_profiles")
            .select()
            .eq("id", data.user?.id)
            if(error){
                console.error(error.message)
            }

            if(!error && profileData){
                setUserData(profileData[0])
            }
        }
        fetchUserData()
    }, [])

    return(
        <section className="relative text-neutral-200 p-4 md:py-5 md:px-6 flex justify-between items-center">
            <Image className="w-[107.15px] md:w-[139.3px]" src={Logo} alt="FX Checker" loading="eager"/>
            <div className="flex items-center gap-4">
                <p className="hidden md:block text-[.625rem] md:text-[.875rem] leading-[1.2] tracking-[.5px] md:tracking-[1px]">55 CURRENCIES · EOD · ECB DATA</p>
                <button 
                    ref={buttonRef}
                    aria-controls={id}
                    aria-expanded={toggle}
                    aria-label="Open user settings"
                    className="flex items-center gap-2 py-1 px-2 rounded-[.5rem] bg-neutral-400 border border-neutral-200"
                    onClick={()=> setToggle(prev => !prev)}
                >
                    <Image className="w-5 block" src={IconUser} alt="User icon"/>
                    <Image className={`w-3 md:w-4 block ${toggle ? "rotate-180" : ""}`} src={ArrowDown} alt={toggle ? "Arrow up": "Arrow down"}/>
                </button>
            </div>
            {toggle && (
            <div 
                tabIndex={0}
                ref={menuRef}
                className="fixed top-[3.375rem] md:top-[4.25rem] right-0 w-[17.5rem] rounded-[.75rem]
                bg-neutral-700 border border-neutral-600 p-2 z-1000"
                id={id}
                onKeyDown={(e)=>{
                    if(e.key === "Escape"){
                        setToggle(false)
                    }
                }}
                onBlur={(e)=>{
                    if(!menuRef.current?.contains(e.relatedTarget)){
                        setToggle(false)
                    }
                }}
            >
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-500">
                    {userData?.avatar_url ? (
                    <Image
                        className="w-12 rounded-full border border-neutral-300"
                        alt={`Profile picture of ${userData?.full_name}`} 
                        src={userData.avatar_url}
                        width={200}
                        height={200}
                    />

                    ): (
                    <div className="w-12 h-12 flex justify-center rounded-full items-center border border-neutral-300
                    bg-neutral-600 text-neutral-0 tracking-[1px] leading-[1.2]">
                        <p className="text-semibold text-neutral-200 text-[1.5rem]">{getInitials(userData?.full_name)}</p>
                    </div>
                    )}
                    
                    <div className="flex flex-col gap-2 text-neutral-100">
                        <p className="text-[.875rem] leading-[1.2] tracking-[.5px]">{userData?.full_name || "Guest"}</p>
                        {userData?.email && (
                            <p className="text-[.75rem] leading-[1.2] tracking-[.5px]">
                                {userData.email}
                            </p>)}
                    </div>
                </div>
                {userData ? (
                <div className="py-5 flex flex-col border-b border-neutral-500">
                    <Link
                    className="px-2 text-neutral-0 no-underline"
                    href="/settings/password"
                    >
                        Change password
                    </Link>
                </div>): (
                <div className="py-5 flex flex-col border-b border-neutral-500">
                    <Link
                    className="px-2 text-neutral-0 no-underline"
                    href="/settings/link-profile"
                    >
                        Link profile
                    </Link>
                </div>
                )}
                {userData ? (
                <form action="/auth/logout" method="post">
                    <button 
                        type="submit"
                        className="w-full p-2 mt-3 text-red-500 border-none flex justify-start"
                    >
                        Log out
                    </button>
                </form>) : (
                <button 
                    className="w-full p-2 mt-3 text-red-500 border-none flex justify-start"
                    onClick={()=>setModalOpen(true)}
                >
                    Log out
                </button>
                )}
                
            </div>
            )}
            {(!userData && modalOpen) && <SignOutModal modalRef={modalRef} setModalOpen={setModalOpen}/>}
        </section>
    )
}
