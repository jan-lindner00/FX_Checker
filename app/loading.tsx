import { useId } from "react"
import Image from "next/image"
import SpinningCircle from "@/public/images/spinning-circle.svg"

export default function Loading(){
   const id = useId()

   return (
         <div className="h-dvh flex items-center justify-center text-lg text-neutral-0">
            <h1 id={id} className="sr-only">Loading...</h1>
            <Image 
               className="w-140"
               aria-labelledby={id} 
               src={SpinningCircle} 
               alt="Spinning circle" 
            />
        </div>
   ) 
}