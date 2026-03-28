import { MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TreeInfo } from '../types/tree'

export const TreeSummaryBar = ({
  tree,
  onMoreDetails,
  onClose,
}: {
  tree: TreeInfo;
  onMoreDetails: () => void;
  onClose: () => void;
}) => {
  const isDark = document.documentElement.classList.contains('dark')

  const bg = isDark ? 'rgba(18, 18, 18, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const borderTop = isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(46, 125, 50, 0.2)'

  return (
    <div
      className="absolute bottom-0 w-full z-[1100] backdrop-blur-[10px] px-4 py-3 flex items-center justify-between gap-2 min-h-[85px] overflow-hidden box-border"
      style={{
        backgroundColor: bg,
        borderTop: `2px solid ${borderTop}`,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{
              backgroundColor: tree.color,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }}
          />
          <p className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-base" style={{ color: 'var(--heading)' }}>
            {tree.common_name}
          </p>
        </div>

        <p className="italic text-[0.8rem] leading-tight mb-1" style={{ color: isDark ? '#a5d6a7' : '#4caf50' }}>
          {tree.scientific_name}
        </p>

        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4 text-secondary shrink-0" />
          <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {tree.address}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={onMoreDetails}
          className="text-primary font-medium text-sm px-3 py-1"
        >
          Details
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground h-8 w-8"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

export default TreeSummaryBar
