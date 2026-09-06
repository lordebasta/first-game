# Scelta tecnologia per game development AI-first

## Scelta principale

**TypeScript** come linguaggio principale.

L'obiettivo è sviluppare videogiochi soprattutto tramite coding agent/IA, evitando engine molto dipendenti da editor grafici.

## Perché TypeScript

- Ottimo per sviluppo **code-first** e quindi facile da gestire con IA.
- Può essere usato sia per giochi **2D** sia **3D**.
- Permette di pubblicare giochi direttamente nel **browser**.
- Può essere impacchettato anche come applicazione **desktop/eseguibile**.
- Può essere usato anche lato **server multiplayer** con Node.js.
- Permette di condividere facilmente tipi, protocollo e parte della logica tra client e server.
- In generale offre performance migliori di Python puro per logica CPU-intensive grazie al JIT JavaScript.
- Se alcune parti diventano troppo pesanti, possono essere riscritte in **Rust/WebAssembly** senza cambiare tutto lo stack.

## Stack previsto

### Giochi 2D
- **TypeScript**
- **Phaser**

### Giochi 3D
- **TypeScript**
- **Babylon.js** oppure **Three.js**

### Multiplayer
- **Node.js + TypeScript**
- WebSocket / WebRTC a seconda del gioco

### Desktop
- Electron, Tauri o altro wrapper desktop

### Parti CPU-intensive future
- Prima implementazione in TypeScript
- Profiling
- Eventuali hot path riscritti in **Rust + WebAssembly**

## Architettura consigliata

Separare la logica di gioco dal rendering:

```text
packages/
├── core/
│   ├── combat/
│   ├── entities/
│   ├── inventory/
│   ├── procedural/
│   ├── ai/
│   └── networking/
├── game-2d/
│   └── Phaser
├── game-3d/
│   └── Babylon / Three
└── server/
    └── Node.js
```

Il `core` non deve dipendere da Phaser o Babylon.

In questo modo sistemi come combat, inventory, loot, AI, procedural generation, networking e game rules possono essere riutilizzati tra giochi 2D, 3D e server.

## Principio

> Scegliere TypeScript non perché sia il linguaggio più veloce in assoluto, ma perché offre un ottimo equilibrio tra performance, browser, desktop, multiplayer, 2D/3D e sviluppo assistito da IA.

Per i giochi molto CPU-intensive, ottimizzare solo ciò che il profiler identifica come collo di bottiglia, eventualmente usando Rust/WASM.
