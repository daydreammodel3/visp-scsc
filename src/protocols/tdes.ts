import type { Protocol } from './types';
import { P } from './colors';
import { cryptoActors } from './cryptoActors';
import { hex, tdesDecrypt, tdesEncrypt } from '../crypto/des';
import { SP800_131A, SP800_67, SWEET32, ref } from './cryptoRefs';

const K1 = 0x133457799bbcdff1n;
const K2 = 0x1122334455667788n;
const K3 = 0x77661100dd223311n;
const PT = 0x0123456789abcdefn;
const E = tdesEncrypt(PT, K1, K2, K3);
const D = tdesDecrypt(E.c, K1, K2, K3);
const h = (v: bigint) => hex(v, 64);

export const tdes: Protocol = {
  id: '3des',
  name: '3DES（トリプル DES）',
  level: 2,
  tagline: 'DES を 3 回（暗号化・復号・暗号化）重ねて鍵を長くした延命策',
  kidTagline: 'DES を 3かい かさねて つよくした',
  layer: '暗号アルゴリズム（2023 年末で新規の暗号化には使用不可）',
  rfcs: [
    { rfc: 2451, title: 'The ESP CBC-Mode Cipher Algorithms' },
    { rfc: 8429, title: 'Deprecate Triple-DES (3DES) and RC4 in Kerberos' },
  ],
  standards: [SP800_67, SP800_131A],
  kidIntro:
    'DES の かぎが みじかくて やぶられそうに なったので、DES を 3かい かさねて かぎを ながくしたのが 3DES（トリプル デス）だよ。「しめる → あける → しめる」と 3つの かぎを つかうんだ。でも おそいし、いちどに あつかう かたまりが 8もじと ちいさいので、いまは AES に おきかわったよ。',
  intro:
    '3DES（TDEA）は DES を E-D-E の順に 3 回適用する: C = E_K3(D_K2(E_K1(P)))。中央が復号なのは、K1 = K2 = K3 にすると単一 DES と同じ結果になり、古い機器と互換性を保てるため。鍵は 168 ビットだが、中間一致攻撃により実効的な強度は 112 ビット程度。ブロックが 64 ビットと小さいため、同じ鍵で大量のデータを暗号化すると衝突から平文が漏れる（Sweet32 攻撃）。NIST は 2023 年末で暗号化への使用を禁止した。',
  actors: cryptoActors,
  phases: [
    { id: 'ede', name: 'E-D-E で暗号化', kidName: 'しめる・あける・しめる', color: P.hello },
    { id: 'send', name: '送信と復号', kidName: 'おくって もどす', color: P.data },
    { id: 'weak', name: '弱点', kidName: 'じゃくてん', color: P.close },
  ],
  items: {
    keys: { label: '鍵 K1・K2・K3（各 56 ビット、計 168 ビット）', kidLabel: 'ふたりの かぎ 3ぼん', kind: 'shared', color: '#ff6b6b' },
    pt: { label: `平文 ${h(PT)}`, kidLabel: 'もとの メッセージ', kind: 'plain', color: '#feca57' },
    ct: { label: `暗号文 ${h(E.c)}`, kidLabel: 'よめない メッセージ', kind: 'cipher', color: '#a55eea' },
  },
  initial: { a: ['keys', 'pt'], b: ['keys'] },
  steps: [
    {
      id: 'e1',
      from: 'a',
      to: 'a',
      message: 'K1 で DES 暗号化',
      phase: 'ede',
      look: { color: '#ff9f43', accessory: 'key' },
      summary: '1 段目: K1 で暗号化',
      kidTitle: '1ぽんめの かぎで しめる',
      kid: 'まず 1ぽんめの かぎで、ふつうの DES で しめるよ。',
      detail: '1 段目は通常の DES 暗号化（16 段の Feistel）。',
      viz: {
        kind: 'rows',
        rows: [
          { label: '平文', value: h(PT) },
          { label: 'K1', value: h(K1) },
          { label: 'E_K1(平文)', value: h(E.a), hl: true },
        ],
      },
      refs: [ref(SP800_67)],
    },
    {
      id: 'd2',
      from: 'a',
      to: 'a',
      message: 'K2 で DES 復号',
      phase: 'ede',
      look: { color: '#48dbfb', accessory: 'key' },
      summary: '2 段目: K2 で「復号」する（K1 と違う鍵なので、実際にはさらにかき混ぜられる）',
      kidTitle: '2ほんめの かぎで「あける」',
      kid: 'つぎは 2ほんめの かぎで「あける」よ。でも ちがう かぎだから、もとには もどらずに、もっと ぐちゃぐちゃに なるんだ。',
      detail:
        '中央を復号にしてあるので、K1 = K2 = K3 なら 1 段目と 2 段目が打ち消し合い、単一 DES と同じ動作になる（後方互換）。',
      viz: {
        kind: 'rows',
        rows: [
          { label: '入力', value: h(E.a) },
          { label: 'K2', value: h(K2) },
          { label: 'D_K2(…)', value: h(E.b), hl: true },
        ],
      },
      refs: [ref(SP800_67)],
    },
    {
      id: 'e3',
      from: 'a',
      to: 'a',
      message: 'K3 で DES 暗号化',
      phase: 'ede',
      look: { color: '#a55eea', accessory: 'flag' },
      summary: '3 段目: K3 で暗号化して暗号文が完成する',
      kidTitle: '3ぼんめの かぎで しめて かんせい',
      kid: 'さいごに 3ぼんめの かぎで しめて、あんごうの かんせい！ DES を 3かい つかうから、DES の 3ばい じかんが かかるよ。',
      detail: '3 段目で暗号文が完成する。処理量は DES の 3 倍。2 鍵方式（K3 = K1）もあったが、現在は 3 鍵方式のみが認められている。',
      viz: {
        kind: 'rows',
        rows: [
          { label: '入力', value: h(E.b) },
          { label: 'K3', value: h(K3) },
          { label: '暗号文', value: h(E.c), hl: true },
        ],
      },
      refs: [ref(SP800_67)],
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
      summary: '暗号文を送る',
      kidTitle: 'よめない メッセージを おくるよ',
      kid: 'よめない メッセージを おくるよ。イブも コピーしたよ。',
      detail: '3DES はかつて IPsec の ESP（3DES-CBC）や TLS（TLS_RSA_WITH_3DES_EDE_CBC_SHA）、決済端末などで広く使われた。',
      rfc: [{ rfc: 2451 }],
      gives: { b: ['ct'], e: ['ct'] },
    },
    {
      id: 'decrypt',
      from: 'b',
      to: 'b',
      message: 'D-E-D で復号',
      phase: 'send',
      look: { color: '#feca57', accessory: 'check' },
      summary: 'K3 で復号 → K2 で暗号化 → K1 で復号',
      kidTitle: 'ぎゃくの じゅんばんで もどす',
      kid: 'ボブさんは「3ぼんめで あける → 2ほんめで しめる → 1ぽんめで あける」と ぎゃくに たどって、もとに もどしたよ。',
      detail: '各段を逆順・逆操作で適用する: P = D_K1(E_K2(D_K3(C)))。',
      viz: {
        kind: 'rows',
        rows: [
          { label: 'D_K3(暗号文)', value: h(D.a) },
          { label: 'E_K2(…)', value: h(D.b) },
          { label: 'D_K1(…) = 平文', value: h(D.c), hl: true },
        ],
      },
      gives: { b: ['pt'] },
    },
    {
      id: 'weakness',
      from: 'e',
      to: 'e',
      message: '64 ビットブロックの弱点',
      phase: 'weak',
      danger: true,
      look: { color: '#576574', accessory: 'gear' },
      summary: '同じ鍵で大量に暗号化すると、ブロックの衝突から情報が漏れる（Sweet32）',
      kidTitle: 'たくさん おくると ばれちゃう',
      kid: 'かぎは ながく なったけど、いちどに あつかう かたまりが 8もじと ちいさいので、おなじ かぎで たくさん おくると、おなじ かたちが でてきて ヒントに なっちゃう。だから いまは AES を つかうよ。',
      detail:
        '64 ビットブロックでは、誕生日のパラドックスにより約 2³² ブロック（32 GiB）で暗号文ブロックの衝突が起こりやすくなり、CBC モードでは平文の XOR が漏れる。2016 年の Sweet32 攻撃は、長時間の HTTPS 接続で Cookie を復元できることを示した。また中間一致攻撃により、168 ビット鍵でも強度は約 112 ビットにとどまる。NIST は 2023 年末で 3DES による暗号化を禁止した。',
      rfc: [{ rfc: 8429 }],
      refs: [SWEET32, ref(SP800_131A)],
    },
  ],
};
