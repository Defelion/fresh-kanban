import { useColumnStore } from '@/stores/column/columnStore.ts';
import { useColumnDragStore } from '@/stores/column/columnDragStore.ts';
import { useCardDragStore } from '@/stores/card/cardDragStore.ts';

export function useColumnDragAndDrop (columnId: string, columnTitle: string) {
  const columnStore = useColumnStore();
  const columnDragStore = useColumnDragStore();
  const cardDragStore = useCardDragStore();

  function onDragStartColumn (e: DragEvent) {
    columnDragStore.setHoverColumnId(null);
    columnDragStore.clearDraggedColumn();
    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    cardDragStore.clearDraggedCard();
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', columnId);
      e.dataTransfer.effectAllowed = 'move';
    }

    columnDragStore.setDraggedColumn({
      id: columnId,
      title: columnTitle,
    })
  }

  function onDragOverColumn (e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = 'move';

    const currentDraggedColumnInStore = columnDragStore.draggedColumn;
    const composableColumnId = columnId;

    if (currentDraggedColumnInStore) {
    }

    if(columnDragStore.draggedColumn && columnDragStore.draggedColumn.id !== columnId)
      columnDragStore.setHoverColumnId(columnId);
  }

  function onDragLeaveColumn () {
    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    columnDragStore.setHoverColumnId(null);
  }

  function onDropColumn (e: DragEvent) {
    e.preventDefault()

    const draggedColumn = columnDragStore.draggedColumn;

    if (!draggedColumn) return;

    if(draggedColumn.id !== columnId)
      columnStore.moveColumn(draggedColumn.id, columnId)

    cardDragStore.setHoverCardId(null);
    cardDragStore.setHoverColumnId(null);
    columnDragStore.setHoverColumnId(null);
    columnDragStore.clearDraggedColumn();
  }

  function removeColumn (columnId: string) {
    columnStore.removeColumn(columnId);
  }

  return {
    onDragStartColumn,
    onDragOverColumn,
    onDragLeaveColumn,
    onDropColumn,
    removeColumn,
  }
}
