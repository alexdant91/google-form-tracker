# Contact Dashboard - Multi Forms Management

Dashboard professionale per la gestione di contatti e Google Forms multipli con generazione automatica di link precompilati e integrazione WhatsApp.

## 🚀 Caratteristiche Principali

- **Gestione Contatti Completa**: Aggiungi, modifica ed elimina contatti con informazioni complete
- **Form Multipli**: Gestisci diversi Google Forms con configurazioni personalizzate
- **Link Precompilati**: Generazione automatica di link Google Forms con ID contatto precompilato
- **Integrazione WhatsApp**: Messaggi personalizzabili con link ai form
- **Import CSV**: Importazione risposte da Google Forms via CSV
- **Dashboard Analytics**: Statistiche e metriche in tempo reale
- **UI Moderna**: Interfaccia accattivante e responsive con Tailwind CSS

## 🛠️ Stack Tecnologico

### Backend
- **Node.js** con Express.js
- **MongoDB** per il database
- **Multer** per upload file
- **CSV-Parser** per elaborazione CSV
- **Mongoose** per ODM MongoDB

### Frontend
- **React 18** con Vite
- **React Router DOM** per navigazione
- **Tailwind CSS** per styling
- **Lucide React** per icone
- **Axios** per chiamate API

## 📋 Prerequisiti

- Node.js 18+ 
- MongoDB 5.0+
- npm o yarn

## 🚀 Installazione

### 1. Clona il progetto

```bash
git clone <repository-url>
cd contact-dashboard
```

### 2. Setup Backend

```bash
# Vai nella directory backend
cd backend

# Installa le dipendenze
npm install

# Avvia MongoDB (se non già in esecuzione)
mongod

# Avvia il server backend
npm run dev
```

Il backend sarà disponibile su `http://localhost:5000`

### 3. Setup Frontend

```bash
# Vai nella directory frontend (nuovo terminale)
cd frontend

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3000`

## 📖 Configurazione

### 1. Configurazione Google Forms

Per utilizzare un Google Form con la dashboard:

1. **Crea il tuo Google Form** su https://forms.google.com
2. **Ottieni l'URL base** del form (senza parametri)
3. **Identifica il campo da precompilare**:
   - Ispeziona il codice HTML del form
   - Trova l'entry field (es. `entry.1234567`)
4. **Configura il form nella dashboard**:
   - Vai su "Form" nella dashboard
   - Clicca "Nuovo Form"
   - Inserisci nome, URL base e entry field

### 2. Configurazione WhatsApp Template

Personalizza il messaggio WhatsApp usando le variabili disponibili:

```
Ciao {FIRST_NAME}! 🌟

Ti invio il link per compilare il nostro questionario.

📋 Link: {FORM_LINK}

Grazie per la collaborazione! 😊
```

**Variabili disponibili**:
- `{FIRST_NAME}` - Nome del contatto
- `{LAST_NAME}` - Cognome del contatto
- `{FULL_NAME}` - Nome completo
- `{EMAIL}` - Email del contatto
- `{PHONE}` - Telefono del contatto
- `{COMPANY}` - Azienda del contatto
- `{FORM_LINK}` - Link precompilato al form

## 📝 Utilizzo

### 1. Gestione Contatti

1. **Aggiungi contatti**: Vai su "Contatti" → "Nuovo Contatto"
2. **Compila i campi**: Nome, cognome, email, telefono (obbligatori), azienda e note (opzionali)
3. **Salva**: Il contatto sarà disponibile per l'invio di form

### 2. Gestione Form

1. **Crea un form**: Vai su "Form" → "Nuovo Form"
2. **Configura**:
   - Nome del form
   - URL base di Google Forms
   - Campo entry per precompilazione
   - Template messaggio WhatsApp
   - Nome colonna CSV per import
3. **Attiva**: Imposta il form come attivo

### 3. Invio Form ai Contatti

1. **Seleziona contatto**: Dalla lista contatti, clicca l'icona "Invia"
2. **Scegli form**: Seleziona quale form inviare
3. **Genera link**: Il sistema crea automaticamente:
   - Link precompilato al Google Form
   - Messaggio WhatsApp personalizzato
   - Link diretto per aprire WhatsApp
4. **Invia**: Copia il messaggio o apri direttamente WhatsApp

### 4. Import Risposte CSV

1. **Esporta da Google Forms**: Vai su Google Forms → Risposte → Scarica CSV
2. **Importa nella dashboard**: 
   - Vai su "Risposte" → "Importa CSV"
   - Seleziona il form di destinazione
   - Carica il file CSV
3. **Verifica**: Le risposte saranno associate automaticamente ai contatti tramite l'ID precompilato

## 🎯 Workflow Completo

1. **Setup iniziale**:
   - Configura i tuoi Google Forms nella dashboard
   - Aggiungi i tuoi contatti

2. **Invio questionari**:
   - Seleziona contatto e form
   - Genera link personalizzato
   - Invia via WhatsApp

3. **Raccolta risposte**:
   - I contatti compilano il form con ID precompilato
   - Esporta risposte da Google Forms come CSV
   - Importa CSV nella dashboard

4. **Analisi**:
   - Visualizza risposte associate a ogni contatto
   - Monitora statistiche nella dashboard
   - Esporta dati per ulteriori analisi

## 🔧 API Endpoints

### Contatti
- `GET /api/contacts` - Lista contatti
- `POST /api/contacts` - Crea contatto
- `PUT /api/contacts/:id` - Aggiorna contatto
- `DELETE /api/contacts/:id` - Elimina contatto

### Form
- `GET /api/forms` - Lista form
- `POST /api/forms` - Crea form
- `PUT /api/forms/:id` - Aggiorna form
- `DELETE /api/forms/:id` - Elimina form

### Risposte
- `GET /api/responses` - Lista risposte
- `POST /api/responses/import/:formId` - Importa CSV
- `DELETE /api/responses/:id` - Elimina risposta

### Generazione Link
- `POST /api/generate-link/:contactId/:formId` - Genera link precompilato

## 🎨 Personalizzazione UI

La dashboard utilizza Tailwind CSS per lo styling. Puoi personalizzare:

1. **Colori**: Modifica `tailwind.config.js` per cambiare il tema
2. **Componenti**: I componenti sono modulari e facilmente personalizzabili
3. **Layout**: Responsive design che si adatta a desktop, tablet e mobile

## 🔐 Sicurezza

- **Validazione Input**: Tutti gli input sono validati lato client e server
- **Sanitizzazione**: I dati vengono sanitizzati prima dell'inserimento nel database
- **CORS**: Configurato per permettere solo le origini autorizzate
- **Error Handling**: Gestione errors completa con messaggi user-friendly

## 📊 Database Schema

### Contacts
```javascript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required),
  phone: String (required),
  company: String,
  notes: String,
  formHistory: [{ formId, sentAt, sentCount }],
  createdAt: Date
}
```

### Forms
```javascript
{
  name: String (required),
  description: String,
  baseUrl: String (required),
  entryField: String (required),
  whatsappTemplate: String (required),
  csvColumnName: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Responses
```javascript
{
  contactId: ObjectId (required),
  formId: ObjectId (required),
  responseData: Object (required),
  submittedAt: Date,
  csvImportedAt: Date
}
```

## 🚀 Deploy in Produzione

### Backend
1. Configura MongoDB Atlas o un'istanza MongoDB di produzione
2. Imposta le variabili d'ambiente:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/contact_dashboard
   PORT=5000
   NODE_ENV=production
   ```
3. Build e deploy su servizi come Railway, Render, o Heroku

### Frontend
1. Build per produzione:
   ```bash
   npm run build
   ```
2. Deploy su Vercel, Netlify, o servizio simile
3. Configura il proxy API per puntare al backend di produzione

## 🤝 Contributi

1. Fork del progetto
2. Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Apri Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 🆘 Supporto

Se riscontri problemi o hai domande:

1. Controlla la documentazione
2. Cerca negli issues esistenti
3. Crea un nuovo issue con dettagli del problema
4. Include log di errore e passi per riprodurre il bug

## 🔄 Roadmap

### V1.1 (Coming Soon)
- [ ] Autenticazione utente
- [ ] Backup automatico
- [ ] Notifiche push
- [ ] Modalità dark theme
- [ ] Export avanzato (PDF, Excel)

### V1.2
- [ ] Templates email
- [ ] Programmazione invii
- [ ] Analytics avanzate
- [ ] Integrazione Telegram
- [ ] API webhooks

---

**Buon utilizzo della tua Contact Dashboard! 🎉**