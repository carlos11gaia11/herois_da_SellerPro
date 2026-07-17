(() => {
  'use strict';

  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const menu = document.getElementById('menu');
  const message = document.getElementById('message');
  const heroCards = document.getElementById('heroCards');
  const startBtn = document.getElementById('startBtn');
  const soundBtn = document.getElementById('soundBtn');
  const continueBtn = document.getElementById('continueBtn');
  const backMenuBtn = document.getElementById('backMenuBtn');
  const messageTitle = document.getElementById('messageTitle');
  const messageText = document.getElementById('messageText');
  const statusBar = document.getElementById('statusBar');
  const toast = document.getElementById('toast');
  const codeInput = document.getElementById('codeInput');
  const codeBtn = document.getElementById('codeBtn');
  const creativePanel = document.getElementById('creativePanel');
  const creativeApplyBtn = document.getElementById('creativeApplyBtn');

  const W = canvas.width;
  const H = canvas.height;
  const GRAVITY = 0.72;
  const FRICTION = 0.82;
  const LEVEL_SCREENS = 10;
  const LEVEL_WIDTH = W * LEVEL_SCREENS;
  const FLOOR_Y = 486;
  const FINAL_SCREEN_X = LEVEL_WIDTH - W;
  const BOSS_ARENA_PADDING = 80;


  const ASSET_PATHS = {
    heroes: 'assets/img/heroes/',
    bosses: 'assets/img/bosses/',
    bossSkills: 'assets/img/boss-skills/',
    sounds: 'assets/audio/sons/',
    falas: 'assets/audio/falas/'
  };

  const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
  const rand = (min,max)=>Math.random()*(max-min)+min;
  const rectsOverlap = (a,b)=> a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  const center = e => ({x:e.x+e.w/2,y:e.y+e.h/2});
  const distance = (a,b)=>Math.hypot((a.x+a.w/2)-(b.x+b.w/2),(a.y+a.h/2)-(b.y+b.h/2));

  const heroData = [
    {name:'Gustavo', img:ASSET_PATHS.heroes+'heroi1.png', icon:'☀️', color:'#ffb703', desc:'The Faz tudo', hp:120, dmg:18, speed:4.3, mana:100, manaRegen:.42, hpRegen:.045, skills:[{name:'Raio Seller', type:'bolt', cost:18, cd:520},{name:'Cura Pro', type:'heal', cost:32, cd:3600}]},
    {name:'Gabriel', img:ASSET_PATHS.heroes+'heroi2.png', icon:'🛡️', color:'#fb5607', desc:'Mega Estagiario', hp:170, dmg:16, speed:3.55, mana:80, manaRegen:.32, hpRegen:.055, skills:[{name:'Investida', type:'dash', cost:20, cd:1200},{name:'Escudo', type:'shield', cost:35, cd:5200}]},
    {name:'Leonardo', img:ASSET_PATHS.heroes+'heroi3.png', icon:'🌙', color:'#8b5cf6', desc:'Messi careca', hp:95, dmg:22, speed:5.25, mana:115, manaRegen:.52, hpRegen:.025, skills:[{name:'Kunai', type:'kunai', cost:14, cd:360},{name:'Blink', type:'blink', cost:28, cd:1700}]},
    {name:'Melissa', img:ASSET_PATHS.heroes+'heroi4.png', icon:'🔮', color:'#38bdf8', desc:'ViXi', hp:105, dmg:19, speed:4.05, mana:155, manaRegen:.75, hpRegen:.02, skills:[{name:'Orbe', type:'orb', cost:22, cd:610},{name:'Congelar', type:'freeze', cost:44, cd:4500}]},
    {name:'Silas', img:ASSET_PATHS.heroes+'heroi5.png', icon:'🔥', color:'#ef4444', desc:'Direita vive', hp:105, dmg:26, speed:4.1, mana:120, manaRegen:.5, hpRegen:.018, skills:[{name:'Bola de Fogo', type:'fireball', cost:22, cd:520},{name:'Explosão', type:'nova', cost:55, cd:5200}]},
    {name:'Felipe', img:ASSET_PATHS.heroes+'heroi6.png', icon:'🏹', color:'#22c55e', desc:'Nossa Lobo mau', hp:112, dmg:20, speed:4.55, mana:110, manaRegen:.48, hpRegen:.035, skills:[{name:'Flecha', type:'arrow', cost:12, cd:300},{name:'Armadilha', type:'trap', cost:30, cd:2500}]},
    {name:'Carlos', img:ASSET_PATHS.heroes+'heroi7.png', icon:'☠️', color:'#06b6d4', desc:'Necromante tecnológico', hp:120, dmg:30, speed:5.35, mana:100, manaRegen:1.05, hpRegen:.08, skills:[{name:'Laser', type:'laser', cost:24, cd:820},{name:'Drone', type:'drone', cost:46, cd:6200},{name:'Necromancia', type:'necromancy', cost:92, cd:9000},{name:'Coordenada', type:'coordinate', cost:58, cd:4600}]},
    {name:'Priscila', img:ASSET_PATHS.heroes+'heroi8.png', icon:'🪨', color:'#9ca3af', desc:'Bora pra academia?', hp:185, dmg:15, speed:3.25, mana:90, manaRegen:.36, hpRegen:.07, skills:[{name:'Rocha', type:'rock', cost:18, cd:740},{name:'Terremoto', type:'quake', cost:48, cd:5800}]},
    {name:'Jose', img:ASSET_PATHS.heroes+'heroi9.png', icon:'🌪️', color:'#84cc16', desc:'ALA WAKIBAAA', hp:98, dmg:18, speed:6.05, mana:130, manaRegen:.6, hpRegen:.1, skills:[{name:'Rajada', type:'gust', cost:16, cd:450},{name:'Super Pulo', type:'highjump', cost:26, cd:2200}]},
    {name:'Daniella', img:ASSET_PATHS.heroes+'heroi10.png', icon:'🦇', color:'#64748b', desc:'👀👀😃', hp:110, dmg:23, speed:4.7, mana:115, manaRegen:.55, hpRegen:.025, skills:[{name:'Sombra', type:'shadow', cost:20, cd:520},{name:'Vampiro', type:'vampire', cost:42, cd:4700}]}
  ];

  const secretHeroData = [
    {name:'João', secret:true, img:ASSET_PATHS.heroes+'heroi20.png', icon:'⏳', color:'#7dd3fc', desc:'Lendário do tempo', hp:820, dmg:72, speed:7.2, mana:520, manaRegen:2.4, hpRegen:.18, skills:[{name:'Congelar Tempo', type:'timeStop', cost:80, cd:8200},{name:'Voltar 5s', type:'rewind', cost:110, cd:12000},{name:'Cometa', type:'comet', cost:95, cd:5200},{name:'Invencível', type:'invincibility', cost:120, cd:15000}]},
    {name:'Gabs', secret:true, img:ASSET_PATHS.heroes+'heroi21.png', icon:'👁️', color:'#a78bfa', desc:'Assassina invisível', hp:620, dmg:86, speed:8.6, mana:430, manaRegen:2.1, hpRegen:.13, skills:[{name:'Invisibilidade', type:'invisibility', cost:58, cd:6500},{name:'Corte Samurai', type:'samurai', cost:55, cd:3100},{name:'Clone', type:'clone', cost:70, cd:7000},{name:'Bomba Sombra', type:'bomb', cost:72, cd:5200}]},
    {name:'André', secret:true, img:ASSET_PATHS.heroes+'heroi22.png', icon:'💢', color:'#ef4444', desc:'Fica absurdo com pouca vida', hp:1250, dmg:64, speed:6.6, mana:360, manaRegen:1.8, hpRegen:.1, passive:'berserker', skills:[{name:'Modo Berserker', type:'berserk', cost:60, cd:7600},{name:'Roubo Vital', type:'vampire', cost:62, cd:4200},{name:'Reviver', type:'revive', cost:120, cd:16000},{name:'Explodir Tela', type:'screenExplosion', cost:120, cd:9000}]},
    {name:'Lucas', secret:true, img:ASSET_PATHS.heroes+'heroi23.png', icon:'🕳️', color:'#8b5cf6', desc:'Dobra o mapa inteiro', hp:700, dmg:78, speed:6.9, mana:560, manaRegen:2.6, hpRegen:.14, skills:[{name:'Buraco Negro', type:'blackhole', cost:90, cd:6800},{name:'Cometa do Céu', type:'cometRain', cost:115, cd:8500},{name:'Raio em Cadeia', type:'chainLightning', cost:72, cd:3700},{name:'Campo Zero', type:'timeStop', cost:95, cd:9000}]},
    {name:'pollyana', secret:true, img:ASSET_PATHS.heroes+'heroi24.png', icon:'🐉', color:'#f97316', desc:'Vira dragão de guerra', hp:1080, dmg:82, speed:7.4, mana:470, manaRegen:2.2, hpRegen:.16, skills:[{name:'Virar Dragão', type:'dragon', cost:95, cd:12000},{name:'Chuva de Fogo', type:'cometRain', cost:105, cd:7800},{name:'Bomba', type:'bomb', cost:68, cd:4800},{name:'Invencível', type:'invincibility', cost:115, cd:14000}]},
    {name:'Saulo', secret:true, img:ASSET_PATHS.heroes+'heroi25.png', icon:'♾️', color:'#22c55e', desc:'Modo lendário criativo', hp:900, dmg:90, speed:8.1, mana:620, manaRegen:3.0, hpRegen:.2, skills:[{name:'Explodir Tudo', type:'screenExplosion', cost:120, cd:8200},{name:'Buraco Negro', type:'blackhole', cost:92, cd:6200},{name:'Coordenada', type:'coordinate', cost:62, cd:4300},{name:'Clone Supremo', type:'clone', cost:82, cd:6200}]}
  ];
  heroData.push(...secretHeroData);

  const monsterTypes = [
    {name:'Goomba Fiscal', color:'#a16207', hp:34, dmg:12, speed:1.2, jump:false, shoot:false, points:20},
    {name:'Cobrador Saltante', color:'#16a34a', hp:42, dmg:14, speed:1.45, jump:true, shoot:false, points:26},
    {name:'Atirador DBA', color:'#0ea5e9', hp:38, dmg:12, speed:1.1, shoot:true, projectile:'water', rate:1500, points:32},
    {name:'Mago do Atraso', color:'#9333ea', hp:52, dmg:16, speed:1.05, shoot:true, projectile:'magic', rate:1250, points:42},
    {name:'Tanque de Caixa', color:'#78716c', hp:96, dmg:19, speed:.86, shoot:false, points:55},
    {name:'Morcego Ads', color:'#475569', hp:38, dmg:13, speed:1.75, flying:true, shoot:true, projectile:'spark', rate:1700, points:62},
    {name:'Robô Cache', color:'#0891b2', hp:74, dmg:18, speed:1.55, shoot:true, projectile:'bolt', rate:1100, points:74},
    {name:'Ninja Chargeback', color:'#111827', hp:58, dmg:24, speed:2.15, dash:true, shoot:false, points:88},
    {name:'Dragão Prime', color:'#dc2626', hp:135, dmg:24, speed:1.35, flying:true, shoot:true, projectile:'fire', rate:900, points:120},
    {name:'Executor Marketplace', color:'#be123c', hp:170, dmg:30, speed:1.55, shoot:true, projectile:'dark', rate:760, points:180}
  ];

  const powerupTypes = [
    {type:'heart', name:'Vida +35', icon:'❤', color:'#ef4444'},
    {type:'mana', name:'Mana +45', icon:'✦', color:'#38bdf8'},
    {type:'maxHp', name:'Vida máxima +15', icon:'⬆', color:'#f97316'},
    {type:'maxMana', name:'Mana máxima +15', icon:'◆', color:'#60a5fa'},
    {type:'damage', name:'Arma +4 dano', icon:'⚔', color:'#facc15'},
    {type:'speed', name:'Botas + velocidade', icon:'»', color:'#22c55e'},
    {type:'regen', name:'Regeneração +', icon:'♻', color:'#84cc16'},
    {type:'shield', name:'Escudo 10s', icon:'⬡', color:'#a855f7'}
  ];

  const loadImage = src => {
    const img = new Image();
    img.src = src;
    return img;
  };

  const heroImages = heroData.map(h=>loadImage(h.img));
  const bossImage = loadImage(ASSET_PATHS.bosses+'boss1.png');
  const superBossImage = loadImage(ASSET_PATHS.bosses+'super_boss.png');
  const bossAbilityImages = Array.from({length:7},(_,i)=>loadImage(`${ASSET_PATHS.bossSkills}boss_Habilidade${i+1}.png`));

  const superBossSkills = [
    {id:1, name:'Chuva de Caixas', line:'Receba estas caixas expressas!', sound:'boxes'},
    {id:2, name:'Rajada de Moedas', line:'Vou cobrar cada moeda dessa luta!', sound:'coins'},
    {id:3, name:'Salto Esmagador', line:'Vou cair em cima de você!', sound:'jump'},
    {id:4, name:'Corrida Brutal', line:'Ninguém passa pelo marketplace!', sound:'dash'},
    {id:5, name:'Caminhão Seller', line:'Caminhão na rota. Sai da frente!', sound:'truck'},
    {id:6, name:'Buraco Negro do Boss', line:'Vou puxar tudo para o centro!', sound:'flip'},
    {id:7, name:'Chuva Final', line:'Agora o céu vai cair!', sound:'upside'}
  ];

  let selectedHero = 0;
  let state = 'menu';
  let levelIndex = 0;
  let player = null;
  let cameraX = 0;
  let platforms = [];
  let enemies = [];
  let projectiles = [];
  let powerups = [];
  let particles = [];
  let texts = [];
  let traps = [];
  let drones = [];
  let allies = [];
  let areaEffects = [];
  let graveyard = [];
  let timeHistory = [];
  let timeStopTimer = 0;
  let keys = {};
  let last = 0;
  let score = 0;
  let kills = 0;
  let paused = false;
  let muted = false;
  let shake = 0;
  let overlayAlpha = 0;
  let sceneEffects = {flipTimer:0, upsideDownTimer:0, flash:0};
  let bossSpeech = {text:'', life:0, skill:''};
  let secretUnlocked = localStorage.getItem('sellerpro_secret_heroes') === '1';
  let creativeMode = localStorage.getItem('sellerpro_creative_mode') === '1';
  const SKILL_KEYS = ['KeyK','KeyL','KeyI','KeyO'];
  const SKILL_LABELS = ['K','L','I','O'];

  const audio = {
    ctx:null,
    cache:{},
    files:{
      start: ASSET_PATHS.sounds+'iniciar.mp3',
      jump: ASSET_PATHS.sounds+'pulo.mp3',
      hit: ASSET_PATHS.sounds+'dano.mp3',
      coin: ASSET_PATHS.sounds+'coleta.mp3',
      skill: ASSET_PATHS.sounds+'habilidade.mp3',
      win: ASSET_PATHS.sounds+'vitoria.mp3',
      boss: ASSET_PATHS.sounds+'boss.mp3',
      bossAbility1: ASSET_PATHS.sounds+'boss_habilidade_01.mp3',
      bossAbility2: ASSET_PATHS.sounds+'boss_habilidade_02.mp3',
      bossAbility3: ASSET_PATHS.sounds+'boss_habilidade_03.mp3',
      bossAbility4: ASSET_PATHS.sounds+'boss_habilidade_04.mp3',
      bossAbility5: ASSET_PATHS.sounds+'boss_habilidade_05.mp3',
      bossAbility6: ASSET_PATHS.sounds+'boss_habilidade_06.mp3',
      bossAbility7: ASSET_PATHS.sounds+'boss_habilidade_07.mp3'
    },
    lines:{
      1: ASSET_PATHS.falas+'fala_boss_01.mp3',
      2: ASSET_PATHS.falas+'fala_boss_02.mp3',
      3: ASSET_PATHS.falas+'fala_boss_03.mp3',
      4: ASSET_PATHS.falas+'fala_boss_04.mp3',
      5: ASSET_PATHS.falas+'fala_boss_05.mp3',
      6: ASSET_PATHS.falas+'fala_boss_06.mp3',
      7: ASSET_PATHS.falas+'fala_boss_07.mp3'
    },
    init(){
      if(!this.ctx){
        try{ this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ this.ctx = null; }
      }
      this.preload();
    },
    preload(){
      if(typeof Audio === 'undefined') return;
      const sources = [...Object.values(this.files), ...Object.values(this.lines)];
      sources.forEach(src=>{
        if(!this.cache[src]){
          const a = new Audio(src);
          a.preload = 'auto';
          this.cache[src] = a;
        }
      });
    },
    play(src, volume=.55){
      if(muted || !src || typeof Audio === 'undefined') return false;
      this.preload();
      const base = this.cache[src] || new Audio(src);
      this.cache[src] = base;
      const a = base.cloneNode(true);
      a.volume = volume;
      const p = a.play();
      if(p && typeof p.catch === 'function') p.catch(()=>{});
      return true;
    },
    tone(freq=440, dur=.08, type='square', gain=.045){
      if(muted) return;
      if(!this.ctx){
        try{ this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ this.ctx = null; }
      }
      if(!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type; osc.frequency.setValueAtTime(freq,t);
      g.gain.setValueAtTime(gain,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      osc.connect(g); g.connect(this.ctx.destination);
      osc.start(t); osc.stop(t+dur);
    },
    chord(freqs, dur=.13, type='sine', gain=.035){ freqs.forEach((f,i)=>setTimeout(()=>this.tone(f,dur,type,gain),i*35)); },
    start(){ if(!this.play(this.files.start,.55)) this.chord([330,440,660],.12,'triangle',.04); },
    jump(){ if(!this.play(this.files.jump,.45)) this.tone(520,.08,'triangle',.035); },
    hit(){ if(!this.play(this.files.hit,.5)) this.chord([170,120],.08,'sawtooth',.05); },
    coin(){ if(!this.play(this.files.coin,.45)) this.chord([680,920,1240],.07,'sine',.04); },
    skill(){ if(!this.play(this.files.skill,.5)) this.chord([320,540,760],.09,'triangle',.035); },
    win(){ if(!this.play(this.files.win,.6)) this.chord([520,660,780,1040],.16,'triangle',.055); },
    boss(){ if(!this.play(this.files.boss,.65)) this.chord([90,120,80],.2,'sawtooth',.07); },
    bossAbility(id){
      if(!this.play(this.files[`bossAbility${id}`],.62)){
        const patterns = {
          1:[[120,165,210],.12,'sawtooth',.055],
          2:[[880,1040,1320],.07,'triangle',.04],
          3:[[220,140,95],.16,'square',.055],
          4:[[130,180,260],.09,'sawtooth',.06],
          5:[[70,95,120,70],.18,'sawtooth',.07],
          6:[[520,320,180],.13,'triangle',.052],
          7:[[90,160,260,420],.14,'sine',.055]
        };
        const p = patterns[id] || patterns[1];
        this.chord(p[0],p[1],p[2],p[3]);
      }
    },
    bossLine(id){ this.play(this.lines[id],.78); }
  };

  function showToast(text){
    toast.textContent = text;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(()=>toast.classList.remove('show'),1600);
  }

  function renderHeroCards(){
    heroCards.innerHTML = '';
    heroData.forEach((h,i)=>{
      if(h.secret && !secretUnlocked) return;
      const card = document.createElement('div');
      card.className = 'card' + (i===selectedHero?' active':'') + (h.secret?' secret-card':'');
      card.innerHTML = `
        <div class="avatar" style="background:linear-gradient(135deg,${h.color},rgba(255,255,255,.25))"><img src="${h.img}" alt="${h.name}" onerror="this.remove();this.parentElement.textContent='${h.icon}'"></div>
        <b>${h.secret?'⭐ ':''}${h.name}</b>
        <small>${h.desc}</small>
        <div class="mini">
          ${statMini('Vida',h.hp,1300)}
          ${statMini('Dano',h.dmg,100)}
          ${statMini('Vel.',h.speed,9)}
          ${statMini('Mana',h.mana,650)}
        </div>`;
      card.addEventListener('click',()=>{selectedHero=i;renderHeroCards();showHeroStatus();syncCreativeFields();audio.coin();});
      heroCards.appendChild(card);
    });
  }

  function statMini(label,val,max){
    return `<div>${label}: ${Math.round(val)}<div class="bar-mini"><span style="width:${clamp(val/max*100,8,100)}%"></span></div></div>`;
  }

  function showHeroStatus(){
    const h = heroData[selectedHero];
    const skillText = h.skills.map((sk,i)=>`${SKILL_LABELS[i]}: ${sk.name}`).join('</span><span class="pill">');
    statusBar.innerHTML = `<span class="pill">Herói: ${h.icon} ${h.name}</span><span class="pill">${skillText}</span>`;
  }

  function syncCreativeFields(){
    if(!creativePanel || !creativeMode) return;
    creativePanel.classList.add('show');
    const h = heroData[selectedHero];
    const set = (id,val)=>{ const el=document.getElementById(id); if(el && !el.dataset.touched) el.value=val; };
    set('creativeHp', Math.round(h.hp));
    set('creativeDmg', Math.round(h.dmg));
    set('creativeSpeed', h.speed.toFixed(2));
    set('creativeMana', Math.round(h.mana));
    set('creativeHpRegen', h.hpRegen.toFixed(3));
    set('creativeManaRegen', h.manaRegen.toFixed(3));
    set('creativeStomp', 80);
  }

  function readCreativeNumber(id,fallback,min,max){
    const el = document.getElementById(id);
    const raw = el ? Number(String(el.value).replace(',','.')) : NaN;
    return clamp(Number.isFinite(raw) ? raw : fallback, min, max);
  }

  function applyCreativeStats(){
    if(!creativeMode || !player) return;
    player.maxHp = readCreativeNumber('creativeHp',player.maxHp,1,99999);
    player.hp = player.maxHp;
    player.dmg = readCreativeNumber('creativeDmg',player.dmg,1,99999);
    player.speed = readCreativeNumber('creativeSpeed',player.speed,.5,60);
    player.maxMana = readCreativeNumber('creativeMana',player.maxMana,0,99999);
    player.mana = player.maxMana;
    player.hpRegen = readCreativeNumber('creativeHpRegen',player.hpRegen,0,200);
    player.manaRegen = readCreativeNumber('creativeManaRegen',player.manaRegen,0,200);
    player.stompPower = readCreativeNumber('creativeStomp',player.stompPower,0,99999);
    player.revives = 99;
    player.invuln = Math.max(player.invuln, 2200);
  }

  function startGame(){
    audio.init();
    levelIndex = creativeMode ? 9 : 0;
    score = creativeMode ? 9999 : 0;
    kills = 0;
    graveyard = [];
    timeHistory = [];
    createPlayer();
    applyCreativeStats();
    buildLevel();
    state = 'playing';
    paused = false;
    menu.classList.remove('show');
    message.classList.remove('show');
    showToast(creativeMode ? 'Modo Criativo: fase final liberada' : 'Fase 1 iniciada');
    audio.start();
  }

  function createPlayer(){
    const h = heroData[selectedHero];
    player = {
      hero:h,
      x:80,y:330,w:38,h:54,vx:0,vy:0,dir:1,onGround:false,jumps:0,maxJumps:2,
      hp:h.hp,maxHp:h.hp,mana:h.mana,maxMana:h.mana,
      dmg:h.dmg,speed:h.speed,manaRegen:h.manaRegen,hpRegen:h.hpRegen,
      attackCd:0,skillCd:h.skills.map(()=>0),hurtCd:0,shield:0,invuln:0,weaponLevel:0,speedBuff:0,dead:false,stompPower:34,
      invisible:0,dragonTimer:0,berserkTimer:0,revives:0
    };
  }

  function seededNoise(n){ return Math.abs(Math.sin(n*999.91+levelIndex*47.13)*10000)%1; }

  function buildLevel(){
    platforms=[]; enemies=[]; projectiles=[]; powerups=[]; particles=[]; texts=[]; traps=[]; drones=[]; allies=[]; areaEffects=[];
    cameraX=0; overlayAlpha=0; sceneEffects = {flipTimer:0, upsideDownTimer:0, flash:0}; bossSpeech={text:'',life:0,skill:''}; timeStopTimer=0;
    const level = levelIndex+1;
    const theme = levelIndex % 5;

    platforms.push({x:-200,y:FLOOR_Y,w:LEVEL_WIDTH+520,h:120,type:'ground'});

    for(let s=0;s<LEVEL_SCREENS;s++){
      const base = s*W;
      const count = 2 + Math.min(3,Math.floor(level/3));
      for(let i=0;i<count;i++){
        const px = base + 190 + i*260 + seededNoise(s*11+i)*75;
        const py = 380 - seededNoise(s*21+i)*145 - (level>6?30:0);
        const pw = 115 + seededNoise(s*33+i)*90;
        platforms.push({x:px,y:py,w:pw,h:18,type:i%3===0?'brick':'stone'});
        if(level>4 && i===1 && s%2===1){ platforms.push({x:px+pw+60,y:py+65,w:80,h:16,type:'moving',originX:px+pw+60,range:75,phase:s+i}); }
      }
      if(s>0){
        const allowed = Math.min(10, 1 + Math.floor((level+s/2)/1.25));
        const amount = 1 + Math.floor(level/3) + (s>5?1:0);
        for(let e=0;e<amount;e++){
          const typeIndex = Math.min(allowed-1, Math.floor(seededNoise(s*53+e)*allowed));
          spawnEnemy(typeIndex, base + 260 + e*210 + seededNoise(e+s*7)*120, FLOOR_Y-60, level, false);
        }
      }
      if(s>0 && s<9){
        const pType = powerupTypes[Math.floor(seededNoise(s*17+level)*powerupTypes.length)];
        powerups.push({x:base+500+seededNoise(s*13)*250,y:260+seededNoise(s*19)*120,w:30,h:30,vy:0,type:pType.type,name:pType.name,icon:pType.icon,color:pType.color,t:0});
      }
      if(level>3 && s%3===2){
        platforms.push({x:base+700,y:FLOOR_Y-18,w:90,h:18,type:'spikes'});
      }
    }

    platforms.push({x:LEVEL_WIDTH-170,y:FLOOR_Y-92,w:44,h:92,type:'portal'});

    if(levelIndex === 8){ spawnBoss(false); }
    if(levelIndex === 9){ spawnBoss(true); }

    showToast(`Fase ${level} - Tela 1/10`);
  }

  function spawnEnemy(typeIndex,x,y,level,isBoss){
    const t = monsterTypes[typeIndex];
    const diff = 1 + levelIndex*.18 + Math.floor((x/W))*0.025;
    const e = {
      kind:'enemy', typeIndex, name:t.name, color:t.color, x, y, w:t.flying?44:42, h:t.flying?36:46,
      vx:0, vy:0, dir:-1, onGround:false, hp:t.hp*diff, maxHp:t.hp*diff, dmg:t.dmg*diff, speed:t.speed*(1+levelIndex*.035),
      shoot:!!t.shoot, projectile:t.projectile, shootTimer:rand(450,1500), rate:Math.max(520,(t.rate||1600)-levelIndex*55),
      jump:!!t.jump, flying:!!t.flying, dash:!!t.dash, frozen:0, hurt:0, points:t.points, boss:false, alive:true, aiTimer:0, bob:rand(0,6.28)
    };
    if(isBoss){e.boss=true; e.w=140; e.h=130; e.hp*=8; e.maxHp=e.hp; e.dmg*=1.8; e.speed*=.75;}
    enemies.push(e);
    return e;
  }

  function spawnBoss(superBoss){
    const bossW = superBoss ? 188 : 150;
    const bossH = superBoss ? 178 : 142;
    const arenaLeft = FINAL_SCREEN_X + BOSS_ARENA_PADDING;
    const portalX = LEVEL_WIDTH - 170;
    const arenaRight = portalX - bossW - 60;
    const e = {
      kind:'boss', name:superBoss?'Super Boss Marketplace':'Subboss Operacional', color:superBoss?'#7f1d1d':'#7c2d12',
      x:clamp(LEVEL_WIDTH-820,arenaLeft,arenaRight),y:FLOOR_Y-bossH,w:bossW,h:bossH,
      vx:0,vy:0,dir:-1,onGround:true,hp:superBoss?2450:1250,maxHp:superBoss?2450:1250,dmg:superBoss?38:26,speed:superBoss?1.05:1.25,
      shoot:true, projectile:superBoss?'dark':'fire', shootTimer:700, rate:superBoss?430:650, jump:true, flying:false, dash:true, frozen:0, hurt:0, points:superBoss?3000:1200,boss:true,superBoss,alive:true,active:false,arenaLeft,arenaRight,aiTimer:0,bob:0,phase:1,summonTimer:superBoss?2600:3600,specialTimer:superBoss?1800:0,specialIndex:0,chargeTimer:0,speechTimer:0
    };
    enemies.push(e);
  }

  function update(dt){
    if(state !== 'playing' || paused) return;
    const step = Math.min(dt, 33.3) / 16.666;
    updatePlayer(step);
    updatePlatforms(step);
    updateEnemies(step);
    updateProjectiles(step);
    updatePowerups(step);
    updateTraps(step);
    updateDrones(step);
    updateAllies(step);
    updateAreaEffects(step);
    updateParticles(step);
    recordTimeHistory();
    updateSceneEffects(step);
    updateCamera(step);
    updateUi();
    checkEnd();
  }

  function updatePlayer(step){
    let left = keys.ArrowLeft || keys.KeyA;
    let right = keys.ArrowRight || keys.KeyD;
    if(left){ player.vx -= player.speed*.18*step; player.dir=-1; }
    if(right){ player.vx += player.speed*.18*step; player.dir=1; }
    if(!left && !right) player.vx *= Math.pow(FRICTION,step);
    player.vx = clamp(player.vx,-player.speed*1.45,player.speed*1.45);
    player.vy += GRAVITY*step;
    if(player.shield>0) player.shield-=16.666*step;
    if(player.invuln>0) player.invuln-=16.666*step;
    if(player.hurtCd>0) player.hurtCd-=16.666*step;
    if(player.attackCd>0) player.attackCd-=16.666*step;
    player.skillCd = player.skillCd.map(cd=>Math.max(0,cd-16.666*step));
    if(player.speedBuff>0){ player.speedBuff-=16.666*step; }
    if(player.invisible>0) player.invisible-=16.666*step;
    if(player.dragonTimer>0) player.dragonTimer-=16.666*step;
    if(player.berserkTimer>0) player.berserkTimer-=16.666*step;
    if(timeStopTimer>0) timeStopTimer-=16.666*step;
    player.mana = Math.min(player.maxMana, player.mana + player.manaRegen*step);
    player.hp = Math.min(player.maxHp, player.hp + player.hpRegen*step);

    moveEntity(player, step);
    player.x = clamp(player.x,0,LEVEL_WIDTH-player.w);
    if(player.y > H+300) damagePlayer(999,'queda');
  }

  function updatePlatforms(step){
    platforms.forEach(p=>{
      if(p.type==='moving'){
        p.x = p.originX + Math.sin(performance.now()/850+p.phase)*p.range;
      }
    });
  }

  function moveEntity(ent, step){
    ent.x += ent.vx*step;
    for(const p of platforms){
      if(p.type==='portal' || p.type==='spikes' || p.type==='ground') continue;
      if(rectsOverlap(ent,p)){
        if(ent.vx>0) ent.x = p.x-ent.w;
        if(ent.vx<0) ent.x = p.x+p.w;
        ent.vx = 0;
      }
    }
    ent.y += ent.vy*step;
    ent.onGround=false;
    for(const p of platforms){
      if(p.type==='portal') continue;
      if(p.type==='spikes'){
        if(ent===player && rectsOverlap(ent,p)) damagePlayer(18+levelIndex*2,'espinhos');
        continue;
      }
      if(rectsOverlap(ent,p)){
        if(ent.vy>0){ ent.y=p.y-ent.h; ent.vy=0; ent.onGround=true; if(ent===player) ent.jumps=0; }
        else if(ent.vy<0){ ent.y=p.y+p.h; ent.vy=0; }
      }
    }
  }

  function jump(){
    if(state!=='playing' || paused) return;
    if(player.jumps < player.maxJumps){
      player.vy = player.jumps===0 ? -13.5 : -11.2;
      player.jumps++;
      player.onGround=false;
      burst(player.x+player.w/2,player.y+player.h,10,'#f8fafc',1.8);
      audio.jump();
    }
  }

  function basicAttack(){
    if(state!=='playing' || paused || player.attackCd>0) return;
    player.attackCd = 310;
    const hit = {x:player.x+(player.dir>0?player.w:-44),y:player.y+13,w:player.dragonTimer>0?74:48,h:player.dragonTimer>0?48:34,life:130,owner:'player',dmg:playerDamage(player.dmg+player.weaponLevel*4),type:player.dragonTimer>0?'fireSlash':'slash',dir:player.dir,color:player.dragonTimer>0?'#f97316':player.hero.color};
    projectiles.push(hit);
    burst(hit.x+hit.w/2,hit.y+hit.h/2,8,player.hero.color,1.6);
    audio.tone(210,.05,'square',.035);
  }

  function useSkill(slot){
    if(state!=='playing' || paused) return;
    const skill = player.hero.skills[slot];
    if(!skill || player.skillCd[slot] > 0 || player.mana < skill.cost) return;
    player.mana -= skill.cost;
    player.skillCd[slot] = skill.cd;
    audio.skill();
    const dmg = playerDamage(player.dmg + player.weaponLevel*4);
    const px = player.x + player.w/2;
    const py = player.y + player.h/2;
    const dir = player.dir;

    switch(skill.type){
      case 'bolt': shootPlayer('bolt',px,py,dir,9,dmg*1.25,20,12,'#facc15'); break;
      case 'kunai': shootPlayer('kunai',px,py,dir,11,dmg*1.05,18,8,'#c4b5fd'); break;
      case 'orb': shootPlayer('orb',px,py,dir,6.8,dmg*1.55,28,28,'#38bdf8',true); break;
      case 'fireball': shootPlayer('fireball',px,py,dir,7.8,dmg*1.75,30,24,'#ef4444',true); break;
      case 'arrow': shootPlayer('arrow',px,py,dir,12,dmg*1.15,30,7,'#bef264'); break;
      case 'laser': projectiles.push({x:px+(dir>0?0:-360),y:py-5,w:360,h:10,vx:0,vy:0,life:135,owner:'player',dmg:dmg*2,type:'laser',dir,color:'#67e8f9',pierce:true}); shake=8; break;
      case 'rock': shootPlayer('rock',px,py,dir,6.5,dmg*1.65,26,26,'#a8a29e',true); break;
      case 'gust': shootPlayer('gust',px,py,dir,8.5,dmg*.95,44,22,'#bbf7d0',true,{knock:12}); break;
      case 'shadow': shootPlayer('shadow',px,py,dir,9.5,dmg*1.35,24,18,'#94a3b8',true,{lifesteal:.18}); break;
      case 'dash': player.vx = dir*17; player.invuln=420; projectiles.push({x:player.x-8,y:player.y+8,w:player.w+16,h:player.h-8,life:430,owner:'player',dmg:dmg*1.6,type:'dash',dir,color:'#fb923c'}); break;
      case 'blink': player.x = clamp(player.x + dir*260,0,LEVEL_WIDTH-player.w); player.invuln=260; burst(px,py,22,'#a78bfa',3); burst(player.x+player.w/2,py,22,'#a78bfa',3); break;
      case 'heal': healPlayer(46+levelIndex*4); burst(px,py,26,'#22c55e',2.8); break;
      case 'shield': player.shield = 6800; player.invuln=500; burst(px,py,28,'#a855f7',2.3); break;
      case 'freeze': enemies.forEach(e=>{ if(Math.abs(e.x-player.x)<420){ e.frozen=2600; damageEnemy(e,dmg*.55,'gelo'); }}); burst(px,py,48,'#7dd3fc',3.3); break;
      case 'nova': enemies.forEach(e=>{ if(distance(player,e)<260) damageEnemy(e,dmg*2.2,'explosão'); }); burst(px,py,72,'#fb7185',4.2); shake=14; break;
      case 'trap': traps.push({x:player.x+dir*55,y:player.y+player.h-16,w:48,h:18,life:9500,dmg:dmg*1.45,color:'#86efac'}); showToast('Armadilha posicionada'); break;
      case 'drone': drones.push({x:player.x,y:player.y-70,w:30,h:24,life:11500,shoot:0,color:'#67e8f9'}); showToast('Drone ativado'); break;
      case 'quake': enemies.forEach(e=>{ if(Math.abs((e.x+e.w/2)-(player.x+player.w/2))<340 && e.y>player.y-80) { damageEnemy(e,dmg*2.0,'terremoto'); e.vy=-8; }}); burst(px,FLOOR_Y,70,'#d6d3d1',4); shake=18; break;
      case 'highjump': player.vy=-18; player.jumps=0; burst(px,player.y+player.h,36,'#bbf7d0',3); break;
      case 'vampire': enemies.forEach(e=>{ if(distance(player,e)<260){ const d=dmg*1.95; damageEnemy(e,d,'vampiro'); healPlayer(d*.32); }}); burst(px,py,44,'#cbd5e1',3.2); break;
      case 'necromancy': castNecromancy(px,py); break;
      case 'timeStop': timeStopTimer = 5200; enemies.forEach(e=>e.frozen=Math.max(e.frozen,5200)); burst(px,py,72,'#bae6fd',4); showToast('Tempo congelado por 5 segundos'); break;
      case 'rewind': rewindTime(); break;
      case 'invincibility': player.invuln=8500; player.shield=Math.max(player.shield,8500); burst(px,py,64,'#fef3c7',4); showToast('Invencibilidade ativada'); break;
      case 'revive': player.revives += 1; healPlayer(player.maxHp); player.mana=player.maxMana; burst(px,py,72,'#fde68a',4); showToast('Reviver preparado'); break;
      case 'berserk': player.berserkTimer=10000; burst(px,py,76,'#ef4444',4.2); showToast('Modo Berserker ativo'); break;
      case 'invisibility': player.invisible=7200; player.invuln=Math.max(player.invuln,600); burst(px,py,48,'#c4b5fd',3.5); showToast('Invisibilidade ativada'); break;
      case 'screenExplosion': explodeScreen(dmg); break;
      case 'blackhole': spawnAreaEffect('blackhole',px+dir*220,py,3600,dmg*1.1,'#8b5cf6'); break;
      case 'comet': spawnComet(px+dir*220,dmg*3.2,'#fb923c'); break;
      case 'cometRain': for(let i=0;i<9;i++) setTimeout(()=>spawnComet(cameraX+rand(90,W-90),dmg*2.25,'#fb923c'),i*90); showToast('Chuva de cometas'); break;
      case 'samurai': projectiles.push({x:px+(dir>0?0:-520),y:py-34,w:520,h:68,vx:dir*18,vy:0,life:420,owner:'player',dmg:dmg*2.75,type:'samurai',dir,color:'#f8fafc',pierce:true}); shake=12; burst(px,py,34,'#f8fafc',3); break;
      case 'clone': spawnClones(dmg); break;
      case 'bomb': spawnAreaEffect('bomb',px+dir*190,py+80,1800,dmg*4.1,'#f97316'); showToast('Bomba armada'); break;
      case 'dragon': player.dragonTimer=11500; player.invuln=Math.max(player.invuln,1200); player.shield=Math.max(player.shield,3200); burst(px,py,92,'#f97316',4.8); showToast('Forma de dragão ativada'); break;
      case 'coordinate': spawnAreaEffect('coordinate',px+dir*260,FLOOR_Y-130,5000,dmg*1.25,'#22c55e'); showToast('Coordenada marcada: inimigos atraídos'); break;
      case 'chainLightning': castChainLightning(dmg); break;
    }
  }

  function shootPlayer(type,x,y,dir,speed,dmg,w,h,color,grav=false,extra={}){
    projectiles.push({x:x+(dir>0?12:-w-12),y:y-h/2,w,h,vx:dir*speed,vy:grav?-2.4:0,life:1700,owner:'player',dmg,type,dir,color,grav,pierce: type==='orb' || type==='gust',...extra});
  }

  function updateEnemies(step){
    const level = levelIndex+1;
    for(const e of enemies){
      if(!e.alive) continue;
      if(timeStopTimer>0){ drawFrozenParticles(e); continue; }
      if(e.frozen>0){ e.frozen-=16.666*step; e.vx*=.9; drawFrozenParticles(e); continue; }
      if(e.hurt>0) e.hurt-=16.666*step;
      const pc = center(player);
      const ec = center(e);
      const dx = pc.x-ec.x;
      const dy = pc.y-ec.y;
      const near = player.invisible>0 ? false : (Math.abs(dx)<650 && Math.abs(dy)<260);
      e.dir = dx>=0?1:-1;
      e.aiTimer += 16.666*step;

      if(e.boss && !e.active){
        e.vx = 0;
        e.vy += GRAVITY*step;
        moveEntity(e,step);
        e.x = clamp(e.x,e.arenaLeft,e.arenaRight);
        if(player.x + player.w >= e.arenaLeft - 120){
          e.active = true;
          e.aiTimer = 0;
          e.chargeTimer = 0;
          showToast(e.superBoss ? 'O Super Boss entrou na arena' : 'O Subboss entrou na arena');
          audio.boss();
        }
        continue;
      }

      if(e.boss){
        bossAi(e,step,dx,dy);
      } else if(e.flying){
        e.vx += e.dir*e.speed*.05*step;
        e.vx = clamp(e.vx,-e.speed*2,e.speed*2);
        e.y += Math.sin(performance.now()/380+e.bob)*.65*step;
        if(near) e.vy += clamp(dy,-60,60)*.0012*step;
        e.vy = clamp(e.vy,-1.6,1.6);
      } else {
        if(near) e.vx += e.dir*e.speed*.045*step; else e.vx += Math.sin(e.aiTimer/900)*.025*step;
        e.vx = clamp(e.vx,-e.speed*1.9,e.speed*1.9);
        if(e.jump && e.onGround && near && Math.abs(dx)<150 && Math.random()<.025*step) e.vy=-10-rand(0,3);
        if(e.dash && near && Math.abs(dx)<260 && e.aiTimer>1600){ e.vx=e.dir*(8+level*.2); e.aiTimer=0; burst(ec.x,ec.y,12,e.color,2); }
      }

      if(e.shoot && near){
        e.shootTimer -= 16.666*step;
        if(e.shootTimer<=0){
          enemyShoot(e);
          e.shootTimer = e.rate * rand(.75,1.3);
        }
      }

      if(e.flying){
        e.x += e.vx*step; e.y += e.vy*step; e.y=clamp(e.y,100,FLOOR_Y-80);
      } else {
        e.vy += GRAVITY*step;
        moveEntity(e,step);
      }

      if(e.boss){
        const boundedX = clamp(e.x,e.arenaLeft,e.arenaRight);
        if(boundedX !== e.x){
          e.x = boundedX;
          e.vx = 0;
          e.chargeTimer = 0;
        }
      }

      if(rectsOverlap(player,e)) handlePlayerEnemyCollision(e);
      if(e.x < cameraX-500 || e.x > cameraX+W+900) e.vx *= .97;
    }
    enemies = enemies.filter(e=>e.alive);
  }

  function bossAi(e,step,dx,dy){
    const hpPct = e.hp/e.maxHp;
    e.phase = hpPct<.35 ? 3 : hpPct<.68 ? 2 : 1;
    e.vx += e.dir*e.speed*(.035+e.phase*.012)*step;
    e.vx = clamp(e.vx,-e.speed*(1.5+e.phase*.25),e.speed*(1.5+e.phase*.25));

    if(e.chargeTimer>0){
      e.chargeTimer -= 16.666*step;
      e.vx = e.dir*(10+e.phase*2.4);
      if(Math.random()<.35) particles.push({x:e.x+e.w/2,y:e.y+e.h-8,vx:rand(-3,3),vy:rand(-2,1),life:340,size:rand(2,5),color:'#f97316'});
    }

    if(e.onGround && Math.abs(dx)<220 && e.aiTimer > 900){ e.vy = -12 - e.phase; e.aiTimer=0; }
    if(e.dash && Math.abs(dx)<520 && Math.random()<.004*step && !e.superBoss){ e.vx=e.dir*(9+e.phase*2); shake=10; }

    e.summonTimer -= 16.666*step;
    if(e.summonTimer<=0){
      const count = e.superBoss ? 2+e.phase : 2;
      for(let i=0;i<count;i++){
        const type = e.superBoss ? Math.floor(rand(5,10)) : Math.floor(rand(2,8));
        spawnEnemy(type, e.x + rand(-230,230), FLOOR_Y-70, levelIndex+1, false);
      }
      e.summonTimer = e.superBoss ? 5200 - e.phase*550 : 5200;
      showToast(e.superBoss ? 'O Super Boss chamou reforços' : 'Subboss chamou reforços');
    }

    if(e.superBoss){
      e.specialTimer -= 16.666*step;
      if(e.specialTimer<=0){
        useSuperBossSkill(e);
        e.specialTimer = Math.max(1150, 3350 - e.phase*520);
      }
    }
  }

  function bossSay(e,skill){
    bossSpeech = {text:skill.line, life:2200, skill:skill.name};
    floatingText(e.x+e.w/2,e.y-42,skill.line,'#fed7aa');
    showToast(`${skill.name}: “${skill.line}”`);
    audio.bossLine(skill.id);
  }

  function useSuperBossSkill(e){
    const skill = superBossSkills[e.specialIndex % superBossSkills.length];
    e.specialIndex++;
    bossSay(e,skill);
    audio.bossAbility(skill.id);
    sceneEffects.flash = 280;

    switch(skill.id){
      case 1: bossThrowBoxes(e); break;
      case 2: bossThrowCoins(e); break;
      case 3: bossLeapAtHero(e); break;
      case 4: bossRunAtHero(e); break;
      case 5: bossCallTruck(e); break;
      case 6: bossGravityWell(e); break;
      case 7: bossFinalRain(e); break;
    }
  }

  function bossThrowBoxes(e){
    const ec = center(e);
    const pc = center(player);
    for(let i=0;i<6;i++){
      const targetX = pc.x + rand(-170,170);
      const vx = (targetX-ec.x)/58 + rand(-1.1,1.1);
      projectiles.push({x:ec.x-22,y:ec.y-35,w:44,h:44,vx,vy:-8-rand(0,4),life:3600,owner:'enemy',dmg:e.dmg*1.05,type:'bossBox',dir:e.dir,color:'#b45309',grav:true,img:bossAbilityImages[0],rot:rand(-.8,.8),spin:rand(-.09,.09)});
    }
    shake=12;
  }

  function bossThrowCoins(e){
    const ec = center(e);
    for(let i=0;i<16;i++){
      const angle = -Math.PI*.82 + (Math.PI*.64)*(i/15) + rand(-.08,.08);
      const sp = rand(5.2,8.8);
      projectiles.push({x:ec.x,y:ec.y-20,w:24,h:24,vx:Math.cos(angle)*sp*e.dir,vy:Math.sin(angle)*sp,life:2600,owner:'enemy',dmg:e.dmg*.42,type:'bossCoin',dir:e.dir,color:'#facc15',grav:true,img:bossAbilityImages[1],rot:0,spin:rand(.12,.22)});
    }
  }

  function bossLeapAtHero(e){
    const pc = center(player), ec = center(e);
    e.vy = -17.5;
    e.vx = (pc.x-ec.x)/36;
    e.chargeTimer = 340;
    burst(ec.x,ec.y,26,'#fecaca',3.4);
    shake=16;
  }

  function bossRunAtHero(e){
    e.dir = player.x > e.x ? 1 : -1;
    e.vx = e.dir*17;
    e.chargeTimer = 1050;
    projectiles.push({x:e.x,y:e.y+e.h*.62,w:e.w,h:32,vx:e.dir*13,vy:0,life:760,owner:'enemy',dmg:e.dmg*.8,type:'bossRushWave',dir:e.dir,color:'#fb7185',grav:false,img:bossAbilityImages[3]});
    shake=14;
  }

  function bossCallTruck(e){
    const fromLeft = player.x < e.x;
    const x = fromLeft ? cameraX-230 : cameraX+W+80;
    const vx = fromLeft ? 16 : -16;
    projectiles.push({x,y:FLOOR_Y-78,w:190,h:78,vx,vy:0,life:4300,owner:'enemy',dmg:e.dmg*1.85,type:'bossTruck',dir:vx>0?1:-1,color:'#f97316',grav:false,img:bossAbilityImages[4],persistent:true});
    floatingText(x + (fromLeft?180:-60), FLOOR_Y-102, '🚚 CAMINHÃO!', '#fdba74');
    shake=18;
  }

  function bossGravityWell(e){
    const x = clamp(player.x + rand(-160,160), cameraX+80, cameraX+W-80);
    spawnAreaEffect('enemyBlackhole',x,FLOOR_Y-220,3200,e.dmg*1.1,'#7f1d1d');
    shake=16;
  }

  function bossFinalRain(e){
    for(let i=0;i<7;i++){
      setTimeout(()=>{
        const x = cameraX + rand(70,W-70);
        projectiles.push({x,y:-80,w:42,h:42,vx:rand(-1.5,1.5),vy:7.8,life:2800,owner:'enemy',dmg:e.dmg*1.05,type:'bossMeteor',dir:1,color:'#fb7185',grav:false});
      },i*120);
    }
    shake=18;
  }

  function updateSceneEffects(step){
    const dec = 16.666*step;
    sceneEffects.flipTimer = Math.max(0,sceneEffects.flipTimer-dec);
    sceneEffects.upsideDownTimer = Math.max(0,sceneEffects.upsideDownTimer-dec);
    sceneEffects.flash = Math.max(0,sceneEffects.flash-dec);
    bossSpeech.life = Math.max(0,bossSpeech.life-dec);
  }

  function drawFrozenParticles(e){
    if(Math.random()<.08) particles.push({x:e.x+rand(0,e.w),y:e.y+rand(0,e.h),vx:rand(-.5,.5),vy:rand(-1,0),life:450,size:rand(1,3),color:'#bae6fd'});
  }

  function enemyShoot(e){
    const ec = center(e);
    const pc = center(player);
    const ang = Math.atan2(pc.y-ec.y, pc.x-ec.x);
    const sp = e.boss ? (5.6 + e.phase*.8) : (3.5+levelIndex*.18);
    const size = e.boss ? 24 : 16;
    projectiles.push({x:ec.x-size/2,y:ec.y-size/2,w:size,h:size,vx:Math.cos(ang)*sp,vy:Math.sin(ang)*sp,life:2500,owner:'enemy',dmg:e.dmg,type:e.projectile||'enemy',dir:e.dir,color:e.color,grav:false});
    burst(ec.x,ec.y,5,e.color,1.3);
    audio.tone(e.boss?110:180,.05,'sawtooth',.025);
  }

  function handlePlayerEnemyCollision(e){
    const falling = player.vy > 1.5;
    const playerBottomPrev = player.y + player.h - player.vy;
    const stomp = falling && playerBottomPrev <= e.y+18;
    if(stomp){
      player.y = e.y-player.h-2;
      player.vy = -11.5;
      const d = player.stompPower + player.dmg*.72 + player.weaponLevel*4;
      damageEnemy(e,d,'pisão');
      burst(player.x+player.w/2,player.y+player.h,18,'#f8fafc',2.4);
      audio.hit();
    } else {
      damagePlayer(e.dmg, e.name);
      player.vx = -e.dir*7;
      player.vy = -6;
    }
  }

  function updateProjectiles(step){
    for(const p of projectiles){
      p.life -= 16.666*step;
      if(timeStopTimer>0 && p.owner==='enemy') continue;
      if(p.type==='slash' || p.type==='fireSlash' || p.type==='dash' || p.type==='laser'){
        if(p.type==='dash'){ p.x=player.x-8; p.y=player.y+8; }
      } else {
        p.x += p.vx*step;
        p.y += p.vy*step;
        if(p.grav) p.vy += .25*step;
        if((p.type==='bossBox' || p.type==='bossCoin') && p.y+p.h>FLOOR_Y){
          p.y = FLOOR_Y-p.h;
          p.vy *= -.36;
          p.vx *= .84;
          if(Math.abs(p.vy)<1.2) p.life = Math.min(p.life,420);
        }
        if(p.spin) p.rot = (p.rot || 0) + p.spin*step;
      }

      if(p.owner==='player' || p.owner==='ally'){
        for(const e of enemies){
          if(!e.alive || p.hitId===e) continue;
          if(rectsOverlap(p,e)){
            damageEnemy(e,p.dmg,p.type);
            if(p.knock) e.vx += p.dir*p.knock;
            if(p.owner==='player'){
              const ls = p.lifesteal || playerLifesteal();
              if(ls) healPlayer(p.dmg*ls);
            }
            burst(p.x+p.w/2,p.y+p.h/2,10,p.color||'#fff',2.2);
            if(!p.pierce && p.type!=='slash' && p.type!=='dash' && p.type!=='laser'){ p.life=0; break; }
            p.hitId=e;
          }
        }
      } else if(p.owner==='enemy'){
        for(const a of allies){
          if(!a.alive || p.persistent) continue;
          if(rectsOverlap(p,a)){
            a.hp -= p.dmg;
            p.life = 0;
            burst(p.x+p.w/2,p.y+p.h/2,10,p.color||'#fff',2);
            break;
          }
        }
        if(p.life>0 && rectsOverlap(p,player)){
          damagePlayer(p.dmg,p.type);
          if(!p.persistent) p.life=0;
          burst(p.x+p.w/2,p.y+p.h/2,p.type==='bossTruck'?38:12,p.color, p.type==='bossTruck'?4:2);
        }
      }

      if(p.x < cameraX-300 || p.x > cameraX+W+500 || p.y>H+200 || p.y<-240) p.life=0;
    }
    projectiles = projectiles.filter(p=>p.life>0);
  }

  function updatePowerups(step){
    for(const p of powerups){
      p.t += .05*step;
      p.y += Math.sin(p.t)*.18*step;
      if(rectsOverlap(player,p)){
        collectPowerup(p);
        p.dead=true;
      }
    }
    powerups = powerups.filter(p=>!p.dead);
  }

  function collectPowerup(p){
    switch(p.type){
      case 'heart': healPlayer(35); break;
      case 'mana': player.mana=Math.min(player.maxMana,player.mana+45); break;
      case 'maxHp': player.maxHp+=15; player.hp+=15; break;
      case 'maxMana': player.maxMana+=15; player.mana+=15; break;
      case 'damage': player.weaponLevel++; player.dmg+=4; break;
      case 'speed': player.speed+=.22; player.speedBuff=10000; break;
      case 'regen': player.hpRegen+=.018; player.manaRegen+=.06; break;
      case 'shield': player.shield=10000; break;
    }
    score += 80;
    floatingText(p.x,p.y,p.name,p.color);
    burst(p.x+p.w/2,p.y+p.h/2,25,p.color,2.8);
    audio.coin();
  }

  function updateTraps(step){
    for(const t of traps){
      t.life-=16.666*step;
      for(const e of enemies){
        if(e.alive && rectsOverlap(t,e)){
          damageEnemy(e,t.dmg,'armadilha');
          e.frozen=Math.max(e.frozen,900);
          t.life=0;
          burst(t.x+t.w/2,t.y,24,t.color,2.6);
          break;
        }
      }
    }
    traps = traps.filter(t=>t.life>0);
  }

  function updateDrones(step){
    for(const d of drones){
      d.life-=16.666*step;
      d.x += ((player.x+player.w/2-15)-d.x)*.06*step;
      d.y += ((player.y-60)-d.y)*.055*step;
      d.shoot -= 16.666*step;
      if(d.shoot<=0){
        const target = enemies.filter(e=>e.alive && Math.abs(e.x-player.x)<520).sort((a,b)=>distance(d,a)-distance(d,b))[0];
        if(target){
          const dc=center(d), tc=center(target); const ang=Math.atan2(tc.y-dc.y,tc.x-dc.x);
          projectiles.push({x:dc.x,y:dc.y,w:10,h:10,vx:Math.cos(ang)*9,vy:Math.sin(ang)*9,life:850,owner:'player',dmg:player.dmg*.72,type:'drone',dir:1,color:'#67e8f9'});
          d.shoot=420;
        }
      }
    }
    drones=drones.filter(d=>d.life>0);
  }

  function updateAllies(step){
    for(const a of allies){
      if(!a.alive) continue;
      a.life -= 16.666*step;
      if(a.life<=0 || a.hp<=0){ a.alive=false; continue; }
      const target = enemies.filter(e=>e.alive).sort((e1,e2)=>distance(a,e1)-distance(a,e2))[0];
      if(target){
        const ac=center(a), tc=center(target);
        a.dir = tc.x >= ac.x ? 1 : -1;
        const dx = tc.x-ac.x, dy = tc.y-ac.y;
        if(a.flying || a.clone){
          a.vx += clamp(dx,-80,80)*.0035*step;
          a.vy += clamp(dy,-60,60)*.003*step;
          a.vx=clamp(a.vx,-a.speed*2.3,a.speed*2.3); a.vy=clamp(a.vy,-3.8,3.8);
          a.x += a.vx*step; a.y += a.vy*step;
        } else {
          a.vx += a.dir*a.speed*.07*step;
          a.vx = clamp(a.vx,-a.speed*2.05,a.speed*2.05);
          if(a.onGround && Math.abs(dx)<110 && Math.random()<.02*step) a.vy=-10;
          a.vy += GRAVITY*step;
          moveEntity(a,step);
        }
        a.attack -= 16.666*step;
        if(Math.abs(dx)<70 && Math.abs(dy)<70 && a.attack<=0){
          damageEnemy(target,a.dmg,a.clone?'clone':'aliado');
          healPlayer(a.dmg*.035);
          a.attack=420;
          burst(tc.x,tc.y,10,a.color,2.1);
        }
        a.shoot -= 16.666*step;
        if(a.shoot<=0 && Math.abs(dx)<520){
          const ang=Math.atan2(dy,dx);
          projectiles.push({x:ac.x,y:ac.y,w:14,h:14,vx:Math.cos(ang)*9.5,vy:Math.sin(ang)*9.5,life:900,owner:'ally',dmg:a.dmg*.85,type:'soul',dir:a.dir,color:a.color,pierce:false});
          a.shoot=a.clone?360:620;
        }
      } else {
        a.x += ((player.x + player.dir*-70)-a.x)*.025*step;
        a.y += ((player.y-30)-a.y)*.02*step;
      }
      a.x=clamp(a.x,0,LEVEL_WIDTH-a.w); a.y=clamp(a.y,50,FLOOR_Y-a.h);
    }
    allies = allies.filter(a=>a.alive);
  }

  function updateAreaEffects(step){
    for(const fx of areaEffects){
      fx.life -= 16.666*step;
      fx.t += 16.666*step;
      if(fx.type==='blackhole' || fx.type==='enemyBlackhole'){
        const targets = fx.type==='enemyBlackhole' ? [player,...allies] : enemies;
        for(const e of targets){
          if(!e || e.alive===false || (fx.type==='enemyBlackhole' && e===player && player.invuln>0)) continue;
          const c=center(e); const dx=fx.x-c.x, dy=fx.y-c.y; const dist=Math.hypot(dx,dy)||1;
          if(dist<330){
            e.vx += dx/dist*(fx.type==='enemyBlackhole'?.75:1.15)*step;
            e.vy += dy/dist*(fx.type==='enemyBlackhole'?.45:.75)*step;
            if(fx.t>fx.nextTick){
              if(fx.type==='enemyBlackhole' && e===player) damagePlayer(fx.dmg*.12,'buraco negro do boss');
              else if(fx.type==='enemyBlackhole') e.hp -= fx.dmg*.10;
              else damageEnemy(e,fx.dmg*.22,'buraco negro');
            }
          }
        }
        if(fx.t>fx.nextTick) fx.nextTick += 420;
        if(Math.random()<.5) particles.push({x:fx.x+rand(-150,150),y:fx.y+rand(-110,110),vx:rand(-2,2),vy:rand(-2,2),life:650,size:rand(2,5),color:fx.color});
      }
      if(fx.type==='bomb'){
        if(fx.life<=0 && !fx.exploded){
          fx.exploded=true;
          enemies.forEach(e=>{ if(distance({x:fx.x-1,y:fx.y-1,w:2,h:2},e)<310) damageEnemy(e,fx.dmg,'bomba'); });
          burst(fx.x,fx.y,110,fx.color,5.2); shake=24;
        }
      }
      if(fx.type==='coordinate'){
        if(fx.t>fx.nextTick){
          enemies.forEach(e=>{
            if(!e.alive) return;
            const ec=center(e); const dx=fx.x-ec.x; const dist=Math.abs(dx);
            if(dist<520){ e.vx += Math.sign(dx)*4.5; if(dist<210) damageEnemy(e,fx.dmg*.32,'coordenada'); }
          });
          fx.nextTick += 520;
        }
        if(Math.random()<.42) particles.push({x:fx.x+rand(-80,80),y:fx.y+rand(-80,80),vx:rand(-1,1),vy:rand(-2,.5),life:520,size:rand(2,4),color:fx.color});
      }
    }
    areaEffects = areaEffects.filter(fx=>fx.life>0 && !fx.exploded);
  }

  function castNecromancy(px,py){
    if(player.hero.name !== 'Carlos'){
      showToast('Necromancia é exclusiva do Carlos');
      return;
    }
    const souls = graveyard.filter(g=>!g.raised).slice(-36);
    if(!souls.length){ showToast('Nenhuma alma derrotada para reviver'); return; }
    souls.forEach((g,i)=>{
      g.raised = true;
      const a = {
        kind:'ally', name:`${g.name} aliado`, color:g.color || '#67e8f9', x:player.x+rand(-90,90), y:player.y-rand(20,90), w:Math.max(28,(g.w||40)*.82), h:Math.max(28,(g.h||40)*.82),
        vx:0, vy:0, dir:player.dir, hp:Math.max(80,(g.maxHp||80)*.55), maxHp:Math.max(80,(g.maxHp||80)*.55), dmg:Math.max(player.dmg*.55,(g.dmg||18)*1.35), speed:Math.max(3.2,(g.speed||2.2)*1.45),
        flying:true, clone:false, alive:true, life:18000 + i*120, attack:rand(0,300), shoot:rand(0,500), onGround:false
      };
      allies.push(a);
    });
    burst(px,py,100,'#67e8f9',4.4);
    shake=18;
    showToast(`${souls.length} inimigos reviveram como aliados`);
  }

  function spawnAreaEffect(type,x,y,life,dmg,color){
    areaEffects.push({type,x,y,life,dmg,color,t:0,nextTick:0,rot:0});
    burst(x,y,54,color,3.5);
  }

  function spawnComet(x,dmg,color){
    projectiles.push({x:x-30,y:-90,w:60,h:60,vx:rand(-.7,.7),vy:10.5,life:3200,owner:'player',dmg,type:'comet',dir:1,color,grav:false,pierce:true});
    shake=8;
  }

  function explodeScreen(dmg){
    enemies.forEach(e=>{ if(e.x>cameraX-80 && e.x<cameraX+W+80) damageEnemy(e,dmg*3.4,'explodir tela'); });
    projectiles = projectiles.filter(p=>p.owner!=='enemy');
    burst(cameraX+W/2,H/2,180,'#fb7185',5.5);
    shake=30;
    showToast('Tudo na tela explodiu');
  }

  function spawnClones(dmg){
    const count = player.hero.secret ? 4 : 2;
    for(let i=0;i<count;i++){
      allies.push({kind:'ally', clone:true, name:'Clone', color:player.hero.color, x:player.x+rand(-80,80), y:player.y-30, w:player.w, h:player.h, vx:0, vy:0, dir:player.dir, hp:player.maxHp*.32, maxHp:player.maxHp*.32, dmg:dmg*.72, speed:player.speed*1.25, flying:true, alive:true, life:9200, attack:0, shoot:0, onGround:false});
    }
    burst(player.x+player.w/2,player.y+player.h/2,62,player.hero.color,4);
    showToast(`${count} clones criados`);
  }

  function castChainLightning(dmg){
    let targets = enemies.filter(e=>e.alive).sort((a,b)=>distance(player,a)-distance(player,b)).slice(0,8);
    targets.forEach((e,i)=>setTimeout(()=>{ if(e.alive){ damageEnemy(e,dmg*(1.85-i*.12),'raio em cadeia'); burst(e.x+e.w/2,e.y+e.h/2,24,'#fde68a',3); } },i*70));
    showToast('Raio em cadeia lançado');
  }

  function playerDamage(base){
    let mult = player.dragonTimer>0 ? 2.35 : 1;
    if(player.berserkTimer>0 || player.hero.passive==='berserker'){
      const missing = 1 - clamp(player.hp/player.maxHp,0,1);
      mult *= 1 + missing*4.5;
    }
    return base*mult;
  }

  function playerLifesteal(){
    let ls = 0;
    if(player.berserkTimer>0 || player.hero.passive==='berserker'){
      const missing = 1 - clamp(player.hp/player.maxHp,0,1);
      ls += missing*.65;
    }
    if(player.dragonTimer>0) ls += .08;
    return ls;
  }

  function recordTimeHistory(){
    if(!player || state!=='playing') return;
    const now = performance.now();
    const lastSnap = timeHistory[timeHistory.length-1];
    if(lastSnap && now-lastSnap.t<120) return;
    timeHistory.push({t:now,x:player.x,y:player.y,vx:player.vx,vy:player.vy,hp:player.hp,mana:player.mana,cameraX,levelIndex});
    timeHistory = timeHistory.filter(s=>now-s.t<=5400);
  }

  function rewindTime(){
    if(!timeHistory.length){ showToast('Sem histórico para voltar'); return; }
    const target = timeHistory[0];
    player.x=target.x; player.y=target.y; player.vx=target.vx; player.vy=target.vy; player.hp=Math.max(target.hp,player.maxHp*.35); player.mana=target.mana; cameraX=target.cameraX;
    projectiles = projectiles.filter(p=>p.owner!=='enemy');
    player.invuln=1600;
    burst(player.x+player.w/2,player.y+player.h/2,82,'#bae6fd',4.5);
    showToast('Voltou 5 segundos no tempo');
  }

  function damageEnemy(e,dmg,source){
    if(!e.alive) return;
    const final = dmg * (e.boss && source==='pisão' ? .72 : 1);
    e.hp -= final;
    e.hurt = 160;
    floatingText(e.x+e.w/2,e.y,`-${Math.round(final)}`,'#fde68a');
    if(e.hp<=0){
      e.alive=false;
      kills++;
      graveyard.push({name:e.name,color:e.color,w:e.w,h:e.h,maxHp:e.maxHp,dmg:e.dmg,speed:e.speed,flying:e.flying,boss:e.boss,raised:false});
      score += e.points || (e.boss?1200:50);
      burst(e.x+e.w/2,e.y+e.h/2,e.boss?80:28,e.color, e.boss?5:3);
      floatingText(e.x,e.y,e.boss?'BOSS DERROTADO':'+ pontos','#facc15');
      audio.win();
      if(e.boss) shake=25;
      if(Math.random()<.28 && !e.boss){ dropPowerup(e.x,e.y); }
    } else {
      audio.hit();
    }
  }

  function dropPowerup(x,y){
    const pType = powerupTypes[Math.floor(rand(0,powerupTypes.length))];
    powerups.push({x,y,w:30,h:30,vy:0,type:pType.type,name:pType.name,icon:pType.icon,color:pType.color,t:0});
  }

  function damagePlayer(dmg,source){
    if(player.invisible>0 && source !== 'queda') return;
    if(player.invuln>0 || player.hurtCd>0 || player.dead) return;
    let amount = dmg;
    if(player.shield>0) amount *= .35;
    player.hp -= amount;
    player.hurtCd = 820;
    player.invuln = 520;
    shake=10;
    floatingText(player.x,player.y,`-${Math.round(amount)}`,'#fca5a5');
    burst(player.x+player.w/2,player.y+player.h/2,18,'#ef4444',2.5);
    audio.hit();
    if(player.hp<=0){
      if(player.revives>0){
        player.revives--;
        player.hp = player.maxHp*.72;
        player.mana = player.maxMana;
        player.invuln = 2600;
        player.dead = false;
        burst(player.x+player.w/2,player.y+player.h/2,90,'#fde68a',4.5);
        showToast('Você reviveu');
      } else gameOver(source);
    }
  }

  function healPlayer(v){
    const before = player.hp;
    player.hp = Math.min(player.maxHp, player.hp+v);
    floatingText(player.x,player.y-18,`+${Math.round(player.hp-before)} vida`,'#86efac');
  }

  function burst(x,y,count,color,size=2){
    for(let i=0;i<count;i++) particles.push({x,y,vx:rand(-size,size),vy:rand(-size*1.7,size*.7),life:rand(260,850),size:rand(1,3.6)*size*.55,color});
  }

  function floatingText(x,y,text,color){
    texts.push({x,y,text,color,life:850,vy:-.7});
  }

  function updateParticles(step){
    particles.forEach(p=>{p.life-=16.666*step;p.x+=p.vx*step;p.y+=p.vy*step;p.vy+=.035*step;});
    particles=particles.filter(p=>p.life>0);
    texts.forEach(t=>{t.life-=16.666*step;t.y+=t.vy*step;});
    texts=texts.filter(t=>t.life>0);
    if(shake>0) shake*=.9;
  }

  function updateCamera(step){
    const target = clamp(player.x - W*.36,0,LEVEL_WIDTH-W);
    cameraX += (target-cameraX)*.12*step;
  }

  function checkEnd(){
    const portal = platforms.find(p=>p.type==='portal');
    if(portal && rectsOverlap(player,portal)){
      if(enemies.some(e=>e.boss && e.alive)){
        showToast('Derrote o boss antes de sair');
        return;
      }
      completeLevel();
    }
  }

  function completeLevel(){
    state='levelComplete';
    message.classList.add('show');
    levelIndex++;
    audio.win();
    if(levelIndex>=10){
      messageTitle.textContent='Você venceu!';
      messageText.textContent=`Pontuação final: ${score} · Monstros derrotados: ${kills}. Os Heróis Seller Pro dominaram todas as fases.`;
      continueBtn.textContent='Jogar novamente';
    } else {
      messageTitle.textContent=`Fase ${levelIndex} concluída`;
      messageText.textContent=`Próxima fase: ${levelIndex+1}/10. Os inimigos ficarão mais rápidos, fortes e numerosos.`;
      continueBtn.textContent='Continuar';
    }
  }

  function nextLevel(){
    if(levelIndex>=10){ startGame(); return; }
    const old = player;
    createPlayer();
    player.maxHp = old.maxHp; player.hp = Math.min(old.hp + 30, player.maxHp);
    player.maxMana = old.maxMana; player.mana = player.maxMana;
    player.weaponLevel = old.weaponLevel; player.dmg = old.dmg;
    player.speed = old.speed; player.hpRegen = old.hpRegen; player.manaRegen = old.manaRegen; player.revives = old.revives || 0;
    score += 250;
    buildLevel();
    message.classList.remove('show');
    state='playing';
  }

  function gameOver(source){
    state='gameOver';
    player.dead=true;
    message.classList.add('show');
    messageTitle.textContent='Fim de jogo';
    messageText.textContent=`Você foi derrotado por ${source}. Pontuação: ${score} · Fase alcançada: ${levelIndex+1}/10.`;
    continueBtn.textContent='Tentar novamente';
  }

  function updateUi(){
    const screen = clamp(Math.floor(player.x/W)+1,1,10);
    statusBar.innerHTML = `
      <span class="pill">${player.hero.icon} ${player.hero.name}</span>
      <span class="pill">Fase ${levelIndex+1}/10 · Tela ${screen}/10</span>
      <span class="pill">Vida ${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}</span>
      <span class="pill">Mana ${Math.ceil(player.mana)}/${Math.ceil(player.maxMana)}</span>
      <span class="pill">Aliados ${allies.length}${player.revives?` · Revives ${player.revives}`:''}</span>
      <span class="pill">Score ${score}</span>`;
  }

  function draw(){
    const theme = levelIndex % 5;
    ctx.save();
    applySceneTransform();
    drawBackground(theme);
    ctx.save();
    if(shake>1) ctx.translate(rand(-shake,shake),rand(-shake,shake));
    ctx.translate(-cameraX,0);
    drawWorld(theme);
    drawPowerups();
    drawTraps();
    drawDrones();
    drawAreaEffects();
    drawProjectiles();
    drawEnemies();
    drawAllies();
    drawPlayer();
    drawParticles();
    drawTexts();
    ctx.restore();
    ctx.restore();
    drawHud();
    drawBossSpeech();
    drawSceneEffectOverlay();
    if(paused) drawPause();
  }

  function applySceneTransform(){
    // O cenário não inverte mais nem fica de cabeça para baixo.
  }

  function drawBackground(theme){
    const g = ctx.createLinearGradient(0,0,0,H);
    const palettes = [ ['#14213d','#0f172a','#06070d'], ['#1f2937','#111827','#030712'], ['#042f2e','#064e3b','#020617'], ['#312e81','#1e1b4b','#09090b'], ['#451a03','#1c1917','#050505'] ];
    g.addColorStop(0,palettes[theme][0]); g.addColorStop(.58,palettes[theme][1]); g.addColorStop(1,palettes[theme][2]);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.globalAlpha=.28;
    for(let i=0;i<18;i++){
      const x = (i*180 - (cameraX*.15)%180);
      const y = 60 + (i%5)*32;
      ctx.fillStyle=i%2?'#ffffff':'#ffedd5';
      ctx.beginPath(); ctx.arc(x,y,1.4+(i%3),0,Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha=1;
    drawLayerMountains(theme,.22,330,70);
    drawLayerMountains(theme,.45,395,110);
  }

  function drawLayerMountains(theme,parallax,baseY,height){
    ctx.save();
    ctx.translate(-(cameraX*parallax)%320,0);
    ctx.fillStyle = theme===2?'rgba(20,184,166,.20)':theme===3?'rgba(168,85,247,.20)':'rgba(255,255,255,.11)';
    for(let x=-360;x<W+500;x+=320){
      ctx.beginPath();
      ctx.moveTo(x,baseY); ctx.lineTo(x+145,baseY-height); ctx.lineTo(x+320,baseY); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function drawWorld(theme){
    for(const p of platforms){
      if(p.type==='ground'){
        ctx.fillStyle='#2b1f16'; ctx.fillRect(p.x,p.y,p.w,p.h);
        ctx.fillStyle=theme===2?'#15803d':theme===3?'#7e22ce':'#4d7c0f'; ctx.fillRect(p.x,p.y,p.w,14);
        for(let x=Math.floor(p.x/48)*48;x<p.x+p.w;x+=48){ ctx.fillStyle='rgba(255,255,255,.04)'; ctx.fillRect(x,p.y+28,30,4); }
      } else if(p.type==='portal'){
        ctx.save();
        ctx.translate(p.x+p.w/2,p.y+p.h/2);
        ctx.rotate(performance.now()/650);
        ctx.strokeStyle='rgba(255,122,24,.95)'; ctx.lineWidth=6; ctx.beginPath(); ctx.ellipse(0,0,28,50,0,0,Math.PI*2); ctx.stroke();
        ctx.strokeStyle='rgba(56,189,248,.8)'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(0,0,18,38,0,0,Math.PI*2); ctx.stroke();
        ctx.restore();
      } else if(p.type==='spikes'){
        for(let x=p.x;x<p.x+p.w;x+=18){
          ctx.fillStyle='#d1d5db'; ctx.beginPath(); ctx.moveTo(x,p.y+p.h); ctx.lineTo(x+9,p.y-18); ctx.lineTo(x+18,p.y+p.h); ctx.closePath(); ctx.fill();
          ctx.strokeStyle='rgba(0,0,0,.25)'; ctx.stroke();
        }
      } else {
        ctx.fillStyle = p.type==='moving' ? '#f97316' : p.type==='brick' ? '#92400e' : '#475569';
        roundRect(p.x,p.y,p.w,p.h,6,true,false);
        ctx.fillStyle='rgba(255,255,255,.16)'; ctx.fillRect(p.x+6,p.y+4,p.w-12,3);
      }
    }
  }

  function drawPowerups(){
    for(const p of powerups){
      ctx.save(); ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(Math.sin(p.t)*.2);
      ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=18; roundRect(-15,-15,30,30,9,true,false);
      ctx.shadowBlur=0; ctx.fillStyle='#fff'; ctx.font='bold 19px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(p.icon,0,1);
      ctx.restore();
    }
  }

  function drawTraps(){
    for(const t of traps){
      ctx.fillStyle=t.color; ctx.globalAlpha=.82; roundRect(t.x,t.y,t.w,t.h,7,true,false); ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(255,255,255,.45)'; ctx.strokeRect(t.x+4,t.y+4,t.w-8,t.h-8);
    }
  }

  function drawDrones(){
    for(const d of drones){
      ctx.fillStyle=d.color; ctx.shadowColor=d.color; ctx.shadowBlur=12; roundRect(d.x,d.y,d.w,d.h,8,true,false); ctx.shadowBlur=0;
      ctx.fillStyle='#0f172a'; ctx.fillRect(d.x+8,d.y+7,14,8);
      ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(d.x+15,d.y-5,8,0,Math.PI*2); ctx.stroke();
    }
  }

  function drawProjectiles(){
    for(const p of projectiles){
      ctx.save();
      ctx.globalAlpha = p.type==='slash' ? clamp(p.life/100,.15,1) : 1;
      ctx.fillStyle=p.color||'#fff'; ctx.shadowColor=p.color||'#fff'; ctx.shadowBlur=12;
      if(p.type==='slash' || p.type==='fireSlash' || p.type==='samurai'){
        ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.scale(p.dir,1); ctx.beginPath(); ctx.ellipse(0,0,p.w/2,p.h/2,0,Math.PI*1.65,Math.PI*.35); ctx.lineTo(8,0); ctx.fill();
      } else if(p.type==='comet' || p.type==='bossMeteor'){
        ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(performance.now()/120); ctx.beginPath(); ctx.moveTo(0,-p.h/2); ctx.lineTo(p.w/2,p.h/2); ctx.lineTo(-p.w/2,p.h/2); ctx.closePath(); ctx.fill();
      } else if(p.type==='laser'){
        ctx.globalAlpha=.7; roundRect(p.x,p.y,p.w,p.h,5,true,false); ctx.globalAlpha=.25; roundRect(p.x,p.y-10,p.w,30,12,true,false);
      } else if(p.type==='dash'){
        ctx.globalAlpha=.25; roundRect(p.x,p.y,p.w,p.h,12,true,false);
      } else if(p.img && p.img.complete && p.img.naturalWidth>0){
        ctx.translate(p.x+p.w/2,p.y+p.h/2);
        ctx.rotate(p.rot||0);
        if(p.dir<0) ctx.scale(-1,1);
        ctx.drawImage(p.img,-p.w/2,-p.h/2,p.w,p.h);
      } else if(p.type==='bossTruck'){
        ctx.save();
        if(p.dir<0){ ctx.translate(p.x+p.w,p.y); ctx.scale(-1,1); } else { ctx.translate(p.x,p.y); }
        ctx.fillStyle='#f97316'; roundRect(0,8,p.w-42,p.h-18,10,true,false);
        ctx.fillStyle='#334155'; roundRect(p.w-68,0,64,45,8,true,false);
        ctx.fillStyle='#bae6fd'; ctx.fillRect(p.w-56,8,28,18);
        ctx.fillStyle='#111827'; ctx.beginPath(); ctx.arc(42,p.h-7,16,0,Math.PI*2); ctx.arc(p.w-58,p.h-7,16,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#e5e7eb'; ctx.font='bold 18px Arial'; ctx.fillText('SP',18,34);
        ctx.restore();
      } else if(p.type==='bossBox'){
        ctx.save(); ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(p.rot||0); ctx.fillStyle='#b45309'; roundRect(-p.w/2,-p.h/2,p.w,p.h,6,true,false); ctx.strokeStyle='rgba(255,255,255,.35)'; ctx.strokeRect(-p.w/2+6,-p.h/2+6,p.w-12,p.h-12); ctx.restore();
      } else if(p.type==='bossCoin'){
        ctx.save(); ctx.translate(p.x+p.w/2,p.y+p.h/2); ctx.rotate(p.rot||0); ctx.fillStyle='#facc15'; ctx.beginPath(); ctx.ellipse(0,0,p.w/2,p.h/2,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='rgba(0,0,0,.32)'; ctx.font='bold 14px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('$',0,1); ctx.restore();
      } else {
        roundRect(p.x,p.y,p.w,p.h,Math.min(p.w,p.h)/2,true,false);
      }
      ctx.shadowBlur=0; ctx.restore();
    }
  }

  function drawEnemies(){
    for(const e of enemies){
      if(e.boss) drawBoss(e); else drawMonster(e);
    }
  }

  function drawMonster(e){
    ctx.save();
    if(e.hurt>0) ctx.globalAlpha=.68;
    if(e.frozen>0){ ctx.shadowColor='#bae6fd'; ctx.shadowBlur=18; }
    ctx.translate(e.x+e.w/2,e.y+e.h/2);
    if(e.flying) ctx.translate(0,Math.sin(performance.now()/180+e.bob)*4);
    ctx.scale(e.dir,1);
    ctx.fillStyle=e.frozen>0?'#bae6fd':e.color;
    roundRect(-e.w/2,-e.h/2,e.w,e.h,12,true,false);
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(-8,-8,5,0,Math.PI*2); ctx.arc(9,-8,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#111827'; ctx.beginPath(); ctx.arc(-7,-8,2,0,Math.PI*2); ctx.arc(10,-8,2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.fillRect(-10,8,20,4);
    if(e.shoot){ctx.fillStyle='#e5e7eb';ctx.fillRect(12,-1,20,8)}
    if(e.flying){ctx.fillStyle='rgba(255,255,255,.32)';ctx.beginPath();ctx.ellipse(-25,-6,18,7,.4,0,Math.PI*2);ctx.ellipse(25,-6,18,7,-.4,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    drawBar(e.x,e.y-13,e.w,e.hp/e.maxHp,'#ef4444');
  }

  function drawBoss(e){
    ctx.save();
    if(e.hurt>0) ctx.globalAlpha=.75;
    const img = e.superBoss ? superBossImage : bossImage;
    const loaded = img.complete && img.naturalWidth > 0;
    if(loaded){
      ctx.drawImage(img,e.x,e.y,e.w,e.h);
    } else {
      ctx.fillStyle=e.frozen>0?'#bae6fd':e.color; ctx.shadowColor=e.color; ctx.shadowBlur=25; roundRect(e.x,e.y,e.w,e.h,22,true,false); ctx.shadowBlur=0;
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(e.x+e.w*.34,e.y+e.h*.32,12,0,Math.PI*2); ctx.arc(e.x+e.w*.66,e.y+e.h*.32,12,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111827'; ctx.beginPath(); ctx.arc(e.x+e.w*.34,e.y+e.h*.32,5,0,Math.PI*2); ctx.arc(e.x+e.w*.66,e.y+e.h*.32,5,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='rgba(0,0,0,.55)'; roundRect(e.x+e.w*.28,e.y+e.h*.62,e.w*.44,13,8,true,false);
      ctx.fillStyle='rgba(255,255,255,.20)'; ctx.fillRect(e.x+18,e.y+16,e.w-36,8);
      ctx.font='bold 24px Arial'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(e.superBoss?'SUPER':'BOSS',e.x+e.w/2,e.y+e.h/2+8);
    }
    ctx.restore();
    if(e.superBoss){
      ctx.save();
      ctx.globalAlpha=.22 + .12*Math.sin(performance.now()/100);
      ctx.strokeStyle='#f97316'; ctx.lineWidth=5;
      ctx.beginPath(); ctx.ellipse(e.x+e.w/2,e.y+e.h/2,e.w*.58,e.h*.58,0,0,Math.PI*2); ctx.stroke();
      ctx.restore();
    }
    drawBar(e.x,e.y-23,e.w,e.hp/e.maxHp,e.superBoss?'#dc2626':'#f97316',10);
    ctx.fillStyle='#fff'; ctx.font='bold 13px Arial'; ctx.textAlign='center'; ctx.fillText(e.name,e.x+e.w/2,e.y-29);
  }

  function drawPlayer(){
    if(!player || (player.invuln>0 && Math.floor(performance.now()/80)%2===0)) return;
    const h = player.hero;
    ctx.save();
    if(player.invisible>0) ctx.globalAlpha=.38;
    ctx.translate(player.x+player.w/2,player.y+player.h/2);
    ctx.scale(player.dir,1);
    const bob = player.onGround ? Math.sin(performance.now()/120)*1.2 : 0;
    ctx.translate(0,bob);
    if(player.dragonTimer>0){
      ctx.fillStyle='rgba(249,115,22,.24)'; ctx.beginPath(); ctx.ellipse(0,2,58,46,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#f97316'; ctx.font='bold 28px Arial'; ctx.textAlign='center'; ctx.fillText('🐉',0,-42);
    }
    if(player.shield>0){
      ctx.strokeStyle='rgba(168,85,247,.85)'; ctx.lineWidth=4; ctx.shadowColor='#a855f7'; ctx.shadowBlur=18; ctx.beginPath(); ctx.ellipse(0,0,34,42,0,0,Math.PI*2); ctx.stroke(); ctx.shadowBlur=0;
    }
    const heroImg = heroImages[selectedHero];
    if(heroImg && heroImg.complete && heroImg.naturalWidth>0){
      ctx.shadowColor=h.color; ctx.shadowBlur=13;
      ctx.drawImage(heroImg,-24,-34,48,68);
      ctx.shadowBlur=0;
    } else {
      ctx.fillStyle=h.color; ctx.shadowColor=h.color; ctx.shadowBlur=13; roundRect(-17,-22,34,42,11,true,false); ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(-7,-10,4,0,Math.PI*2); ctx.arc(8,-10,4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#111827'; ctx.fillRect(7,-12,3,3); ctx.fillRect(-8,-12,3,3);
      ctx.fillStyle='rgba(0,0,0,.35)'; ctx.fillRect(-8,5,16,3);
      ctx.fillStyle='#111827'; roundRect(-20,12,11,23,5,true,false); roundRect(9,12,11,23,5,true,false);
      ctx.fillStyle='rgba(255,255,255,.24)'; roundRect(13,-4,22,8,4,true,false);
      ctx.font='bold 20px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.fillText(h.icon,0,-33);
    }
    ctx.restore();
  }

  function drawAreaEffects(){
    for(const fx of areaEffects){
      ctx.save();
      const pct=clamp(fx.life/(fx.type==='bomb'?1800:5200),0,1);
      ctx.globalAlpha=.22+.28*Math.sin(performance.now()/90)**2;
      ctx.translate(fx.x,fx.y);
      ctx.rotate(performance.now()/650);
      ctx.strokeStyle=fx.color; ctx.lineWidth=fx.type==='bomb'?5:7;
      const r = fx.type==='coordinate'?90:fx.type==='bomb'?48:150;
      ctx.beginPath(); ctx.arc(0,0,r*(.65+pct*.35),0,Math.PI*2); ctx.stroke();
      if(fx.type==='blackhole' || fx.type==='enemyBlackhole'){
        ctx.fillStyle=fx.color; ctx.globalAlpha=.45; ctx.beginPath(); ctx.arc(0,0,42,0,Math.PI*2); ctx.fill();
      }
      if(fx.type==='coordinate'){
        ctx.globalAlpha=.9; ctx.fillStyle='#fff'; ctx.font='900 18px Arial'; ctx.textAlign='center'; ctx.fillText('ALVO',0,6);
      }
      if(fx.type==='bomb'){
        ctx.globalAlpha=.95; ctx.fillStyle=fx.color; roundRect(-28,-28,56,56,16,true,false); ctx.fillStyle='#fff'; ctx.font='900 22px Arial'; ctx.textAlign='center'; ctx.fillText(Math.ceil(fx.life/1000),0,8);
      }
      ctx.restore();
    }
  }

  function drawAllies(){
    for(const a of allies){
      ctx.save();
      ctx.globalAlpha = a.clone ? .72 : .88;
      ctx.translate(a.x+a.w/2,a.y+a.h/2);
      ctx.scale(a.dir,1);
      ctx.shadowColor=a.color; ctx.shadowBlur=18;
      ctx.fillStyle=a.clone ? player.hero.color : a.color;
      roundRect(-a.w/2,-a.h/2,a.w,a.h,12,true,false);
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,.9)'; ctx.font='bold 18px Arial'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(a.clone?'◈':'☠',0,0);
      ctx.restore();
      drawBar(a.x,a.y-10,a.w,a.hp/a.maxHp,'#67e8f9',5);
    }
  }

  function drawParticles(){
    for(const p of particles){
      ctx.globalAlpha=clamp(p.life/700,0,1); ctx.fillStyle=p.color; ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
    }
  }

  function drawTexts(){
    for(const t of texts){
      ctx.globalAlpha=clamp(t.life/850,0,1); ctx.font='bold 16px Arial'; ctx.textAlign='center'; ctx.strokeStyle='rgba(0,0,0,.65)'; ctx.lineWidth=4; ctx.strokeText(t.text,t.x,t.y); ctx.fillStyle=t.color; ctx.fillText(t.text,t.x,t.y); ctx.globalAlpha=1;
    }
  }

  function drawHud(){
    if(!player) return;
    const pad=16;
    ctx.save();
    ctx.globalAlpha=.95; ctx.fillStyle='rgba(3,7,18,.62)'; roundRect(pad,pad,464,86,16,true,false); ctx.globalAlpha=1;
    ctx.fillStyle='#fff'; ctx.font='bold 16px Arial'; ctx.fillText(`${player.hero.icon} ${player.hero.name}`,pad+14,pad+24);
    drawBar(pad+14,pad+35,205,player.hp/player.maxHp,'#ef4444',11,'VIDA');
    drawBar(pad+14,pad+56,205,player.mana/player.maxMana,'#38bdf8',11,'MANA');
    player.hero.skills.forEach((sk,i)=>{
      drawSkillBox(pad+232+i*52,pad+30,SKILL_LABELS[i]||'?',sk.name,player.skillCd[i]||0,sk.cd,player.mana>=sk.cost);
    });

    const screen = clamp(Math.floor(player.x/W)+1,1,10);
    ctx.fillStyle='rgba(3,7,18,.62)'; roundRect(W-250,pad,234,66,16,true,false);
    ctx.fillStyle='#fff'; ctx.font='bold 17px Arial'; ctx.textAlign='right'; ctx.fillText(`Fase ${levelIndex+1}/10`,W-30,pad+24);
    ctx.font='13px Arial'; ctx.fillStyle='#cbd5e1'; ctx.fillText(`Tela ${screen}/10 · Score ${score}`,W-30,pad+46);

    const progressX = 18, progressY = H-22, progressW = W-36;
    ctx.fillStyle='rgba(255,255,255,.12)'; roundRect(progressX,progressY,progressW,8,6,true,false);
    ctx.fillStyle='rgba(255,122,24,.95)'; roundRect(progressX,progressY,progressW*(player.x/(LEVEL_WIDTH-W)),8,6,true,false);
    ctx.restore();
  }

  function drawSkillBox(x,y,key,name,cd,maxCd,hasMana){
    ctx.fillStyle=hasMana?'rgba(255,255,255,.1)':'rgba(239,68,68,.18)'; roundRect(x,y,46,38,10,true,false);
    if(cd>0){ ctx.fillStyle='rgba(0,0,0,.55)'; roundRect(x,y,46,38,10,true,false); ctx.fillStyle='#fff'; ctx.font='bold 13px Arial'; ctx.textAlign='center'; ctx.fillText(Math.ceil(cd/1000),x+23,y+24); }
    else { ctx.fillStyle='#fff'; ctx.font='bold 14px Arial'; ctx.textAlign='center'; ctx.fillText(key,x+23,y+16); ctx.font='9px Arial'; ctx.fillStyle='#cbd5e1'; ctx.fillText(name.slice(0,8),x+23,y+30); }
  }

  function drawBar(x,y,w,pct,color,h=8,label=''){
    pct=clamp(pct,0,1);
    ctx.fillStyle='rgba(255,255,255,.15)'; roundRect(x,y,w,h,h/2,true,false);
    ctx.fillStyle=color; roundRect(x,y,w*pct,h,h/2,true,false);
    if(label){ ctx.fillStyle='#fff'; ctx.font='bold 9px Arial'; ctx.fillText(label,x+w+8,y+h-1); }
  }

  function drawBossSpeech(){
    if(!bossSpeech.life) return;
    ctx.save();
    const alpha = clamp(bossSpeech.life/500,0,1);
    ctx.globalAlpha = alpha;
    const boxW = Math.min(720, W-72);
    const x = (W-boxW)/2;
    const y = 82;
    ctx.fillStyle='rgba(3,7,18,.86)'; roundRect(x,y,boxW,72,18,true,false);
    ctx.strokeStyle='rgba(255,122,24,.75)'; ctx.lineWidth=2; roundRect(x,y,boxW,72,18,false,true);
    ctx.fillStyle='#fdba74'; ctx.font='900 15px Arial'; ctx.textAlign='center'; ctx.fillText(`SUPER BOSS · ${bossSpeech.skill}`,W/2,y+25);
    ctx.fillStyle='#fff'; ctx.font='bold 20px Arial'; ctx.fillText(`“${bossSpeech.text}”`,W/2,y+53);
    ctx.restore();
  }

  function drawSceneEffectOverlay(){
    ctx.save();
    if(sceneEffects.flash>0){
      ctx.globalAlpha = clamp(sceneEffects.flash/280,0,1)*.18;
      ctx.fillStyle='#ffedd5'; ctx.fillRect(0,0,W,H);
    }
    if(timeStopTimer>0){
      ctx.globalAlpha=.94;
      ctx.fillStyle='rgba(14,116,144,.72)'; roundRect(W/2-150,164,300,46,16,true,false);
      ctx.fillStyle='#fff'; ctx.font='900 15px Arial'; ctx.textAlign='center';
      ctx.fillText(`TEMPO CONGELADO ${Math.ceil(timeStopTimer/1000)}s`,W/2,193);
    }
    ctx.restore();
  }

  function drawPause(){
    ctx.fillStyle='rgba(0,0,0,.55)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff'; ctx.font='900 46px Arial'; ctx.textAlign='center'; ctx.fillText('PAUSADO',W/2,H/2);
    ctx.font='18px Arial'; ctx.fillText('Pressione P para continuar',W/2,H/2+36);
  }

  function roundRect(x,y,w,h,r,fill,stroke){
    r=Math.min(r,w/2,h/2);
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath();
    if(fill) ctx.fill(); if(stroke) ctx.stroke();
  }

  function gameLoop(t){
    const dt = last ? t-last : 16.666;
    last = t;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  }

  window.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
    if(e.code==='Space' || e.code==='KeyW' || e.code==='ArrowUp') jump();
    if(e.code==='KeyJ') basicAttack();
    const skillIndex = SKILL_KEYS.indexOf(e.code);
    if(skillIndex>=0) useSkill(skillIndex);
    if(e.code==='KeyP' && state==='playing'){ paused=!paused; showToast(paused?'Pausado':'Continuando'); }
    if(e.code==='KeyR' && state==='playing'){ startGame(); }
    if(e.code==='Enter'){
      if(state==='menu') startGame();
      else if(state==='levelComplete' || state==='gameOver') nextLevel();
    }
  });
  window.addEventListener('keyup',e=>{ keys[e.code]=false; });

  startBtn.addEventListener('click',startGame);
  soundBtn.addEventListener('click',()=>{ muted=!muted; soundBtn.textContent = muted?'Som: desligado':'Som: ligado'; if(!muted) audio.coin(); });
  continueBtn.addEventListener('click',nextLevel);
  backMenuBtn.addEventListener('click',()=>{ state='menu'; message.classList.remove('show'); menu.classList.add('show'); showHeroStatus(); });

  function handleCode(){
    const code = (codeInput?.value || '').trim().toLowerCase();
    if(code === 'ellerpro'){
      secretUnlocked = true;
      localStorage.setItem('sellerpro_secret_heroes','1');
      renderHeroCards();
      showHeroStatus();
      showToast('6 personagens secretos liberados');
      if(codeInput) codeInput.value='';
      return;
    }
    if(code === 'criativo'){
      creativeMode = true;
      localStorage.setItem('sellerpro_creative_mode','1');
      if(creativePanel) creativePanel.classList.add('show');
      syncCreativeFields();
      showToast('Modo programador liberado');
      if(codeInput) codeInput.value='';
      return;
    }
    showToast('Código inválido');
  }

  codeBtn?.addEventListener('click',handleCode);
  codeInput?.addEventListener('keydown',e=>{ if(e.key==='Enter') handleCode(); });
  document.querySelectorAll('#creativePanel input').forEach(el=>el.addEventListener('input',()=>{el.dataset.touched='1';}));
  creativeApplyBtn?.addEventListener('click',()=>{ creativeMode=true; localStorage.setItem('sellerpro_creative_mode','1'); startGame(); });
  if(creativeMode && creativePanel) creativePanel.classList.add('show');

  renderHeroCards();
  showHeroStatus();
  syncCreativeFields();
  requestAnimationFrame(gameLoop);
})();
