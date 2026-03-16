export const STORAGE_KEY = "salary_local_dashboard_split_v1";

export function loadFromStorage(fallback) {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(fallback);

  try {
    return { ...structuredClone(fallback), ...JSON.parse(saved) };
  } catch (error) {
    console.error("state load error", error);
    return structuredClone(fallback);
  }
}

export function saveToStorage(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
