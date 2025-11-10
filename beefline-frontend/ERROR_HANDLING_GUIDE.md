# Error Handling and User Feedback Guide

This guide explains how to use the error handling and user feedback features implemented in the Beefline application.

## Features Implemented

### 1. ErrorBoundary Component
Catches React errors and displays a user-friendly fallback UI.

**Usage:**
```tsx
import { ErrorBoundary } from './components/ui';

// Wrap your components
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <YourComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary onError={(error, errorInfo) => {
  // Log to error service
  console.error(error, errorInfo);
}}>
  <YourComponent />
</ErrorBoundary>
```

### 2. Notification System
Toast notifications for success, error, warning, and info messages.

**Usage:**
```tsx
import { useNotification } from './contexts/NotificationContext';

function MyComponent() {
  const { showNotification } = useNotification();

  const handleSuccess = () => {
    showNotification('success', 'Cattle listing created successfully!');
  };

  const handleError = () => {
    showNotification('error', 'Failed to save listing. Please try again.');
  };

  const handleWarning = () => {
    showNotification('warning', 'Some fields are missing.');
  };

  const handleInfo = () => {
    showNotification('info', 'New features available!', 10000); // 10 seconds
  };

  return (
    <button onClick={handleSuccess}>Save</button>
  );
}
```

### 3. Progress Bar
Visual progress indicator for uploads and long-running operations.

**Usage:**
```tsx
import { ProgressBar } from './components/ui';

function UploadComponent() {
  const [progress, setProgress] = useState(0);

  return (
    <ProgressBar 
      progress={progress} 
      label="Uploading images..."
      showPercentage={true}
      size="md"
      color="green"
    />
  );
}
```

### 4. Offline Indicator
Automatically displays when the user loses internet connection.

**Usage:**
```tsx
import { useOnlineStatus } from './hooks/useOnlineStatus';

function MyComponent() {
  const isOnline = useOnlineStatus();

  return (
    <div>
      {!isOnline && <p>You are offline. Changes will sync when you reconnect.</p>}
    </div>
  );
}
```

### 5. PWA Features
- Service worker for offline cattle browsing
- PWA manifest for mobile installation
- Cached data for offline access

**Installation:**
Users can install the app on their mobile devices by:
1. Opening the app in their mobile browser
2. Tapping the "Add to Home Screen" option
3. The app will work offline with cached cattle listings

## Integration in App.tsx

The error handling and notification features are already integrated at the app level:

```tsx
<ErrorBoundary>
  <NotificationProvider>
    <AuthProvider>
      <Router>
        <ToastContainer />
        <OfflineIndicator />
        {/* Your routes */}
      </Router>
    </AuthProvider>
  </NotificationProvider>
</ErrorBoundary>
```

## Best Practices

1. **Use notifications for user feedback:**
   - Success: After successful operations (save, delete, update)
   - Error: When operations fail
   - Warning: For validation issues or important notices
   - Info: For general information or tips

2. **Wrap critical components with ErrorBoundary:**
   - Wrap entire route components
   - Wrap complex features that might fail
   - Provide custom fallbacks for better UX

3. **Handle offline state:**
   - Check `useOnlineStatus()` before making API calls
   - Show appropriate messages when offline
   - Queue operations to retry when back online

4. **Progress indicators:**
   - Use for file uploads
   - Use for multi-step forms
   - Use for data processing operations

## Testing

All error handling features have comprehensive tests:
- `ErrorBoundary.test.tsx` - Tests error catching and fallback UI
- `NotificationContext.test.tsx` - Tests notification system
- `useOnlineStatus.test.tsx` - Tests online/offline detection

Run tests with:
```bash
npm test
```
