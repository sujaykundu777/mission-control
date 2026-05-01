"use client"

import Link from "next/link";
import {useState} from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Client } from '@/lib/types'
import { storage } from "@/lib/storage";
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle2} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { downloadCSVTemplate, downloadJSONTemplate, importClientsFromCSV, importClientsFromJSON } from "@/lib/import/import-clients";
import { Input } from "../ui/input";

interface ImportClientModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void,
    onImportComplete?: (clients: Client[]) => void
}

export function ImportClientModal({
    open,
    onOpenChange,
    onImportComplete
}: ImportClientModalProps) {

    const [importStep, setImportStep] = useState<'options' | 'uploading' | 'preview' | 'results'>('options');
    const [isProcessing, setIsProcessing] = useState(false);
    const [importErrors, setImportErrors] = useState<string[]>([]);
    const [duplicateCount, setDuplicateCount] = useState(0);
    const [successCount, setSuccessCount] = useState(0)
    const [importedClients, setImportedClients] = useState<Client[]>([]);

    const handleDownloadTemplate = () => {
        downloadCSVTemplate();
    }

    const handleDownloadJSONTemplate = () => {
        downloadJSONTemplate();
    }

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsProcessing(true)
        setImportErrors([]);
        try {
            const text = await file.text()
            const result = await importClientsFromCSV(text);

              if (result.duplicates > 0) {
                setDuplicateCount(result.duplicates)
                setImportErrors(['Failed to import CSV' + 'Duplicates email already exists']);
                setIsProcessing(false);
                 setImportStep('preview');
            }

            if (result.errors.length > 0) {
                setImportErrors(result.errors);
                setIsProcessing(false);
                 setImportStep('preview');
            }

            if (result.clients.length > 0) {
                setImportedClients(result.clients);
                setDuplicateCount(result.duplicates);
                setImportStep('preview');
            }

        } catch (error) {
            setImportErrors(['Failed to read CSV file:' + (error instanceof Error ? error.message : 'Unknown error')])
        } finally {
            setIsProcessing(false);
        }
    }

    const handleJSONUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setIsProcessing(true)
        setImportErrors([])

        try {
        const text = await file.text()
        const result = await importClientsFromJSON(text)

        if (result.errors.length > 0) {
            setImportErrors(result.errors)
        }

        if (result.clients.length > 0) {
            setImportedClients(result.clients)
            setDuplicateCount(result.duplicates)
            setImportStep('preview')
        }
        } catch (error) {
        setImportErrors(['Failed to read JSON file: ' + (error instanceof Error ? error.message : 'Unknown error')])
        } finally {
        setIsProcessing(false)
        }
    }

    const handleConfirmImport = async () => {
         setIsProcessing(true)
         try {
            let importedCount = 0
            const existingClients = await storage.getClients()

            importedClients.forEach(async (client) => {
                const isDuplicate = existingClients.some((ec) => ec.email.toLowerCase() === client.email.toLowerCase())

                if (!isDuplicate) {
                 await storage.addClient(client).then(() => {
                    importedCount++
                 })
                }
            })

            setSuccessCount(importedCount)
            setImportStep('results')

            if (onImportComplete) {
                const updatedClients = await storage.getClients()
               
                setTimeout(() => {
                     setImportStep('results')
                     onImportComplete(updatedClients)
                     setImportStep('options');
                }, 2000)
               
            }
            } catch (error) {
                setImportErrors(['Failed to import clients: ' + (error instanceof Error ? error.message : 'Unknown error')])
                setImportStep('preview')
            } finally {
                setIsProcessing(false)
                
            }
    }

    const handleClose = () => {
        setImportStep('options')
        setImportedClients([])
        setImportErrors([])
        setDuplicateCount(0)
        setSuccessCount(0)
        onOpenChange(false)
    }


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle> Import Clients</DialogTitle>
                <DialogDescription> Import clients via CSV or JSON
                    {importStep === 'options' && 'Choose how you want to import your clients.'}
                    {importStep === 'preview' && 'Review the clients before importing.'}
                    {importStep === 'results' && 'Import complete! See the results below.'}

                </DialogDescription>
            </DialogHeader>
        
            <div className="space-y-4">

                {/* Options Step */}
                {importStep === 'options' && (
                  <div className="space-y-4">
                    <Card className="p-2 bg-card border-border cursor-pointer hover:bg-card/80 transition-colors">
                        <Button
                            variant="outline"
                            className="w-full h-18 text-left flex items-start gap-4"
                            onClick={handleDownloadTemplate}
                        >
                            <Download className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <p className="font-medium">Download CSV Template</p>
                                <p className="text-sm text-muted-foreground">
                                    Get a pre-filled CSV template to import your clients data.
                                </p>
                            </div>
                        </Button>
                    </Card>

                    <Card className="p-6 bg-card border-border cursor-pointer hover:bg-card/80 transition-colors">
                        <Button
                            variant="outline"
                            className="w-full h-18 text-left flex items-start gap-4"
                            onClick={handleDownloadJSONTemplate}
                        >
                            <Download className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <h3 className="font-semibold text-foreground">Download JSON Template</h3>
                                <p className="text-sm text-muted-foreground mt-1">Get a template JSON file to fill in with your client data</p>
                            </div>
                        </Button>
                    </Card>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-background px-2 text-sm text-muted-foreground">OR</span>
                        </div>
                    </div>

                    <Card className="p-2 bg-card border-border cursor-pointer hover:bg-card/80 transition-colors">
                        <label className="cursor-pointer flex items-start gap-4 w-full h-18">
                            <Upload className="w-6 h-6 text-primary mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground"> Import CSV File</h3>
                                <p className="text-sm text-muted-foreground mt-1"> Upload a CSV file with your client data</p>
                                <Input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVUpload}
                                    // disabled={isProcessing}
                                    className="space-x-2 mt-4" 
                                />
                            </div>
                        </label>
                    </Card>


                    <Card className="p-6 bg-card border-border">
                         <label className="cursor-pointer flex items-start gap-4">
                            <Upload className="w-6 h-6 text-primary mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-foreground">Import JSON File</h3>
                                <p className="text-sm text-muted-foreground mt-1">Upload a JSON file with your client data</p>
                                <Input
                                type="file"
                                accept=".json"
                                onChange={handleJSONUpload}
                                className="space-x-2 mt-4" 
                                // disabled={isProcessing}
                                // className="hidden"
                                />
                                {/* <Button size="sm" variant="outline" className="mt-3 border-border" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : 'Choose JSON File'}
                                </Button> */}
                            </div>
                            </label>
                    </Card>
                  </div>
                )}

            {/* Preview Step */}
                {importStep === 'preview' && (
                    <div className="space-y-4">
                    {importErrors.length > 0 && (
                        <Card className="p-4 bg-destructive/10 border-destructive/50">
                        <div className="flex gap-3">
                            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                            <h3 className="font-semibold text-destructive mb-2">Import Errors</h3>
                            <ul className="space-y-1 text-sm text-destructive/80">
                                {importErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                                ))}
                            </ul>
                            </div>
                        </div>
                        </Card>
                    )}

                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                        <div className="text-sm">
                        <p className="text-muted-foreground">Clients to import: <span className="font-semibold text-foreground">{importedClients.length}</span></p>
                        {duplicateCount > 0 && (
                            <p className="text-muted-foreground">Duplicates found: <span className="font-semibold text-yellow-600">+{duplicateCount}</span></p>
                        )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
                        <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-muted/50">
                            <th className="text-left p-3 font-semibold">Name</th>
                            <th className="text-left p-3 font-semibold">Email</th>
                            <th className="text-left p-3 font-semibold">Company</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importedClients.map((client, index) => (
                            <tr key={index} className="border-b border-border hover:bg-muted/30">
                                <td className="p-3">{client.name}</td>
                                <td className="p-3 text-muted-foreground">{client.email}</td>
                                <td className="p-3 text-muted-foreground">{client.company || '-'}</td>
                                <td className="p-3">
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                    {client.status}
                                </span>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={() => setImportStep('options')} className="border-border">
                            Back
                        </Button>
                        <Button
                        onClick={handleConfirmImport}
                        disabled={isProcessing || importedClients.length === 0}
                        className="bg-primary hover:bg-primary/90"
                        >
                        {isProcessing ? 'Importing...' : 'Confirm Import'}
                        </Button>
                    </div>
                    </div>
                )}

             {/* Results Step */}
          {importStep === 'results' && (
            <div className="space-y-4">
              <Card className="p-6 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <div className="flex gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">Import Successful</h3>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      {successCount} client{successCount !== 1 ? 's' : ''} imported successfully
                    </p>
                    {duplicateCount > 0 && (
                      <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                        {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} skipped
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              <Button onClick={handleClose} className="w-full bg-primary hover:bg-primary/90">
                Done
              </Button>
            </div>
          )}
        </div>
        </DialogContent>
     </Dialog>
    )
}