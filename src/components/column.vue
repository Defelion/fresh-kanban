<script setup lang="ts">
  import { reactive, watch } from 'vue'
  import { useCardDragAndDrop } from '@/composables/useCardDragAndDrop.ts';
  import { useColumnDragAndDrop } from '@/composables/useColumnDragAndDrop.ts';
  import CardListView from '@/components/cardListView.vue';
  import { useColumnDragStore } from '@/stores/column/columnDragStore.ts';
  import { useCardDragStore } from '@/stores/card/cardDragStore.ts';
  import { useColumnStore } from '@/stores/column/columnStore.ts';

  const prop = defineProps<{
    columnValue: { id: string, title: string }
  }>();
  const columnDragStore = useColumnDragStore();
  const localColumnStore = useColumnStore();
  const cardDragStore = useCardDragStore();
  const localColumn = reactive({ ...prop.columnValue });
  const { onDragOver, onDragLeave, onDrop, removeCards, isHoveringColumn }
    = useCardDragAndDrop('column', prop.columnValue.id, null);
  const { onDropColumn, onDragLeaveColumn, onDragOverColumn, onDragStartColumn, removeColumn }
    = useColumnDragAndDrop(localColumn.id, localColumn.title)

  watch(
    () => ({ ...localColumn }),
    (newValue, oldValue) => {
      if (newValue.title !== oldValue.title)
        localColumnStore.updateColumn({ ...localColumn })
    }
  )

  function onDragOverCombined (e: DragEvent) {
    e.preventDefault()
    e.dataTransfer!.dropEffect = 'move';
    if(columnDragStore.draggedColumn)
      onDragOverColumn(e);
    else if (cardDragStore.draggedCard)
      onDragOver(e);
  }



  function onDropCombined (e: DragEvent) {
    e.preventDefault()
    if(columnDragStore.draggedColumn)
      onDropColumn(e);
    else if (cardDragStore.draggedCard)
      onDrop(e);
  }

  function onDragLeaveCombined () {
    if(columnDragStore.draggedColumn)
      onDragLeaveColumn();
    else if (cardDragStore.draggedCard)
      onDragLeave();
  }

  function removeLocalColumn () {
    removeCards();
    removeColumn(prop.columnValue.id);
  }
</script>

<template>
  <v-card
    :class="{ 'hovering-card-list': isHoveringColumn }"
    draggable="true"
    elevation="5"
    variant="tonal"
    @dragleave="onDragLeaveCombined"
    @dragover="onDragOverCombined"
    @dragstart.self="onDragStartColumn"
    @drop="onDropCombined"
  >
    <v-row
      class="ma-2"
      no-gutters
    >
      <v-col>
        <v-text-field
          :id="localColumn.id"
          class="mt-3"
          density="compact"
          label="Status Kolonne"
          variant="underlined"
        />
      </v-col>
      <v-col cols="auto">
        <v-btn
          class="mt-5"
          color="error"
          icon
          size="extra-small"
          variant="text"
          @click="removeLocalColumn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <card-list-view :column-id="prop.columnValue.id" />
  </v-card>
</template>

<style scoped lang="sass">
.column
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out
.hovering-column
  background-color: #e0f2f7
  border: 2px dashed #2196F3
</style>
