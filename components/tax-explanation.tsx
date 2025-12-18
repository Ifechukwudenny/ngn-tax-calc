import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info, Coins, Calculator, PiggyBank, Home, Shield } from "lucide-react"

interface TaxExplanationProps {
  grossIncome: number
  totalDeductions: number
  taxableIncome: number
  totalTax: number
  netIncome: number
  period: "annual" | "monthly"
}

export default function TaxExplanation({
  grossIncome,
  totalDeductions,
  taxableIncome,
  totalTax,
  netIncome,
  period,
}: TaxExplanationProps) {
  const pensionDeduction = grossIncome * 0.08
  const mortgageDeduction = grossIncome * 0.1
  const rentDeduction = Math.min(grossIncome * 0.2, 500000)
  const insuranceDeduction = 300000

  const formatCurrency = (amount: number) => {
    const displayAmount = period === "monthly" ? amount / 12 : amount
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(displayAmount)
  }

  const calculateTaxBreakdown = () => {
    const brackets = [
      { min: 0, max: 800000, rate: 0, name: "First ₦800,000 at 0%" },
      { min: 800001, max: 3000000, rate: 0.15, name: "at 15%" },
      { min: 3000001, max: 12000000, rate: 0.18, name: "at 18%" },
      { min: 12000001, max: 25000000, rate: 0.21, name: "at 21%" },
      { min: 25000001, max: 50000000, rate: 0.23, name: "at 23%" },
      { min: 50000001, max: Number.POSITIVE_INFINITY, rate: 0.25, name: "at 25%" },
    ]

    let remainingIncome = taxableIncome
    const breakdown: { description: string; tax: number }[] = []

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break

      const bracketSize = bracket.max - bracket.min + 1
      const amountInBracket = Math.min(remainingIncome, bracketSize)
      const taxForBracket = amountInBracket * bracket.rate

      if (amountInBracket > 0) {
        if (bracket.rate === 0) {
          breakdown.push({
            description: bracket.name,
            tax: 0,
          })
        } else {
          breakdown.push({
            description: `Next ${formatCurrency(amountInBracket)} ${bracket.name}`,
            tax: taxForBracket,
          })
        }
        remainingIncome -= amountInBracket
      }
    }

    return breakdown
  }

  const taxBreakdown = calculateTaxBreakdown()

  return (
    <div className="mt-8 space-y-6">
      {/* Main Explanation Card */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Info className="h-5 w-5 text-primary md:h-6 md:w-6" />
            How This Calculator Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-pretty text-sm leading-relaxed text-foreground md:text-base">
              This calculator helps you understand how much tax you'll pay on your annual income in Nigeria. It
              automatically calculates your tax based on Nigerian tax laws and includes all the deductions you're
              entitled to.
            </p>
            <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Simply enter your yearly salary or income, and we'll show you exactly how much tax you owe and how much
              money you'll take home after taxes. You can toggle between annual and monthly views to see your {period}{" "}
              breakdown.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tax Brackets Explanation */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="h-5 w-5 text-primary" />
            Understanding Tax Brackets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Nigeria uses a progressive tax system, which means the more you earn, the higher percentage you pay on the
            additional income. Here's how it works:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">First ₦800,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    You pay no tax on the first ₦800,000 you earn
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  0%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">₦800,001 - ₦3,000,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Pay 15% only on income between these amounts
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  15%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">₦3,000,001 - ₦12,000,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Pay 18% only on income between these amounts
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  18%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">₦12,000,001 - ₦25,000,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Pay 21% only on income between these amounts
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  21%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">₦25,000,001 - ₦50,000,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">
                    Pay 23% only on income between these amounts
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  23%
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/50 p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">Above ₦50,000,000</p>
                  <p className="text-xs text-muted-foreground md:text-sm">Pay 25% on any income above this amount</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary md:px-3 md:text-sm">
                  25%
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions Explanation */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Coins className="h-5 w-5 text-primary" />
            What Are Deductions?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Deductions are amounts subtracted from your gross income before calculating tax. This means you don't pay
            tax on these portions of your income. The calculator automatically applies these deductions for you:
          </p>

          <div className="space-y-3">
            <div className="rounded-lg border border-l-4 border-l-primary bg-card p-3 md:p-4">
              <div className="flex items-start gap-3">
                <PiggyBank className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">Pension Contribution (Pencom)</p>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                    8% of your income goes to your retirement pension fund. This is automatically deducted from your
                    taxable income, so you don't pay tax on it.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-l-4 border-l-primary bg-card p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">Mortgage Relief (FHS)</p>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                    If you're paying a mortgage through the Federal Housing Scheme, 10% of your gross income can be
                    deducted from your taxable income to help reduce your tax burden.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-l-4 border-l-primary bg-card p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Home className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">Annual Rent Relief</p>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                    You can deduct 20% of your annual rent (up to a maximum of ₦500,000) from your taxable income. This
                    helps renters reduce their tax bill.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-l-4 border-l-primary bg-card p-3 md:p-4">
              <div className="flex items-start gap-3">
                <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground md:text-base">Life Insurance</p>
                  <p className="text-xs leading-relaxed text-muted-foreground md:text-sm">
                    Premium payments for life insurance policies are deductible up to a maximum of ₦300,000 per year,
                    encouraging you to protect your family's future.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Example Calculation - Now using dynamic values */}
      <Card className="border-accent shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calculator className="h-5 w-5 text-accent" />
            Your Tax Calculation ({period === "monthly" ? "Monthly" : "Annual"})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3 md:p-4">
              <p className="text-sm font-semibold text-foreground md:text-base">
                Based on your {period} income of {formatCurrency(grossIncome)}:
              </p>
            </div>

            <div className="space-y-2 text-sm md:text-base">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Gross Income:</span>
                <span className="font-semibold">{formatCurrency(grossIncome)}</span>
              </div>

              <Separator />
              <p className="text-xs font-semibold text-muted-foreground">Deductions:</p>

              <div className="flex justify-between pl-4">
                <span className="text-muted-foreground">Pension (8%):</span>
                <span>- {formatCurrency(pensionDeduction)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-muted-foreground">Mortgage (10%):</span>
                <span>- {formatCurrency(mortgageDeduction)}</span>
              </div>
              <div className="flex justify-between pl-4">
                <span className="text-muted-foreground">Rent (20% max ₦500k):</span>
                <span>- {formatCurrency(rentDeduction)}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2 pl-4">
                <span className="text-muted-foreground">Insurance:</span>
                <span>- {formatCurrency(insuranceDeduction)}</span>
              </div>

              <div className="flex justify-between rounded-lg bg-secondary p-2 font-semibold">
                <span>Taxable Income:</span>
                <span>{formatCurrency(taxableIncome)}</span>
              </div>

              <Separator />
              <p className="text-xs font-semibold text-muted-foreground">Tax Calculation:</p>

              <div className="space-y-1 pl-4 text-xs md:text-sm">
                {taxBreakdown.map((item, index) => (
                  <p key={index} className="text-muted-foreground">
                    {item.description} = {formatCurrency(item.tax)}
                  </p>
                ))}
              </div>

              <div className="flex justify-between rounded-lg bg-primary p-3 font-semibold text-primary-foreground">
                <span>Total Tax:</span>
                <span>{formatCurrency(totalTax)}</span>
              </div>

              <div className="flex justify-between rounded-lg bg-accent p-3 font-semibold text-accent-foreground">
                <span>Take-Home Income:</span>
                <span>{formatCurrency(netIncome)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className="border-muted-foreground/20 bg-muted/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="list-inside space-y-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                This calculator is for personal income tax estimation only and may not reflect all special cases or
                exemptions.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>All calculations are based on current Nigerian tax laws and regulations.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                Your employer will typically deduct these taxes from your salary each month through the Pay As You Earn
                (PAYE) system.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>
                For accurate tax filing and advice specific to your situation, please consult with a qualified tax
                professional or your state's Internal Revenue Service.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
