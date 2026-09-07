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
