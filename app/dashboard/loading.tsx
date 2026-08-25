import Image from "next/image"
import SpinningCircle from "@/public/images/spinning-circle.svg"

export default function Loading(){
   return (
         <div className="h-dvh flex items-center justify-center text-lg text-neutral-0">
            <h1 className="sr-only">Loading...</h1>
            <Image 
               className="w-140" 
               src={SpinningCircle} 
               alt=""
            />
        </div>
   ) 
}