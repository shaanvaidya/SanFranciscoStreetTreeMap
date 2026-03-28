import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TreeInfo } from '../types/tree'

const ISSUE_TYPES = [
  'Wrong species',
  'Wrong location',
  'Tree no longer exists',
  'Missing tree',
  'Other',
]

const CONTACT_EMAIL = 'me@shaanvaidya.com'

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
      <div
        className="rounded-xl p-5 flex items-center justify-between"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          boxShadow: document.documentElement.classList.contains('dark')
            ? '0 2px 8px rgba(0,0,0,0.3)'
            : '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--heading)' }}>
            Something look wrong?
          </p>
          <span className="text-xs text-muted-foreground">
            Help us improve the data
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="text-primary border-primary font-semibold"
        >
          <PenLine className="h-4 w-4 mr-1.5" />
          Suggest Edit
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-bold" style={{ color: 'var(--heading)' }}>
              Suggest an Edit
            </DialogTitle>
            <DialogDescription>
              Tree #{tree.id} · {tree.common_name} · {tree.address}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="space-y-2">
              <Label>What's the issue?</Label>
              <Select value={issueType} onValueChange={setIssueType}>
                <SelectTrigger className="focus:ring-primary">
                  <SelectValue placeholder="Select an issue type" />
                </SelectTrigger>
                <SelectContent>
                  {ISSUE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Any additional details..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="focus-visible:ring-primary"
              />
            </div>

            <p className="text-xs text-muted-foreground -mt-1">
              Clicking "Open in Mail" will open a pre-filled email in your mail client.
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={handleClose} className="text-muted-foreground">
              Cancel
            </Button>
            <Button
              disabled={!issueType}
              onClick={handleSubmit}
            >
              Open in Mail
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SuggestEdit
