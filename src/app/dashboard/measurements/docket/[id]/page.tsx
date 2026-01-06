"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getMeasurements,
  getClients,
  getSettings,
  type Measurement,
  type Client,
  type Settings,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Ruler, User, Camera, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MeasurementDocketPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [measurement, setMeasurement] = useState<Measurement | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const measurements = getMeasurements();
    const found = measurements.find((m) => m.id === id);
    if (found) {
      setMeasurement(found);
      const clients = getClients();
      const foundClient = clients.find((c) => c.id === found.clientId);
      setClient(foundClient || null);
    }
    setSettings(getSettings());
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!measurement) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Ruler className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl text-stone-700">Measurement not found</h2>
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mt-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const standardFields = [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "shoulders", label: "Shoulders" },
    { key: "neck", label: "Neck" },
    { key: "sleeveLength", label: "Sleeve Length" },
    { key: "armhole", label: "Armhole" },
    { key: "bicep", label: "Bicep" },
    { key: "wrist", label: "Wrist" },
    { key: "jacketLength", label: "Jacket Length" },
    { key: "backLength", label: "Back Length" },
    { key: "frontLength", label: "Front Length" },
    { key: "trouserLength", label: "Trouser Length" },
    { key: "inseam", label: "Inseam" },
    { key: "outseam", label: "Outseam" },
    { key: "thigh", label: "Thigh" },
    { key: "knee", label: "Knee" },
    { key: "calf", label: "Calf" },
    { key: "ankle", label: "Ankle" },
    { key: "rise", label: "Rise" },
  ];

  const garmentOptions = [
    { label: "Lapel Style", value: measurement.lapelStyle },
    { label: "Button Style", value: measurement.buttonStyle },
    { label: "Jacket Length", value: measurement.jacketLengthOption },
    { label: "Pocket Style", value: measurement.pocketStyle },
    { label: "Vent Style", value: measurement.ventStyle },
    { label: "Lining Type", value: measurement.liningType },
    { label: "Trouser Style", value: measurement.trouserStyle },
    { label: "Trouser Fit", value: measurement.trouserFit },
    { label: "Cuff Style", value: measurement.cuffStyle },
  ].filter(opt => opt.value);

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area,
          .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            box-shadow: none;
            border: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between no-print">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="font-display"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-stone-900 hover:bg-stone-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Docket
          </Button>
        </div>

        <div className="print-area bg-white border border-stone-200 rounded-xl p-8 shadow-sm">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-stone-900 tracking-tight uppercase">
                  Measurement Docket
                </h1>
                <p className="text-stone-500 mt-1 text-sm tracking-wide uppercase">
                  {settings?.companyName || "Bespoke Tailoring House"}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 bg-stone-100 rounded-lg">
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Reference</p>
                  <p className="text-lg font-mono font-bold text-stone-900">
                    {measurement.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Client Info */}
            <div className="md:col-span-2 space-y-6">
              <section>
                <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <User className="w-3 h-3" /> Client Details
                </h3>
                <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                  <p className="text-xl font-semibold text-stone-900">
                    {client?.name || "Unknown Client"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {client?.phone && (
                      <p className="text-sm text-stone-600">
                        <span className="text-stone-400">Tel:</span> {client.phone}
                      </p>
                    )}
                    {client?.email && (
                      <p className="text-sm text-stone-600">
                        <span className="text-stone-400">Email:</span> {client.email}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Physical Profile */}
              <section>
                <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-3">
                  Physical Profile
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-center">
                    <p className="text-[10px] text-stone-400 uppercase mb-1">Structure</p>
                    <p className="font-semibold text-stone-900 capitalize">{measurement.bodyStructure}</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-center">
                    <p className="text-[10px] text-stone-400 uppercase mb-1">Posture</p>
                    <p className="font-semibold text-stone-900 capitalize">{measurement.posture}</p>
                  </div>
                  <div className="bg-stone-50 p-3 rounded-lg border border-stone-100 text-center">
                    <p className="text-[10px] text-stone-400 uppercase mb-1">Shoulders</p>
                    <p className="font-semibold text-stone-900 capitalize">{measurement.slopeShoulders}</p>
                  </div>
                </div>
              </section>
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 h-full">
                <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4">
                  Record Info
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Date Measured</p>
                    <p className="font-medium text-stone-900">
                      {new Date(measurement.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase">Last Updated</p>
                    <p className="text-stone-600 text-sm">
                      {new Date(measurement.updatedAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements Grid */}
          <div className="mb-10">
            <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Ruler className="w-3 h-3" /> Core Measurements
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-y-6 gap-x-4 border-t border-stone-100 pt-6">
              {standardFields.map((field) => {
                const value = (measurement as any)[field.key];
                if (!value) return null;
                return (
                  <div key={field.key} className="space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase leading-tight">{field.label}</p>
                    <p className="text-lg text-stone-900">
                      {value}<span className="text-stone-400 ml-0.5">&quot;</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Fields */}
          {measurement.customFields && measurement.customFields.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Custom Measurements
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-6">
                {measurement.customFields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-stone-900">{field.label}</p>
                      {field.notes && <p className="text-[10px] text-stone-500 italic">{field.notes}</p>}
                    </div>
                    <p className="text-lg text-stone-900">
                      {field.value}<span className="text-stone-400 text-sm ml-0.5">{field.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Garment Options */}
          {garmentOptions.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4">
                Garment Preferences
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-t border-stone-100 pt-6">
                {garmentOptions.map((opt, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[10px] text-stone-400 uppercase">{opt.label}</p>
                    <p className="text-sm text-stone-900 capitalize">
                      {opt.value.replace(/-/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Photos Section */}
          {measurement.photos && measurement.photos.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Camera className="w-3 h-3" /> Visual Reference
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 border-t border-stone-100 pt-6">
                {measurement.photos.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="aspect-[3/4] rounded-lg border border-stone-200 overflow-hidden bg-stone-50">
                      <img src={photo.url} alt={photo.label} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-stone-500 text-center truncate px-1">
                      {photo.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {measurement.notes && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-2">
                Special Observations
              </h3>
              <div className="bg-amber-50/30 p-5 rounded-xl border border-amber-100/50">
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {measurement.notes}
                </p>
              </div>
            </div>
          )}

          {/* Footer Branding */}
          <div className="mt-12 pt-8 border-t border-stone-100 text-center">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest">
              {settings?.companyName || "Bespoke Tailoring House"}
              {settings?.phone && ` • ${settings.phone}`}
              {settings?.email && ` • ${settings.email}`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
