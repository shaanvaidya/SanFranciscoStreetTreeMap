import { useState, forwardRef } from 'react'
import { Box, Typography, IconButton, Button, Dialog, DialogTitle, DialogContent, Slide } from '@mui/material'
import { InfoOutlined as InfoOutlinedIcon, Close as CloseIcon, BugReport as BugReportIcon } from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

const HeaderBar = () => {
  const [openInfo, setOpenInfo] = useState(false)

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
          backgroundColor: 'rgba(248, 249, 250, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid #e0e0e0',
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
              color: '#2e7d32',
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
            sx={{ color: '#2e7d32', ml: 1 }}
            aria-label="Learn more about this map"
          >
            <InfoOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
          <IconButton
            component="a"
            href="https://github.com/shaanvaidya/SanFranciscoStreetTreeMap/issues/new?title=Feedback:+&body=Please+describe+your+request+or+bug+here."
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: { xs: 'inline-flex', sm: 'none' },
              color: '#2e7d32'
            }}
          >
            <BugReportIcon />
          </IconButton>

          <Button
            component="a"
            href="https://github.com/shaanvaidya/SanFranciscoStreetTreeMap/issues/new?title=Feedback:+&body=Please+describe+your+request+or+bug+here."
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              color: '#2e7d32',
              borderColor: '#2e7d32',
              ml: 1,
              whiteSpace: 'nowrap'
            }}
          >
            <BugReportIcon sx={{ mr: 0.5 }} />
            Give Feedback
          </Button>
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
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #ddd',
            color: 'rgba(5, 117, 36, 0.87)'
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
            neighborhood, search by address, or go to your current location. Tree data is sourced from the <a href="https://data.sfgov.org/City-Infrastructure/Street-Tree-List/tkzw-k3nq/about_data" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#2e7d32' }}>San Francisco Public Works Street Tree List</a>.
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


