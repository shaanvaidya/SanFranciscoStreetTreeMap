import { useState, forwardRef } from 'react'
import { Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, Slide } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon, Close as CloseIcon, DarkMode, LightMode } from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'
import { useTheme } from '@mui/material/styles'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

type Props = {
  mode: 'light' | 'dark'
  onToggleTheme: () => void
}

const HeaderBar = ({ mode, onToggleTheme }: Props) => {
  const [openInfo, setOpenInfo] = useState(false)
  const theme = useTheme()
  const isDark = mode === 'dark'

  const headerBg = isDark ? 'rgba(18, 18, 18, 0.9)' : 'rgba(248, 249, 250, 0.9)'
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e0e0e0'
  const dialogBg = isDark ? '#1e1e1e' : '#f8f9fa'
  const dialogBorder = isDark ? 'rgba(255,255,255,0.08)' : '#ddd'

  return (
    <>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 56,
          px: 2,
          backgroundColor: headerBg,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${borderColor}`,
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              fontSize: { xs: '1rem', sm: '1.25rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            San Francisco Street Tree Map
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenInfo(true)}
            sx={{ color: theme.palette.primary.main, ml: 1 }}
            aria-label="Learn more about this map"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1, gap: 0.5 }}>
          <IconButton
            onClick={onToggleTheme}
            size="small"
            sx={{ color: theme.palette.primary.main }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
          </IconButton>

        </Box>
      </Box>

      <Dialog
        open={openInfo}
        onClose={() => setOpenInfo(false)}
        TransitionComponent={Transition}
        keepMounted
        fullScreen
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 2,
            maxWidth: { sm: 500 },
            margin: { sm: 'auto' }
          }
        }}
        PaperProps={{
          sx: {
            maxHeight: { xs: 270, sm: 250 },
            mx: 2,
            my: '20vh',
            borderRadius: 2,
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1,
            backgroundColor: dialogBg,
            borderBottom: `1px solid ${dialogBorder}`,
            color: theme.palette.primary.main,
          }}
        >
          <Typography variant="h6">About This Map</Typography>
          <IconButton onClick={() => setOpenInfo(false)} size="small" aria-label="Close">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ flexDirection: 'column', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            This interactive map shows street trees in San Francisco. You can filter by species,
            neighborhood, search by address, or go to your current location. Tree data is sourced from the{' '}
            <a
              href="https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq/about_data"
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: theme.palette.primary.main }}
            >
              San Francisco Public Works Street Tree List
            </a>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built with ❤️ using Mapbox and React.
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default HeaderBar
