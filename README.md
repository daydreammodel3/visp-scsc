# ハンドシェイクずかん (visp-scsc)

> **VIS**ualize communication **P**rotocols as **S**mall, **C**ute, **S**tylized **C**haracters.

ネットワークプロトコルのハンドシェイクを、RFC の内容にそって **1手ずつ** たどれる学習用 Web アプリです。
パケットはかわいいミニキャラで描かれています。説明は 2 モードあり、画面右上で切り替えられます。

- **大人向け**（標準）: メッセージの要約・技術的な説明・主なフィールド・RFC の節へのリンク
- **こども向け**: 小学生でも読めるひらがな中心のやさしい説明。ボタンなどの画面の文言もこども向けになる

選んだモードはブラウザに保存されます。

## 対応プロトコル

左側のメニューからカテゴリごとに選べます。

| カテゴリ | プロトコル | 主な RFC | 内容 |
| --- | --- | --- | --- |
| 暗号と鍵交換の基礎 | 共通鍵暗号と鍵配送問題 | RFC 5116, RFC 4949 | 同じ鍵で暗号化・復号する仕組みと、鍵を平文で送ると盗聴者に読まれてしまう問題 |
| 暗号と鍵交換の基礎 | 公開鍵暗号で鍵を送る (RSA) | RFC 8017, RFC 5246 | 公開鍵でセッション鍵を暗号化して届ける。小さな数での RSA 計算と、前方秘匿性がない問題 |
| 暗号と鍵交換の基礎 | Diffie-Hellman 鍵交換 | RFC 2631, RFC 7748 | p=23, g=5 での計算。こども向けは「えのぐを混ぜる」たとえ |
| セキュア通信 | TLS 1.2 | RFC 5246, RFC 8422 | ECDHE_RSA のフルハンドシェイク（2-RTT）〜 close_notify |
| セキュア通信 | TLS 1.3 | RFC 8446 | 1-RTT フルハンドシェイク、NewSessionTicket、close_notify |
| VPN・トンネル | IPsec | RFC 7296 (IKEv2), RFC 4303 (ESP), RFC 4301 | IKE_SA_INIT / IKE_AUTH / ESP / CREATE_CHILD_SA / Delete |
| VPN・トンネル | L2TP | RFC 2661 (L2TPv2), RFC 3193 | トンネル確立・セッション確立（Ns/Nr 付き）・PPP データ・HELLO・切断 |

## 機能

- シーケンス図の上をパケットキャラが歩いて届く
- 左側のプロトコルメニューは、左上のハンバーガーボタンで表示／非表示を切り替えられる（PC では開閉状態を記憶、スマホではドロワー表示）
- 鍵交換のレッスンでは、通信路の真ん中に盗聴者イブがいて、盗み見たメッセージに「コピー」の印が付く。各ノードが持っている鍵・値を一覧する持ち物パネルで、イブが共有鍵を手に入れられないことを確かめられる
- 「最初 / 戻る / 自動再生 / 進む / 最後」ボタン、スライダー、速さ切り替え
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
   - `actors`: 登場するノード（3 つ以上でも可。列が自動で並ぶ）。`icon` は `laptop` / `server` / `router` / `eve`（盗聴者）
   - `phases`: 図の背景の帯になる段階
   - `steps`: メッセージを順番に。`from` / `to` / `phase` / `look`（キャラの色と小物）/ `summary`・`detail`（大人向けの要約と説明）/ `kidTitle`・`kid`（こども向け）/ `fields` / `rfc`
   - `from` と `to` を同じにすると、そのノードの中での処理（鍵の生成・計算など）として描かれる
   - `danger: true` で「危険な操作」の表示になる
   - 持ち物パネルを使う場合は、`items` に鍵・値を定義し、`initial`（最初から持っているもの）と各ステップの `gives`（そのステップで手に入れるもの）で ID を指定する。送信者・受信者以外のノードを `gives` に入れると、図に盗み見の「コピー」印が付く
   - プロトコル自体にも `tagline`・`intro`（大人向け）と `kidTagline`・`kidIntro`（こども向け）を書く
   - 画面の固定文言は `src/lib/text.ts` にモード別にまとまっている
   - 色は `src/protocols/colors.ts` の役割別カラーを使うと、プロトコルをまたいで見た目がそろいます
   - 小物（`Accessory`）: `wave` あいさつ, `key` 鍵交換, `scroll` 証明書, `pen` 署名, `flag` 完了, `box` データ, `bell` キープアライブ, `check` ACK, `gear` 設定, `ticket` チケット, `moon` 切断
2. `src/protocols/index.ts` の `categories` の中に追加する（左メニューに表示される）
3. `npm test` で、存在しないノードやフェーズへの参照・ID の重複・RFC 一覧の漏れなどがないか検証される

```
src/
  protocols/   プロトコル定義（データ）とテスト
  components/  PacketBuddy（パケットキャラ）, ActorIcon, SequenceDiagram, StepControls, StepDetail, SideNav, KeyInventory
  lib/         RFC リンク生成、URL ハッシュ、アニメーション用フック
```
