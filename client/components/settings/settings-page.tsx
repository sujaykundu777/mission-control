'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, Trash2 } from 'lucide-react'
import { storage } from '@/lib/storage'
import { useState } from 'react'

export function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExportData = () => {
    setIsExporting(true)
    try {
      const domains = storage.getDomains()
      const dataStr = JSON.stringify(domains, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `domain-manager-backup-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('[v0] Error exporting data:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all domains? This action cannot be undone.')) {
      storage.saveDomains([])
      window.location.reload()
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your Domain Manager preferences and data</p>
      </div>

      {/* Data Management */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">Data Management</h2>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Export your domains and services data as a JSON file for backup or migration purposes.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-card border-destructive/50">
        <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Deleting all data will permanently remove all your domains and services. This action cannot be undone.
        </p>
        <Button
          onClick={handleClearData}
          variant="destructive"
          className="bg-destructive hover:bg-destructive/90"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete All Data
        </Button>
      </Card>

      {/* About */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">About Domain Manager OS</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Domain Manager OS</span> is a comprehensive tool for managing
            your domains, services, and DNS records in one place.
          </p>
          <p>All your data is stored locally in your browser using localStorage, ensuring privacy and security.</p>
          <p className="text-xs text-muted-foreground/60">Version 1.0.0</p>
        </div>
      </Card>
    </div>
  )
}
