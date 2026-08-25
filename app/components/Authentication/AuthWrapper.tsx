import Image from "next/image"
import Logo from "@/public/images/logo.svg"

export default function AuthWrapper({heading, description="", classDescription, children}:
    {heading: string, description: string, classDescription?: string, children: React.ReactNode}
){
    return(
        <div className="grid grid-cols-1 min-h-dvh place-items-center p-4 md:py-8 md:px-16">
           <div className="w-full max-w-[640px]">
            <header className="pb-8 border-b border-neutral-600">
                <Image 
                    src={Logo} 
                    className="w-[280px]" 
                    alt="FX Checker"
                    loading="eager"
                 />
                <h1 className="text-neutral-0 text-[2rem] pt-[2.5rem] pb-2 tracking-[-.5px]">
                    {heading}
                </h1>
                <p className={`${classDescription} text-neutral-200 text-medium leading-[1.5] tracking-[.5px]`}>
                    {description}
                </p>
            </header>
            <main>
                {children}
            </main>
            </div>
        </div>
    )
}