import type { Category, Protocol } from './types';
import { symmetric } from './symmetric';
import { rsaKex } from './rsaKex';
import { dh } from './dh';
import { tls12 } from './tls12';
import { tls13 } from './tls13';
import { ipsec } from './ipsec';
import { l2tp } from './l2tp';
import { arp } from './arp';
import { ping } from './ping';
import { dhcp } from './dhcp';
import { dns } from './dns';
import { ssh } from './ssh';
import { tcp } from './tcp';
import { http } from './http';
import { des } from './des';
import { tdes } from './tdes';
import { aes } from './aes';
import { pqc } from './pqc';
import { webScenario } from './scenario';
import { https } from './https';
import { http2 } from './http2';
import { http3 } from './http3';
import { passkey } from './passkey';
import { tcpTls } from './tcpTls';
import { quic } from './quic';
import { wifiJoin } from './wifiJoin';
import { csma } from './csma';
import { hiddenNode } from './hiddenNode';
import { wpa2 } from './wpa2';
import { wpa3 } from './wpa3';
import { evilTwin } from './evilTwin';
import { deauthPmf } from './deauthPmf';

/**
 * 左メニューに並ぶカテゴリと、その中のプロトコル。
 * 新しいプロトコルを追加するときは、定義ファイルを作ってここに並べるだけでよい。
 */
export const categories: Category[] = [
  { id: 'scenario', name: '通しシナリオ', kidName: 'はじめから おわりまで', protocols: [webScenario] },
  { id: 'crypto', name: '暗号と鍵交換の基礎', kidName: 'あんごうの きほん', protocols: [symmetric, rsaKex, dh] },
  { id: 'cipher', name: '暗号アルゴリズム', kidName: 'あんごうの しくみ', protocols: [des, tdes, aes, pqc] },
  { id: 'basic', name: 'ネットワークの基本', kidName: 'ネットワークの きほん', protocols: [dhcp, arp, ping, dns, tcp] },
  {
    id: 'wifi',
    name: '無線 LAN（Wi-Fi）',
    kidName: 'むせん LAN（Wi-Fi）',
    // 「無線 LAN の仕組みとセキュリティ」の章立て（基礎 → 通信制御 → セキュリティ）の順
    protocols: [wifiJoin, csma, hiddenNode, wpa2, wpa3, evilTwin, deauthPmf],
  },
  { id: 'web', name: 'Web（HTTP）', kidName: 'ホームページの しくみ', protocols: [http, https, http2, http3] },
  { id: 'secure', name: 'セキュア通信', kidName: 'ひみつの つうしん', protocols: [tls12, tls13, ssh, tcpTls, quic] },
  { id: 'auth', name: '認証', kidName: 'ほんにん かくにん', protocols: [passkey] },
  { id: 'vpn', name: 'VPN・トンネル', kidName: 'トンネル', protocols: [ipsec, l2tp] },
];

export const protocols: Protocol[] = categories.flatMap((c) => c.protocols);

export function findProtocol(id: string | undefined): Protocol | undefined {
  return protocols.find((p) => p.id === id);
}

export type { Protocol } from './types';
