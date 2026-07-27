import type { ChartData, CustomTickProps } from "@/app/types/types";
import { Tooltip, XAxis, YAxis, ReferenceLine, AreaChart, Area} from "recharts";
import { Temporal } from "@js-temporal/polyfill";
import {useMemo, memo} from "react"
import useWindowSize from "@/app/lib/hooks/useWindowSize";

const CustomXTick = ({ x, y, payload, data }: CustomTickProps) => {
  if(x === undefined || y === undefined || !payload || data.length < 2){
    return null
  }
  const isLast = payload.value === data[data.length - 1].time;
  const isFirst = payload.value === data[0].time;
  return (
    <text
      x={x}
      y={y}
      textAnchor={isFirst ? "start" : isLast ? "middle": "middle"}
      fill="#9d9d9d"
      fontSize={10}
      letterSpacing=".5px"
    >
      {payload.value}
    </text>
  );
};

const CustomYTick = ({ x, y, payload, data }: CustomTickProps) => {
  if(x === undefined || y === undefined || !payload || data.length < 2){
    return null
  }
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      fill="#9d9d9d"
      fontSize={10}
      letterSpacing=".5px"
    >
      {payload.value}
    </text>
  );
};

function Chart({chartData, base, quote, timeline}:
    {chartData: ChartData[], base: string, quote: string, timeline: string}
){
  const {width} = useWindowSize()

  const chartDataFormatted = useMemo(()=>{
    return chartData.map(data => (
      {
        ...data,
        time: (timeline === "year" || timeline === "5years") ? (
            Temporal.PlainDate.from(data.time).toLocaleString("en-GB", {day: "2-digit", month: "short", year: "2-digit"})
          ):(
            Temporal.PlainDate.from(data.time).toLocaleString("en-GB", {day: "2-digit", month: "short"})
          )
      }
    ))
  }, [chartData, timeline])

  const xTicks = chartDataFormatted.length > 0 ? width  < 768 || timeline === "week" ? (
      [chartDataFormatted[0].time, chartDataFormatted[Math.round((chartDataFormatted.length-1)/2)].time, chartDataFormatted[chartDataFormatted.length-1].time]) : (
        [chartDataFormatted[0].time, chartDataFormatted[Math.round((chartDataFormatted.length-1)/4)].time,
         chartDataFormatted[Math.round((chartDataFormatted.length-1)/2)].time, chartDataFormatted[Math.round((chartDataFormatted.length-1)*3/4)].time, 
         chartDataFormatted[chartDataFormatted.length-1].time] ): []

  const allValuesTheSame = useMemo(()=>{
    return chartDataFormatted.every(data => data.rate === chartDataFormatted[0].rate)
  }, [chartDataFormatted])  

  function getDateText(): string{
    return Temporal.Now.plainDateTimeISO().toLocaleString("en-GB", {day: "2-digit", month: "short", hour:"2-digit", minute:"2-digit", hour12: false})
  }

  function getMedianRate(){
    if(chartDataFormatted.length === 0){
      return {min: 0, mid: 0, max: 0}
    }
    if(chartDataFormatted.length === 1){
      return {min: chartDataFormatted[0].rate, mid: chartDataFormatted[0].rate, max: chartDataFormatted[0].rate}
    }
    const rates = chartDataFormatted.map(data => data.rate)
    const max = Math.max(...rates)
    const min = Math.min(...rates)
    const smallDifference = (max - min) < 0.0002

    return {min: min, mid: Number(((max + min)/2).toFixed(smallDifference ? 5 : 4)), max: max}
  }

  return(
      <section className="mt-5 py-4 px-3 md:p-5 bg-neutral-700 border border-neutral-600 rounded-[1rem]">
          <div className="mb-5 flex justify-between gap-3 items-center leading-[1.2]">
            <span className="text-neutral-0 text-[1rem] text-medium tracking-[1px]">
              {base}/{quote}
            </span>
            <span className="text-neutral-100 text-[.75rem] tracking-[.5px]">
              {chartDataFormatted[chartDataFormatted.length-1].rate} · {getDateText().split(",").join("")}{" CEST"}
            </span>
          </div>
          <div className="h-[18.625rem]">
            <AreaChart
              aria-label={`Chart that displays the development of ${base} to ${quote} exchange rate over the last ${timeline}`}
              style={{width: "100%", height: "18.625rem", background: "#171719"}}
              responsive
              data={chartDataFormatted}
            >
              <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#cef739" stopOpacity={1} />
                <stop offset="100%" stopColor="#171719" stopOpacity={0} />
              </linearGradient>
            </defs>
              <XAxis 
                style={{color: "#9d9d9d", fontSize: ".625rem", letterSpacing: ".5px"}}
                tickMargin={16}
                tick={<CustomXTick data={chartDataFormatted}/>}
                ticks={xTicks}
                dataKey="time"
                axisLine={false}
                tickLine={false}/>
              <YAxis 
                style={{color: "#9d9d9d", fontSize: ".625rem", letterSpacing: ".5px"}}
                tickMargin={10}
                type="number"
                tickCount={2}
                tick={<CustomYTick data={chartDataFormatted}/>}
                axisLine={false}
                tickLine={false}
                domain={!allValuesTheSame ? [getMedianRate().min, getMedianRate().max] : [parseFloat((getMedianRate().min * 0.99).toFixed(5)), parseFloat((getMedianRate().max * 1.01).toFixed(5))]}
                dataKey="rate"/>
              <ReferenceLine y={allValuesTheSame ? parseFloat((getMedianRate().min * 0.99).toFixed(5)) : getMedianRate().min} 
              strokeDasharray="5 5" strokeWidth={1.5} stroke="#2e2e2e"/>
              <ReferenceLine y={getMedianRate().mid} strokeDasharray="5 5" strokeWidth={1.5} stroke="#2e2e2e"
              label={{ value: getMedianRate().mid, position: 'left', fill: "#9d9d9d", fontSize: 10, offset: 16}}
              />
              <ReferenceLine y={allValuesTheSame ? parseFloat((getMedianRate().max * 1.01).toFixed(5)) : getMedianRate().max}
              strokeDasharray="5 5" strokeWidth={1.5} stroke="#2e2e2e"
              />
              <Area type="linear" dataKey="rate" stroke="#cef739" strokeWidth={2} fill="url(#colorValue)"/>
              
              <Tooltip contentStyle={{background: "#0a0a0a", border: "none", borderRadius: ".5rem"}}
              labelStyle={{color: "#9d9d9d"}}
              itemStyle={{color: "#cef739"}}
              />
            </AreaChart>
          </div>
      </section>
  )
}

export default memo(Chart)