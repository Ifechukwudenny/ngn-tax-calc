"use client"

import { useState } from "react"
import TaxCalculator from "@/components/tax-calculator"
import TaxExplanation from "@/components/tax-explanation"

interface TaxResult {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  netIncome: number
  effectiveRate: number
}

export default function Home() {
  const [calculationResult, setCalculationResult] = useState<TaxResult | null>(null)
  const [period, setPeriod] = useState<"annual" | "monthly">("annual")

  const handleResultChange = (result: TaxResult | null, viewPeriod: "annual" | "monthly") => {
    setCalculationResult(result)
    setPeriod(viewPeriod)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Nigeria Tax Calculator
          </h1>
          <p className="mt-2 text-pretty text-base text-muted-foreground sm:mt-3 sm:text-lg">
            Calculate your personal income tax based on Nigerian tax laws
          </p>
        </div>
        <TaxCalculator onResultChange={handleResultChange} />
        {calculationResult && (
          <TaxExplanation
            grossIncome={calculationResult.grossIncome}
            totalDeductions={calculationResult.totalDeductions}
            taxableIncome={calculationResult.taxableIncome}
            totalTax={calculationResult.totalTax}
            netIncome={calculationResult.netIncome}
            period={period}
          />
        )}
      </div>
    </main>
  )
}
