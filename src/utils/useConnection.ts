import { useEffect, useState } from 'react';

import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firestore';

const getUsersRef = () => db && collection(db!!, 'users');

export default function useConnection() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(
    () => {
      const userRef = getUsersRef();
      if (!userRef) return;

      return onSnapshot(userRef, { includeMetadataChanges: true }, (doc) =>
        setIsConnected(!doc.metadata.fromCache),
      );
    },
    [],
  );

  return isConnected;
}
