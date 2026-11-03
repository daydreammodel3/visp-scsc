import { describe, expect, it } from 'vitest';
import { protocols } from './index';
import { parseHash, toHash } from '../lib/route';
import { rfcLabel, rfcUrl } from '../lib/rfc';

describe('プロトコル定義', () => {
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
          expect(s.from, `${s.id} は自分宛て`).not.toBe(s.to);
          expect(phaseIds, `${s.id}.phase`).toContain(s.phase);
        }
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
    expect(parseHash('#/tls12/999').step).toBe(protocols[0].steps.length);
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
