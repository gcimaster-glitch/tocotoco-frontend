/**
 * トコトコ 共通フォームフィールドコンポーネント
 * バリデーションエラー・入力ガイド・ヒントを統一的に表示
 */
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, Eye, EyeOff } from 'lucide-react';
import { checkPasswordStrength } from '../utils/validation';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  hint?: string;
  example?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number; // textarea用
  maxLength?: number;
  className?: string;
  children?: React.ReactNode; // select用
  showPasswordStrength?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  hint,
  example,
  error,
  required = false,
  disabled = false,
  rows,
  maxLength,
  className = '',
  children,
  showPasswordStrength = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isTextarea = rows !== undefined;
  const isSelect = children !== undefined;
  const isPassword = type === 'password';
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const baseInputClass = `
    w-full px-4 py-3 rounded-xl border text-stone-800 text-sm
    transition-all duration-200 outline-none
    ${error
      ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : isFocused
        ? 'border-emerald-400 bg-white ring-2 ring-emerald-100'
        : 'border-stone-200 bg-stone-50 hover:border-stone-300'
    }
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
  `;

  const passwordStrength = showPasswordStrength && value ? checkPasswordStrength(value) : null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* ラベル */}
      <label htmlFor={name} className="flex items-center gap-1.5 text-sm font-semibold text-stone-700">
        {label}
        {required && <span className="text-red-500 text-xs">必須</span>}
        {!required && <span className="text-stone-400 text-xs font-normal">任意</span>}
      </label>

      {/* 入力フィールド */}
      <div className="relative">
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={`${baseInputClass} resize-vertical min-h-[100px]`}
          />
        ) : isSelect ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            onFocus={() => setIsFocused(true)}
            disabled={disabled}
            className={`${baseInputClass} appearance-none cursor-pointer`}
          >
            {children}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={actualType}
            value={value}
            onChange={onChange}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoComplete={isPassword ? 'current-password' : undefined}
            className={`${baseInputClass} ${isPassword ? 'pr-12' : ''}`}
          />
        )}

        {/* パスワード表示切り替えボタン */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* バリデーション成功アイコン */}
        {!error && value && !isPassword && !isTextarea && !isSelect && (
          <CheckCircle2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
        )}
      </div>

      {/* 文字数カウンター */}
      {maxLength && isTextarea && (
        <p className={`text-right text-xs ${value.length > maxLength * 0.9 ? 'text-orange-500' : 'text-stone-400'}`}>
          {value.length} / {maxLength}文字
        </p>
      )}

      {/* パスワード強度インジケーター */}
      {passwordStrength && value && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i <= passwordStrength.score
                    ? passwordStrength.score <= 2 ? 'bg-red-400'
                      : passwordStrength.score <= 3 ? 'bg-yellow-400'
                      : 'bg-emerald-400'
                    : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
          {passwordStrength.label && (
            <p className={`text-xs font-medium ${passwordStrength.color}`}>
              強度：{passwordStrength.label}
              {passwordStrength.suggestions.length > 0 && (
                <span className="text-stone-400 font-normal ml-2">
                  {passwordStrength.suggestions[0]}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="flex items-start gap-1.5 text-red-600">
          <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      {/* ヒント・入力ガイド */}
      {hint && !error && (
        <div className="flex items-start gap-1.5 text-stone-500">
          <Info size={13} className="mt-0.5 flex-shrink-0" />
          <p className="text-xs leading-relaxed">{hint}</p>
        </div>
      )}

      {/* 入力例 */}
      {example && !error && isFocused && (
        <p className="text-xs text-stone-400">
          <span className="font-medium">入力例：</span>{example}
        </p>
      )}
    </div>
  );
};

// ===== フォームセクションヘッダー =====

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, description, icon }) => (
  <div className="border-b border-stone-100 pb-3 mb-5">
    <div className="flex items-center gap-2">
      {icon && <span className="text-emerald-600">{icon}</span>}
      <h3 className="font-bold text-stone-800">{title}</h3>
    </div>
    {description && <p className="text-xs text-stone-500 mt-1 ml-6">{description}</p>}
  </div>
);

// ===== フォームステップインジケーター =====

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex items-center gap-2">
          <div className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
            ${index < currentStep ? 'bg-emerald-500 text-white'
              : index === currentStep ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
              : 'bg-stone-200 text-stone-500'}
          `}>
            {index < currentStep ? <CheckCircle2 size={14} /> : index + 1}
          </div>
          <span className={`text-xs font-medium hidden sm:block ${
            index === currentStep ? 'text-emerald-600' : 'text-stone-400'
          }`}>
            {step}
          </span>
        </div>
        {index < steps.length - 1 && (
          <div className={`h-0.5 w-8 flex-shrink-0 transition-all ${
            index < currentStep ? 'bg-emerald-400' : 'bg-stone-200'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ===== 確認ダイアログ =====

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = '確認',
  cancelLabel = 'キャンセル',
  onConfirm,
  onCancel,
  variant = 'default',
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-bold text-stone-800 text-lg mb-2">{title}</h3>
        <p className="text-stone-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors ${
              variant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
