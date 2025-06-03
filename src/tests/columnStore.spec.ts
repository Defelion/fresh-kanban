import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useColumnStore } from '@/stores/column/columnStore.ts'; // Juster stien efter din mappestruktur

describe('Column Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Actions', () => {
    describe('addColumn', () => {
      it('skal tilføje en ny kolonne til columns array og inkrementere nextId', () => {
        const columnStore = useColumnStore();
        expect(columnStore.columns.length).toBe(0);
        expect(columnStore.nextId).toBe(0);

        columnStore.addColumn();

        expect(columnStore.columns.length).toBe(1);
        expect(columnStore.nextId).toBe(1);
        expect(columnStore.columns[0].id).toBe('ca0'); // Baseret på `ca${this.nextId++}`

        columnStore.addColumn();
        expect(columnStore.columns.length).toBe(2);
        expect(columnStore.nextId).toBe(2);
        expect(columnStore.columns[1].id).toBe('ca1');
      });

      it('SKAL FEJLE HVIS addColumn VIRKER: Forventer at en kolonne IKKE tilføjes', () => {
        const columnStore = useColumnStore();
        const initialLength = columnStore.columns.length;
        const initialNextId = columnStore.nextId;

        columnStore.addColumn();

        expect(columnStore.columns.length).toBe(initialLength);
        expect(columnStore.nextId).toBe(initialNextId);
        expect(columnStore.columns.find(col => col.id === `ca${initialNextId}`)).toBeUndefined();
      });
    });

    describe('removeColumn', () => {
      it('skal fjerne en eksisterende kolonne fra columns array', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }];

        columnStore.removeColumn('ca0');
        expect(columnStore.columns.length).toBe(1);
        expect(columnStore.columns.find(col => col.id === 'ca0')).toBeUndefined();
        expect(columnStore.columns[0].id).toBe('ca1');

        columnStore.removeColumn('ca1');
        expect(columnStore.columns.length).toBe(0);
      });

      it('skal ikke ændre array eller fejle, hvis columnId ikke findes', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }];

        columnStore.removeColumn('nonExistentId');
        expect(columnStore.columns.length).toBe(1);
        expect(columnStore.columns[0].id).toBe('ca0');
      });

      it('SKAL FEJLE HVIS removeColumn VIRKER: Forventer at en kolonne IKKE fjernes', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }];
        const columnToRemoveId = 'ca0';
        const initialLength = columnStore.columns.length;

        columnStore.removeColumn(columnToRemoveId);

        expect(columnStore.columns.length).toBe(initialLength);
        expect(columnStore.columns.find(col => col.id === columnToRemoveId)).toBeDefined();
      });
    });

    describe('updateColumn', () => {
      it('skal erstatte en eksisterende kolonne med den opdaterede kolonne', () => {
        const columnStore = useColumnStore();
        const col0Original = { id: 'ca0' };
        const col0Updated = { id: 'ca0', title: 'Ny Titel' } as any;
        columnStore.columns = [col0Original, { id: 'ca1' }];

        columnStore.updateColumn(col0Updated);

        expect(columnStore.columns.length).toBe(2);
        const K_columnInStore = columnStore.columns.find(col => col.id === 'ca0');
        expect(K_columnInStore).toEqual(col0Updated); // Tjekker at hele objektet er erstattet
        expect((K_columnInStore as any).title).toBe('Ny Titel');
      });

      it('SKAL FEJLE HVIS updateColumn VIRKER: Forventer at en kolonne IKKE opdateres', () => {
        const columnStore = useColumnStore();
        const originalColumn = { id: 'ca0', title: 'Gammel Titel' } as any;
        columnStore.columns = [originalColumn];

        const attemptUpdateData = { id: 'ca0', title: 'Ny Titel' } as any;

        columnStore.updateColumn(attemptUpdateData);
        const columnAfterAttempt = columnStore.columns.find(col => col.id === 'ca0') as any;

        expect(columnAfterAttempt?.title).toBe('Gammel Titel');
      });
    });

    describe('moveColumn', () => {
      it('skal flytte en kolonne før en anden specificeret kolonne', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }, { id: 'ca2' }];
        columnStore.moveColumn('ca2', 'ca1');
        expect(columnStore.columns.map(col => col.id)).toEqual(['ca0', 'ca2', 'ca1']);
      });

      it('skal flytte en kolonne til slutningen, hvis targetColumnId er null', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }, { id: 'ca2' }];
        columnStore.moveColumn('ca0', null);
        expect(columnStore.columns.map(col => col.id)).toEqual(['ca1', 'ca2', 'ca0']);
      });

      it('skal flytte en kolonne til slutningen, hvis targetColumnId ikke findes', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }, { id: 'ca2' }];
        columnStore.moveColumn('ca0', 'nonExistent');
        expect(columnStore.columns.map(col => col.id)).toEqual(['ca1', 'ca2', 'ca0']);
      });

      it('skal ikke gøre noget, hvis columnId der skal flyttes ikke findes', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }, { id: 'ca2' }];
        const originalOrder = columnStore.columns.map(c => c.id);
        columnStore.moveColumn('nonExistent', 'ca1');
        expect(columnStore.columns.map(col => col.id)).toEqual(originalOrder);
      });

      it('SKAL FEJLE HVIS moveColumn VIRKER: Forventer at en kolonne IKKE flyttes korrekt', () => {
        const columnStore = useColumnStore();
        columnStore.columns = [{ id: 'ca0' }, { id: 'ca1' }, { id: 'ca2' }];
        const originalOrder = columnStore.columns.map(c => c.id);

        columnStore.moveColumn('ca2', 'ca1');

        expect(columnStore.columns.map(col => col.id)).toEqual(originalOrder);
      });
    });
  });
});
