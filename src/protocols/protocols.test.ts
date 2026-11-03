import { describe, expect, it } from 'vitest';
import { protocols } from './index';
import { parseHash, toHash } from '../lib/route';
import { rfcLabel, rfcUrl } from '../lib/rfc';
import { inventoryAt } from '../lib/inventory';
import { categories } from './index';
import { comparePresets, presetProtocols } from './compare';
import { statesAt } from '../lib/nodeStates';

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

      it('via（中継ノード）は存在し、送信者と受信者の間に並んでいる', () => {
        const idx = new Map(p.actors.map((a, i) => [a.id, i]));
        for (const s of p.steps)
          for (const v of s.via ?? []) {
            expect(idx.has(v), `${s.id} via ${v}`).toBe(true);
            const [f, t, m] = [idx.get(s.from)!, idx.get(s.to)!, idx.get(v)!];
            expect((m - f) * (m - t), `${s.id}: ${v} は ${s.from} と ${s.to} の間にない`).toBeLessThan(0);
          }
      });

      it('ブロードキャストとノード内処理は両立しない', () => {
        for (const s of p.steps) if (s.broadcast) expect(s.from, s.id).not.toBe(s.to);
      });

      it('see（詳しく見る）のリンク先が存在する', () => {
        for (const s of p.steps)
          if (s.see) {
            const target = protocols.find((x) => x.id === s.see!.protocol);
            expect(target, `${s.id} → ${s.see.protocol}`).toBeDefined();
            expect(s.see.step ?? 0).toBeLessThanOrEqual(target!.steps.length);
          }
      });

      it('states / initialStates は定義済みのノードを指す', () => {
        const ids = new Set(p.actors.map((a) => a.id));
        for (const id of Object.keys(p.initialStates ?? {})) expect(ids).toContain(id);
        for (const s of p.steps) for (const id of Object.keys(s.states ?? {})) expect(ids, s.id).toContain(id);
      });

      it('lost（消失）はノード間のメッセージにだけ使う', () => {
        for (const s of p.steps) if (s.lost) expect(s.from, s.id).not.toBe(s.to);
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

describe('ネットワークの基本', () => {
  const find = (id: string) => protocols.find((p) => p.id === id)!;
  const holds = (pid: string, step: number, actor: string) => inventoryAt(find(pid), step)[actor].map((h) => h.id);

  it('ARP: ブロードキャストを受けた無関係なホストはキャッシュに登録しない', () => {
    const arp = find('arp');
    expect(holds('arp', arp.steps.length, 'c')).toEqual([]);
    expect(holds('arp', arp.steps.length, 'a')).toContain('aCacheB');
    expect(holds('arp', arp.steps.length, 'b')).toContain('bCacheA');
  });

  it('ARP: Request はブロードキャスト、Reply はユニキャスト', () => {
    const arp = find('arp');
    expect(arp.steps.find((s) => s.id === 'request')!.broadcast).toBe(true);
    expect(arp.steps.find((s) => s.id === 'reply')!.broadcast).toBeFalsy();
  });

  it('DHCP: DORA の順で、ACK を受けてから IP アドレスを持つ', () => {
    const dhcp = find('dhcp');
    expect(dhcp.steps.slice(0, 4).map((s) => s.message.split('（')[0])).toEqual(['DHCPDISCOVER', 'DHCPOFFER', 'DHCPREQUEST', 'DHCPACK']);
    expect(holds('dhcp', 3, 'c')).not.toContain('ip');
    expect(holds('dhcp', 4, 'c')).toContain('ip');
  });

  it('DNS: クライアントは自分では反復問い合わせをせず、リゾルバーだけがルート・TLD・権威と話す', () => {
    const dns = find('dns');
    for (const s of dns.steps) {
      if (s.from === 'c' || s.to === 'c') expect([s.from, s.to].sort()).toEqual(['c', 'r']);
    }
  });

  it('SSH: NEWKEYS より後のメッセージはすべて暗号化される', () => {
    const steps = find('ssh').steps;
    const last = steps.map((s) => s.message).lastIndexOf('SSH_MSG_NEWKEYS');
    steps.forEach((s, i) => expect(!!s.encrypted, s.id).toBe(i > last));
  });

  it('ping: Echo は ルーターを経由する', () => {
    for (const s of find('ping').steps.filter((s) => s.message.startsWith('Echo') && s.to !== 'r')) expect(s.via).toEqual(['r']);
  });
});

describe('比較表示', () => {
  it('プリセットの左右が存在し、ID が重複しない', () => {
    const ids = comparePresets.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const c of comparePresets) {
      const [a, b] = presetProtocols(c);
      expect(a, c.left).toBeDefined();
      expect(b, c.right).toBeDefined();
      expect(c.left).not.toBe(c.right);
    }
  });
  it('比較のハッシュを往復できる', () => {
    const r = parseHash('#/compare/tls/3');
    expect(r.compareId).toBe('tls');
    expect(toHash(r)).toBe('#/compare/tls/3');
    expect(parseHash('#/compare/nope/3').compareId).toBeUndefined();
  });
});

describe('TCP と シナリオ', () => {
  const find = (id: string) => protocols.find((p) => p.id === id)!;
  it('TCP: 最後には双方が接続を閉じている', () => {
    const tcp = find('tcp');
    const st = statesAt(tcp, tcp.steps.length)!;
    expect(st.s.state).toBe('CLOSED');
    expect(st.c.state).toBe('TIME-WAIT');
    expect(statesAt(tcp, 3)!.c.state).toBe('ESTABLISHED');
    expect(statesAt(tcp, 3)!.s.state).toBe('ESTABLISHED');
  });
  it('TCP: seq / ack の番号が一貫している', () => {
    const tcp = find('tcp');
    const nums = (id: string) => tcp.steps.find((s) => s.id === id)!.message;
    expect(nums('synack')).toContain('ack=1001');
    expect(nums('ack')).toContain('ack=5001');
    expect(nums('data-ack')).toContain('ack=1101');
    expect(nums('fin-ack')).toContain('ack=1102');
    expect(nums('last-ack')).toContain('ack=5002');
  });
  it('シナリオ: DHCP → ARP → DNS → TCP → TLS → HTTP の順', () => {
    const order = find('web').steps.map((s) => s.phase).filter((p, i, a) => a.indexOf(p) === i);
    expect(order).toEqual(['dhcp', 'arp', 'dns', 'tcp', 'tls', 'http', 'render']);
  });
  it('シナリオ: PC は最後にページとセッション鍵を持つ', () => {
    const web = find('web');
    const pc = inventoryAt(web, web.steps.length).pc.map((h) => h.id);
    expect(pc).toEqual(expect.arrayContaining(['ip', 'gwMac', 'webIp', 'conn', 'keys', 'html']));
  });
  it('シナリオ: ゲートウェイの MAC を知る前に、外部ネットワークへは送らない', () => {
    const web = find('web');
    const arpDone = web.steps.findIndex((s) => s.id === 'arp-rep');
    web.steps.forEach((s, i) => {
      if (s.via?.includes('gw')) expect(i, s.id).toBeGreaterThan(arpDone);
    });
  });
});

describe('暗号アルゴリズムのレッスン', () => {
  const find = (id: string) => protocols.find((p) => p.id === id)!;
  it('AES: 最終の暗号文が FIPS 197 の値', () => {
    expect(find('aes').items!.ct.label).toContain('3925841d02dc09fbdc118597196a0b32');
  });
  it('DES: 総当たりでイブが鍵を得る / AES では得られない', () => {
    const des = find('des');
    const aes = find('aes');
    expect(inventoryAt(des, des.steps.length).e.map((h) => h.id)).toContain('key');
    expect(inventoryAt(aes, aes.steps.length).e.map((h) => h.id)).not.toContain('key');
  });
  it('PQC: イブは ML-KEM の秘密鍵も共有秘密も持たない', () => {
    const pqc = find('pqc');
    const eve = inventoryAt(pqc, pqc.steps.length).e.map((h) => h.id);
    expect(eve).not.toContain('dk');
    expect(eve).not.toContain('m');
    expect(eve).toContain('ek');
  });
});

describe('Web（HTTP/2・HTTP/3・HTTPS）', () => {
  const find = (id: string) => protocols.find((p) => p.id === id)!;
  const reqIndex = (id: string) => find(id).steps.findIndex((s) => /GET \/(?!style|app)/.test(s.message)) + 1;

  it('HTTP/3 は HTTP/2 より少ない手数で最初の GET に到達する（TCP と TLS を QUIC にまとめる）', () => {
    const h2 = find('http2');
    const h3 = find('http3');
    const h2Msgs = h2.steps.slice(0, reqIndex('http2')).filter((s) => s.from !== s.to).length;
    const h3Msgs = h3.steps.slice(0, reqIndex('http3')).filter((s) => s.from !== s.to).length;
    expect(h3Msgs).toBeLessThan(h2Msgs);
  });

  it('HTTP/2: クライアントのストリーム ID は奇数', () => {
    for (const s of find('http2').steps) {
      const m = s.message.match(/stream (\d+)/);
      if (m && s.from === 'c') expect(Number(m[1]) % 2, s.id).toBe(1);
    }
  });

  it('HTTP/3: 消失したパケットのストリーム以外は先に届き、再送は新しいパケット番号', () => {
    const steps = find('http3').steps;
    const lost = steps.findIndex((s) => s.lost);
    const nums = steps.map((s) => Number(s.message.match(/#(\d+)/)?.[1] ?? NaN)).filter((n) => !Number.isNaN(n));
    expect(new Set(nums).size).toBe(nums.length);
    expect(steps[lost + 1].gives?.c).toContain('js');
  });

  it('HTTP/3: マイグレーション後にクライアントのアドレスが変わる', () => {
    const h3 = find('http3');
    expect(statesAt(h3, 0)!.c.state).toContain('Wi-Fi');
    expect(statesAt(h3, h3.steps.length)!.c.state).toContain('モバイル');
  });

  it('HTTPS: 盗聴者は SNI と暗号文は見えるが、鍵もページも得られない', () => {
    const p = find('https');
    const eve = inventoryAt(p, p.steps.length).e.map((h) => h.id);
    expect(eve).toEqual(expect.arrayContaining(['sni', 'enc', 'plainReq']));
    expect(eve).not.toContain('keys');
    expect(eve).not.toContain('page');
  });

  it('HTTPS: 「詳しく見る」で HTTP/2 の GET に飛ぶ', () => {
    const see = find('https').steps.find((s) => s.id === 'get')!.see!;
    expect(find(see.protocol).steps[see.step! - 1].message).toContain('GET /');
  });
});
