import { useColumnStore } from '@/stores/columnStore.ts';
import { useColumnDragStore } from '@/stores/columnDragStore.ts';

export function useColumnDragAndDrop (columnId: string, columnTitle: string) {
  const columnStore = useColumnStore();
  const dragstore = useColumnDragStore();

  function onDragStartColumn (e: DragEvent) {
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', columnId);
      e.dataTransfer.effectAllowed = 'move';
    }

    dragstore.setDraggedColumn({
      id: columnId,
      title: columnTitle,
    })
  }

  function onDragOverColumn (e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = 'move';

    if(!dragstore.hoverColumnId)
      dragstore.setHoverColumnId(columnId);
  }

  function onDragLeaveColumn () {
    if (dragstore.hoverColumnId === columnId)
      dragstore.setHoverColumnId(null);
  }

  function onDropColumn (e: DragEvent) {
    e.preventDefault()

    const draggedColumn = dragstore.draggedColumn;

    if (!draggedColumn) return;

    if(draggedColumn.id !== columnId)
      columnStore.moveColumn(columnId, columnTitle)

    dragstore.setHoverColumnId(null);
    dragstore.clearDraggedColumn();
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
