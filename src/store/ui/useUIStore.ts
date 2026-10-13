import { BRAND_STORAGE_KEYS } from '@/config/brand';
import { type LocaleCode } from '@/locales';
import { detectBrowserLanguage } from '@/utils/language';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type ViewMode = 'pdf' | 'html';

export type SyncGatewayTarget = 'save' | 'manage' | 'export';

interface UIStore {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isSidebarOpen: boolean; // Mobile toggle state
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean; // Desktop collapsed state
  setSidebarCollapsed: (collapsed: boolean) => void;
  appTheme: 'light' | 'dark' | 'system';
  setAppTheme: (theme: 'light' | 'dark' | 'system') => void;
  appLanguage: LocaleCode;
  setAppLanguage: (lang: LocaleCode) => void;
  isVerifyingPayment: boolean;
  setIsVerifyingPayment: (val: boolean) => void;
  isDeleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setContactModalOpen: (open: boolean) => void;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  // Sync & Export Modals
  activeSyncModal: 'none' | 'name' | 'gateway';
  syncGatewayTarget: SyncGatewayTarget;
  /**
   * ⚠️ The target is REQUIRED to open the gateway, and optional otherwise. The
   * setter only writes it when truthy, so an omitted target is not a default —
   * it is whatever the last caller left behind, and the gateway reads it to
   * pick its label, its icon and what its primary button does. Opening with
   * a stale `'save'` points that button at a sync on an account with no
   * provider configured.
   */
  setSyncModal: {
    (modal: 'none' | 'name' | 'gateway', target: SyncGatewayTarget): void;
    /** Target omitted — so not the gateway, whose target must be stated. */
    (modal: 'none' | 'name', target?: SyncGatewayTarget): void;
  };
  editorPaneWidth: number;
  setEditorPaneWidth: (width: number) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  firstTimeLanguageSelected: boolean;
  setFirstTimeLanguageSelected: (selected: boolean) => void;
  /**
   * The editor section rail. ⚠️ `null` is not "expanded" — it means *no explicit
   * choice*, so the rail follows the measured workspace width. Any toggle pins
   * it, exactly as `sidebarCollapsed` behaves once the user touches it.
   */
  editorRailCollapsed: boolean | null;
  setEditorRailCollapsed: (collapsed: boolean | null) => void;
  /**
   * The AI composer band. A plain boolean, unlike the rail: there is no measured
   * default to return to, so there is no third state. It starts **expanded** so
   * a first-time user cannot miss that the feature exists, and stays wherever
   * the user last put it.
   */
  aiComposerCollapsed: boolean;
  setAiComposerCollapsed: (collapsed: boolean) => void;
  /**
   * The cover letter's Recipient sub-section. `null` means no choice yet, so it
   * follows its content (collapsed only when empty). Session-only, not in
   * `partialize`: it outlives a form remount, not a reload. `importResume`
   * clears it when another CV is loaded.
   */
  coverLetterRecipientCollapsed: boolean | null;
  setCoverLetterRecipientCollapsed: (collapsed: boolean | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    immer((set) => {
      // Check for migration data
      const migrationDataStr = localStorage.getItem('cv_canvas_migration_ui');
      let migrationData: Record<string, unknown> | null = null;
      if (migrationDataStr) {
        try {
          migrationData = JSON.parse(migrationDataStr);
          localStorage.removeItem('cv_canvas_migration_ui');
        } catch (e) {
          console.error('Failed to parse migration data', e);
        }
      }

      return {
        viewMode: 'pdf',
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode;
          }),
        isSidebarOpen: false,
        setSidebarOpen: (open) =>
          set((state) => {
            state.isSidebarOpen = open;
          }),
        sidebarCollapsed: (migrationData?.sidebarCollapsed as boolean) ?? true,
        setSidebarCollapsed: (collapsed) =>
          set((state) => {
            state.sidebarCollapsed = collapsed;
          }),
        appTheme: (migrationData?.appTheme as 'light' | 'dark' | 'system') ?? 'system',
        setAppTheme: (theme) =>
          set((state) => {
            state.appTheme = theme;
          }),
        appLanguage:
          (migrationData?.appLanguage as LocaleCode) ?? (detectBrowserLanguage() as LocaleCode),
        setAppLanguage: (lang) =>
          set((state) => {
            state.appLanguage = lang;
          }),
        isVerifyingPayment: false,
        setIsVerifyingPayment: (val) =>
          set((state) => {
            state.isVerifyingPayment = val;
          }),
        isDeleteModalOpen: false,
        setDeleteModalOpen: (open) =>
          set((state) => {
            state.isDeleteModalOpen = open;
          }),
        isContactModalOpen: false,
        setContactModalOpen: (open) =>
          set((state) => {
            state.isContactModalOpen = open;
          }),
        isPricingModalOpen: false,
        setIsPricingModalOpen: (open) =>
          set((state) => {
            state.isPricingModalOpen = open;
          }),
        activeSyncModal: 'none',
        syncGatewayTarget: 'save',
        setSyncModal: (modal, target) =>
          set((state) => {
            state.activeSyncModal = modal;
            if (target) state.syncGatewayTarget = target;
          }),
        editorPaneWidth:
          typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.55, 1024) : 560,
        setEditorPaneWidth: (width) =>
          set((state) => {
            state.editorPaneWidth = width;
          }),
        isDragging: false,
        setIsDragging: (dragging) =>
          set((state) => {
            state.isDragging = dragging;
          }),
        firstTimeLanguageSelected: false,
        setFirstTimeLanguageSelected: (selected) =>
          set((state) => {
            state.firstTimeLanguageSelected = selected;
          }),
        editorRailCollapsed: null,
        setEditorRailCollapsed: (collapsed) =>
          set((state) => {
            state.editorRailCollapsed = collapsed;
          }),
        // ⚠️ Collapsed by DEFAULT. Expanded, the band spends vertical space
        // above the editor advertising a feature nobody has asked for yet —
        // and someone who has just imported a CV is offered the adjustment in
        // that flow anyway, so the open band was making the same offer twice
        // and charging the fold for it. Persisted, so anyone who opens it keeps
        // it open; this only changes what a first visit looks like.
        aiComposerCollapsed: true,
        setAiComposerCollapsed: (collapsed) =>
          set((state) => {
            state.aiComposerCollapsed = collapsed;
          }),
        coverLetterRecipientCollapsed: null,
        setCoverLetterRecipientCollapsed: (collapsed) =>
          set((state) => {
            state.coverLetterRecipientCollapsed = collapsed;
          }),
      };
    }),
    {
      name: BRAND_STORAGE_KEYS.uiPreferences,
      partialize: (state) => ({
        viewMode: state.viewMode,
        sidebarCollapsed: state.sidebarCollapsed,
        appTheme: state.appTheme,
        appLanguage: state.appLanguage,
        editorPaneWidth: state.editorPaneWidth,
        firstTimeLanguageSelected: state.firstTimeLanguageSelected,
        editorRailCollapsed: state.editorRailCollapsed,
        aiComposerCollapsed: state.aiComposerCollapsed,
      }),
    },
  ),
);
