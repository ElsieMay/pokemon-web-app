# Pokemon Shakespeare Translator 🎭⚡

A Next.js web application that fetches Pokemon data from the PokeAPI and translates their descriptions into Shakespearean English using the FunTranslations API. Users can search for Pokemon, view translations, and save and delete their favorites.

## 🌐 Live Demo

**[View Live Application →](https://pokemon-web-app-mxve.onrender.com)**

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

- **Framework:** [Next.js 15.5.2](https://nextjs.org/) (App Router with React Server Components)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Neon](https://neon.tech) (Serverless PostgreSQL)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Validation:** [Zod](https://zod.dev/)
- **Testing:** [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react)
- **Deployment:** [Render](https://render.com/) - Web Service

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
# Database Connection (Neon or any PostgreSQL - Required)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Neon Project IDs (Optional - only needed for Neon-specific features)
NEON_ORG_ID="org-your-org-name-12345678"
NEON_PROJECT_ID="your-project-name-12345678"

# Rate Limiting Configuration (Optional - defaults provided)
RATE_LIMIT_MAX=150           # Max requests per window
RATE_LIMIT_WINDOW=60000      # Time window in milliseconds (60 seconds)

# Database Pool Configuration (Optional - defaults provided)
DB_POOL_MAX=1                # Maximum connection pool size
DB_IDLE_TIMEOUT=30000        # Idle timeout in milliseconds

# Environment (Optional - defaults to development)
NODE_ENV="development"       # Options: development, production, test
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
- **Documentation:** [pokeapi.co/docs](https://pokeapi.co/docs/v2)

### FunTranslations API

- **Base URL:** `https://api.funtranslations.com/translate/shakespeare.json`
- **Documentation:** [funtranslations.com/api](https://funtranslations.com/api/)

## 🚢 Deployment

### Deployed on Render

**Live App:** [https://pokemon-web-app-mxve.onrender.com](https://pokemon-web-app-mxve.onrender.com)

#### Quick Deploy - Render

- Go to [Render Dashboard](https://dashboard.render.com/)
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Add environment variables → **Environment** tab → Add as per .env.example
- Manually trigger a redeploy from the dashboard

## 🐛 Troubleshooting

### Missing Environment Variables

**Error:** `Environment validation failed: DATABASE_URL: Invalid input: expected string, received undefined`

**Solution:**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your service
3. Go to **Environment** tab
4. Add `DATABASE_URL` with your Neon connection string
5. Click **Save Changes**
6. Manually redeploy: Click **Manual Deploy** → **Deploy latest commit**

### Build or Start Command Fails

**Error:** Build or start command exits with error

**Solution:**

- Verify build command: `npm install && npm run build`
- Verify start command: `npm start`
- Check **Logs** tab for detailed error messages
- Ensure Node.js version is set to 20.x

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) - Free Pokemon data
- [FunTranslations API](https://funtranslations.com/) - Shakespeare translation
- [Neon](https://neon.tech) - Serverless PostgreSQL
- [Next.js](https://nextjs.org/) - React framework

---

Made with ❤️ and ⚡ by [Elsie Lawrie](https://github.com/elsiemay)
