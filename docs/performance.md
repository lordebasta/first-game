# Performance

L'obiettivo non e ottenere il numero di FPS piu alto possibile, ma mantenere
un frame time stabile sull'hardware minimo scelto per il gioco. A 60 FPS ogni
frame ha un budget totale di **16,67 ms**; a 30 FPS il budget e **33,33 ms**.

## Metriche disponibili

Phaser espone tramite `game.loop`:

- `actualFps`: media recente degli FPS;
- `delta`: intervallo fra frame filtrato da Phaser;
- `rawDelta`: intervallo reale, utile per trovare scatti isolati;
- `frame`: numero di frame elaborati.

La build di sviluppo mostra inoltre nel pannello laterale:

- FPS e durata media del frame;
- tempo CPU medio trascorso nell'aggiornamento della scena;
- picco recente del tempo CPU della scena.

Il tempo `CPU SCENA` misura il lavoro sincrono fra `PRE_UPDATE` e
`POST_UPDATE`. Non include il rendering GPU e non separa il gioco dagli altri
carichi del browser. La media puo nascondere scatti: durante il profiling vanno
osservati anche picchi e percentile p95/p99 di `rawDelta`.

## Procedura di verifica

1. Creare e avviare la build di produzione con `npm run build` e
   `npm run preview`.
2. Provare per almeno 30 secondi la situazione piu pesante della campagna sul
   dispositivo minimo supportato.
3. Registrare quel periodo nel pannello **Performance** dei DevTools del
   browser e controllare frame persi, scripting, garbage collection e memoria.
4. Ripetere una prova identica dopo ogni ottimizzazione: una singola lettura
   non permette un confronto affidabile.

## Distinguere CPU e GPU

Se il tempo CPU della scena cresce insieme al frame time, cercare cicli di
update, collisioni, fisica, allocazioni e garbage collection. Se la CPU resta
bassa ma i frame rallentano, ridurre temporaneamente risoluzione, particelle,
luci ed effetti: un miglioramento netto indica un probabile limite di rendering
o GPU.

Per analizzare WebGL si puo usare Spector.js, disponibile anche nella debug
build di Phaser. Misurazioni precise del tempo GPU richiedono estensioni WebGL
come `EXT_disjoint_timer_query`, che non sono disponibili su tutti i browser.

Riferimenti:

- [Phaser TimeStep](https://docs.phaser.io/api-documentation/class/core-timestep)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance)
- [WebGL GPU timer query](https://developer.mozilla.org/en-US/docs/Web/API/EXT_disjoint_timer_query)
