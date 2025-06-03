import { defineStore } from 'pinia';
import { useBoardStore } from '@/stores/boardStore.ts';

interface Column {
  id: string;
  title?: string;
}

interface ColumnStoreState {
  columns: Column[];
  nextId: number;
}

const getLocalStorageKey = (boardKey: string | null) => {
  if (!boardKey) return null;
  return `kanbanColumns_${boardKey}`;
};

export const useColumnStore = defineStore('columnStore', {
  state: (): ColumnStoreState => ({
    columns: [],
    nextId: 0,
  }),
  actions: {
    _saveColumnsToLocalStorage () {
      const boardStore = useBoardStore();
      const key = getLocalStorageKey(boardStore.currentBoardKey);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify({ columns: this.columns, nextId: this.nextId }));
        } catch (e) {
          console.error('Error saving columns to localStorage:', e);
        }
      }
    },
    loadColumnsFromLocalStorage () {
      const boardStore = useBoardStore();
      const key = getLocalStorageKey(boardStore.currentBoardKey);

      if (key) {
        const savedDataJson = localStorage.getItem(key);
        if (savedDataJson) {
          try {
            const savedData = JSON.parse(savedDataJson);
            if (savedData && Array.isArray(savedData.columns) && typeof savedData.nextId === 'number') {
              this.columns = savedData.columns;
              this.nextId = savedData.nextId;
            } else {
              this.columns = [];
              this.nextId = 0;
            }
          } catch (e) {
            console.error('Error parsing columns from localStorage:', e);
            this.columns = [];
            this.nextId = 0;
          }
          return;
        }
      }

      this.columns = [];
      this.nextId = 0;
    },
    addColumn (title: string = '') {
      const id = `col${this.nextId++}`;
      this.columns.push({ id, title });
      this._saveColumnsToLocalStorage();
    },
    removeColumn (columnId: string) {
      const index = this.columns.findIndex(column => column.id === columnId);
      if (index >= 0) {
        this.columns.splice(index, 1);
        this._saveColumnsToLocalStorage();
      }
    },
    updateColumn (updatedColumn: Column) {
      const index = this.columns.findIndex(column => column.id === updatedColumn.id);
      if (index >= 0) {
        this.columns[index] = { ...this.columns[index], ...updatedColumn };
        this._saveColumnsToLocalStorage();
      }
    },
    moveColumn (columnId: string, targetColumnId?: string | null) {
      const index = this.columns.findIndex(column => column.id === columnId);
      if (index < 0) return;

      const [movedColumn] = this.columns.splice(index, 1);
      let targetIndex = -1;

      if (targetColumnId) {
        targetIndex = this.columns.findIndex(column => column.id === targetColumnId);
      }

      if(targetColumnId && targetIndex === this.columns.length -1)
        this.columns.push(movedColumn);
      else if(targetIndex < 0 || !targetColumnId) this.columns.push(movedColumn);
      else this.columns.splice(targetIndex, 0, movedColumn);
      this._saveColumnsToLocalStorage();
    },
  },
});
