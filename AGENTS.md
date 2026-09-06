# Istruzioni architetturali

## Documento di riferimento

Il gioco si basa su [Space Invaders: Last Outpost](docs/space-invaders-last-outpost.md). Prima di introdurre o modificare meccaniche, usa questo documento come riferimento per loop, progressione, strutture e priorita della vertical slice.

## Struttura della repository

```text
src/
  main.ts                  # bootstrap Phaser e registrazione delle scene
  game/
    constants.ts           # dimensioni, palette e costanti condivise
    RunData.ts             # chiavi centralizzate del Data Manager della run
    scenes/                # MenuScene, GameScene e GameOverScene
    entities/              # oggetti di gioco con comportamento proprio
      structures/          # una classe per struttura e relativi hook di ciclo di vita
    systems/               # sistemi trasversali: combattimento, spawn, armi e slot struttura
    combat/                # interfacce e dati del dominio di combattimento
    input/                 # sorgenti di comandi del giocatore
    graphics/              # texture e risorse grafiche create a runtime
    ui/                    # viste UI composte, es. scelta struttura
    ui.ts                  # componenti UI riutilizzabili
docs/                      # game design e note di progetto
AGENTS.md                  # convenzioni architetturali per gli agenti
```

- Mantieni `GameScene` come composizione e regia: crea gli oggetti, collega le interazioni e gestisce stato della run/UI; non metterci comportamento specifico di player, nemici o armi.
- Il comportamento legato a una singola entità vive nell'entità o in un suo componente: `Player` legge comandi, si muove e chiede alla propria arma di sparare; `Projectile` applica il colpo; `Enemy` riceve danno e reagisce.
- Se un comportamento coinvolge più famiglie di oggetti, usa un sistema dedicato (es. overlap e regole di combattimento), senza spostare tutta la logica nella scene.
- Dipendi da interfacce quando serve sostituire qualcosa: i comandi del player dovranno poter arrivare anche da AI, replay o un secondo giocatore.
- Preferisci modifiche piccole, tipizzate e verificabili; dopo modifiche al codice esegui `npm run build`.
