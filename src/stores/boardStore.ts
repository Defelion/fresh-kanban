import { defineStore } from 'pinia';

interface Board {
  key: string;
}

const LOCAL_STORAGE_KNOWN_KEYS = 'kanbanKnownBoardKeys';
const LOCAL_STORAGE_CURRENT_KEY = 'kanbanCurrentBoardKey';

export const useBoardStore = defineStore('boardStore', {
  state: () => ({
    knownBoardKeys: [] as string[],
    currentBoardKey: null as string | null,
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    comboBoxItems: (state) => state.knownBoardKeys.map(key => ({ title: key, value: key })),
  },
  actions: {
    loadBoardKeysFromLocalStorage() {
      const savedKeys = localStorage.getItem(LOCAL_STORAGE_KNOWN_KEYS);
      if (savedKeys) {
        try {
          this.knownBoardKeys = JSON.parse(savedKeys);
        } catch (e) {
          console.error('Fejl ved parsing af kendte board-nøgler fra localStorage:', e);
          this.knownBoardKeys = []; // Nulstil ved fejl
        }
      } else {
        this.knownBoardKeys = [];
      }
      const lastSelectedKey = localStorage.getItem(LOCAL_STORAGE_CURRENT_KEY);
      if (lastSelectedKey && this.knownBoardKeys.includes(lastSelectedKey)) {
        this.currentBoardKey = lastSelectedKey;
      } else if (this.knownBoardKeys.length > 0) {
        this.currentBoardKey = null;
      }
      console.log('[BoardStore] Kendte board-nøgler indlæst:', JSON.stringify(this.knownBoardKeys));
      console.log('[BoardStore] Aktuel board-nøgle sat til:', this.currentBoardKey);
    },

    _saveBoardKeysToLocalStorage() {
      localStorage.setItem(LOCAL_STORAGE_KNOWN_KEYS, JSON.stringify(this.knownBoardKeys));
      console.log('[BoardStore] Kendte board-nøgler gemt:', JSON.stringify(this.knownBoardKeys));
    },

    addBoardKey(key: string) {
      if (key && !this.knownBoardKeys.includes(key)) {
        this.knownBoardKeys.push(key);
        this._saveBoardKeysToLocalStorage();
        console.log(`[BoardStore] Board-nøgle '${key}' tilføjet til kendte nøgler.`);
      }
    },

    selectBoard(key: string | null) {
      if (key === this.currentBoardKey) return;

      this.currentBoardKey = key;
      localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, key || ''); // Gem null som tom streng
      console.log(`[BoardStore] selectBoard: currentBoardKey sat til '${key}'`);

      if (key) {
        this.addBoardKey(key);
        console.log(`[BoardStore] Board med nøgle '${key}' er valgt. (Indlæsning af data sker separat)`);
      } else {
        console.log(`[BoardStore] Intet board valgt.`);
      }
    },
    createNewBoard() {
      const newKey = `Board-${Date.now().toString().slice(-6)}`;
      console.log(`[BoardStore] Opretter nyt board med nøgle: ${newKey}`);
      this.selectBoard(newKey);
      return newKey;
    },
  },
});
