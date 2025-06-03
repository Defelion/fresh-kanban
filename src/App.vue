<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { onMounted, watch } from 'vue';
  import { useBoardStore } from '@/stores/boardStore';
  import { useCardStore } from '@/stores/cardStore';
  import { useColumnStore } from '@/stores/columnStore';

  const boardStore = useBoardStore();
  const cardStore = useCardStore();
  const columnStore = useColumnStore();

  onMounted(() => {
    boardStore.loadBoardKeysFromLocalStorage();
    if (!boardStore.currentBoardKey && boardStore.knownBoardKeys.length > 0) {
      boardStore.selectBoard(boardStore.knownBoardKeys[0]);
    } else if (boardStore.knownBoardKeys.length === 0) {
      boardStore.createNewBoard();
    }
  });
  watch(() => boardStore.currentBoardKey, (newBoardKey, oldBoardKey) => {
    if (newBoardKey !== oldBoardKey || (newBoardKey && !oldBoardKey)) {
      cardStore.loadCardsFromLocalStorage();
      columnStore.loadColumnsFromLocalStorage();
    }
  }, { immediate: true });
</script>
