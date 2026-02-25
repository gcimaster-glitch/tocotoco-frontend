/**
 * トコトコ 求人応募モーダル
 * バリデーション・入力ガイド・リアルタイムフィードバック付き
 */
import React, { useState, useEffect } from 'react';
import {
  X, Send, Briefcase, MapPin, Building2, AlertCircle,
  CheckCircle2, Loader2, ChevronRight, ChevronLeft, Info,
  FileText, Heart, Calendar, DollarSign, Shield
} from 'lucide-react';
import { FormField, FormSection, StepIndicator } from './FormField';
import { validateField, VALIDATION_RULES, INPUT_GUIDES } from '../utils/validation';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  type?: string;
  tags?: string[];
  description?: string;
  requirements?: string;
  accommodations?: string;
}

interface ApplyModalProps {
  job: Job;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  coverLetter: string;
  desiredStartDate: string;
  accommodationRequest: string;
  expectedSalary: string;
  agreeToTerms: boolean;
}

interface FormErrors {
  coverLetter?: string;
  desiredStartDate?: string;
  accommodationRequest?: string;
  expectedSalary?: string;
  agreeToTerms?: string;
}

const STEPS = ['求人確認', '応募内容', '確認・送信'];

export const ApplyModal: React.FC<ApplyModalProps> = ({ job, onClose, onSuccess }) => {
  const { getAuthHeaders, user } = useAuth();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<FormData>({
    coverLetter: '',
    desiredStartDate: '',
    accommodationRequest: '',
    expectedSalary: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // フィールド変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    // リアルタイムバリデーション（タッチ済みフィールドのみ）
    if (touched[name]) {
      validateSingleField(name, String(newValue));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateSingleField(name, value);
  };

  const validateSingleField = (name: string, value: string) => {
    let error = '';
    if (name === 'coverLetter') {
      error = validateField(value, { required: true, minLength: 50, maxLength: 800 });
      if (!error && value.trim().length < 50) error = '50文字以上で記入してください';
    }
    if (name === 'desiredStartDate') {
      error = validateField(value, { required: true, maxLength: 50 });
    }
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    const coverLetterError = validateField(formData.coverLetter, { required: true, minLength: 50, maxLength: 800 });
    if (coverLetterError) newErrors.coverLetter = coverLetterError;
    else if (formData.coverLetter.trim().length < 50) newErrors.coverLetter = '50文字以上で記入してください';

    const startDateError = validateField(formData.desiredStartDate, { required: true, maxLength: 50 });
    if (startDateError) newErrors.desiredStartDate = startDateError;

    setErrors(newErrors);
    setTouched({ coverLetter: true, desiredStartDate: true, accommodationRequest: true, expectedSalary: true });
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      setErrors(prev => ({ ...prev, agreeToTerms: '同意が必要です' }));
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          job_id: job.id,
          cover_letter: formData.coverLetter,
          desired_start_date: formData.desiredStartDate,
          accommodation_request: formData.accommodationRequest,
          expected_salary: formData.expectedSalary,
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onSuccess();
        }, 2500);
      } else {
        setSubmitError(data.error || '応募の送信に失敗しました。もう一度お試しください');
      }
    } catch {
      setSubmitError('通信エラーが発生しました。インターネット接続を確認してください');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 成功画面
  if (submitSuccess) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-stone-800 mb-2">応募完了！</h2>
          <p className="text-stone-600 mb-2">
            <span className="font-bold text-emerald-600">{job.company}</span> の<br />
            <span className="font-bold">{job.title}</span> に応募しました
          </p>
          <p className="text-sm text-stone-500 mt-4">
            企業からの連絡をお待ちください。<br />
            応募状況はマイページの「応募履歴」で確認できます。
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-stone-400 text-xs">
            <Loader2 size={14} className="animate-spin" />
            <span>自動的に閉じます...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">

        {/* ヘッダー */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100">
          <div>
            <h2 className="font-black text-stone-800 text-lg">求人に応募する</h2>
            <p className="text-xs text-stone-500 mt-0.5">{job.company} ・ {job.title}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-stone-500" />
          </button>
        </div>

        {/* ステップインジケーター */}
        <div className="px-6 pt-5">
          <StepIndicator steps={STEPS} currentStep={step} />
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">

          {/* ステップ0: 求人確認 */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                <h3 className="font-bold text-stone-800 text-base mb-3 flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-600" />
                  求人情報の確認
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <Building2 size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-stone-500">企業名</p>
                      <p className="font-semibold text-stone-800">{job.company}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-stone-500">職種</p>
                      <p className="font-semibold text-stone-800">{job.title}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-stone-500">勤務地</p>
                      <p className="font-semibold text-stone-800">{job.location}</p>
                    </div>
                  </div>
                  {job.salary && (
                    <div className="flex items-start gap-3">
                      <DollarSign size={15} className="text-stone-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">給与</p>
                        <p className="font-semibold text-stone-800">{job.salary}</p>
                      </div>
                    </div>
                  )}
                  {job.accommodations && (
                    <div className="flex items-start gap-3">
                      <Heart size={15} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-stone-500">対応可能な配慮事項</p>
                        <p className="text-stone-700 text-sm">{job.accommodations}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {job.requirements && (
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-1.5">
                    <FileText size={14} />
                    応募要件
                  </h4>
                  <p className="text-blue-700 text-sm leading-relaxed">{job.requirements}</p>
                </div>
              )}

              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-start gap-2">
                  <Info size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-800 text-sm font-semibold">応募前にご確認ください</p>
                    <ul className="text-amber-700 text-xs mt-1.5 space-y-1 list-disc list-inside">
                      <li>応募後は企業から直接ご連絡が届きます</li>
                      <li>配慮事項は次のステップで詳しく記載できます</li>
                      <li>応募状況はマイページで確認できます</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ステップ1: 応募内容入力 */}
          {step === 1 && (
            <div className="space-y-5">
              <FormSection
                title="志望動機・自己PR"
                description="企業に伝えたいことを具体的に記載してください"
                icon={<FileText size={16} />}
              />

              <FormField
                label={INPUT_GUIDES.coverLetter.label}
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={INPUT_GUIDES.coverLetter.placeholder}
                hint={INPUT_GUIDES.coverLetter.hint}
                error={errors.coverLetter}
                required
                rows={6}
                maxLength={800}
              />

              <FormSection
                title="希望条件"
                description="入社希望日や給与の希望をお知らせください"
                icon={<Calendar size={16} />}
              />

              <FormField
                label={INPUT_GUIDES.desiredStartDate.label}
                name="desiredStartDate"
                value={formData.desiredStartDate}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={INPUT_GUIDES.desiredStartDate.placeholder}
                hint={INPUT_GUIDES.desiredStartDate.hint}
                error={errors.desiredStartDate}
                required
                maxLength={50}
              />

              <FormField
                label={INPUT_GUIDES.expectedSalary.label}
                name="expectedSalary"
                value={formData.expectedSalary}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={INPUT_GUIDES.expectedSalary.placeholder}
                hint={INPUT_GUIDES.expectedSalary.hint}
                error={errors.expectedSalary}
                maxLength={50}
              />

              <FormSection
                title="配慮事項のご要望"
                description="必要な配慮があれば記載してください（任意）"
                icon={<Shield size={16} />}
              />

              <FormField
                label={INPUT_GUIDES.accommodationRequest.label}
                name="accommodationRequest"
                value={formData.accommodationRequest}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={INPUT_GUIDES.accommodationRequest.placeholder}
                hint={INPUT_GUIDES.accommodationRequest.hint}
                rows={3}
                maxLength={400}
              />
            </div>
          )}

          {/* ステップ2: 確認・送信 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                <h3 className="font-bold text-stone-700 text-sm mb-3">応募内容の確認</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-stone-500 mb-1">志望動機・自己PR</p>
                    <p className="text-stone-800 text-sm bg-white rounded-xl p-3 border border-stone-100 whitespace-pre-wrap leading-relaxed">
                      {formData.coverLetter}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-stone-500 mb-1">入社希望日</p>
                      <p className="text-stone-800 text-sm font-medium">{formData.desiredStartDate}</p>
                    </div>
                    {formData.expectedSalary && (
                      <div>
                        <p className="text-xs text-stone-500 mb-1">希望給与</p>
                        <p className="text-stone-800 text-sm font-medium">{formData.expectedSalary}</p>
                      </div>
                    )}
                  </div>
                  {formData.accommodationRequest && (
                    <div>
                      <p className="text-xs text-stone-500 mb-1">配慮事項のご要望</p>
                      <p className="text-stone-800 text-sm bg-white rounded-xl p-3 border border-stone-100 whitespace-pre-wrap">
                        {formData.accommodationRequest}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 同意チェックボックス */}
              <div className={`rounded-2xl p-4 border ${errors.agreeToTerms ? 'border-red-300 bg-red-50' : 'border-stone-200 bg-stone-50'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 accent-emerald-500"
                  />
                  <div>
                    <p className="text-sm text-stone-700 font-medium">
                      個人情報の取り扱いに同意します
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      入力した情報は応募先企業に共有されます。
                      <a href="#" className="text-emerald-600 underline ml-1">プライバシーポリシー</a>
                      をご確認ください。
                    </p>
                  </div>
                </label>
                {errors.agreeToTerms && (
                  <div className="flex items-center gap-1.5 mt-2 text-red-600">
                    <AlertCircle size={13} />
                    <p className="text-xs">{errors.agreeToTerms}</p>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{submitError}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター（ナビゲーションボタン） */}
        <div className="border-t border-stone-100 p-5 flex items-center justify-between gap-3">
          <button
            onClick={step === 0 ? onClose : () => setStep(prev => prev - 1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <ChevronLeft size={16} />
            {step === 0 ? 'キャンセル' : '戻る'}
          </button>

          {step < 2 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors"
            >
              次へ
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <><Loader2 size={16} className="animate-spin" /> 送信中...</>
              ) : (
                <><Send size={16} /> 応募を送信する</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
