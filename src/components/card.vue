<script setup lang="ts">
  import { reactive, watch } from 'vue'
  import { useDragStore } from '@/stores/dragStore.ts';

  const dragStore = useDragStore();
  const prop = defineProps<{
    cardValue: { cardId: string, cardTitle: string, cardDescription: string, columId: string }
  }>()
  const emit = defineEmits<{
    (e: 'update', cardId: string, cardTitle: string, cardDescription: string): void
    (e: 'remove', cardId: string): void
  }>()
  const localCard = reactive({ ...prop.cardValue })

  function onDragStart () {
    dragStore.setDraggedCard({
      cardId: localCard.cardId,
      cardTitle: localCard.cardTitle,
      cardDescription: localCard.cardDescription,
      fromColumnId: localCard.columId,
    })
  }

  watch(
    () => ({ ...localCard }),
    () => {
      emit(
        'update',
        localCard.cardId,
        localCard.cardTitle,
        localCard.cardDescription,
      )
    }
  )

  function removeCard () {
    emit('remove', localCard.cardId)
  }
</script>

<template>
  <v-card
    :id="localCard.cardId"
    class="mx-auto"
    draggable="true"
    elevation="5"
    width="100%"
    @dragstart="onDragStart"
  >
    <v-container class="justify-center align-center">
      <v-row no-gutters>
        <v-col>
          <v-text-field
            v-model="localCard.cardTitle"
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
            v-model="localCard.cardDescription"
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
</style>
