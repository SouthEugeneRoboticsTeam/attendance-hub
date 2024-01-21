import { initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { BaseDirectory, createDir, readTextFile, writeTextFile } from '@tauri-apps/api/fs';

export let db: Firestore | null = null;

export const FIREBASE_CONFIG_PATH = 'firebase.json';

export const initDb = async () => {
  if (!db) {
    try {
      await readTextFile(FIREBASE_CONFIG_PATH, { dir: BaseDirectory.AppConfig })
        .then((config) => JSON.parse(config))
        .then((config) => {
          const app = initializeApp(config, 'app');
          db = getFirestore(app);
        });
    } catch {
      // Create directory
      await createDir('firebase', { dir: BaseDirectory.AppConfig, recursive: true });
      await writeTextFile(FIREBASE_CONFIG_PATH, '{}', {
        dir: BaseDirectory.AppConfig,
      });
    }
  }

  return db;
};

if (typeof window !== 'undefined') {
  initDb();
}
