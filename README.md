# ハンドシェイクずかん (visp-scsc)

> **VIS**ualize communication **P**rotocols as **S**mall, **C**ute, **S**tylized **C**haracters.

**公開ページ: https://visp.yythzy.com/**

ネットワークプロトコルのハンドシェイクを、RFC の内容にそって **1手ずつ** たどれる学習用 Web アプリです。
パケットはかわいいミニキャラで描かれています。説明は 2 モードあり、画面右上で切り替えられます。

- **大人向け**（標準）: メッセージの要約・技術的な説明・主なフィールド・RFC の節へのリンク
- **こども向け**: 小学生でも読めるひらがな中心のやさしい説明。ボタンなどの画面の文言に加え、図の矢印のラベルもやさしい言葉（「もしもし！」など）になり、技術名は「ほんとうの なまえ」として小さく添える

すべてのレッスンに難しさ（入門・中級・上級 ／ こども向けでは ★〜★★★）が付いていて、メニューと紹介画面に表示されます。

選んだモードはブラウザに保存されます。

## 対応プロトコル

左側のメニューからカテゴリごとに選べます。

| カテゴリ | プロトコル | 主な RFC・規格 | 内容 |
| --- | --- | --- | --- |
| 通しシナリオ | Web ページが表示されるまで | — | Wi-Fi → DHCP → ARP → DNS → TCP → TLS 1.3 → HTTP を 1 本の流れで。各ステップから個別のレッスンへ移動できる |
| 暗号と鍵交換の基礎 | 共通鍵暗号と鍵配送問題 | RFC 5116, RFC 4949 | 同じ鍵で暗号化・復号する仕組みと、鍵を平文で送ると盗聴者に読まれてしまう問題 |
| 暗号と鍵交換の基礎 | 公開鍵暗号で鍵を送る (RSA) | RFC 8017, RFC 5246 | 公開鍵でセッション鍵を暗号化して届ける。小さな数での RSA 計算と、前方秘匿性がない問題 |
| 暗号と鍵交換の基礎 | Diffie-Hellman 鍵交換 | RFC 2631, RFC 7748 | p=23, g=5 での計算。こども向けは「えのぐを混ぜる」たとえ |
| 暗号アルゴリズム | DES | FIPS 46-3, RFC 4772 | Feistel 構造 16 段。鍵スケジュール・f 関数の中身を実際に計算して表示。総当たりで破られる |
| 暗号アルゴリズム | 3DES | NIST SP 800-67, RFC 8429 | E-D-E の 3 段。後方互換の理由と、64 ビットブロックの弱点（Sweet32） |
| 暗号アルゴリズム | AES | FIPS 197, RFC 5116 | 4×4 状態行列で SubBytes / ShiftRows / MixColumns / AddRoundKey を表示（FIPS 197 付録 B の値） |
| 暗号アルゴリズム | 耐量子暗号（ML-KEM） | FIPS 203〜205 | 量子コンピューターの脅威、おもちゃの LWE での KeyGen / Encaps / Decaps、TLS のハイブリッド鍵交換 |
| ネットワークの基本 | DHCP | RFC 2131, RFC 2132 | DORA（Discover / Offer / Request / Ack）・リース更新・解放。取得した設定を持ち物パネルに表示 |
| ネットワークの基本 | ARP | RFC 826, RFC 5227 | ブロードキャストの Request とユニキャストの Reply、ARP キャッシュ、Gratuitous ARP |
| ネットワークの基本 | ping (ICMP) | RFC 792, RFC 1122 | Echo Request / Reply（ルーター経由）と、TTL 切れの Time Exceeded |
| ネットワークの基本 | TCP | RFC 9293, RFC 6298 | 3 ウェイハンドシェイク・パケット消失と再送・4 ウェイ切断。各ノードの TCP 状態を表示 |
| 無線 LAN（Wi-Fi） | Wi-Fi につながるまで | IEEE 802.11 | ビーコン・プローブ → 認証 → アソシエーション → 4-Way Handshake → DHCP。「接続済み」でも Web が開けないときの切り分け。周波数帯・規格の解説付き |
| 無線 LAN（Wi-Fi） | チャネルと DFS | IEEE 802.11h | 2.4GHz 帯のチャネルの重なり（1・6・11ch）、帯ごとのチャネル数、チャネル幅の図。CAC → レーダー検知 → CSA で ch100 から ch36 へ移る |
| 無線 LAN（Wi-Fi） | ローミングと 802.11r | IEEE 802.11r | SSID は同じで BSSID が変わる。802.1X をやり直す通常のローミングと、FT 認証・再アソシエーションで鍵を作る 802.11r。SSID / BSSID / BSS / ESS・メッシュの解説付き |
| 無線 LAN（Wi-Fi） | CSMA/CA と ACK・再送 | IEEE 802.11 | キャリアセンス・DIFS・ランダムバックオフ・ACK。同じ待ち時間による衝突と指数バックオフでの再送を、各端末のカウンタ表示で追える |
| 無線 LAN（Wi-Fi） | 隠れ端末問題と RTS/CTS | IEEE 802.11 | 互いの電波が届かない端末が AP で衝突し、RTS/CTS（NAV）で予約して避ける |
| 無線 LAN（Wi-Fi） | WPA2-Personal | IEEE 802.11 | 4-Way Handshake（ANonce・SNonce・MIC・GTK）と、傍受によるオフライン辞書攻撃・前方秘匿性のなさ |
| 無線 LAN（Wi-Fi） | WPA3-Personal（SAE） | IEEE 802.11, RFC 7664 | SAE の Commit / Confirm で接続ごとの PMK を作る。オフライン辞書攻撃への耐性と前方秘匿性 |
| 無線 LAN（Wi-Fi） | WPA2/3-Enterprise（802.1X・EAP-TLS） | RFC 3748, 5216, 9190, 2865, 3579 | 端末・AP・RADIUS の 3 者。EAP-TLS で証明書による相互認証、認証サーバー証明書の検証、MSK から 4-Way Handshake。検証しないと偽 AP・偽認証サーバーに誘導される |
| 無線 LAN（Wi-Fi） | 偽アクセスポイント（Evil Twin） | 総務省マニュアルほか | 同じ SSID の偽 AP への誘導。平文は読まれ、HTTPS は守られる。暗号化される範囲の違いと対策 |
| 無線 LAN（Wi-Fi） | OWE（パスワードなしでも暗号化） | RFC 8110 | Open 方式では盗聴される → OWE はアソシエーションの DH で端末ごとの鍵を作る。接続先の正当性は確認しない限界も |
| 無線 LAN（Wi-Fi） | 切断攻撃（Deauth）と PMF | IEEE 802.11w | 偽の切断要求による切断と再接続時のハンドシェイク傍受、PMF での拒否、ジャミングは防げないこと |
| Web（HTTP） | HTTP/1.1 | RFC 9110〜9112 | GET と 200 OK、持続的接続、ETag による 304 Not Modified |
| Web（HTTP） | HTTPS | RFC 9110, 6066, 7301, 5280, 6797 | http:// からの 301 リダイレクト、SNI と ALPN、証明書のパス検証、HSTS。盗聴者に見えるもの・見えないものを持ち物パネルで確認 |
| Web（HTTP） | HTTP/2 | RFC 9113, 7541 | TCP＋TLS（ALPN h2）、プリフェイスと SETTINGS、HPACK、ストリームの多重化とインターリーブ、GOAWAY |
| Web（HTTP） | HTTP/3（QUIC） | RFC 9114, 9000, 9001, 9002, 9204 | Alt-Svc / HTTPS RR での発見、1-RTT の QUIC ハンドシェイク、HoL ブロッキングのないパケット消失と再送、コネクションマイグレーション |
| ネットワークの基本 | DNS | RFC 1034, RFC 1035, RFC 9156 | リゾルバーによるルート → TLD → 権威サーバーの反復問い合わせとキャッシュ |
| セキュア通信 | TLS 1.2 | RFC 5246, RFC 8422 | ECDHE_RSA のフルハンドシェイク（2-RTT）〜 close_notify |
| セキュア通信 | TLS 1.3 | RFC 8446 | 1-RTT フルハンドシェイク、NewSessionTicket、close_notify |
| セキュア通信 | SSH | RFC 4251〜4254, RFC 5656, RFC 8731 | バージョン交換・KEXINIT・curve25519 鍵交換とホスト鍵検証・公開鍵認証・チャネルとシェル |
| セキュア通信 | TCP ＋ TLS 1.3 | RFC 9293, 8446, 5961 | HTTP/2 の土台。2-RTT の接続確立と、平文の TCP ヘッダーを使った経路上の第三者による TCP リセット攻撃 |
| セキュア通信 | QUIC（なぜ安全か） | RFC 9000, 9001, 8446, 8470, 9312 | 1-RTT ハンドシェイク、注入したパケットが認証に失敗して破棄される様子、Retry によるアドレス検証、0-RTT とリプレイ。「5 つの理由」「トレードオフ」「実演ネタ」付き |
| 認証 | パスキー（WebAuthn / FIDO2） | WebAuthn Level 3, RFC 9053 | 端末・ブラウザ・Web サービスの 3 者で、登録（5 手）とログイン（5 手）。秘密鍵は端末から出ず、サービスには公開鍵だけが残ることを持ち物パネルで確認。パスワードとの比較付き |
| VPN・トンネル | IPsec | RFC 7296 (IKEv2), RFC 4303 (ESP), RFC 4301 | IKE_SA_INIT / IKE_AUTH / ESP / CREATE_CHILD_SA / Delete |
| VPN・トンネル | L2TP | RFC 2661 (L2TPv2), RFC 3193 | トンネル確立・セッション確立（Ns/Nr 付き）・PPP データ・HELLO・切断 |

## 機能

- シーケンス図の上をパケットキャラが歩いて届く
- 左側のプロトコルメニューは、左上のハンバーガーボタンで表示／非表示を切り替えられる（PC では開閉状態を記憶、スマホではドロワー表示）
- メニューのカテゴリは折りたためる（開閉状態を記憶。開いているレッスンのカテゴリは自動で開く）。検索欄ではレッスン名・説明・メッセージ名（例: ClientHello）で絞り込め、「入門だけ」で入門レッスンに絞れる。比較は関係するカテゴリの中に並ぶ
- 鍵交換のレッスンでは、通信路の真ん中に盗聴者イブがいて、盗み見たメッセージに「コピー」の印が付く。各ノードが持っている鍵・値を一覧する持ち物パネルで、イブが共有鍵を手に入れられないことを確かめられる
- **比較表示**: TLS 1.2 と 1.3、RSA 鍵輸送と DH、DES と AES、DH と ML-KEM、HTTP/2 と HTTP/3、TCP＋TLS と QUIC、WPA2 と WPA3 を左右に並べて同じ手数ずつ進められる。違いの表とポイント付き（URL は `#/compare/tls/0` など）
- 暗号アルゴリズムの値（AES・DES・3DES・おもちゃの LWE）は `src/crypto/` の学習用実装でブラウザ上で計算しており、FIPS 197 などの公式テストベクタでテストしている
- **解説パネル**: ステップにならない「なぜ安全か」「トレードオフ」「実演ネタ」などを、レッスンの最初と最後にカードで表示（`insights`）。プロトコルスタックの図（`introViz` / `viz` の `stacks`）で「比べるべき層」を示せる
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

## 学習用の暗号実装について

`src/crypto/` の AES・DES・3DES・おもちゃの LWE は、途中経過を画面に表示するための学習用の実装です。定数時間処理などの安全対策をしていないため、**実際のデータの暗号化には絶対に使わないでください。** 実運用では、各言語・OS の標準の暗号ライブラリ（Web Crypto API など）を使ってください。

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
   - `insights` で「なぜ安全か」などの解説カード（`kidHeading` のないグループはこども向けでは非表示）、`introViz` で紹介画面の図を付けられる
   - `lost: true` で途中で消えたパケット、`states` でノードの状態（TCP の状態遷移など）、`viz` で暗号の内部状態の図、`see` で別レッスンへのリンク、`refs` で RFC 以外の参照（FIPS など）を表せる
   - `broadcast: true` でブロードキャスト（間にいるノードに「受信」の印）、`via: ['r']` で中継ノード（「転送」の印）を表せる
   - 持ち物パネルを使う場合は、`items` に鍵・値を定義し、`initial`（最初から持っているもの）と各ステップの `gives`（そのステップで手に入れるもの）で ID を指定する。送信者・受信者以外のノードを `gives` に入れると、図に盗み見の「コピー」印が付く
   - プロトコル自体にも `tagline`・`intro`（大人向け）と `kidTagline`・`kidIntro`（こども向け）を書く
   - 画面の固定文言は `src/lib/text.ts` にモード別にまとまっている
   - 色は `src/protocols/colors.ts` の役割別カラーを使うと、プロトコルをまたいで見た目がそろいます
   - 小物（`Accessory`）: `wave` あいさつ, `key` 鍵交換, `scroll` 証明書, `pen` 署名, `flag` 完了, `box` データ, `bell` キープアライブ, `check` ACK, `gear` 設定, `ticket` チケット, `moon` 切断
   - `level`（1 = 入門, 2 = 中級, 3 = 上級）は必須
2. `src/protocols/index.ts` の `categories` の中に追加する（左メニューに表示される）。比較を足すときは `src/protocols/compare.ts` に、並べるカテゴリ（`category`）を指定して追加する
3. `npm test` で、存在しないノードやフェーズへの参照・ID の重複・RFC 一覧の漏れなどがないか検証される

```
src/
  protocols/   プロトコル定義（データ）とテスト
  components/  PacketBuddy（パケットキャラ）, ActorIcon, SequenceDiagram, StepControls, StepDetail, SideNav, KeyInventory
  crypto/      学習用の AES・DES・3DES・おもちゃの LWE 実装とテストベクタ
  lib/         RFC リンク生成、URL ハッシュ、アニメーション用フック
  protocols/compare.ts  比較表示のプリセット
```

## ライセンス

- **ソースコード**: [MIT License](LICENSE)
- **レッスンの文章と絵**（`src/protocols/` の説明文、`PacketBuddy.tsx`・`ActorIcon.tsx`・`favicon.svg` のキャラクターとアイコン、この README の説明文）: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.ja)

対象の範囲や表示の例は [LICENSE](LICENSE) を見てください。CC BY 4.0 の表示の例:

> ハンドシェイクずかん（visp-scsc） https://visp.yythzy.com/ , CC BY 4.0

npm の依存パッケージ、Google Fonts のフォント、参照している RFC や規格などの文書は、それぞれの条件に従います。
