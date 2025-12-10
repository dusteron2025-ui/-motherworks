"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        // Container principal com design premium
        "p-6",
        "bg-gradient-to-br from-white via-white to-slate-50/80",
        "rounded-[2rem]",
        "shadow-[0_25px_80px_-20px_rgba(0,0,0,0.12)]",
        "border border-slate-100/60",
        "backdrop-blur-xl",
        className
      )}
      classNames={{
        // Layout do mês
        months: "flex flex-col gap-4",
        month: "space-y-6",

        // Cabeçalho com título e navegação
        month_caption: "flex justify-center pt-2 relative items-center mb-4",
        caption_label: "text-xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent tracking-tight",

        // Botões de navegação
        nav: "flex items-center justify-between absolute inset-x-0 top-2",
        button_previous: cn(
          "h-10 w-10 inline-flex items-center justify-center",
          "bg-white/90 backdrop-blur-sm",
          "rounded-xl",
          "border border-slate-100",
          "shadow-lg shadow-slate-200/50",
          "text-slate-500",
          "transition-all duration-300",
          "hover:bg-gradient-to-br hover:from-teal-50 hover:to-white",
          "hover:border-teal-200 hover:text-teal-600",
          "hover:scale-110 hover:shadow-xl hover:shadow-teal-100/50",
          "active:scale-95"
        ),
        button_next: cn(
          "h-10 w-10 inline-flex items-center justify-center",
          "bg-white/90 backdrop-blur-sm",
          "rounded-xl",
          "border border-slate-100",
          "shadow-lg shadow-slate-200/50",
          "text-slate-500",
          "transition-all duration-300",
          "hover:bg-gradient-to-br hover:from-teal-50 hover:to-white",
          "hover:border-teal-200 hover:text-teal-600",
          "hover:scale-110 hover:shadow-xl hover:shadow-teal-100/50",
          "active:scale-95"
        ),

        // Tabela de dias
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full justify-between mb-2",
        weekday: cn(
          "text-slate-400 font-semibold text-[0.7rem] uppercase tracking-[0.15em]",
          "w-12 h-10 flex items-center justify-center"
        ),
        week: "flex w-full justify-between mt-1",

        // Células dos dias
        day: cn(
          "h-12 w-12 p-0.5 text-center text-sm",
          "relative focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          "h-11 w-11 p-0",
          "font-medium text-slate-700",
          "rounded-2xl",
          "inline-flex items-center justify-center",
          "cursor-pointer",
          "transition-all duration-300 ease-out",
          // Hover
          "hover:bg-gradient-to-br hover:from-teal-50 hover:to-teal-100/60",
          "hover:text-teal-700",
          "hover:shadow-lg hover:shadow-teal-100/60",
          "hover:scale-[1.15]",
          // Focus
          "focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2",
          // Active
          "active:scale-95"
        ),

        // Estados especiais
        selected: cn(
          "!bg-gradient-to-br !from-teal-500 !to-teal-600",
          "!text-white !font-bold",
          "!shadow-xl !shadow-teal-500/40",
          "!scale-105",
          "hover:!from-teal-600 hover:!to-teal-700",
          "hover:!shadow-2xl hover:!shadow-teal-500/50"
        ),
        today: cn(
          "bg-teal-50",
          "text-teal-600 font-bold"
        ),
        outside: cn(
          "text-slate-300 opacity-40",
          "hover:opacity-60",
          "aria-selected:bg-slate-50/30 aria-selected:text-slate-400"
        ),
        disabled: cn(
          "text-slate-200 opacity-30",
          "cursor-not-allowed",
          "hover:bg-transparent hover:scale-100 hover:shadow-none"
        ),
        hidden: "invisible",
        range_middle: "aria-selected:bg-teal-50 aria-selected:text-teal-800 rounded-none",
        range_end: "",

        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (
          <div className="flex items-center justify-center">
            {orientation === "left" ? (
              <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
            ) : (
              <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
            )}
          </div>
        ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
