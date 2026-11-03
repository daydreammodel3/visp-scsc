/** 表示モード: adult = 大人向け（標準）, kid = こども向け */
export type Mode = 'adult' | 'kid';

export const DEFAULT_MODE: Mode = 'adult';

/** 画面の固定文言。プロトコル固有の文章は各プロトコル定義側に持つ */
export const UI = {
  adult: {
    subtitle: '通信プロトコルのハンドシェイクを1ステップずつ可視化',
    modeGroup: '説明の対象',
    pickProtocol: 'プロトコルを選択',
    openMenu: 'メニューを開く',
    closeMenu: 'メニューを閉じる',
    diagram: '通信シーケンス',
    first: '最初',
    prev: '戻る',
    play: '自動再生',
    pause: '停止',
    replay: 'もう一度',
    next: '進む',
    last: '最後',
    stepUnit: 'ステップ',
    slider: 'ステップ位置',
    speedGroup: '再生速度',
    speeds: { slow: '遅い', normal: '標準', fast: '速い' },
    toolbar: 'ステップ操作',
    encrypted: '暗号化',
    optional: '省略される場合あり',
    danger: '危険な操作',
    fields: '主なフィールド',
    refs: '参照：',
    introLead: (name: string) => `${name} のハンドシェイク`,
    introStart: '「進む」または → キーで開始',
    nodes: '登場するノード',
    layer: 'レイヤー',
    legendLock: 'シールド＋南京錠 ＝ 暗号化されたメッセージ',
    legendDash: '破線・※ ＝ 省略可能なメッセージ',
  },
  kid: {
    subtitle: 'パケットたちの「あいさつ」を 1手ずつ 見てみよう',
    modeGroup: 'せつめいの むずかしさ',
    pickProtocol: 'プロトコルを えらぶ',
    openMenu: 'メニューを ひらく',
    closeMenu: 'メニューを とじる',
    diagram: 'つうしんの ながれ',
    first: 'さいしょ',
    prev: 'もどる',
    play: 'じどう',
    pause: 'とめる',
    replay: 'もういちど',
    next: 'すすむ',
    last: 'さいご',
    stepUnit: 'て',
    slider: 'ステップの いち',
    speedGroup: 'はやさ',
    speeds: { slow: 'ゆっくり', normal: 'ふつう', fast: 'はやい' },
    toolbar: 'ステップそうさ',
    encrypted: 'かぎつき',
    optional: 'ないときも あるよ',
    danger: 'やっちゃ だめ！',
    fields: 'おもな フィールド',
    refs: 'もとになった きまり：',
    introLead: (name: string) => `${name} の せかいへ ようこそ！`,
    introStart: '「すすむ」を おして スタート！',
    nodes: 'とうじょうじんぶつ',
    layer: 'どこで はたらく？',
    legendLock: 'シールドと かぎ ＝ かぎつき（ほかの人には よめない）',
    legendDash: 'てんせん と ※ ＝ ないときも ある',
  },
} as const;

export function loadMode(): Mode {
  try {
    const v = localStorage.getItem('audience');
    return v === 'kid' || v === 'adult' ? v : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

export function saveMode(mode: Mode): void {
  try {
    localStorage.setItem('audience', mode);
  } catch {
    /* ストレージが使えない環境では保存しない */
  }
}

/** "イニシエーター（VPN ゲートウェイ A）" → ["イニシエーター", "VPN ゲートウェイ A"] */
export function splitName(name: string): [string, string | undefined] {
  const m = name.match(/^(.*?)（(.*)）$/);
  return m ? [m[1], m[2]] : [name, undefined];
}
