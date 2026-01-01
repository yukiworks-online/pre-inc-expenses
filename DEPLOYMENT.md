# 🚀 デプロイメントガイド

## 1. 事前確認
ローカル環境でのビルド確認は完了しています。
- ✅ `npm run build` は正常に成功しました。
- ✅ 型エラーやLintの警告はありません。

## 2. インフラプラットフォーム
Next.js との相性が最も良い **Vercel** を推奨します。
(Netlify, Cloud Run, AWS Amplify などでも動作可能です)

## 3. 環境変数（必須）
本番環境（例: Vercelの Project Settings > Environment Variables）には、以下の環境変数を必ず設定してください。
**⚠️ `.env.local` ファイルは絶対に GitHub にコミットしないでください！**

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Measurement ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google Cloud Service Account Email (スプレッドシート/Drive用) |
| `GOOGLE_PRIVATE_KEY` | Google Private Key (改行コードに注意) |
| `GOOGLE_SHEET_ID` | データベースとなる Google SpreadSheet ID |
| `GOOGLE_API_KEY` | Gemini API Key |
| `GOOGLE_DRIVE_FOLDER_ID` | 領収書アップロード先の Google Drive Folder ID |

### 💡 `GOOGLE_PRIVATE_KEY` の設定について
Vercel に秘密鍵を追加する際は、`-----BEGIN PRIVATE KEY-----` から `-----END PRIVATE KEY-----` までを含めてそのままペーストしてください。Vercel は通常自動的に改行を処理しますが、うまく動作しない場合は `\n` が正しく解釈されているか確認してください。

## 4. デプロイ手順 (Vercel の場合)
1. コードを GitHub リポジトリにプッシュします。
   ```bash
   git add .
   git commit -m "Ready for deploy"
   git push origin main
   ```
2. [Vercel Dashboard](https://vercel.com/dashboard) にアクセスし、"Add New... > Project" をクリックします。
3. GitHub リポジトリをインポートします。
4. **"Environment Variables"** セクションを展開し、上記の全ての変数を追加します。
5. **"Deploy"** をクリックします。

## 5. デプロイ後の動作確認
- ログインし、Google Sign-in が機能することを確認します。
- テスト経費を登録し、Google スプレッドシートに行が追加されることを確認します。
- 領収書のアップロード（Google Drive への保存）が機能するか確認します。
- 「経費精算書」のPDF生成（詳細ページ）が正しく表示されるか確認します。
