# Space Invaders: Last Outpost

Nome di lavoro per un arcade endless ispirato alla struttura di Space Invaders. Prima di una pubblicazione pubblica dovra avere un titolo originale.

## Obiettivo

Difendere un ultimo avamposto da un'invasione aliena sempre piu intensa e ottenere il punteggio piu alto possibile in classifica.

Non esiste una partita da completare: la run termina quando il nucleo dell'avamposto viene distrutto. Ogni scelta serve a restare vivi piu a lungo, aumentare il moltiplicatore o ottenere punti rischiando la base.

## Principi

- controlli leggibili in pochi secondi;
- run da 3 minuti in poi, potenzialmente senza limite;
- difficolta che cresce senza produrre muri improvvisi;
- punteggio basato su abilita, rischio e gestione dell'avamposto;
- nessuna metaprogressione necessaria per competere in classifica;
- una singola schermata e grafica 2D minimale;
- prima versione single player, con eventuale modalita couch co-op successiva.

## Fantasia del giocatore

Sono l'ultimo pilota rimasto a proteggere una colonia sotto assedio. Devo abbattere gli alieni, mantenere in vita le strutture e decidere quali parti della base sacrificare quando non riesco piu a difendere tutto.

## Loop della run

```text
Arriva una formazione di invasori
        ↓
Muoviti, spara, fai punti e conserva la combo
        ↓
Gli invasori scendono verso l'avamposto
        ↓
Elimina la formazione
        ↓
Ogni tre ondate: pausa, riparazione e scelta struttura
        ↓
La formazione torna e scende piu velocemente
        ↓
Il nucleo cade: calcolo del punteggio e leaderboard
```

Ogni tre ondate c'e una pausa breve. Le strutture danneggiate ma non distrutte recuperano un punto integrita. Il giocatore puo sempre riempire uno slot vuoto con un muro base oppure scegliere una fra tre strutture casuali e piazzarla in uno slot libero o al posto di una struttura esistente. Non c'e un negozio o una fase di costruzione lenta.

## Campo di gioco

```text
┌─────────────────────────────────────────────┐
│           formazioni di invasori              │
│                                             │
│             proiettili nemici                 │
│                                             │
│                 giocatore                    │
│                                             │
│ [ slot ] [ slot ] [ slot ] [ slot ]         │
│                   nucleo                     │
└─────────────────────────────────────────────┘
```

Il giocatore si muove orizzontalmente fra la formazione e le strutture e spara verso l'alto. Nella prima versione non ha una barra della vita: l'obiettivo e impedire agli invasori di raggiungere l'avamposto. Un invasore che supera la riga del giocatore continua a scendere verso le strutture.

Il nucleo ha **una sola vita**. Se un invasore supera uno slot vuoto o una struttura distrutta e raggiunge il nucleo, la run termina immediatamente.

## Strutture

L'avamposto ha una fila di **quattro slot**. Ogni struttura ha due punti integrita: il primo invasore che la raggiunge la danneggia e viene distrutto; il secondo la distrugge e lascia lo slot vuoto. Durante una pausa, una struttura danneggiata recupera il danno; una struttura distrutta non torna automaticamente.

- **Muro:** struttura base sempre disponibile; riempie uno slot vuoto e assorbe due invasori senza altri effetti.
- **Centrale** *(comune)*: aumenta velocita di movimento e cadenza di fuoco finche resta integra.
- **Scudo** *(rara)*: intercetta senza danni il primo invasore che raggiunge lo slot; poi si ricarica dopo alcune ondate se resta integro.
- **Fabbrica droni** *(rara)*: crea periodicamente un piccolo drone che si muove e spara all'invasore piu in basso.
- **Torretta** *(comune)*: spara verso l'alto, davanti al proprio slot.
- **Radar:** aumenta i punti degli invasori marcati e marca comandante e bombardiere, rendendoli piu vulnerabili.
- **Deposito munizioni:** ogni quinto attacco del giocatore diventa ad area.

La scelta e sempre locale e rapida: riempire uno slot con un muro, aggiungere una struttura utile o sacrificare una struttura esistente per sostituirla.

## Nemici

Il gioco inizia con un solo invasore base. La difficolta cresce aumentando gradualmente soltanto la sua velocita di discesa: il comportamento resta chiaro e il giocatore impara a proteggere i quattro slot.

- **Invasore base:** scende verso la base; piu a lungo dura la run, piu rapidamente scende. Quando raggiunge una struttura, la danneggia e viene distrutto.
- **Comandante:** appare ogni alcune ondate e aumenta temporaneamente la velocita di discesa della formazione finche resta vivo.
- **Bombardiere:** appare ogni alcune ondate e, a intervalli, lancia una bomba che scende lentamente in linea retta verso la base. Il giocatore deve colpirla prima che raggiunga le strutture.

Quando una bomba viene colpita, esplode e danneggia gli invasori adiacenti. Spararle e quindi sia una difesa urgente sia un'occasione per ottenere punti e mantenere la combo.

Per la prima versione non servono altri nemici o mini-boss. Comandante e bombardiere entrano soltanto quando il ritmo dell'invasore base e gia divertente.

## Punteggio e leaderboard

Il punteggio deve favorire gioco aggressivo ma non sconsiderato.

```text
punti base dei nemici
× moltiplicatore combo
+ bonus ondata
+ bonus strutture sopravvissute
+ bonus rischio
```

### Combo

La combo aumenta eliminando invasori in successione. Decresce lentamente se il giocatore non colpisce nessuno e si azzera quando una struttura viene distrutta.

Questo costringe a bilanciare due priorita: continuare a sparare per mantenere il moltiplicatore o concentrarsi sugli invasori che stanno per raggiungere l'avamposto.

### Bonus rischio

Durante le pause il giocatore puo scegliere anche un modificatore facoltativo. Ogni modificatore aumenta sia difficolta sia potenziale punteggio:

- gli alieni scendono piu velocemente, ma valgono piu punti;
- gli scudi ricevono meno carica, ma la combo cresce prima;
- arrivano piu bombardieri, ma ogni struttura sopravvissuta vale di piu;
- il giocatore ha meno tempo per colpire una bomba, ma ottiene un moltiplicatore globale;
- un settore della base resta senza difese, ma genera materiali extra.

I modificatori devono essere identici per tutti in una sfida giornaliera o settimanale, cosi la classifica rimane confrontabile.

## Progressione nella run

La potenza aumenta durante una run, ma non in modo permanente:

- doppio colpo;
- colpo perforante;
- raffica piu rapida;
- bomba a schermo;
- drone orbitante;
- scudo personale temporaneo;
- ricarica piu veloce delle strutture;
- torretta automatica temporanea.

La run deve restare riconoscibile come Space Invaders: il giocatore muove, spara, schiva e sceglie quando rischiare. I potenziamenti aumentano le possibilita, non cambiano il gioco in un bullet heaven automatico.

## Difficolta endless

La difficolta cresce in passaggi leggibili:

1. Gli invasori base scendono un poco piu velocemente.
2. Aumenta lentamente il numero di invasori per formazione.
3. Compare il comandante.
4. Compare il bombardiere e il giocatore deve scegliere se sparare agli invasori o alla bomba.
5. Le formazioni mescolano invasori base, comandante e bombardiere.

Velocita e numero di minacce devono avere un limite pratico. Dopo un certo punto la difficolta deriva dal proteggere i quattro slot e dal decidere le strutture, non da uno schermo illeggibile.

## Prima versione giocabile

La prima build deve dimostrare che sparare, proteggere il nucleo e inseguire il punteggio sono gia divertenti.

- movimento orizzontale e fuoco;
- un tipo di invasore in formazione;
- nucleo con una sola vita;
- quattro slot struttura e muro come unica struttura iniziale;
- combo e punteggio a schermo;
- tre ondate che si ripetono e aumentano di intensita;
- schermata game over con miglior punteggio locale.

Solo dopo che questa versione funziona conviene aggiungere la pausa, le scelte fra strutture, comandante, bombardiere, modificatori rischio e leaderboard online.

## Roadmap indicativa

| Periodo | Risultato |
|---|---|
| Settimana 1 | Movimento, sparo, formazione aliena, collisioni e punteggio |
| Settimana 2 | Nucleo con una vita, quattro slot, muri, danni e game over |
| Settimana 3 | Combo, ondate endless e ritmo della velocita di discesa |
| Settimana 4 | Pausa, riparazione e scelta fra tre strutture |
| Settimane 5-6 | Comandante, bombardiere, esplosione delle bombe, effetti e suono |
| Settimane 7-8 | Modificatori rischio, bilanciamento, salvataggio punteggio e playtest |
| Dopo la versione locale | Leaderboard online, sfida giornaliera o couch co-op |

## Rischi da evitare

- trasformare le strutture in un city builder lento;
- aggiungere troppi tipi di nemico prima di aver perfezionato una formazione base;
- rendere la combo obbligatoria per divertirsi;
- rendere casuali le collisioni o le traiettorie dei proiettili;
- creare una difficolta basata solo su velocita e quantita;
- aggiungere una leaderboard online prima che il punteggio locale sia interessante.
