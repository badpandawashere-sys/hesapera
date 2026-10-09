'use server';

import { getSession } from './auth/session';
import { GvdRepository } from './gvd-repository';
import { GvdRecord } from '@/types/raybilgi';
import { revalidatePath } from 'next/cache';

async function requireStation() {
  const session = await getSession();
  if (!session || !session.stationCode) {
    throw new Error('Yetkisiz erişim. Lütfen giriş yapın.');
  }
  return session;
}

export async function getActiveGvdRecords() {
  const session = await requireStation();
  return GvdRepository.getActiveRecords(session.stationCode);
}

export async function getGvdHistory() {
  const session = await requireStation();
  return GvdRepository.getHistoryRecords(session.stationCode);
}

export async function createGvdRecordAction(data: Omit<GvdRecord, 'id' | 'stationId' | 'stationName' | 'createdAt' | 'updatedAt'>) {
  const session = await requireStation();
  
  try {
    await GvdRepository.createRecord(session.stationCode, session.stationName, data);
    revalidatePath('/raybilgi/gvd');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Kayıt eklenemedi.' };
  }
}

export async function updateGvdRecordAction(id: string, data: Partial<Omit<GvdRecord, 'id' | 'stationId' | 'stationName' | 'createdAt' | 'updatedAt'>>) {
  const session = await requireStation();
  
  try {
    await GvdRepository.updateRecord(session.stationCode, id, data);
    revalidatePath('/raybilgi/gvd');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Kayıt güncellenemedi.' };
  }
}

export async function moveRecordsToHistoryAction(ids: string[]) {
  const session = await requireStation();
  
  try {
    await GvdRepository.moveToHistory(session.stationCode, ids);
    revalidatePath('/raybilgi/gvd');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Kayıtlar arşive taşınamadı.' };
  }
}
