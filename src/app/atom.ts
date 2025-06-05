// src/app/atom.ts
import { atom } from "jotai";

export const placeAtom = atom("");               // Holds selected place/city
export const loadingCityAtom = atom(false);      // Tracks loading state for city
