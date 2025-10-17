# DRAWNIX EXACT CLONE - Complete Architecture & Implementation Plan

## 🎯 CRITICAL DISCOVERY: Current Implementation is COMPLETELY WRONG!

### ❌ What We Did Wrong:
- Created a **LEFT SIDEBAR** with vertical tools → **WRONG!**
- Used CSS Grid layout with fixed columns → **WRONG!**
- Made tools as sidebar buttons → **WRONG!**
- Created top menu bar like VS Code → **WRONG!**

### ✅ Drawnix's TRUE Architecture:

Drawnix uses **FLOATING ISLAND TOOLBARS** over an **INFINITE CANVAS**. There is NO sidebar, NO grid layout, NO fixed structure!

---

## 📐 DRAWNIX TRUE STRUCTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    INFINITE CANVAS (100%)                    │
│                                                               │
│  ┌────────┐    ┌────────────────────┐    ┌──────────┐      │
│  │  App   │    │   Creation Tools   │    │   Zoom   │      │
│  │Toolbar │    │     (Center)       │    │ Toolbar  │      │
│  └────────┘    └────────────────────┘    └──────────┘      │
│   ↑ 36px                                        ↑ 36px      │
│   ← 36px                                       → 36px       │
│                                                               │
│                    [DRAWING CONTENT]                         │
│                                                               │
│                                          ┌──────────┐        │
│                                          │  Theme   │        │
│                                          │ Toolbar  │        │
│                                          └──────────┘        │
│                                                ↑ 36px        │
│                                               → 36px         │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ COMPONENT ARCHITECTURE

### 1. **Island Component** (Floating Toolbar Container)
```tsx
<Island padding={1} className="toolbar-name">
  <Stack.Row gap={1}>
    {/* Tool buttons */}
  </Stack.Row>
</Island>
```

**Styling:**
```scss
.island {
  position: absolute;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
}
```

---

### 2. **AppToolbar** (Top Left)
**Position:** `top: 36px; left: 36px;`

**Contains:**
- 🍔 Menu (File, Save, Export, etc.)
- ↩️ Undo
- ↪️ Redo
- 📋 Duplicate (when selection exists)
- 🗑️ Delete (when selection exists)

**Code Reference:** `/packages/drawnix/src/components/toolbar/app-toolbar/app-toolbar.tsx`

---

### 3. **CreationToolbar** (Top Center)
**Position:** `top: 36px; left: 50%; transform: translateX(-50%);`

**Contains (9 tools):**
1. ✋ Hand Tool (`PlaitPointerType.hand`)
2. 🖱️ Selection Tool (`PlaitPointerType.selection`)
3. 🧠 Mind Map Tool (`MindPointerType.mind`)
4. 📝 Text Tool (`BasicShapes.text`)
5. 🖊️ Pen Tool (`FreehandShape.feltTipPen`) - with dropdown
6. ➡️ Arrow Tool (`ArrowLineShape.straight`) - with dropdown
7. ▭ Shape Tool (`BasicShapes.rectangle`) - with dropdown
8. 🖼️ Image Tool
9. ⋮ Extra Tools

**Code Reference:** `/packages/drawnix/src/components/toolbar/creation-toolbar.tsx`

---

### 4. **ZoomToolbar** (Top Right)
**Position:** `top: 36px; right: 36px;`

**Contains:**
- ➖ Zoom Out
- `100%` Current Zoom (clickable for menu)
- ➕ Zoom In

**Code Reference:** `/packages/drawnix/src/components/toolbar/zoom-toolbar.tsx`

---

### 5. **ThemeToolbar** (Bottom Right)
**Position:** `bottom: 36px; right: 36px;`

**Contains:**
- Theme dropdown selector

---

## 🎨 STYLING APPROACH

### Colors (Material Design 3)
```scss
:root {
  --color-surface-low: #fff;
  --color-surface-mid: #f7f7f7;
  --color-surface-high: #f0f0f0;
  --color-surface-primary-container: #e8e8ff;
  --color-surface-secondary-container: #e5e5e5;
  --color-on-surface: #1c1b1f;
  --color-primary: #6750a4;
  --link-color: #0066cc;
  --border-radius-sm: 8px;
}

[data-theme="dark"] {
  --color-surface-low: #1c1b1f;
  --color-surface-mid: #2b2930;
  --color-surface-high: #36343b;
  --color-on-surface: #e6e1e5;
  --color-primary: #d0bcff;
}
```

### Tool Button States
```scss
.tool-button {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  transition: all 0.15s;

  &:hover {
    background: var(--color-surface-primary-container);
  }

  &.selected, &:active {
    background: var(--color-surface-secondary-container);
  }
}
```

---

## 🛠️ TOOL SYSTEM ARCHITECTURE

### How Tools Work:
Tools are NOT separate UI components - they're just **pointer states**!

```typescript
// Tool is just a string pointer type
type DrawnixPointerType =
  | 'hand'
  | 'selection'
  | 'mind'
  | 'text'
  | 'rectangle'
  | 'ellipse'
  | 'straight-arrow-line'
  | 'felt-tip-pen'
  // etc...

// Setting a tool = updating board pointer
BoardTransforms.updatePointerType(board, 'rectangle');
```

### Tool Behavior:
1. Click tool button → Updates `board.pointer`
2. Canvas detects pointer state
3. Canvas behavior changes based on pointer
4. No separate "drawing layer" or "tool UI" needed!

---

## 🎭 DROPDOWN/PICKER PATTERN

For tools with variants (Pen, Arrow, Shape):

```tsx
<Popover open={shapeOpen} onOpenChange={setShapeOpen}>
  <PopoverTrigger>
    <ToolButton
      icon={ShapeIcon}
      selected={shapeOpen || isShapePointer(board)}
    />
  </PopoverTrigger>
  <PopoverContent>
    <ShapePicker
      onPointerUp={(pointer) => {
        setShapeOpen(false);
        setPointer(pointer);
      }}
    />
  </PopoverContent>
</Popover>
```

---

## 📦 IMPLEMENTATION PLAN

### Phase 1: Clean Slate ✅
1. Remove ALL existing Mind Map toolbar code
2. Remove CSS Grid layout
3. Remove left sidebar
4. Create clean infinite canvas

### Phase 2: Island Component System
1. Create `<Island>` component
2. Create `<Stack>` component for horizontal/vertical layout
3. Create `<ToolButton>` component with all states

### Phase 3: AppToolbar
1. Build AppToolbar with Menu, Undo, Redo
2. Add Duplicate/Delete buttons (conditional on selection)
3. Position: `top: 36px; left: 36px;`

### Phase 4: CreationToolbar
1. Build all 9 tool buttons
2. Implement dropdown pickers (Pen, Arrow, Shape)
3. Position: Top center

### Phase 5: ZoomToolbar
1. Build Zoom controls
2. Add zoom percentage display
3. Position: Top right

### Phase 6: Canvas Integration
1. Implement pointer state management
2. Connect tools to canvas behavior
3. Add drawing capabilities

### Phase 7: Features
1. Export functionality
2. Theme switching
3. File save/load

---

## 🚀 MIGRATION STRATEGY

### Step 1: Create New Components
```
/components/
  /island/
    Island.js
  /toolbar/
    AppToolbar.js
    CreationToolbar.js
    ZoomToolbar.js
    ThemeToolbar.js
  /tool-button/
    ToolButton.js
```

### Step 2: New CSS Structure
```scss
.drawnix-mindmap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #FFFFFF;
  overflow: hidden;

  .app-toolbar {
    position: absolute;
    top: 36px;
    left: 36px;
  }

  .creation-toolbar {
    position: absolute;
    top: 36px;
    left: 50%;
    transform: translateX(-50%);
  }

  .zoom-toolbar {
    position: absolute;
    top: 36px;
    right: 36px;
  }

  .theme-toolbar {
    position: absolute;
    bottom: 36px;
    right: 36px;
  }
}
```

### Step 3: Tool State Management
```javascript
const state = {
  currentTool: 'hand',
  selectedElements: [],
  zoom: 1.0,
  theme: 'light',
};

function setTool(tool) {
  state.currentTool = tool;
  updateCanvasCursor(tool);
  updateToolbarUI(tool);
}
```

---

## ✨ KEY DIFFERENCES FROM OLD IMPLEMENTATION

| Aspect | OLD (WRONG) | NEW (CORRECT) |
|--------|-------------|---------------|
| Layout | CSS Grid with sidebar | Absolute positioned islands |
| Toolbar Position | Left edge, vertical | Floating on canvas |
| Tool UI | Sidebar buttons | Island toolbar buttons |
| Canvas | Limited area (grid cell) | Full viewport (infinite) |
| Menu Bar | Top fixed bar | Floating island (top-left) |
| Status Bar | Bottom fixed bar | NO status bar |
| Properties Panel | Right sidebar (300px) | Popup toolbar on selection |

---

## 🎯 SUCCESS CRITERIA

✅ **Visual Match:**
- Floating toolbars with shadows
- Clean infinite canvas
- No sidebars or fixed UI
- Proper spacing (36px from edges)

✅ **Functional Match:**
- All 9 creation tools working
- Zoom controls functional
- Undo/Redo working
- Selection showing duplicate/delete

✅ **Performance:**
- Smooth 60fps canvas
- Responsive tool switching
- No lag or jank

---

## 📚 CODE REFERENCES

**Drawnix Source:** `/tmp/drawnix/packages/drawnix/src/`
- Main component: `drawnix.tsx`
- Toolbars: `components/toolbar/`
- Styles: `styles/index.scss`

**Plait Board Docs:** https://github.com/worktile/plait
- Canvas framework
- Pointer system
- Drawing plugins

---

## 🔥 IMMEDIATE ACTION ITEMS

1. **DELETE:** All current Mind Map toolbar code
2. **CREATE:** Island, Stack, ToolButton components
3. **BUILD:** AppToolbar (top-left)
4. **BUILD:** CreationToolbar (top-center)
5. **BUILD:** ZoomToolbar (top-right)
6. **TEST:** With Playwright against real Drawnix

---

**This document is the SINGLE SOURCE OF TRUTH for the Drawnix clone implementation.**
