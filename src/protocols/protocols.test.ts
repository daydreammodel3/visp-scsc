import { describe, expect, it } from 'vitest';
import { protocols } from './index';
import { parseHash, toHash } from '../lib/route';
import { rfcLabel, rfcUrl } from '../lib/rfc';
import { inventoryAt } from '../lib/inventory';
import { categories } from './index';

describe('プロトコル定義', () => {
  it('すべてのプロトコルがちょうど 1 つのカテゴリに入っている', () => {
    const ids = categories.flatMap((c) => c.protocols.map((p) => p.id));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(protocols.length);
  });

  it('ID が重複していない', () => {
    const ids = protocols.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const p of protocols) {
    describe(p.name, () => {
      it('大人向け・こども向けの紹介文がある', () => {
        for (const v of [p.tagline, p.kidTagline, p.intro, p.kidIntro]) expect(v.trim()).not.toBe('');
      });

      it('ステップが 1 つ以上ある', () => {
        expect(p.steps.length).toBeGreaterThan(0);
      });

      it('ステップ ID が重複していない', () => {
        const ids = p.steps.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it('from / to / phase が定義済みのものを指している', () => {
        const actorIds = new Set(p.actors.map((a) => a.id));
        const phaseIds = new Set(p.phases.map((ph) => ph.id));
        for (const s of p.steps) {
          expect(actorIds, `${s.id}.from`).toContain(s.from);
          expect(actorIds, `${s.id}.to`).toContain(s.to);
          expect(phaseIds, `${s.id}.phase`).toContain(s.phase);
        }
      });

      it('持ち物（items / initial / gives）の参照が正しい', () => {
        const actorIds = new Set(p.actors.map((a) => a.id));
        const itemIds = new Set(Object.keys(p.items ?? {}));
        const refs = [Object.entries(p.initial ?? {}), ...p.steps.map((s) => Object.entries(s.gives ?? {}))].flat();
        if (refs.length > 0) expect(p.items, 'items が未定義').toBeDefined();
        for (const [actor, ids] of refs) {
          expect(actorIds).toContain(actor);
          for (const id of ids) expect(itemIds).toContain(id);
        }
      });

      it('ノード内の処理（from === to）は他のノードに持ち物を渡さない', () => {
        for (const s of p.steps.filter((s) => s.from === s.to))
          for (const actor of Object.keys(s.gives ?? {})) expect(actor, s.id).toBe(s.from);
      });

      it('すべてのフェーズが使われている', () => {
        const used = new Set(p.steps.map((s) => s.phase));
        for (const ph of p.phases) expect(used, ph.id).toContain(ph.id);
      });

      it('説明文が空でない', () => {
        for (const s of p.steps) {
          expect(s.kid.trim(), `${s.id}.kid`).not.toBe('');
          expect(s.detail.trim(), `${s.id}.detail`).not.toBe('');
          expect(s.kidTitle.trim(), `${s.id}.kidTitle`).not.toBe('');
          expect(s.summary.trim(), `${s.id}.summary`).not.toBe('');
        }
      });

      it('ステップの RFC 参照はプロトコルの RFC 一覧に含まれる', () => {
        const rfcs = new Set(p.rfcs.map((r) => r.rfc));
        for (const s of p.steps) for (const r of s.rfc ?? []) expect(rfcs, `${s.id}`).toContain(r.rfc);
      });
    });
  }
});

describe('L2TP のシーケンス番号', () => {
  it('Ns/Nr が RFC 2661 の規則どおりに進む', () => {
    const l2tp = protocols.find((p) => p.id === 'l2tp')!;
    const sent: Record<string, number> = { lac: 0, lns: 0 }; // 次に使う Ns
    const recv: Record<string, number> = { lac: 0, lns: 0 }; // 次に受け取りたい Ns (= Nr)
    for (const s of l2tp.steps) {
      const header = s.fields?.find((f) => f.name === 'ヘッダー')?.value ?? '';
      const m = header.match(/Ns=(\d+), Nr=(\d+)/);
      if (!m) continue; // データメッセージ
      expect(Number(m[1]), `${s.id} Ns`).toBe(sent[s.from]);
      expect(Number(m[2]), `${s.id} Nr`).toBe(recv[s.from]);
      const isZlb = s.message.startsWith('ZLB');
      if (!isZlb) {
        sent[s.from] += 1;
        recv[s.to] += 1;
      }
    }
  });
});

describe('ルーティング', () => {
  it('ハッシュを往復できる', () => {
    expect(parseHash(toHash({ protocolId: 'tls13', step: 3 }))).toEqual({ protocolId: 'tls13', step: 3 });
  });
  it('不正な値は丸める', () => {
    expect(parseHash('#/nope/999').protocolId).toBe(protocols[0].id);
    expect(parseHash('#/tls12/999').step).toBe(protocols.find((p) => p.id === 'tls12')!.steps.length);
    expect(parseHash('#/tls12/-4').step).toBe(0);
    expect(parseHash('').step).toBe(0);
  });
});

describe('RFC リンク', () => {
  it('セクションと付録のアンカーを作る', () => {
    expect(rfcUrl({ rfc: 8446, section: '4.1.2' })).toBe('https://www.rfc-editor.org/rfc/rfc8446#section-4.1.2');
    expect(rfcUrl({ rfc: 8446, section: 'D.4' })).toBe('https://www.rfc-editor.org/rfc/rfc8446#appendix-D.4');
    expect(rfcLabel({ rfc: 8446, section: 'D.4' })).toBe('RFC 8446 Appendix D.4');
    expect(rfcLabel({ rfc: 5246 })).toBe('RFC 5246');
  });
});

describe('鍵交換の持ち物', () => {
  const holds = (pid: string, step: number, actor: string) =>
    inventoryAt(protocols.find((p) => p.id === pid)!, step)[actor].map((h) => h.id);

  it('DH: アリスとボブは共有秘密を持ち、イブは持たない', () => {
    const dh = protocols.find((p) => p.id === 'dh')!;
    const end = dh.steps.length;
    expect(holds('dh', end, 'a')).toContain('s');
    expect(holds('dh', end, 'b')).toContain('s');
    expect(holds('dh', end, 'e')).not.toContain('s');
    expect(holds('dh', end, 'e')).not.toContain('a');
    expect(holds('dh', end, 'e')).not.toContain('b');
  });

  it('RSA: イブは公開鍵と暗号文だけを持つ', () => {
    const p = protocols.find((p) => p.id === 'rsa-kex')!;
    const eve = holds('rsa-kex', p.steps.length, 'e');
    expect(eve).toContain('pub');
    expect(eve).not.toContain('priv');
    expect(eve).not.toContain('k');
  });

  it('共通鍵: 鍵を平文で送るとイブも復号できてしまう', () => {
    const p = protocols.find((p) => p.id === 'symmetric')!;
    expect(holds('symmetric', p.steps.length, 'e')).toEqual(expect.arrayContaining(['key', 'plain']));
  });

  it('新しく手に入れたものに fresh が付く', () => {
    const inv = inventoryAt(protocols.find((p) => p.id === 'dh')!, 2);
    expect(inv.a.find((h) => h.id === 'a')?.fresh).toBe(true);
    expect(inv.a.find((h) => h.id === 'pg')?.fresh).toBe(false);
  });
});
