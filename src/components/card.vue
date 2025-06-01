<script setup lang="ts">
  import { reactive, watch } from 'vue'
  import { useDragStore } from '@/stores/dragStore.ts';
  import { useCardStore } from '@/stores/cardStore.ts';

  const dragStore = useDragStore();
  const cardStore = useCardStore();
  const prop = defineProps<{
    cardValue: { id: string, title: string, description: string, columnId: string }
  }>();
  const localCard = reactive({ ...prop.cardValue });

  watch(
    () => ({ ...localCard }),
    (newValue, oldValue): void => {
      if (newValue.title !== oldValue.title || newValue.description !== newValue.description) {
        cardStore.updateCard({
          id: localCard.id,
          title: localCard.title,
          description: localCard.description,
          columnId: localCard.columnId,
        })
      }
    }
  );

  function onDragStart (e: DragEvent) {
    if(e.dataTransfer) {
      e.dataTransfer.setData('text/plain', localCard.id);
      e.dataTransfer.effectAllowed = 'move';
    }

    dragStore.setDraggedCard({
      cardId: localCard.id,
      cardTitle: localCard.title,
      cardDescription: localCard.description,
      fromColumnId: localCard.columnId,
    })
  }

  function onDragOver (e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    if(dragStore.hoverCardId !== localCard.id) {
      dragStore.setHoverCardId(localCard.id);
    }
  }

  function onDragLeave () {
    if(dragStore.hoverCardId === localCard.id) {
      dragStore.setHoverCardId(null);
    }
  }

  function onDrop (e: DragEvent) {
    e.preventDefault();

    const draggedCardInfo = dragStore.draggedCard;

    if (draggedCardInfo && draggedCardInfo.cardId !== localCard.id) {
      cardStore.moveCard(
        draggedCardInfo.cardId,
        localCard.columnId,
        localCard.id
      );
    }

    dragStore.clearDraggedCard();
    dragStore.setHoverCardId(null);
  }

  function removeCard () {
    cardStore.removeCard(localCard.id);
  }
</script>

<template>
  <v-card
    :id="localCard.id"
    class="mx-auto"
    :class="{
      'dragging': dragStore.draggedCard?.cardId === localCard.id,
      'hovering': dragStore.hoverCardId === localCard.id
    }"
    draggable="true"
    elevation="5"
    width="97%"
    @dragleave="onDragLeave"
    @dragover="onDragOver"
    @dragstart="onDragStart"
    @drop="onDrop"
  >
    <v-container class="justify-center align-center">
      <v-row no-gutters>
        <v-col>
          <v-text-field
            v-model="localCard.title"
            class="mt-5"
            density="compact"
            label="title"
            variant="underlined"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            class="mt-7"
            color="error"
            icon
            size="extra-small"
            variant="text"
            @click="removeCard"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-textarea
            v-model="localCard.description"
            auto-grow
            label="Beskrivelse"
            variant="underlined"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<style scoped lang="sass">
.v-card
  transition: all 0.2s ease-in-out
  &.dragging
    opacity: 0.5
    border: 2px dashed #42b983
  &.hovering
    background-color: #e0f2f7
    border: 2px dashed #2196F3
</style>
