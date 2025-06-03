import { defineStore } from 'pinia'

export const useColumnDragStore = defineStore('columnDragStore', {
  state: () => ({
    draggedColumn: null as null | {
      id: string,
      title: string,
    },
    hoverColumnId: null as string | null,
  }),
  actions: {
    setDraggedColumn (column: typeof this.draggedColumn) {
      this.draggedColumn = column
    },
    clearDraggedColumn () {
      this.draggedColumn = null
    },
    setHoverColumnId (id: string | null) {
      this.hoverColumnId = id
    },
  },
})
