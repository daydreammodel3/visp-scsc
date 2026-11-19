/** 無線 LAN の参照先。IEEE 802.11 本文は有償のため、委員会ページと公的な解説を並べる */
export const IEEE80211 = { label: 'IEEE 802.11', title: 'IEEE 802.11 Wireless LAN Working Group', url: 'https://www.ieee802.org/11/' };
export const WFA_SECURITY = { label: 'Wi-Fi Alliance', title: 'Wi-Fi Security（WPA3 など）', url: 'https://www.wi-fi.org/discover-wi-fi/security' };
export const MIC_HOME = { label: '総務省（自宅 Wi-Fi）', title: '自宅 Wi-Fi 利用者向け簡易マニュアル', url: 'https://www.soumu.go.jp/main_sosiki/cybersecurity/wi-fi/' };
export const MIC_PUBLIC = { label: '総務省（公衆 Wi-Fi）', title: '公衆 Wi-Fi 利用者向け簡易マニュアル', url: 'https://security-portal.cyber.go.jp/curriculum/torikumi/mic_wifi_man.html' };
export const MIC_PROVIDER = { label: '総務省（提供者向け）', title: '公衆 Wi-Fi 提供者向け セキュリティ対策の手引き', url: 'https://security-portal.cyber.go.jp/curriculum/torikumi/mic_wifi_sec.html' };
export const CISCO_WPA3 = { label: 'Cisco WPA3 導入ガイド', title: 'WPA3 導入ガイド（SAE・OWE・PMF）', url: 'https://www.cisco.com/c/ja_jp/td/docs/wireless/controller/9800/technical-reference/wpa3-dg.html' };

export const ref = (d: { label: string; url: string }) => ({ label: d.label, url: d.url });
