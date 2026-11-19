import { useEffect, useState } from 'react';
import { parseHash, toHash } from '../lib/route';

/**
 * 表示する内容を URL のハッシュと同期する（共有・ブラウザの戻る に対応）。
 * 表示が変わったらハッシュを書き換え（履歴は増やさない）、ハッシュが変わったら表示を変える。
 */
export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const hash = toHash(route);
  useEffect(() => {
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
  }, [hash]);
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [route, setRoute] as const;
}
