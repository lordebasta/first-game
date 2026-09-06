# Idee per giochi couch co-op

## Vincoli

Progetti 2D locali per 2-4 giocatori, sviluppabili in 1-3 mesi part-time. Una partita deve essere comprensibile in pochi secondi, durare 5-15 minuti e produrre collaborazione, errori recuperabili e momenti raccontabili.

Il couch co-op permette di privilegiare interazioni dirette e fisiche: spingere, trasportare, passarsi oggetti, proteggere un compagno e gestire emergenze nello stesso spazio.

## Vigili del fuoco nel dungeon

Un dungeon vivente e in fiamme. I giocatori sono una squadra di vigili del fuoco avventurieri che deve salvare creature intrappolate, recuperare reliquie e raggiungere l'uscita prima che il livello collassi.

Il fuoco e il nemico principale. Mostri, trappole e stanze servono a creare problemi di movimento e priorita, non a trasformare il gioco in un combattimento tradizionale.

### Fantasia del giocatore

Entriamo in una rovina pericolosa, decidiamo cosa e possibile salvare e trasformiamo un incendio ingestibile in una fuga eroica o in un disastro divertente.

### Ciclo di una missione

```text
Entra in una sezione del dungeon
        ↓
Individua feriti, reliquie e sorgenti dell'incendio
        ↓
Scegli cosa salvare e quale percorso liberare
        ↓
Spegni, apri passaggi e proteggi la squadra
        ↓
Raggiungi l'uscita prima del collasso
```

Una missione dura 8-12 minuti. Il risultato dipende da quante persone e oggetti il gruppo riesce a salvare, non soltanto dal fatto di sopravvivere.

### Azioni base

Ogni giocatore ha le stesse azioni fondamentali:

- spruzzare acqua o schiuma davanti a se;
- usare un'ascia per aprire porte, abbattere oggetti e liberare compagni;
- trasportare una persona, una reliquia o un serbatoio;
- passare un oggetto a un compagno;
- interagire con leve, pompe e porte.

Gli strumenti trovati nella missione cambiano temporaneamente il modo di affrontare l'incendio:

- lancia-schiuma che crea un muro attraversabile;
- tubo lungo che richiede due giocatori, uno alla pompa e uno alla lancia;
- estintore a gelo che blocca il fuoco ma rende il pavimento scivoloso;
- ventola che spinge fumo e fiamme, ma puo peggiorare un'altra stanza;
- corda per tirare persone o oggetti fuori da una zona pericolosa.

### Regole del fuoco

La simulazione deve essere semplice e leggibile:

- il fuoco passa soltanto fra celle o oggetti vicini;
- legno, stoffa e vegetazione bruciano velocemente;
- pietra non brucia ma puo diventare troppo calda;
- il fumo riduce la visibilita e fa diminuire lentamente la resistenza;
- l'acqua spegne il fuoco ma puo rendere pericolose le zone elettriche;
- esplosioni e mostri possono creare nuove sorgenti di incendio.

Ogni effetto deve avere un colore, un suono e un'animazione riconoscibile. Non servono fluidodinamica o fumo realistico.

### Cooperazione

- una persona tiene il tubo, l'altra alimenta la pompa;
- trasportare un ferito riduce la velocita ma permette a un compagno di difenderlo;
- due giocatori possono sfondare insieme una porta bloccata;
- una squadra puo dividere i ruoli fra spegnere l'incendio e cercare superstiti;
- un compagno a terra puo essere trascinato fuori dal fuoco;
- una reliquia pesante richiede due giocatori e impedisce di usare gli strumenti.

Le scelte dovrebbero essere dolorose ma non punitive: salvare tre persone o una reliquia rara, deviare il fuoco verso un corridoio secondario o sacrificare una stanza per preservare l'uscita.

### Prima versione

- una sola mappa composta da 6-8 stanze curate;
- due giocatori;
- acqua, ascia e trasporto;
- tre materiali incendiabili;
- due trappole;
- due tipi di creature da salvare;
- un solo tipo di mostro o ostacolo mobile;
- un timer di collasso;
- punteggio finale basato su salvataggi e danni.

### Punto forte

Il gioco ha un obiettivo immediato e una forte componente cooperativa senza richiedere molte armi, nemici o contenuti. Il fuoco crea naturalmente situazioni diverse in una stessa mappa.

### Rischio

Se il fuoco si propaga troppo rapidamente diventa caos illeggibile; se si propaga troppo lentamente diventa una normale raccolta di oggetti. Il primo test deve validare il ritmo della propagazione prima di aggiungere nuovi strumenti o stanze.

## Officina Mech

Una squadra gestisce un'officina costruita attorno a un mech da combattimento. Durante una missione il mech protegge la base da ondate di nemici, ma si rompe, esaurisce munizioni e richiede nuovi moduli. I giocatori corrono nell'officina, preparano i pezzi e decidono quali sistemi mantenere attivi.

Il mech non e un personaggio per giocatore: e un progetto condiviso. Questo evita classi rigide e trasforma ogni modifica in una decisione di squadra.

### Fantasia del giocatore

Siamo una squadra di tecnici improvvisati: proviamo a tenere in vita un colosso costruito con pezzi incompatibili mentre tutto intorno cade a pezzi.

### Ciclo di una missione

```text
Arriva un ordine di difesa o recupero
        ↓
Prepara il mech con pochi moduli disponibili
        ↓
Resisti a una fase di attacco
        ↓
Ripara danni, carica munizioni e monta componenti trovati
        ↓
Scegli una modifica per la fase seguente
        ↓
Completa la missione o perdi l'officina
```

Una missione dura 10-15 minuti e contiene 4-5 fasi. Il ritmo alterna pressione breve e ricostruzione frenetica, non una lunga fase di crafting.

### Postazioni e componenti

La prima versione puo avere quattro postazioni:

- **forno:** trasforma rottami in piastre e munizioni;
- **banco di montaggio:** assembla moduli pronti;
- **gru:** sposta i moduli verso il mech;
- **console:** riavvia scudi, radar o sistemi danneggiati.

I moduli occupano slot visibili sul mech:

- braccio con cannone a corto raggio;
- trivella che ferma i nemici vicini;
- scudo frontale;
- razzi a ricerca;
- generatore che aumenta energia ma puo surriscaldarsi;
- gambe veloci ma meno resistenti.

Ogni modulo deve avere un vantaggio evidente e un costo: consumo energetico, calore, tempo di montaggio o fragilita.

### Cooperazione

- un giocatore porta i rottami mentre l'altro prepara il modulo;
- montare un braccio pesante richiede due persone oppure una gru libera;
- durante un attacco un giocatore puo usare il cannone manualmente, mentre gli altri riparano;
- la squadra deve scegliere se spendere i materiali per difendere subito o preparare un modulo migliore;
- un giocatore puo staccare un componente danneggiato per salvare il nucleo del mech;
- alcuni malfunzionamenti richiedono due interazioni simultanee.

### Prima versione

- una officina su una singola schermata;
- due giocatori;
- un mech con quattro slot;
- tre moduli;
- due risorse: rottami ed energia;
- tre tipi di danno: fuoco, cavo rotto e modulo bloccato;
- tre tipi di nemici;
- quattro fasi di attacco;
- una vittoria basata sulla sopravvivenza della base.

### Punto forte

Ogni oggetto e fisicamente visibile, condiviso e importante. Il gruppo crea storie del tipo: “abbiamo tolto lo scudo per montare il cannone e il mech e esploso dieci secondi dopo”.

### Rischio

Ha piu sistemi del gioco dei vigili del fuoco: trasporto di oggetti, moduli, stati del mech, nemici e interfaccia dell'officina. Per rientrare nel tempo, il mech deve inizialmente muoversi e sparare automaticamente; i giocatori gestiscono soltanto la preparazione e le emergenze.

## Confronto

| Aspetto | Vigili del fuoco nel dungeon | Officina Mech |
|---|---|---|
| Regola centrale | Il fuoco si espande, salva cio che puoi | Il mech si rompe, tienilo operativo |
| Prima versione | Una mappa e pochi strumenti | Un'officina e pochi moduli |
| Contenuti richiesti | Bassi | Medi |
| Rigiocabilita | Propagazione, salvataggi e percorsi | Moduli, danni e priorita |
| Rischio tecnico | Medio | Medio-alto |
| Aderenza a 1-3 mesi | Alta | Media |

**Vigili del fuoco nel dungeon** e la scelta piu sicura: un solo sistema, il fuoco, alimenta gran parte del gioco. **Officina Mech** e piu ricco e ha un potenziale molto forte per le storie di gruppo, ma richiede di tagliare il numero di moduli e di nemici con disciplina.
