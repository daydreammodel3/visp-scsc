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

export type ActorIcon = 'laptop' | 'server' | 'router';

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

export interface Field {
  name: string;
  value: string;
  note?: string;
}

export interface Step {
  id: string;
  from: string;
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
  /** こども向け: ひとことタイトル */
  kidTitle: string;
  /** こども向け: やさしい説明 */
  kid: string;
  /** くわしい説明 */
  detail: string;
  /** 主なフィールド */
  fields?: Field[];
  rfc?: RfcRef[];
}

export interface Protocol {
  id: string;
  name: string;
  /** 一覧に出す短いサブタイトル */
  tagline: string;
  /** 例: "トランスポート層の上 (TCP)" */
  layer: string;
  rfcs: { rfc: number; title: string }[];
  kidIntro: string;
  intro: string;
  actors: Actor[];
  phases: Phase[];
  steps: Step[];
}
