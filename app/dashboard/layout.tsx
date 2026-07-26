import Image from "next/image"
import { Suspense } from "react"
import Header from "@/app/components/Header"
import Logo from "@/public/images/logo.svg"
import MainBrowser from "../components/MainBrowser"

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <Suspense fallback={(
          <header>
            <section className="text-neutral-200 p-4 md:py-5 md:px-6 flex justify-between items-center">
                <Image className="w-[107.15px] md:w-[139.3px]" src={Logo} alt="FX Checker" loading="eager"/>
                <div className="flex items-center gap-4">
                    <p className="text-[.625rem] md:text-[.875rem] leading-[1.2] tracking-[.5px] md:tracking-[1px]">55 CURRENCIES · EOD · ECB DATA</p>
                </div>
            </section>
        </header>
        )}>
          <Header/>
        </Suspense>
        <main className="px-4 py-8 md:px-6 md:py-12 md:flex flex-col md:align-center w-full max-w-[1100px] mx-auto">
          <Suspense fallback={(
            <div className="h-dvh flex items-center justify-center text-lg text-neutral-0">
              <h1>Loading...</h1>
            </div>
          )}
          >
            <MainBrowser />
            {children}
          </Suspense>
        </main>
    </>
  );
}
