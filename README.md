# Pokemon Shakespeare Translator 🎭⚡

A Next.js web application that fetches Pokemon data from the PokeAPI and translates their descriptions into Shakespearean English using the FunTranslations API. Users can search for Pokemon, view translations, and save and delete their favorites.

## ✨ Features

- 🔍 **Pokemon Search** - Search for any Pokemon by name or ID
- 📖 **Shakespeare Translation** - View Pokemon descriptions in Shakespearean English
- ⭐ **Favorites System** - Save your favorite Pokemon to a PostgreSQL database
- 🗑️ **Delete Favorites** - Remove Pokemon from your favorites list
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- ⚡ **Server Components** - Optimized performance with React Server Components
- 🔒 **Type Safety** - Full TypeScript support with Zod validation
- 🧪 **100% Test Coverage** - Comprehensive test suite with Jest

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router with React Server Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Testing:** [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react)
- **Deployment:** [Cloudflare Pages](https://pages.cloudflare.com/) (configured with `@cloudflare/next-on-pages`)

## 📋 Prerequisites

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **PostgreSQL Database** - One of the following:
  - [Neon](https://neon.tech) account (recommended for serverless)
  - Local PostgreSQL installation
  - Any PostgreSQL-compatible database
- **API Keys:**
  - No API key needed for [PokeAPI](https://pokeapi.co/) (free and open)
  - [FunTranslations API](https://funtranslations.com/api/) (free tier: 5 requests/hour)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/pokemon-web-app.git
cd pokemon-web-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database Connection (Neon or any PostgreSQL)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Optional: FunTranslations API Key (for higher rate limits)
FUNTRANSLATIONS_API_KEY="your-api-key-here"
```

### 4. Initialize the Database

```bash
npm run db:setup
```

**OR** manually execute the SQL schema:

1. Open your Neon SQL Editor or database client
2. Copy contents of `lib/schema.sql`
3. Execute the SQL commands

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
pokemon-web-app/
├── app/                      # Next.js App Router
│   ├── actions/             # Server Actions
│   ├── api/                 # API routes
│   ├── favorites/           # Favorites page
│   └── __tests__/           # Page tests
├── components/              # React components
│   ├── PokemonCard.tsx
│   ├── SearchForm.tsx
│   └── __tests__/
├── lib/                     # Utilities & business logic
│   ├── db.ts               # Database client
│   ├── pokeapi.ts          # PokeAPI client
│   ├── shakespeare.ts      # Translation service
│   ├── schema.sql          # Database schema
│   └── __tests__/
├── public/                  # Static assets
├── .env.example            # Environment template
└── coverage/               # Test coverage reports
```

## 🧪 Testing (100% Coverage)

[![Tests](https://github.com/yourusername/pokemon-web-app/actions/workflows/test.yml/badge.svg)](https://github.com/yourusername/pokemon-web-app/actions)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](coverage/lcov-report)

```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Generate coverage report
```

**Test Structure:**

- `app/__tests__/` - Page and Server Action tests
- `components/__tests__/` - Component tests
- `lib/__tests__/` - Utility and business logic tests

View detailed coverage report: `coverage/lcov-report/index.html`

## 🌐 API Integration

### PokeAPI

- **Base URL:** `https://pokeapi.co/api/v2/`
- **Rate Limit:** None
- **Documentation:** [pokeapi.co/docs](https://pokeapi.co/docs/v2)

### FunTranslations API

- **Base URL:** `https://api.funtranslations.com/translate/shakespeare.json`
- **Free Tier:** 5 requests/hour, 60 requests/day
- **Paid Plans:** Available at [funtranslations.com](https://funtranslations.com/api/)
- **Note:** The app handles rate limits gracefully by showing original text when limit is exceeded

## 🚢 Deployment

### Deploy to Cloudflare Pages

1. **Install Cloudflare CLI:**

```bash
npm install -g wrangler
```

2. **Login to Cloudflare:**

```bash
wrangler login
```

3. **Build and Deploy:**

```bash
npm run deploy
```

4. **Set Environment Variables:**
   - Go to your Cloudflare Pages dashboard
   - Navigate to Settings > Environment Variables
   - Add `DATABASE_URL` and optionally `FUNTRANSLATIONS_API_KEY`

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Connection refused` or `SSL required`

**Solution:**

- Ensure `DATABASE_URL` is correct in `.env.local`
- For Neon, ensure `?sslmode=require` is appended
- Check database is running and accessible

### Rate Limit Errors

**Error:** `429 Too Many Requests` from FunTranslations API

**Solution:**

- Free tier allows 5 requests/hour - upgrade for more requests

### Build Errors

**Error:** `Module not found` or TypeScript errors

**Solution:**

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) - Free Pokemon data
- [FunTranslations API](https://funtranslations.com/) - Shakespeare translation
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Next.js](https://nextjs.org/) - React framework

---

Made with ❤️ and ⚡ by [Elsie Lawrie](https://github.com/elsiemay)
