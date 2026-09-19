"use client";

import { createContext, useContext, useMemo } from "react";

import {
  BUILTIN_CASE_TYPES,
  caseTypeHelpers,
  type CaseTypeDef,
  type CaseTypeHelpers,
} from "@/lib/case-types";

const CaseTypesContext = createContext<CaseTypeHelpers>(caseTypeHelpers(BUILTIN_CASE_TYPES));

/**
 * The viewed log's case types, loaded once by the app layout. A server action
 * that changes them revalidates the layout, which re-renders this with the new
 * list, so every chip, picker and count updates together.
 */
export function CaseTypesProvider({
  types,
  children,
}: {
  types: CaseTypeDef[];
  children: React.ReactNode;
}) {
  const value = useMemo(() => caseTypeHelpers(types), [types]);
  return <CaseTypesContext.Provider value={value}>{children}</CaseTypesContext.Provider>;
}

export function useCaseTypes(): CaseTypeHelpers {
  return useContext(CaseTypesContext);
}
