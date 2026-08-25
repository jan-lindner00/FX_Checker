"use client"
import { HistoryProps } from "@/app/lib/types"
import HistoryInfoCard from "@/app/components/HistoryInfoCard"
import HistoryTimeButton from "@/app/components/HistoryTimeButton"
import Chart from "@/app/components/Chart"
import {useTransition, memo} from "react"

function HistoryBrowserComponent({historyProps}: {historyProps: HistoryProps}){

    const [isPending, startTransition] = useTransition()

    return (
        <section className="text-neutral-0 my-5">
             {isPending ? (
            <div className="py-[2.5rem] text-center flex flex-col items-center gap-4">
                <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">No chart data available</h3>
                <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
                    {`We couldn't load rate history for ${historyProps.base}/${historyProps.quote} right now. This usually clears up in a minute.`}
                </span>
            </div>
            ) : (
            <>    
                <div className="flex gap-5 justify-between gap-5 flex-wrap">
                    <div className="grid grid-cols-2 w-full md:w-max gap-[.625rem] md:flex md:gap-4">
                        <HistoryInfoCard 
                            heading="open"
                            value={historyProps.rateOpen}
                        />
                        <HistoryInfoCard 
                            heading="last"
                            value={historyProps.rateLatest}
                        />
                        <HistoryInfoCard 
                            heading="change"
                            value={historyProps.difference}
                            changed={historyProps.difference}
                        />
                        <HistoryInfoCard 
                            heading="% change"
                            value={historyProps.differncePercent}
                            changed={historyProps.differncePercent}
                            percent={true}
                        />
                    </div>
                    <div className="flex w-fit bg-neutral-700 rounded-[.5rem] self-center">
                        <HistoryTimeButton 
                            timeline={historyProps.timeline} 
                            btnTime="week"
                            startTransition={startTransition}
                            setTimeline={historyProps.setTimeline}
                        >
                                1W
                        </HistoryTimeButton>
                        <HistoryTimeButton 
                            startTransition={startTransition} 
                            timeline={historyProps.timeline} 
                            btnTime="month"
                            setTimeline={historyProps.setTimeline}    
                        >
                            1M
                        </HistoryTimeButton>
                        <HistoryTimeButton 
                            startTransition={startTransition} 
                            timeline={historyProps.timeline} 
                            btnTime="3months"
                            setTimeline={historyProps.setTimeline}
                        >
                            3M
                        </HistoryTimeButton>
                        <HistoryTimeButton 
                            startTransition={startTransition} 
                            timeline={historyProps.timeline} 
                            btnTime="6months"
                            setTimeline={historyProps.setTimeline}
                        >
                            6M
                        </HistoryTimeButton>
                        <HistoryTimeButton 
                            startTransition={startTransition} 
                            timeline={historyProps.timeline} 
                            btnTime="year"
                            setTimeline={historyProps.setTimeline}    
                        >
                            1Y
                        </HistoryTimeButton>
                        <HistoryTimeButton 
                            startTransition={startTransition} 
                            timeline={historyProps.timeline} 
                            btnTime="5years"
                            setTimeline={historyProps.setTimeline}
                        >
                            5Y
                        </HistoryTimeButton>
                    </div>
                </div>
                <Chart base={historyProps.base} quote={historyProps.quote} chartData={historyProps.chartData} timeline={historyProps.timeline}/>
            </>
            )}
    </section>
    )
}

export default memo(HistoryBrowserComponent)