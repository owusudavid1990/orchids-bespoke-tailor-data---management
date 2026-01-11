"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getAlterations,
  getClients,
  getUsers,
  getSettings,
  type Alteration,
  type Client,
  type User,
  type Settings,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Scissors } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AlterationDocketPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [alteration, setAlteration] = useState<Alteration | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [staff, setStaff] = useState<User | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const alterations = getAlterations();
    const found = alterations.find((a) => a.id === id);
    if (found) {
      setAlteration(found);
      const clients = getClients();
      const foundClient = clients.find((c) => c.id === found.clientId);
      setClient(foundClient || null);
      
      if (found.assignedStaffId) {
        const users = getUsers();
        const foundStaff = users.find((u) => u.id === found.assignedStaffId);
        setStaff(foundStaff || null);
      }
    }
    setSettings(getSettings());
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!alteration) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Scissors className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl text-stone-700">Alteration not found</h2>
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

  const statusLabels: Record<string, string> = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    "picked-up": "Picked Up",
  };

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
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="font-display"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Alterations
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-stone-900 hover:bg-stone-800"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Docket
          </Button>
        </div>

          <div className="print-area bg-white border border-stone-200 rounded-lg p-8 max-w-3xl mx-auto shadow-sm">
            <div className="border-b-2 border-stone-900 pb-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-6 items-start">
                  {settings?.logoUrl && (
                    <div className="w-16 h-16 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-center overflow-hidden p-2">
                      <img src={settings.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
                      ALTERATION DOCKET
                    </h1>
                    <p className="text-stone-500 mt-1 text-sm tracking-wide uppercase">
                      {settings?.companyName || "Bespoke Tailoring House"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                <div className="inline-block px-4 py-2 bg-stone-100 rounded">
                  <p className="text-xs text-stone-500 uppercase tracking-wider">Docket No.</p>
                  <p className="text-xl font-mono font-bold text-stone-900">
                    {alteration.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  Client Information
                </h3>
                <div className="bg-stone-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-stone-900">
                    {client?.name || "Unknown Client"}
                  </p>
                  {client?.phone && (
                    <p className="text-sm text-stone-600 mt-1">
                      Tel: {client.phone}
                    </p>
                  )}
                  {client?.email && (
                    <p className="text-sm text-stone-600">
                      {client.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  Garment Details
                </h3>
                <div className="bg-stone-50 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-stone-900">
                    {alteration.garmentType}
                  </p>
                  {alteration.description && (
                    <p className="text-sm text-stone-600 mt-1">
                      {alteration.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    Date Received
                  </h3>
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <p className="font-medium text-stone-900">
                      {new Date(alteration.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    Due Date
                  </h3>
                  <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                    <p className="font-bold text-amber-800">
                      {alteration.dueDate
                        ? new Date(alteration.dueDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Not set"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    Status
                  </h3>
                  <div className="bg-stone-50 p-3 rounded-lg">
                    <p className="font-medium text-stone-900">
                      {statusLabels[alteration.status]}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                    Price
                  </h3>
                  <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <p className="font-bold text-emerald-800">
                      {alteration.price || "TBD"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-1">
                  Assigned To
                </h3>
                <div className="bg-stone-50 p-3 rounded-lg">
                  <p className="font-medium text-stone-900">
                    {staff?.name || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-2">
              Measurements
            </h3>
            <div className="bg-stone-50 p-4 rounded-lg">
              {alteration.measurements && alteration.measurements.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 font-medium text-stone-700">Part</th>
                      <th className="text-center py-2 font-medium text-stone-700">Original</th>
                      <th className="text-center py-2 font-medium text-stone-700">Altered</th>
                      <th className="text-center py-2 font-medium text-stone-700">Diff</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {alteration.measurements.map((m, index) => (
                      <tr key={index}>
                        <td className="py-2 text-stone-700">{m.label}</td>
                        <td className="py-2 text-center text-stone-600">
                          {m.original !== null ? m.original : "-"}
                        </td>
                        <td className="py-2 text-center text-stone-600">
                          {m.altered !== null ? m.altered : "-"}
                        </td>
                        <td className="py-2 text-center">
                          {m.original !== null && m.altered !== null ? (
                            <span className={m.altered - m.original > 0 ? "text-green-600" : m.altered - m.original < 0 ? "text-red-600" : "text-stone-400"}>
                              {m.altered - m.original > 0 ? "+" : ""}{(m.altered - m.original).toFixed(1)}
                            </span>
                          ) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-stone-500 italic">
                  No measurements recorded
                </p>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-2">
              Alterations Required
            </h3>
            <div className="bg-stone-50 p-4 rounded-lg">
              {alteration.alterations.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {alteration.alterations.map((alt, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 bg-white rounded border border-stone-200"
                    >
                      <div className="w-5 h-5 border-2 border-stone-400 rounded flex-shrink-0" />
                      <span className="text-sm text-stone-700">{alt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500 italic">
                  No specific alterations listed
                </p>
              )}
            </div>
          </div>

          {alteration.notes && (
            <div className="mb-8">
              <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                Special Instructions / Notes
              </h3>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-stone-700 whitespace-pre-wrap">
                  {alteration.notes}
                </p>
              </div>
            </div>
          )}

          <div className="border-t-2 border-dashed border-stone-300 pt-6 mt-8">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-4">
                  For Workshop Use
                </h3>
                <div className="space-y-4">
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Date Started:</p>
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Date Completed:</p>
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Technician Signature:</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs text-stone-500 uppercase tracking-wider mb-4">
                  Customer Pickup
                </h3>
                <div className="space-y-4">
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Pickup Date:</p>
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Customer Signature:</p>
                  </div>
                  <div className="border-b border-stone-300 pb-2">
                    <p className="text-xs text-stone-400">Payment Received:</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-400">
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
