import { loadFromStorage, saveToStorage } from "./storage.js";

const defaultState = {
  activeTab: "tracker",
  monthlySalary: 3000000,
  monthlyGoal: "",
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  leaveAllowance: 15,
  lunchCategory: "한식",
  lunchSearchQuery: "",
  lunchKakaoApiKey: "",
  lunchFavorites: [],
  lunchFavoritesOnly: false,
  lunchStartTime: "",
  lunchEndTime: "",
  lunchLastFetchAt: "",
  lunchLastLocation: null,
  lunchCachedPlaces: [],
  todoItems: [],
  todoViewMode: "list",
  todoCalendarMode: "month",
  todoSelectedDate: new Date().toISOString().slice(0, 10),
  todoShowFavoritesOnly: false,
  todoShowCompleted: true,
  bookmarks: [],
  bookmarkViewMode: "card",
  bookmarkLabels: [],
  fortuneSelectedZodiac: "",
  ladderNames: "민수\n지연\n현우\n서연",
  ladderPlayerCount: 4,
  ladderPlayerNames: ["민수", "지연", "현우", "서연", "유진", "태민", "하린", "도윤", "소연", "준호", "나연", "지후", "세아"],
  ladderResultLabels: ["통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "통과", "꽝"],
  ladderBridgeCount: 7,
  ladderFailCount: 1,
  ladderOrientation: "vertical",
  ladderSavedFormats: [],
  pendingSalaryAppliedToast: false,
  pendingSalaryAppliedValue: 0,
  pendingSalaryPreviousValue: 0,
  weatherCache: null,
  entries: {},
  annualMin: 2800,
  annualMax: 10000,
  annualStep: 100,
  dependents: 1,
  nontaxMeal: 200000
};

export const state = loadFromStorage(defaultState);

export function persist() {
  saveToStorage(state);
}
