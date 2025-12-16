```
bl1nk-architect/
├── pyproject.toml
├── modal_app.py
├── .env.example
├── src/
│   ├── __init__.py
│   ├── bot.py           # Main Bot Logic (Poe Protocol)
│   ├── auth.py          # GitHub App OAuth Handlers
│   ├── orchestrator.py  # Workflow Controller (The Brain)
│   ├── gemini_client.py # Deep Research Wrapper
│   └── github_client.py # GitHub App Logic
└── utils/
    └── formatter.py     # Markdown Formatter
```