# 📚 Documentation

Welcome to the Sticky Notes & Mind Map Application documentation!

## Quick Navigation

### For Developers
- **[developer-conduct.md](./developer-conduct.md)** - Complete development guide with architecture, flow diagrams, and best practices

### For Project Understanding
- **[Project Summary](../.claude/project-summary.md)** - Comprehensive project overview, API reference, and configuration
- **[Presentation](../.claude/presentation.md)** - Executive presentation with demos and roadmap

### For Bug Fixes & Improvements
- **[Shadow Arrow Fix](../SHADOW-ARROW-FIX.md)** - RAF pattern optimization (94% performance improvement)
- **[Mode Isolation Fix](../MODE-ISOLATION-FIX.md)** - Container hierarchy correction
- **[Drag Drop Improvements](../DRAG-DROP-IMPROVEMENTS.md)** - translate3d implementation

## Documentation Structure

```
docs/
├── README.md                    # This file
└── developer-conduct.md         # Main developer guide
    ├── System Architecture
    ├── Flow Control Diagrams    # Mermaid.js
    ├── Data Lineage            # Mermaid.js
    ├── Component Structure      # Mermaid.js
    ├── Development Guidelines
    └── Best Practices

.claude/
├── project-summary.md          # Complete project reference
└── presentation.md             # Executive presentation

Root Level:
├── SHADOW-ARROW-FIX.md         # Performance optimization
├── MODE-ISOLATION-FIX.md       # Bug fix documentation
└── DRAG-DROP-IMPROVEMENTS.md   # UX improvement
```

## Key Topics

### Architecture
- **State Management**: Centralized state object pattern
- **Event Handling**: Global listeners with state tracking
- **Drag System**: GPU-accelerated translate3d
- **Storage**: LocalStorage persistence

### Performance
- **RAF Flag Pattern**: 94% reduction in overdraw
- **translate3d**: 60fps smooth dragging
- **Memory Management**: Constant usage with global handlers
- **SVG Optimization**: Clean connection rendering

### Testing
- **24 Tests**: 96% pass rate
- **3 Test Suites**: Drawnix style, mode isolation, feature verification
- **Playwright**: E2E testing framework

## Mermaid Diagrams Available

1. **System Architecture** - High-level overview
2. **Component Architecture** - Component relationships
3. **User Flow Sequences** - Step-by-step interactions
4. **Mode Switching Flow** - State transitions
5. **Data Lineage** - From creation to storage
6. **Class Diagrams** - Component structure

## Quick Links

| Topic | Document | Section |
|-------|----------|---------|
| Getting Started | developer-conduct.md | Development Guidelines |
| Architecture | developer-conduct.md | System Architecture |
| Flow Diagrams | developer-conduct.md | Flow Control Diagrams |
| Data Flow | developer-conduct.md | Data Lineage |
| API Reference | project-summary.md | API Reference |
| Performance | SHADOW-ARROW-FIX.md | Performance Impact |
| Bug Fixes | MODE-ISOLATION-FIX.md | Root Cause |
| Best Practices | developer-conduct.md | Best Practices |

## For New Developers

Start here:
1. Read [developer-conduct.md](./developer-conduct.md) - Architecture & guidelines
2. Review [project-summary.md](../.claude/project-summary.md) - Complete overview
3. Check [presentation.md](../.claude/presentation.md) - High-level understanding
4. Run tests: `npx playwright test`
5. Start coding!

## For Contributors

Before contributing:
1. Read [Development Guidelines](./developer-conduct.md#development-guidelines)
2. Follow [Best Practices](./developer-conduct.md#best-practices)
3. Check [Code Quality](../claude/project-summary.md#code-quality-metrics)
4. Run test suite
5. Create PR with clear description

## For Users

End-user documentation:
- Open `index.html` in browser
- **Sticky Notes Mode**: Click "Add Note" to start
- **Mind Map Mode**: Click "Mind Map" tab
- Auto-saves to browser LocalStorage
- Works offline

## Need Help?

- **Technical Questions**: Check developer-conduct.md
- **API Questions**: Check project-summary.md
- **Bug Reports**: Create issue with reproduction steps
- **Feature Requests**: Check roadmap in presentation.md

---

**Last Updated**: 2025-01-15
**Version**: 1.0.0
**Maintainers**: Development Team
