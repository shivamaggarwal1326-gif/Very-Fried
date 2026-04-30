import { create } from 'zustand';

export const useStore = create((set) => ({
  // --- NFC & SESSION STATE ---
  activeTableId: null,
  sessionToken: null,
  viewingMerchantId: null,

  // --- ACTIONS ---
  setTableSession: (tableId, token, merchantId) => set({ 
    activeTableId: tableId, 
    sessionToken: token,
    viewingMerchantId: merchantId
  }),
  
  clearTableSession: () => set({ 
    activeTableId: null, 
    sessionToken: null, 
    viewingMerchantId: null 
  }),

  // --- TACTICAL LOADOUT (CART) STATE ---
  pendingBatch: [],
  sentItems: [],
  batchTimer: null,

  // --- ACTIONS ---
  addToBatch: (items) => set((state) => ({ 
    pendingBatch: [...state.pendingBatch, ...items],
    batchTimer: 15 // Starts the 15-second countdown
  })),

  markBatchSent: () => set((state) => ({
    sentItems: [...state.sentItems, ...state.pendingBatch],
    pendingBatch: [],
    batchTimer: null
  })),

  decrementTimer: () => set((state) => ({
    batchTimer: state.batchTimer && state.batchTimer > 0 ? state.batchTimer - 1 : 0
  }))
}));