# Nexora — Local AI Coding Assistant

Nexora is a lightweight local coding assistant built with React, TypeScript, and Vite.  
It communicates with Ollama models running locally (such as `llama3.2:3b`) and provides a clean, responsive chat interface with syntax-highlighted code blocks and streaming responses.

This project is fully local and does not rely on any external APIs.

---

## Features

- Local AI chat powered by the **Ollama** API
- **Streaming** token responses
- Syntax highlighting using **Prism.js**
- Light and dark **theme** support
- Settings modal (Account and Help tabs)
- **Copy-to-clipboard** for code blocks
- Clean separation of **UI**, **chat logic** and **types**
- Fully local processing (no cloud calls)

---

## Project Structure

```text
NEXORA/
├── favicon/                   # App icons
├── node_modules/              # Installed dependencies
├── src/
│   ├── App.tsx                # Main UI: layout, rendering, theme, settings, input
│   ├── main.tsx               # React entry point, mounts App into index.html
│   ├── prism.d.ts             # Type declarations for Prism.js
│   ├── types.ts               # Shared TypeScript types (Message, Role, AuthUser, OllamaChunk)
│   ├── hooks/
│   │   └── useChat.ts         # Chat logic: streaming, error handling, SYSTEM_PROMPT, model name
│   ├── components/
│   │   └── settingsModal.tsx  # Settings modal component
│   ├── styles/
│       ├── index.css          # Global application styles (chat layout, themes, bubbles)
│       └── settings.css       # Modal-specific styles
├── index.html                 # Base HTML template used by Vite
├── package.json               # Dependencies and script definitions
├── package-lock.json          # Locked dependency versions
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
└── README.md                  # Documentation





## Architecture Overview

| File | Description |
|------|-------------|
| **App.tsx** | UI layer responsible for rendering the interface, handling user interaction, and managing visual state (themes, modal, input, etc.) |
| **useChat.ts** | Core chat logic: communicates with Ollama, streams responses, manages messages, errors, loading states and SYSTEM prompt logic |
| **types.ts** | Centralized TypeScript types shared across the project |



### Installation

Install dependencies:
```
npm install
```

Install PrismJS:
```
npm install prismjs
```

Install react - markdown
```
npm install react-markdown
```

Run development server:
```
npm run dev
```

Application runs at:
```
http://localhost:5173
```



