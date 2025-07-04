import { useCardStore } from '@/stores/cardStore.ts';
import { useCardDragStore } from '@/stores/cardDragStore.ts';
import { useColumnDragStore } from '@/stores/columnDragStore.ts';

export function useCardDragAndDrop (
  type: 'card' | 'column',
  id: string,
  currentColumnId: string | null
) {
  const columnDragStore = useColumnDragStore();
  const cardDragStore = useCardDragStore();
  const cardStore = useCardStore();

  function onDragStart (
    e: DragEvent,
    cardValue: {
      id: string,
      title: string,
      description: string,
      columnId: string
    }) {

    columnDragStore.setHoverColumnId(null);
    columnDragStore.clearDraggedColumn();

    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    cardDragStore.clearDraggedCard();
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', cardValue.id);
      e.dataTransfer.effectAllowed = 'move';
    }

    cardDragStore.setDraggedCard({
      cardId: cardValue.id,
      cardTitle: cardValue.title,
      cardDescription: cardValue.description,
      fromColumnId: cardValue.columnId,
    })
  }

  function onDragOver (e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = 'move';
    if (type === 'column') {
      cardDragStore.setHoverColumnId(id);
      const storeHoverCardId = cardDragStore.hoverCardId;
      if (storeHoverCardId) {
        const hoveredCard = cardStore.cards.find(c => c.id === storeHoverCardId);
        if (!hoveredCard || hoveredCard.columnId !== id) {
          cardDragStore.setHoverCardId(null);
          cardDragStore.setHoverColumnId(null);
          columnDragStore.setHoverColumnId(null);
        }
      }
    } else if (type === 'card') {
      if (currentColumnId)
        cardDragStore.setHoverColumnId(currentColumnId);
      cardDragStore.setHoverCardId(id);
    }
  }

  function onDragLeave () {
    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    columnDragStore.setHoverColumnId(null);
  }

  function onDrop (e: DragEvent) {
    e.preventDefault()

    const draggedCard = cardDragStore.draggedCard;
    if (!draggedCard) return;

    if (type === 'card' && draggedCard.cardId !== id && currentColumnId !== null) {
      cardStore.moveCard(
        draggedCard.cardId,
        currentColumnId,
        id
      )
    } else if (type === 'column') {
      cardStore.moveCard(
        draggedCard.cardId,
        id,
        null
      )
    }

    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    columnDragStore.setHoverColumnId(null);
    cardDragStore.clearDraggedCard();
  }

  function onDragEnd () {
    setTimeout(() => {
      if (cardDragStore.draggedCard
        && cardDragStore.draggedCard.cardId === id
        && type === 'card') {
        cardDragStore.clearDraggedCard();
      }
      cardDragStore.setHoverCardId(null);
      cardDragStore.setHoverColumnId(null);
      columnDragStore.setHoverColumnId(null);
    }, 0)
  }

  function removeCards () {
    for (const card of cardStore.cardsByColumn(id))
      cardStore.removeCard(card.id);
  }


  return {
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
    removeCards,
    isHoveringColumn: computed(() => cardDragStore.hoverColumnId === id
      && type === 'column'),
    isHovering: computed(() => cardDragStore.hoverCardId === id
      && type === 'card'
      && cardDragStore.draggedCard?.cardId !== id),
    isDragging: computed(() => cardDragStore.draggedCard?.cardId === id
      && type === 'card'),
  }
}
