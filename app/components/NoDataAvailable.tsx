export default function NoDataAvailable({heading, text}: {heading: string, text: string}){
    return(
        <div role="status" className="py-[2.5rem] text-center flex flex-col items-center gap-4">
            <h3 className="text-neutral-100 text-[1.25rem] tracking-[-.5px] leading-[1.2] mb-4">{text}</h3>
            <span className="max-w-lg text-neutral-200 text-[.875rem] leading-[1.2] tracking-[1px]">
                {heading}
            </span>
        </div>
    )
}