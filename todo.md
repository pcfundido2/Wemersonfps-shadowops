# Wemerson FPS — Shadow Ops | TODO

## Fase 1: Estrutura Base
- [x] Criar package.json com dependências (express, ws)
- [x] Criar .gitignore
- [x] Criar render.yaml para deploy automático
- [x] Criar README.md com instruções

## Fase 2: Server (server.js)
- [x] Implementar servidor Express com servir arquivos estáticos
- [x] Implementar WebSocket com ws library
- [x] Criar sistema de salas (máx 20 jogadores + 6 bots)
- [x] Implementar matchmaking automático
- [x] Criar protocolo de mensagens JSON (move, shoot, grenade, chat, ping)
- [x] Implementar sistema de bots com IA (roam, stalk, attack, flee)
- [x] Implementar máquina de estados dos bots
- [x] Implementar detecção de linha de visão (raycasting servidor)
- [x] Implementar sistema de granadas (FRAG, FLASH, GAS)
- [x] Implementar sistema de rounds (180s, respawn, placar)
- [x] Implementar rota /api/status para health check
- [x] Implementar sincronização de snapshots a 20Hz
- [x] Implementar detecção de hit server-side

## Fase 3: Frontend (index.html)
- [x] Detectar mobile vs desktop
- [x] Configurar Three.js r128 com cena, câmera, renderer
- [x] Criar mapa 56x56 com grid (paredes, crates, pilares)
- [x] Renderizar paredes com textura de tijolo (canvas)
- [x] Renderizar crates com textura de madeira
- [x] Renderizar pilares cilíndricos
- [x] Renderizar piso com textura de concreto quadriculado
- [x] Renderizar teto escuro com luzes emissivas
- [x] Criar caixa de som 3D no centro do mapa com LED pulsante
- [x] Implementar iluminação dinâmica com PointLights
- [x] Implementar sistema de partículas (sangue, faísca, explosão)
- [x] Criar 5 modelos de armas (Pistol, Shotgun, Sniper, SMG, Faca)
- [x] Implementar animações de armas (gun bob, recuo, ADS, muzzle flash)
- [x] Implementar sistema de disparo com raycasting cliente
- [x] Implementar sistema de granadas com física (FRAG, FLASH, GAS)
- [x] Implementar efeitos visuais de granadas (explosão, flash, gás)
- [x] Criar modelos 3D de jogadores remotos (torso, cabeça, membros)
- [x] Implementar HP bar e name tag sobre jogadores
- [x] Implementar agachamento visual (scale.y = 0.7)
- [x] Implementar sistema de áudio (Web Audio API)
- [x] Carregar áudios (wemerson.mp3, mercadolivre.mp3, música)
- [x] Implementar som espacial baseado em distância
- [x] Implementar música da soundbox com fade
- [x] Criar HUD completo (HP, armor, ammo, weapon selector)
- [x] Criar minimapa 150x150px com grid
- [x] Criar kill feed com animação slide-in
- [x] Criar crosshair dinâmico com spread
- [x] Criar hitmarker (X vermelho/dourado)
- [x] Criar overlay de scope para sniper
- [x] Criar indicador de caixa de som
- [x] Criar tela de morte com countdown de respawn
- [x] Criar tela de lobby/conexão
- [x] Criar scoreboard (Tab) com K/D/Pontos
- [x] Implementar chat (tecla T)
- [x] Implementar sistema de input (teclado + mouse)
- [x] Implementar pointer lock para câmera
- [x] Implementar movimento com colisão
- [x] Implementar pulo com gravidade
- [x] Implementar agachamento (toggle)
- [x] Implementar modo stealth (Shift)
- [x] Implementar seletor de armas (1-5, scroll)
- [x] Implementar seletor de granadas (G)
- [x] Implementar ADS/zoom
- [x] Implementar recarregar (R)
- [x] Implementar WebSocket client
- [x] Implementar sincronização de estado com servidor
- [x] Implementar recebimento de snapshots
- [x] Implementar interpolação de movimento de jogadores remotos

## Fase 4: PWA
- [x] Criar manifest.json com ícones e metadados
- [x] Gerar ícone 192x192 (crosshair neon verde)
- [x] Gerar ícone 512x512 (crosshair neon verde)
- [x] Criar service worker (sw.js) com cache strategy
- [x] Implementar controles touch (joysticks virtuais)
- [x] Implementar botões touch (atirar, pular, agachar, recarregar, granada, ADS)
- [x] Implementar detecção automática de dispositivo
- [x] Otimizar para mobile (pixel ratio, sombras, texturas)

## Fase 5: Testes e Ajustes
- [x] Testar servidor localmente (node server.js)
- [x] Testar conexão WebSocket
- [x] Testar 2+ abas se veem mutuamente
- [x] Testar movimento de bots
- [x] Testar ataque de bots
- [x] Testar granadas (3 tipos)
- [x] Testar caixa de som 3D
- [x] Testar música (fade ao aproximar)
- [x] Testar PWA (instalável)
- [x] Testar controles touch no mobile
- [x] Testar scoreboard
- [x] Testar chat
- [x] Testar sniper scope
- [x] Testar sistema de rounds

## Fase 6: Deploy
- [x] Criar repositório GitHub
- [x] Push do código
- [x] Criar projeto no Render.com
- [x] Conectar GitHub
- [x] Configurar build e start commands
- [x] Deploy e testar URL pública

## Fase 7: Entrega
- [x] Confirmar jogo funcionando online
- [x] Entregar link do jogo
- [x] Entregar link do repositório GitHub
- [x] Entregar instruções de instalação no celular

## Fase 8: Sistema de Áudio (Adicional)
- [x] Criar pasta /public/sounds/ com estrutura
- [x] Adicionar suporte para 3 áudios de jumpscare (audio1, audio2, audio3)
- [x] Adicionar suporte para 2 músicas de menu (musica1, musica2)
- [x] Implementar toque aleatório de jumpscare ao atacar
- [x] Implementar músicas do menu com volume baixo
- [x] Colocar musica1.mp3 na pasta de sounds
- [x] Criar README.md na pasta de sounds com instruções
