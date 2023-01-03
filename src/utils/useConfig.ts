import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { useEffect, useState } from 'react';

export let setConfigValue: (value: any) => void = null;

export default function useConfig() {
  const [value, setValue] = useState<any>(null);

  setConfigValue = setValue;

  useEffect(() => {
    readTextFile('config.json', { dir: BaseDirectory.AppConfig })
      .then((config) => JSON.parse(config))
      .then((config) => setValue(config));
  }, []);

  return value;
}
