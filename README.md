# Nexora — Local AI Coding Assistant

Nexora is a lightweight local coding assistant built with React, TypeScript, and Vite.  
It communicates with Ollama models running locally (such as llama3.2:3b) and provides a clean, responsive chat interface with syntax-highlighted code blocks and streaming responses.

This project is fully local and does not rely on any external APIs.

## Features

- Local AI chat powered by the Ollama API
- Streaming token responses
- Syntax highlighting using Prism.js
- Light and dark theme support
- Settings modal (Account and Help tabs)
- Copy-to-clipboard for code blocks
- Fully local processing

## Project Structure

```
NEXORA/
├── favicon/                 # App icons
├── node_modules/            # Installed dependencies
├── src/
│   ├── App.tsx              # Main UI: chat logic, rendering, streaming, theme management
│   ├── main.tsx             # React entry point, mounts App into index.html
│   ├── prism.d.ts           # Type declarations for Prism.js
│   ├── components/
│   │   └── settingsModal.tsx # Settings modal component
│   ├── styles/
│       ├── index.css        # Global application styles
│       └── settings.css     # Modal-specific styles
├── index.html               # Base HTML template used by Vite
├── package.json             # Dependencies and script definitions
├── package-lock.json        # Locked dependency versions
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md                # Documentation
```

## How It Works

### main.tsx  
Initializes React and renders the App component inside the root DOM element defined in index.html.

### App.tsx  
The central part of the application responsible for:  
- Managing chat messages  
- Parsing and rendering code blocks  
- Streaming responses from Ollama  
- Handling theme switching  
- Displaying and controlling the settings modal  
- Error handling  

### settingsModal.tsx  
A standalone modal component that provides:  
- Account tab with a demo password change form  
- Help tab with usage instructions  
- Local state reset on close  
- Modal-specific layout and style separation

### index.css  
Contains global styles for layout, typography, chat UI, message bubbles, spacing, and theming.

### settings.css  
Contains styles that apply only to the settings modal component.

## Setup and Development

### Requirements

- Node.js 18 or newer
- Ollama installed and running
- A local model (for example: `ollama pull llama3.2:3b`)

### Installation

Install dependencies:
```
npm install
```

Install PrismJS:
```
npm install prismjs
```

Run development server:
```
npm run dev
```

Application runs at:
```
http://localhost:5173
```
