import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const server = createServer(app);
const wss = new WebSocketServer({ server });

// ═══ MAPA GRID ═══
const MAP_DATA = `
11111111111111111111111111111111111111111111111111111111
10000000000001000000000000010000100000000001001000000001
10000000000001000000000000010000100000000001000000000001
10020000000000000000020000000000000000200000000000020001
10000001110000000001110000000001110000000001110000000001
10000001000000000001000000000001000000000001000000000001
10000000000000000000000000000000000000000000000000000001
10000000000300000000000003000000000003000000000003000001
11100020000000000002200000000002200000000000020000011101
10000020000000000002200000000002200000000000020000000001
10000000000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000000000001
10000111000000000111000000000000111000000000111000000001
10000100000000000100000000000000100000000000100000000001
10000100000000000100000000000000100000000000100000000001
10000000000000000000000000000000000000000000000000000001
10000000200000002000000020000000200000002000000020000001
10000000000000000000000000000000000000000000000000000001
10300000000000000000000000000000000000000000000000003001
11110000000000000000000000000000000000000000000000011101
10000000000000000000000000000000000000000000000000000001
10000000200000002000000020000000200000002000000020000001
10000000000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000000000001
10000111000000000111000000000000111000000000111000000001
10000100000000000100000000000000100000000000100000000001
10000100000000000100000000000000100000000000100000000001
10000000000000000000000000000000000000000000000000000001
10000000000300000000000003000000000003000000000003000001
11100020000000000002200000000002200000000000020000011101
10000020000000000002200000000002200000000000020000000001
10000000000000000000000000000000000000000000000000000001
10000000000000000000000000000000000000000000000000000001
10000001110000000001110000000001110000000001110000000001
10000001000000000001000000000001000000000001000000000001
10020000000000000000020000000000000000200000000000020001
10000000000001000000000000010000100000000001000000000001
10000000000001000000000000010000100000000001001000000001
11111111111111111111111111111111111111111111111111111111
`.trim().split('\n').map(line => line.split('').map(Number));

const CELL = 2;
const MW = MAP_DATA[0].length;
const MH = MAP_DATA.length;

function isBlocked(wx, wz) {
  const gx = Math.floor(wx / CELL);
  const gz = Math.floor(wz / CELL);
  if (gx < 0 || gz < 0 || gx >= MW || gz >= MH) return true;
  return MAP_DATA[gz][gx] !== 0;
}

function canSee(botX, botZ, targetX, targetZ) {
  const steps = 16;
  const dx = (targetX - botX) / steps;
  const dz = (targetZ - botZ) / steps;
  for (let i = 1; i < steps; i++) {
    if (isBlocked(botX + dx * i, botZ + dz * i)) return false;
  }
  return true;
}

// ═══ GAME STATE ═══
const rooms = new Map();
let roomIdCounter = 0;

class Player {
  constructor(id, name, isBot = false) {
    this.id = id;
    this.name = name || `Player${id}`;
    this.isBot = isBot;
    this.team = isBot ? 1 : (Math.random() < 0.5 ? 0 : 1);
    this.color = isBot ? '#ff6600' : (this.team === 0 ? '#4488ff' : '#ff8800');
    this.weapon = isBot ? 4 : 0;
    this.x = Math.random() * 50 + 3;
    this.z = Math.random() * 50 + 3;
    this.yaw = Math.random() * Math.PI * 2;
    this.pitch = 0;
    this.hp = 100;
    this.armor = isBot ? 75 : 0;
    this.alive = true;
    this.crouching = false;
    this.kills = 0;
    this.deaths = 0;
    this.score = 0;

    if (isBot) {
      this._state = 'roam';
      this._target = null;
      this._tx = this.x;
      this._tz = this.z;
      this._stateT = 0;
      this._attackCD = 0;
      this._audioCD = 0;
      this._crouch = true;
    }
  }
}

class Room {
  constructor(id) {
    this.id = id;
    this.players = new Map();
    this.bots = [];
    this.roundTime = 180;
    this.roundActive = false;
    this.scores = { 0: 0, 1: 0 };
    this.lastTick = Date.now();
    this.tick = 0;
    this.playerIdCounter = 0;

    this.createBots();
    this.startRound();
  }

  createBots() {
    for (let i = 0; i < 6; i++) {
      const bot = new Player(`bot${i}`, `Bot${i}`, true);
      this.bots.push(bot);
    }
  }

  startRound() {
    this.roundTime = 180;
    this.roundActive = true;
    this.tick = 0;
    this.players.forEach(p => {
      p.hp = 100;
      p.armor = 0;
      p.alive = true;
      p.x = Math.random() * 50 + 3;
      p.z = Math.random() * 50 + 3;
    });
    this.bots.forEach(b => {
      b.hp = 100;
      b.armor = 75;
      b.alive = true;
      b.x = Math.random() * 50 + 3;
      b.z = Math.random() * 50 + 3;
    });
  }

  updateBots(dt) {
    this.bots.forEach(bot => {
      if (!bot.alive) return;

      bot._stateT -= dt;
      bot._attackCD -= dt;
      bot._audioCD -= dt;

      const allPlayers = Array.from(this.players.values()).concat(this.bots);
      const visiblePlayers = allPlayers.filter(p => {
        if (p.id === bot.id || !p.alive) return false;
        const dist = Math.hypot(p.x - bot.x, p.z - bot.z);
        return dist < 12 && canSee(bot.x, bot.z, p.x, p.z);
      });

      if (bot._state === 'roam') {
        if (visiblePlayers.length > 0) {
          bot._state = 'stalk';
          bot._target = visiblePlayers[0];
          bot._stateT = 5;
        } else {
          if (bot._stateT <= 0) {
            bot._tx = Math.random() * 50 + 3;
            bot._tz = Math.random() * 50 + 3;
            bot._stateT = 5;
          }
          const dx = bot._tx - bot.x;
          const dz = bot._tz - bot.z;
          const dist = Math.hypot(dx, dz);
          if (dist > 0.5) {
            const speed = 1.1 * dt;
            bot.x += (dx / dist) * speed;
            bot.z += (dz / dist) * speed;
            bot.yaw = Math.atan2(dx, dz);
          }
        }
      } else if (bot._state === 'stalk') {
        if (!bot._target || !bot._target.alive) {
          bot._state = 'roam';
          bot._target = null;
        } else {
          const dx = bot._target.x - bot.x;
          const dz = bot._target.z - bot.z;
          const dist = Math.hypot(dx, dz);
          bot.yaw = Math.atan2(dx, dz);

          if (dist < 6 && bot._audioCD <= 0) {
            this.broadcastMessage({
              type: 'bot_audio',
              botId: bot.id,
              audio: 'wemerson',
              x: bot.x,
              z: bot.z
            });
            bot._audioCD = 3;
          }

          if (dist < 2) {
            bot._state = 'attack';
            bot._stateT = 3;
          } else if (!canSee(bot.x, bot.z, bot._target.x, bot._target.z)) {
            bot._state = 'roam';
            bot._target = null;
          } else {
            const speed = 1.6 * dt;
            bot.x += (dx / dist) * speed;
            bot.z += (dz / dist) * speed;
          }
        }
      } else if (bot._state === 'attack') {
        if (!bot._target || !bot._target.alive || bot._stateT <= 0) {
          bot._state = 'stalk';
          bot._stateT = 2;
        } else {
          const dx = bot._target.x - bot.x;
          const dz = bot._target.z - bot.z;
          const dist = Math.hypot(dx, dz);
          bot.yaw = Math.atan2(dx, dz);

          if (dist < 2.3 && bot._attackCD <= 0) {
            const damage = 50 + Math.random() * 25;
            this.handleShot(bot.id, bot._target.id, damage, 4, bot.x, bot.z);
            bot._attackCD = 0.85;
          } else if (dist >= 2.3 && bot._attackCD <= 0) {
            this.broadcastMessage({
              type: 'bot_audio',
              botId: bot.id,
              audio: 'mercadolivre',
              x: bot.x,
              z: bot.z
            });
            bot._state = 'stalk';
            bot._audioCD = 2;
          }

          const speed = 2.4 * dt;
          bot.x += (dx / dist) * speed;
          bot.z += (dz / dist) * speed;
        }
      } else if (bot._state === 'flee') {
        if (bot.hp >= 28) {
          bot._state = 'roam';
        } else {
          const speed = 2.8 * dt;
          bot.x += Math.cos(bot.yaw) * speed;
          bot.z += Math.sin(bot.yaw) * speed;
        }
      }

      if (bot.hp < 28 && bot._state !== 'flee') {
        bot._state = 'flee';
        this.broadcastMessage({
          type: 'bot_audio',
          botId: bot.id,
          audio: 'mercadolivre',
          x: bot.x,
          z: bot.z
        });
      }
    });
  }

  handleShot(shooterId, targetId, damage, weapon, sx, sz) {
    const target = this.players.get(targetId) || this.bots.find(b => b.id === targetId);
    if (!target || !target.alive) return;

    let actualDamage = damage;
    if (target.armor > 0) {
      const absorbed = Math.min(target.armor, damage * 0.55);
      target.armor = Math.max(0, target.armor - absorbed);
      actualDamage -= absorbed;
    }

    target.hp = Math.max(0, target.hp - actualDamage);
    const killed = target.hp <= 0;

    if (killed) {
      target.alive = false;
      target.deaths++;
      const shooter = this.players.get(shooterId) || this.bots.find(b => b.id === shooterId);
      if (shooter) {
        shooter.kills++;
        shooter.score += 300;
      }

      this.broadcastMessage({
        type: 'player_killed',
        killerId: shooterId,
        killerName: shooter?.name || 'Unknown',
        victimId: targetId,
        victimName: target.name,
        scores: this.scores
      });

      setTimeout(() => {
        if (target.alive === false) {
          target.alive = true;
          target.hp = 100;
          target.armor = 0;
          target.x = Math.random() * 50 + 3;
          target.z = Math.random() * 50 + 3;
          this.broadcastMessage({
            type: 'player_respawned',
            id: targetId,
            x: target.x,
            y: 0,
            z: target.z
          });
        }
      }, 3000);
    }

    this.broadcastMessage({
      type: 'hit_confirmed',
      targetId,
      damage: actualDamage,
      killed
    });
  }

  broadcastMessage(msg) {
    this.players.forEach(p => {
      if (p.ws && p.ws.readyState === 1) {
        p.ws.send(JSON.stringify(msg));
      }
    });
  }

  tick20Hz() {
    const now = Date.now();
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    this.tick++;

    if (this.roundActive) {
      this.roundTime -= dt;
      if (this.roundTime <= 0) {
        this.roundActive = false;
        this.broadcastMessage({
          type: 'round_end',
          reason: 'time',
          scores: this.scores
        });
        setTimeout(() => this.startRound(), 6000);
      }
    }

    this.updateBots(dt);

    const snapshot = {
      type: 'world_snapshot',
      players: Array.from(this.players.values()).map(p => ({
        id: p.id,
        name: p.name,
        x: p.x,
        y: 0,
        z: p.z,
        yaw: p.yaw,
        pitch: p.pitch,
        hp: p.hp,
        armor: p.armor,
        alive: p.alive,
        crouching: p.crouching,
        weapon: p.weapon,
        team: p.team,
        color: p.color
      })).concat(this.bots.map(b => ({
        id: b.id,
        name: b.name,
        x: b.x,
        y: 0,
        z: b.z,
        yaw: b.yaw,
        pitch: 0,
        hp: b.hp,
        armor: b.armor,
        alive: b.alive,
        crouching: b._crouch,
        weapon: b.weapon,
        team: b.team,
        color: b.color,
        isBot: true
      }))),
      timeLeft: Math.max(0, this.roundTime),
      tick: this.tick
    };

    this.broadcastMessage(snapshot);
  }
}

// ═══ EXPRESS ROUTES ═══
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
  const totalPlayers = Array.from(rooms.values()).reduce((sum, r) => sum + r.players.size, 0);
  const totalRooms = rooms.size;
  res.json({
    status: 'online',
    playersOnline: totalPlayers,
    activeRooms: totalRooms,
    uptime: process.uptime()
  });
});

// ═══ WEBSOCKET ═══
wss.on('connection', (ws) => {
  let player = null;
  let room = null;

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === 'set_name') {
        if (!player) {
          let targetRoom = null;
          for (const r of rooms.values()) {
            if (r.players.size < 20) {
              targetRoom = r;
              break;
            }
          }
          if (!targetRoom) {
            targetRoom = new Room(roomIdCounter++);
            rooms.set(targetRoom.id, targetRoom);
          }

          room = targetRoom;
          player = new Player(room.playerIdCounter++, msg.name);
          player.ws = ws;
          room.players.set(player.id, player);

          ws.send(JSON.stringify({
            type: 'connected',
            playerId: player.id,
            roomId: room.id,
            maxPlayers: 20
          }));

          room.broadcastMessage({
            type: 'player_joined',
            id: player.id,
            name: player.name,
            team: player.team,
            color: player.color
          });
        }
      } else if (msg.type === 'move' && player && room) {
        player.x = msg.x;
        player.z = msg.z;
        player.yaw = msg.yaw;
        player.pitch = msg.pitch;
        player.weapon = msg.weapon;
        player.crouching = msg.crouching;
      } else if (msg.type === 'shoot' && player && room) {
        room.handleShot(player.id, msg.targetId, msg.damage, msg.weapon, msg.x, msg.z);
      } else if (msg.type === 'grenade' && player && room) {
        room.broadcastMessage({
          type: 'grenade_thrown',
          throwerId: player.id,
          grenaType: msg.grenaType,
          x: msg.x,
          y: msg.y,
          z: msg.z,
          vx: msg.vx,
          vy: msg.vy,
          vz: msg.vz
        });
      } else if (msg.type === 'chat' && player && room) {
        room.broadcastMessage({
          type: 'chat',
          id: player.id,
          name: player.name,
          team: player.team,
          text: msg.text
        });
      } else if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', t: msg.t }));
      }
    } catch (e) {
      console.error('Message error:', e);
    }
  });

  ws.on('close', () => {
    if (player && room) {
      room.players.delete(player.id);
      room.broadcastMessage({
        type: 'player_left',
        id: player.id
      });

      if (room.players.size === 0) {
        rooms.delete(room.id);
      }
    }
  });
});

// ═══ GAME LOOP ═══
setInterval(() => {
  rooms.forEach(room => room.tick20Hz());
}, 50);

// ═══ START SERVER ═══
server.listen(PORT, () => {
  console.log(`🎮 Wemerson FPS server running on http://localhost:${PORT}/`);
});
