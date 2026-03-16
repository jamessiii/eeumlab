import { extraHolidayMap, fixedSolarHolidays } from "./data.js";

export function $(selector, root = document) {
  return root.querySelector(selector);
}

export function pad(num) {
  return String(num).padStart(2, "0");
}

export function getDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function getNow() {
  return new Date();
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

export function isPast(date) {
  return date.getTime() < getToday().getTime();
}

export function isFuture(date) {
  return date.getTime() > getToday().getTime();
}

export function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function getWeekdayLabel(date) {
  return ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
}

export function formatMoney(value, digits = 0) {
  const formatted = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(value || 0);
  return formatted.replace(/^₩/, "₩ ");
}

export function formatNumber(value) {
  return Math.round(value || 0).toLocaleString("ko-KR");
}

export function formatTimeFromSeconds(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  return `${pad(Math.floor(safe / 3600))}:${pad(Math.floor((safe % 3600) / 60))}:${pad(safe % 60)}`;
}

export function formatLeaveDays(value) {
  const safe = Math.round(Math.max(0, value || 0) * 100) / 100;
  const text = Number.isInteger(safe) ? String(safe) : safe.toFixed(2).replace(/\.?0+$/, "");
  return `${text}일`;
}

export function timeToSeconds(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return null;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 3600 + minutes * 60;
}

export function isAutoHoliday(date) {
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const yearMap = extraHolidayMap[date.getFullYear()] || {};
  return Boolean(fixedSolarHolidays[key] || yearMap[getDateKey(date)]);
}

export function isHoliday(date, entry) {
  return Boolean(entry?.customHoliday || isAutoHoliday(date));
}

export function getHolidayLabel(date, entry) {
  if (entry?.customHoliday) return "수동 공휴일";
  const key = `${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const yearMap = extraHolidayMap[date.getFullYear()] || {};
  return yearMap[getDateKey(date)] || fixedSolarHolidays[key] || "";
}
