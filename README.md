# Wemerson FPS — Shadow Ops

**FPS Multiplayer Online | pcfs-Studio**

Um jogo tático em primeira pessoa totalmente funcional que roda no navegador e pode ser instalado como PWA no celular.

## 🎮 Jogar Online

**[Link do Jogo]** ← Será preenchido após deploy no Render.com

## 📱 Instalar no Celular (PWA)

1. Abrir o link no **Chrome Android** ou **Safari iOS**
2. Menu ⋮ (Android) ou Compartilhar (iOS) → "Adicionar à tela inicial"
3. Pronto! O jogo funciona como app nativo, sem precisar de loja de apps

## 🎯 Controles

### Desktop (Teclado + Mouse)
- **W/A/S/D** — Mover
- **Mouse** — Mirar (pointer lock)
- **Click Esquerdo** — Atirar
- **Click Direito** — ADS / Zoom
- **R** — Recarregar
- **Espaço** — Pular
- **Ctrl** — Agachar (segurar)
- **Shift** — Modo Stealth
- **1-5** — Trocar arma
- **G** — Lançar granada
- **Tab** — Scoreboard
- **T** — Chat

### Mobile (Touch)
- **Joystick Esquerdo** — Mover
- **Joystick Direito** — Câmera
- **Botão Vermelho** — Atirar
- **Botão Verde** — Pular
- **Botão Cinza** — Agachar
- **Botão Laranja** — Recarregar / Granada

## 🕹️ Gameplay

- **Até 20 jogadores humanos** por sala + **6 bots com IA**
- **3 minutos** por round com placar CT vs T
- **5 armas** balanceadas: Pistola, Shotgun, Sniper, SMG, Faca
- **3 tipos de granadas**: FRAG (explosiva), FLASH (cegueira), GÁS (dano por área)
- **Bots inteligentes** que rodam, perseguem, atacam e fogem
- **Mapa tático** inspirado em CS2 com cobertura estratégica
- **Caixa de som 3D** no centro do mapa com música espacial
- **Sistema de HP e armadura** com dano realista

## 🛠️ Stack Tecnológico

- **Frontend**: HTML5 + CSS3 + JavaScript vanilla + **Three.js r128** (3D)
- **Backend**: **Node.js 18+** + Express 4 + **WebSocket (ws)**
- **PWA**: manifest.json + Service Worker + ícones 192x512
- **Áudio**: Web Audio API com som espacial
- **Hosting**: Render.com (servidor) + GitHub (código)

## 🚀 Executar Localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Abrir no navegador
# http://localhost:3000
```

## 📋 Checklist de Funcionalidades

- ✅ Renderização 3D com Three.js
- ✅ Mapa tático 56x56 com colisão
- ✅ 5 armas com modelos 3D detalhados
- ✅ 3 tipos de granadas com física
- ✅ Multiplayer WebSocket em tempo real
- ✅ 6 bots com IA sofisticada
- ✅ HUD tático completo (HP, ammo, minimapa)
- ✅ Áudio espacial (Web Audio API)
- ✅ Controles touch para mobile
- ✅ PWA instalável
- ✅ Sistema de rounds com placar
- ✅ Chat e scoreboard

## 📝 Notas de Desenvolvimento

### Arquivos de Áudio

O jogo espera os seguintes arquivos em `public/sounds/`:
- `wemerson.mp3` — Som do bot ao se aproximar
- `mercadolivre.mp3` — Som do bot ao errar/levar tiro
- `mercadolivremusic.mp3` — Música da caixa de som 3D

Se os arquivos não existirem, o jogo continua funcionando normalmente (sem som).

### Servidor WebSocket

O servidor escuta na porta `process.env.PORT || 3000` e:
- Serve arquivos estáticos de `public/`
- Gerencia salas com até 20 jogadores + 6 bots
- Executa IA dos bots a 20Hz
- Sincroniza estado a 20Hz para todos os clientes
- Detecta hits server-side para anti-cheat

### Mapa

O mapa é uma grid 56x56 onde:
- `1` = Parede sólida
- `2` = Caixa (cobertura)
- `3` = Pilar cilíndrico
- `0` = Área aberta

## 👨‍💻 Desenvolvido por

**pcfs-Studio**

---

**Versão 2.0** — Implementação completa com todas as funcionalidades
