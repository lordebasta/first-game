# Due proposte per un roguelite cooperativo

## Obiettivo e vincoli

Creare un gioco 2D da giocare con amici, sviluppato part-time in **1-3 mesi** usando estesamente assistenti IA.

Con circa 8-12 ore di lavoro alla settimana, il budget realistico e di **50-150 ore**. Il pubblico previsto e un piccolo gruppo di amici: non servono matchmaking pubblico, monetizzazione, una grande quantita di contenuti o rifinitura commerciale.

Il gioco dovrebbe avere:

- run da 10-20 minuti;
- cooperazione significativa;
- situazioni emergenti e memorabili;
- contenuti combinabili;
- una prima build validata con 2 giocatori ed eventualmente estesa fino a 4;
- sviluppo code-first con TypeScript e Phaser.

La casualita deve cambiare le decisioni dei giocatori senza nascondere le regole. La prima versione deve essere un gioco piccolo e completo, non una porzione incompleta di un progetto piu grande.

## Proposta 1: Alieni contro contadini

Roguelite cooperativo top-down che unisce difesa della fattoria, combattimento twin-stick e brevi decisioni di gestione. L'immaginario parte da contadini in esoscheletro che difendono la propria terra da creature aliene. Il raccolto fornisce le risorse con cui costruire la build durante la run.

La fattoria e contemporaneamente base, obiettivo da proteggere e motore della progressione. I raccolti non formano una simulazione agricola completa: sono scelte tattiche che determinano quali risorse saranno disponibili nell'ondata successiva.

### Ciclo della partita

```text
Scegli cosa piantare
        ↓
Esplora i dintorni e recupera materiali
        ↓
Rientra prima dell'attacco
        ↓
Difendi campi, animali e generatore
        ↓
Raccogli e costruisci un potenziamento
        ↓
Affronta un'ondata piu pericolosa
```

Una run dura 10-15 minuti ed e composta da 5-6 cicli giorno/notte.

### Colture

Tre colture sono sufficienti per creare decisioni:

- una produce munizioni o energia;
- una cura giocatori e strutture;
- una genera materiali per i potenziamenti.

Piantare molte risorse offensive permette build piu forti, ma lascia meno strumenti per riparare la fattoria. La squadra deve anche decidere quali zone difendere quando gli alieni attaccano da direzioni diverse.

### Componente cooperativa

La divisione dei compiti deve essere spontanea: esplorare, piantare, riparare, attirare i nemici e usare le armi pesanti. I ruoli non sono classi permanenti; ogni giocatore puo cambiare attivita quando la situazione degenera.

Altre interazioni possibili:

- rianimare un compagno richiede di restargli vicino;
- un giocatore puo trasportare risorse mentre un altro lo difende;
- alcune armi spostano gli alleati senza danneggiarli;
- una struttura richiede due giocatori per essere riparata rapidamente;
- il riepilogo finale assegna titoli comici in base alle azioni della squadra.

### Versione da 1-3 mesi

- una fattoria su una singola mappa;
- 5-6 cicli giorno/notte;
- 3 colture;
- 3 armi o attrezzi modificabili;
- 4 alieni e 1 boss;
- 6 potenziamenti;
- 3 strutture riparabili;
- cooperativa per 2 giocatori nella prima build.

### Punto forte

Ha un'identita chiara e fornisce un obiettivo condiviso. Coltivare, esplorare e difendere alimentano un'unica scelta: investire nel raccolto oppure prepararsi all'assedio.

### Rischio

Farming e combattimento potrebbero sembrare due minigiochi separati. Le colture devono produrre effetti immediati sul combattimento e la cura dei campi deve restare semplice.

La prima versione non deve includere stagioni, relazioni con NPC, allevamento complesso, simulazione economica, piu fattorie o molti tipi di raccolto.

## Proposta 2: Barbaro nella torre

Action roguelite cooperativo sulla sopravvivenza in un mondo regolato come un gioco. La citta e il luogo sicuro dove formare il gruppo, comprare equipaggiamento e scegliere una classe; la torre e una successione di spedizioni brevi dalle quali bisogna riuscire a tornare vivi.

### Ciclo della partita

```text
Prepara il gruppo in citta
        ↓
Entra nella torre
        ↓
Supera 4-6 stanze casuali
        ↓
Assorbi una essenza o prendi un oggetto
        ↓
Continua oppure torna in citta
        ↓
Conserva il bottino estratto e prepara la run seguente
```

Una spedizione dura 10-15 minuti. Dopo alcune stanze il gruppo deve scegliere se estrarre il bottino oppure rischiarlo per raggiungere il boss.

### Classi

Tre classi semplici danno al gruppo ruoli complementari:

- **barbaro:** attacco ravvicinato, carica e resistenza;
- **esploratore:** attacco a distanza, mobilita e individuazione di trappole;
- **mistico:** controllo dei nemici, protezione e cura limitata.

Ogni classe ha inizialmente un attacco e una sola abilita. La profondita deve venire dagli oggetti e dalla cooperazione, non da molti comandi.

### Essenze

I mostri possono lasciare essenze che trasferiscono un loro tratto al personaggio. Ogni giocatore puo equipaggiarne poche, creando build facili da leggere.

Esempi:

- rigenerazione della melma;
- scatto del lupo;
- armatura dello scarabeo;
- esplosione dello spettro;
- veleno del ragno;
- aura gelida del guardiano.

### Citta

La citta non e inizialmente una mappa esplorabile. E una schermata con tre funzioni:

- locanda per preparare il gruppo;
- fabbro per comprare o assicurare un oggetto;
- gilda per scegliere la prossima spedizione.

Questo conserva la sensazione di tornare dalla torre senza richiedere NPC, dialoghi, quest e ambienti aggiuntivi.

### Versione da 1-3 mesi

- 3 classi con un attacco e una abilita ciascuna;
- 8 stanze progettate a mano e ordinate casualmente;
- 5 nemici e 1 boss;
- 6 essenze;
- 6 oggetti;
- una schermata-citta;
- run da 10-15 minuti per 2 giocatori.

### Punto forte

Le classi fanno cooperare gli amici in modo immediato e il ritorno in citta da significato al bottino. La scelta di proseguire o estrarre puo sostenere molte partite anche con una sola ambientazione.

### Rischio

Classi, inventario, citta, persistenza e torre moltiplicano interfacce e bilanciamento. La generazione procedurale deve limitarsi all'ordine di stanze curate.

Una citta esplorabile, molte classi o una progressione narrativa porterebbero il progetto oltre i tre mesi.

## Confronto

| Aspetto | Alieni contro contadini | Barbaro nella torre |
|---|---|---|
| Prototipo | Facile-medio | Medio |
| Forza sociale | Molto alta | Alta |
| Rigiocabilita | Cicli, raccolti e difesa | Classi, essenze ed estrazione |
| Contenuti richiesti | Bassi | Medi |
| Interfacce richieste | Poche | Diverse |
| Rischio tecnico | Medio-basso | Medio-alto |
| Aderenza a 1-3 mesi | Alta | Possibile con tagli rigorosi |

## Direzione consigliata

**Alieni contro contadini** e la scelta piu adatta al limite di tempo. Una sola mappa supporta raccolto, esplorazione e combattimento, mentre la fattoria crea una ragione naturale per coordinarsi.

**Barbaro nella torre** e preferibile se classi, crescita del personaggio e ritorno in citta interessano piu del caos immediato. E un progetto piu rischioso e deve mantenere la citta come menu e la torre come sequenza di poche stanze curate.

In entrambi i casi, entro la quarta settimana deve esistere una partita grezza ma divertente fra due persone. Se gli amici giocheranno a distanza, una stanza online privata va provata entro la stessa scadenza.
