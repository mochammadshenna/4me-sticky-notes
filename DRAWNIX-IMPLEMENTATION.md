# DRAWNIX EXACT IMPLEMENTATION GUIDE

## 🎯 ARCHITECTURE OVERVIEW (FROM ACTUAL SOURCE CODE)

Based on deep analysis of Drawnix source code in `drawnix-source/packages/drawnix/`, here is the EXACT implementation guide.

---

## 📦 CORE COMPONENTS

### 1. Island Component
**File:** `components/island.tsx`

**Purpose:** Floating toolbar container with shadow

**React Implementation:**
```tsx
type IslandProps = {
  children: React.ReactNode;
  padding?: number;
  className?: string;
  style?: object;
};

export const Island = ({ children, padding = 0, className, style }) => (
  <div
    className={`island ${className || ''}`}
    style={{ '--padding': padding, ...style }}
  >
    {children}
  </div>
);
```

**CSS:**
```scss
.island {
  --padding: 0;
  background-color: #ffffff;  // --island-bg-color
  box-shadow: 0 0 16px #00000014;  // --shadow-island
  border-radius: 0.375rem;  // --border-radius-md (6px)
  border: 1px solid #eeeeee;  // --island-border-color
  padding: calc(var(--padding) * 0.25rem);  // --space-factor
  position: absolute;  // For toolbar positioning
  transition: box-shadow 0.5s ease-in-out;
}
```

---

### 2. Stack Component
**File:** `components/stack.tsx`

**Purpose:** Horizontal/Vertical layout with gap

**React Implementation:**
```tsx
const Stack = {
  Row: ({ children, gap = 0, align, className, style }) => (
    <div
      className={`stack stack-horizontal ${className || ''}`}
      style={{
        '--gap': gap,
        alignItems: align,
        ...style
      }}
    >
      {children}
    </div>
  ),

  Col: ({ children, gap = 0, align, className, style }) => (
    <div
      className={`stack stack-vertical ${className || ''}`}
      style={{
        '--gap': gap,
        alignItems: align,
        ...style
      }}
    >
      {children}
    </div>
  )
};
```

**CSS:**
```scss
.stack {
  --gap: 0;
  display: flex;

  &.stack-horizontal {
    flex-direction: row;
    column-gap: calc(var(--gap) * 0.25rem);
  }

  &.stack-vertical {
    flex-direction: column;
    row-gap: calc(var(--gap) * 0.25rem);
  }
}
```

---

### 3. ToolButton Component
**File:** `components/tool-button.tsx`

**Purpose:** Icon button with hover/active states

**React Implementation:**
```tsx
type ToolButtonProps = {
  type: 'button' | 'icon' | 'radio';
  icon: React.ReactNode;
  title?: string;
  'aria-label': string;
  visible?: boolean;
  selected?: boolean;
  disabled?: boolean;
  checked?: boolean;  // for radio type
  onClick?: () => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  className?: string;
};

export const ToolButton = ({
  type,
  icon,
  title,
  'aria-label': ariaLabel,
  visible = true,
  selected = false,
  disabled = false,
  checked = false,
  onClick,
  onPointerDown,
  onPointerUp,
  className
}: ToolButtonProps) => {
  if (type === 'radio') {
    return (
      <label className={`tool-icon ${className || ''}`} title={title}>
        <input
          type="radio"
          className="tool-icon-radio"
          aria-label={ariaLabel}
          checked={checked}
          disabled={disabled}
        />
        <div className="tool-icon__icon">{icon}</div>
      </label>
    );
  }

  return (
    <button
      className={`tool-icon ${selected ? 'tool-icon--selected' : ''} ${className || ''}`}
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      disabled={disabled}
    >
      <div className="tool-icon__icon">{icon}</div>
    </button>
  );
};
```

**CSS:**
```scss
.tool-icon {
  width: 2rem;  // --default-button-size (32px)
  height: 2rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;  // 6px
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666;  // --color-on-surface
  transition: all 0.15s;
  padding: 0;

  &:hover {
    background: hsl(220, 100%, 97%);  // --color-surface-high
  }

  &:active,
  &.tool-icon--selected {
    background: rgba(102, 152, 255, 0.1);  // --color-surface-primary-container
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tool-icon__icon {
    width: 1rem;  // --default-icon-size (16px)
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      width: 100%;
      height: 100%;
      stroke: currentColor;
    }
  }
}
```

---

## 🎨 CSS THEME VARIABLES (FROM theme.scss)

```scss
:root {
  /* Primary Colors */
  --color-primary: #6698ff;
  --color-primary-darker: #4a7ee6;
  --color-primary-darkest: #3366cc;
  --color-primary-light: #e6f0ff;
  --color-primary-hover: #80acff;

  /* Gray Scale */
  --color-gray-10: #f5f5f5;
  --color-gray-20: #ebebeb;
  --color-gray-30: #d6d6d6;
  --color-gray-40: #b8b8b8;
  --color-gray-50: #999999;
  --color-gray-60: #7a7a7a;
  --color-gray-70: #5c5c5c;
  --color-gray-80: #3d3d3d;
  --color-gray-90: #1e1e1e;
  --color-gray-100: #121212;

  /* Surface Colors */
  --color-surface-high: hsl(220, 100%, 97%);
  --color-surface-mid: hsl(220 25% 96%);
  --color-surface-low: hsl(220 25% 94%);
  --color-surface-lowest: #ffffff;
  --color-on-surface: #666666;

  /* Island & Shadow */
  --island-bg-color: #ffffff;
  --island-border-color: #eeeeee;
  --shadow-island: 0 0 16px #00000014;

  /* Border Radius */
  --border-radius-sm: 0.25rem;  // 4px
  --border-radius-md: 0.375rem;  // 6px
  --border-radius-lg: 0.5rem;  // 8px

  /* Sizes */
  --default-button-size: 2rem;  // 32px
  --default-icon-size: 1rem;  // 16px
  --lg-button-size: 2.25rem;  // 36px
  --lg-icon-size: 1.125rem;  // 18px

  /* Spacing */
  --space-factor: 0.25rem;  // 4px (for gap=1 → 4px, gap=2 → 8px)

  /* Interactive States */
  --color-surface-primary-container: rgba(102, 152, 255, .1);
  --color-brand-hover: #6698ff;
  --color-brand-active: #6698ff;
  --button-hover-bg: var(--color-surface-high);

  /* Other */
  --link-color: #6698ff;
  --focus-highlight-color: #bee3f8;
  --dialog-border-color: #ebebeb;
}
```

---

## 🏗️ TOOLBAR POSITIONING (FROM index.scss)

### AppToolbar (Top Left)
```scss
.app-toolbar {
  position: absolute;
  top: 36px;
  left: 36px;

  @media (max-width: 768px) {
    bottom: 20px;
    top: auto;
    left: 50%;
    transform: translateX(-50%);
  }
}
```

### CreationToolbar (Top Center)
```scss
.creation-toolbar {
  position: absolute;
  top: 36px;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 768px) {
    top: 20px;
  }
}
```

### ZoomToolbar (Top Right)
```scss
.zoom-toolbar {
  position: absolute;
  top: 36px;
  right: 36px;

  .zoom-out-button {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .zoom-menu-trigger {
    width: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-on-surface);
    border-radius: var(--border-radius-sm);
    cursor: pointer;

    &:hover, &.active {
      background-color: var(--color-surface-primary-container);
    }
  }

  .zoom-in-button {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media (max-width: 768px) {
    display: none;
  }
}
```

### ThemeToolbar (Bottom Right)
```scss
.theme-toolbar {
  position: absolute;
  bottom: 36px;
  right: 36px;

  select {
    width: 100px;
    background-color: var(--color-surface-mid);
    color: var(--color-on-surface);
    border-radius: var(--border-radius-sm);
    padding: 4px 8px;
    cursor: pointer;
    border: none;
    outline: none;
    font-size: 14px;

    &:hover {
      background-color: var(--color-surface-primary-container);
    }
  }

  @media (max-width: 768px) {
    display: none;
  }
}
```

---

## 🎭 CANVAS STRUCTURE

```html
<div class="drawnix-mindmap">
  <!-- Infinite Canvas -->
  <div class="canvas-container">
    <svg class="canvas-svg"></svg>
    <div class="canvas-content">
      <!-- Shapes, nodes, drawings go here -->
    </div>
  </div>

  <!-- Floating Toolbars -->
  <div class="island app-toolbar">...</div>
  <div class="island creation-toolbar">...</div>
  <div class="island zoom-toolbar">...</div>
  <div class="island theme-toolbar">...</div>
</div>
```

**Canvas CSS:**
```scss
.drawnix-mindmap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #ffffff;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.canvas-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.canvas-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.canvas-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  transition: transform 0.1s ease-out;
}
```

---

## 🛠️ TOOLBAR TOOLS (FROM creation-toolbar.tsx)

### All 9 Creation Tools:
```typescript
const TOOLS = [
  { icon: HandIcon, pointer: 'hand', title: 'Hand' },
  { icon: SelectionIcon, pointer: 'selection', title: 'Selection' },
  { icon: MindIcon, pointer: 'mind', title: 'Mind Map' },
  { icon: TextIcon, pointer: 'text', title: 'Text' },
  { icon: FeltTipPenIcon, pointer: 'pen', title: 'Pen' },
  { icon: StraightArrowLineIcon, pointer: 'arrow', title: 'Arrow' },
  { icon: ShapeIcon, pointer: 'shape', title: 'Shape' },
  { icon: ImageIcon, pointer: 'image', title: 'Image' },
  { icon: ExtraToolsIcon, pointer: 'extra', title: 'More' }
];
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Phase 1: Base Components
- [ ] Create `Island` component with exact shadow/border
- [ ] Create `Stack` component with gap support
- [ ] Create `ToolButton` component with all states

### Phase 2: CSS Theme System
- [ ] Add all CSS variables from theme.scss
- [ ] Add hover/active state styles
- [ ] Add mobile responsiveness

### Phase 3: Build Toolbars
- [ ] AppToolbar (Menu, Undo, Redo)
- [ ] CreationToolbar (9 tools)
- [ ] ZoomToolbar (Zoom controls)
- [ ] ThemeToolbar (Theme selector)

### Phase 4: Canvas System
- [ ] Infinite canvas with pan/zoom
- [ ] Grid background
- [ ] Tool pointer state management

### Phase 5: Testing
- [ ] Visual comparison with Drawnix screenshot
- [ ] All tools clickable and functional
- [ ] Hover states working
- [ ] Mobile responsive

---

## 🚀 QUICK START CODE

**Minimal Working Example:**
```html
<div class="drawnix-mindmap">
  <!-- Canvas -->
  <div class="canvas-container" id="canvas"></div>

  <!-- App Toolbar -->
  <div class="island app-toolbar">
    <div class="stack stack-horizontal" style="--gap: 1">
      <button class="tool-icon" title="Menu">
        <div class="tool-icon__icon">☰</div>
      </button>
      <button class="tool-icon" title="Undo">
        <div class="tool-icon__icon">↶</div>
      </button>
      <button class="tool-icon" title="Redo">
        <div class="tool-icon__icon">↷</div>
      </button>
    </div>
  </div>

  <!-- Creation Toolbar -->
  <div class="island creation-toolbar">
    <div class="stack stack-horizontal" style="--gap: 1">
      <button class="tool-icon" title="Hand">✋</button>
      <button class="tool-icon tool-icon--selected" title="Select">🖱</button>
      <button class="tool-icon" title="Mind">🧠</button>
      <button class="tool-icon" title="Text">T</button>
      <button class="tool-icon" title="Pen">✏️</button>
      <button class="tool-icon" title="Arrow">→</button>
      <button class="tool-icon" title="Shape">▭</button>
      <button class="tool-icon" title="Image">🖼</button>
      <button class="tool-icon" title="More">⋮</button>
    </div>
  </div>

  <!-- Zoom Toolbar -->
  <div class="island zoom-toolbar">
    <div class="stack stack-horizontal" style="--gap: 0">
      <button class="tool-icon zoom-out-button">−</button>
      <div class="zoom-menu-trigger">100%</div>
      <button class="tool-icon zoom-in-button">+</button>
    </div>
  </div>
</div>
```

---

**This document is the EXACT implementation guide based on Drawnix source code analysis.**
