import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Database from "@tauri-apps/plugin-sql";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const db = await Database.load("sqlite:test.db");
