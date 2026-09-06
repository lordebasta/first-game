# Upgrade delle strutture

Questo documento propone il sistema di upgrade per *Space Invaders: Last
Outpost*. I valori numerici finali vanno decisi con i playtest.

## Carte struttura e carte upgrade

Durante ogni pausa fra le ondate, il giocatore riceve tre carte casuali. La
mano puo contenere sia carte struttura sia carte upgrade.

- Una carta struttura permette di piazzare la struttura in uno slot vuoto o di
  sostituire una struttura di tipo diverso, secondo le normali regole di
  piazzamento.
- Una carta upgrade compare fra le stesse tre carte solo se il giocatore
  possiede almeno una struttura del tipo indicato.
- Scegliendo una carta upgrade, il giocatore seleziona la struttura bersaglio
  se ne possiede piu di una. La struttura conserva posizione e integrita.
- Un upgrade appartiene a una sola struttura, non a tutte le strutture dello
  stesso tipo. Due torrette possono quindi avere configurazioni diverse.
- Una carta upgrade non puo comparire se non avrebbe effetto o se e gia stata
  assegnata a quella struttura.

Scegliere una carta upgrade e il costo-opportunita rispetto a piazzare una
nuova struttura. Non esiste una seconda scelta di tre carte dopo aver scelto
una struttura duplicata.

## Regole comuni delle carte

- Le carte sono permanenti per la durata della run.
- Ogni carta e unica per la singola struttura: gli effetti non sono
  cumulabili e una carta gia assegnata non viene piu offerta per quella copia.
- Se esistono due strutture dello stesso tipo, la stessa carta puo essere
  assegnata una volta a ciascuna di esse.
- Ogni carta deve mostrare chiaramente il proprio effetto e valore, per
  esempio `+1 colpo` o `-20% attesa`.
- Le carte che dipendono da bombardieri, marcature, esplosioni o cariche non
  entrano nel pool prima che la relativa meccanica sia disponibile.

## Carte per struttura

### Muro

Il Muro copre gia tutta la larghezza del proprio slot. Le carte ne aumentano
la resistenza oppure rendono utile l'ultimo impatto subito.

| Carta | Effetto |
| --- | --- |
| Piastre rinforzate | Assorbe un invasore aggiuntivo prima di essere distrutto. |
| Rottami esplosivi | Quando il Muro viene distrutto, elimina gli invasori vicini. |
| Ultimo baluardo | L'ultimo colpo assorbito rallenta brevemente gli invasori. |
| Riparazioni rapide | Durante la pausa recupera un punto integrita aggiuntivo, se danneggiato. |

### Centrale

La Centrale potenzia direttamente il pilota. Le sue carte aumentano mobilita e
potenza di fuoco senza rendere obbligatoria una build da fuoco rapido.

| Carta | Effetto |
| --- | --- |
| Reattore sovralimentato | Aumenta ulteriormente la velocita di movimento. |
| Condensatori rapidi | Riduce ulteriormente l'attesa fra i colpi del player. |
| Celle di riserva | Aumenta la velocita dei proiettili del player. |
| Rete energetica | Le strutture automatiche negli slot adiacenti sparano piu spesso. |

### Scudo

Lo Scudo copre gia tutta la larghezza del proprio slot e, di base, intercetta
solo le bombe. Le carte aumentano la sua affidabilita oppure gli permettono di
gestire anche gli invasori.

| Carta | Effetto |
| --- | --- |
| Capacita aumentata | Conserva una carica di intercettazione aggiuntiva. |
| Ricarica rapida | Riduce il numero di ondate necessario per recuperare una carica. |
| Campo di arresto | Lo Scudo puo intercettare anche un invasore che raggiunge la base. |
| Riflesso | Una bomba intercettata viene rilanciata verso i nemici. |
| Conversione energia | Intercettare una bomba carica immediatamente una carica dello Scudo. |

### Fabbrica droni

I droni possono essere trasformati in una fonte di danno istantaneo: il laser
non e un proiettile, quindi non ha una velocita da potenziare. Le carte
premiano copertura, danno e scelta consapevole della priorita.

| Carta | Effetto |
| --- | --- |
| Linea di assemblaggio | Schiera un drone aggiuntivo. |
| Laser istantaneo | Il drone sostituisce il colpo normale con un laser istantaneo. |
| Laser focalizzato | Il laser infligge danno aggiuntivo. |
| Raffreddamento efficiente | Riduce l'intervallo fra i laser. |
| Puntamento prioritario | Compare un comando per scegliere la priorita: nemico piu vicino alla base o nemico con piu vita. |
| Laser perforante | Il laser attraversa il bersaglio e colpisce un altro invasore allineato. |

### Torretta

La Torretta offre potenza di fuoco affidabile per una corsia. Le scelte creano
build diverse: volume, velocita, controllo dell'area o precisione.

| Carta | Effetto |
| --- | --- |
| Canne gemelle | Ogni attivazione spara un proiettile aggiuntivo con piccolo scarto orizzontale. |
| Meccanismo rapido | Riduce l'intervallo fra le raffiche. |
| Carica ad alto impatto | Aumenta il danno del proiettile. |
| Munizioni esplosive | I colpi esplodono all'impatto e danneggiano i nemici vicini. |
| Colpi perforanti | I colpi attraversano un numero limitato di invasori. |
| Stabilizzatore | I proiettili hanno meno dispersione e viaggiano piu rapidamente. |

### Radar

Il Radar marca di base il nemico con piu vita e lo rende vulnerabile. Le carte
estendono la marcatura a piu bersagli o la trasformano in un vantaggio tattico
e di punteggio.

| Carta | Effetto |
| --- | --- |
| Taglia aumentata | I nemici marcati valgono piu punti. |
| Doppia scansione | Marca anche il secondo nemico con piu vita. |
| Punto debole esposto | I nemici marcati ricevono ulteriore danno. |
| Aggancio persistente | La marcatura resta sul bersaglio anche se un altro nemico supera la sua vita. |
| Allarme bombardiere | Le bombe del bombardiere marcato si muovono piu lentamente. |
| Catena di dati | Eliminare un bersaglio marcato marca un nemico vicino. |

### Deposito munizioni

Di base, il Deposito trasforma ogni quinto attacco del player in uno **spatter
di tre colpi**. Non crea danno ad area: i tre proiettili colpiscono
individualmente. Le carte modificano frequenza, forma e potenza dello spatter.

| Carta | Effetto |
| --- | --- |
| Rifornimento rapido | Riduce il numero di attacchi richiesti per attivare lo spatter. |
| Salva larga | Lo spatter spara cinque colpi anziche tre. |
| Cono stretto | Lo spatter ha meno dispersione ed e piu efficace contro un bersaglio distante. |
| Cono ampio | Lo spatter ha piu dispersione e copre una porzione piu larga della formazione. |
| Munizioni perforanti | Ogni colpo dello spatter attraversa un invasore prima di sparire. |
| Colpo centrale pesante | Il proiettile centrale dello spatter infligge danno aggiuntivo. |
| Riserva d'emergenza | Distruggere una bomba rende il prossimo attacco uno spatter. |

## Carte sinergia

Una carta sinergia combina due strutture gia sviluppate e offre un effetto che
non appartiene a nessuna delle due da sola.

### Condizione di apparizione

- Una coppia e idonea quando il giocatore possiede due strutture dei tipi
  richiesti e **ciascuna** ha almeno tre carte upgrade assegnate.
- Se esistono piu copie di uno dei due tipi, la carta indica le due strutture
  esatte da collegare. Il giocatore non puo cambiare il collegamento dopo la
  scelta.
- Una sinergia idonea puo entrare fra le tre carte della pausa, insieme alle
  carte struttura e alle normali carte upgrade.
- Ogni coppia di strutture puo avere una sola carta sinergia; anche le carte
  sinergia sono permanenti e non cumulabili.
- Una carta non compare piu se una delle due strutture collegate viene
  sostituita o distrutta definitivamente.

Le sinergie devono essere rare: sono una ricompensa per una build intenzionale
e non una condizione necessaria per sopravvivere.

| Coppia | Carta sinergia | Effetto |
| --- | --- | --- |
| Radar + Torretta | Puntamento assistito | Per questa torretta si puo scegliere la priorita: nemico piu vicino alla base, nemico nella sua verticale oppure nemico con piu vita. |
| Radar + Torretta | Tiro guidato | La torretta preferisce sempre il bersaglio marcato dal Radar e i suoi colpi hanno dispersione ridotta. |
| Fabbrica droni + Torretta | Rete laser | La torretta sostituisce i proiettili con un laser istantaneo contro il suo bersaglio. |
| Fabbrica droni + Torretta | Designazione condivisa | Il drone illumina il proprio bersaglio: la torretta collegata spara piu spesso finche quel bersaglio resta vivo. |
| Radar + Fabbrica droni | Caccia grossa | I droni preferiscono il bersaglio marcato; eliminarlo ricarica subito il loro prossimo laser. |
| Centrale + Torretta | Alimentazione diretta | La torretta spara una raffica piu rapida per breve tempo dopo ogni attacco del player. |
| Centrale + Fabbrica droni | Baia sovralimentata | I droni si muovono e riagganciano il bersaglio piu rapidamente; il primo laser di ogni ondata infligge danno aumentato. |
| Deposito munizioni + Torretta | Ricarica incrociata | Quando il player attiva lo spatter, la torretta collegata spara subito una raffica gratuita. |
| Deposito munizioni + Radar | Salva di precisione | I tre colpi dello spatter si chiudono verso il bersaglio marcato, se presente. |
| Scudo + Muro | Linea fortificata | Una bomba intercettata dallo Scudo ripara un punto integrita del Muro collegato. |
| Scudo + Torretta | Contromisure | Intercettare una bomba fa sparare immediatamente la torretta verso il bombardiere responsabile. |
| Scudo + Radar | Allarme preventivo | Il Radar marca prioritariamente il bombardiere che ha una bomba attiva; lo Scudo ricarica piu rapidamente dopo la sua eliminazione. |

Le prime sinergie consigliate sono `Radar + Torretta`, `Fabbrica droni +
Torretta` e `Scudo + Muro`: hanno un legame visivo facile da capire e
introducono rispettivamente controllo del bersaglio, trasformazione del fuoco e
difesa coordinata.

## Ordine di implementazione consigliato

1. Definire le carte possedute per ogni `OutpostStructure` e le strutture che
   possono ricevere una carta.
2. Estendere la mano iniziale fra le ondate: le carte upgrade entrano fra le
   tre carte struttura solo quando esiste una struttura bersaglio valida.
3. Implementare prima le carte semplici e numeriche di Torretta, Centrale,
   Muro e Deposito.
4. Implementare Scudo e Radar completi, poi le carte che dipendono dalle loro
   meccaniche di carica e marcatura.
5. Implementare il laser istantaneo dei droni prima delle carte di danno,
   perforazione e priorita del bersaglio.
6. Introdurre le carte sinergia soltanto dopo che ogni struttura possiede uno
   stato di carte affidabile e puo essere scelta come bersaglio di un effetto.

Ogni upgrade va testato da solo e in combinazione con una seconda struttura
dello stesso tipo. La priorita e mantenere una schermata leggibile e decisioni
veloci durante la pausa, come richiesto dalla vertical slice.
