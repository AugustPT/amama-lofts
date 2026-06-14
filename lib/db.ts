import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { Lead, LeadInput } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// We can use the service role key or anon key. Service role key is preferred on server side
// for admin/RLS bypass, but we fall back to anon key if that's all they provide.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

// Fallback JSON file path
const LOCAL_DB_PATH = path.join(process.cwd(), 'leads_db.json');

// Supabase client instance
const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Ensure local JSON DB file exists
function initializeLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2), 'utf-8');
  }
}

// --- Local Database Helpers ---
function insertLocalLead(input: LeadInput): Lead {
  initializeLocalDb();
  const dataStr = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  const leads: Lead[] = JSON.parse(dataStr);
  
  const newLead: Lead = {
    ...input,
    authorized_transfer: input.authorized_transfer ?? false,
    id: Math.random().toString(36).substring(2, 11) + '-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  leads.push(newLead);
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(leads, null, 2), 'utf-8');
  return newLead;
}

// Ensure the local helper is available for getLeads
function getLocalLeads(): Lead[] {
  initializeLocalDb();
  const dataStr = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  const leads: Lead[] = JSON.parse(dataStr);
  // Sort by created_at descending
  return leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

// Ensure the local helper is available for authorizeLeadTransfer
function authorizeLocalLeadTransfer(id: string): boolean {
  initializeLocalDb();
  const dataStr = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
  const leads: Lead[] = JSON.parse(dataStr);
  const leadIndex = leads.findIndex((l) => l.id === id);
  if (leadIndex !== -1) {
    leads[leadIndex].authorized_transfer = true;
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(leads, null, 2), 'utf-8');
    return true;
  }
  return false;
}

// --- Public Client Interfaces with Automatic Runtime Failover ---

export async function insertLead(input: LeadInput): Promise<Lead> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([input])
        .select()
        .single();

      if (error) {
        // If the table doesn't have authorized_transfer yet, try inserting without it
        if (error.code === '42703' || error.message?.includes('authorized_transfer')) {
          console.warn('Supabase is missing authorized_transfer column, retrying insert without it...');
          const { authorized_transfer, ...fallbackInput } = input;
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('leads')
            .insert([fallbackInput])
            .select()
            .single();
          if (fallbackError) throw fallbackError;
          return fallbackData as Lead;
        }
        throw error;
      }
      return data as Lead;
    } catch (error) {
      console.error('Supabase insert error, falling back to local database:', error);
      return insertLocalLead(input);
    }
  } else {
    return insertLocalLead(input);
  }
}

export async function getLeads(): Promise<Lead[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error, falling back to local database:', error);
        return getLocalLeads();
      }
      return data as Lead[];
    } catch (error) {
      console.error('Supabase fetch exception, falling back to local database:', error);
      return getLocalLeads();
    }
  } else {
    return getLocalLeads();
  }
}

export async function authorizeLeadTransfer(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ authorized_transfer: true })
        .eq('id', id);

      if (error) {
        console.warn('Supabase lead update error, falling back to local database:', error);
        return authorizeLocalLeadTransfer(id);
      }
      return true;
    } catch (err) {
      console.warn('Supabase lead update exception, falling back to local database:', err);
      return authorizeLocalLeadTransfer(id);
    }
  } else {
    return authorizeLocalLeadTransfer(id);
  }
}

export function dbMode(): 'supabase' | 'local' {
  return isSupabaseConfigured ? 'supabase' : 'local';
}
