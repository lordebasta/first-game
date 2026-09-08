# Space Invaders: Last Outpost

Nome di lavoro per un arcade a campagna ispirato alla struttura di Space Invaders. Prima di una pubblicazione pubblica dovra avere un titolo originale.

## Obiettivo

Difendere un ultimo avamposto da un'invasione aliena sempre piu intensa e resistere a tutte le trenta ondate della campagna.

La partita termina con la distruzione del nucleo oppure con la vittoria dopo l'ondata 30. Ogni scelta serve a conservare la base per l'ondata successiva.

## Principi

- controlli leggibili in pochi secondi;
- una campagna di trenta ondate, con una difficolta leggibile;
- difficolta che cresce senza produrre muri improvvisi;
- sopravvivenza basata su abilita e gestione dell'avamposto;
- una singola schermata e grafica 2D minimale;
- prima versione single player, con eventuale modalita couch co-op successiva.

## Fantasia del giocatore

Sono l'ultimo pilota rimasto a proteggere una colonia sotto assedio. Devo abbattere gli alieni, mantenere in vita le strutture e decidere quali parti della base sacrificare quando non riesco piu a difendere tutto.

## Loop della run

```text
Arriva una formazione di invasori
        ↓
Muoviti, spara e proteggi la base
        ↓
Gli invasori scendono verso l'avamposto
        ↓
Elimina la formazione
        ↓
Fra le ondate: pausa, riparazione e scelta di un potenziamento
        ↓
La formazione torna e scende piu velocemente
        ↓
Il nucleo cade: sconfitta; l'ondata 30 cade: vittoria
```

Fra due ondate c'e una pausa breve. Le strutture danneggiate ma non distrutte recuperano un punto integrita. Il giocatore puo sempre riempire uno slot vuoto con un muro base oppure scegliere una fra tre strutture casuali e piazzarla in uno slot libero. Una struttura gia presente non puo essere sostituita. Non c'e un negozio o una fase di costruzione lenta.

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

- **Muro:** struttura base sempre disponibile; occupa uno slot, estende una linea difensiva per tutta la larghezza del campo e assorbe due invasori senza altri effetti.
- **Centrale** *(comune)*: aumenta velocita di movimento e cadenza di fuoco finche resta integra.
- **Scudo** *(rara, temporaneamente fuori dal pool)*: intercetta senza danni la prima bomba lungo tutta la larghezza del campo; poi si ricarica dopo alcune ondate se resta integro.
- **Fabbrica droni** *(rara)*: crea periodicamente un piccolo drone che si muove e spara all'invasore piu in basso.
- **Torretta** *(comune)*: spara verso l'alto, davanti al proprio slot.
- **Radar:** marca il nemico piu resistente e aggiunge +1 al danno che riceve.
- **Deposito munizioni:** ogni quinto attacco del giocatore diventa ad area.

La scelta e sempre locale e rapida: riempire uno slot con un muro o aggiungere una struttura utile in uno slot ancora libero.

## Nemici

Il gioco inizia con Scout fragili e rapidi. Dall'ondata 6 entra l'infantry,
piu resistente. La difficolta cresce gradualmente: il comportamento resta
chiaro e il giocatore impara a proteggere i quattro slot.

- **Invasore base:** scende verso la base; piu a lungo dura la run, piu rapidamente scende. Quando raggiunge una struttura, la danneggia e viene distrutto.
- **Comandante:** appare ogni alcune ondate e aumenta temporaneamente la velocita di discesa della formazione finche resta vivo.
- **Bombardiere:** appare ogni alcune ondate e, a intervalli, lancia una bomba che scende lentamente in linea retta verso la base. Il giocatore deve colpirla prima che raggiunga le strutture.

Quando una bomba viene colpita, esplode e danneggia gli invasori adiacenti. Spararle e quindi sia una difesa urgente sia un'opportunita tattica per liberare spazio davanti alla base.

Per la prima versione non servono altri nemici o mini-boss. Comandante e bombardiere entrano soltanto quando il ritmo dell'invasore base e gia divertente.

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

## Difficolta della campagna

La difficolta cresce in passaggi leggibili:

1. Gli invasori base scendono un poco piu velocemente.
2. Aumenta lentamente il numero di invasori per formazione.
3. Compare il comandante.
4. Compare il bombardiere e il giocatore deve scegliere se sparare agli invasori o alla bomba.
5. Le formazioni mescolano invasori base, comandante e bombardiere.

Velocita e numero di minacce devono avere un limite pratico. Verso l'ondata 30 la difficolta deriva dal proteggere i quattro slot e dal decidere le strutture, non da uno schermo illeggibile.

## Prima versione giocabile

La prima build deve dimostrare che sparare, proteggere il nucleo e superare ondate sempre piu tese sono gia divertenti.

- movimento orizzontale e fuoco;
- un tipo di invasore in formazione;
- nucleo con una sola vita;
- quattro slot struttura e muro come unica struttura iniziale;
- indicatore dell'ondata corrente su trenta;
- le prime cinque ondate definite in `docs/levels.md`;
- schermata game over con l'ondata raggiunta e schermata vittoria dopo l'ondata 30.

Solo dopo che questa versione funziona conviene aggiungere la pausa, le scelte fra strutture, comandante e bombardiere.

## Roadmap indicativa

| Periodo | Risultato |
|---|---|
| Settimana 1 | Movimento, sparo, formazione aliena, collisioni e indicatore ondata |
| Settimana 2 | Nucleo con una vita, quattro slot, muri, danni e game over |
| Settimana 3 | Prime cinque ondate e ritmo della velocita di discesa |
| Settimana 4 | Pausa, riparazione e scelta fra tre strutture |
| Settimane 5-6 | Comandante, bombardiere, esplosione delle bombe, effetti e suono |
| Settimane 7-8 | Completamento delle trenta ondate, bilanciamento e playtest |
| Dopo la versione locale | Couch co-op |

## Rischi da evitare

- trasformare le strutture in un city builder lento;
- aggiungere troppi tipi di nemico prima di aver perfezionato una formazione base;
- rendere obbligatori potenziamenti specifici per completare la campagna;
- rendere casuali le collisioni o le traiettorie dei proiettili;
- creare una difficolta basata solo su velocita e quantita;
- creare un picco di difficolta improvviso fra due ondate consecutive.
