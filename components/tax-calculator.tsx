"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Calculator, Calendar } from "lucide-react"

interface TaxResult {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  taxBreakdown: {
    bracket: string
    amount: number
    tax: number
  }[]
  totalTax: number
  netIncome: number
  effectiveRate: number
}

export default function TaxCalculator({
  onResultChange,
}: { onResultChange?: (result: TaxResult | null, period: "annual" | "monthly") => void }) {
  const [period, setPeriod] = useState<"annual" | "monthly">("annual")
  const [inputValue, setInputValue] = useState<string>("")
  const [result, setResult] = useState<TaxResult | null>(null)

  const getAnnualGross = () => {
    const value = Number.parseFloat(inputValue.replace(/,/g, "")) || 0
    return period === "monthly" ? value * 12 : value
  }

  const annualGross = getAnnualGross()

  const pensionPayment = annualGross * 0.08
  const annualRent = Math.min(annualGross * 0.2, 500000)
  const insurance = 300000
  const mortgageDeduction = annualGross * 0.1

  const handlePeriodChange = (newPeriod: "annual" | "monthly") => {
    if (period !== newPeriod && inputValue) {
      const currentValue = Number.parseFloat(inputValue.replace(/,/g, ""))
      let convertedValue: number

      if (newPeriod === "monthly") {
        convertedValue = Math.round(currentValue / 12)
      } else {
        convertedValue = currentValue * 12
      }

      const formatted = convertedValue.toLocaleString("en-US")
      setInputValue(formatted)
    }
    setPeriod(newPeriod)
  }

  useEffect(() => {
    if (annualGross > 0) {
      calculateTax()
    } else {
      setResult(null)
      if (onResultChange) onResultChange(null, period)
    }
  }, [annualGross, period])

  const calculateTax = () => {
    const totalDeductions = mortgageDeduction + pensionPayment + annualRent + insurance
    const taxableIncome = Math.max(0, annualGross - totalDeductions)

    const brackets = [
      { min: 0, max: 800000, rate: 0, name: "First ₦800,000" },
      { min: 800001, max: 3000000, rate: 0.15, name: "₦800,001 - ₦3,000,000" },
      { min: 3000001, max: 12000000, rate: 0.18, name: "₦3,000,001 - ₦12,000,000" },
      { min: 12000001, max: 25000000, rate: 0.21, name: "₦12,000,001 - ₦25,000,000" },
      { min: 25000001, max: 50000000, rate: 0.23, name: "₦25,000,001 - ₦50,000,000" },
      { min: 50000001, max: Number.POSITIVE_INFINITY, rate: 0.25, name: "Above ₦50,000,000" },
    ]

    let remainingIncome = taxableIncome
    let totalTax = 0
    const taxBreakdown: { bracket: string; amount: number; tax: number }[] = []

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.max - bracket.min + 1
      const amountInBracket = Math.min(remainingIncome, bracketSize)
      const taxForBracket = amountInBracket * bracket.rate

      if (amountInBracket > 0) {
        taxBreakdown.push({
          bracket: bracket.name,
          amount: amountInBracket,
          tax: taxForBracket,
        })
        totalTax += taxForBracket
        remainingIncome -= amountInBracket
      }
    }

    const netIncome = annualGross - totalTax
    const effectiveRate = annualGross > 0 ? (totalTax / annualGross) * 100 : 0

    const newResult = {
      grossIncome: annualGross,
      totalDeductions,
      taxableIncome,
      taxBreakdown,
      totalTax,
      netIncome,
      effectiveRate,
    }

    setResult(newResult)
    if (onResultChange) onResultChange(newResult, period)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "")
    if (value === "" || /^\d+$/.test(value)) {
      const formatted = value === "" ? "" : Number.parseInt(value).toLocaleString("en-US")
      setInputValue(formatted)
    }
  }

  const formatCurrency = (amount: number) => {
    const displayAmount = period === "monthly" ? amount / 12 : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(displayAmount)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      {/* Input Section */}
      <Card className="shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            Income & Deductions
          </CardTitle>
          <CardDescription className="text-sm">Enter your gross income (before tax)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium">View Mode</Label>
            <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
              <button
                onClick={() => handlePeriodChange("annual")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  period === "annual"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Annual
              </button>
              <button
                onClick={() => handlePeriodChange("monthly")}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                  period === "monthly"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-4 w-4" />
                Monthly
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="gross-income" className="text-base font-semibold">
              {period === "annual" ? "Annual Gross Income" : "Monthly Gross Income"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted-foreground">
                ₦
              </span>
              <Input
                id="gross-income"
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={inputValue}
                onChange={handleInputChange}
                className="pl-8 text-lg font-semibold"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Automatic Deductions</h3>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Mortgage (FHS)</p>
                  <p className="text-xs text-muted-foreground">10% of gross income</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(mortgageDeduction)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Pension (Pencom)</p>
                  <p className="text-xs text-muted-foreground">8% of gross income</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(pensionPayment)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Annual Rent</p>
                  <p className="text-xs text-muted-foreground">20% (max ₦500,000)</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(annualRent)}</p>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Life Insurance</p>
                  <p className="text-xs text-muted-foreground">Maximum allowed</p>
                </div>
                <p className="text-sm font-semibold">{formatCurrency(insurance)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="space-y-4">
        <Card className="shadow-sm">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">Tax Summary</CardTitle>
            <CardDescription className="text-sm">
              Your calculated tax breakdown ({period === "monthly" ? "monthly view" : "annual view"})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm font-medium text-muted-foreground">Gross Income</span>
                  <span className="text-sm font-semibold text-foreground">{formatCurrency(result.grossIncome)}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                  <span className="text-sm font-medium text-muted-foreground">Total Deductions</span>
                  <span className="text-sm font-semibold text-accent">{formatCurrency(result.totalDeductions)}</span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-secondary p-3">
                  <span className="text-sm font-medium text-secondary-foreground">Taxable Income</span>
                  <span className="text-sm font-bold text-secondary-foreground">
                    {formatCurrency(result.taxableIncome)}
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-lg bg-primary p-4">
                  <span className="font-semibold text-primary-foreground">Total Tax</span>
                  <span className="text-lg font-bold text-primary-foreground md:text-xl">
                    {formatCurrency(result.totalTax)}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg bg-accent p-4">
                  <span className="font-semibold text-accent-foreground">Net Income</span>
                  <span className="text-lg font-bold text-accent-foreground md:text-xl">
                    {formatCurrency(result.netIncome)}
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Effective Tax Rate</p>
                    <p className="text-2xl font-bold text-foreground">{result.effectiveRate.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center md:py-12">
                <Calculator className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-sm text-muted-foreground">Enter your income to see calculations</p>
              </div>
            )}
          </CardContent>
        </Card>

        {result && result.taxBreakdown.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Tax Bracket Breakdown</CardTitle>
              <CardDescription className="text-sm">How your tax is calculated across brackets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.taxBreakdown.map((item, index) => (
                  <div key={index} className="space-y-1 rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-muted-foreground">{item.bracket}</span>
                      {item.tax > 0 && (
                        <span className="text-xs font-semibold text-primary">{formatCurrency(item.tax)}</span>
                      )}
                    </div>
                    <div className="text-sm text-foreground">
                      {formatCurrency(item.amount)} {item.tax > 0 ? `taxed` : "tax-free"}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
