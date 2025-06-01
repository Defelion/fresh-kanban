<script setup lang="ts">
  import { ref } from 'vue'
  import Card from '@/components/card.vue'
  import { useDragStore } from '@/stores/dragStore.ts';

  const dragStore = useDragStore();
  const prop = defineProps<{ columId: string }>()
  const emit = defineEmits<{
    (e: 'remove', id: string): void
    (e: 'card-dropped', payload: { card: never, targetColId: string }): void
  }>()
  const cards = ref([
    { id: 'ca1', title: '', description: '' },
  ])

  function addCard () {
    const nextId = `ca${cards.value.length + 1}`
    cards.value.push({ id: nextId, title: '', description: '' })
  }

  function updateCard (cardId: string, cardTitle: string, cardDescription: string) {
    for (const card of cards.value) {
      if (card.id === cardId) {
        card.title = cardTitle
        card.description = cardDescription
        break
      }
    }
  }

  function removeCard (cardId: string) {
    cards.value = cards.value.filter(card => card.id !== cardId)
  }

  function onDrop () {
    const draggedCard =dragStore.draggedCard
    if (!draggedCard) return
    if (draggedCard.fromColumnId !== prop.columId) {
      cards.value.push({
        id: draggedCard.cardId,
        title: draggedCard.cardTitle,
        description: draggedCard.cardDescription,
      })
    }

    dragStore.clearDraggedCard()
  }
  function removeColumn () {
    emit('remove', prop.columId)
  }
</script>

<template>
  <v-row no-gutters>
    <v-col>
      <v-text-field
        :id="columId"
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
          cardId: card.id,
          cardTitle: card.title,
          cardDescription: card.description,
          columId: prop.columId
        }"
        @drop="onDrop"
        @remove="removeCard"
        @update="updateCard"
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
</template>

<style scoped lang="sass">

</style>
