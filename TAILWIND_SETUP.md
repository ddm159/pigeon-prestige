# Tailwind CSS Setup for Pigeon Racing Game

## Overview

This project uses a professional Tailwind CSS setup with custom components and design system specifically designed for the pigeon racing game.

## 🎨 Design System

### Color Palette

- **Primary**: Blue shades for main actions and branding
- **Pigeon**: Orange/amber shades for pigeon-themed elements
- **Success**: Green shades for positive actions and stats
- **Warning**: Yellow/orange shades for caution states
- **Danger**: Red shades for errors and destructive actions

### Typography

- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Responsive**: Scales appropriately across devices

## 🧩 Component Library

### Buttons

```tsx
// Primary button
<button className="btn-primary">Primary Action</button>

// Secondary button
<button className="btn-secondary">Secondary Action</button>

// Success button
<button className="btn-success">Success Action</button>

// Warning button
<button className="btn-warning">Warning Action</button>

// Danger button
<button className="btn-danger">Danger Action</button>

// Outline button
<button className="btn-outline">Outline Action</button>

// Sizes
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary btn-lg">Large</button>
```

### Cards

```tsx
// Basic card
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <p className="card-subtitle">Card subtitle</p>
  </div>
  <p>Card content goes here</p>
</div>

// Pigeon card
<div className="pigeon-card">
  <img src="/assets/pigeons/1.png" alt="Pigeon" className="pigeon-image" />
  <h3>Pigeon Name</h3>
  <div className="pigeon-stats">
    <div className="pigeon-stat">
      <span className="pigeon-stat-label">Speed:</span>
      <span className="pigeon-stat-value">85</span>
    </div>
  </div>
</div>

// Market item
<div className="market-item">
  <h3>Item Name</h3>
  <p>Item description</p>
  <div className="flex justify-between items-center">
    <span className="market-price">$1,250</span>
    <button className="btn-primary btn-sm">Buy Now</button>
  </div>
</div>
```

### Forms

```tsx
<form className="space-y-4">
  <div>
    <label className="form-label">Email Address</label>
    <input type="email" className="form-input" placeholder="Enter email" />
    <p className="form-help">Help text</p>
  </div>
  
  <div>
    <label className="form-label">Password</label>
    <input type="password" className="form-input" placeholder="Enter password" />
    <p className="form-error">Error message</p>
  </div>
  
  <button type="submit" className="btn-primary w-full">Submit</button>
</form>
```

### Stat Bars

```tsx
<div>
  <div className="flex justify-between text-sm mb-1">
    <span>Stat Name</span>
    <span>85%</span>
  </div>
  <div className="stat-bar">
    <div className="stat-fill-base" style={{ width: '85%' }}></div>
  </div>
</div>

// Different stat types
<div className="stat-fill-evolution" style={{ width: '92%' }}></div>  // Success green
<div className="stat-fill-warning" style={{ width: '45%' }}></div>   // Warning yellow
<div className="stat-fill-danger" style={{ width: '15%' }}></div>    // Danger red
```

### Navigation

```tsx
// Active link
<a href="#" className="nav-link-active">
  <svg className="w-4 h-4 mr-2">...</svg>
  Home
</a>

// Inactive link
<a href="#" className="nav-link-inactive">
  <svg className="w-4 h-4 mr-2">...</svg>
  Racing
</a>
```

### Badges

```tsx
<span className="badge-primary">Primary</span>
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-danger">Danger</span>
<span className="badge-gray">Gray</span>
```

### Loading States

```tsx
// Spinner
<div className="flex items-center space-x-2">
  <div className="loading-spinner w-6 h-6"></div>
  <span className="text-sm text-gray-600">Loading...</span>
</div>

// Dots
<div className="flex items-center space-x-2">
  <div className="loading-dots">
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
    <div className="loading-dot"></div>
  </div>
  <span className="text-sm text-gray-600">Processing...</span>
</div>
```

### Race Track

```tsx
<div className="race-track">
  <div className="race-lane">
    <div className="race-pigeon" style={{ left: '75%' }}></div>
  </div>
  <div className="race-lane">
    <div className="race-pigeon" style={{ left: '60%' }}></div>
  </div>
</div>
```

## 🎭 Animations

### Built-in Animations

```tsx
// Fade in
<div className="animate-fade-in">Content</div>

// Slide up
<div className="animate-slide-up">Content</div>

// Gentle bounce
<div className="animate-bounce-gentle">Content</div>

// Slow pulse
<div className="animate-pulse-slow">Content</div>
```

### Custom Keyframes

- `fadeIn`: Smooth opacity transition
- `slideUp`: Slide from bottom with fade
- `bounceGentle`: Subtle bouncing animation

## 🛠️ Configuration Files

### tailwind.config.js

Custom theme extensions including:
- Color palette (primary, pigeon, success, warning, danger)
- Custom animations and keyframes
- Extended spacing and sizing
- Custom shadows and border radius
- Form plugin integration

### postcss.config.js

PostCSS configuration for:
- Tailwind CSS processing
- Autoprefixer for browser compatibility

### src/index.css

Main stylesheet with:
- Tailwind directives
- Custom component classes
- Utility classes
- Animation definitions

## 🚀 Usage Guidelines

### Best Practices

1. **Use Component Classes**: Prefer `.btn-primary` over manual utility combinations
2. **Responsive Design**: Use responsive prefixes (`sm:`, `md:`, `lg:`)
3. **Consistent Spacing**: Use the design system spacing scale
4. **Accessibility**: Include focus states and proper contrast ratios
5. **Performance**: Let Tailwind purge unused styles in production

### Utility-First Approach

```tsx
// Good: Using utility classes for layout
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-soft">
  <h2 className="text-lg font-semibold text-gray-900">Title</h2>
  <button className="btn-primary">Action</button>
</div>

// Good: Using component classes for complex elements
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
  </div>
  <p className="text-gray-600">Content</p>
</div>
```

### Responsive Design

```tsx
// Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card">Card 1</div>
  <div className="card">Card 2</div>
  <div className="card">Card 3</div>
</div>
```

## 🎯 Component Library Demo

To see all components in action, import and use the `ComponentLibrary` component:

```tsx
import ComponentLibrary from './components/ComponentLibrary';

// Add to your routes or render directly
<ComponentLibrary />
```

This will display all available components with examples and usage patterns.

## 🔧 Development

### Adding New Components

1. Add component classes to `src/index.css` in the `@layer components` section
2. Follow the naming convention: `.component-name`
3. Use Tailwind utilities with `@apply` directive
4. Include hover, focus, and disabled states
5. Test across different screen sizes

### Customizing Colors

To add new colors, extend the theme in `tailwind.config.js`:

```js
colors: {
  custom: {
    50: '#fef7ee',
    100: '#fdedd6',
    // ... more shades
  }
}
```

### Adding Animations

Define new animations in `tailwind.config.js`:

```js
keyframes: {
  customAnimation: {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.1)' },
    '100%': { transform: 'scale(1)' },
  }
},
animation: {
  'custom': 'customAnimation 2s infinite',
}
```

## 📱 Mobile-First Design

All components are designed with mobile-first approach:
- Base styles for mobile devices
- Responsive modifiers for larger screens
- Touch-friendly button sizes
- Readable typography at all sizes

## ♿ Accessibility

Components include:
- Proper focus states
- Sufficient color contrast
- Semantic HTML structure
- Screen reader support
- Keyboard navigation

## 🎨 Design Tokens

The design system uses consistent tokens for:
- Colors (50-950 scale)
- Spacing (0.25rem to 32rem)
- Typography (12px to 96px)
- Shadows (soft, medium, strong)
- Border radius (0.25rem to 1.5rem)

This ensures consistency across the entire application. 