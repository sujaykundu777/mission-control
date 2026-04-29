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
  const { currency: savedCurrency, setCurrency: setSavedCurrency } =
    useCurrency();
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
      window.confirm(
        "Are you sure you want to delete all domains? This action cannot be undone.",
      )
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
        <p className="text-muted-foreground mt-2">
          Manage your Mission Control preferences and data
        </p>
      </div>

      {/* Preferences */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Preferences
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-3">
              Currency for Cost Display
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["USD", "EUR", "INR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleCurrencyChange(curr)}
                  className={`p-3 rounded-lg border-2 transition-colors relative ${
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
                  <div className="text-xs mt-1">{CURRENCY_NAMES[curr]}</div>
                  {savedCurrency === curr && tempCurrency === curr && (
                    <div className="absolute top-1 right-1">
                      <Check className="w-4 h-4 text-green-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-4">
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
            <p className="text-xs text-muted-foreground mt-3">
              Prices will be displayed in the selected currency with real-time
              conversion rates.
            </p>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Data Management
        </h2>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Export your domains and services data as a JSON file for backup or
            migration purposes.
          </p>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? "Exporting..." : "Export Data"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 bg-card border-destructive/50">
        <h2 className="text-lg font-semibold text-destructive mb-4">
          Danger Zone
        </h2>
        <p className="text-muted-foreground text-sm mb-4">
          Deleting all data will permanently remove all your domains and
          services. This action cannot be undone.
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
        <h2 className="text-lg font-semibold text-foreground mb-4">
          About Mission Control OS
        </h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">
              Mission Control OS
            </span>{" "}
            is a comprehensive tool for managing your domains, services, and DNS
            records in one place.
          </p>
          <p>
            All your data is stored locally in your browser using localStorage,
            ensuring privacy and security.
          </p>
          <p className="text-xs text-muted-foreground/60">Version 1.0.0</p>
        </div>
      </Card>
    </div>
  );
}
