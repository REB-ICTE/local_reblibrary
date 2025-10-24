# REB Library - Moodle Plugin

Local Moodle plugin for the REB e-learning platform with TypeScript and Vite build support.

## Development Setup

```bash
# Install dependencies
pnpm install

# Build once
pnpm run build

# Watch for changes (development mode)
pnpm run dev
```

## Project Structure

```
amd/
├── src/              # TypeScript source files (ES6)
│   ├── library.ts
│   └── example-with-preact.ts
└── build/            # Compiled AMD modules (generated)
    ├── library.js
    └── example-with-preact.js
```

## Writing AMD Modules

All TypeScript files in `amd/src/` are automatically compiled to AMD format.

### Basic Module

```typescript
// amd/src/mymodule.ts
export const init = () => {
  console.log('Module initialized');
};
```

Compiles to:

```javascript
// amd/build/mymodule.js
define(["exports"], function(exports) {
  const init = () => {
    console.log('Module initialized');
  };
  exports.init = init;
});
```

### Using npm Packages

You can import any npm package - it will be bundled into the output:

```typescript
// amd/src/app.tsx
import { h } from 'preact';

export default function App() {
  return <div className="text-blue-500">Hello from Preact + Tailwind!</div>;
}
```

### Using Tailwind CSS

Tailwind CSS is pre-configured and ready to use. Just add Tailwind classes to your components:

```typescript
// amd/src/mycomponent.tsx
import { h } from 'preact';

export default function MyComponent() {
  return (
    <div className="p-4 bg-blue-500 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-white">Styled with Tailwind!</h1>
      <p className="text-white/80">All Tailwind utilities are available.</p>
    </div>
  );
}
```

**Note:**
- Tailwind CSS v4 is configured with the modern `@import "tailwindcss"` syntax
- CSS is automatically injected via JavaScript when the module loads
- No separate CSS file needs to be loaded in PHP
- Only the classes you use are included in the bundle (tree-shaking enabled)

### Loading in Moodle

In your PHP template or page:

```php
$PAGE->requires->js_call_amd('local_reblibrary/library', 'init');
```

## Build Configuration

- **Input**: `amd/src/*.ts` (auto-discovered)
- **Output**: `amd/build/*.js` (AMD format)
- **Preserves exports**: Even if unused (required for Moodle)
- **Tree-shaking**: Enabled for imported dependencies
- **Source maps**: Generated for debugging
- **Minification**: esbuild

## Key Features

✅ TypeScript support with type checking
✅ Import npm packages (Preact, Tailwind CSS, etc.)
✅ Tailwind CSS v4 integration
✅ Watch mode for development
✅ AMD format compatible with Moodle's RequireJS
✅ Automatic export preservation
✅ Fast builds with Vite
✅ Automatic CSS injection (styles bundled in JS)

## Troubleshooting

### Exports not showing up in Moodle

Make sure you're using `export const` or `export function`:

```typescript
// ✅ Good
export const init = () => {};

// ❌ Bad (won't be exported)
const init = () => {};
```

### Module not found

After adding new files, rebuild:

```bash
pnpm run build
```

Then purge Moodle caches:

```bash
docker compose exec php php /var/www/html/moodle_app/admin/cli/purge_caches.php
```
