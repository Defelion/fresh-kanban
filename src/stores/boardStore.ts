import { defineStore } from 'pinia';

interface Board {
  key: string;
}

const LOCAL_STORAGE_KNOWN_KEYS = 'kanbanKnownBoardKeys';
const LOCAL_STORAGE_CURRENT_KEY = 'kanbanCurrentBoardKey';

const getCardsLocalStorageKey = (boardKey: string) => `kanbanCards_${boardKey}`;
const getColumnsLocalStorageKey = (boardKey: string) => `kanbanColumns_${boardKey}`;


export const useBoardStore = defineStore('boardStore', {
  state: () => ({
    knownBoardKeys: [] as string[],
    currentBoardKey: null as string | null,
    isLoading: false,
    error: null as string | null,
  }),
  getters: {
    comboBoxItems: state => state.knownBoardKeys.map(key => ({ title: key, value: key })),
  },
  actions: {
    loadBoardKeysFromLocalStorage () {
      const savedKeysJson = localStorage.getItem(LOCAL_STORAGE_KNOWN_KEYS);
      if (savedKeysJson) {
        try {
          const parsedKeys = JSON.parse(savedKeysJson);
          if (Array.isArray(parsedKeys) && parsedKeys.every(k => typeof k === 'string')) {
            this.knownBoardKeys = parsedKeys;
          } else {
            this.knownBoardKeys = [];
          }
        } catch (e) {
          this.knownBoardKeys = [];
        }
      } else {
        this.knownBoardKeys = [];
      }
      const lastActiveKey = localStorage.getItem(LOCAL_STORAGE_CURRENT_KEY);
      if (lastActiveKey && this.knownBoardKeys.includes(lastActiveKey)) {
        this.currentBoardKey = lastActiveKey;
      } else if (this.knownBoardKeys.length > 0) {
        this.currentBoardKey = this.knownBoardKeys[0];
      } else {
        this.currentBoardKey = null;
      }
    },
    _saveBoardKeysToLocalStorage () {
      localStorage.setItem(LOCAL_STORAGE_KNOWN_KEYS, JSON.stringify(this.knownBoardKeys));
    },
    addBoardKey (keyInput: string | { title: string, value: string } | null) {
      let keyToAdd: string | null = null;
      if (typeof keyInput === 'string' && keyInput.trim() !== '') {
        keyToAdd = keyInput.trim();
      } else if (keyInput && typeof keyInput === 'object' && typeof (keyInput as any).value === 'string') {
        keyToAdd = (keyInput as any).value.trim();
      }

      if (keyToAdd && !this.knownBoardKeys.includes(keyToAdd)) {
        this.knownBoardKeys.push(keyToAdd);
        this._saveBoardKeysToLocalStorage();
      }
    },
    selectBoard (keyInput: string | { title: string, value: string } | null) {
      let actualKey: string | null = null;
      if (typeof keyInput === 'string' && keyInput.trim() !== '') {
        actualKey = keyInput.trim();
      } else if (keyInput && typeof keyInput === 'object' && typeof (keyInput as any).value === 'string') {
        actualKey = (keyInput as any).value.trim();
      }

      if (actualKey === this.currentBoardKey && this.currentBoardKey !== null) { // Undgå unødig re-selection, medmindre det er for at initialisere
        return;
      }

      this.currentBoardKey = actualKey;
      localStorage.setItem(LOCAL_STORAGE_CURRENT_KEY, actualKey || '');

      if (actualKey) {
        this.addBoardKey(actualKey);
      }
    },
    createNewBoard () {
      const newKey = `Board-${Date.now().toString().slice(-6)}`;
      this.addBoardKey(newKey);
      this.selectBoard(newKey);
      return newKey;
    },
    deleteBoard (keyToDelete: string) {
      const index = this.knownBoardKeys.indexOf(keyToDelete);
      if (index > -1) {
        this.knownBoardKeys.splice(index, 1);
        this._saveBoardKeysToLocalStorage();

        localStorage.removeItem(`kanbanBoard_${keyToDelete}`);
        localStorage.removeItem(getCardsLocalStorageKey(keyToDelete));
        localStorage.removeItem(getColumnsLocalStorageKey(keyToDelete));

        if (this.currentBoardKey === keyToDelete) {
          const newCurrentKey = this.knownBoardKeys.length > 0 ? this.knownBoardKeys[0] : null;
          this.selectBoard(newCurrentKey);
        }
        return true;
      }
      return false;
    },
  },
});
