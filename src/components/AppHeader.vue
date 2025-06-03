<script setup lang="ts">
  import { useTheme } from 'vuetify'
  import { useBoardStore } from '@/stores/boardStore';
  import { onMounted, ref, watch } from 'vue';

  const theme = useTheme()
  const boardStore = useBoardStore();

  const themeIcon = computed(() => {
    return theme.global.current.value.dark ? 'mdi-weather-night' : 'mdi-weather-sunny';
  });

  const themeButtonTitle = computed(() => {
    return theme.global.current.value.dark ? 'Skift til lyst tema' : 'Skift til mørkt tema';
  });

  const selectedBoardKeyInput = ref<string | null>(null);

  onMounted(() => {
    boardStore.loadBoardKeysFromLocalStorage();
    selectedBoardKeyInput.value = boardStore.currentBoardKey;
  });

  watch(selectedBoardKeyInput, newKey => {
    if (newKey !== boardStore.currentBoardKey) {
      boardStore.selectBoard(newKey);
    }
  });

  watch(() => boardStore.currentBoardKey, newStoreKey => {
    if (newStoreKey !== selectedBoardKeyInput.value) {
      selectedBoardKeyInput.value = newStoreKey;
    }
  });

  function toggleTheme () {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  }

  function handleCreateNewBoard () {
    boardStore.createNewBoard();
  }

</script>

<template>
  <v-app-bar>
    <v-container class="d-flex justify-center align-center">
      <v-row align="center" justify="center" no-gutters>
        <v-col cols="auto">
          <v-app-bar-title class="text-center">Fresh Kanban</v-app-bar-title>
        </v-col>
        <v-col class="px-md-4 px-2 d-flex justify-center">
          <v-combobox
            v-model="selectedBoardKeyInput"
            class="mx-4 mt-n1"
            clearable
            density="compact"
            hide-details
            item-title="title"
            item-value="value"
            :items="boardStore.comboBoxItems"
            label="Board Nummer"
            placeholder="Vælg eller opret board..."
            variant="underlined"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            class="mt-n1"
            icon="mdi-plus-box-outline"
            size="small"
            title="Nyt board"
            variant="text"
            @click="handleCreateNewBoard"
          />
        </v-col>
        <v-col cols="auto">
          <v-btn
            class="ml-1"
            :icon="themeIcon"
            :title="themeButtonTitle"
            variant="text"
            @click="toggleTheme"
          />
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<style scoped lang="sass">

</style>
