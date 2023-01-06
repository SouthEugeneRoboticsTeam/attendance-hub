import { useEffect, useState } from 'react';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firestore';

const getUsersRef = () => collection(db!!, 'users');

export default function useConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(
    () =>
      onSnapshot(getUsersRef(), { includeMetadataChanges: true }, (doc) =>
        setIsConnected(!doc.metadata.fromCache),
      ),
    [],
  );

  return isConnected;
}
