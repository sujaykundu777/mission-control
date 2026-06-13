"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contact } from "@/lib/types";
import { storage } from "@/lib/storage";
import { ArrowLeft, Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  downloadCSVTemplate,
  downloadJSONTemplate,
  importContactsFromCSV,
  importContactsFromJSON,
} from "@/lib/import/import-contacts";
import { Input } from "../ui/input";

interface ImportContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: (contacts: Contact[]) => void;
}

export function ImportContactModal({
  open,
  onOpenChange,
  onImportComplete,
}: ImportContactModalProps) {
  const [importStep, setImportStep] = useState<"options" | "uploading" | "preview" | "results">(
    "options",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [importedContacts, setImportedContacts] = useState<Contact[]>([]);

  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
  };

  const handleDownloadJSONTemplate = () => {
    downloadJSONTemplate();
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportErrors([]);
    try {
      const text = await file.text();
      const result = await importContactsFromCSV(text);

      if (result.duplicates > 0) {
        setDuplicateCount(result.duplicates);
        setImportErrors(["Failed to import CSV" + "Duplicates email already exists"]);
        setIsProcessing(false);
        setImportStep("preview");
      }

      if (result.errors.length > 0) {
        setImportErrors(result.errors);
        setIsProcessing(false);
        setImportStep("preview");
      }

      if (result.contacts.length > 0) {
        setImportedContacts(result.contacts);
        setDuplicateCount(result.duplicates);
        setImportStep("preview");
      }
    } catch (error) {
      setImportErrors([
        "Failed to read CSV file:" + (error instanceof Error ? error.message : "Unknown error"),
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJSONUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setImportErrors([]);

    try {
      const text = await file.text();
      const result = await importContactsFromJSON(text);

      if (result.errors.length > 0) {
        setImportErrors(result.errors);
      }

      if (result.contacts.length > 0) {
        setImportedContacts(result.contacts);
        setDuplicateCount(result.duplicates);
        setImportStep("preview");
      }
    } catch (error) {
      setImportErrors([
        "Failed to read JSON file: " + (error instanceof Error ? error.message : "Unknown error"),
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      let importedCount = 0;
      const existingContacts = await storage.getContacts();

      importedContacts.forEach(async (contact) => {
        const isDuplicate = existingContacts.some(
          (ec) => ec.email.toLowerCase() === contact.email.toLowerCase(),
        );

        if (!isDuplicate) {
          await storage.addContact(contact).then(() => {
            importedCount++;
          });
        }
      });

      setSuccessCount(importedCount);
      setImportStep("results");

      if (onImportComplete) {
        const updatedContacts = await storage.getContacts();

        setTimeout(() => {
          setImportStep("results");
          onImportComplete(updatedContacts);
          setImportStep("options");
        }, 2000);
      }
    } catch (error) {
      setImportErrors([
        "Failed to import contacts: " + (error instanceof Error ? error.message : "Unknown error"),
      ]);
      setImportStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setImportStep("options");
    setImportedContacts([]);
    setImportErrors([]);
    setDuplicateCount(0);
    setSuccessCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle> Import Contacts</DialogTitle>
          <DialogDescription>
            {" "}
            Import contacts via CSV or JSON
            {importStep === "options" && "Choose how you want to import your contacts."}
            {importStep === "preview" && "Review the contacts before importing."}
            {importStep === "results" && "Import complete! See the results below."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Options Step */}
          {importStep === "options" && (
            <div className="space-y-4">
              <Card className="cursor-pointer border-border bg-card p-2 transition-colors hover:bg-card/80">
                <Button
                  variant="outline"
                  className="h-18 flex w-full items-start gap-4 text-left"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <p className="font-medium">Download CSV Template</p>
                    <p className="text-sm text-muted-foreground">
                      Get a pre-filled CSV template to import your contacts data.
                    </p>
                  </div>
                </Button>
              </Card>

              <Card className="cursor-pointer border-border bg-card p-6 transition-colors hover:bg-card/80">
                <Button
                  variant="outline"
                  className="h-18 flex w-full items-start gap-4 text-left"
                  onClick={handleDownloadJSONTemplate}
                >
                  <Download className="mt-1 h-6 w-6 text-primary" />
                  <div>
                    <h3 className="font-semibold text-foreground">Download JSON Template</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get a template JSON file to fill in with your contact data
                    </p>
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

              <Card className="cursor-pointer border-border bg-card p-2 transition-colors hover:bg-card/80">
                <label className="h-18 flex w-full cursor-pointer items-start gap-4">
                  <Upload className="mt-1 h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground"> Import CSV File</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {" "}
                      Upload a CSV file with your contact data
                    </p>
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      // disabled={isProcessing}
                      className="mt-4 space-x-2"
                    />
                  </div>
                </label>
              </Card>

              <Card className="border-border bg-card p-6">
                <label className="flex cursor-pointer items-start gap-4">
                  <Upload className="mt-1 h-6 w-6 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Import JSON File</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Upload a JSON file with your contact data
                    </p>
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleJSONUpload}
                      className="mt-4 space-x-2"
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
          {importStep === "preview" && (
            <div className="space-y-4">
              {importErrors.length > 0 && (
                <Card className="border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                    <div className="flex-1">
                      <h3 className="mb-2 font-semibold text-destructive">Import Errors</h3>
                      <ul className="space-y-1 text-sm text-destructive/80">
                        {importErrors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Contacts to import:{" "}
                    <span className="font-semibold text-foreground">{importedContacts.length}</span>
                  </p>
                  {duplicateCount > 0 && (
                    <p className="text-muted-foreground">
                      Duplicates found:{" "}
                      <span className="font-semibold text-yellow-600">+{duplicateCount}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="p-3 text-left font-semibold">Name</th>
                      <th className="p-3 text-left font-semibold">Email</th>
                      <th className="p-3 text-left font-semibold">Company</th>
                      <th className="p-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedContacts.map((contact, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/30">
                        <td className="p-3">{contact.name}</td>
                        <td className="p-3 text-muted-foreground">{contact.email}</td>
                        <td className="p-3 text-muted-foreground">{contact.company || "-"}</td>
                        <td className="p-3">
                          <span className="rounded-full bg-primary/20 px-2 py-1 text-xs text-primary">
                            {contact.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setImportStep("options")}
                  className="border-border"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  disabled={isProcessing || importedContacts.length === 0}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? "Importing..." : "Confirm Import"}
                </Button>
              </div>
            </div>
          )}

          {/* Results Step */}
          {importStep === "results" && (
            <div className="space-y-4">
              <Card className="border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-950">
                <div className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                      Import Successful
                    </h3>
                    <p className="mt-1 text-sm text-green-800 dark:text-green-200">
                      {successCount} contact{successCount !== 1 ? "s" : ""} imported successfully
                    </p>
                    {duplicateCount > 0 && (
                      <p className="mt-2 text-sm text-green-700 dark:text-green-300">
                        {duplicateCount} duplicate{duplicateCount !== 1 ? "s" : ""} skipped
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
  );
}
