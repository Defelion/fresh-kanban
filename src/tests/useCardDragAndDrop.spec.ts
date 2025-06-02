import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCardDragAndDrop } from '@/composables/useCardDragAndDrop.ts';

const mockColumnDragStoreActions = {
  setHoverColumnId: vi.fn(),
  clearDraggedColumn: vi.fn(),
};
vi.mock('@/stores/columnDragStore', () => ({
  useColumnDragStore: () => mockColumnDragStoreActions,
}));

// Mock for cardDragStore
const mockCardDragStoreState = {
  draggedCard: null as { cardId: string; fromColumnId: string; title: string; description: string } | null,
  hoverCardId: null as string | null,
  hoverColumnId: null as string | null,
};
const mockCardDragStoreActions = {
  setHoverCardId: vi.fn(id => { mockCardDragStoreState.hoverCardId = id; }),
  setHoverColumnId: vi.fn(id => { mockCardDragStoreState.hoverColumnId = id; }),
  clearDraggedCard: vi.fn(() => { mockCardDragStoreState.draggedCard = null; }),
  setDraggedCard: vi.fn(card => { mockCardDragStoreState.draggedCard = card; }),
};
vi.mock('@/stores/cardDragStore', () => ({
  useCardDragStore: () => ({
    ...mockCardDragStoreState,
    ...mockCardDragStoreActions,
  }),
}));

// Mock for cardStore
const mockCardStoreState = {
  cards: [] as { id: string; columnId: string; title: string; description: string }[],
};
const mockCardStoreActions = {
  moveCard: vi.fn(),
  removeCard: vi.fn(),
  cardsByColumn: vi.fn((columnId: string) => mockCardStoreState.cards.filter(c => c.columnId === columnId)),
};
vi.mock('@/stores/cardStore', () => ({
  useCardStore: () => ({
    get cards () { return mockCardStoreState.cards; },
    ...mockCardStoreActions,
  }),
}));

const createMockDragEvent = () => ({
  preventDefault: vi.fn(),
  dataTransfer: {
    setData: vi.fn(),
    effectAllowed: '' as DataTransfer['effectAllowed'],
    dropEffect: '' as DataTransfer['dropEffect'],
  },
});

const MOCK_CARD_DETAILS = {
  id: 'cardTest1',
  title: 'Test Card 1',
  description: 'Description for Test Card 1',
  columnId: 'colInitial',
};

describe('useCardDragAndDrop Composable', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();

    mockCardDragStoreState.draggedCard = null;
    mockCardDragStoreState.hoverCardId = null;
    mockCardDragStoreState.hoverColumnId = null;
    mockCardStoreState.cards = [];

    mockCardDragStoreActions.setHoverCardId.mockImplementation(id => { mockCardDragStoreState.hoverCardId = id; });
    mockCardDragStoreActions.setHoverColumnId.mockImplementation(id => { mockCardDragStoreState.hoverColumnId = id; });
    mockCardDragStoreActions.clearDraggedCard.mockImplementation(() => { mockCardDragStoreState.draggedCard = null; });
    mockCardDragStoreActions.setDraggedCard.mockImplementation(card => { mockCardDragStoreState.draggedCard = card; });
    mockCardStoreActions.cardsByColumn.mockImplementation(
      (columnId: string) => mockCardStoreState.cards.filter(c => c.columnId === columnId)
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('onDragStart', () => {
    it('skal rydde stores, sætte dataTransfer og sætte draggedCard i cardDragStore', () => {
      const { onDragStart } = useCardDragAndDrop('card', MOCK_CARD_DETAILS.id, MOCK_CARD_DETAILS.columnId);
      const mockEvent = createMockDragEvent();

      onDragStart(mockEvent as any, MOCK_CARD_DETAILS);

      expect(mockColumnDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
      expect(mockColumnDragStoreActions.clearDraggedColumn).toHaveBeenCalledTimes(1);

      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith(null);
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null); // Den fra cardDragStore
      expect(mockCardDragStoreActions.clearDraggedCard).toHaveBeenCalledTimes(1);

      expect(mockEvent.dataTransfer.setData).toHaveBeenCalledWith('text/plain', MOCK_CARD_DETAILS.id);
      expect(mockEvent.dataTransfer.effectAllowed).toBe('move');

      expect(mockCardDragStoreActions.setDraggedCard).toHaveBeenCalledWith({
        cardId: MOCK_CARD_DETAILS.id,
        cardTitle: MOCK_CARD_DETAILS.title,
        cardDescription: MOCK_CARD_DETAILS.description,
        fromColumnId: MOCK_CARD_DETAILS.columnId,
      });
    });

    it('SKAL FEJLE HVIS onDragStart VIRKER: Forventer at draggedCard IKKE sættes korrekt', () => {
      const { onDragStart } = useCardDragAndDrop('card', MOCK_CARD_DETAILS.id, MOCK_CARD_DETAILS.columnId);
      const mockEvent = createMockDragEvent();
      onDragStart(mockEvent as any, MOCK_CARD_DETAILS);

      expect(mockCardDragStoreActions.setDraggedCard).not.toHaveBeenCalledWith(
        expect.objectContaining({ cardId: MOCK_CARD_DETAILS.id })
      );
    });
  });

  describe('onDragOver', () => {
    it('type="column": skal sætte hoverColumnId og rydde hoverCardId hvis kort er i anden kolonne', () => {
      mockCardStoreState.cards = [{ id: 'otherCard', columnId: 'colOther', title: '', description: '' }];
      mockCardDragStoreState.hoverCardId = 'otherCard';

      const { onDragOver } = useCardDragAndDrop('column', 'colTarget', null);
      const mockEvent = createMockDragEvent();
      onDragOver(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith('colTarget');
      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith(null);
    });

    it('type="card": skal sætte hoverColumnId og hoverCardId', () => {
      const { onDragOver } = useCardDragAndDrop('card', 'cardTargetId', 'colOfCardTarget');
      const mockEvent = createMockDragEvent();
      onDragOver(mockEvent as any);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith('colOfCardTarget');
      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith('cardTargetId');
    });

    it('SKAL FEJLE HVIS onDragOver VIRKER (type="column"): Forventer at hoverColumnId IKKE sættes', () => {
      const { onDragOver } = useCardDragAndDrop('column', 'colTarget', null);
      const mockEvent = createMockDragEvent();
      onDragOver(mockEvent as any);

      expect(mockCardDragStoreActions.setHoverColumnId).not.toHaveBeenCalledWith('colTarget');
    });
  });

  describe('onDrop', () => {
    it('type="column": skal kalde cardStore.moveCard med kolonne-id og null som targetCardId', () => {
      mockCardDragStoreState.draggedCard = { cardId: 'draggedC1', fromColumnId: 'colFrom', title: '', description: '' };
      const { onDrop } = useCardDragAndDrop('column', 'colDropTarget', null);
      const mockEvent = createMockDragEvent();

      onDrop(mockEvent as any);

      expect(mockCardStoreActions.moveCard).toHaveBeenCalledWith('draggedC1', 'colDropTarget', null);
      expect(mockCardDragStoreActions.clearDraggedCard).toHaveBeenCalled();
      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith(null);
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
    });

    it('type="card": skal kalde cardStore.moveCard med currentColumnId og target card id', () => {
      mockCardDragStoreState.draggedCard = { cardId: 'draggedC1', fromColumnId: 'colFrom', title: '', description: '' };
      const { onDrop } = useCardDragAndDrop('card', 'cardDroppedOn', 'colTarget');
      const mockEvent = createMockDragEvent();

      onDrop(mockEvent as any);

      expect(mockCardStoreActions.moveCard).toHaveBeenCalledWith('draggedC1', 'colTarget', 'cardDroppedOn');
    });

    it('SKAL FEJLE HVIS onDrop VIRKER (type="column"): Forventer at cardStore.moveCard IKKE kaldes', () => {
      mockCardDragStoreState.draggedCard = { cardId: 'draggedC1', fromColumnId: 'colFrom', title: '', description: '' };
      const { onDrop } = useCardDragAndDrop('column', 'colDropTarget', null);
      const mockEvent = createMockDragEvent();

      onDrop(mockEvent as any);

      expect(mockCardStoreActions.moveCard).not.toHaveBeenCalled();
    });
  });

  describe('onDragEnd', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('type="card" og matchende id: skal rydde draggedCard og hover states', () => {
      const composableCardId = 'activeCard';
      mockCardDragStoreState.draggedCard = { cardId: composableCardId, fromColumnId: 'colFrom', title: '', description: '' };
      const { onDragEnd } = useCardDragAndDrop('card', composableCardId, 'colFrom');

      onDragEnd();
      vi.runAllTimers();

      expect(mockCardDragStoreActions.clearDraggedCard).toHaveBeenCalledTimes(1);
      expect(mockCardDragStoreActions.setHoverCardId).toHaveBeenCalledWith(null);
      expect(mockCardDragStoreActions.setHoverColumnId).toHaveBeenCalledWith(null);
    });

    it('SKAL FEJLE HVIS onDragEnd VIRKER (type="card", matchende id): Forventer draggedCard IKKE ryddes', () => {
      const composableCardId = 'activeCard';
      mockCardDragStoreState.draggedCard = { cardId: composableCardId, fromColumnId: 'colFrom', title: '', description: '' };
      const { onDragEnd } = useCardDragAndDrop('card', composableCardId, 'colFrom');

      onDragEnd();
      vi.runAllTimers();

      expect(mockCardDragStoreActions.clearDraggedCard).not.toHaveBeenCalled();
    });
  });

  describe('removeCards', () => {
    it('type="column": skal kalde cardStore.removeCard for hvert kort i den specificerede kolonne', () => {
      const targetColumnId = 'colWithCards';
      mockCardStoreState.cards = [
        { id: 'card1', columnId: targetColumnId, title: 'c1', description: '' },
        { id: 'card2', columnId: 'otherCol', title: 'c2', description: '' },
        { id: 'card3', columnId: targetColumnId, title: 'c3', description: '' },
      ];
      const { removeCards } = useCardDragAndDrop('column', targetColumnId, null);

      removeCards();

      expect(mockCardStoreActions.removeCard).toHaveBeenCalledWith('card1');
      expect(mockCardStoreActions.removeCard).toHaveBeenCalledWith('card3');
      expect(mockCardStoreActions.removeCard).toHaveBeenCalledTimes(2);
    });

    it('SKAL FEJLE HVIS removeCards VIRKER (type="column"): Forventer removeCard IKKE kaldes', () => {
      const targetColumnId = 'colWithCards';
      mockCardStoreState.cards = [{ id: 'card1', columnId: targetColumnId, title: 'c1', description: '' }];
      const { removeCards } = useCardDragAndDrop('column', targetColumnId, null);

      removeCards();

      expect(mockCardStoreActions.removeCard).not.toHaveBeenCalledWith('card1');
    });
  });
});
