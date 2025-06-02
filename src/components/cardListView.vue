<script setup lang="ts">
  import { useCardStore } from '@/stores/cardStore.ts';

  const cardStore = useCardStore();
  const prop = defineProps<{
    columnId: string
  }>();
  const cards = computed(() => cardStore.cardsByColumn(prop.columnId));

  function addCard () {
    cardStore.addCard(prop.columnId, '', '');
  }

</script>

<template>
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
