import { defineStore } from 'pinia';
import { supabase } from '@/plugins/supabase';
import { useBoardStore } from '@/stores/board/boardStore';
import { useColumnStore } from '@/stores/column/columnStore.ts';
import { useCardStore } from '@/stores/card/cardStore.ts';
import { useCardDBStore } from '@/stores/card/cardDBStore.ts';
import { useColumnDBStore } from '@/stores/column/coloumnDBStore.ts';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'; // Importer nødvendige typer

export interface BoardRecord {
  key: string;
  creationDate: string;
  nextColumnId: number;
  nextCardId: number;
}

export const useBoardDBStore = defineStore('boardDBStore', {
  state: () => ({
    isLoading: false,
    error: null as string | null,
    currentBoardDBData: null as BoardRecord | null,
  }),

  actions: {
    clearCurrentBoardData () {
      this.currentBoardDBData = null;
      const columnStore = useColumnStore();
      const cardStore = useCardStore();
      columnStore.nextId = 0;
      cardStore.nextId = 0;
      console.log('[boardDBStore] Lokal board data og UI-tællere ryddet.');
    },

    async fetchBoardRecordByKey (boardKey: string): Promise<BoardRecord | null> {
      if (!boardKey || boardKey.trim() === '') {
        this.clearCurrentBoardData();
        return null;
      }
      console.log(`[boardDBStore] fetchBoardRecordByKey: Søger efter board med key '${boardKey}'`);
      this.isLoading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from('boards')
          .select('key, name, creationDate, nextColumnId, nextCardId')
          .eq('key', boardKey)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (!data) {
          console.log(`[boardDBStore] Intet board fundet med key: '${boardKey}'.`);
          this.clearCurrentBoardData();
          return null;
        }

        this.currentBoardDBData = data as BoardRecord;
        console.log('[boardDBStore] Board data hentet fra DB:', JSON.stringify(this.currentBoardDBData));

        const columnStore = useColumnStore();
        const cardStore = useCardStore();
        columnStore.nextId = this.currentBoardDBData.nextColumnId;
        cardStore.nextId = this.currentBoardDBData.nextCardId;

        console.log(`[boardDBStore] nextId for columnStore sat til: ${columnStore.nextId}`);
        console.log(`[boardDBStore] nextId for cardStore sat til: ${cardStore.nextId}`);

        return this.currentBoardDBData;

      } catch (error: any) {
        console.error('[boardDBStore fetchBoardRecordByKey] Fejl:', error.message);
        this.error = error.message;
        this.clearCurrentBoardData();
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createBoardRecordInDB (boardKey: string, boardName?: string): Promise<BoardRecord | null> {
      console.log(`[boardDBStore] createBoardRecordInDB: Opretter board med key '${boardKey}'`);
      this.isLoading = true;
      this.error = null;

      const existingBoard = await this.fetchBoardRecordByKey(boardKey);
      if (existingBoard) {
        this.isLoading = false;
        const message = `[boardDBStore] Et board med nøglen '${boardKey}' eksisterer allerede. Indlæser eksisterende.`;
        console.warn(message);
        return existingBoard;
      }
      this.error = null;
      this.isLoading = true;


      try {
        const newBoardEntry = {
          key: boardKey,
          name: boardName || `Board ${boardKey}`,
          nextColumnId: 0,
          nextCardId: 0,
        };

        const { data, error: insertError } = await supabase
          .from('boards')
          .insert(newBoardEntry)
          .select('key, name, creationDate, nextColumnId, nextCardId')
          .single();

        if (insertError) {
          throw insertError;
        }
        if (!data) {
          throw new Error('Board blev oprettet, men data kunne ikke hentes tilbage.');
        }

        this.currentBoardDBData = data as BoardRecord;
        console.log('[boardDBStore] Nyt board oprettet i DB:', JSON.stringify(this.currentBoardDBData));

        const columnStore = useColumnStore();
        const cardStore = useCardStore();
        columnStore.nextId = 0;
        cardStore.nextId = 0;

        return this.currentBoardDBData;

      } catch (error: any) {
        console.error('[boardDBStore createBoardRecordInDB] Fejl:', error.message);
        this.error = error.message;
        this.clearCurrentBoardData();
        return null;
      } finally {
        this.isLoading = false;
      }
    },
    async updateBoardCountersInDB () {
      if (!this.currentBoardDBData || !this.currentBoardDBData.key) {
        console.warn('[boardDBStore updateBoardCountersInDB] Intet currentBoardDBData.key at opdatere tællere for.');
        return false;
      }

      const columnStore = useColumnStore();
      const cardStore = useCardStore();

      if (this.currentBoardDBData.nextColumnId === columnStore.nextId &&
        this.currentBoardDBData.nextCardId === cardStore.nextId) {
        return true;
      }

      console.log(`[boardDBStore updateBoardCountersInDB] Opdaterer DB tællere for board key ${this.currentBoardDBData.key}. Ny kolonne-tæller: ${columnStore.nextId}, Ny kort-tæller: ${cardStore.nextId}`);
      this.isLoading = true;

      const { error } = await supabase
        .from('boards')
        .update({
          nextColumnId: columnStore.nextId,
          nextCardId: cardStore.nextId,
        })
        .eq('key', this.currentBoardDBData.key);

      this.isLoading = false;
      if (error) {
        console.error('[boardDBStore updateBoardCountersInDB] Fejl ved opdatering af tællere:', error.message);
        this.error = error.message;
        return false;
      } else {
        console.log('[boardDBStore updateBoardCountersInDB] Tællere opdateret i DB.');
        if (this.currentBoardDBData) {
          this.currentBoardDBData.nextColumnId = columnStore.nextId;
          this.currentBoardDBData.nextCardId = cardStore.nextId;
        }
        return true;
      }
    },
    async ensureBoardExistsInDB (boardKey: string): Promise<BoardRecord | null> {
      if (!boardKey || boardKey.trim() === '') {
        this.clearCurrentBoardData();
        return null;
      }
      console.log(`[boardDBStore ensureBoardExistsInDB] Sikrer board med key: '${boardKey}'`);
      let boardData = await this.fetchBoardRecordByKey(boardKey);

      if (!boardData) {
        console.log(`[boardDBStore ensureBoardExistsInDB] Board '${boardKey}' ikke fundet i DB, forsøger at oprette...`);
        boardData = await this.createBoardRecordInDB(boardKey, `Board ${boardKey}`);
      }

      if (boardData) {
        const columnDBStore = useColumnDBStore();
        const cardDBStore = useCardDBStore();

        await columnDBStore.fetchColumnsForBoard(boardData.id);
        await cardDBStore.fetchCardsForBoard(boardData.id);
        this.subscribeToBoardUpdates(boardData.id);
      } else {
        console.error(`[boardDBStore ensureBoardExistsInDB] Kunne hverken hente eller oprette board med key: '${boardKey}'`);
        this.clearCurrentBoardData();
      }
      return boardData;
    },
  },
});
