import AuthWrapper from "@/app/components/Authentication/AuthWrapper"
import Link from "next/link"

export default function ConfirmationSuccess(){
    return(
        <AuthWrapper 
                heading="Account linked"
                description="Your account has been linked successfuly to your Google account"
        >
            <section className="text-medium">
                <Link href="/login" replace className="w-full rounded-full h-12 flex items-center 
                justify-center bg-lime-500 text-neutral-500 mt-8">
                    Back to login
                </Link>
            </section>
        </AuthWrapper>
    )
}