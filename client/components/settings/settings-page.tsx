"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Trash2, Globe, Check } from "lucide-react";
import { storage } from "@/lib/storage";
import { useState } from "react";
import { Currency, CURRENCY_NAMES } from "@/lib/currency";
import { useCurrency } from "@/hooks/use-currency";

export function SettingsPage() {
  const [isExporting, setIsExporting] = useState(false);
  const { currency: savedCurrency, setCurrency: setSavedCurrency } = useCurrency();
  const [tempCurrency, setTempCurrency] = useState<Currency>(savedCurrency);
  const [isSaving, setIsSaving] = useState(false);

  const handleCurrencyChange = (newCurrency: Currency) => {
    setTempCurrency(newCurrency);
  };

  const handleSaveCurrency = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setSavedCurrency(tempCurrency);
      setIsSaving(false);
    }, 300);
  };

  const handleExportData = () => {
    setIsExporting(true);
    try {
      const domains = storage.getDomains();
      const dataStr = JSON.stringify(domains, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `domain-manager-backup-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = () => {
    if (
      window.confirm("Are you sure you want to delete all domains? This action cannot be undone.")
    ) {
      storage.saveDomains([]);
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your Mission Control preferences and data
        </p>
      </div>

      {/* Preferences */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Globe className="h-5 w-5" />
          Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <p className="mb-3 text-sm font-medium text-foreground">Currency for Cost Display</p>
            <div className="grid grid-cols-3 gap-3">
              {(["USD", "EUR", "INR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`relative rounded-lg border-2 p-3 transition-colors ${
                    tempCurrency === curr
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50"
                  } ${
                    savedCurrency === curr && tempCurrency !== curr
                      ? "ring-2 ring-green-500/50"
                      : ""
                  }`}
                >
                  <div className="font-semibold">{curr}</div>
                  <div className="mt-1 text-xs">{CURRENCY_NAMES[curr]}</div>
                  {savedCurrency === curr && tempCurrency === curr && (
                    <div className="absolute right-1 top-1">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={handleSaveCurrency}
                disabled={tempCurrency === savedCurrency || isSaving}
                className="bg-primary hover:bg-primary/90"
              >
                {isSaving ? "Saving..." : "Save Currency"}
              </Button>
              {tempCurrency !== savedCurrency && (
                <p className="text-xs text-amber-600">
                  Changes will apply across all domain pages after saving.
                </p>
              )}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Prices will be displayed in the selected currency with real-time conversion rates.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Data Management</h2>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Export your domains and services data as a JSON file for backup or migration purposes.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50 bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-destructive">Danger Zone</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Deleting all data will permanently remove all your domains and services. This action
          cannot be undone.
        </p>
        <Button
          onClick={handleClearData}
          variant="destructive"
          className="bg-destructive hover:bg-destructive/90"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete All Data
        </Button>
      </Card>

      {/* About */}
      <Card className="border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">About Mission Control OS</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Mission Control OS</span> is a
            comprehensive tool for managing your domains, services, and DNS records in one place.
          </p>
          <p>
            All your data is stored locally in your browser using localStorage, ensuring privacy and
            security.
          </p>
          <p className="text-xs text-muted-foreground/60">Version 1.0.0</p>
        </div>
      </Card>
    </div>
  );
}
