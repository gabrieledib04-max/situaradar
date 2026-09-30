# 📡 SituaRadar

SituaRadar è un'applicazione web mobile-responsive basata sullo stack **MERN** (MongoDB, Express, React, Node.js) progettata per identificare e mostrare su una mappa le "situa" — ovvero eventi, feste, e ritrovi sociali con un'elevata interazione umana.

La metrica chiave del progetto si basa su un assunto semplice: **se c'è molta gente raggruppata, ma il tasso di utilizzo attivo dello smartphone è basso (schermo spento), c'è una bella atmosfera e le persone stanno interagendo tra loro.**

## 🚀 Funzionalità Principali

- 🗺️ **Mappa Interattiva Dark Mode**: Mappa full-screen centrata inizialmente sulla Puglia, con un design scuro elegante (ottenuto tramite l'inversione intelligente dei *tile* di OpenStreetMap).
- 📍 **Rilevamento Posizione & Stato Dispositivo**: Sfrutta la Geolocation API per localizzare l'utente e la Page Visibility API per capire se l'app è aperta attivamente o se il telefono è in tasca (schermo spento).
- 🔥 **Situa Index & Heatmap**: Il backend raggruppa spazialmente le posizioni (clustering) e calcola un indice basato sulla densità e sulla percentuale di schermi spenti. Più l'indice è alto, più la *situa* è calda (rosso/fuoco)!
- 🔐 **Autenticazione (JWT)**: Sistema di login e registrazione (con raccolta dati come Età e Sesso). Include anche un mock per il flusso OAuth (es. Login con Google).
- 🏆 **Gamification (SituaScore)**: Gli utenti autenticati che partecipano attivamente a una "situa" tenendo il telefono in tasca guadagnano punti `situaScore` automaticamente.
- 🎚️ **Filtri in tempo reale**: Slider per filtrare la mappa mostrando solo le zone con un numero minimo di persone.

## 🛠️ Stack Tecnologico

- **Frontend**: React, Vite, Leaflet.js (per la mappa), HTML5/CSS3 (Vanilla CSS per il layout).
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose per la modellazione dei dati).
- **Autenticazione**: JSON Web Token (JWT) e bcrypt per l'hashing delle password.
- **Deploy/Ambiente**: Docker e Docker Compose.

## 📦 Installazione e Avvio Locale

### Requisiti
- Node.js (v18+)
- MongoDB (in esecuzione localmente sulla porta 27017, oppure tramite Docker)
- Docker (opzionale)

### Metodo 1: Tramite npm (Sviluppo Locale Separato)

1. **Clona il repository e naviga nella cartella root**:
   ```bash
   git clone https://github.com/TUO_USERNAME/situaradar.git
   cd situaradar
   ```

2. **Installa le dipendenze per Backend e Frontend**:
   ```bash
   npm install
   npm run install-client
   ```

3. **Avvia Backend e Frontend in modalità sviluppo**:
   Apri due terminali.
   Nel primo terminale (Backend - sulla porta 3000):
   ```bash
   npm run dev
   ```
   Nel secondo terminale (Frontend - sulla porta 5173):
   ```bash
   cd client
   npm run dev
   ```

4. **Visita**: `http://localhost:5173`

### Metodo 2: Tramite Docker Compose

1. Assicurati che il demone Docker sia in esecuzione.
2. Dalla root del progetto, esegui:
   ```bash
   docker-compose up --build
   ```
3. Il container builderà l'app React e il backend Express la servirà sulla porta 3000.
4. **Visita**: `http://localhost:3000`

## 🧠 Note di Teoria (Rif. Fondamenti Web)

All'interno del codice sorgente sono stati volutamente mantenuti alcuni commenti didattici (Theory Notes) relativi agli argomenti del corso:
- **Capitolo 2 (HTTP)**: Uso corretto dei metodi REST, codici di stato (201 Created) e gestione degli header di Caching (`no-store` per la mappa live).
- **Capitolo 4 (CSS)**: Impiego pratico di selettori di discendenza, pseudo-classi, classi adiacenti ed IDs per la UI sovrapposta alla mappa.
- **Capitolo 5 (JavaScript)**: Gestione del `this` tramite Arrow Functions, Type Coercion e Programmazione Asincrona (`async`/`await` e Promises per interfacciarsi con il backend MERN).

---
*Progetto creato per il corso di Fondamenti Web.*
