import { defineStore } from 'pinia';
import {useCardDragStore} from "@/stores/cardDragStore.ts";

interface Card {
  id: string;
  title: string;
  description: string;
  columnId: string;
}

export const useCardStore = defineStore('cardStore', {
  state: () => ({
    cards: [] as Card[],
    nextId: 0,
  }),
  getters: {
    cardsByColumn (state) {
      return (columnId: string) => state.cards.filter(card => card.columnId === columnId);
    },
  },
  actions: {
    addCard (columnId: string, title: string, description: string) {
      const id = `ca${this.nextId++}`;
      this.cards.push({ id, title, description, columnId });
    },
    removeCard (cardId: string) {
      const index = this.cards.findIndex(card => card.id === cardId);
      if (index >= 0) this.cards.splice(index, 1);
    },
    updateCard (updatedCard: Card) {
      const index = this.cards.findIndex(card => card.id === updatedCard.id);
      if (index >= 0) this.cards[index] = { ...updatedCard };
    },
    moveCard (cardId: string, toColumnId: string, targetCardId?: string | null) {
      const index = this.cards.findIndex(card => card.id === cardId);

      const cardDragStoreInstance = useCardDragStore(); // Hent instans for at tilgå draggedCard
      const draggedCardDetails = cardDragStoreInstance.draggedCard;

      console.log(
        '[cardStore.moveCard] STARTER. Flytter kort:', cardId,
        'Til kolonne:', toColumnId,
        'Bestil før kort:', targetCardId,
        'Kortets oprindelige kolonne var:', draggedCardDetails ? draggedCardDetails.fromColumnId : 'IKKE TILGÆNGELIG'
      );

      if (index < 0) return;

      const [movedCard] = this.cards.splice(index, 1);

      movedCard.columnId = toColumnId;

      let targetIndex = -1;

      if(targetCardId)
        targetIndex = this.cards.findIndex(card => card.id === targetCardId);

      if(targetIndex < 0 || !targetCardId) this.cards.push(movedCard);
      else this.cards.splice(targetIndex, 0, movedCard);
    },
  },
})
