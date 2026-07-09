# Heróis Seller Pro — Projeto Organizado

Jogo de plataforma 2D feito em HTML, CSS e JavaScript puro.

## Como abrir

1. Extraia o ZIP.
2. Abra `index.html` no navegador.
3. Para melhor carregamento dos `.mp3`, também é possível abrir por um servidor local, por exemplo: `python -m http.server`.

## Estrutura de pastas

```text
herois_seller_pro_organizado/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── game.js
│   ├── img/
│   │   ├── heroes/
│   │   ├── bosses/
│   │   └── boss-skills/
│   └── audio/
│       ├── sons/
│       └── falas/
└── docs/
    └── ESTRUTURA.md
```

## Onde trocar cada arquivo

### Heróis

Substitua as imagens em:

- `assets/img/heroes/heroi1.png`
- `assets/img/heroes/heroi2.png`
- `assets/img/heroes/heroi3.png`
- `assets/img/heroes/heroi4.png`
- `assets/img/heroes/heroi5.png`
- `assets/img/heroes/heroi6.png`
- `assets/img/heroes/heroi7.png`
- `assets/img/heroes/heroi8.png`
- `assets/img/heroes/heroi9.png`
- `assets/img/heroes/heroi10.png`

Mantenha exatamente o mesmo nome do arquivo para o jogo puxar automaticamente.

### Bosses

- Subboss: `assets/img/bosses/boss1.png`
- Super Boss: `assets/img/bosses/super_boss.png`

### Habilidades do Super Boss

- `assets/img/boss-skills/boss_Habilidade1.png`
- `assets/img/boss-skills/boss_Habilidade2.png`
- `assets/img/boss-skills/boss_Habilidade3.png`
- `assets/img/boss-skills/boss_Habilidade4.png`
- `assets/img/boss-skills/boss_Habilidade5.png`
- `assets/img/boss-skills/boss_Habilidade6.png`
- `assets/img/boss-skills/boss_Habilidade7.png`

### Sons `.mp3`

Os efeitos sonoros ficam em:

- `assets/audio/sons/iniciar.mp3`
- `assets/audio/sons/pulo.mp3`
- `assets/audio/sons/dano.mp3`
- `assets/audio/sons/coleta.mp3`
- `assets/audio/sons/habilidade.mp3`
- `assets/audio/sons/vitoria.mp3`
- `assets/audio/sons/boss.mp3`
- `assets/audio/sons/boss_habilidade_01.mp3` até `boss_habilidade_07.mp3`

Também deixei `assets/audio/sons/sons.mp3` como arquivo genérico de referência.

### Falas `.mp3`

As falas do Super Boss ficam em:

- `assets/audio/falas/fala_boss_01.mp3` até `fala_boss_07.mp3`

Também deixei `assets/audio/falas/falas.mp3` como arquivo genérico de referência.

## Observações técnicas

- O `index.html` agora carrega o CSS externo em `assets/css/style.css`.
- O JavaScript principal ficou em `assets/js/game.js`.
- Os caminhos das imagens e áudios foram atualizados para a nova estrutura.
- O jogo ainda mantém fallback sonoro via Web Audio API caso algum `.mp3` não toque no navegador.

## Atualização de habilidades lendárias

- O Super Boss não inverte mais o cenário e não deixa o jogo de cabeça para baixo.
- Código `ellerpro`: libera 6 personagens secretos no menu inicial.
- Código `criativo`: ativa o modo programador, permite editar atributos do herói e iniciar direto na fase final.
- Carlos agora possui Necromancia exclusiva: ao usar a habilidade, inimigos derrotados retornam como aliados temporários.
- Novas teclas de habilidade: `K`, `L`, `I` e `O`.
- Habilidades adicionadas: congelar tempo, voltar 5 segundos, invencibilidade, reviver, berserker com roubo de vida, invisibilidade, explosão da tela, buraco negro, cometa, corte samurai, clones, bomba, forma de dragão e coordenada de ataque.
