import { defineStore } from 'pinia';

interface Column {
  id: string;
}

export const useColumnStore = defineStore('coloumnStore', {
  state: () => ({
    columns: [] as Column[],
    nextId: 0,
  }),
  actions: {
    addColumn () {
      const id = `ca${this.nextId++}`;
      this.columns.push({ id });
    },
    removeColumn (columnId: string) {
      const index = this.columns.findIndex(column => column.id === columnId);
      if (index >= 0) this.columns.splice(index, 1);
    },
    updateColumn (updatedColumn: Column) {
      const index = this.columns.findIndex(column => column.id === updatedColumn.id);
      if (index >= 0) this.columns[index] = { ...updatedColumn };
    },
    moveColumn (columnId: string, targetColumnId?: string | null) {
      const index = this.columns.findIndex(column => column.id === columnId);
      let targetIndex = -1;

      if (index < 0) return;

      const [movedColumn] = this.columns.splice(index, 1);

      if(targetColumnId)
        targetIndex = this.columns.findIndex(column => column.id === targetColumnId);

      if(targetColumnId && targetIndex === this.columns.length -1)
        this.columns.push(movedColumn);
      else if(targetIndex < 0 || !targetColumnId) this.columns.push(movedColumn);
      else this.columns.splice(targetIndex, 0, movedColumn);
    },
  },
})
