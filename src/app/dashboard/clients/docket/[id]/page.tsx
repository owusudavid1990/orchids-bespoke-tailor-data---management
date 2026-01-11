"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  getClients,
  getMeasurementsByClient,
  getOrdersByClient,
  getAlterationsByClient,
  getAppointmentsByClient,
  getSettings,
  getUsers,
  type Client,
  type Measurement,
  type SuitOrder,
  type Alteration,
  type Appointment,
  type Settings,
  type User as StaffUser,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, User, Mail, Phone, MapPin, Ruler, ShoppingBag, Scissors, Calendar, Clock, BadgeCheck } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const upperBodyFields = [
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
];

const lowerBodyFields = [
  { key: "trouserLength", label: "Trouser Length" },
  { key: "inseam", label: "Inseam" },
  { key: "outseam", label: "Outseam" },
  { key: "thigh", label: "Thigh" },
  { key: "knee", label: "Knee" },
  { key: "calf", label: "Calf" },
  { key: "ankle", label: "Ankle" },
  { key: "rise", label: "Rise" },
];

export default function ClientDocketPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [orders, setOrders] = useState<SuitOrder[]>([]);
  const [alterations, setAlterations] = useState<Alteration[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [users, setUsers] = useState<StaffUser[]>([]);

  useEffect(() => {
    const clients = getClients();
    const foundClient = clients.find((c) => c.id === id);
    if (foundClient) {
      setClient(foundClient);
      setMeasurements(getMeasurementsByClient(id));
      setOrders(getOrdersByClient(id));
      setAlterations(getAlterationsByClient(id));
      setAppointments(getAppointmentsByClient(id));
    }
    setSettings(getSettings());
    setUsers(getUsers());
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <User className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl text-stone-700">Client not found</h2>
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

  const latestMeasurement = measurements[measurements.length - 1];
  const assignedStaff = latestMeasurement?.assignedStaffId 
    ? users.find(u => u.id === latestMeasurement.assignedStaffId)?.name 
    : "Not assigned";

  // Combine all activities for timeline
  const timeline = [
    ...orders.map(o => ({ date: o.createdAt, type: 'order', title: `Order: ${o.orderName || 'New Suit'}`, status: o.status })),
    ...alterations.map(a => ({ date: a.createdAt, type: 'alteration', title: `Alteration: ${a.garmentType}`, status: a.status })),
    ...appointments.map(app => ({ date: app.date, type: 'appointment', title: `Appointment: ${app.type}`, status: app.status })),
    ...measurements.map(m => ({ date: m.createdAt, type: 'measurement', title: 'Measurement Session', status: 'completed' }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                  Client Profile Docket
                </h1>
                <p className="text-stone-500 mt-1 text-sm tracking-wide uppercase">
                  {settings?.companyName || "Bespoke Tailoring House"}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block px-4 py-2 bg-stone-100 rounded-lg">
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Client ID</p>
                  <p className="text-lg font-mono font-bold text-stone-900">
                    {client.id.slice(-8).toUpperCase()}
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
                  <User className="w-3 h-3" /> Customer Details
                </h3>
                <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-2xl font-semibold text-stone-900">
                        {client.name}
                      </p>
                      <p className="text-[10px] text-stone-400 uppercase mt-1">
                        Client Since: {new Date(client.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {latestMeasurement?.assignedStaffId && (
                      <div className="text-right">
                        <p className="text-[10px] text-stone-400 uppercase">Primary Staff</p>
                        <p className="text-sm font-medium text-stone-700 flex items-center justify-end gap-1">
                          <BadgeCheck className="w-3 h-3 text-stone-400" />
                          {assignedStaff}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {client.phone && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-stone-400 uppercase">Phone</p>
                        <p className="text-sm text-stone-600 flex items-center gap-2">
                          <Phone className="w-3 h-3 text-stone-400" />
                          {client.phone}
                        </p>
                      </div>
                    )}
                    {client.email && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-stone-400 uppercase">Email</p>
                        <p className="text-sm text-stone-600 flex items-center gap-2">
                          <Mail className="w-3 h-3 text-stone-400" />
                          {client.email}
                        </p>
                      </div>
                    )}
                    {client.address && (
                      <div className="col-span-2 space-y-1 mt-2">
                        <p className="text-[9px] text-stone-400 uppercase">Address</p>
                        <p className="text-sm text-stone-600 flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {client.address}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100 h-full">
                <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4">
                  Account Summary
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-600">
                      <ShoppingBag className="w-4 h-4 text-stone-400" />
                      <span className="text-xs uppercase">Orders</span>
                    </div>
                    <span className="font-bold">{orders.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Scissors className="w-4 h-4 text-stone-400" />
                      <span className="text-xs uppercase">Alterations</span>
                    </div>
                    <span className="font-bold">{alterations.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-stone-600">
                      <Calendar className="w-4 h-4 text-stone-400" />
                      <span className="text-xs uppercase">Appts</span>
                    </div>
                    <span className="font-bold">{appointments.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Measurements */}
          {latestMeasurement && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Ruler className="w-3 h-3" /> Measurement Details ({new Date(latestMeasurement.updatedAt).toLocaleDateString()})
              </h3>
              <div className="border-t border-stone-100 pt-6">
                <div className="grid grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[10px] text-stone-400 uppercase mb-4 border-b border-stone-100 pb-1">Upper Body</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      {upperBodyFields.map((field) => {
                        const value = (latestMeasurement as any)[field.key];
                        if (!value) return null;
                        return (
                          <div key={field.key} className="flex justify-between items-center border-b border-stone-50 pb-1">
                            <span className="text-[10px] text-stone-400 uppercase">{field.label}</span>
                            <span className="text-sm font-medium text-stone-900">{value}"</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-stone-400 uppercase mb-4 border-b border-stone-100 pb-1">Lower Body</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                      {lowerBodyFields.map((field) => {
                        const value = (latestMeasurement as any)[field.key];
                        if (!value) return null;
                        return (
                          <div key={field.key} className="flex justify-between items-center border-b border-stone-50 pb-1">
                            <span className="text-[10px] text-stone-400 uppercase">{field.label}</span>
                            <span className="text-sm font-medium text-stone-900">{value}"</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-6">
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-[9px] text-stone-400 uppercase mb-1">Build</p>
                    <p className="text-sm font-medium text-stone-900 capitalize">{latestMeasurement.bodyStructure}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-[9px] text-stone-400 uppercase mb-1">Posture</p>
                    <p className="text-sm font-medium text-stone-900 capitalize">{latestMeasurement.posture}</p>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-lg">
                    <p className="text-[9px] text-stone-400 uppercase mb-1">Shoulders</p>
                    <p className="text-sm font-medium text-stone-900 capitalize">{latestMeasurement.slopeShoulders}</p>
                  </div>
                </div>

                {latestMeasurement.customFields && latestMeasurement.customFields.length > 0 && (
                  <div className="mt-8">
                    <h4 className="text-[10px] text-stone-400 uppercase mb-3">Additional Details</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {latestMeasurement.customFields.map((field) => (
                        <div key={field.id} className="border-b border-stone-50 pb-1 flex justify-between">
                          <span className="text-[10px] text-stone-400 uppercase">{field.label}</span>
                          <span className="text-sm font-medium text-stone-900">{field.value} {field.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="mb-10">
            <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Activity Timeline
            </h3>
            <div className="border-t border-stone-100 pt-6">
              <div className="space-y-4">
                {timeline.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="text-[10px] text-stone-400 w-24 pt-1">
                      {new Date(item.date).toLocaleDateString()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">{item.title}</p>
                      <p className="text-[10px] text-stone-400 uppercase">{item.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orders List */}
          {orders.length > 0 && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <ShoppingBag className="w-3 h-3" /> Recent Orders
              </h3>
              <div className="border-t border-stone-100 pt-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-stone-400 uppercase">
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Style</th>
                      <th className="pb-3">Staff</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-stone-600">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-stone-50">
                        <td className="py-3 font-medium text-stone-900">{order.orderName || "Suit Order"}</td>
                        <td className="py-3 capitalize">{order.suitStyle.replace("-", " ")}</td>
                        <td className="py-3 text-xs">
                          {order.assignedStaffId ? users.find(u => u.id === order.assignedStaffId)?.name : "-"}
                        </td>
                        <td className="py-3 capitalize text-xs">{order.status}</td>
                        <td className="py-3 text-right">{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {client.notes && (
            <div className="mb-10">
              <h3 className="text-[10px] text-stone-400 uppercase tracking-[0.2em] mb-2">
                Client Notes
              </h3>
              <div className="bg-stone-50 p-5 rounded-xl border border-stone-100">
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {client.notes}
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
