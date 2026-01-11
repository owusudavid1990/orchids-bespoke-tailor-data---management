"use client";

import { supabase } from './supabase';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementPhoto {
  id: string;
  url: string;
  label: string;
  createdAt: string;
}

export interface MeasurementField {
  id: string;
  label: string;
  value: string;
  unit: string;
  notes?: string;
  order: number;
}

export interface MeasurementTemplate {
  id: string;
  name: string;
  fields: { label: string; unit: string; order: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface Measurement {
  id: string;
  clientId: string;
  chest: string;
  waist: string;
  hips: string;
  shoulders: string;
  sleeveLength: string;
  armhole: string;
  bicep: string;
  wrist: string;
  neck: string;
  jacketLength: string;
  trouserLength: string;
  inseam: string;
  outseam: string;
  thigh: string;
  knee: string;
  calf: string;
  ankle: string;
  rise: string;
  backLength: string;
  frontLength: string;
  bodyStructure: 'athletic' | 'slim' | 'regular' | 'muscular' | 'heavy';
  posture: 'normal' | 'erect' | 'stooped' | 'forward';
  slopeShoulders: 'normal' | 'square' | 'sloped';
  lapelStyle?: 'notch' | 'peak' | 'shawl';
  buttonStyle?: 'single-breasted-1' | 'single-breasted-2' | 'single-breasted-3' | 'double-breasted-4' | 'double-breasted-6';
  jacketLengthOption?: 'short' | 'regular' | 'long';
  pocketStyle?: 'flap' | 'patch' | 'jetted';
  ventStyle?: 'single' | 'double' | 'none';
  liningType?: 'full' | 'half' | 'unlined';
  trouserStyle?: 'flat-front' | 'pleated';
  trouserFit?: 'slim' | 'regular' | 'relaxed';
  cuffStyle?: 'plain' | 'turn-up';
  photos?: MeasurementPhoto[];
  customFields?: MeasurementField[];
  templateId?: string;
  assignedStaffId?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FabricSelection {
  id: string;
  clientId: string;
  measurementId?: string;
  fabricCode: string;
  fabricName: string;
  fabricType: string;
  color: string;
  pattern: string;
  composition: string;
  weight: string;
  price: string;
  imageUrl?: string;
  notes: string;
  createdAt: string;
}

export interface SuitOrder {
  id: string;
  clientId: string;
  orderName: string;
  measurementId: string;
  fabricSelectionId: string;
  suitStyle: 'single-breasted' | 'double-breasted';
  lapelStyle: 'notch' | 'peak' | 'shawl';
  ventStyle: 'single' | 'double' | 'none';
  buttons: '1' | '2' | '3';
  pocketStyle: 'flap' | 'jetted' | 'patch';
  liningType: string;
  liningColor: string;
  trouserStyle: 'flat-front' | 'pleated';
  trouserCuff: 'cuffed' | 'uncuffed';
  specialInstructions: string;
  status: 'pending' | 'in-progress' | 'fitting' | 'alterations' | 'completed' | 'delivered';
  assignedStaffId?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlterationMeasurement {
  label: string;
  original: number | null;
  altered: number | null;
}

export interface Alteration {
  id: string;
  clientId: string;
  orderId?: string;
  garmentType: string;
  description: string;
  alterations: string[];
  measurements: AlterationMeasurement[];
  status: 'pending' | 'in-progress' | 'completed' | 'picked-up';
  assignedStaffId?: string;
  price: string;
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  staffId?: string;
  department?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  logoUrl: string;
  address: string;
  phone: string;
  email: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  type: 'consultation' | 'measurement' | 'fitting' | 'pickup' | 'alteration';
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  assignedStaffId?: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEYS = {
  CLIENTS: 'tailor_clients',
  MEASUREMENTS: 'tailor_measurements',
  FABRICS: 'tailor_fabrics',
  ORDERS: 'tailor_orders',
  ALTERATIONS: 'tailor_alterations',
  APPOINTMENTS: 'tailor_appointments',
  USERS: 'tailor_users',
  SETTINGS: 'tailor_settings',
  CURRENT_USER: 'tailor_current_user',
  TEMPLATES: 'tailor_measurement_templates',
  SYNC_QUEUE: 'tailor_sync_queue',
};

interface SyncItem {
  type: 'save' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'jankstailoring@gmail.com',
    password: 'JANKs@24611',
    role: 'admin',
    name: 'Administrator',
    email: 'jankstailoring@gmail.com',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'staff',
    password: 'staff123',
    role: 'staff',
    name: 'Staff Member',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

const defaultSettings: Settings = {
  companyName: 'Bespoke Tailoring House',
  logoUrl: '',
  address: '',
  phone: '',
  email: '',
};

function getStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) return defaultValue;
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Helper to map camelCase object to snake_case for Postgres
function toSnakeCase(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj === null || typeof obj !== 'object' || obj instanceof Date) return obj;

  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Avoid converting nested objects that should stay as JSONB (like measurements array)
      if (key === 'measurements' && Array.isArray(obj[key])) {
        result[key] = obj[key];
        continue;
      }
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      result[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return result;
}

export async function signIn(username: string, password: string): Promise<User | null> {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
  return null;
}

export async function signUp(userData: Partial<User>): Promise<User> {
  const newUser: User = {
    id: generateId(),
    username: userData.username!,
    password: userData.password!,
    name: userData.name!,
    role: userData.role as 'admin' | 'staff',
    email: userData.email,
    phone: userData.phone,
    address: userData.address,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...userData
  };
  
  saveUser(newUser);
  return newUser;
}

export function authenticateUser(username: string, password: string): User | null {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    if (!user.isActive) return null;
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
  return null;
}

function addToSyncQueue(item: Omit<SyncItem, 'timestamp'>) {
  const queue = getStorage<SyncItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  queue.push({ ...item, timestamp: Date.now() });
  setStorage(STORAGE_KEYS.SYNC_QUEUE, queue);
  processSyncQueue();
}

let isSyncing = false;
export async function processSyncQueue() {
  if (isSyncing || typeof window === 'undefined' || !navigator.onLine) return;
  
  const queue = getStorage<SyncItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
  if (queue.length === 0) return;

  isSyncing = true;
  const item = queue[0];

  try {
    if (item.type === 'save') {
      const snakeData = toSnakeCase(item.data);
      const { error } = await supabase.from(item.table).upsert(snakeData);
      if (error) throw error;
    } else if (item.type === 'delete') {
      // Soft delete in Supabase
      const { error } = await supabase.from(item.table).update({ is_deleted: true }).eq('id', item.data.id);
      if (error) throw error;
    }

    // Success - remove from queue
    const updatedQueue = getStorage<SyncItem[]>(STORAGE_KEYS.SYNC_QUEUE, []);
    updatedQueue.shift();
    setStorage(STORAGE_KEYS.SYNC_QUEUE, updatedQueue);
    
    isSyncing = false;
    // Process next item
    if (updatedQueue.length > 0) processSyncQueue();
  } catch (error) {
    console.error('Sync failed:', error);
    isSyncing = false;
  }
}

export function initializeStore(): void {
  if (typeof window === 'undefined') return;
  
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    setStorage(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  // Set up background sync
  window.addEventListener('online', processSyncQueue);
  setInterval(processSyncQueue, 30000); // Try every 30 seconds
  processSyncQueue();
}

export function getClients(): Client[] {
  return getStorage<Client[]>(STORAGE_KEYS.CLIENTS, []);
}

export function saveClient(client: Client): void {
  const clients = getClients();
  const index = clients.findIndex(c => c.id === client.id);
  const updatedClient = { ...client, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    clients[index] = updatedClient;
  } else {
    clients.push(updatedClient);
  }
  setStorage(STORAGE_KEYS.CLIENTS, clients);
  addToSyncQueue({ type: 'save', table: 'clients', data: updatedClient });
}

export function deleteClient(id: string): void {
  const clients = getClients().filter(c => c.id !== id);
  setStorage(STORAGE_KEYS.CLIENTS, clients);
  addToSyncQueue({ type: 'delete', table: 'clients', data: { id } });
}

export function getMeasurements(): Measurement[] {
  return getStorage<Measurement[]>(STORAGE_KEYS.MEASUREMENTS, []);
}

export function getMeasurementsByClient(clientId: string): Measurement[] {
  return getMeasurements().filter(m => m.clientId === clientId);
}

export function saveMeasurement(measurement: Measurement): void {
  const measurements = getMeasurements();
  const index = measurements.findIndex(m => m.id === measurement.id);
  const updatedMeasurement = { ...measurement, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    measurements[index] = updatedMeasurement;
  } else {
    measurements.push(updatedMeasurement);
  }
  setStorage(STORAGE_KEYS.MEASUREMENTS, measurements);
  addToSyncQueue({ type: 'save', table: 'measurements', data: updatedMeasurement });
}

export function deleteMeasurement(id: string): void {
  const measurements = getMeasurements().filter(m => m.id !== id);
  setStorage(STORAGE_KEYS.MEASUREMENTS, measurements);
  addToSyncQueue({ type: 'delete', table: 'measurements', data: { id } });
}

export function getFabrics(): FabricSelection[] {
  return getStorage<FabricSelection[]>(STORAGE_KEYS.FABRICS, []);
}

export function getFabricsByClient(clientId: string): FabricSelection[] {
  return getFabrics().filter(f => f.clientId === clientId);
}

export function saveFabric(fabric: FabricSelection): void {
  const fabrics = getFabrics();
  const index = fabrics.findIndex(f => f.id === fabric.id);
  if (index >= 0) {
    fabrics[index] = fabric;
  } else {
    fabrics.push(fabric);
  }
  setStorage(STORAGE_KEYS.FABRICS, fabrics);
  addToSyncQueue({ type: 'save', table: 'fabrics', data: fabric });
}

export function deleteFabric(id: string): void {
  const fabrics = getFabrics().filter(f => f.id !== id);
  setStorage(STORAGE_KEYS.FABRICS, fabrics);
  addToSyncQueue({ type: 'delete', table: 'fabrics', data: { id } });
}

export function getOrders(): SuitOrder[] {
  return getStorage<SuitOrder[]>(STORAGE_KEYS.ORDERS, []);
}

export function getOrdersByClient(clientId: string): SuitOrder[] {
  return getOrders().filter(o => o.clientId === clientId);
}

export function saveOrder(order: SuitOrder): void {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === order.id);
  const updatedOrder = { ...order, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    orders[index] = updatedOrder;
  } else {
    orders.push(updatedOrder);
  }
  setStorage(STORAGE_KEYS.ORDERS, orders);
  addToSyncQueue({ type: 'save', table: 'orders', data: updatedOrder });
}

export function deleteOrder(id: string): void {
  const orders = getOrders().filter(o => o.id !== id);
  setStorage(STORAGE_KEYS.ORDERS, orders);
  addToSyncQueue({ type: 'delete', table: 'orders', data: { id } });
}

export function getAlterations(): Alteration[] {
  return getStorage<Alteration[]>(STORAGE_KEYS.ALTERATIONS, []);
}

export function getAlterationsByClient(clientId: string): Alteration[] {
  return getAlterations().filter(a => a.clientId === clientId);
}

export function saveAlteration(alteration: Alteration): void {
  const alterations = getAlterations();
  const index = alterations.findIndex(a => a.id === alteration.id);
  const updatedAlteration = { ...alteration, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    alterations[index] = updatedAlteration;
  } else {
    alterations.push(updatedAlteration);
  }
  setStorage(STORAGE_KEYS.ALTERATIONS, alterations);
  addToSyncQueue({ type: 'save', table: 'alterations', data: updatedAlteration });
}

export function deleteAlteration(id: string): void {
  const alterations = getAlterations().filter(a => a.id !== id);
  setStorage(STORAGE_KEYS.ALTERATIONS, alterations);
  addToSyncQueue({ type: 'delete', table: 'alterations', data: { id } });
}

export function getUsers(): User[] {
  return getStorage<User[]>(STORAGE_KEYS.USERS, defaultUsers);
}

export function saveUser(user: User): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  setStorage(STORAGE_KEYS.USERS, users);
  addToSyncQueue({ type: 'save', table: 'app_users', data: user });
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  setStorage(STORAGE_KEYS.USERS, users);
  addToSyncQueue({ type: 'delete', table: 'app_users', data: { id } });
}

export function getCurrentUser(): User | null {
  return getStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

export function getSettings(): Settings {
  return getStorage<Settings>(STORAGE_KEYS.SETTINGS, defaultSettings);
}

export function saveSettings(settings: Settings): void {
  setStorage(STORAGE_KEYS.SETTINGS, settings);
  addToSyncQueue({ type: 'save', table: 'app_settings', data: { id: 'current', ...settings } });
}

export function getAppointments(): Appointment[] {
  return getStorage<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
}

export function getAppointmentsByClient(clientId: string): Appointment[] {
  return getAppointments().filter(a => a.clientId === clientId);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return getAppointments().filter(a => a.date === date);
}

export function saveAppointment(appointment: Appointment): void {
  const appointments = getAppointments();
  const index = appointments.findIndex(a => a.id === appointment.id);
  const updatedAppointment = { ...appointment, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    appointments[index] = updatedAppointment;
  } else {
    appointments.push(updatedAppointment);
  }
  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  addToSyncQueue({ type: 'save', table: 'appointments', data: updatedAppointment });
}

export function deleteAppointment(id: string): void {
  const appointments = getAppointments().filter(a => a.id !== id);
  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);
  addToSyncQueue({ type: 'delete', table: 'appointments', data: { id } });
}

export function getTemplates(): MeasurementTemplate[] {
  return getStorage<MeasurementTemplate[]>(STORAGE_KEYS.TEMPLATES, []);
}

export function saveTemplate(template: MeasurementTemplate): void {
  const templates = getTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  const updatedTemplate = { ...template, updatedAt: new Date().toISOString() };
  if (index >= 0) {
    templates[index] = updatedTemplate;
  } else {
    templates.push(updatedTemplate);
  }
  setStorage(STORAGE_KEYS.TEMPLATES, templates);
  addToSyncQueue({ type: 'save', table: 'templates', data: updatedTemplate });
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter(t => t.id !== id);
  setStorage(STORAGE_KEYS.TEMPLATES, templates);
  addToSyncQueue({ type: 'delete', table: 'templates', data: { id } });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getAllData(): any {
  if (typeof window === 'undefined') return {};
  const data: any = {};
  Object.entries(STORAGE_KEYS).forEach(([key, storageKey]) => {
    data[key] = getStorage(storageKey, null);
  });
  return data;
}

