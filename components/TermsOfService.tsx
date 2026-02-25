import React from 'react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';

interface TermsOfServiceProps {
  setView: (view: ViewState) => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ setView }) => {
  return (
    <div className="w-full">
      <PageHeader 
        title="利用規約" 
        subtitle="サービスのご利用にあたって"
        breadcrumbs={[{ label: '利用規約' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white shadow-sm rounded-2xl my-8 text-stone-800 border border-stone-200">
        <div className="space-y-8 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第1条（目的）</h2>
            <p>
              本利用規約（以下「本規約」といいます。）は、一般社団法人全国雇用共創センター（以下「当センター」といいます。）が提供する障がい者雇用支援プラットフォーム「トコトコ (Tocotoco)」（以下「本サービス」といいます。）の利用条件を定めるものです。
              本サービスを利用する全てのユーザー（求職者、掲載企業を含む）は、本規約に同意したものとみなされます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第2条（定義）</h2>
            <p>本規約において使用する用語の定義は、以下の通りとします。</p>
            <ul className="list-disc list-inside mt-2 space-y-1 pl-4 text-stone-600">
              <li>「ユーザー」とは、本サービスを利用するために会員登録を行った個人または法人を指します。</li>
              <li>「登録情報」とは、ユーザーが本サービス登録時に提供した氏名、メールアドレス、職務経歴、障がい特性及び配慮事項等の情報を指します。</li>
              <li>「AI診断」とは、本サービスが提供する機械学習を用いた適性検査、面接シミュレーション等の機能を指します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第3条（会員登録）</h2>
            <p>
              1. 本サービスの利用を希望する者は、当センターの定める方法により会員登録申請を行うものとします。<br />
              2. 当センターは、以下の事由があると判断した場合、登録を承認しないことがあります。
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 pl-4 text-stone-600">
              <li>登録内容に虚偽の事実がある場合</li>
              <li>過去に本規約違反等により利用停止処分を受けている場合</li>
              <li>その他、当センターが利用を適当でないと判断した場合</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第4条（禁止事項）</h2>
            <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc list-inside mt-2 space-y-1 pl-4 text-stone-600">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>当センターのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>他のユーザーに成りすます行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第5条（免責事項）</h2>
            <p>
              1. 当センターは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。<br />
              2. 当センターは、本サービスに起因してユーザーに生じたあらゆる損害について、当センターの故意又は重過失による場合を除き、一切の責任を負いません。
            </p>
          </section>

          <div className="bg-stone-50 p-6 rounded-xl mt-12 border-t-2 border-stone-200">
              <h3 className="font-bold text-stone-900 mb-4">運営会社情報</h3>
              <dl className="space-y-2 text-sm text-stone-600">
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32">運営</dt>
                  <dd>一般社団法人全国雇用共創センター</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32">住所</dt>
                  <dd>〒101-0031 東京都千代田区東神田一丁目１４番１３号</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32">お問い合わせ</dt>
                  <dd>support@tocotoco.jp</dd>
                </div>
              </dl>
          </div>
        </div>
      </div>
    </div>
  );
};