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
  const showDeleteConfirmDialog = ref(false);
  const boardToDelete = ref<string | null>(null);

  onMounted(() => {
    boardStore.loadBoardKeysFromLocalStorage();
    selectedBoardKeyInput.value = boardStore.currentBoardKey;
  });

  watch(selectedBoardKeyInput, newKeyValueFromCombobox => {
    let keyToSelect: string | null = null;
    if (typeof newKeyValueFromCombobox === 'string') {
      keyToSelect = newKeyValueFromCombobox;
    } else if (newKeyValueFromCombobox && typeof newKeyValueFromCombobox === 'object' && 'value' in newKeyValueFromCombobox) {
      keyToSelect = (newKeyValueFromCombobox as any).value;
    } else if (newKeyValueFromCombobox === null) {
      keyToSelect = null;
    }
    if (keyToSelect !== boardStore.currentBoardKey) {
      boardStore.selectBoard(keyToSelect);
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

  function requestDeleteCurrentBoard () {
    if (boardStore.currentBoardKey) {
      boardToDelete.value = boardStore.currentBoardKey;
      showDeleteConfirmDialog.value = true;
    } else {
      console.warn('Intet board valgt til sletning.');
    }
  }

  function confirmDelete () {
    if (boardToDelete.value) {
      boardStore.deleteBoard(boardToDelete.value);
    }
    showDeleteConfirmDialog.value = false;
    boardToDelete.value = null;
  }

  function cancelDelete () {
    showDeleteConfirmDialog.value = false;
    boardToDelete.value = null;
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
            v-if="boardStore.currentBoardKey"
            class="ml-1"
            color="error"
            icon="mdi-delete-outline"
            title="Slet nuværende board"
            variant="text"
            @click="requestDeleteCurrentBoard"
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

  <v-dialog v-model="showDeleteConfirmDialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="headline">
        Bekræft Sletning
      </v-card-title>
      <v-card-text>
        Er du sikker på, du vil slette boardet "<strong>{{ boardToDelete }}</strong>"? <br>
        Denne handling kan ikke fortrydes.
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text @click="cancelDelete">
          Annuller
        </v-btn>
        <v-btn color="error darken-1" text @click="confirmDelete">
          Slet Board
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped lang="sass">

</style>
