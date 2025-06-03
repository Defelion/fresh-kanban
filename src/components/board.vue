<script setup lang="ts">
  import Column from '@/components/column.vue'
  import { computed } from 'vue';
  import { useColumnStore } from '@/stores/columnStore.ts';
  import { useColumnDragStore } from '@/stores/columnDragStore.ts';

  const columnStore = useColumnStore();
  const columnDragStore = useColumnDragStore();

  const columns = computed(() => columnStore.columns)

  function addColumn () {
    columnStore.addColumn();
  }

  function handleBoardDragOver (e: DragEvent) {
    if(columnDragStore.draggedColumn) {
      e.preventDefault();
      if (e.dataTransfer)
        e.dataTransfer.dropEffect = 'move';

      if(columnDragStore.hoverColumnId !== null)
        columnDragStore.setHoverColumnId(null);
    }
  }

  function handleBoardDrop (e: DragEvent) {
    e.preventDefault();
    const draggedColumn = columnDragStore.draggedColumn;

    if(draggedColumn) {
      if(columnDragStore.hoverColumnId === null)
        columnStore.moveColumn(draggedColumn.id, null);
    }
  }
</script>

<template>
  <v-container
    fluid
    height="100%"
    width="100%"
    @dragover="handleBoardDragOver"
    @drop="handleBoardDrop"
  >
    <v-row v-if="columns.length > 0">
      <v-col
        v-for="(col) in columns"
        :key="col.id"
      >
        <column
          :column-value="{
            id: col.id,
            title: ''
          }"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn
          height="100%"
          value="addColumn"
          variant="tonal"
          @click="addColumn"
        >
          <v-icon size="x-large">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col>
        <v-btn
          height="100%"
          min-height="100px"
          value="addColumn"
          variant="tonal"
          width="100%"
          @click="addColumn"
        >
          <v-icon size="x-large">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="sass">

</style>
