# Istruzioni architetturali

- Mantieni `GameScene` come composizione e regia: crea gli oggetti, collega le interazioni e gestisce stato della run/UI; non metterci comportamento specifico di player, nemici o armi.
- Il comportamento legato a una singola entità vive nell'entità o in un suo componente: `Player` legge comandi, si muove e chiede alla propria arma di sparare; `Projectile` applica il colpo; `Enemy` riceve danno e reagisce.
- Se un comportamento coinvolge più famiglie di oggetti, usa un sistema dedicato (es. overlap e regole di combattimento), senza spostare tutta la logica nella scene.
- Dipendi da interfacce quando serve sostituire qualcosa: i comandi del player dovranno poter arrivare anche da AI, replay o un secondo giocatore.
- Preferisci modifiche piccole, tipizzate e verificabili; dopo modifiche al codice esegui `npm run build`.
