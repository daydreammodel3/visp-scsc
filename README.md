# ハンドシェイクずかん

ネットワークプロトコルのハンドシェイクを、RFC の内容にそって **1手ずつ** たどれる学習用 Web アプリです。
パケットはかわいいミニキャラで描かれていて、小学生でも楽しめる「やさしい」説明と、
フィールドや RFC の節番号まで載せた「くわしい」説明を切り替えられます。

## 対応プロトコル

| プロトコル | 主な RFC | 内容 |
| --- | --- | --- |
| TLS 1.2 | RFC 5246, RFC 8422 | ECDHE_RSA のフルハンドシェイク（2-RTT）〜 close_notify |
| TLS 1.3 | RFC 8446 | 1-RTT フルハンドシェイク、NewSessionTicket、close_notify |
| IPsec | RFC 7296 (IKEv2), RFC 4303 (ESP), RFC 4301 | IKE_SA_INIT / IKE_AUTH / ESP / CREATE_CHILD_SA / Delete |
| L2TP | RFC 2661 (L2TPv2), RFC 3193 | トンネル確立・セッション確立（Ns/Nr 付き）・PPP データ・HELLO・切断 |

## 機能

- シーケンス図の上をパケットキャラが歩いて届く
- 「さいしょ / もどる / じどう / すすむ / さいご」ボタン、スライダー、速さ切り替え
- キーボード操作：`←` `→` で 1手ずつ、`Space` で自動再生、`Home` / `End`
- 図の矢印をクリック（タップ）するとその手に移動
- URL ハッシュ（例 `#/tls13/3`）に状態が入るので、特定の手をそのまま共有できる
- 暗号化されたメッセージはキャラがシールドと南京錠をまとう／省略可能なメッセージは破線と ※
- スマホでは縦長レイアウトに自動で切り替え

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm test         # プロトコル定義の検証テスト
npm run build    # 型チェック + 本番ビルド（dist/）
```

## Vercel へのデプロイ

Vite の静的サイトなので、リポジトリを Vercel にインポートするだけで動きます（`vercel.json` 同梱）。

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

CLI を使う場合は `npx vercel` → `npx vercel --prod`。

## プロトコルの追加方法

プロトコルは **データだけ** で定義されていて、画面のコードを触らずに追加できます。

1. `src/protocols/<id>.ts` を作り、`Protocol` 型（`src/protocols/types.ts`）のオブジェクトを書く
   - `actors`: 登場するノード（3 つ以上でも可。列が自動で並ぶ）。`icon` は `laptop` / `server` / `router`
   - `phases`: 図の背景の帯になる段階
   - `steps`: メッセージを順番に。`from` / `to` / `phase` / `look`（キャラの色と小物）/ `kid`（やさしい説明）/ `detail`（くわしい説明）/ `fields` / `rfc`
   - 色は `src/protocols/colors.ts` の役割別カラーを使うと、プロトコルをまたいで見た目がそろいます
   - 小物（`Accessory`）: `wave` あいさつ, `key` 鍵交換, `scroll` 証明書, `pen` 署名, `flag` 完了, `box` データ, `bell` キープアライブ, `check` ACK, `gear` 設定, `ticket` チケット, `moon` 切断
2. `src/protocols/index.ts` の `protocols` 配列に追加する
3. `npm test` で、存在しないノードやフェーズへの参照・ID の重複・RFC 一覧の漏れなどがないか検証される

```
src/
  protocols/   プロトコル定義（データ）とテスト
  components/  PacketBuddy（パケットキャラ）, ActorIcon, SequenceDiagram, StepControls, StepDetail
  lib/         RFC リンク生成、URL ハッシュ、アニメーション用フック
```
