import { useState, useMemo, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Close, Cake, Map as MapIcon } from '@mui/icons-material'
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const [month, setMonth] = useState<number>(0)
  const [day, setDay] = useState<number>(0)
  const [year, setYear] = useState<number>(0)
  const [results, setResults] = useState<BirthdayResults | null>(null)
  const [searched, setSearched] = useState(false)

  // Sync from external birthday (e.g. URL param)
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

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)'
  const cardBorder = isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46, 125, 50, 0.12)'
  const headingColor = isDark ? '#c8e6c9' : '#1b5e20'
  const accentColor = theme.palette.primary.main

  const selectSx = {
    borderRadius: 2,
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(76,175,80,0.2)' : 'rgba(46,125,50,0.15)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: isDark ? 'rgba(76,175,80,0.4)' : 'rgba(46,125,50,0.3)',
    },
  }

  const totalMatches = results
    ? results.sameDayAnyYear.length + results.withinWeek.length
    : 0

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: isDark ? 'rgba(18, 18, 18, 0.97)' : 'rgba(248, 249, 250, 0.97)',
          backdropFilter: 'blur(20px)',
          backgroundImage: 'none',
          border: `1px solid ${isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.08)'}`,
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ px: 2.5, pt: 2, pb: 1, position: 'relative', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isDark ? 'rgba(76,175,80,0.15)' : 'rgba(46,125,50,0.08)',
              flexShrink: 0,
            }}
          >
            <Cake sx={{ fontSize: 18, color: accentColor }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, color: headingColor, fontSize: '1rem', lineHeight: 1.2 }}>
              Birthday Trees
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Find trees planted on your birthday
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Inspired by{' '}
              <a
                href="https://transpomaps.org/projects/san-francisco/birthday-trees"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'inherit', textDecoration: 'underline' }}
              >
                TranspoMaps
              </a>
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>

        {/* Date picker */}
        <Box sx={{ px: 2.5, pt: 1, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
            <FormControl size="small" sx={{ flex: 1.2 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={month || ''}
                label="Month"
                onChange={(e) => setMonth(Number(e.target.value))}
                sx={selectSx}
              >
                {MONTHS.map((m, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 0.7 }}>
              <InputLabel>Day</InputLabel>
              <Select
                value={day || ''}
                label="Day"
                onChange={(e) => setDay(Number(e.target.value))}
                sx={selectSx}
              >
                {Array.from({ length: daysInMonth }, (_, i) => (
                  <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ flex: 0.9 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={year || ''}
                label="Year"
                onChange={(e) => setYear(Number(e.target.value))}
                sx={selectSx}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>{y}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={!canSearch}
            size="small"
            sx={{
              py: 0.75,
              px: 3,
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: 2,
              textTransform: 'none',
              boxShadow: 'none',
              alignSelf: 'flex-start',
              '&:hover': { boxShadow: 'none' },
            }}
          >
            Search
          </Button>
        </Box>

        {/* Results */}
        {searched && results && (
          <Box sx={{ px: 2.5, pb: 2 }}>
            <Box sx={{ mb: 1.5, borderBottom: `1px solid ${isDark ? 'rgba(76,175,80,0.12)' : 'rgba(46,125,50,0.1)'}` }} />

            {totalMatches > 0 ? (
              <>
                {/* Three stat columns */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <StatCell
                    value={results.exactDate.length}
                    label="Born same day"
                    dotColor="#F9A825"
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    headingColor={headingColor}
                  />
                  <StatCell
                    value={results.sameDayAnyYear.length}
                    label="Same day, any year"
                    dotColor="#4caf50"
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    headingColor={headingColor}
                  />
                  <StatCell
                    value={results.withinWeek.length}
                    label="Planted within a week"
                    dotColor="#29b6f6"
                    cardBg={cardBg}
                    cardBorder={cardBorder}
                    headingColor={headingColor}
                  />
                </Box>

                {/* Explore link */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    onClick={onClose}
                    startIcon={<MapIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      color: accentColor,
                      px: 0,
                      '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                    }}
                  >
                    Explore on map
                  </Button>
                  {hasResults && (
                    <Button
                      onClick={handleClear}
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        px: 0,
                        minWidth: 0,
                        '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ p: 2, borderRadius: 2, backgroundColor: cardBg, border: `1px solid ${cardBorder}`, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.8rem' }}>
                  No trees with recorded plant dates match your birthday. Only about 36% of SF's street trees have planting dates on record.
                </Typography>
              </Box>
            )}
          </Box>
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
    <Box
      sx={{
        flex: 1,
        py: 1.25,
        px: 1,
        borderRadius: 2,
        backgroundColor: cardBg,
        border: `1px solid ${cardBorder}`,
        textAlign: 'center',
        opacity: value === 0 ? 0.45 : 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mb: 0.25 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dotColor, flexShrink: 0 }} />
        <Typography sx={{ fontWeight: 800, color: headingColor, fontSize: '1.25rem', lineHeight: 1 }}>
          {value}
        </Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}>
        {label}
      </Typography>
    </Box>
  )
}
