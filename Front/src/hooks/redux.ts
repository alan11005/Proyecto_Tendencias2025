// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";

// Use en vez de useDispatch sin tipos
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Use en vez de useSelector sin tipos
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
