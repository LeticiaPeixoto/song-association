import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { FirebaseApp, deleteApp, initializeApp } from 'firebase/app';
import { Firestore, collection, doc, getDoc, getDocs, getFirestore, limit, query } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { FALLBACK_WORDS } from '../constants/game.constants';
import { FirebaseConnectionConfig } from '../models/firebase-config.model';
import { GameWord, WordSource } from '../models/word.model';

/** Documentos são numerados de 1 a 100 dentro de cada coleção de dificuldade. */
const MAX_DOC_ID = 100;

/** Caminho (servido a partir de `public/`) do arquivo texto opcional com as credenciais do Firestore. */
const CONFIG_FILE_PATH = 'firebase-config.txt';

/**
 * Fornece as palavras da partida.
 *
 * Ao iniciar o app, tenta ler o arquivo texto de conexão (`public/firebase-config.txt`). Se ele
 * existir e as credenciais forem válidas, conecta ao Firestore e passa a usar a coleção
 * configurada como fonte das palavras. Caso o arquivo não exista, esteja incompleto, ou a
 * conexão falhe por qualquer motivo, o serviço usa silenciosamente a lista local de palavras —
 * nenhuma ação do usuário é necessária.
 */
@Injectable({ providedIn: 'root' })
export class WordsService {
  private readonly http = inject(HttpClient);

  private readonly _words = signal<GameWord[]>([...FALLBACK_WORDS]);
  private readonly _source = signal<WordSource>('local');

  readonly words = this._words.asReadonly();
  readonly source = this._source.asReadonly();

  private firebaseApp: FirebaseApp | null = null;
  private firestore: Firestore | null = null;
  private collectionName = 'palavras';

  /**
   * Ponto de entrada chamado na inicialização do app (ver `app.config.ts`). Tenta ler o arquivo
   * de conexão e conectar ao Firestore; qualquer falha resulta no uso das palavras locais.
   */
  async init(): Promise<void> {
    const config = await this.readConnectionFile();
    if (!config) {
      this.useLocalWords();
      return;
    }
    await this.connectWithConfig(config);
  }

  /** Usa apenas a lista local de palavras. */
  useLocalWords(): void {
    this._words.set([...FALLBACK_WORDS]);
    this._source.set('local');
  }

  /**
   * Sorteia `count` números aleatórios únicos entre 1 e 100 e busca, um a um, o documento
   * cujo ID corresponde ao número sorteado (ex.: número 42 → documento "42"). Ao final, as
   * palavras recuperadas ficam guardadas em memória e são reaproveitadas em todas as rodadas
   * da partida, sem novas requisições ao Firestore. Se a fonte atual for a lista local, não
   * faz nada (a lista local já cobre esse cenário).
   */
  async loadWordsForRounds(count: number): Promise<void> {
    if (this._source() !== 'firestore' || !this.firestore) return;

    const ids = this.drawUniqueIds(count, MAX_DOC_ID);
    const words: GameWord[] = [];

    for (const id of ids) {
      const docRef = doc(this.firestore, this.collectionName, String(id));
      const snap = await getDoc(docRef);
      if (!snap.exists()) continue;

      const data = snap.data() as Record<string, string>;
      words.push({
        word: data['word-br'] ?? snap.id,
        wordEn: data['word-en'] ?? '—',
      });
    }

    if (words.length === 0) {
      // Nenhum dos IDs sorteados existia na coleção: mantém o app funcional com palavras locais.
      this.useLocalWords();
      return;
    }

    this._words.set(words);
  }

  /**
   * Lê e faz o parse de `public/firebase-config.txt` (formato `chave=valor`, uma por linha,
   * linhas iniciadas com `#` são comentário). Retorna `null` se o arquivo não existir (404) ou
   * estiver sem os campos obrigatórios (`apiKey`, `projectId`).
   */
  private async readConnectionFile(): Promise<FirebaseConnectionConfig | null> {
    let text: string;
    try {
      text = await firstValueFrom(this.http.get(CONFIG_FILE_PATH, { responseType: 'text' }));
    } catch {
      // Arquivo não existe ou não pôde ser buscado — sem conexão configurada, segue com o fallback local.
      return null;
    }

    const fields: Record<string, string> = {};
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const separatorIndex = line.indexOf('=');
      if (separatorIndex === -1) continue;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (key) fields[key] = value;
    }

    const { apiKey, authDomain, projectId, appId, collection: collectionField } = fields;
    if (!apiKey || !projectId) return null;

    return {
      apiKey,
      authDomain: authDomain ?? '',
      projectId,
      appId: appId ?? '',
      collection: collectionField || 'palavras',
    };
  }

  /**
   * Conecta ao Firestore e apenas testa se a coleção informada existe e possui documentos.
   * Em qualquer erro (credenciais inválidas, coleção vazia, falha de rede, etc.), cai
   * silenciosamente para as palavras locais.
   */
  private async connectWithConfig(config: FirebaseConnectionConfig): Promise<void> {
    try {
      if (this.firebaseApp) {
        await deleteApp(this.firebaseApp);
        this.firebaseApp = null;
      }

      this.firebaseApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        appId: config.appId,
      });
      this.firestore = getFirestore(this.firebaseApp);

      const collectionName = config.collection || 'palavras';
      const testQuery = query(collection(this.firestore, collectionName), limit(1));
      const testSnap = await getDocs(testQuery);

      if (testSnap.empty) {
        this.useLocalWords();
        return;
      }

      this.collectionName = collectionName;
      this._source.set('firestore');
    } catch {
      this.useLocalWords();
    }
  }

  /** Sorteia `count` números inteiros únicos entre 1 e `max` (inclusive). */
  private drawUniqueIds(count: number, max: number): number[] {
    const total = Math.min(Math.max(count, 0), max);
    const ids = new Set<number>();
    while (ids.size < total) {
      ids.add(Math.floor(Math.random() * max) + 1);
    }
    return [...ids];
  }
}
