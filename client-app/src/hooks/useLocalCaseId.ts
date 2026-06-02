import { storage } from '../utils/storage';

const CASE_ID_KEY = 'case_id_counter';
const DEFAULT_COUNTER = 15;

export async function getNextCaseId(): Promise<string> {
  const current = await storage.get<number>(CASE_ID_KEY);
  const next = (current !== null ? current : DEFAULT_COUNTER) + 1;
  await storage.set(CASE_ID_KEY, next);
  return 'CG-' + String(next).padStart(5, '0');
}
