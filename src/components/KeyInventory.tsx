import type { ItemKind, Protocol } from '../protocols/types';
import { inventoryAt } from '../lib/inventory';
import type { Mode } from '../lib/text';

const KIND: Record<ItemKind, { adult: string; kid: string; cls: string }> = {
  public: { adult: '公開', kid: 'みられて OK', cls: 'k-public' },
  secret: { adult: '秘密', kid: 'ないしょ', cls: 'k-secret' },
  shared: { adult: '共有鍵', kid: 'ふたりの かぎ', cls: 'k-shared' },
  cipher: { adult: '暗号文', kid: 'かぎつき', cls: 'k-cipher' },
  plain: { adult: '平文', kid: 'よめる', cls: 'k-plain' },
};

interface Props {
  protocol: Protocol;
  current: number;
  mode: Mode;
}

/** 各ノードが「いま何を持っているか」を並べるパネル */
export function KeyInventory({ protocol, current, mode }: Props) {
  const items = protocol.items;
  if (!items) return null;
  const inv = inventoryAt(protocol, current);
  const kid = mode === 'kid';
  return (
    <section className="inventory" aria-label={kid ? 'みんなが もっているもの' : '各ノードが持っている値'}>
      <h3>{kid ? 'みんなが もっているもの' : '各ノードが持っている鍵・値'}</h3>
      <div className="inv-grid">
        {protocol.actors.map((a) => (
          <div key={a.id} className={`inv-col${a.icon === 'eve' ? ' inv-eve' : ''}`}>
            <p className="inv-name">{kid ? a.kidName : a.name.replace(/（.*）/, '')}</p>
            {inv[a.id].length === 0 ? (
              <p className="inv-empty">{kid ? 'まだ なにも ない' : '—'}</p>
            ) : (
              <ul>
                {inv[a.id].map(({ id, fresh }) => {
                  const it = items[id];
                  const k = KIND[it.kind];
                  return (
                    <li key={id} className={fresh ? 'fresh' : undefined}>
                      <span className="blob" style={{ background: it.color }} aria-hidden="true" />
                      <span className="inv-label">{kid ? it.kidLabel : it.label}</span>
                      <span className={`kind ${k.cls}`}>{kid ? k.kid : k.adult}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
