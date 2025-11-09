import { create } from "zustand";
import type { UploadFile } from "@/types/domain";

interface UploadState {
  uploads: Map<string, UploadFile>;
  addUpload: (id: string, file: File) => void;
  updateUpload: (id: string, updates: Partial<UploadFile>) => void;
  removeUpload: (id: string) => void;
  clearCompleted: () => void;
  getActiveUploads: () => UploadFile[];
}

export const useUploadStore = create<UploadState>((set, get) => ({
  uploads: new Map(),
  
  addUpload: (id, file) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.set(id, {
        file,
        status: "QUEUED",
        progress: 0,
      });
      return { uploads: newUploads };
    });
  },
  
  updateUpload: (id, updates) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      const existing = newUploads.get(id);
      if (existing) {
        newUploads.set(id, { ...existing, ...updates });
      }
      return { uploads: newUploads };
    });
  },
  
  removeUpload: (id) => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      newUploads.delete(id);
      return { uploads: newUploads };
    });
  },
  
  clearCompleted: () => {
    set((state) => {
      const newUploads = new Map(state.uploads);
      for (const [id, upload] of newUploads.entries()) {
        if (upload.status === "COMPLETED" || upload.status === "FAILED") {
          newUploads.delete(id);
        }
      }
      return { uploads: newUploads };
    });
  },
  
  getActiveUploads: () => {
    const state = get();
    return Array.from(state.uploads.values()).filter(
      (upload) => upload.status !== "COMPLETED" && upload.status !== "FAILED"
    );
  },
}));

