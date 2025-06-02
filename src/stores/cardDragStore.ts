import { defineStore } from 'pinia'

export const useCardDragStore = defineStore('cardDragStore', {
  state: () => ({
    draggedCard: null as null | {
      cardId: string,
      cardTitle: string,
      cardDescription: string,
      fromColumnId: string,
    },
    hoverCardId: null as string | null,
    hoverColumnId: null as string | null,
  }),
  actions: {
    setDraggedCard (card: typeof this.draggedCard) {
      this.draggedCard = card
    },
    clearDraggedCard () {
      this.draggedCard = null
    },
    setHoverCardId (cardId: string | null) {
      this.hoverCardId = cardId
    },
    setHoverColumnId (columnId: string | null) {
      this.hoverColumnId = columnId
    },
  },
})
