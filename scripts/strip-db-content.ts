import 'dotenv/config';
import { loadDb, saveDb } from '../backend/server/db';

const db = loadDb();
saveDb(db);

console.log('Removed authored curriculum arrays from db.json. User/runtime data remains.');
