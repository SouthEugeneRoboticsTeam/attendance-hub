import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { BaseDirectory, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export let db: Firestore | null = null;

export const initDb = async () => {
  if (!db) {
    try {
      await readTextFile('firebase.json', { dir: BaseDirectory.AppConfig })
        .then((config) => JSON.parse(config))
        .then((config) => {
          const app = initializeApp(config);
          db = getFirestore(app);
        });
    } catch {
      await writeTextFile('firebase.json', '{}', {
        dir: BaseDirectory.AppConfig,
      });
    }
  }

  return db;
};

if (typeof window !== 'undefined') {
  initDb();
}
