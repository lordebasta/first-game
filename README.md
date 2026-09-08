# Last Outpost

Vertical slice di un arcade a campagna di 30 ondate realizzato con TypeScript, Phaser e Vite.

## Avvio

```bash
npm install
npm run dev
```

Aprire l'indirizzo mostrato da Vite, normalmente `http://localhost:5173`.

## Controlli

- `A` / `D` oppure frecce sinistra/destra: movimento;
- `Spazio` oppure click sinistro: fuoco;
- `Esc`: pausa durante il gioco;
- `Invio`: inizia o riprova;
- `Esc`: torna al menu dalla schermata di sconfitta.

## Verifica della build

```bash
npm run build
```

## Test della logica

```bash
npm test
```

I test di regressione coprono nemici, teletrasporto, carte e combattimento
con un adattatore minimo di Phaser, senza dipendenze aggiuntive. Non sostituiscono
il playtest in browser per rendering e collisioni Arcade.

## Diagnostica in sviluppo

Con `npm run dev`, il pannello laterale mostra FPS, durata media del frame e
tempo medio/picco trascorso nell'aggiornamento della scena. `CPU SCENA` e una
misura del lavoro sincrono fra `PRE_UPDATE` e `POST_UPDATE`: non include il
rendering GPU e non isola il carico causato da altre schede o processi del
browser.

La musica di gioco riproduce in sequenza le tracce in `src/assets/audio/`, con
un crossfade di cinque secondi. Il volume si regola dal menu principale o
dalla schermata di pausa.

Per criteri, metriche e procedura di profiling consulta
[docs/performance.md](docs/performance.md).
