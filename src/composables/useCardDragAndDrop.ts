import { useCardStore } from '@/stores/cardStore.ts';
import { useCardDragStore } from '@/stores/cardDragStore.ts';


export function useCardDragAndDrop (
  type: 'card' | 'column',
  id: string,
  currentColumnId?: string
) {
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
    if(e.dataTransfer) {
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

    if(!cardDragStore.hoverColumnId && type === 'column')
      cardDragStore.setHoverColumnId(id);
    else if (cardDragStore.hoverColumnId && type === 'card')
      cardDragStore.setHoverCardId(id)
  }

  function onDragLeave () {
    if (type === 'card' && cardDragStore.hoverCardId === id) {
      cardDragStore.setHoverCardId(null);
    } else if (type === 'column' && cardDragStore.hoverColumnId === id) {
      cardDragStore.setHoverColumnId(null);
    }
  }

  function onDrop (e: DragEvent) {
    e.preventDefault()

    const draggedCard = cardDragStore.draggedCard;
    if (!draggedCard) return;

    if (type === 'card' && draggedCard.cardId !== id) {
      cardStore.moveCard(
        draggedCard.cardId,
        currentColumnId || draggedCard.fromColumnId,
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
    cardDragStore.setHoverColumnId(null)
    cardDragStore.clearDraggedCard();
  }

  function removeCards () {
    for (const card of cardStore.cardsByColumn(id))
      cardStore.removeCard(card.id);
  }

  function addCard () {
    cardStore.addCard(id,'','');
  }

  return {
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    addCard,
    removeCards,
    isHoveringColumn: computed(() => cardDragStore.hoverColumnId === id),
    isHovering: computed(() => cardDragStore.hoverCardId === id && type === 'column'),
    isDragging: computed(() => cardDragStore.hoverCardId === id && type === 'card'),
  }
}
