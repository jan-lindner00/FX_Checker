import clsx from "clsx";
import { memo, SetStateAction } from "react";

function HistoryTimeButton({timeline, btnTime, setTimeline, children}:
    {
        timeline: string, 
        btnTime: "week" | "month" | "3months" | "6months" | "year" | "5years",
        setTimeline: React.Dispatch<SetStateAction<"month" | "week" | "3months" | "6months" | "year" | "5years">>,
        children: Readonly<React.ReactNode>
    }
){
    const isActive = btnTime === timeline
    const styles = clsx("text-[.75rem] leading-[1.2] tracking-[.5px] py-[.875rem] px-4 rounded-[.5rem] uppercase focus:relative focus:z-100",
        isActive && "text-neutral-0 bg-neutral-500", !isActive && "text-neutral-200 bg-neutral-700"
    )

    return (
        <button
            className={styles} 
            onClick={() => setTimeline(btnTime)}
            aria-label={`Set history timeline to ${btnTime}`}
        >
            {children}
        </button>
    )
}

export default memo(HistoryTimeButton)