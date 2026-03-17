# NewsLens 📰
Moteur de recherche d'articles avec synthèse IA instantanée
Elasticsearch BM25 · Ollama tinyllama · CC-News/NewsAPI · React 

## Structure
```
newslens/
├── backend/
│   ├── main.py          ← API FastAPI (search, summarize, suggest)
│   ├── indexer.py       ← Indexation CC-News → Elasticsearch
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css    ← Design system + light/dark mode
        └── App.jsx      ← UI complète
```

## Pourquoi c'est rapide
- **BM25 full-text** au lieu de kNN vectoriel → <50ms
- Pas d'embedding à chaque requête
- Texte léger (pas d'images)

## Lancement

### 1. Elasticsearch (WSL)
### 2. Backend
```powershell
cd newslens\backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Indexer les articles (une fois, ~2 min)
Option 1 — NewsAPI
1. Crée une clé gratuite sur newsapi.org (30 secondes)
2. Lance l'indexer
```powershell
python indexer.py --n 1000 --news TA_CLE_ICI
```
Option 2 — CC News
python indexer.py --n 2000  # ← utilise datasets

### 4. Frontend
```powershell
cd newslens\frontend
npm install && npm run dev
# → http://localhost:5173
```

## Fonctionnalités
- Recherche instantanée avec highlights
- Synthèse IA (Ollama tinyllama) des top résultats
- Autocomplete
- Filtres par source
- Pagination "Load more"
- Mode clair / sombre

## Note IP WSL
Si Elasticsearch ne répond pas, change l'IP dans backend/main.py et backend/indexer.py :
```bash
wsl hostname -I  # → récupère l'IP
```
