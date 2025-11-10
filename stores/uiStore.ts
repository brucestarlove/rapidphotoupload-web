import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PhotoStatus } from "@/types/domain";

export type ViewMode = "grid" | "list";

export type SortField = "name" | "date" | "size";
export type SortDirection = "asc" | "desc";

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface Filters {
  status?: PhotoStatus | "ALL";
  tags?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

interface UIState {
  // View mode
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Sorting
  sortConfig: SortConfig;
  setSortConfig: (config: SortConfig) => void;
  toggleSort: (field: SortField) => void;

  // Filters
  filters: Filters;
  setStatusFilter: (status: PhotoStatus | "ALL" | undefined) => void;
  setTagFilter: (tags: string[] | undefined) => void;
  setDateRangeFilter: (range: { start: string; end: string } | undefined) => void;
  setSearchQuery: (query: string | undefined) => void;
  clearFilters: () => void;
}

const defaultSortConfig: SortConfig = {
  field: "date",
  direction: "desc",
};

const defaultFilters: Filters = {};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      viewMode: "grid",
      setViewMode: (mode) => set({ viewMode: mode }),

      sortConfig: defaultSortConfig,
      setSortConfig: (config) => set({ sortConfig: config }),
      toggleSort: (field) => {
        const current = get().sortConfig;
        if (current.field === field) {
          // Toggle direction
          set({
            sortConfig: {
              field,
              direction: current.direction === "asc" ? "desc" : "asc",
            },
          });
        } else {
          // New field, default to desc
          set({ sortConfig: { field, direction: "desc" } });
        }
      },

      filters: defaultFilters,
      setStatusFilter: (status) =>
        set((state) => ({
          filters: { ...state.filters, status: status === "ALL" ? undefined : status },
        })),
      setTagFilter: (tags) =>
        set((state) => ({
          filters: { ...state.filters, tags: tags && tags.length > 0 ? tags : undefined },
        })),
      setDateRangeFilter: (range) =>
        set((state) => ({
          filters: { ...state.filters, dateRange: range },
        })),
      setSearchQuery: (query) =>
        set((state) => ({
          filters: { ...state.filters, search: query && query.trim() ? query.trim() : undefined },
        })),
      clearFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: "ui-preferences",
      partialize: (state) => ({
        viewMode: state.viewMode,
        sortConfig: state.sortConfig,
        // Don't persist filters - they should reset on page reload
      }),
    }
  )
);

