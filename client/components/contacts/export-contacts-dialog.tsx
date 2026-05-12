'use client'

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Contact } from '@/lib/types';
import { exportContactsAsCSV, exportContactsAsJSON } from '@/lib/export/export-clients';
import { Download, FileText, Code } from 'lucide-react';


interface ExportContactsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: Contact[]
}

export function ExportContactsDialog({
  open,
  onOpenChange,
  contacts,
}: ExportContactsDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | null>(null)

  const handleExportCSV = () => {
    exportContactsAsCSV(contacts)
    onOpenChange(false)
  }

  const handleExportJSON = () => {
    exportContactsAsJSON(contacts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Contacts</DialogTitle>
          <DialogDescription>
            Choose a format to export your {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* CSV Export */}
          <Card
            className="p-4 bg-card border-border cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => setSelectedFormat('csv')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedFormat('csv')
              }
            }}
          >
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Export as CSV</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Comma-separated values format. Great for spreadsheets and data analysis.
                </p>
              </div>
            </div>
          </Card>

          {/* JSON Export */}
          <Card
            className="p-4 bg-card border-border cursor-pointer hover:bg-card/80 transition-colors"
            onClick={() => setSelectedFormat('json')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedFormat('json')
              }
            }}
          >
            <div className="flex items-start gap-3">
              <Code className="w-5 h-5 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Export as JSON</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  JavaScript Object Notation format. Perfect for imports and integrations.
                </p>
              </div>
            </div>
          </Card>

          {/* Export Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1 border-border hover:bg-card"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            {selectedFormat === 'csv' && (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleExportCSV}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            {selectedFormat === 'json' && (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleExportJSON}
              >
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            )}
            {!selectedFormat && (
              <Button disabled className="flex-1">
                Select Format
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
