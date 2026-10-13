import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV は KiwiCanopy のもとで開発された複数のツールの1つです。ファミリーの他のツールも探求してみましょう。',
    family_title: 'KiwiCanopy ファミリーの一員',
    kiwicanopy_desc: 'すべてのツールが集まる KiwiCanopy ファミリーのホームベースです。',
    kiwidesk_desc: 'KiwiCanopy ファミリーの姉妹アプリです。',
    story_p1:
      '私自身や、友人や知人との会話の中でも、私は何度も同じ不満を感じてきました。それは、新しい応募のたびに履歴書を苦労して書き直すという面倒な作業です。誰もが、履歴書を詰め込みすぎに見せることなく、それぞれの職種に合わせて自分の経験をピンポイントで調整したいと考えています。しかし、従来のツールではそれが苦痛になります。わずかな調整のたびに全く新しいドキュメントを作成しなければならないことが多く、すぐに終わりのないバージョン管理の混乱に陥ってしまいます。',
    story_p2:
      'まさにこの理由から、私は KiwiCV を開発しました。これは、単一の中央の概要から、個々の項目を簡単にオン/オフに切り替えたり、セクションを自由に移動したり、柔軟にエクスポートしたりできるモジュール式の履歴書ビルダーです。無数の Word ドキュメント間での面倒なコピー＆ペーストはもう必要ありません。あなたのキャリア履歴全体に永続的な場所ができ、それぞれの応募に対して見せたいものだけをリラックスして選択できるようになります。',
    story_title: 'KiwiCV 誕生の物語',
    title: 'KiwiCV について',
    visit_site: 'サイトを訪問',
  },
  howto: {
    core: {
      ai_assistant: 'AIアシスタント',
      ai_assistant_desc:
        'AIアシスタントを使用して、個別のアイテム、セクション、または履歴書全体を最適化します。{wardsymbol} のアイコンを探してください！',
      hide_show: '表示/非表示',
      hide_show_desc:
        'エントリを何度も削除したり再挿入したりする手間を省くため、ワンクリックで個別のアイテムやセクション全体を非表示にできます。',
      move_items_desc:
        'セクションや個別のアイテムをサイドバーとメインカラムの間でドラッグ＆ドロップします。',
      page_breaks: '改ページ',
      page_breaks_desc:
        'PDFエクスポートを希望通りのレイアウトにするため、手動で改ページを挿入できます。これはPDFのみに適用され、Web版には影響しません。',
      rearrange: '並べ替え',
      rearrange_desc: 'セクション内のアイテムを並べ替えて、強調したい内容にフォーカスします。',
      switch_sides: 'サイドを切り替える',
      switch_sides_desc:
        'メインカラムとサイドバーを簡単に入れ替えて、最適なレイアウトを見つけましょう。',
      title: '主な機能',
    },
    footer: {
      message: 'KiwiCVで履歴書作成がもっと楽しくなりますように！就職活動頑張ってください！',
    },
    github: {
      create_pat_link: 'GitHub でトークンを作成',
      create_repo_link: 'GitHub でリポジトリを作成',
      go_to_settings: '設定に移動',
      intro:
        '履歴書をGitHubリポジトリに接続して、自動のマルチ言語処理、バージョン管理、簡単なホスティングを実現します。次の3つの手順に従ってください：',
      pat_security_tip:
        "セキュリティのヒント: 特定のリポジトリに対する 'Contents' の読み取り/書き込み権限のみを持つ 'Fine-grained' Personal Access Token を使用してください。'Only select repositories' を選択し、希望の有効期限を設定することを忘れないでください。",
      step1_desc:
        'GitHub で新しいプライベートリポジトリを作成してね。当面は完全に空のままで構わないよ（READMEも.gitignoreも不要）。',
      step1_title: 'リポジトリの作成',
      step2_desc:
        'KiwiCV がリポジトリにプッシュできるようにするには、Personal Access Token (PAT) が必要です。セキュリティを最大限に高めるために、fine-grained トークンを使用することをお勧めします。',
      step2_title: 'Personal Access Token の作成',
      step3_desc:
        '設定ページに移動し、GitHub セクションにリポジトリの詳細とトークンを入力します。または、右上にある GitHub ボタンをクリックすると、フォームが開いて PAT を入力することもできます。',
      step3_title: 'KiwiCV で接続',
      title: 'GitHub 連携ガイド',
    },
    hosting: {
      automated_title: 'オプションB：自動ホスティング（GitHub経由）',
      github_pages_desc:
        'KiwiCV で生成された HTML ファイルを使用し、GitHub リポジトリにアップロードします。リポジトリ設定で GitHub Pages を有効にすると、履歴書の無料の公開 URL を取得できます。',
      github_pages_title: 'GitHub Pages',
      intro:
        '生成された HTML バージョンの履歴書を無料でホストできます。最も一般的なオプションは次のとおりです：',
      manual_title: 'オプションA：手動アップロード（GitHub不要）',
      netlify_desc:
        'NetlifyやVercelなどのサービスは、簡単なドラッグアンドドロップでのデプロイやGitHub リポジトリとの自動同期が可能な無料の静的ホスティングを提供します。編集履歴を公開することなくHTML履歴書をアップロードできます。',
      netlify_drop_desc:
        'パーソナルURLで競争上の優位性を確保しましょう。**数秒で**履歴書をオンラインにできる**無料のプロバイダー**が数多くあります。上記のリンク先ツール経由でも、[Tiiny.host](https://tiiny.host)のような代替ツール経由でも、ウェブサイトをすばやく**ドラッグ＆ドロップ**するだけで、ウェブ上でプロフェッショナルな存在感を示すことができます。',
      netlify_drop_title: '高速で簡単：Netlify Drop',
      netlify_title: 'Netlify、Vercel など',
      privacy_warning:
        '警告：有料の GitHub プランを利用していない限り、GitHub Pages を使用するにはリポジトリを公開する必要があります。つまり、履歴書の履歴全体（すべてのコミット）が誰でも閲覧可能になります！プライバシーを重視する場合は、最初のオプションの利用を検討してください。',
      push_folder_hint:
        'KiwiCV は、HTML ファイルのみをリポジトリ内の特定のフォルダーにプッシュすることを排他的にサポートしています。プレビューページの高度な設定を確認してください。',
      sensitive_data_warning:
        'プライバシー警告：履歴書を公開URLでホストする場合、誰でもデータにアクセスできます。正確な住所、電話番号、メールアドレスなどの機密性の高い個人情報を削除することを検討してください。',
      title: '履歴書のホスティング',
    },
    pdf_guide: {
      font_size: 'フォントサイズ',
      font_size_desc: 'デザインタブでフォントサイズを調整して、スペースを最適化します。',
      intro:
        'PDFのレンダリングは複雑です。ドキュメントが希望通りになるまで、以下の機能を試してみてください。',
      rearrange_sections: '並べ替え',
      rearrange_sections_desc:
        'セクションを並べ替えることで、不自然な改ページを解消できることがよくあります。',
      space_opt: 'スペースの最適化',
      space_opt_desc:
        '短いセクションをサイドバーに移動するだけで、十分なスペースを確保できる場合があります。',
      title: 'PDFレイアウトのコツ',
      use_pagebreaks: '改ページの使用',
      use_pagebreaks_desc:
        '端に近いアイテムは表示が崩れることがあります。改ページを使用して次のページに移動させてください。',
    },
    sync_guide: {
      auto_recognition_desc:
        '言語を切り替えると、クラウドに既存のバージョンがあるかどうかのチェックが実行されます。',
      auto_recognition_title: '自動認識',
      desc: 'KiwiCVは複数の言語を管理します。保存またはバックアップを行うと、現在アクティブな言語専用のバージョンが作成されます。後で言語を切り替えると、既存のバックアップを認識して復元を提案します。',
      language_specific_desc:
        '各言語バージョンは、クラウドレポジトリに個別のエントリとして保存されます。',
      language_specific_title: '言語別',
      title: 'インテリジェントな言語バックアップ',
    },
    toc_title: '目次',
  },
  page_description:
    '背景、サポート、そしてビジョン：KiwiCVを最大限に活用する方法、今後の展開、そして履歴書作成ツールの背後にあるストーリーをご覧ください。',
  page_title: 'エクストラ',
  tabs: {
    about: 'KiwiCV について',
    changelog: '変更ログ',
    howto: 'ガイド',
    roadmap: 'ロードマップ',
  },
};
