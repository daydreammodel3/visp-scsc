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

export type ActorIcon = 'laptop' | 'server' | 'router' | 'eve';

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
export type ItemKind = 'public' | 'secret' | 'shared' | 'cipher' | 'plain';

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

export interface Protocol {
  id: string;
  name: string;
  /** 一覧に出す短いサブタイトル（大人向け） */
  tagline: string;
  /** 一覧に出す短いサブタイトル（こども向け） */
  kidTagline: string;
  /** 例: "トランスポート層の上 (TCP)" */
  layer: string;
  rfcs: { rfc: number; title: string }[];
  kidIntro: string;
  intro: string;
  actors: Actor[];
  phases: Phase[];
  steps: Step[];
  /** 持ち物パネルで使う鍵・値の定義。省略するとパネルは表示されない */
  items?: Record<string, KeyItem>;
  /** 最初から各ノードが持っている持ち物 */
  initial?: Record<string, string[]>;
}

export interface Category {
  id: string;
  name: string;
  kidName: string;
  protocols: Protocol[];
}
