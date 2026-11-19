/**
 * プロトコル定義のデータモデル。
 * 新しいプロトコルを追加するときは、この型に沿ったオブジェクトを
 * src/protocols/<id>.ts に書き、src/protocols/index.ts の一覧に加えるだけでよい。
 */

/** パケットキャラクターが持つ小物（メッセージの役割をあらわす） */
export type Accessory =
  | 'wave' // あいさつ（Hello 系）
  | 'key' // かぎの材料（鍵交換）
  | 'scroll' // 証明書
  | 'pen' // 署名
  | 'flag' // 完了（Finished）
  | 'box' // データの荷物
  | 'bell' // 生きてる？の確認（キープアライブ）
  | 'check' // 受け取ったよ（ACK）
  | 'gear' // 設定・切り替え
  | 'ticket' // 次回用のチケット
  | 'moon'; // おしまい・切断

export type ActorIcon = 'laptop' | 'server' | 'router' | 'eve' | 'authenticator' | 'radar';

export interface Actor {
  id: string;
  /** 技術的な名前（例: クライアント / LAC） */
  name: string;
  /** こども向けの呼び名 */
  kidName: string;
  icon: ActorIcon;
}

export interface Phase {
  id: string;
  name: string;
  kidName: string;
  /** フェーズ帯の色（CSS カラー） */
  color: string;
}

export interface RfcRef {
  rfc: number;
  /** 例: "4.1.2"。省略時は RFC 全体へのリンク */
  section?: string;
  /** 例: "Appendix D.4" のように section 以外で表示したい場合 */
  label?: string;
}

/** 鍵や値の種類。持ち物パネルでのバッジ表示に使う */
export type ItemKind = 'public' | 'secret' | 'shared' | 'cipher' | 'plain' | 'info';

/** ノードが持つ鍵・値（持ち物パネルに表示される） */
export interface KeyItem {
  /** 大人向けの表示（例: "A = gᵃ mod p = 4"） */
  label: string;
  /** こども向けの表示 */
  kidLabel: string;
  kind: ItemKind;
  /** 絵の具・鍵の色 */
  color: string;
}

/** 暗号の内部状態などを図で見せるための表示 */
export type Viz =
  | {
      kind: 'grid';
      /** AES の 4×4 状態（列優先の 16 バイト） */
      before?: number[];
      after: number[];
      caption: string;
    }
  | {
      kind: 'rows';
      /** DES の左右半分・ビット列など。hl は強調 */
      rows: { label: string; value: string; hl?: boolean }[];
      caption?: string;
    }
  | {
      kind: 'bars';
      /** マス目の数で比べる棒グラフ（チャネル数・チャネル幅など）。1 マス = unit */
      rows: { label: string; sub?: string; value: number; display?: string; hl?: boolean }[];
      caption?: string;
    }
  | {
      kind: 'spectrum';
      /** 周波数の重なり（2.4GHz 帯のチャネルなど）。channels 本を 1 番から並べ、各チャネルは span 本ぶんの幅を持つ */
      channels: number;
      span: number;
      highlight: number[];
      title?: string;
      caption?: string;
    }
  | {
      kind: 'stacks';
      /** プロトコルスタックを左右に並べる（上が上位層）。hl の層を強調 */
      stacks: { title: string; layers: { label: string; note?: string; hl?: boolean }[] }[];
      caption?: string;
    };

/** ステップにならない解説（「なぜ安全か」「トレードオフ」など）の 1 項目 */
export interface Insight {
  title: string;
  body: string;
  /** 比較対象（「パスワード：…」など） */
  vs?: string;
  /** コマンド例など等幅で見せたいもの */
  code?: string;
  kidTitle?: string;
  kidBody?: string;
  kidVs?: string;
}

/** 解説のまとまり。kidHeading がないグループはこども向けモードでは表示しない */
export interface InsightGroup {
  id: string;
  heading: string;
  kidHeading?: string;
  /** グループの上に出す図 */
  viz?: Viz;
  items: Insight[];
}

export interface DocRef {
  label: string;
  url: string;
}

export interface Field {
  name: string;
  value: string;
  note?: string;
}

export interface Step {
  id: string;
  from: string;
  /** from と同じにすると、そのノードの中での処理（鍵の生成・計算など）として描かれる */
  to: string;
  /** プロトコル上のメッセージ名（例: ClientHello） */
  message: string;
  phase: string;
  /** パケットキャラの見た目 */
  look: { color: string; accessory: Accessory };
  /** 暗号化されて送られるか（キャラがシールドをまとう） */
  encrypted?: boolean;
  /** 省略されることがあるメッセージ */
  optional?: boolean;
  /** やってはいけない操作（赤い「危険」表示） */
  danger?: boolean;
  /** ブロードキャスト。from と to の間にいるノードにも「受信」の印が付く */
  broadcast?: boolean;
  /** 途中で中継するノード（ルーターなど）。「転送」の印が付く */
  via?: string[];
  /** 途中で失われたパケット（矢印が途中で ✕ になる） */
  lost?: boolean;
  /** このステップのあとの各ノードの状態（TCP の状態遷移など） */
  states?: Record<string, string>;
  /** 暗号の内部状態などの図 */
  viz?: Viz;
  /** RFC 以外の参照（NIST FIPS など） */
  refs?: DocRef[];
  /** 「くわしく見る」リンク（別のプロトコルの該当ステップへ） */
  see?: { protocol: string; step?: number };
  /**
   * このステップのあとで各ノードが新しく手に入れる持ち物（Protocol.items の ID）。
   * 送信者と受信者以外のノード（盗聴者など）を入れると、途中で盗み見たことを表す。
   */
  gives?: Record<string, string[]>;
  /** 大人向け: ひとことで言うと何をするメッセージか */
  summary: string;
  /** こども向け: ひとことタイトル */
  kidTitle: string;
  /** こども向け: やさしい説明 */
  kid: string;
  /** 大人向けの説明 */
  detail: string;
  /** 主なフィールド */
  fields?: Field[];
  rfc?: RfcRef[];
}

/** 難しさ: 1 = 入門（こどもでも楽しめる）, 2 = 中級, 3 = 上級 */
export type Level = 1 | 2 | 3;

export interface Protocol {
  id: string;
  name: string;
  level: Level;
  /** 一覧に出す短いサブタイトル（大人向け） */
  tagline: string;
  /** 一覧に出す短いサブタイトル（こども向け） */
  kidTagline: string;
  /** 例: "トランスポート層の上 (TCP)" */
  layer: string;
  rfcs: { rfc: number; title: string }[];
  /** RFC 以外の規格（FIPS など） */
  standards?: (DocRef & { title: string })[];
  /** 紹介画面に出す図（プロトコルスタックなど）。複数並べることもできる */
  introViz?: Viz | Viz[];
  /** 紹介画面と最後のステップに出す解説（なぜ安全か・トレードオフなど） */
  insights?: InsightGroup[];
  kidIntro: string;
  intro: string;
  actors: Actor[];
  phases: Phase[];
  steps: Step[];
  /** 持ち物パネルで使う鍵・値の定義。省略するとパネルは表示されない */
  items?: Record<string, KeyItem>;
  /** 最初から各ノードが持っている持ち物 */
  initial?: Record<string, string[]>;
  /** 最初の各ノードの状態（states を使う場合） */
  initialStates?: Record<string, string>;
}

export interface Category {
  id: string;
  name: string;
  kidName: string;
  protocols: Protocol[];
}
