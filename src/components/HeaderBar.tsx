import { Info, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  mode: 'light' | 'dark'
  onToggleTheme: () => void
  onInfoClick: () => void
}

const HeaderBar = ({ mode, onToggleTheme, onInfoClick }: Props) => {
  const isDark = mode === 'dark'

  return (
    <div
      className="absolute top-0 left-0 right-0 h-14 px-4 z-3 flex items-center justify-between backdrop-blur-[10px]"
      style={{
        backgroundColor: isDark ? 'rgba(18, 18, 18, 0.9)' : 'rgba(248, 249, 250, 0.9)',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'}`,
      }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <h1 className="text-base sm:text-xl font-bold text-primary whitespace-nowrap overflow-hidden text-ellipsis">
          San Francisco Street Tree Map
        </h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onInfoClick}
          className="text-primary ml-2 h-8 w-8"
          aria-label="About this map"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center ml-2 gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-primary h-8 w-8"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  )
}

export default HeaderBar
