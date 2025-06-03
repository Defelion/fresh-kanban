import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useColumnDragAndDrop } from '@/composables/useColumnDragAndDrop.ts';

let mockColumnDragStore_draggedColumn: { id: string; title: string } | null = null;
let mockColumnDragStore_hoverColumnId: string | null = null;

const mockColumnStoreActions = {
  moveColumn: vi.fn(),
  removeColumn: vi.fn(),
};

const mockColumnDragStoreState = {
  draggedColumn: null as { id: string; title: string } | null,
  hoverColumnId: null as string | null,
};

const mockColumnDragStoreActions = {
  setHoverColumnId: vi.fn((id: string | null) => { mockColumnDragStore_hoverColumnId = id; }),
  clearDraggedColumn: vi.fn(() => { mockColumnDragStore_draggedColumn = null; }),
  setDraggedColumn: vi.fn((col: { id: string; title: string } | null) => { mockColumnDragStore_draggedColumn = col; }),
};

const mockCardDragStoreActions = {
  setHoverCardId: vi.fn(),
  setHoverColumnId: vi.fn(),
  clearDraggedCard: vi.fn(),
};

vi.mock('@/stores/columnStore', () => ({
  useColumnStore: () => mockColumnStoreActions,
}));

vi.mock('@/stores/columnDragStore', () => ({
  useColumnDragStore: () => ({
    get draggedColumn () { return mockColumnDragStore_draggedColumn; },
    get hoverColumnId () { return mockColumnDragStore_hoverColumnId; },
    ...mockColumnDragStoreActions,
  }),
}));

vi.mock('@/stores/cardDragStore', () => ({
  useCardDragStore: () => mockCardDragStoreActions,
}));

const createMockDragEvent = () => ({
  preventDefault: vi.fn(),
  dataTransfer: {
    setData: vi.fn(),
    effectAllowed: '' as DataTransfer['effectAllowed'],
    dropEffect: '' as DataTransfer['dropEffect'],
  },
});

describe('useColumnDragAndDrop Composable', () => {
  const testColumnId = 'colTest1';
  const testColumnTitle = 'Test Kolonne 1';
  let composable: ReturnType<typeof useColumnDragAndDrop>;

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockColumnDragStore_draggedColumn = null;
    mockColumnDragStore_hoverColumnId = null;

    composable = useColumnDragAndDrop(testColumnId, testColumnTitle);
  });


  describe('onDragStartColumn', () => {
    it('skal rydde stores, sætte dataTransfer og sætte draggedColumn i columnDragStore', () => {
      const mockEvent = createMockDragEvent();
      composable.onDragStartColumn(mockEvent as any);

      expect(mockColumnDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
      expect(mockColumnDragStoreActions.clearDraggedColumn).toHaveBeenCalledTimes(1);
      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith(null);
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
      expect(mockCardDragStoreActions.clearDraggedCard).toHaveBeenCalledTimes(1);

      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', testColumnId);
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');
      expect(mockColumnDragStoreActions.setDraggedColumn).toHaveBeenCalledWith({ id: testColumnId, title: testColumnTitle });
    });

    it('SKAL FEJLE HVIS onDragStartColumn VIRKER: Forventer at draggedColumn IKKE sættes', () => {
      const mockEvent = createMockDragEvent();
      composable.onDragStartColumn(mockEvent as any);
      expect(mockColumnDragStoreActions.setDraggedColumn).not.toHaveBeenCalled();
    });
  });

  describe('onDragOverColumn', () => {
    it('skal kalde preventDefault, sætte dropEffect og setHoverColumnId hvis en anden kolonne trækkes', () => {
      mockColumnDragStore_draggedColumn = { id: 'anotherCol', title: 'Anden Kolonne' };
      const mockEvent = createMockDragEvent();

      composable.onDragOverColumn(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockColumnDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(testColumnId);
    });

    it('skal IKKE kalde setHoverColumnId hvis den samme kolonne trækkes henover sig selv', () => {
      mockColumnDragStore_draggedColumn = { id: testColumnId, title: testColumnTitle };
      const mockEvent = createMockDragEvent();

      composable.onDragOverColumn(mockEvent as any);
      expect(mockColumnDragStoreActions.setHoverColumnId).not.toHaveBeenCalled();
    });

    it('skal IKKE kalde setHoverColumnId hvis intet trækkes', () => {
      mockColumnDragStore_draggedColumn = null;
      const mockEvent = createMockDragEvent();

      composable.onDragOverColumn(mockEvent as any);
      expect(mockColumnDragStoreActions.setHoverColumnId).not.toHaveBeenCalled();
    });

    it('SKAL FEJLE HVIS onDragOverColumn VIRKER: Forventer at setHoverColumnId IKKE kaldes, når en anden kolonne trækkes', () => {
      mockColumnDragStore_draggedColumn = { id: 'anotherCol', title: 'Anden Kolonne' };
      const mockEvent = createMockDragEvent();
      composable.onDragOverColumn(mockEvent as any);
      expect(mockColumnDragStoreActions.setHoverColumnId).not.toHaveBeenCalledWith(testColumnId);
    });
  });

  describe('onDragLeaveColumn', () => {
    it('skal nulstille hoverColumnId hvis den matchede den aktuelle kolonne', () => {
      // Sæt den globale let-variabel
      mockColumnDragStore_hoverColumnId = testColumnId;

      composable.onDragLeaveColumn();
      expect(mockColumnDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
    });

    it('SKAL FEJLE HVIS onDragLeaveColumn VIRKER: Forventer at hoverColumnId IKKE nulstilles', () => {
      mockColumnDragStore_hoverColumnId = testColumnId;
      composable.onDragLeaveColumn();
      expect(mockColumnDragStore_hoverColumnId).toBe(testColumnId);
    });
  });

  describe('onDropColumn', () => {
    it('skal kalde preventDefault, moveColumn og rydde drag state, hvis en anden kolonne droppes', () => {
      mockColumnDragStore_draggedColumn = { id: 'draggedColId', title: 'Trukket Kolonne' };
      const mockEvent = createMockDragEvent();

      composable.onDropColumn(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockColumnStoreActions.moveColumn).toHaveBeenCalledWith('draggedColId', testColumnId);
      expect(mockColumnDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
      expect(mockColumnDragStoreActions.clearDraggedColumn).toHaveBeenCalledTimes(1);
    });

    it('skal IKKE kalde moveColumn hvis ingen kolonne trækkes', () => {
      mockColumnDragStoreState.draggedColumn = null;
      const mockEvent = createMockDragEvent();

      composable.onDropColumn(mockEvent as any);
      expect(mockColumnStoreActions.moveColumn).not.toHaveBeenCalled();
    });

    it('skal IKKE kalde moveColumn hvis en kolonne droppes på sig selv', () => {
      mockColumnDragStoreState.draggedColumn = { id: testColumnId, title: testColumnTitle };
      const mockEvent = createMockDragEvent();

      composable.onDropColumn(mockEvent as any);
      expect(mockColumnStoreActions.moveColumn).not.toHaveBeenCalled();
    });

    it('SKAL FEJLE HVIS onDropColumn VIRKER: Forventer at moveColumn IKKE kaldes', () => {
      mockColumnDragStore_draggedColumn = { id: 'draggedColId', title: 'Trukket Kolonne' };
      const mockEvent = createMockDragEvent();
      composable.onDropColumn(mockEvent as any);
      expect(mockColumnStoreActions.moveColumn).not.toHaveBeenCalled();
    });
  });

  describe('removeColumn', () => {
    it('skal kalde columnStore.removeColumn med det korrekte columnId', () => {
      const idToRemove = 'colXyz';
      composable.removeColumn(idToRemove);
      expect(mockColumnStoreActions.removeColumn).toHaveBeenCalledWith(idToRemove);
    });

    it('SKAL FEJLE HVIS removeColumn VIRKER: Forventer at store.removeColumn IKKE kaldes', () => {
      const idToRemove = 'colXyz';
      composable.removeColumn(idToRemove);
      expect(mockColumnStoreActions.removeColumn).not.toHaveBeenCalledWith(idToRemove);
    });
  });
});
