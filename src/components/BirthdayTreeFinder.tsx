import { useState, useMemo, useEffect } from 'react'
import { X, Cake, Map as MapIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TreeInfo } from '../types/tree'
import { findBirthdayTrees, BirthdayResults } from '../utils/birthdayMatch'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

interface BirthdayTreeFinderProps {
  open: boolean
  onClose: () => void
  allTrees: TreeInfo[]
  onResults: (results: BirthdayResults, birthday: Date) => void
  onClear: () => void
  hasResults: boolean
  birthdayDate?: Date | null
}

export default function BirthdayTreeFinder({
  open,
  onClose,
  allTrees,
  onResults,
  onClear,
  hasResults,
  birthdayDate: externalBirthday,
}: BirthdayTreeFinderProps) {
  const isDark = document.documentElement.classList.contains('dark')

  const [month, setMonth] = useState<number>(0)
  const [day, setDay] = useState<number>(0)
  const [year, setYear] = useState<number>(0)
  const [results, setResults] = useState<BirthdayResults | null>(null)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (externalBirthday && month === 0 && day === 0 && year === 0) {
      setMonth(externalBirthday.getMonth() + 1)
      setDay(externalBirthday.getDate())
      setYear(externalBirthday.getFullYear())
      const r = findBirthdayTrees(allTrees, externalBirthday.getMonth() + 1, externalBirthday.getDate(), externalBirthday.getFullYear())
      setResults(r)
      setSearched(true)
    }
  }, [externalBirthday, allTrees])

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => {
    const arr: number[] = []
    for (let y = currentYear; y >= 1920; y--) arr.push(y)
    return arr
  }, [currentYear])

  const daysInMonth = useMemo(() => {
    if (!month) return 31
    if (month === 2) return 29
    return new Date(2001, month, 0).getDate()
  }, [month])

  const canSearch = month > 0 && day > 0 && year > 0

  const handleSearch = () => {
    if (!canSearch) return
    const r = findBirthdayTrees(allTrees, month, day, year)
    setResults(r)
    setSearched(true)
    const birthday = new Date(year, month - 1, day)
    onResults(r, birthday)
  }

  const handleClear = () => {
    setResults(null)
    setSearched(false)
    setMonth(0)
    setDay(0)
    setYear(0)
    onClear()
  }

  const cardBg = 'var(--card-bg)'
  const cardBorder = 'var(--card-border)'
  const headingColor = 'var(--heading)'
  const accentColor = isDark ? '#4caf50' : '#2e7d32'

  const totalMatches = results
    ? results.sameDayAnyYear.length + results.withinWeek.length
    : 0

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent
        className="max-w-sm p-0 overflow-hidden backdrop-blur-[20px]"
        style={{
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.97)' : 'rgba(248, 249, 250, 0.97)',
          border: `1px solid ${isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.08)'}`,
        }}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-2 relative flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46,125,50,0.08)' }}
          >
            <Cake className="h-[18px] w-[18px]" style={{ color: accentColor }} />
          </div>
          <div className="flex-1">
            <p className="font-bold text-base leading-tight" style={{ color: headingColor }}>
              Birthday Trees
            </p>
            <span className="text-[0.7rem] text-muted-foreground">
              Find trees planted on your birthday
            </span>
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
              <X className="h-4 w-4" />
            </Button>
          </DialogClose>
        </div>

        {/* Date picker */}
        <div className="px-5 pt-2 pb-4">
          <div className="flex gap-2 mb-3">
            <div className="flex-[1.2] space-y-1">
              <Label className="text-xs">Month</Label>
              <Select value={month ? String(month) : ''} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[0.7] space-y-1">
              <Label className="text-xs">Day</Label>
              <Select value={day ? String(day) : ''} onValueChange={(v) => setDay(Number(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-[0.9] space-y-1">
              <Label className="text-xs">Year</Label>
              <Select value={year ? String(year) : ''} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!canSearch}
            size="sm"
            className="font-bold text-[0.85rem]"
          >
            Search
          </Button>
        </div>

        {/* Results */}
        {searched && results && (
          <div className="px-5 pb-4">
            <div className="mb-3" style={{ borderBottom: `1px solid ${isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.1)'}` }} />

            {totalMatches > 0 ? (
              <>
                <div className="flex gap-2 mb-3">
                  <StatCell value={results.exactDate.length} label="Born same day" dotColor="#F9A825" cardBg={cardBg} cardBorder={cardBorder} headingColor={headingColor} />
                  <StatCell value={results.sameDayAnyYear.length} label="Same day, any year" dotColor="#4caf50" cardBg={cardBg} cardBorder={cardBorder} headingColor={headingColor} />
                  <StatCell value={results.withinWeek.length} label="Planted within a week" dotColor="#29b6f6" cardBg={cardBg} cardBorder={cardBorder} headingColor={headingColor} />
                </div>

                <div className="flex justify-between items-center">
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1 font-bold text-[0.8rem] bg-transparent border-none cursor-pointer hover:underline p-0"
                    style={{ color: accentColor }}
                  >
                    <MapIcon className="h-4 w-4" />
                    Explore on map
                  </button>
                  {hasResults && (
                    <button
                      onClick={handleClear}
                      className="font-semibold text-[0.75rem] text-muted-foreground bg-transparent border-none cursor-pointer hover:underline p-0"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="p-4 rounded-lg text-center" style={{ backgroundColor: cardBg, border: `1px solid ${cardBorder}` }}>
                <p className="text-sm text-muted-foreground leading-relaxed text-[0.8rem]">
                  No trees with recorded plant dates match your birthday. Only about 36% of SF's street trees have planting dates on record.
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function StatCell({
  value,
  label,
  dotColor,
  cardBg,
  cardBorder,
  headingColor,
}: {
  value: number
  label: string
  dotColor: string
  cardBg: string
  cardBorder: string
  headingColor: string
}) {
  return (
    <div
      className="flex-1 py-2.5 px-2 rounded-lg text-center"
      style={{
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        opacity: value === 0 ? 0.45 : 1,
      }}
    >
      <div className="flex items-center justify-center gap-1.5 mb-0.5">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />
        <span className="font-extrabold text-xl leading-none" style={{ color: headingColor }}>
          {value}
        </span>
      </div>
      <span className="text-[0.65rem] text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  )
}
