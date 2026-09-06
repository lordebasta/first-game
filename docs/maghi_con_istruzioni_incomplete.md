# Maghi con istruzioni incomplete

## Concept

Roguelite cooperativo nel quale ogni giocatore possiede parti diverse di un incantesimo: forma, elemento, traiettoria ed effetto. Combinandole durante la partita, il gruppo crea magie potenti ma potenzialmente catastrofiche.

Un giocatore potrebbe generare un vortice, un altro aggiungere fuoco e un terzo trasformarlo in una creatura temporanea. Nemici e stanze richiedono soluzioni sistemiche invece della sola quantita di danno.

## Sistema degli incantesimi

```text
forma + elemento + traiettoria + effetto
```

Esempi:

- sfera + fuoco + rimbalzo + esplosione;
- muro + ghiaccio + avanzamento + respinta;
- vortice + elettricita + inseguimento + catena;
- creatura + veleno + orbita + contagio.

Non tutte le combinazioni devono essere valide. Tag e regole di compatibilita mantengono gli effetti comprensibili e impediscono risultati inutilizzabili.

## Componente cooperativa

- i giocatori trovano componenti diversi e devono decidere come distribuirli;
- due magie possono reagire quando si incontrano;
- alcuni incantesimi richiedono che due giocatori li mantengano attivi insieme;
- gli effetti possono spostare gli alleati senza infliggere danno;
- una combinazione molto potente puo introdurre un effetto collaterale per la squadra.

## Punto forte

Lo spazio combinatorio puo generare molta varieta con pochi componenti e produce momenti comici direttamente dalle azioni dei giocatori.

## Rischio principale

Servono un'interfaccia eccellente e limiti rigorosi per rendere leggibili le combinazioni. Sincronizzare molti proiettili ed effetti interagenti rende inoltre il multiplayer piu difficile rispetto a un arena shooter tradizionale.

## Possibile prototipo

Per verificarne il potenziale bastano:

- una arena;
- due giocatori;
- tre forme;
- tre elementi;
- due traiettorie;
- quattro effetti finali;
- tre tipi di nemici;
- una reazione fra elementi, come acqua ed elettricita.

Il test deve verificare se costruire e combinare magie e divertente prima di aggiungere progressione, stanze procedurali o molti componenti.
