# Campagna: 30 ondate

La partita e una campagna a durata fissa: il giocatore vince se il nucleo e
ancora integro dopo l'ondata 30. Non esistono punteggio, combo o classifica.
La misura del risultato e l'ondata raggiunta.

La vertical slice corrente si conclude con una schermata di vittoria dopo
l'ondata 25; le ondate 26-30 restano la struttura prevista per la campagna completa.

Ogni ondata e una singola formazione. Fra un'ondata e la successiva c'e una
pausa breve durante la quale le strutture danneggiate recuperano un punto
integrita. Dopo le ondate pari il giocatore sceglie le carte per l'avamposto;
dopo le ondate dispari non viene proposta alcuna carta. Dopo le ondate 5, 10, 15, 20 e 25 la
pausa puo essere piu lunga per evidenziare il mini-boss appena sconfitto.

## Nemici iniziali

- **Scout:** 1 integrita, non spara e vale solo come minaccia di movimento.
  Scende a 50 px/s e oscilla sinusoidalmente sull'asse X con ampiezza 28 px.
  Quando raggiunge una struttura la
  danneggia e viene distrutto.
- **Infantry:** nemico base gia realizzato. Entra dall'ondata 6; e piu lento
  dello Scout ma piu resistente.

## Prime cinque ondate

Le prime cinque ondate usano esclusivamente Scout. Devono insegnare movimento,
fuoco e priorita dei bersagli senza introdurre proiettili nemici.
Dalla terza ondata alcuni Scout hanno 2 punti vita.

| Ondata | Formazione | Velocita Scout | Comportamento nuovo | Intento |
|---|---:|---:|---|---|
| 1 | 5 Scout rossi, una riga | 50 px/s | nessuno | Lascia tempo per imparare movimento e fuoco. |
| 2 | 10 Scout rossi, due file da 5 | 50 px/s | seconda fila | Richiede di gestire due profondita. |
| 3 | 6 Scout rossi + 4 viola, due file da 5 | 50 px/s | Scout da 2 punti vita | Introduce bersagli piu resistenti. |
| 4 | 6 Scout rossi + 6 viola, due file da 6 | 50 px/s | formazione piu larga | Aumenta la pressione sulle corsie. |
| 5 | 6 Scout rossi + 8 viola + 1 veterano, tre file da 5 | Scout 50 px/s; veterano 78 px/s | veterano al centro della seconda fila | Mini-boss con piu scorta. |

Lo **Scout veterano** e una variante dell'unita gia nota, non un nemico nuovo:
usa lo stesso modello di movimento dello Scout, ha quattro integrita ed e
visivamente distinto da un contorno o nucleo luminoso.
Mantiene la taratura precedente: discesa a 78 px/s e oscillazione di 22 px.
Ogni 1,8 secondi avvia un teletrasporto verso una X distante almeno 150 pixel:
si chiude sull'asse X in 180 ms e si riapre in 220 ms nella nuova posizione.
La discesa continua anche durante l'animazione.

Il colore di ogni nemico indica la vita residua: rosso = 1, viola = 2,
blu = 3, giallo = 4, verde = 5, ciano = 6, arancione = 7 e bianco = 8 o piu.
Il colore cambia dopo un colpo. Il Radar segnala la marcatura con trasparenza,
senza sostituire il colore della vita.

## Progressione prevista

Il **Tank** ha otto punti integrita, senza corazza o riduzioni del danno. Usa
la palette estesa dei colori della vita e cambia colore dopo ogni colpo. Marcia
nella formazione e occupa la linea piu vicina alla base.

Il **Sapper** entra nell'ondata 21 con tre punti integrita. Scende fino a meta
schermo, si ferma per 0,8 secondi, si allinea allo slot piu vicino
e poi scende a 100 px/s verso il nucleo. La sua silhouette e il cambio
di movimento distinguono la minaccia dagli Scout e dalle bombe. Come gli altri
invasori, raggiungere il nucleo termina la run.

- 6-9: Scout e Infantry. Il numero di Infantry e triplicato rispetto alle
  formazioni iniziali, la velocita sale da 1,35x a 2x e compaiono gradualmente
  Infantry da 4 a 6 integrita. Due file di Scout entrano una alla volta
  nell'arco di 10 secondi. Nell'ondata 9, le due colonne centrali hanno 6
  integrita e obbligano a scegliere se aprire subito il centro oppure ripulire
  prima i lati.
- 10: nave madre da 60 integrita. Non scende: pattuglia orizzontalmente la parte
  alta dello schermo, protetta da tre righe di 6 Infantry da 4 integrita, e
  rilascia uno Scout da 2 integrita ogni 1,2 secondi, dopo un primo rilascio
  ritardato di 1,6 secondi. Non esiste un limite agli Scout attivi; gli Scout
  rimasti devono essere eliminati per vincere.
- 11: insieme a Infantry e Bombardiere compare una sola Preda dorata. Attraversa lo schermo una volta e fugge; se viene distrutta, permette di sostituire una struttura e scegliere per quella nuova tanti upgrade quanti ne aveva la struttura originaria. La vecchia struttura e i suoi upgrade vengono rimossi dalla run.
- 12-15: Infantry, Bombardieri e alcuni Scout; ondata 15 mini-boss.
- 16: tre Tank introducono la corazza davanti a dodici Infantry, senza altre distrazioni.
- 17: quattro Tank, dodici Infantry e sei Scout scaglionati verificano la priorita dei bersagli.
- 18: tre Tank, quattordici Infantry e un Bombardiere introducono la sinergia fra esplosioni e corazza.
- 19: cinque Tank, dodici Infantry, due Bombardieri e sei Scout combinano tutte le minacce dell'arco.
- 20: il Maresciallo da guerra guida diciotto Infantry, quattro Tank e un Bombardiere. Finche e vivo ogni discesa della formazione e aumentata del 40%; a meta integrita chiama due Tank aggiuntivi.
- 21: quattordici Infantry, quattro Tank e un Sapper centrale. Il Bombardiere
  assente lascia spazio per imparare il nuovo movimento di corsia.
- 22: quattordici Infantry, quattro Tank, un Bombardiere e due Sapper che
  entrano dopo 2 e 6 secondi.
- 23: sedici Infantry, tre Tank, due Bombardieri e due Sapper scaglionati.
  Meno Tank compensano la seconda fonte di bombe.
- 24: quattordici Infantry, cinque Tank, un Bombardiere e tre Sapper che
  entrano a 0, 4 e 8 secondi, distribuiti fra le tre corsie.
- 25: un Sapper gigante da 24 integrita guida dodici Infantry e due Tank.
  A meta schermo si teletrasporta tre volte fra le corsie. Poi resta fermo
  nella corsia definitiva per 1,2 secondi e scende a 75 px/s verso il nucleo.
  Puo essere colpito durante tutte le fasi.
- 26-30: da definire; ondata 30 e scontro finale.
