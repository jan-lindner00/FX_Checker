import AuthWrapper from "@/app/components/Authentication/AuthWrapper";
import Link from "next/link";

export default async function AuthError(){
    return(
        <AuthWrapper 
            heading="Password reset"
            description="Your password has been reset successfully."
        >
            <section className="mt-8">
                <Link href="/login" 
                    replace 
                    className="w-full h-12 flex items-center justify-center rounded-full
                    text-medium bg-lime-500">
                    Back to sign in
                </Link>
            </section>
        </AuthWrapper>
    )
}