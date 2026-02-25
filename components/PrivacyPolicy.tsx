import React from 'react';
import { ViewState } from '../types';
import { PageHeader } from './PageHeader';

interface PrivacyPolicyProps {
  setView: (view: ViewState) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ setView }) => {
  return (
    <div className="w-full">
      <PageHeader 
        title="プライバシーポリシー" 
        subtitle="個人情報の取り扱いについて"
        breadcrumbs={[{ label: 'プライバシーポリシー' }]}
        setView={setView}
        backgroundImage="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="max-w-4xl mx-auto p-6 md:p-12 bg-white shadow-sm rounded-2xl my-8 text-stone-800 border border-stone-200">
        <div className="space-y-8 leading-relaxed text-sm md:text-base">
          <p>
            一般社団法人全国雇用共創センター（以下，「当センター」といいます。）は，本ウェブサイト上で提供するサービス「トコトコ (Tocotoco)」（以下，「本サービス」といいます。）における，ユーザーの個人情報の取扱いについて，以下のとおりプライバシーポリシー（以下，「本ポリシー」といいます。）を定めます。
          </p>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第1条（個人情報）</h2>
            <p>
              「個人情報」とは，個人情報保護法にいう「個人情報」を指すものとし，生存する個人に関する情報であって，当該情報に含まれる氏名，生年月日，住所，電話番号，連絡先その他の記述等により特定の個人を識別できる情報及び容貌，指紋，声紋にかかるデータ，及び障害者手帳番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第2条（個人情報の収集方法）</h2>
            <p>
              当センターは，ユーザーが利用登録をする際に氏名，生年月日，住所，電話番号，メールアドレス，配慮事項，障がい特性などの個人情報をお尋ねすることがあります。また，ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を,当センターの提携先（情報提供元，広告主，広告配信先などを含みます。以下，｢提携先｣といいます。）などから収集することがあります。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第3条（個人情報を収集・利用する目的）</h2>
            <p>当センターが個人情報を収集・利用する目的は，以下のとおりです。</p>
            <ul className="list-disc list-inside mt-2 space-y-1 pl-4 text-stone-600">
              <li>当センターサービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>ユーザーが利用中のサービスの新機能，更新情報，キャンペーン等及び当センターが提供する他のサービスの案内のメールを送付するため</li>
              <li>メンテナンス，重要なお知らせなど必要に応じたご連絡のため</li>
              <li>利用規約に違反したユーザーや，不正・不当な目的でサービスを利用しようとするユーザーの特定をし，ご利用をお断りするため</li>
              <li>有料サービスにおいて，ユーザーに利用料金を請求するため</li>
              <li>上記の利用目的に付随する目的</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第4条（利用目的の変更）</h2>
            <p>
              当センターは，利用目的が変更前と関連性を有すると合理的に認められる場合に限り，個人情報の利用目的を変更するものとします。
              利用目的の変更を行った場合には，変更後の目的について，当センター所定の方法により，ユーザーに通知し，または本ウェブサイト上に公表するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-stone-900 border-l-4 border-stone-900 pl-3">第5条（お問い合わせ窓口）</h2>
            <p>本ポリシーに関するお問い合わせは，下記の窓口までお願いいたします。</p>
            <div className="bg-stone-50 p-6 rounded-xl mt-4 border border-stone-200">
              <dl className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32 text-stone-500">運営</dt>
                  <dd>一般社団法人全国雇用共創センター</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32 text-stone-500">住所</dt>
                  <dd>〒101-0031 東京都千代田区東神田一丁目１４番１３号</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32 text-stone-500">Eメール</dt>
                  <dd>support@tocotoco.jp</dd>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <dt className="font-bold w-32 text-stone-500">URL</dt>
                  <dd><a href="https://tocotoco.jp/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">https://tocotoco.jp/</a></dd>
                </div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};