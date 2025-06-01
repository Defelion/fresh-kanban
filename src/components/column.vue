<script setup lang="ts">
  import Card from '@/components/card.vue'
  import { useDragStore } from '@/stores/dragStore.ts';
  import { useCardStore } from '@/stores/cardStore.ts';

  const dragStore = useDragStore();
  const cardStore = useCardStore();
  const prop = defineProps<{ columnId: string }>()
  const emit = defineEmits<{
    (e: 'remove', id: string): void
  }>()

  const cards = computed(() => cardStore.cardsByColumn(prop.columnId));

  function addCard () {
    cardStore.addCard(prop.columnId,'','');
  }

  function onDragOver (e: DragEvent) {
    e.preventDefault()
    if (e.dataTransfer)
      e.dataTransfer.dropEffect = 'move';

    if(!dragStore.hoverCardId)
      dragStore.setHoverCardId(prop.columnId);
  }

  function onDragLeave () {
    if (dragStore.hoverCardId === prop.columnId)
      dragStore.setHoverCardId(null);
  }

  function onDrop (e: DragEvent) {
    e.preventDefault()

    const draggedCard = dragStore.draggedCard;
    if (!draggedCard) return;

    dragStore.setHoverCardId(null);

    cardStore.moveCard(
      draggedCard.cardId,
      prop.columnId,
      null
    )

    dragStore.clearDraggedCard();
  }
  function removeColumn () {
    for (const card of cardStore.cardsByColumn(prop.columnId)) {
      cardStore.removeCard(card.id);
    }
    emit('remove', prop.columnId)
  }
</script>

<template>
  <v-card
    :class="{ 'hovering-column': dragStore.hoverCardId === `column-${prop.columnId}` }"
    variant="tonal"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <v-row
      class="ma-2"
      no-gutters
    >
      <v-col>
        <v-text-field
          :id="columnId"
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
          @click="removeColumn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row
      v-for="(card) in cards"
      :key="card.id"
    >
      <v-col>
        <card
          :card-value="{
            id: card.id,
            title: card.title,
            description: card.description,
            columnId: prop.columnId
          }"
          @drop="onDrop"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          height="100%"
          value="addCard"
          variant="tonal"
          width="100%"
          @click="addCard"
        >
          <v-icon size="x-large">mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<style scoped lang="sass">
.column
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out
.hovering-column
  background-color: #e0f2f7
  border: 2px dashed #2196F3
</style>
