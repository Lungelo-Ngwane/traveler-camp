import { useEffect, useState } from 'react';
import type { Repository } from './storage';
export function useRepository<T>(repository: Repository<T>) {
  const [snapshot, setSnapshot] = useState(() => repository.load());
  useEffect(() => {
    const receive = (event: StorageEvent) => {
      if (event.key === repository.key || event.key === null)
        setSnapshot(repository.load());
    };
    window.addEventListener('storage', receive);
    return () => window.removeEventListener('storage', receive);
  }, [repository]);
  function update(value: T) {
    setSnapshot({ value, warning: repository.save(value) });
  }
  return { ...snapshot, update };
}
