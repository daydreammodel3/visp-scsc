import type { Protocol, Viz } from './types';
import { H2_H3_STACKS } from './transportStacks';
import { findProtocol } from './index';

/** 2 つのプロトコルを並べて比べるプリセット */
export interface ComparePreset {
  id: string;
  name: string;
  kidName: string;
  tagline: string;
  kidTagline: string;
  left: string;
  right: string;
  /** 比較のポイント（大人向け / こども向け） */
  points: { adult: string; kid: string }[];
  /** 表の上に出す図（プロトコルスタックなど） */
  viz?: Viz;
  /** 表に追加する行（左, 右） */
  rows?: { label: string; kidLabel: string; left: string; right: string }[];
}

export const comparePresets: ComparePreset[] = [
  {
    id: 'tls',
    name: 'TLS 1.2 と TLS 1.3',
    kidName: 'TLS 1.2 と 1.3',
    tagline: '往復回数・暗号化の範囲・鍵交換の違い',
    kidTagline: 'あたらしい ほうが はやくて あんぜん',
    left: 'tls12',
    right: 'tls13',
    rows: [
      { label: 'データ送信までの往復', kidLabel: 'おはなし できるまで', left: '2-RTT', right: '1-RTT' },
      { label: '鍵交換', kidLabel: 'かぎの つくりかた', left: 'RSA / (EC)DHE', right: '(EC)DHE のみ（前方秘匿性あり）' },
      { label: '証明書', kidLabel: 'みぶんしょう', left: '平文で送る', right: '暗号化して送る' },
    ],
    points: [
      {
        adult: 'TLS 1.3 は ClientHello に key_share を入れて最初から鍵交換を始めるため、ハンドシェイクが 1 往復短い。',
        kid: 'TLS 1.3 は さいしょの あいさつで かぎの ざいりょうを わたすから、1おうふく はやいよ。',
      },
      {
        adult: 'TLS 1.3 では ServerHello 以降のハンドシェイクが暗号化され、証明書も盗聴者から見えない。',
        kid: 'TLS 1.3 は みぶんしょうも かぎつきで おくるよ。',
      },
      {
        adult: 'TLS 1.3 は静的 RSA 鍵交換・ChangeCipherSpec・CBC モードや RC4 などの古い暗号を廃止した。',
        kid: 'ふるくて あぶない やりかたは ぜんぶ やめたんだ。',
      },
    ],
  },
  {
    id: 'kex',
    name: 'RSA 鍵輸送と Diffie-Hellman',
    kidName: 'RSA と ディフィー・ヘルマン',
    tagline: '鍵を「送る」か「一緒に作る」か。前方秘匿性の違い',
    kidTagline: 'かぎを おくる？ いっしょに つくる？',
    left: 'rsa-kex',
    right: 'dh',
    rows: [
      { label: '共通鍵の作り方', kidLabel: 'かぎの つくりかた', left: '片方が作って暗号化して送る', right: '双方の秘密から一緒に計算する' },
      { label: '前方秘匿性', kidLabel: 'あとから ばれない？', left: 'なし', right: 'あり（エフェメラル DH）' },
      { label: '量子コンピューター', kidLabel: 'みらいの コンピューター', left: '破られる', right: '破られる' },
    ],
    points: [
      {
        adult: 'RSA 鍵輸送では、サーバーの秘密鍵が将来漏れると、記録された過去の通信がすべて解読される。',
        kid: 'RSA は ボブさんの かぎが ぬすまれると、むかしの おはなしも ぜんぶ ばれちゃう。',
      },
      {
        adult: 'DH では共有秘密が通信路に一度も流れない。毎回使い捨ての秘密を使えば前方秘匿性が得られる。',
        kid: 'ディフィー・ヘルマンは かぎを おくらないで つくるから、あとから ばれないよ。',
      },
      {
        adult: 'どちらも認証は別に必要（証明書と署名）。どちらも量子コンピューターには弱く、ML-KEM への移行が進む。',
        kid: 'どちらも みらいの コンピューターには まけちゃうから、あたらしい あんごうが ひつようだよ。',
      },
    ],
  },
  {
    id: 'cipher',
    name: 'DES と AES',
    kidName: 'DES と AES',
    tagline: '鍵長・ブロック長・構造の違い',
    kidTagline: 'むかしの あんごうと いまの あんごう',
    left: 'des',
    right: 'aes',
    rows: [
      { label: '鍵長', kidLabel: 'かぎの ながさ', left: '56 ビット', right: '128 / 192 / 256 ビット' },
      { label: 'ブロック長', kidLabel: 'いちどに あつかう おおきさ', left: '64 ビット', right: '128 ビット' },
      { label: '構造・段数', kidLabel: 'しくみ', left: 'Feistel 構造・16 段', right: 'SPN 構造・10 / 12 / 14 ラウンド' },
      { label: '現在の扱い', kidLabel: 'いまは？', left: '使用禁止（総当たりで破れる）', right: '標準（TLS・IPsec・Wi-Fi など）' },
    ],
    points: [
      {
        adult: 'DES の 2⁵⁶ 通りの鍵は 1998 年に 56 時間で総当たりされた。AES-128 の 2¹²⁸ 通りは現実的に探索できない。',
        kid: 'DES の かぎは ぜんぶ ためせちゃうけど、AES の かぎは おおすぎて ためせないよ。',
      },
      {
        adult: 'DES は左右半分を交互に処理する Feistel 構造、AES は全バイトを毎ラウンド変換する SPN 構造。',
        kid: 'DES は はんぶんずつ、AES は ぜんぶを いっぺんに まぜるよ。',
      },
      {
        adult: 'DES（と 3DES）の 64 ビットブロックは大量データで衝突しやすい（Sweet32）。AES は 128 ビットブロック。',
        kid: 'AES は いちどに あつかう かたまりが おおきいから、たくさん おくっても あんしん。',
      },
    ],
  },
  {
    id: 'pq',
    name: 'Diffie-Hellman と ML-KEM',
    kidName: 'ディフィー・ヘルマンと ML-KEM',
    tagline: '量子コンピューターへの耐性とデータサイズの違い',
    kidTagline: 'いまの かぎの わたしかたと みらいの わたしかた',
    left: 'dh',
    right: 'pqc',
    rows: [
      { label: '安全性の根拠', kidLabel: 'なにが むずかしい？', left: '離散対数問題', right: '格子問題（Module-LWE）' },
      { label: '量子コンピューター', kidLabel: 'みらいの コンピューター', left: 'Shor のアルゴリズムで破られる', right: '耐性あり（と考えられている）' },
      { label: '公開値のサイズ', kidLabel: 'おくる おおきさ', left: 'X25519: 32 バイト', right: 'ML-KEM-768: 1184 / 1088 バイト' },
      { label: '方式', kidLabel: 'やりかた', left: '鍵合意（双方が計算）', right: '鍵カプセル化（片方が包んで送る）' },
    ],
    points: [
      {
        adult: 'DH は双方が公開値を送り合う鍵合意、ML-KEM は公開鍵で共有秘密を「カプセル化」して送る方式。流れは RSA 鍵輸送に近い。',
        kid: 'ML-KEM は、ひみつを つつんで おくる やりかただよ。',
      },
      {
        adult: 'ML-KEM は鍵や暗号文が大きいので、TLS では X25519 と組み合わせたハイブリッド（X25519MLKEM768）で導入されている。',
        kid: 'いまは、むかしの やりかたと あたらしい やりかたを りょうほう つかって あんしんを ふやしているよ。',
      },
    ],
  },
];

comparePresets.push({
  id: 'h2h3',
  name: 'HTTP/2 と HTTP/3',
  kidName: 'HTTP/2 と HTTP/3',
  tagline: 'TCP＋TLS と QUIC。接続までの往復と、パケット消失の影響',
  kidTagline: 'でんわと かぎを べつべつに？ いっぺんに？',
  left: 'http2',
  right: 'http3',
  viz: H2_H3_STACKS,
  rows: [
    { label: 'トランスポート', kidLabel: 'はこびかた', left: 'TCP（＋ TLS 1.3）', right: 'QUIC（UDP、TLS 1.3 を内蔵）' },
    { label: 'リクエストまでの往復', kidLabel: 'おねがい できるまで', left: '2-RTT（TCP 1 ＋ TLS 1）', right: '1-RTT（再接続なら 0-RTT も可）' },
    { label: 'パケット消失の影響', kidLabel: 'カードが なくなったら', left: '全ストリームが止まる（TCP の HoL）', right: '失われたストリームだけ待つ' },
    { label: 'アドレスが変わったら', kidLabel: 'でんぱが かわったら', left: '接続が切れる', right: 'コネクション ID で継続' },
    { label: 'ヘッダー圧縮', kidLabel: 'みじかく する ほうほう', left: 'HPACK', right: 'QPACK' },
  ],
  points: [
    {
      adult:
        'HTTP/2 → HTTP/3 の違いは主に速度。セキュリティの違いは、その下の「TCP＋TLS → QUIC」から来る。比較すべき層は 1 段下にあるので、なぜ安全になったかは「比較: TCP＋TLS と QUIC」で見る。',
      kid: 'HTTP/2 と HTTP/3 の ちがいは おもに はやさ。あんぜんさの ちがいは、その したの「はこびかた」の ちがいから くるよ。',
    },
    {
      adult: 'HTTP/3 は TCP の 3 ウェイハンドシェイクと TLS を QUIC の 1 回のハンドシェイクにまとめたので、リクエストを送れるまでが 1 往復短い。両方の図で GET の位置を比べてみよう。',
      kid: 'HTTP/3 は でんわと かぎを いっぺんに つくるから、1おうふく はやく おねがい できるよ。',
    },
    {
      adult: 'HTTP/2 もストリームを多重化するが、その下の TCP は 1 本のバイト列なので、1 パケットの消失で全ストリームが待たされる。QUIC はストリームごとに順序を管理するのでこれが起きない。',
      kid: 'HTTP/2 は カードが 1まい なくなると ぜんぶ まつけど、HTTP/3 は なくなった ぶんだけ まてば いいよ。',
    },
    {
      adult: 'QUIC は UDP 上で動くため、UDP を遮断するネットワークでは使えず、ブラウザは HTTP/2 にフォールバックする。',
      kid: 'HTTP/3 が つかえない ばしょでは、HTTP/2 に もどして つかうよ。',
    },
  ],
});

comparePresets.push({
  id: 'transport',
  name: 'TCP＋TLS と QUIC',
  kidName: 'TCP＋TLS と QUIC',
  tagline: 'なぜ QUIC でセキュリティが上がるのか。往復回数とヘッダー保護の違い',
  kidTagline: 'ふうとうの おもてまで まもるのは どっち？',
  left: 'tcp-tls',
  right: 'quic',
  viz: H2_H3_STACKS,
  rows: [
    { label: 'リクエストまでの往復', kidLabel: 'おねがい できるまで', left: '2-RTT（TLS 1.2 なら 3-RTT）', right: '1-RTT（再接続なら 0-RTT）' },
    { label: 'ヘッダー', kidLabel: 'ふうとうの おもて', left: 'TCP ヘッダーは平文（seq 番号・フラグ）', right: 'パケット番号を含め大部分を暗号化・認証' },
    { label: '偽パケットの注入', kidLabel: 'にせの あいず', left: '偽 RST で切断できる', right: '認証に失敗して破棄される' },
    { label: '暗号化', kidLabel: 'かぎ', left: 'TLS は別の層（TLS 1.2 も使える）', right: 'TLS 1.3 のみ・平文モードなし' },
    { label: '送信元偽装への対策', kidLabel: 'にせの じゅうしょ', left: 'TCP のハンドシェイクで確認', right: '3 倍制限・Retry トークン・1200 バイト以上' },
    { label: '防御側からの可視性', kidLabel: 'みはりからの みえかた', left: '高い（ヘッダーで状態が分かる）', right: '低い（UDP 443 を止めて TCP に戻す運用も）' },
  ],
  points: [
    {
      adult: '同じ「経路上の第三者」でも、TCP＋TLS では平文の TCP ヘッダーを使った偽 RST で接続を切れる。QUIC ではヘッダーまで認証されるので、注入したパケットは黙って捨てられる。両方の図の後半を比べてみよう。',
      kid: 'おなじ イブの いたずらでも、TCP では でんわが きれて、QUIC では にせものだと ばれて すてられるよ。',
    },
    {
      adult: '1-RTT になったのは、TCP と TLS の重複を暗号設計ごと統合したから。速くするために安全を削ったわけではない。',
      kid: '2つの あいさつを 1つに まとめたから はやいんだ。あんぜんは けずっていないよ。',
    },
    {
      adult: 'トレードオフ: 0-RTT はリプレイされうるので冪等なリクエストに限る。また防御側（ファイアウォール・IDS）からも中身や状態が見えにくくなる。',
      kid: 'すぐ おくる おねがいは コピーされるかも。それに、みはる がわからも みえにくく なるよ。',
    },
  ],
});

export function findPreset(id: string | undefined): ComparePreset | undefined {
  return comparePresets.find((p) => p.id === id);
}

export interface Metrics {
  messages: number;
  encrypted: number;
  local: number;
}

export function metrics(p: Protocol): Metrics {
  const msgs = p.steps.filter((s) => s.from !== s.to);
  return { messages: msgs.length, encrypted: msgs.filter((s) => s.encrypted).length, local: p.steps.length - msgs.length };
}

export function presetProtocols(preset: ComparePreset): [Protocol, Protocol] {
  return [findProtocol(preset.left)!, findProtocol(preset.right)!];
}
