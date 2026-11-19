import type { Protocol } from './types';
import { P } from './colors';
import { cryptoActors } from './cryptoActors';
import { desEncryptTrace, hex, subkeys } from '../crypto/des';
import { FIPS46, SP800_131A, ref } from './cryptoRefs';

// よく知られた計算例（J. Orlin Grabbe "The DES Algorithm Illustrated"）
const KEY = 0x133457799bbcdff1n;
const PT = 0x0123456789abcdefn;
const T = desEncryptTrace(PT, KEY);
const K = subkeys(KEY);
const R1 = T.rounds[0];
const h32 = (v: bigint) => hex(v, 32);
const h48 = (v: bigint) => hex(v, 48);
const CT = hex(T.output, 64);

export const des: Protocol = {
  id: 'des',
  name: 'DES（共通鍵暗号）',
  level: 3,
  tagline: '1977 年の標準暗号。Feistel 構造を 16 段。56 ビット鍵は今では総当たりで破れる',
  kidTagline: 'はんぶんに わけて こうたいで まぜる、むかしの あんごう',
  layer: '暗号アルゴリズム（歴史的。現在は使用禁止）',
  rfcs: [{ rfc: 4772, title: 'Security Implications of Using the Data Encryption Standard (DES)' }],
  standards: [FIPS46, SP800_131A],
  kidIntro:
    'DES（デス）は 50ねんちかく まえに つくられた あんごうだよ。8もじの かたまりを みぎと ひだりの はんぶんに わけて、かたほうを かぎで まぜて もう かたほうに かさねる…を 16かい くりかえすんだ。でも かぎが みじかすぎて、いまの コンピューターなら ぜんぶ ためして やぶれちゃう。だから いまは つかわないよ。',
  intro:
    'DES は 64 ビットブロック・56 ビット鍵（64 ビット中 8 ビットはパリティ）の共通鍵ブロック暗号。ブロックを左右 32 ビットに分け、Lᵢ = Rᵢ₋₁、Rᵢ = Lᵢ₋₁ ⊕ f(Rᵢ₋₁, Kᵢ) を 16 段繰り返す Feistel 構造を持つ。Feistel 構造では f が可逆でなくても、サブ鍵を逆順に使うだけで同じ回路で復号できる。1998 年に専用機が 56 時間で鍵を見つけ、2005 年に規格は廃止された。ここでは有名な計算例の値をブラウザ上で実際に計算して示す。',
  actors: cryptoActors,
  phases: [
    { id: 'prep', name: '鍵スケジュールと初期転置', kidName: 'じゅんび', color: P.keep },
    { id: 'round1', name: 'ラウンド 1 の詳細', kidName: '1かいめを じっくり', color: P.hello },
    { id: 'rounds', name: 'ラウンド 2〜16 と最終転置', kidName: 'くりかえし', color: P.auth },
    { id: 'send', name: '送信と復号', kidName: 'おくって もどす', color: P.data },
    { id: 'attack', name: '総当たり攻撃', kidName: 'やぶられちゃう', color: P.close },
  ],
  items: {
    key: { label: `鍵 ${hex(KEY, 64)}（有効 56 ビット）`, kidLabel: 'ふたりの かぎ（みじかい）', kind: 'shared', color: '#ff6b6b' },
    pt: { label: `平文 ${hex(PT, 64)}`, kidLabel: 'もとの メッセージ', kind: 'plain', color: '#feca57' },
    ct: { label: `暗号文 ${CT}`, kidLabel: 'よめない メッセージ', kind: 'cipher', color: '#a55eea' },
  },
  initial: { a: ['key', 'pt'], b: ['key'] },
  steps: [
    {
      id: 'subkeys',
      from: 'a',
      to: 'a',
      message: '鍵スケジュール（16 個のサブ鍵）',
      phase: 'prep',
      look: { color: '#ff6b6b', accessory: 'key' },
      summary: 'PC-1 で 56 ビットを取り出し、左回転と PC-2 で 48 ビットのサブ鍵を 16 個作る',
      kidTitle: 'かぎを 16こに ふやす',
      kid: 'かぎから、くりかえしごとに つかう 16この かぎを つくるよ。',
      detail:
        'PC-1 でパリティビットを除いた 56 ビットを C・D の 28 ビットずつに分け、段ごとに 1〜2 ビット左回転して PC-2 で 48 ビットを選ぶ。',
      viz: {
        kind: 'rows',
        rows: [
          { label: '鍵（64 ビット）', value: hex(KEY, 64) },
          { label: 'K1', value: h48(K[0]), hl: true },
          { label: 'K2', value: h48(K[1]) },
          { label: '…', value: '…' },
          { label: 'K16', value: h48(K[15]) },
        ],
      },
      refs: [ref(FIPS46)],
    },
    {
      id: 'ip',
      from: 'a',
      to: 'a',
      message: '初期転置 IP',
      phase: 'prep',
      look: { color: '#feca57', accessory: 'gear' },
      summary: '64 ビットを並べ替えて左右 32 ビットに分ける',
      kidTitle: 'ならびかえて はんぶんに わける',
      kid: 'メッセージの じゅんばんを きまった ルールで ならびかえて、ひだり（L）と みぎ（R）に わけるよ。',
      detail: '初期転置 IP はビット位置の並べ替えで、暗号強度にはほぼ寄与しない（1970 年代のハードウェア実装の都合とされる）。',
      viz: {
        kind: 'rows',
        rows: [
          { label: '平文', value: hex(PT, 64) },
          { label: 'IP 後', value: hex(T.ip, 64) },
          { label: 'L0', value: h32(T.l0), hl: true },
          { label: 'R0', value: h32(T.r0), hl: true },
        ],
      },
      refs: [ref(FIPS46)],
    },
    {
      id: 'f1',
      from: 'a',
      to: 'a',
      message: 'f 関数（拡大・XOR・S-box・転置）',
      phase: 'round1',
      look: { color: '#ff9f43', accessory: 'gear' },
      summary: 'R0 を 48 ビットに拡大して K1 と XOR、S-box で 32 ビットに戻し、P で並べ替える',
      kidTitle: 'みぎがわを かぎで まぜる',
      kid: 'みぎの はんぶんを すこし ふくらませて、かぎを かさねて、8この「あんごう表（S-box）」で おきかえて、ならびかえるよ。',
      detail:
        '拡大転置 E で 32 → 48 ビットにし、サブ鍵 K1 と XOR する。6 ビットずつ 8 個の S-box に入れてそれぞれ 4 ビットを得る（DES で唯一の非線形部分）。最後に P 転置で並べ替える。',
      viz: {
        kind: 'rows',
        rows: [
          { label: 'R0', value: h32(T.r0) },
          { label: 'E(R0)', value: h48(R1.f.expanded) },
          { label: 'K1', value: h48(R1.k) },
          { label: 'E(R0) ⊕ K1', value: h48(R1.f.xored) },
          { label: 'S-box 出力', value: h32(R1.f.sboxed) },
          { label: 'f = P(…)', value: h32(R1.f.out), hl: true },
        ],
      },
      refs: [ref(FIPS46)],
    },
    {
      id: 'feistel1',
      from: 'a',
      to: 'a',
      message: 'L と R を入れ替えて XOR',
      phase: 'round1',
      look: { color: '#1dd1a1', accessory: 'gear' },
      summary: 'L1 = R0、R1 = L0 ⊕ f(R0, K1)',
      kidTitle: 'ひだりに かさねて いれかえる',
      kid: 'まぜた ものを ひだりの はんぶんに かさねて、ひだりと みぎを いれかえるよ。これで 1かいめ おわり！',
      detail: 'Feistel 構造の 1 段。右半分はそのまま次の左半分になり、左半分は f の出力と XOR されて次の右半分になる。',
      viz: {
        kind: 'rows',
        rows: [
          { label: 'L1 = R0', value: h32(R1.l) },
          { label: 'R1 = L0 ⊕ f', value: `${h32(T.l0)} ⊕ ${h32(R1.f.out)} = ${h32(R1.r)}`, hl: true },
        ],
      },
      refs: [ref(FIPS46)],
    },
    {
      id: 'rounds',
      from: 'a',
      to: 'a',
      message: 'ラウンド 2〜16',
      phase: 'rounds',
      look: { color: '#5f27cd', accessory: 'gear' },
      summary: 'サブ鍵を変えながら同じ段を 16 段目まで繰り返す',
      kidTitle: 'あと 15かい くりかえす',
      kid: 'おなじ ことを あと 15かい くりかえすよ。',
      detail: '各段の後の L と R。',
      viz: {
        kind: 'rows',
        rows: T.rounds.slice(1).map((r) => ({ label: `L${r.round} R${r.round}`, value: `${h32(r.l)} ${h32(r.r)}` })),
      },
      refs: [ref(FIPS46)],
    },
    {
      id: 'fp',
      from: 'a',
      to: 'a',
      message: '入れ替えと最終転置 IP⁻¹',
      phase: 'rounds',
      look: { color: '#a55eea', accessory: 'flag' },
      summary: 'R16 L16 の順に並べて IP の逆転置をかけ、暗号文が完成する',
      kidTitle: 'よめない メッセージの かんせい！',
      kid: 'さいごに みぎと ひだりを くっつけて、はじめの ならびかえの ぎゃくを すると、あんごうの かんせい！',
      detail: `最後の段の入れ替えを打ち消すため R16 L16 の順に連結し、IP⁻¹ をかける。暗号文 ${CT} は既知の計算例と一致する。`,
      viz: {
        kind: 'rows',
        rows: [
          { label: 'R16 L16', value: hex(T.preoutput, 64) },
          { label: '暗号文', value: CT, hl: true },
        ],
      },
      refs: [ref(FIPS46)],
      gives: { a: ['ct'] },
    },
    {
      id: 'send',
      from: 'a',
      to: 'b',
      message: '暗号文を送る',
      phase: 'send',
      encrypted: true,
      look: { color: '#a55eea', accessory: 'box' },
      summary: '暗号文を送る。盗聴者にも届く',
      kidTitle: 'よめない メッセージを おくるよ',
      kid: 'よめない メッセージを おくるよ。イブも コピーしたよ。',
      detail: '暗号文はイブにも届く。DES の安全性は鍵を知られないことだけに依存している。',
      gives: { b: ['ct'], e: ['ct'] },
    },
    {
      id: 'decrypt',
      from: 'b',
      to: 'b',
      message: 'サブ鍵を逆順にして復号',
      phase: 'send',
      look: { color: '#feca57', accessory: 'check' },
      summary: '同じ手順をサブ鍵 K16 → K1 の順で使うと平文に戻る',
      kidTitle: 'おなじ やりかたで もとに もどる',
      kid: 'ボブさんは おなじ やりかたで、かぎの じゅんばんを ぎゃくに するだけで もとに もどせるよ。',
      detail: 'Feistel 構造の利点で、暗号化と復号の回路が共通。違いはサブ鍵を使う順番だけ。',
      viz: { kind: 'rows', rows: [{ label: '復号結果', value: hex(PT, 64), hl: true }] },
      gives: { b: ['pt'] },
    },
    {
      id: 'brute',
      from: 'e',
      to: 'e',
      message: '総当たりで鍵を発見',
      phase: 'attack',
      danger: true,
      look: { color: '#576574', accessory: 'key' },
      summary: '2⁵⁶ 通りは現代の計算機で探索可能。鍵も平文も漏れる',
      kidTitle: 'かぎを ぜんぶ ためしたら みつかった！',
      kid: 'DES の かぎは 7京（けい）とおりくらい。おおいけど、いまの コンピューターなら ぜんぶ ためせちゃう。イブに かぎを みつけられて、メッセージも よまれちゃった！',
      detail:
        '鍵空間は 2⁵⁶ ≈ 7.2 × 10¹⁶。1998 年に EFF の専用機 Deep Crack が 56 時間で、1999 年には distributed.net との協力で約 22 時間で鍵を発見した。いまでは安価なクラウド計算でも破れるため、DES は使用してはならない。後継として 3DES が延命策に使われ、AES が標準になった。',
      rfc: [{ rfc: 4772 }],
      refs: [ref(SP800_131A)],
      gives: { e: ['key', 'pt'] },
    },
  ],
};
