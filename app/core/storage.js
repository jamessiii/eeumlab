export const STORAGE_KEY = "salary_local_dashboard_split_v1";
const STORAGE_DB_NAME = "office_lab_dashboard";
const STORAGE_DB_VERSION = 1;
const STORAGE_STORE_NAME = "app_state";
const STORAGE_RECORD_KEY = "main";
let storageDbPromise = null;
let persistTimer = null;

function openStorageDb() {
  if (storageDbPromise) return storageDbPromise;
  storageDbPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("indexeddb-unavailable"));
      return;
    }
    const request = indexedDB.open(STORAGE_DB_NAME, STORAGE_DB_VERSION);
    request.onerror = () => reject(request.error || new Error("indexeddb-open-failed"));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        db.createObjectStore(STORAGE_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  }).catch((error) => {
    storageDbPromise = null;
    throw error;
  });
  return storageDbPromise;
}

function readLegacyStorage(fallback) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(fallback);

  try {
    return { ...structuredClone(fallback), ...JSON.parse(saved) };
  } catch (error) {
    console.error("state load error", error);
    return structuredClone(fallback);
  }
}

export async function loadFromStorage(fallback) {
  const base = structuredClone(fallback);
  try {
    const db = await openStorageDb();
    const storedState = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORAGE_STORE_NAME, "readonly");
      const store = tx.objectStore(STORAGE_STORE_NAME);
      const request = store.get(STORAGE_RECORD_KEY);
      request.onerror = () => reject(request.error || new Error("indexeddb-read-failed"));
      request.onsuccess = () => resolve(request.result?.value || null);
    });
    if (storedState && typeof storedState === "object") {
      return { ...base, ...storedState };
    }

    const migrated = readLegacyStorage(fallback);
    if (localStorage.getItem(STORAGE_KEY)) {
      await saveToStorage(migrated, { immediate: true });
      localStorage.removeItem(STORAGE_KEY);
    }
    return migrated;
  } catch (error) {
    console.error("indexeddb load error", error);
    return readLegacyStorage(fallback);
  }
}

async function writeStateSnapshot(snapshot) {
  const db = await openStorageDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORAGE_STORE_NAME, "readwrite");
    const store = tx.objectStore(STORAGE_STORE_NAME);
    const request = store.put({ id: STORAGE_RECORD_KEY, value: snapshot });
    request.onerror = () => reject(request.error || new Error("indexeddb-write-failed"));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("indexeddb-transaction-failed"));
  });
}

export function saveToStorage(state, options = {}) {
  const snapshot = JSON.parse(JSON.stringify(state));
  const commit = async () => {
    try {
      await writeStateSnapshot(snapshot);
    } catch (error) {
      console.error("indexeddb save error", error);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      } catch (storageError) {
        console.error("localStorage fallback save error", storageError);
      }
    }
  };

  if (options.immediate) {
    return commit();
  }

  if (persistTimer) {
    window.clearTimeout(persistTimer);
  }
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    void commit();
  }, 0);
  return Promise.resolve();
}
