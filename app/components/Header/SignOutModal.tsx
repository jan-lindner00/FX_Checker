import { type Dispatch, type RefObject, type SetStateAction, type JSX, useEffect } from "react"
import IconClose from "@/public/images/icon-cross.svg"
import Image from "next/image"
import Link from "next/link"

export default function SignOutModal({setModalOpen, modalRef, buttonRef}: 
    {
        setModalOpen: Dispatch<SetStateAction<boolean>>, 
        modalRef: RefObject<HTMLDialogElement | null>,
        buttonRef: RefObject<HTMLButtonElement | null>
    }
): JSX.Element{
    
    useEffect(()=>{
        if(modalRef?.current === null){
            return
        }
        modalRef.current.showModal()
    }, [])

    return (
        <dialog 
            ref={modalRef}
            className="max-w-[680px] w-[calc(100vw-2rem)] h-fit text-neutral-0 py-5 px-4 md:p-8 rounded-[1rem] bg-neutral-700
            border border-neutral-500 mx-auto my-[50vh] -translate-y-[50%] relative"
            onKeyDown={(e)=>{
                if(e.key === "Escape"){
                    e.preventDefault()
                    setModalOpen(false)
                    buttonRef.current?.focus()
                }
            }}
        >
            <div className="flex flex-col gap-6">
                <button 
                    className="absolute top-7 right-7 bg-none border-none rounded-full"
                    onClick={() => {
                        setModalOpen(false)
                        buttonRef.current?.focus()
                    }}
                    aria-label="Close modal"
                >
                    <Image src={IconClose} alt="" />
                </button>
                <div>
                    <h2 className="text-[1.5rem] leading-[1.2] font-semibold tracking-[-.5px] pb-5">Sign out?</h2>
                    <p className="leading-[1.4] tracking-[.5px]">
                        {"This will permanently delete all your favorites and logs. If you want to save your data, "} 
                        <Link 
                            className="text-lime-500 underline underline-offset-4"
                            href="/settings/link-profile"
                        >
                            link your account
                        </Link> 
                        {" to an auth provider."}
                    </p>
                </div>
                <hr className="flex-grow border border-neutral-600" />
                <form 
                    action="/auth/logout"
                    method="post"
                >
                    <div className="flex justify-end gap-4 text-medium">
                        <button
                            className="py-2 px-3 flex justify-center items-center rounded-[.5rem]
                            bg-neutral-500 border border-neutral-400 text-neutral-0" 
                            type="button"
                            onClick={() => {
                                setModalOpen(false)
                                buttonRef.current?.focus()
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            className="py-2 px-3 flex justify-center items-center
                            bg-red-500 text-neutral-900 rounded-[.5rem]"
                            type="submit"
                        >
                            Sign out
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    )
}
