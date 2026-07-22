# Song Association 🎮

Jogo de adivinhação de palavras em turnos (estilo "Contra o Relógio"), construído em **Angular 18** (standalone components + signals) com **Bootstrap 5** para o grid/utilitários, além de estilos customizados que replicam o tema escuro do protótipo original.

## Como rodar

```bash
npm install
npm start        # abre em http://localhost:4200
```

Outros comandos úteis:

```bash
npm run build     # build de produção em dist/song-association
```

## Fluxo do jogo

Ao iniciar, o app tenta conectar ao Firestore usando o arquivo de conexão (veja seção abaixo). Se não houver arquivo, ou a conexão falhar, ele segue automaticamente com a lista local de palavras — não há nenhuma tela de configuração manual.

1. **/setup** — cadastro de 2 a 4 jogadores e escolha do tempo por rodada.
2. **/transicao** — tela de "passe o celular", mostrando de quem é a vez.
3. **/jogo** — tela principal: temporizador circular, sorteio de palavra, indicação da fonte da palavra (Firestore ou Local), botão de silenciar sons, marcar/desmarcar jogadores que pontuaram na rodada, passar a palavra, e encerrar a partida antes do fim.
4. **/ranking** — pontuação final, com destaque para o vencedor (ou empate) e opções de jogar novamente ou recomeçar com outros jogadores.

## Arquitetura

```
src/app/
├── core/
│   ├── constants/     # cores, avatares, opções de tempo, palavras de fallback
│   ├── guards/        # protege rotas de jogo sem jogadores configurados
│   ├── models/        # interfaces (Player, GameWord, LogEntry, FirebaseConnectionConfig, ...)
│   └── services/      # GameStateService, TimerService, WordsService, AudioService
├── features/
│   ├── setup/             # tela de configuração da partida
│   │   └── player-slot/   # sub-componente: um input de nome de jogador
│   ├── transition/        # tela "passe o celular"
│   ├── game/              # tela principal do jogo
│   │   └── components/    # player-score-buttons, round-timer, word-card,
│   │                       # game-actions, end-game-modal
│   └── ranking/           # tela de resultado final
│       └── components/    # rank-card, confetti-canvas
```

- **Gerenciamento de estado**: `GameStateService` centraliza jogadores, rodada, log de eventos e estatísticas usando Angular Signals; `TimerService` cuida apenas da contagem regressiva; `AudioService` sintetiza via Web Audio API os sons de tique-taque e buzzer, com suporte a mudo.
- **Componentização**: cada tela (feature) é um componente container "burro" o mínimo possível, delegando UI e eventos para componentes de apresentação menores via `@Input`/`@Output`.
- **Firestore**: integração feita com o SDK modular do `firebase` (sem `@angular/fire`), isolada inteiramente em `WordsService`.
- **Roteamento**: lazy-loading de cada feature via `loadComponent`, com um guard simples impedindo acesso direto a `/jogo`, `/transicao` e `/ranking` sem jogadores configurados.

## Personalizando as palavras via Firestore

A conexão com o Firestore é feita por um **arquivo de texto**, sem nenhuma tela ou formulário:

1. Copie `public/firebase-config.example.txt` para `public/firebase-config.txt` (esse arquivo é ignorado pelo git, pois costuma conter credenciais reais).
2. Preencha os campos `apiKey`, `authDomain`, `projectId`, `appId` e `collection` (formato `chave=valor`, uma por linha).
3. Crie a coleção correspondente (padrão: `palavras`) com documentos no formato:

   ```json
   { "word": "Abacaxi", "cat": "Fruta" }
   ```

Ao iniciar, o `WordsService` lê `firebase-config.txt` e tenta conectar automaticamente. Se o arquivo não existir, estiver incompleto, ou a conexão falhar por qualquer motivo (credenciais inválidas, coleção vazia, sem internet, etc.), o app usa a lista local de palavras (`FALLBACK_WORDS`) sem exibir erro algum ao jogador.
