# BeefLine Frontend - Quick Start Guide

## Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Lint Code
```bash
npm run lint
```

## Project Structure

```
beefline-frontend/
├── public/              # Static assets
│   ├── manifest.json    # PWA manifest
│   └── service-worker.js # Service worker for offline support
├── src/
│   ├── __tests__/       # E2E tests
│   │   └── e2e/         # End-to-end test suites
│   ├── components/      # React components
│   │   ├── auth/        # Authentication components
│   │   ├── cattle/      # Cattle-related components
│   │   ├── layout/      # Layout components
│   │   ├── search/      # Search components
│   │   ├── ui/          # Reusable UI components
│   │   └── user/        # User profile components
│   ├── contexts/        # React contexts
│   │   ├── AuthContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   ├── useLazyLoad.ts
│   │   ├── useResponsive.ts
│   │   └── useSearch.ts
│   ├── pages/           # Page components (lazy-loaded)
│   │   ├── HomePage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── CowDetailPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── DashboardPage.tsx
│   ├── services/        # API services
│   │   └── api.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   │   ├── cache.ts     # Caching utility
│   │   ├── performance.ts # Performance monitoring
│   │   ├── responsive.ts
│   │   └── serviceWorker.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Features

### Performance Optimizations
- ✅ Code splitting with React.lazy()
- ✅ Image lazy loading with intersection observer
- ✅ API response caching (2-minute TTL)
- ✅ Debounced search and filters (300ms)
- ✅ React.memo for expensive components
- ✅ Web Vitals monitoring

### User Experience
- ✅ Responsive design (mobile-first)
- ✅ Offline support with service worker
- ✅ Progressive Web App (PWA)
- ✅ Toast notifications
- ✅ Error boundaries
- ✅ Loading states and skeletons

### Developer Experience
- ✅ TypeScript for type safety
- ✅ ESLint for code quality
- ✅ Vitest for testing
- ✅ Hot module replacement (HMR)
- ✅ Fast builds with Vite

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## Performance Tips

### 1. Use React.memo for List Items
```tsx
const CowCard = React.memo(({ cattle, onClick }) => {
  // Component implementation
});
```

### 2. Debounce User Input
```tsx
import { useDebounce } from './hooks/useDebounce';

const debouncedQuery = useDebounce(query, 300);
```

### 3. Cache API Responses
```tsx
import { cachedApiCall } from './utils/cache';

const data = await cachedApiCall(
  'cache-key',
  () => api.getData(),
  120000 // 2 minutes
);
```

### 4. Lazy Load Images
```tsx
import { OptimizedImage } from './components/ui/OptimizedImage';

<OptimizedImage
  src={imageUrl}
  alt="Description"
  className="w-full h-full object-cover"
/>
```

### 5. Monitor Performance
```tsx
import { measureRender } from './utils/performance';

useEffect(() => {
  const endMeasure = measureRender('ComponentName');
  return endMeasure;
}, []);
```

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add lazy import in `App.tsx`
3. Add route in `App.tsx`
4. Update navigation if needed

### Adding a New Component
1. Create component in appropriate directory
2. Export from `index.ts` if needed
3. Add tests in `__tests__` directory
4. Use TypeScript for props

### Adding API Endpoint
1. Add function to `src/services/api.ts`
2. Add types to `src/types/index.ts`
3. Use in components with error handling

### Styling Components
- Use Tailwind CSS utility classes
- Follow mobile-first approach
- Use responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Add custom styles in `index.css` if needed

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Type Errors
```bash
# Check TypeScript errors
npx tsc --noEmit
```

### Performance Issues
1. Check bundle size: `npm run build`
2. Use React DevTools Profiler
3. Check Network tab for API calls
4. Review performance metrics in console

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Vitest](https://vitest.dev)

## Support

For issues or questions:
1. Check existing documentation
2. Review error messages carefully
3. Check browser console for errors
4. Review network requests in DevTools
