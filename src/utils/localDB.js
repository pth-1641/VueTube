export const localDB = () => {
  const indexedDB =
    window.indexedDB ||
    window.mozIndexedDB ||
    window.webkitIndexedDB ||
    window.msIndexedDB ||
    window.shimIndexedDB;

  if (!indexedDB) return;

  const open = indexedDB.open('history', 3);

  const init = () => {
    open.onupgradeneeded = () => {
      const db = open.result;
      const store = db.createObjectStore('watch-history', {
        keyPath: 'id',
      });
      store.createIndex('timestamp', 'timestamp', { unique: false });
    };
  };

  open.onsuccess = (e) => {
    window.db = e.target.result;
  };

  open.onerror = () => {
    console.error(open.error);
  };

  const insert = (data) => {
    const db = window.db;
    const tx = db.transaction('watch-history', 'readwrite');
    const store = tx.objectStore('watch-history');
    store.put(data);
  };

  const clearAll = () => {
    const db = window.db;
    const tx = db.transaction('watch-history', 'readwrite');
    const store = tx.objectStore('watch-history');
    store.clear();
  };

  return { init, insert, clearAll };
};
