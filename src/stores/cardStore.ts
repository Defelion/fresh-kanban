import { defineStore } from 'pinia';
import { useBoardStore } from '@/stores/boardStore.ts';


interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
}

interface CardStoreState {
  cards: Card[];
  nextId: number;
}

const getLocalStorageKey = (boardKey: string | null) => {
  if (!boardKey) return null;
  return `kanbanCards_${boardKey}`;
};

export const useCardStore = defineStore('cardStore', {
  state: (): CardStoreState => ({
    cards: [],
    nextId: 0,
  }),
  getters: {
    cardsByColumn (state) {
      return (columnId: string) => state.cards.filter(card => card.columnId === columnId);
    },
  },
  actions: {
    _saveCardsToLocalStorage () {
      const boardStore = useBoardStore();
      const key = getLocalStorageKey(boardStore.currentBoardKey);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify({ cards: this.cards, nextId: this.nextId }));
        } catch (e) {
          console.error('Error saving cards to localStorage:', e);
        }
      }
    },
    loadCardsFromLocalStorage () {
      const boardStore = useBoardStore();
      const key = getLocalStorageKey(boardStore.currentBoardKey);

      if (key) {
        const savedDataJson = localStorage.getItem(key);
        if (savedDataJson) {
          try {
            const savedData = JSON.parse(savedDataJson);
            if (savedData && Array.isArray(savedData.cards) && typeof savedData.nextId === 'number') {
              this.cards = savedData.cards;
              this.nextId = savedData.nextId;
            } else {
              this.cards = [];
              this.nextId = 0;
            }
          } catch (e) {
            console.error('Error parsing cards from localStorage:', e);
            this.cards = [];
            this.nextId = 0;
          }
          return;
        }
      }

      this.cards = [];
      this.nextId = 0;
    },
    addCard (columnId: string, title: string, description: string) {
      const id = `ca${this.nextId++}`;
      this.cards.push({ id, title, description, columnId });
      this._saveCardsToLocalStorage();
    },
    removeCard (cardId: string) {
      const index = this.cards.findIndex(card => card.id === cardId);
      if (index >= 0) {
        this.cards.splice(index, 1);
        this._saveCardsToLocalStorage();
      }
    },
    updateCard (updatedCard: Card) {
      const index = this.cards.findIndex(card => card.id === updatedCard.id);
      if (index >= 0) {
        this.cards[index] = { ...updatedCard };
        this._saveCardsToLocalStorage();
      }
    },
    moveCard (cardId: string, toColumnId: string, targetCardId?: string | null) {
      const index = this.cards.findIndex(card => card.id === cardId);
      if (index < 0) return;

      const [movedCard] = this.cards.splice(index, 1);
      movedCard.columnId = toColumnId;

      let targetIndex = -1;
      if (targetCardId) {
        targetIndex = this.cards.findIndex(card => card.id === targetCardId);
      }

      if (targetIndex < 0 || !targetCardId) {
        this.cards.push(movedCard);
      } else {
        this.cards.splice(targetIndex, 0, movedCard);
      }
      this._saveCardsToLocalStorage();
    },
  },
});
