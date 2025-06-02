import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCardStore } from '@/stores/cardStore.ts';

describe('Card Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  describe('Actions', () => {
    describe('addCard', () => {
      it('skal tilføje et nyt kort til cards array og inkrementere nextId', () => {
        const cardStore = useCardStore();
        expect(cardStore.cards.length).toBe(0);
        expect(cardStore.nextId).toBe(0);

        cardStore.addCard('col1', 'Nyt Kort Titel', 'Nyt Kort Beskrivelse');

        expect(cardStore.cards.length).toBe(1);
        expect(cardStore.nextId).toBe(1);

        const newCard = cardStore.cards[0];
        expect(newCard.id).toBe('ca0');
        expect(newCard.title).toBe('Nyt Kort Titel');
        expect(newCard.description).toBe('Nyt Kort Beskrivelse');
        expect(newCard.columnId).toBe('col1');

        cardStore.addCard('col2', 'Andet Kort', '');
        expect(cardStore.cards.length).toBe(2);
        expect(cardStore.nextId).toBe(2);
        expect(cardStore.cards[1].id).toBe('ca1');
        expect(cardStore.cards[1].columnId).toBe('col2');
      });

      it('SKAL FEJLE HVIS addCard VIRKER: Forventer at et kort IKKE tilføjes', () => {
        const cardStore = useCardStore();
        const initialLength = cardStore.cards.length;

        cardStore.addCard('col1', 'Test Kort', 'Dette er en test');

        expect(cardStore.cards.length).toBe(initialLength);
        const newCard = cardStore.cards.find(c => c.title === 'Test Kort');
        expect(newCard).toBeUndefined();
      });
    });

    describe('removeCard', () => {
      it('skal fjerne et eksisterende kort fra cards array', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'ca0', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'ca1', title: 'Kort 2', description: '', columnId: 'colB' },
        ];

        cardStore.removeCard('ca0');

        expect(cardStore.cards.length).toBe(1);
        expect(cardStore.cards.find(card => card.id === 'ca0')).toBeUndefined();
        expect(cardStore.cards[0].id).toBe('ca1');

        cardStore.removeCard('ca1');
        expect(cardStore.cards.length).toBe(0);
      });

      it('skal ikke ændre array eller fejle, hvis cardId ikke findes', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'ca0', title: 'Kort 1', description: '', columnId: 'colA' },
        ];
        const originalLength = cardStore.cards.length;

        cardStore.removeCard('nonExistentId');

        expect(cardStore.cards.length).toBe(originalLength);
        expect(cardStore.cards[0].id).toBe('ca0');
      });

      it('SKAL FEJLE HVIS removeCard VIRKER: Forventer at et kort IKKE fjernes', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'ca0', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'ca1', title: 'Kort 2', description: '', columnId: 'colB' },
        ];
        const cardToRemoveId = 'ca0';
        const initialLength = cardStore.cards.length;

        cardStore.removeCard(cardToRemoveId);

        expect(cardStore.cards.length).toBe(initialLength);
        expect(cardStore.cards.find(card => card.id === cardToRemoveId)).toBeDefined();
      });
    });

    describe('updateCard', () => {
      it('skal opdatere egenskaberne for et eksisterende kort', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'ca0', title: 'Gammel Titel', description: 'Gammel Beskrivelse', columnId: 'colA' },
        ];
        const updatedData = {
          id: 'ca0',
          title: 'Ny Titel',
          description: 'Ny Beskrivelse',
          columnId: 'colB',
        };

        cardStore.updateCard(updatedData);

        expect(cardStore.cards.length).toBe(1);
        const updatedCard = cardStore.cards.find(card => card.id === 'ca0');
        expect(updatedCard).toBeDefined();
        expect(updatedCard?.title).toBe('Ny Titel');
        expect(updatedCard?.description).toBe('Ny Beskrivelse');
        expect(updatedCard?.columnId).toBe('colB');
      });

      it('skal ikke ændre array eller tilføje nyt kort, hvis updatedCard.id ikke findes', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'ca0', title: 'Eksisterende Kort', description: '', columnId: 'colA' },
        ];
        const originalCards = JSON.parse(JSON.stringify(cardStore.cards));

        const nonExistentUpdate = {
          id: 'nonExistentId',
          title: 'Ny Titel',
          description: 'Ny Beskrivelse',
          columnId: 'colC',
        };

        cardStore.updateCard(nonExistentUpdate);

        expect(cardStore.cards.length).toBe(originalCards.length);
        expect(cardStore.cards).toEqual(originalCards);
      });

      it('SKAL FEJLE HVIS updateCard VIRKER: Forventer at et kort IKKE opdateres', () => {
        const cardStore = useCardStore();
        const originalTitle = 'Gammel Titel';
        cardStore.cards = [
          { id: 'ca0', title: originalTitle, description: 'Gammel Beskrivelse', columnId: 'colA' },
        ];

        const updatedData = {
          id: 'ca0',
          title: 'Ny Titel', // Forsøger at ændre titlen
          description: 'Ny Beskrivelse',
          columnId: 'colB',
        };

        cardStore.updateCard(updatedData);
        const cardAfterUpdateAttempt = cardStore.cards.find(card => card.id === 'ca0');

        expect(cardAfterUpdateAttempt?.title).toBe(originalTitle);
      });
    });

    describe('moveCard', () => {
      it('skal flytte et kort til en ny tom kolonne', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: 'Test', columnId: 'colA' },
          { id: 'c2', title: 'Kort 2', description: 'Test', columnId: 'colB' },
        ];
        cardStore.nextId = 3;

        cardStore.moveCard('c1', 'colC', null);

        const movedCard = cardStore.cards.find(card => card.id === 'c1');
        expect(movedCard).toBeDefined();
        expect(movedCard?.columnId).toBe('colC');

        const cardsInColA = cardStore.cards.filter(c => c.columnId === 'colA');
        const cardsInColC = cardStore.cards.filter(c => c.columnId === 'colC');

        expect(cardsInColA.find(c => c.id === 'c1')).toBeUndefined();
        expect(cardsInColC.find(c => c.id === 'c1')).toBeDefined();

        expect(cardStore.cards.map(c => c.id)).toEqual(['c2', 'c1']);
      });

      it('skal flytte et kort inden for samme kolonne før et andet kort', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'c2', title: 'Kort 2', description: '', columnId: 'colA' },
          { id: 'c3', title: 'Kort 3', description: '', columnId: 'colA' },
        ];

        cardStore.moveCard('c3', 'colA', 'c1');

        const movedCard = cardStore.cards.find(card => card.id === 'c3');
        expect(movedCard?.columnId).toBe('colA');
        expect(cardStore.cards.map(c => c.id)).toEqual(['c3', 'c1', 'c2']);
      });

      it('skal flytte et kort til en anden befolket kolonne før et specifikt kort', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'c2', title: 'Kort 2', description: '', columnId: 'colB' },
          { id: 'c3', title: 'Kort 3', description: '', columnId: 'colB' },
        ];

        cardStore.moveCard('c1', 'colB', 'c3');

        const movedCard = cardStore.cards.find(card => card.id === 'c1');
        expect(movedCard?.columnId).toBe('colB');

        expect(cardStore.cards.map(c => c.id)).toEqual(['c2', 'c1', 'c3']);

        const cardsInColB = cardStore.cards.filter(c => c.columnId === 'colB').map(c => c.id);
        expect(cardsInColB).toEqual(['c2', 'c1', 'c3']); // Eller den rækkefølge din `cardsByColumn` ville give
      });

      it('SKAL FEJLE HVIS moveCard VIRKER: Forventer at et kort IKKE flyttes korrekt', () => {
        const cardStore = useCardStore();
        // Opsætning
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'c2', title: 'Kort 2', description: '', columnId: 'colA' },
          { id: 'c3', title: 'Kort 3', description: '', columnId: 'colB' },
        ];
        const cardToMoveId = 'c1';
        const targetColumnId = 'colB';
        const targetCardIdForOrdering = 'c3';

        const originalColumnIdOfC1 = cardStore.cards.find(c => c.id === cardToMoveId)?.columnId;

        cardStore.moveCard(cardToMoveId, targetColumnId, targetCardIdForOrdering);

        const cardAfterMoveAttempt = cardStore.cards.find(c => c.id === cardToMoveId);

        expect(cardAfterMoveAttempt?.columnId).toBe(originalColumnIdOfC1);

        const idsInOrder = cardStore.cards.map(c => c.id);

        expect(idsInOrder).toEqual(['c1', 'c2', 'c3']); // Vil fejle, hvis c1 er flyttet.
      });

      it('SKAL FEJLE HVIS moveCard VIRKER: Forventer at et kort flyttet til slutningen af en ny kolonne IKKE har den nye columnId', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: '', columnId: 'colA' },
          { id: 'c2', title: 'Kort 2', description: '', columnId: 'colB' },
        ];
        const cardToMoveId = 'c1';
        const targetColumnId = 'colB';
        const originalColumnIdOfC1 = 'colA';

        cardStore.moveCard(cardToMoveId, targetColumnId, null);

        const cardAfterMoveAttempt = cardStore.cards.find(c => c.id === cardToMoveId);

        expect(cardAfterMoveAttempt?.columnId).toBe(originalColumnIdOfC1);
      });
    });
  });

  describe('Getters', () => {
    describe('cardsByColumn', () => {
      it('skal returnere et tomt array, hvis ingen kort findes for et givet columnId', () => {
        const cardStore = useCardStore();
        cardStore.cards = [
          { id: 'c1', title: 'Kort 1', description: '', columnId: 'colA' },
        ];
        expect(cardStore.cardsByColumn('colB')).toEqual([]);
        expect(cardStore.cardsByColumn('nonExistentColumn')).toEqual([]);
      });

      it('skal kun returnere kort, der tilhører det specificerede columnId', () => {
        const cardStore = useCardStore();
        const cardA1 = { id: 'c1', title: 'Kort A1', description: '', columnId: 'colA' };
        const cardB1 = { id: 'c2', title: 'Kort B1', description: '', columnId: 'colB' };
        const cardA2 = { id: 'c3', title: 'Kort A2', description: '', columnId: 'colA' };
        cardStore.cards = [cardA1, cardB1, cardA2];

        const cardsInColA = cardStore.cardsByColumn('colA');
        expect(cardsInColA.length).toBe(2);
        expect(cardsInColA).toContainEqual(cardA1);
        expect(cardsInColA).toContainEqual(cardA2);
        expect(cardsInColA).not.toContainEqual(cardB1);

        const cardsInColB = cardStore.cardsByColumn('colB');
        expect(cardsInColB.length).toBe(1);
        expect(cardsInColB).toContainEqual(cardB1);
      });

      it('skal returnere et tomt array, hvis storen er tom', () => {
        const cardStore = useCardStore();
        expect(cardStore.cardsByColumn('colA')).toEqual([]);
      });
    });

    describe('cardsByColumn', () => {
      it('SKAL FEJLE HVIS cardsByColumn VIRKER: Forventer at modtage kort fra en forkert kolonne', () => {
        const cardStore = useCardStore();
        const cardA1 = { id: 'c1', title: 'Kort A1', description: '', columnId: 'colA' };
        const cardB1 = { id: 'c2', title: 'Kort B1', description: '', columnId: 'colB' };
        cardStore.cards = [cardA1, cardB1];

        const cardsFromColA = cardStore.cardsByColumn('colA');

        expect(cardsFromColA).toContainEqual(cardB1);
      });

      it('SKAL FEJLE HVIS cardsByColumn VIRKER: Forventer IKKE at modtage et kort, der ER i kolonnen', () => {
        const cardStore = useCardStore();
        const cardA1 = { id: 'c1', title: 'Kort A1', description: '', columnId: 'colA' };
        cardStore.cards = [cardA1];

        const cardsFromColA = cardStore.cardsByColumn('colA');

        expect(cardsFromColA).not.toContainEqual(cardA1);
      });
    });
  });
});
