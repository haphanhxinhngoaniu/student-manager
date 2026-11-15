export interface BankInfo {
  bin: string;
  code: string;
  shortName: string;
  name: string;
}

export const VIETNAM_BANKS: BankInfo[] = [
  { bin: '970422', code: 'MB', shortName: 'MB Bank', name: 'Ngân hàng TMCP Quân Đội (MB)' },
  { bin: '970436', code: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam' },
  { bin: '970407', code: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam' },
  { bin: '970432', code: 'VPB', shortName: 'VPBank', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { bin: '970415', code: 'ICB', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam' },
  { bin: '970418', code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN' },
  { bin: '970416', code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  { bin: '970423', code: 'TPB', shortName: 'TPBank', name: 'Ngân hàng TMCP Tiên Phong' },
  { bin: '970403', code: 'STB', shortName: 'Sacombank', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { bin: '970405', code: 'AGR', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp & PTNT VN' },
];

function tlv(tag: string, value: string): string {
  const len = String(value.length).padStart(2, '0');
  return `${tag}${len}${value}`;
}

export function crc16Ccitt(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i += 1) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function normalizeAsciiMemo(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9\s\-_.]/g, '')
    .trim()
    .slice(0, 50);
}

/**
 * Generates an EMVCo / Napas 24/7 VietQR payload string compatible with
 * all Vietnamese banking apps (MB, Vietcombank, Techcombank, VPBank, BIDV, etc.).
 */
export function buildVietQrPayload(params: {
  bankBin: string;
  accountNumber: string;
  amount: number;
  purpose: string;
}): string {
  const cleanAccount = params.accountNumber.replace(/\s+/g, '');
  const cleanBin = params.bankBin.trim();
  const cleanAmount = Math.max(0, Math.round(params.amount));
  const cleanPurpose = normalizeAsciiMemo(params.purpose);

  // Tag 38: Merchant Account Information (Napas 24/7 AID A000000727)
  const beneficiary = tlv('00', cleanBin) + tlv('01', cleanAccount);
  const serviceBlock =
    tlv('00', 'A000000727') + tlv('01', beneficiary) + tlv('02', 'QRIBFTTA');

  const parts = [
    tlv('00', '01'), // Payload Format Indicator
    tlv('01', cleanAmount > 0 ? '12' : '11'), // 12 = dynamic with amount, 11 = static
    tlv('38', serviceBlock),
    tlv('53', '704'), // Currency VND (ISO 4217)
  ];

  if (cleanAmount > 0) {
    parts.push(tlv('54', String(cleanAmount)));
  }

  parts.push(tlv('58', 'VN'));

  if (cleanPurpose) {
    parts.push(tlv('62', tlv('08', cleanPurpose)));
  }

  const rawWithoutCrc = `${parts.join('')}6304`;
  const crc = crc16Ccitt(rawWithoutCrc);
  return `${rawWithoutCrc}${crc}`;
}

export function formatVnd(amount: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(Math.round(amount))} đ`;
}
