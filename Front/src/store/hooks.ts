import { RootStateType } from ".";
import { AppDispatch } from ".";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Hook para acceder al estado del store
export const useAppSelector: TypedUseSelectorHook<RootStateType> = useSelector;
// Hook para acceder al dispatch del store
export const useAppDispatch = () => useDispatch<AppDispatch>();