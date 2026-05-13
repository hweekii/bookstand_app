# The Neighbourhood Bookstand

A local reading social app — log books, compare taste with friends, and discover what your neighbourhood is reading.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the dev server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   Visit [http://localhost:5173](http://localhost:5173)

### Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build` | Build for production (output in `/dist`) |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── components/
│   ├── bookstand/     # BookShelf, ProfileHeader
│   ├── dna/           # DNAVisualization, GenreBreakdown, SharedBooks
│   ├── explore/       # HeroSection, GenreCarousel, FriendActivity, BookstandIllustration
│   ├── friends/       # FriendCard
│   ├── layout/        # AppLayout, Navbar
│   ├── log/           # BookSearchDropdown, StarRating
│   └── ui/            # Shared UI primitives (Button, Avatar, Select, Tabs…)
├── lib/
│   └── utils.js       # cn() helper
├── pages/
│   ├── Explore.jsx
│   ├── LogBook.jsx
│   ├── Bookstand.jsx
│   ├── Friends.jsx
│   ├── BookDNA.jsx
│   └── FriendBookstand.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## Changes from Base44

- Removed `@base44/sdk`, `@base44/vite-plugin`, auth context, and all cloud dependencies
- Replaced `AuthProvider` / `useAuth` with direct routing — no login required
- Replaced `queryClientInstance` import with an inline `QueryClient`
- All data is now local mock data (ready to swap in a real API)
- Trimmed `package.json` to only the packages actually used
- `tailwind.config.js` converted to ES module syntax
