import { useState } from 'react'
import { Box, Typography, Button, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material'
import { EditNote, Close as CloseIcon } from '@mui/icons-material'
import { TreeInfo } from '../types/tree'

const ISSUE_TYPES = [
  'Wrong species',
  'Wrong location',
  'Tree no longer exists',
  'Missing tree',
  'Other',
]

const CONTACT_EMAIL = 'me@shaanvaidya.com'

const focusGreen = {
  '& .MuiOutlinedInput-root': { '&.Mui-focused fieldset': { borderColor: '#2e7d32' } },
  '& .MuiInputLabel-root.Mui-focused': { color: '#2e7d32' },
}

export const SuggestEdit = ({ tree }: { tree: TreeInfo }) => {
  const [open, setOpen] = useState(false)
  const [issueType, setIssueType] = useState('')
  const [notes, setNotes] = useState('')

  const handleClose = () => {
    setOpen(false)
    setIssueType('')
    setNotes('')
  }

  const handleSubmit = () => {
    const subject = `[Tree Map Feedback] Tree #${tree.id} at ${tree.address}`
    const body = [
      `Tree ID: ${tree.id}`,
      `Address: ${tree.address}`,
      `Species: ${tree.species}`,
      ``,
      `Issue: ${issueType}`,
      ``,
      `Notes:`,
      notes || '(none)',
    ].join('\n')

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    handleClose()
  }

  return (
    <>
      <Box sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid rgba(46, 125, 50, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1b5e20' }}>
            Something look wrong?
          </Typography>
          <Typography variant="caption" sx={{ color: '#666' }}>
            Help us improve the data
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EditNote />}
          onClick={() => setOpen(true)}
          sx={{
            borderColor: '#2e7d32',
            color: '#2e7d32',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            '&:hover': { borderColor: '#1b5e20', backgroundColor: 'rgba(46, 125, 50, 0.04)' },
          }}
        >
          Suggest Edit
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1b5e20' }}>
                Suggest an Edit
              </Typography>
              <Typography variant="caption" sx={{ color: '#666' }}>
                Tree #{tree.id} · {tree.common_name} · {tree.address}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleClose} sx={{ color: '#666', mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            select
            label="What's the issue?"
            value={issueType}
            onChange={e => setIssueType(e.target.value)}
            size="small"
            fullWidth
            sx={focusGreen}
          >
            {ISSUE_TYPES.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes"
            placeholder="Any additional details..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            multiline
            rows={4}
            size="small"
            fullWidth
            sx={focusGreen}
          />

          <Typography variant="caption" sx={{ color: '#999', mt: -1 }}>
            Clicking "Open in Mail" will open a pre-filled email in your mail client.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 0 }}>
          <Button onClick={handleClose} sx={{ color: '#666', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!issueType}
            onClick={handleSubmit}
            sx={{
              backgroundColor: '#2e7d32',
              '&:hover': { backgroundColor: '#1b5e20' },
              '&:disabled': { backgroundColor: 'rgba(46, 125, 50, 0.3)' },
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Open in Mail
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
