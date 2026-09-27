# VocaloCart

[English](README.md) | 日本語

**フルスタックのボーカロイド関連グッズ通販プラットフォーム。**

Next.js 16(App Router)、Prisma、PostgreSQL、NextAuth.js v5、Stripe を使用して構築 — ストアフロントとバックエンドAPIの両方を1つのアプリケーションで処理しており、以前の Spring Boot + Vite/React 実装から移行したものです。

**デモサイト:** [vocalocart-dev.vercel.app](https://vocalocart-dev.vercel.app) — Stripe はテストモードで動作しています。カード番号 `4242 4242 4242 4242`、有効期限は未来の任意の日付、CVC は任意の数字で決済をお試しいただけます。実際の請求は発生しません。

[![Next.js](https://img.shields.io/badge/Next.js-16-black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)]()
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)]()
[![Vitest](https://img.shields.io/badge/tests-Vitest-6E9F18)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()

---

## 主な機能

### ユーザー管理
- ユーザー登録・ログイン(認証情報方式)、NextAuth.js v5 による JWT セッション
- ロールベースのアクセス制御(管理者 / 一般ユーザー)
- プロフィール編集、複数のお届け先の保存(デフォルト設定可能)

### 購入体験
- 検索・カテゴリー絞り込み・並び替え・ページネーションに対応した商品カタログ
- 関連商品セクションと、CTA付近に配送・返品案内を掲載した商品詳細ページ
- 商品ごとのメタデータと `schema.org` の `Product` JSON-LD(検索結果・SNSプレビュー用)
- ログインユーザー向けにDBで管理されるショッピングカートとウィッシュリスト
- 配送料無料ライン(¥5,000以上)と消費税(10%)を全ての合計金額で自動計算
- 英語 / 日本語の表示切り替え(next-intl。言語設定はクッキーに保存され、URLプレフィックスは使用しません)

### 注文とチェックアウト
- Stripe を利用したチェックアウト(Payment Element)。コンビニ決済にも対応
- クーポン/割引コードのサポート
- 冪等な決済インテントの作成、およびクライアントがリダイレクトを完了できなかった場合のセーフティネットとして注文を確定する、再実行安全な(replay-safe)Webhook
- 在庫の競合防止:注文トランザクション内で在庫数を条件付きで減算するため、同時に発生した複数注文による在庫の過剰販売を防止
- 7段階のステータス追跡と、価格の内訳(小計・配送料・クーポン・税・合計)を含む注文履歴

### 管理者パネル
- Vercel Blob への画像アップロードを含む、商品のCRUD管理
- 全ユーザーの注文状況の確認・更新
- カテゴリーは `/api/categories` API(書き込みは管理者のみ)またはSQLで管理します — 管理画面にはまだカテゴリー管理ページがありません

### エンジニアリング
- 認証・チェックアウト・検索エンドポイントへのレート制限
- ユーザー入力を受け付けるAPIルートへの Zod バリデーション
- カート/チェックアウト/配送先フォームのアクセシビリティ対応(ラベル、ARIA、フォーカス状態)
- 価格・税・配送料の計算とカート合計に関する単体テスト(Vitest)
- PRごとに lint・型チェック・テストを実行する GitHub Actions CI

---

## 技術スタック

| レイヤー | 技術 |
|-------|-----------|
| フレームワーク | Next.js 16(App Router) |
| 言語 | TypeScript 5 |
| 認証 | NextAuth.js v5(beta) — 認証情報方式 + JWT |
| ORM | Prisma(`@prisma/adapter-pg`) |
| データベース | PostgreSQL(Neon / Supabase) |
| クライアント状態管理 | Zustand(カートストア) |
| 決済 | Stripe(カード + コンビニ決済) |
| メール | Resend |
| ファイルストレージ | Vercel Blob |
| UI | Tailwind CSS v4、shadcn/ui + Radix primitives、lucide-react アイコン |
| 多言語対応 | next-intl(英語 / 日本語) |
| バリデーション | Zod |
| テスト | Vitest |
| CI | GitHub Actions |
| ホスティング | Vercel(関数リージョン `iad1`)、Neon Postgres(`aws-us-east-1`) |

---

## プロジェクト構成

```
vocalocart-nextjs/
├── messages/
│   ├── en.json                # 英語のUI文言
│   └── ja.json                # 日本語のUI文言
├── prisma/
│   ├── schema.prisma          # データベーススキーマ
│   ├── migrations/            # Prismaのマイグレーション履歴
│   └── seed.ts                # テストデータ投入用シーダー
├── src/
│   ├── app/
│   │   ├── api/                 # APIルートハンドラー
│   │   │   ├── auth/            # NextAuth + 新規登録
│   │   │   ├── cart/            # カートのCRUD
│   │   │   ├── wishlist/        # ウィッシュリストのCRUD
│   │   │   ├── orders/          # 注文管理
│   │   │   ├── products/        # 商品一覧・詳細(+ 関連商品)
│   │   │   ├── categories/      # カテゴリー管理
│   │   │   ├── addresses/       # 配送先管理
│   │   │   ├── payments/        # Stripeの決済インテント + Webhook
│   │   │   ├── coupons/         # クーポン検証
│   │   │   ├── contact/         # お問い合わせフォーム(Resend)
│   │   │   └── admin/           # 管理者用アップロード + 注文管理
│   │   ├── product/[id]/        # 商品詳細ページ + メタデータ/JSON-LDレイアウト
│   │   ├── cart/, checkout/     # カート・チェックアウト(完了ページ含む)
│   │   ├── orders/               # 注文履歴
│   │   ├── admin/                # 管理者用の注文・商品管理
│   │   ├── my/, addresses/       # プロフィール・配送先管理ページ
│   │   ├── login/, register/     # 認証ページ
│   │   ├── contact/              # お問い合わせフォーム
│   │   ├── layout.tsx            # ルートレイアウト(Navbar, Footer, Providers)
│   │   └── page.tsx              # ホーム / 商品一覧
│   ├── components/
│   │   ├── ui/                   # shadcn/ui のプリミティブ(button, input, select など)
│   │   ├── ProductCard.tsx, PriceTag.tsx, QuantityStepper.tsx
│   │   ├── PageHeader.tsx, EmptyState.tsx, OrderStatusBadge.tsx
│   │   ├── Navbar.tsx, Footer.tsx, LocaleSwitcher.tsx
│   │   └── Providers.tsx         # SessionProvider + ThemeProvider(ダークテーマのみ)
│   ├── i18n/                     # ロケール設定 + next-intl のリクエスト設定(クッキー方式)
│   ├── hooks/
│   │   └── use-cart.ts           # Zustandによるカートストア
│   ├── lib/
│   │   ├── auth.ts               # NextAuthの設定
│   │   ├── prisma.ts             # Prismaクライアントのシングルトン
│   │   ├── pricing.ts            # 配送料/税/割引の計算ロジック(単体テスト済み)
│   │   ├── create-order-from-cart.ts  # 注文作成処理の共通トランザクション
│   │   ├── rate-limit.ts         # proxy.ts で使用されるインメモリのレート制限
│   │   └── order-status.ts       # 注文ステータスのenumと表示用メタデータ
│   ├── proxy.ts                  # APIルート向けの認証ファストフェイル + レート制限(旧 middleware.ts)
│   └── types/
│       └── next-auth.d.ts        # セッション型の拡張
```

---

## はじめに

### 必要環境

- **Node.js** 20.9以上(Next.js 16 の最低要件。CIと同じ 22 を推奨)
- **PostgreSQL** データベース([Neon](https://neon.tech) または [Supabase](https://supabase.com) のどちらでも動作します)
- **Stripe** アカウント(決済用)

### 1. クローンとインストール

```bash
git clone https://github.com/murasakijyuutann/vocaloidshop-fullstack.git
cd vocaloidshop-fullstack/vocalocart-nextjs
npm install
```

### 2. 環境変数の設定

```bash
cp .env.example .env.local
```

`.env.local` を編集してください。各項目の詳細と取得方法は [`.env.example`](vocalocart-nextjs/.env.example)(データベース、NextAuth、Stripe、Resend、Vercel Blob)を参照してください。

> `NEXTAUTH_SECRET` は次のコマンドで生成できます: `openssl rand -base64 32`

### 3. データベースのセットアップ

```bash
npx prisma migrate dev
```

### 4.(任意)テストデータの投入

```bash
npx prisma db seed
```

サンプルのカテゴリー・商品に加えて、パスワードが公開されている2つのアカウント(`admin@vocalocart.com` / `admin123`、`test@vocalocart.com` / `user123`)が作成されます。**ローカル開発専用です — 本番データベースに対しては絶対に実行しないでください。**

### 5. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

---

## テスト

```bash
npm test           # 一度だけ実行
npm run test:watch # ウォッチモード
```

---

## データベーススキーマ

主要なモデル: `User`, `Product`, `Category`, `CartItem`, `WishlistItem`, `Order`, `OrderItem`, `Address`, `Coupon`。`Order` は `discountAmount`、`taxAmount`、`couponCode`、`stripePaymentIntentId`(一意制約・冪等な注文作成に使用)を保持します。

スキーマ全体は [`prisma/schema.prisma`](vocalocart-nextjs/prisma/schema.prisma) を参照してください。

---

## APIルート

すべてのルートは `src/app/api/` 配下にあります。保護されたルートには有効なセッションクッキーが必要です — `src/proxy.ts` がルートハンドラーに到達する前に未認証リクエストをファストフェイルさせ、認証・チェックアウト・検索エンドポイントのレート制限も行います。

| メソッド | ルート | 説明 | 認証 |
|--------|-------|-------------|------|
| POST | `/api/auth/register` | 新規ユーザー登録 | 公開(レート制限あり) |
| GET | `/api/products` | 商品一覧(検索・絞り込み・並び替え・ページネーション) | 公開(レート制限あり) |
| GET | `/api/products/[id]` | 商品詳細 + 関連商品 | 公開 |
| GET | `/api/categories` | カテゴリー一覧 | 公開 |
| GET/POST/DELETE | `/api/cart` | カートの取得 / 追加 / 全削除 | 要認証 |
| PATCH/DELETE | `/api/cart/[id]` | 数量変更 / 商品削除 | 要認証 |
| GET/POST | `/api/wishlist` | ウィッシュリストの取得 / 追加 | 要認証 |
| DELETE | `/api/wishlist/[productId]` | ウィッシュリストから削除 | 要認証 |
| GET/POST | `/api/orders` | 注文履歴 / 注文確定 | 要認証(レート制限あり) |
| GET/PATCH | `/api/orders/[id]` | 注文詳細 / ステータス更新 | 要認証 |
| GET/POST/DELETE | `/api/addresses` | 配送先の管理 | 要認証 |
| POST | `/api/payments/create-intent` | Stripe決済インテントの作成 | 要認証(レート制限あり) |
| POST | `/api/payments/webhook` | Stripe Webhookハンドラー | Stripe署名 |
| POST | `/api/coupons/validate` | クーポンコードの検証 | 要認証 |
| POST | `/api/contact` | お問い合わせフォーム(Resend経由で送信) | 公開 |
| GET/POST | `/api/admin/orders` | 管理者 — 全注文 | 管理者 |
| PATCH | `/api/admin/orders/[id]` | 管理者 — 注文ステータス更新 | 管理者 |
| POST | `/api/admin/upload` | 管理者 — 画像アップロード(Vercel Blob) | 管理者 |
| GET/POST/PATCH/DELETE | `/api/users/me` | プロフィール管理 | 要認証 |

---

## 管理者権限

管理者権限を付与するには、データベース内のユーザーレコードを直接更新してください:

```sql
UPDATE "user" SET is_admin = true WHERE email = 'your@email.com';
```

その後、ログアウトしてから再度ログインしてください(管理者フラグはセッショントークンに保存されるため、再ログインするまで反映されません)。ナビゲーションバーに管理者用リンク(注文管理・商品管理)が表示されます。

新しい本番データベースにはカテゴリーが存在しないため、作成するまで商品登録フォームのカテゴリー選択は空のままです。SQLで追加してください。例:

```sql
INSERT INTO category (name, description) VALUES ('Figures', 'Vocaloid character figures and statues');
```

---

## デプロイ

本番環境は [Vercel](https://vercel.com) と Neon Postgres で稼働しています:

- Vercel プロジェクトの Root Directory: **`vocalocart-nextjs`**(アプリはリポジトリのルートにはありません)
- `main` ブランチへのプッシュで本番環境へ自動デプロイされます
- 環境変数の一覧は [`.env.example`](vocalocart-nextjs/.env.example) を参照してください。`STRIPE_SECRET_KEY` と `RESEND_API_KEY` はモジュール読み込み時にクライアントが生成されるため、初回ビルド前に設定が必要です。`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` はビルド時に埋め込まれるため、変更した場合は再デプロイが必要です。
- **マイグレーションは手動で実行します**(ビルドでは実行されません)。スキーマ変更に依存するコードをプッシュする前に実行してください:

  ```bash
  cd vocalocart-nextjs
  DATABASE_URL="<本番の接続文字列>" npx prisma migrate deploy
  ```

- Stripe Webhook のエンドポイントは `https://<ドメイン>/api/payments/webhook` で、`payment_intent.succeeded` イベントを受信します。`stripe listen` のものではなく、このエンドポイント自身の署名シークレットを使用してください。

手順ごとのチェックリストと未完了のデプロイ後テストは [`docs/vocalocart-deployment-checklist.md`](docs/vocalocart-deployment-checklist.md)、現在の本番環境を構築した際の記録は [`docs/vocalocart-deployment-log-2026-09-27.md`](docs/vocalocart-deployment-log-2026-09-27.md) を参照してください。

ローカルで本番ビルドを実行する場合:

```bash
npm run build
npm start
```

---

## プロジェクトドキュメント

- [`docs/vocalocart-design-brief.md`](docs/vocalocart-design-brief.md) — ビジュアルリデザインのブリーフ(ダークテーマ、shadcn/ui、絵文字なしUI)
- [`docs/vocalocart-task-audit.md`](docs/vocalocart-task-audit.md) — 元のタスク仕様とコードベースの対応状況の調査
- [`docs/vocalocart-execution-log.md`](docs/vocalocart-execution-log.md) — 実際に実装した内容を、順序と検証メモ付きで記録したログ
- [`docs/vocalocart-i18n-plan.md`](docs/vocalocart-i18n-plan.md) — 英語 / 日本語UIの計画と設計判断
- [`docs/vocalocart-vercel-deployment-guide.md`](docs/vocalocart-vercel-deployment-guide.md) — Vercelデプロイの手順ガイド
- [`docs/vocalocart-deployment-checklist.md`](docs/vocalocart-deployment-checklist.md) — デプロイチェックリスト、デプロイ後テスト、本番運用前の残作業
- [`docs/vocalocart-deployment-log-2026-09-27.md`](docs/vocalocart-deployment-log-2026-09-27.md) — 初回本番デプロイの記録
- [`SCALE_AUDIT.md`](SCALE_AUDIT.md) — 負荷テストの結果と、それに基づくスケーリング改善
- [`vocalocart-nextjs/docs/vocalocart-edge-case-testing-guide.md`](vocalocart-nextjs/docs/vocalocart-edge-case-testing-guide.md) — エッジケース・セキュリティの手動テスト手順

---

## 作者

- **Fishyboyxx** — [GitHub](https://github.com/murasakijyuutann)

---

## ライセンス

MIT
