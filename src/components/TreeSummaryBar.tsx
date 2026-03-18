import { Box, Typography, Button, IconButton } from '@mui/material'
import { LocationOn, Close as CloseIcon } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
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
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const bg = isDark ? 'rgba(22, 26, 23, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const headingColor = isDark ? '#c8e6c9' : '#1a3d2a'
  const italicColor = isDark ? '#a5d6a7' : '#4caf50'
  const accentColor = theme.palette.primary.main

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        zIndex: 1100,
        backgroundColor: bg,
        backdropFilter: 'blur(10px)',
        borderRadius: '16px 16px 0 0',
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        minHeight: 85,
        overflow: 'hidden',
        boxSizing: 'border-box',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* Drag indicator pill */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 36,
          height: 4,
          borderRadius: 2,
          backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
        }}
      />

      <Box sx={{ flex: 1, minWidth: 0, mt: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: tree.color,
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: headingColor,
              fontSize: '1rem',
            }}
          >
            {tree.common_name}
          </Typography>
        </Box>

        <Typography
          variant="body2"
          sx={{
            fontStyle: 'italic',
            color: italicColor,
            lineHeight: 1.2,
            fontSize: '0.8rem',
            mb: 0.5,
          }}
        >
          {tree.scientific_name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <LocationOn sx={{ fontSize: 16, color: '#7fb88a' }} />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              color: 'text.secondary',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {tree.address}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Button
          variant="contained"
          onClick={onMoreDetails}
          size="small"
          sx={{
            backgroundColor: accentColor,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.8rem',
            px: 2,
            py: 0.5,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              boxShadow: 'none',
            }
          }}
        >
          Details
        </Button>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  )
}

export default TreeSummaryBar
