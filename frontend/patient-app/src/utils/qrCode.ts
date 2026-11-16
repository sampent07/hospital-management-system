import { vi } from '../i18n/vi';
const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const QR_SIZE = 21;
const DATA_CODEWORDS = 19;
const ECC_CODEWORDS = 7;

function appendBits(bits: number[], value: number, length: number): void {
  for (let shift = length - 1; shift >= 0; shift -= 1) bits.push((value >>> shift) & 1);
}

function multiplyGaloisField(x: number, y: number): number {
  let result = 0;
  for (let i = 7; i >= 0; i -= 1) {
    result = (result << 1) ^ ((result >>> 7) * 0x11d);
    result ^= ((y >>> i) & 1) * x;
  }
  return result;
}

function reedSolomonDivisor(degree: number): number[] {
  const result = Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < degree; j += 1) {
      result[j] = multiplyGaloisField(result[j], root);
      if (j + 1 < degree) result[j] ^= result[j + 1];
    }
    root = multiplyGaloisField(root, 2);
  }
  return result;
}

function reedSolomonRemainder(data: number[]): number[] {
  const divisor = reedSolomonDivisor(ECC_CODEWORDS);
  const result = Array<number>(ECC_CODEWORDS).fill(0);
  for (const value of data) {
    const factor = value ^ result[0];
    result.shift();
    result.push(0);
    for (let i = 0; i < ECC_CODEWORDS; i += 1) result[i] ^= multiplyGaloisField(divisor[i], factor);
  }
  return result;
}

function encodeData(value: string): number[] {
  const text = value.toUpperCase();
  if (text.length === 0 || text.length > 25 || [...text].some((char) => !ALPHANUMERIC.includes(char))) {
    throw new Error(vi.qrCodeInvalid);
  }
  const bits: number[] = [];
  appendBits(bits, 0b0010, 4);
  appendBits(bits, text.length, 9);
  for (let i = 0; i < text.length; i += 2) {
    const first = ALPHANUMERIC.indexOf(text[i]);
    if (i + 1 < text.length) {
      const second = ALPHANUMERIC.indexOf(text[i + 1]);
      appendBits(bits, first * 45 + second, 11);
    } else {
      appendBits(bits, first, 6);
    }
  }
  const capacity = DATA_CODEWORDS * 8;
  appendBits(bits, 0, Math.min(4, capacity - bits.length));
  while (bits.length % 8 !== 0) bits.push(0);
  const data = Array.from({ length: bits.length / 8 }, (_, index) => {
    return bits.slice(index * 8, index * 8 + 8).reduce((byte, bit) => (byte << 1) | bit, 0);
  });
  for (let pad = 0; data.length < DATA_CODEWORDS; pad += 1) data.push(pad % 2 === 0 ? 0xec : 0x11);
  return [...data, ...reedSolomonRemainder(data)];
}

function setFinder(matrix: (boolean | null)[][], left: number, top: number): void {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const x = left + dx;
      const y = top + dy;
      if (x < 0 || y < 0 || x >= QR_SIZE || y >= QR_SIZE) continue;
      const inFinder = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const dark = inFinder && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      matrix[y][x] = dark;
    }
  }
}

function setFormatBits(matrix: (boolean | null)[][]): void {
  const formatData = 0b01000; // Error correction level L, mask pattern 0.
  let remainder = formatData << 10;
  for (let bit = 14; bit >= 10; bit -= 1) {
    if (((remainder >>> bit) & 1) !== 0) remainder ^= 0x537 << (bit - 10);
  }
  const format = ((formatData << 10) | remainder) ^ 0x5412;
  const getBit = (index: number) => ((format >>> index) & 1) !== 0;
  for (let i = 0; i <= 5; i += 1) matrix[i][8] = getBit(i);
  matrix[7][8] = getBit(6);
  matrix[8][8] = getBit(7);
  matrix[8][7] = getBit(8);
  for (let i = 9; i < 15; i += 1) matrix[8][14 - i] = getBit(i);
  for (let i = 0; i < 8; i += 1) matrix[8][QR_SIZE - 1 - i] = getBit(i);
  for (let i = 8; i < 15; i += 1) matrix[QR_SIZE - 15 + i][8] = getBit(i);
  matrix[QR_SIZE - 8][8] = true;
}

export function createAppointmentQr(value: string): boolean[][] {
  const codewords = encodeData(value);
  const matrix: (boolean | null)[][] = Array.from({ length: QR_SIZE }, () => Array<boolean | null>(QR_SIZE).fill(null));
  setFinder(matrix, 0, 0);
  setFinder(matrix, QR_SIZE - 7, 0);
  setFinder(matrix, 0, QR_SIZE - 7);
  for (let i = 8; i < QR_SIZE - 8; i += 1) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }
  setFormatBits(matrix);

  const bits = codewords.flatMap((byte) => Array.from({ length: 8 }, (_, index) => (byte >>> (7 - index)) & 1));
  let bitIndex = 0;
  let upward = true;
  for (let right = QR_SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vertical = 0; vertical < QR_SIZE; vertical += 1) {
      const y = upward ? QR_SIZE - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (matrix[y][x] !== null) continue;
        const bit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        matrix[y][x] = bit !== ((x + y) % 2 === 0);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  return matrix.map((row) => row.map((cell) => cell ?? false));
}
