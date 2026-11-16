export interface ParsedCccd {
  idCardNumber: string;
  fullName: string;
  lastName: string;
  firstName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  genderLabel: string;
  address: string;
}

/**
 * Trích xuất thông tin chuẩn từ mã QR của CCCD gắn chip (Bộ Công An).
 * Định dạng: Số_CCCD | Số_CMND_cũ | Họ_và_tên | Ngày_sinh_DDMMYYYY | Giới_tính | Địa_chỉ | Ngày_cấp
 */
export function parseCccdQr(rawQr: string): ParsedCccd | null {
  const trimmed = rawQr.trim();
  if (!trimmed) return null;

  const parts = trimmed.split('|');
  if (parts.length < 5) return null;

  const idCardNumber = parts[0]?.trim() || '';
  const fullName = parts[2]?.trim() || '';

  // Bóc tách Họ và chữ lót, Tên
  const nameTokens = fullName.split(/\s+/).filter(Boolean);
  let firstName = '';
  let lastName = '';
  if (nameTokens.length > 1) {
    firstName = nameTokens[nameTokens.length - 1];
    lastName = nameTokens.slice(0, -1).join(' ');
  } else if (nameTokens.length === 1) {
    firstName = nameTokens[0];
  }

  // Bóc tách ngày sinh dạng DDMMYYYY -> YYYY-MM-DD
  const rawDob = parts[3]?.trim() || '';
  let dateOfBirth = '';
  if (rawDob.length === 8 && /^\d{8}$/.test(rawDob)) {
    const day = rawDob.slice(0, 2);
    const month = rawDob.slice(2, 4);
    const year = rawDob.slice(4, 8);
    dateOfBirth = `${year}-${month}-${day}`;
  }

  // Bóc tách giới tính
  const rawGender = (parts[4]?.trim() || '').toLowerCase();
  let gender: 'MALE' | 'FEMALE' | 'OTHER' = 'OTHER';
  let genderLabel = 'Khác';
  if (rawGender.includes('nam')) {
    gender = 'MALE';
    genderLabel = 'Nam';
  } else if (rawGender.includes('nữ') || rawGender.includes('nu')) {
    gender = 'FEMALE';
    genderLabel = 'Nữ';
  }

  const address = parts[5]?.trim() || '';

  return {
    idCardNumber,
    fullName,
    lastName,
    firstName,
    dateOfBirth,
    gender,
    genderLabel,
    address,
  };
}
