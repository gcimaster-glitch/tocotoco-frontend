/**
 * トコトコ 共通バリデーション・入力ガイドユーティリティ
 * 全フォームで再利用可能なバリデーションルールと入力ガイドメッセージ
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface FieldRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  patternMessage?: string;
  custom?: (value: string) => string | null;
}

// ===== バリデーションルール =====

export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: '正しいメールアドレスの形式で入力してください（例：taro@example.com）',
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/[A-Za-z]/.test(value)) return 'パスワードには英字を含めてください';
      if (!/[0-9]/.test(value)) return 'パスワードには数字を含めてください';
      return null;
    },
  },
  passwordConfirm: (password: string) => ({
    required: true,
    custom: (value: string) => {
      if (value !== password) return 'パスワードが一致しません';
      return null;
    },
  }),
  phone: {
    pattern: /^[0-9\-+() ]{10,15}$/,
    patternMessage: '正しい電話番号の形式で入力してください（例：090-1234-5678）',
  },
  postalCode: {
    pattern: /^\d{3}-?\d{4}$/,
    patternMessage: '郵便番号は7桁で入力してください（例：123-4567）',
  },
  salary: {
    pattern: /^\d+$/,
    patternMessage: '半角数字のみで入力してください',
  },
  url: {
    pattern: /^https?:\/\/.+/,
    patternMessage: 'URLはhttps://またはhttp://から始めてください',
  },
};

// ===== 単一フィールドバリデーション =====

export function validateField(value: string, rule: FieldRule): string {
  const trimmed = value.trim();

  if (rule.required && !trimmed) {
    return 'この項目は必須です';
  }
  if (!trimmed) return ''; // 任意項目で空の場合はOK

  if (rule.minLength && trimmed.length < rule.minLength) {
    return `${rule.minLength}文字以上で入力してください`;
  }
  if (rule.maxLength && trimmed.length > rule.maxLength) {
    return `${rule.maxLength}文字以内で入力してください`;
  }
  if (rule.pattern && !rule.pattern.test(trimmed)) {
    return rule.patternMessage || '入力形式が正しくありません';
  }
  if (rule.custom) {
    const customError = rule.custom(trimmed);
    if (customError) return customError;
  }
  return '';
}

// ===== フォーム全体バリデーション =====

export function validateForm(
  data: Record<string, string>,
  rules: Record<string, FieldRule>
): ValidationResult {
  const errors: Record<string, string> = {};
  for (const [field, rule] of Object.entries(rules)) {
    const error = validateField(data[field] || '', rule);
    if (error) errors[field] = error;
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// ===== 入力ガイドメッセージ =====

export const INPUT_GUIDES: Record<string, {
  label: string;
  placeholder: string;
  hint?: string;
  example?: string;
}> = {
  // 認証系
  email: {
    label: 'メールアドレス',
    placeholder: 'taro@example.com',
    hint: 'ログインに使用します。登録後の変更は設定画面から行えます',
    example: 'taro@example.com',
  },
  password: {
    label: 'パスワード',
    placeholder: '8文字以上（英字・数字を含む）',
    hint: '8文字以上で、英字と数字を組み合わせてください。記号も使用できます',
  },
  passwordConfirm: {
    label: 'パスワード（確認）',
    placeholder: 'もう一度パスワードを入力',
    hint: '上で入力したパスワードと同じものを入力してください',
  },

  // 個人情報
  lastName: {
    label: '姓',
    placeholder: '山田',
    hint: '戸籍上の姓を入力してください',
  },
  firstName: {
    label: '名',
    placeholder: '太郎',
    hint: '戸籍上の名を入力してください',
  },
  lastNameKana: {
    label: '姓（フリガナ）',
    placeholder: 'ヤマダ',
    hint: 'カタカナで入力してください',
  },
  firstNameKana: {
    label: '名（フリガナ）',
    placeholder: 'タロウ',
    hint: 'カタカナで入力してください',
  },
  phone: {
    label: '電話番号',
    placeholder: '090-1234-5678',
    hint: 'ハイフンあり・なし、どちらでも入力できます',
    example: '090-1234-5678',
  },

  // 求人応募
  coverLetter: {
    label: '志望動機・自己PR',
    placeholder: '貴社に応募した理由や、自分の強みをご記入ください...',
    hint: '200〜800文字程度を目安に、具体的なエピソードを交えて記載すると効果的です',
  },
  desiredStartDate: {
    label: '入社希望日',
    placeholder: '例：2024年4月1日、または「相談可」',
    hint: '現在の状況に合わせてご記入ください。「相談可」でも問題ありません',
  },
  accommodationRequest: {
    label: '必要な配慮事項',
    placeholder: '例：週3日在宅勤務希望、通院のため月2回午後休暇が必要...',
    hint: '必要な配慮があれば具体的に記載してください。記載することで企業側が事前に準備できます。記載は任意です',
  },
  expectedSalary: {
    label: '希望給与',
    placeholder: '例：月給25万円以上、または「応相談」',
    hint: '現在の給与や希望額を記載してください。「応相談」でも問題ありません',
  },

  // 求人投稿
  jobTitle: {
    label: '求人タイトル',
    placeholder: '例：事務スタッフ（障がい者雇用・在宅勤務可）',
    hint: '職種名と主な特徴を30文字以内で簡潔に記載してください',
  },
  jobDescription: {
    label: '仕事内容',
    placeholder: '具体的な業務内容、1日の流れ、チームの雰囲気などを記載してください...',
    hint: '求職者が仕事をイメージできるよう、具体的に記載してください。箇条書きも使えます',
  },
  requirements: {
    label: '応募要件',
    placeholder: '例：PC基本操作ができる方、週3日以上勤務できる方...',
    hint: '必須条件と歓迎条件を分けて記載すると応募者が判断しやすくなります',
  },
  location: {
    label: '勤務地',
    placeholder: '例：東京都渋谷区（最寄り：渋谷駅 徒歩5分）',
    hint: '最寄り駅からの距離も記載すると求職者が通勤を検討しやすくなります',
  },
  salaryMin: {
    label: '給与（下限）',
    placeholder: '200000',
    hint: '月給の下限を半角数字で入力してください（単位：円）',
    example: '200000（20万円の場合）',
  },
  salaryMax: {
    label: '給与（上限）',
    placeholder: '300000',
    hint: '月給の上限を半角数字で入力してください。上限なしの場合は空欄でOKです',
  },
  accommodations: {
    label: '対応可能な配慮事項',
    placeholder: '例：車椅子対応、筆談対応、通院休暇取得可、在宅勤務可...',
    hint: '企業として対応できる配慮事項を具体的に記載してください。求職者のマッチング精度が上がります',
  },

  // プロフィール
  selfPr: {
    label: '自己PR',
    placeholder: '自分の強みや経験、アピールしたいことを自由に記載してください...',
    hint: '具体的なエピソードや数字を交えると説得力が増します。300〜500文字程度が目安です',
  },
  desiredJobType: {
    label: '希望職種',
    placeholder: '例：事務職、ITエンジニア、接客・販売など',
    hint: '複数ある場合はカンマ区切りで入力してください',
  },
  desiredLocation: {
    label: '希望勤務地',
    placeholder: '例：東京都内、神奈川県、リモート希望など',
    hint: '都道府県単位でも、「リモート希望」でも構いません',
  },

  // コミュニティ
  postTitle: {
    label: '投稿タイトル',
    placeholder: '例：就労移行支援を利用して就職できました！',
    hint: '他の方が読みたくなるようなタイトルをつけてください（50文字以内）',
  },
  postContent: {
    label: '本文',
    placeholder: '体験談や情報をシェアしてください...',
    hint: '具体的な体験や情報を記載すると、他の方の参考になります。個人が特定される情報の記載はお控えください',
  },
};

// ===== パスワード強度チェック =====

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
  suggestions: string[];
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (password.length >= 8) score++;
  else suggestions.push('8文字以上にしてください');

  if (password.length >= 12) score++;
  else if (password.length >= 8) suggestions.push('12文字以上にするとより安全です');

  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('大文字を含めるとより安全です');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('数字を含めてください');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('記号（!@#$など）を含めるとより安全です');

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '', suggestions },
    { score: 1, label: '弱い', color: 'text-red-500', suggestions },
    { score: 2, label: 'やや弱い', color: 'text-orange-500', suggestions },
    { score: 3, label: '普通', color: 'text-yellow-500', suggestions },
    { score: 4, label: '強い', color: 'text-emerald-500', suggestions },
    { score: 5, label: 'とても強い', color: 'text-emerald-600', suggestions: [] },
  ];

  return levels[Math.min(score, 5)];
}
