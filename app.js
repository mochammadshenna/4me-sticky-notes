// ==================== STATE MANAGEMENT ====================
const state = {
    currentMode: 'sticky', // 'sticky' or 'mindmap'
    notes: [],
    mindMapNodes: [],
    mindMapTree: null, // Root node of hierarchical tree
    selectedNode: null, // Currently selected mind map node
    selectedColor: '#FFF4A3',
    drawingMode: false,
    isDrawing: false,
    penColor: '#000000',
    penSize: 3,
    draggedItem: null,
    highestZIndex: 10,
    // Mind map pan and zoom
    mindMapZoom: 1,
    mindMapPanX: 0,
    mindMapPanY: 0,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    draggedNode: null,
    // Drawnix-style tools
    activeTool: 'select', // 'select', 'hand', 'node', 'circle', 'connector', 'text'
    // RAF flag for drag updates
    rafScheduled: false,
    // Connector tool state
    connectorStart: null,
    tempConnectorLine: null,
    drawnConnectors: []
};

// ==================== DOM ELEMENTS ====================
const board = document.getElementById('board');
const stickyBoard = document.getElementById('stickyBoard');
const mindmapBoard = document.getElementById('mindmapBoard');
const mindmapContainer = document.getElementById('mindmapContainer');
const mindmapCanvasWrapper = document.querySelector('.mindmap-canvas-wrapper');
const canvas = document.getElementById('drawingCanvas');
const ctx = canvas.getContext('2d');
const connectionSvg = document.getElementById('connectionSvg');
const addNoteBtn = document.getElementById('addNoteBtn');
const stickyModeBtn = document.getElementById('stickyModeBtn');
const mindmapModeBtn = document.getElementById('mindmapModeBtn');
const stickyTools = document.getElementById('stickyTools');
const mindmapTools = document.getElementById('mindmapTools');
const addChildNodeBtn = document.getElementById('addChildNodeBtn');
const addSiblingNodeBtn = document.getElementById('addSiblingNodeBtn');
const resetMindMapBtn = document.getElementById('resetMindMapBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomLevelDisplay = document.getElementById('zoomLevel');
const fitToScreenBtn = document.getElementById('fitToScreenBtn');
const exportMindMapBtn = document.getElementById('exportMindMapBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeLightIcon = document.getElementById('themeLightIcon');
const themeDarkIcon = document.getElementById('themeDarkIcon');
const toggleDrawBtn = document.getElementById('toggleDrawBtn');
const clearDrawBtn = document.getElementById('clearDrawBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const colorBtns = document.querySelectorAll('.color-btn');
const penColorInput = document.getElementById('penColor');
const penSizeInput = document.getElementById('penSize');
const noteTemplate = document.getElementById('noteTemplate');
const mindMapTemplate = document.getElementById('mindMapTemplate');
const modalOverlay = document.getElementById('modalOverlay');

// ==================== INITIALIZATION ====================
function init() {
    setupCanvas();
    setupConnectionSvg();
    loadTheme();
    loadFromStorage();
    setupEventListeners();

    // Create initial notes if none exist
    if (state.notes.length === 0) {
        createInitialContent();
    }

    // Initialize mind map with root node if none exists
    if (!state.mindMapTree) {
        initializeMindMap();
    }

    // Initialize Drawnix-style Mind Map tools
    if (typeof initMindMapTools === 'function') {
        initMindMapTools();
    }

    // Set initial mode
    switchMode('sticky');
}

// ==================== THEME SYSTEM ====================
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icon visibility
    if (theme === 'dark') {
        themeLightIcon.style.display = 'none';
        themeDarkIcon.style.display = 'block';
    } else {
        themeLightIcon.style.display = 'block';
        themeDarkIcon.style.display = 'none';
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 70;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function setupConnectionSvg() {
    connectionSvg.setAttribute('width', window.innerWidth);
    connectionSvg.setAttribute('height', window.innerHeight - 70);

    // Add arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#7C3AED');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    connectionSvg.appendChild(defs);
}

function createInitialContent() {
    // Create sample sticky notes
    createNote(100, 100, 'Welcome! 🎉\n\nThis is an enhanced sticky notes app with mind mapping features.', '#FFF4A3');
    createNote(420, 100, 'Try formatting:\n• Bold\n• Italic\n• Underline\n• Strikethrough', '#FFB3D9');
}

// ==================== MODE SWITCHING ====================
function switchMode(mode) {
    state.currentMode = mode;

    const toolbar = document.querySelector('.toolbar');
    const board = document.getElementById('board');

    if (mode === 'sticky') {
        // Show sticky mode UI
        if (toolbar) toolbar.style.display = 'flex';
        if (board) board.style.display = 'block';
        stickyBoard.classList.remove('hidden');
        mindmapBoard.classList.add('hidden');
        if (stickyTools) stickyTools.classList.remove('hidden');
        if (mindmapTools) mindmapTools.classList.add('hidden');
        if (stickyModeBtn) stickyModeBtn.classList.add('active');
        if (mindmapModeBtn) mindmapModeBtn.classList.remove('active');
    } else if (mode === 'mindmap') {
        // COMPLETELY HIDE sticky mode UI - fullscreen takeover
        if (toolbar) toolbar.style.display = 'none';
        // DON'T hide board - Mind Map is inside it but uses position:fixed to overlay
        if (board) board.style.display = 'block';
        stickyBoard.classList.add('hidden');
        mindmapBoard.classList.remove('hidden');
        if (stickyTools) stickyTools.classList.add('hidden');
        if (mindmapTools) mindmapTools.classList.add('hidden');

        // Drawnix Mind Map starts with blank canvas - no need to render tree
        // Old renderMindMap() was for tree-based Mind Map (deprecated)
        // New Drawnix style: users create shapes using tools on blank canvas
        console.log('✅ Switched to Drawnix Mind Map mode - use tools to create shapes');
    }

    // Disable drawing mode when switching
    if (state.drawingMode) {
        toggleDrawingMode();
    }
}

// ==================== MODAL SYSTEM ====================
function showModal(title, message, onConfirm, confirmText = 'Confirm', showCancel = true) {
    const modalTitle = modalOverlay.querySelector('.modal-title');
    const modalBody = modalOverlay.querySelector('.modal-body');
    const confirmBtn = modalOverlay.querySelector('.modal-confirm');
    const cancelBtn = modalOverlay.querySelector('.modal-cancel');

    modalTitle.textContent = title;
    modalBody.innerHTML = message;
    confirmBtn.textContent = confirmText;

    if (!showCancel) {
        cancelBtn.style.display = 'none';
    } else {
        cancelBtn.style.display = 'flex';
    }

    modalOverlay.classList.add('active');

    // Remove old listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
        hideModal();
    });
}

function hideModal() {
    modalOverlay.classList.remove('active');
}

// ==================== STICKY NOTES ====================
function createNote(x, y, text = '', color = null) {
    const noteColor = color || state.selectedColor;
    const noteId = 'note-' + Date.now() + Math.random();

    const noteElement = noteTemplate.content.cloneNode(true).querySelector('.sticky-note');
    noteElement.dataset.id = noteId;
    noteElement.dataset.type = 'note';
    noteElement.style.left = x + 'px';
    noteElement.style.top = y + 'px';
    noteElement.style.background = noteColor;
    noteElement.style.zIndex = ++state.highestZIndex;

    const content = noteElement.querySelector('.note-content');
    content.innerHTML = text.replace(/\n/g, '<br>');

    const timestamp = noteElement.querySelector('.note-timestamp');
    timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setupNoteEventListeners(noteElement);
    stickyBoard.appendChild(noteElement);  // Add to stickyBoard, not board

    state.notes.push({
        id: noteId,
        x, y,
        text,
        color: noteColor,
        pinned: false,
        timestamp: Date.now(),
        zIndex: state.highestZIndex
    });

    saveToStorage();
    return { id: noteId, element: noteElement };
}

function setupNoteEventListeners(noteElement) {
    const content = noteElement.querySelector('.note-content');
    const deleteBtn = noteElement.querySelector('.note-delete');
    const pinBtn = noteElement.querySelector('.note-pin');
    const formatBtns = noteElement.querySelectorAll('.note-format-btn');
    const fontSizeSelect = noteElement.querySelector('.note-font-size');

    // Drag - Mouse and Touch support
    const handleDragStart = (e) => {
        if (state.drawingMode) return;

        // Priority 1: Drag handle (always allows drag)
        const isDragHandle = e.target.closest('.note-drag-handle');

        // Priority 2: Avoid interactive elements
        const isInteractiveElement = e.target.closest('.note-content') ||
                                     e.target.closest('.note-btn') ||
                                     e.target.closest('.note-format-btn') ||
                                     e.target.closest('.note-font-size') ||
                                     e.target.closest('.note-header');

        if (isDragHandle || !isInteractiveElement) {
            // Convert touch to mouse-like event
            const event = e.type === 'touchstart' ? {
                clientX: e.touches[0].clientX,
                clientY: e.touches[0].clientY,
                preventDefault: () => e.preventDefault()
            } : e;

            startDrag(event, noteElement, 'note');
        }
    };

    noteElement.addEventListener('mousedown', handleDragStart);
    noteElement.addEventListener('touchstart', handleDragStart, { passive: false });

    // Edit
    content.addEventListener('input', () => {
        updateNoteText(noteElement.dataset.id, content.innerHTML);
    });

    // Delete
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showModal(
            'Delete Note',
            'Are you sure you want to delete this note?',
            () => deleteNote(noteElement.dataset.id),
            'Delete'
        );
    });

    // Pin
    pinBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePin(noteElement.dataset.id);
    });

    // Format buttons
    formatBtns.forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const format = btn.dataset.format;

            // Focus content first
            content.focus();

            // Special handling for code blocks
            if (format === 'code') {
                applyCodeBlock();
            } else {
                applyFormat(format);
            }

            // Toggle active state for basic formats
            if (['bold', 'italic', 'underline', 'strikeThrough'].includes(format)) {
                btn.classList.toggle('active');
            }
        });
    });

    // Font size selector
    if (fontSizeSelect) {
        fontSizeSelect.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });

        fontSizeSelect.addEventListener('change', (e) => {
            e.stopPropagation();
            const fontSize = e.target.value;
            content.style.fontSize = fontSize;
            const noteData = state.notes.find(n => n.id == noteElement.dataset.id);
            if (noteData) {
                noteData.fontSize = fontSize;
                saveToStorage();
            }
        });
    }

    // Keyboard shortcuts for formatting
    content.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    applyFormat('bold');
                    break;
                case 'i':
                    e.preventDefault();
                    applyFormat('italic');
                    break;
                case 'u':
                    e.preventDefault();
                    applyFormat('underline');
                    break;
            }
        }
    });

    // Bring to front
    noteElement.addEventListener('mousedown', () => {
        if (!state.drawingMode) {
            bringToFront(noteElement);
        }
    });
}

function applyFormat(format) {
    try {
        document.execCommand(format, false, null);
    } catch (err) {
        console.error('Format error:', err);
    }
}

function applyCodeBlock() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
            const code = document.createElement('code');
            code.textContent = selectedText;
            range.deleteContents();
            range.insertNode(code);
        } else {
            document.execCommand('insertHTML', false, '<code>code</code>');
        }
    }
}

function updateNoteText(noteId, html) {
    const noteData = state.notes.find(n => n.id == noteId);
    if (noteData) {
        noteData.text = html;
        saveToStorage();
    }
}

function deleteNote(noteId) {
    const noteElement = document.querySelector(`[data-id="${noteId}"]`);
    if (noteElement) {
        noteElement.style.animation = 'fadeOut 0.2s ease-out forwards';
        setTimeout(() => {
            noteElement.remove();
            state.notes = state.notes.filter(n => n.id != noteId);
            saveToStorage();
        }, 200);
    }
}

function togglePin(noteId) {
    const noteData = state.notes.find(n => n.id == noteId);
    const noteElement = document.querySelector(`[data-id="${noteId}"]`);

    if (noteData && noteElement) {
        noteData.pinned = !noteData.pinned;
        noteElement.classList.toggle('pinned');
        saveToStorage();
    }
}

// ==================== DRAWNIX-STYLE TOOLS ====================

// Set active tool
function setActiveTool(tool) {
    state.activeTool = tool;

    // Update UI - remove active class from all buttons (both old and new Drawnix-style)
    const toolButtons = document.querySelectorAll('.tool-btn, .tool-btn-mindmap');
    toolButtons.forEach(btn => btn.classList.remove('active'));

    // Add active class to selected tool (both old and new selectors)
    const activeBtn = document.querySelector(`[data-tool="${tool}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Update cursor style based on tool
    if (mindmapCanvasWrapper) {
        switch(tool) {
            case 'select':
                mindmapCanvasWrapper.style.cursor = 'default';
                break;
            case 'hand':
                mindmapCanvasWrapper.style.cursor = 'grab';
                break;
            case 'node':
            case 'circle':
            case 'triangle':
            case 'diamond':
            case 'star':
            case 'hexagon':
                mindmapCanvasWrapper.style.cursor = 'crosshair';
                break;
            case 'draw':
            case 'connector':
            case 'line':
                mindmapCanvasWrapper.style.cursor = 'crosshair';
                break;
            case 'text':
                mindmapCanvasWrapper.style.cursor = 'text';
                break;
            case 'eraser':
                mindmapCanvasWrapper.style.cursor = 'not-allowed';
                break;
            case 'image':
                mindmapCanvasWrapper.style.cursor = 'copy';
                break;
        }
    }
}

// Handle canvas click based on active tool
function handleCanvasToolClick(e) {
    const rect = mindmapContainer.getBoundingClientRect();
    const x = (e.clientX - rect.left - state.mindMapPanX) / state.mindMapZoom;
    const y = (e.clientY - rect.top - state.mindMapPanY) / state.mindMapZoom;

    // Handle connector tool - can click on nodes or canvas
    if (state.activeTool === 'connector') {
        handleConnectorClick(e, x, y);
        return;
    }

    // Only handle if clicking on canvas, not on nodes
    const isClickOnCanvas = e.target.classList.contains('mindmap-canvas-wrapper') ||
                            e.target === mindmapContainer ||
                            e.target === connectionSvg;

    if (!isClickOnCanvas) return;

    switch(state.activeTool) {
        case 'node':
            createShapeNode('rect', x, y);
            break;
        case 'circle':
            createShapeNode('circle', x, y);
            break;
        case 'triangle':
            createShapeNode('triangle', x, y);
            break;
        case 'diamond':
            createShapeNode('diamond', x, y);
            break;
        case 'star':
            createShapeNode('star', x, y);
            break;
        case 'hexagon':
            createShapeNode('hexagon', x, y);
            break;
        case 'text':
            createTextNode(x, y);
            break;
        case 'select':
        case 'hand':
            // These tools don't create on click
            break;
    }
}

// Handle connector tool clicks
function handleConnectorClick(e, x, y) {
    // Check if clicking on a node
    const clickedNode = e.target.closest('.mindmap-node, .shape-node, .text-node');

    if (!state.connectorStart) {
        // First click - set start point
        if (clickedNode) {
            state.connectorStart = clickedNode;
            clickedNode.classList.add('connector-source');
        } else {
            // Start from canvas point
            state.connectorStart = { x, y, isPoint: true };
            createConnectorStartPoint(x, y);
        }
    } else {
        // Second click - create connector
        if (clickedNode) {
            drawPermanentConnector(state.connectorStart, clickedNode);
        } else {
            drawPermanentConnector(state.connectorStart, { x, y, isPoint: true });
        }
        resetConnectorTool();
    }
}

// Create a shape node (rectangle, circle, triangle, diamond, star, hexagon)
function createShapeNode(shape, x, y) {
    const nodeId = 'shape-' + Date.now();
    const nodeElement = document.createElement('div');
    nodeElement.className = 'mindmap-node shape-node';
    nodeElement.dataset.id = nodeId;
    nodeElement.dataset.shape = shape;

    nodeElement.style.left = x + 'px';
    nodeElement.style.top = y + 'px';
    nodeElement.style.position = 'absolute';
    nodeElement.style.width = '120px';
    nodeElement.style.height = '80px';
    nodeElement.style.border = '2px solid #7C3AED';
    nodeElement.style.background = 'white';
    nodeElement.style.display = 'flex';
    nodeElement.style.alignItems = 'center';
    nodeElement.style.justifyContent = 'center';
    nodeElement.style.cursor = 'move';
    nodeElement.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

    // Apply shape-specific styles
    switch(shape) {
        case 'circle':
            nodeElement.style.borderRadius = '50%';
            nodeElement.style.width = '100px';
            nodeElement.style.height = '100px';
            break;
        case 'triangle':
            nodeElement.style.width = '0';
            nodeElement.style.height = '0';
            nodeElement.style.borderLeft = '60px solid transparent';
            nodeElement.style.borderRight = '60px solid transparent';
            nodeElement.style.borderBottom = '100px solid #7C3AED';
            nodeElement.style.background = 'transparent';
            nodeElement.style.border = 'none';
            break;
        case 'diamond':
            nodeElement.style.width = '100px';
            nodeElement.style.height = '100px';
            nodeElement.style.transform = 'rotate(45deg)';
            break;
        case 'star':
            nodeElement.style.clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
            nodeElement.style.width = '100px';
            nodeElement.style.height = '100px';
            nodeElement.style.background = '#7C3AED';
            nodeElement.style.border = 'none';
            break;
        case 'hexagon':
            nodeElement.style.clipPath = 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
            nodeElement.style.width = '120px';
            nodeElement.style.height = '100px';
            break;
        default: // rectangle
            nodeElement.style.borderRadius = '8px';
            break;
    }

    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shape-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete shape';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        nodeElement.remove();
    };
    nodeElement.appendChild(deleteBtn);

    const content = document.createElement('div');
    content.className = 'shape-content';
    content.contentEditable = true;
    content.textContent = shape === 'circle' ? 'Circle' : 'Rectangle';
    content.style.padding = '8px';
    content.style.outline = 'none';
    content.style.textAlign = 'center';

    nodeElement.appendChild(content);
    mindmapContainer.appendChild(nodeElement);

    // Make it draggable
    makeShapeDraggable(nodeElement);

    // Focus on content for immediate editing
    content.focus();
    document.execCommand('selectAll', false, null);
}

// Create a text node
function createTextNode(x, y) {
    const nodeId = 'text-' + Date.now();
    const nodeElement = document.createElement('div');
    nodeElement.className = 'mindmap-node text-node';
    nodeElement.dataset.id = nodeId;

    nodeElement.style.left = x + 'px';
    nodeElement.style.top = y + 'px';
    nodeElement.style.position = 'absolute';
    nodeElement.style.minWidth = '100px';
    nodeElement.style.padding = '8px 12px';
    nodeElement.style.background = 'transparent';
    nodeElement.style.cursor = 'move';

    // Add delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'shape-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete text';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        nodeElement.remove();
    };
    nodeElement.appendChild(deleteBtn);

    const content = document.createElement('div');
    content.className = 'text-content';
    content.contentEditable = true;
    content.textContent = 'Text';
    content.style.outline = 'none';
    content.style.fontSize = '14px';
    content.style.color = '#1F2937';

    nodeElement.appendChild(content);
    mindmapContainer.appendChild(nodeElement);

    // Make it draggable
    makeShapeDraggable(nodeElement);

    // Focus on content for immediate editing
    content.focus();
    document.execCommand('selectAll', false, null);
}

// Create connector start point marker
function createConnectorStartPoint(x, y) {
    const marker = document.createElement('div');
    marker.className = 'connector-start-marker';
    marker.style.left = x + 'px';
    marker.style.top = y + 'px';
    marker.dataset.tempMarker = 'true';
    mindmapContainer.appendChild(marker);
}

// Draw permanent connector
function drawPermanentConnector(from, to) {
    const connectorId = 'connector-' + Date.now();
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'drawn-connector');
    path.setAttribute('data-connector-id', connectorId);
    path.setAttribute('stroke', '#7C3AED');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    // Calculate positions
    const fromPos = getConnectorPosition(from);
    const toPos = getConnectorPosition(to);

    // Create path with curve
    const d = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
    path.setAttribute('d', d);

    connectionSvg.appendChild(path);

    // Store connector info
    state.drawnConnectors.push({
        id: connectorId,
        from,
        to,
        path
    });

    // Add delete functionality
    path.style.cursor = 'pointer';
    path.addEventListener('click', (e) => {
        if (state.activeTool === 'select') {
            e.stopPropagation();
            showModal(
                'Delete Connector',
                'Delete this arrow?',
                () => {
                    path.remove();
                    state.drawnConnectors = state.drawnConnectors.filter(c => c.id !== connectorId);
                },
                'Delete'
            );
        }
    });
}

// Get position from node or point
function getConnectorPosition(item) {
    if (item.isPoint) {
        return { x: item.x, y: item.y };
    }

    const rect = item.getBoundingClientRect();
    const containerRect = mindmapContainer.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
    };
}

// Reset connector tool
function resetConnectorTool() {
    if (state.connectorStart && !state.connectorStart.isPoint) {
        state.connectorStart.classList.remove('connector-source');
    }

    // Remove temp markers
    document.querySelectorAll('[data-temp-marker]').forEach(m => m.remove());

    state.connectorStart = null;
    if (state.tempConnectorLine) {
        state.tempConnectorLine.remove();
        state.tempConnectorLine = null;
    }
}

// Make shape nodes draggable
function makeShapeDraggable(element) {
    let isDragging = false;
    let startX, startY;

    element.addEventListener('mousedown', (e) => {
        if (e.target.contentEditable === 'true') return; // Don't drag when editing text
        if (e.target.classList.contains('shape-delete-btn')) return; // Don't drag when clicking delete

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        element.style.zIndex = ++state.highestZIndex;
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging && element.parentElement) {
            const dx = (e.clientX - startX) / state.mindMapZoom;
            const dy = (e.clientY - startY) / state.mindMapZoom;

            const currentLeft = parseInt(element.style.left) || 0;
            const currentTop = parseInt(element.style.top) || 0;

            element.style.left = (currentLeft + dx) + 'px';
            element.style.top = (currentTop + dy) + 'px';

            startX = e.clientX;
            startY = e.clientY;

            // Update connectors attached to this element
            updateConnectorsForElement(element);
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Update connectors when element moves
function updateConnectorsForElement(element) {
    state.drawnConnectors.forEach(connector => {
        if (connector.from === element || connector.to === element) {
            const fromPos = getConnectorPosition(connector.from);
            const toPos = getConnectorPosition(connector.to);
            const d = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
            connector.path.setAttribute('d', d);
        }
    });
}

// ==================== HIERARCHICAL MIND MAP ====================

// Mind Map Tree Node Structure
class MindMapNode {
    constructor(id, text, parent = null) {
        this.id = id;
        this.text = text;
        this.parent = parent;
        this.children = [];
        this.element = null;
        this.level = parent ? parent.level + 1 : 0;
    }

    addChild(text) {
        const childId = 'node-' + Date.now() + '-' + Math.random();
        const child = new MindMapNode(childId, text, this);
        this.children.push(child);
        return child;
    }

    removeChild(childNode) {
        this.children = this.children.filter(c => c.id !== childNode.id);
    }

    getSiblings() {
        if (!this.parent) return [];
        return this.parent.children.filter(c => c.id !== this.id);
    }
}

// Initialize mind map with root node
function initializeMindMap() {
    const rootId = 'node-root-' + Date.now();
    state.mindMapTree = new MindMapNode(rootId, 'Central Idea', null);

    // Add some initial child nodes
    state.mindMapTree.addChild('Topic 1');
    state.mindMapTree.addChild('Topic 2');
    state.mindMapTree.addChild('Topic 3');

    saveToStorage();
}

// Render the entire mind map from tree structure
function renderMindMap() {
    // DEPRECATED: Old tree-based Mind Map renderer
    // New Drawnix implementation uses freeform canvas with tools
    // This function would clear the canvas and break Drawnix shapes
    console.log('⚠️ renderMindMap() called but disabled - using Drawnix freeform canvas instead');
    return;

    // OLD CODE DISABLED BELOW (kept for reference)
    /*
    // Clean up old event listeners before clearing nodes
    cleanupNodeListeners(state.mindMapTree);

    // Clear existing nodes
    mindmapContainer.innerHTML = '';
    connectionSvg.innerHTML = '<defs><marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><polygon points="0 0, 10 3, 0 6" fill="#7C3AED"/></marker></defs>';

    if (!state.mindMapTree) {
        initializeMindMap();
    }

    // Calculate layout and render nodes
    const layout = calculateTreeLayout(state.mindMapTree);
    renderNodeRecursive(state.mindMapTree, layout);

    // Draw connections
    clearConnections();
    drawMindMapConnections(state.mindMapTree);
    */
}

// Calculate positions for all nodes in the tree
function calculateTreeLayout(root) {
    const layout = new Map();
    const containerWidth = mindmapContainer.offsetWidth || window.innerWidth;
    const containerHeight = mindmapContainer.offsetHeight || window.innerHeight - 70;

    // Root at center
    const rootX = containerWidth / 2 - 100;
    const rootY = 100;
    layout.set(root.id, { x: rootX, y: rootY });

    // Position children
    if (root.children.length > 0) {
        const childrenY = rootY + 150;
        const totalWidth = root.children.length * 250;
        const startX = rootX + 100 - totalWidth / 2;

        root.children.forEach((child, index) => {
            const childX = startX + index * 250;
            layout.set(child.id, { x: childX, y: childrenY });

            // Position grandchildren
            if (child.children.length > 0) {
                const grandchildrenY = childrenY + 120;
                const gTotalWidth = child.children.length * 200;
                const gStartX = childX + 75 - gTotalWidth / 2;

                child.children.forEach((grandchild, gIndex) => {
                    const gX = gStartX + gIndex * 200;
                    layout.set(grandchild.id, { x: gX, y: grandchildrenY });
                });
            }
        });
    }

    return layout;
}

// Render node and its children recursively
function renderNodeRecursive(node, layout) {
    const pos = layout.get(node.id);
    if (!pos) return;

    // Create node element
    const nodeElement = createMindMapNodeElement(node, pos.x, pos.y);
    node.element = nodeElement;

    // Render children
    node.children.forEach(child => {
        renderNodeRecursive(child, layout);
    });
}

// Create DOM element for a mind map node
function createMindMapNodeElement(node, x, y) {
    const nodeElement = mindMapTemplate.content.cloneNode(true).querySelector('.mindmap-node');
    nodeElement.dataset.id = node.id;
    nodeElement.style.left = x + 'px';
    nodeElement.style.top = y + 'px';

    // Add level class for styling
    if (node.level === 0) {
        nodeElement.classList.add('root');
    } else if (node.level === 1) {
        nodeElement.classList.add('level-1');
    } else if (node.level === 2) {
        nodeElement.classList.add('level-2');
    }

    const content = nodeElement.querySelector('.mindmap-content');
    content.textContent = node.text;

    // Setup event listeners
    setupMindMapNodeListeners(nodeElement, node);

    mindmapContainer.appendChild(nodeElement);
    return nodeElement;
}

// Setup event listeners for mind map node
function setupMindMapNodeListeners(nodeElement, node) {
    const content = nodeElement.querySelector('.mindmap-content');
    const addChildBtn = nodeElement.querySelector('.node-add-child');
    const deleteBtn = nodeElement.querySelector('.node-delete');

    // Drag node - only mousedown is per-node
    const handleMouseDown = (e) => {
        if (!e.target.closest('.node-action-btn') && !e.target.closest('.mindmap-content')) {
            state.draggedNode = {
                node: node,
                element: nodeElement,
                startX: e.clientX,
                startY: e.clientY
            };

            nodeElement.classList.add('dragging');

            // Reduce connection opacity during drag
            if (connectionSvg) {
                connectionSvg.style.opacity = '0.2';
            }

            e.stopPropagation(); // Prevent pan
            selectMindMapNode(node);
        }
    };

    nodeElement.addEventListener('mousedown', handleMouseDown);

    // Store listener for cleanup
    node._listeners = { handleMouseDown };

    // Select node on click
    nodeElement.addEventListener('click', (e) => {
        if (!e.target.closest('.node-action-btn') && !e.target.closest('.mindmap-content') && !state.draggedNode) {
            selectMindMapNode(node);
        }
    });

    // Edit content
    content.addEventListener('input', () => {
        node.text = content.textContent;
        saveToStorage();
    });

    content.addEventListener('blur', () => {
        if (content.textContent.trim() === '') {
            content.textContent = 'Node';
            node.text = 'Node';
        }
        saveToStorage();
    });

    // Add child node
    addChildBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        addChildNode(node);
    });

    // Delete node
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (node.level === 0) {
            showModal(
                'Cannot Delete Root',
                'The root node cannot be deleted. You can reset the entire mind map instead.',
                null,
                'OK',
                false
            );
        } else {
            showModal(
                'Delete Node',
                `Are you sure you want to delete "${node.text}" and all its children?`,
                () => deleteMindMapNode(node),
                'Delete'
            );
        }
    });
}

// Select a mind map node
function selectMindMapNode(node) {
    // Deselect previous
    if (state.selectedNode && state.selectedNode.element) {
        state.selectedNode.element.classList.remove('selected');
    }

    // Select new
    state.selectedNode = node;
    if (node.element) {
        node.element.classList.add('selected');
    }
}

// Add child node to selected or specified node
function addChildNode(parentNode) {
    const newChild = parentNode.addChild('New Node');
    saveToStorage();
    renderMindMap();

    // Focus on new node
    setTimeout(() => {
        if (newChild.element) {
            const content = newChild.element.querySelector('.mindmap-content');
            content.focus();
            document.execCommand('selectAll', false, null);
        }
    }, 100);
}

// Add sibling node to selected node
function addSiblingNode(node) {
    if (!node.parent) {
        showModal(
            'Cannot Add Sibling',
            'The root node cannot have siblings. You can add children instead.',
            null,
            'OK',
            false
        );
        return;
    }

    const newSibling = node.parent.addChild('New Node');
    saveToStorage();
    renderMindMap();

    // Focus on new node
    setTimeout(() => {
        if (newSibling.element) {
            const content = newSibling.element.querySelector('.mindmap-content');
            content.focus();
            document.execCommand('selectAll', false, null);
        }
    }, 100);
}

// Delete a mind map node
function deleteMindMapNode(node) {
    if (node.parent) {
        node.parent.removeChild(node);

        // Clear selection if deleted node was selected
        if (state.selectedNode === node) {
            state.selectedNode = null;
        }

        saveToStorage();
        renderMindMap();
    }
}

// Clean up event listeners from nodes (recursive)
function cleanupNodeListeners(node) {
    if (!node) return;

    // Remove listeners if they exist
    if (node._listeners) {
        const { handleMouseDown } = node._listeners;
        if (node.element) {
            node.element.removeEventListener('mousedown', handleMouseDown);
        }
        node._listeners = null;
    }

    // Recursively clean up children
    if (node.children) {
        node.children.forEach(child => cleanupNodeListeners(child));
    }
}

// Global mouse handlers for node dragging (single instance, not per-node)
function handleGlobalNodeDragMove(e) {
    if (!state.draggedNode) return;

    const { element, startX, startY } = state.draggedNode;

    const dx = (e.clientX - startX) / state.mindMapZoom;
    const dy = (e.clientY - startY) / state.mindMapZoom;

    const currentLeft = parseInt(element.style.left) || 0;
    const currentTop = parseInt(element.style.top) || 0;

    element.style.left = (currentLeft + dx) + 'px';
    element.style.top = (currentTop + dy) + 'px';

    // Update start position for next move
    state.draggedNode.startX = e.clientX;
    state.draggedNode.startY = e.clientY;

    // Schedule connection redraw using RAF flag pattern
    if (!state.rafScheduled) {
        state.rafScheduled = true;
        requestAnimationFrame(() => {
            clearConnections();
            drawMindMapConnections(state.mindMapTree);
            state.rafScheduled = false;
        });
    }
}

function handleGlobalNodeDragEnd() {
    if (!state.draggedNode) return;

    const { element } = state.draggedNode;
    element.classList.remove('dragging');

    // Final clean redraw
    clearConnections();
    drawMindMapConnections(state.mindMapTree);

    // Restore connection opacity
    if (connectionSvg) {
        connectionSvg.style.opacity = '1';
    }

    state.draggedNode = null;
    state.rafScheduled = false;
}

// Clear all connection paths
function clearConnections() {
    if (connectionSvg) {
        // Remove all path elements except the arrowhead marker definition
        const paths = connectionSvg.querySelectorAll('path.mindmap-connection');
        paths.forEach(path => path.remove());
    }
}

// Draw connections between nodes
function drawMindMapConnections(node) {
    node.children.forEach(child => {
        if (node.element && child.element) {
            drawConnection(node.element, child.element);
        }
        // Recursively draw connections for children
        drawMindMapConnections(child);
    });
}

// Draw a single connection between two elements
function drawConnection(fromElement, toElement) {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    const containerRect = mindmapContainer.getBoundingClientRect();

    const x1 = fromRect.left + fromRect.width / 2 - containerRect.left;
    const y1 = fromRect.bottom - containerRect.top;
    const x2 = toRect.left + toRect.width / 2 - containerRect.left;
    const y2 = toRect.top - containerRect.top;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Curved path
    const controlY = (y1 + y2) / 2;
    const d = `M ${x1} ${y1} C ${x1} ${controlY}, ${x2} ${controlY}, ${x2} ${y2}`;

    path.setAttribute('d', d);
    path.setAttribute('class', 'mindmap-connection');
    path.setAttribute('stroke', '#7C3AED');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead)');

    connectionSvg.appendChild(path);
}

// Reset mind map to initial state
function resetMindMap() {
    showModal(
        'Reset Mind Map',
        'Are you sure you want to reset the mind map? This will delete all nodes and create a new root node.',
        () => {
            state.mindMapTree = null;
            state.selectedNode = null;
            state.mindMapZoom = 1;
            state.mindMapPanX = 0;
            state.mindMapPanY = 0;
            state.drawnConnectors = [];
            initializeMindMap();
            renderMindMap();
            applyMindMapTransform();
        },
        'Reset'
    );
}

// Export mind map to image
async function exportMindMap() {
    // Create modal for format selection
    const formatModal = document.createElement('div');
    formatModal.className = 'export-format-modal';
    formatModal.innerHTML = `
        <div class="export-format-content">
            <h3>Export Mind Map</h3>
            <p>Choose export format:</p>
            <div class="format-buttons">
                <button class="btn btn-primary" data-format="png">PNG</button>
                <button class="btn btn-primary" data-format="jpg">JPG</button>
                <button class="btn btn-primary" data-format="jpeg">JPEG</button>
                <button class="btn btn-tool">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(formatModal);

    // Handle format selection
    formatModal.addEventListener('click', async (e) => {
        const format = e.target.dataset.format;
        if (format) {
            await exportMindMapToFormat(format);
        }
        formatModal.remove();
    });
}

async function exportMindMapToFormat(format) {
    try {
        // Use html2canvas library if available, otherwise use simple canvas approach
        if (typeof html2canvas !== 'undefined') {
            const canvas = await html2canvas(mindmapBoard, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true
            });

            downloadCanvas(canvas, format);
        } else {
            // Fallback: simple screenshot using native APIs
            await exportMindMapNative(format);
        }
    } catch (err) {
        console.error('Export error:', err);
        alert('Export failed. Please try again.');
    }
}

async function exportMindMapNative(format) {
    // Get the mind map container bounds
    const container = mindmapBoard;
    const rect = container.getBoundingClientRect();

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * 2; // 2x for better quality
    canvas.height = rect.height * 2;
    const ctx = canvas.getContext('2d');

    // Scale for better quality
    ctx.scale(2, 2);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw SVG connections
    const svgData = new XMLSerializer().serializeToString(connectionSvg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const svgImg = new Image();

    svgImg.onload = () => {
        ctx.drawImage(svgImg, 0, 0);

        // Draw nodes
        const nodes = container.querySelectorAll('.mindmap-node, .shape-node, .text-node');
        let loadedImages = 0;

        nodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            const x = nodeRect.left - rect.left;
            const y = nodeRect.top - rect.top;

            // Draw node as HTML to canvas
            const nodeData = `<svg xmlns="http://www.w3.org/2000/svg" width="${nodeRect.width}" height="${nodeRect.height}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml">${node.outerHTML}</div>
                </foreignObject>
            </svg>`;

            const nodeBlob = new Blob([nodeData], { type: 'image/svg+xml;charset=utf-8' });
            const nodeUrl = URL.createObjectURL(nodeBlob);
            const nodeImg = new Image();

            nodeImg.onload = () => {
                ctx.drawImage(nodeImg, x, y, nodeRect.width, nodeRect.height);
                URL.revokeObjectURL(nodeUrl);

                loadedImages++;
                if (loadedImages === nodes.length) {
                    downloadCanvas(canvas, format);
                }
            };

            nodeImg.src = nodeUrl;
        });

        URL.revokeObjectURL(svgUrl);

        // If no nodes, download immediately
        if (nodes.length === 0) {
            downloadCanvas(canvas, format);
        }
    };

    svgImg.src = svgUrl;
}

function downloadCanvas(canvas, format) {
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const extension = format;

    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `mindmap-${Date.now()}.${extension}`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }, mimeType, 0.95);
}

// ==================== MIND MAP ZOOM & PAN ====================

function applyMindMapTransform() {
    const transform = `translate(${state.mindMapPanX}px, ${state.mindMapPanY}px) scale(${state.mindMapZoom})`;
    mindmapContainer.style.transform = transform;
    connectionSvg.style.transform = transform;
    updateZoomDisplay();
}

function updateZoomDisplay() {
    const zoomPercent = Math.round(state.mindMapZoom * 100);
    if (zoomLevelDisplay) {
        zoomLevelDisplay.textContent = `${zoomPercent}%`;
    }

    // Update Drawnix-style zoom displays
    const zoomValueMindmap = document.getElementById('zoomValueMindmap');
    const statusZoomMindmap = document.getElementById('statusZoomMindmap');
    if (zoomValueMindmap) {
        zoomValueMindmap.textContent = `${zoomPercent}%`;
    }
    if (statusZoomMindmap) {
        statusZoomMindmap.textContent = `${zoomPercent}%`;
    }
}

function zoomIn() {
    state.mindMapZoom = Math.min(state.mindMapZoom + 0.1, 2);
    applyMindMapTransform();
}

function zoomOut() {
    state.mindMapZoom = Math.max(state.mindMapZoom - 0.1, 0.3);
    applyMindMapTransform();
}

function fitToScreen() {
    // Reset zoom and pan
    state.mindMapZoom = 1;
    state.mindMapPanX = 0;
    state.mindMapPanY = 0;
    applyMindMapTransform();
}

function startPan(e) {
    // Only pan with hand tool or when holding space
    if (state.activeTool !== 'hand' && state.activeTool !== 'select') {
        return;
    }

    // Only pan if clicking on canvas wrapper or container, not on nodes or toolbar
    const isClickOnCanvas = e.target.classList.contains('mindmap-canvas-wrapper') ||
                            e.target === mindmapContainer ||
                            e.target === connectionSvg;

    if (isClickOnCanvas) {
        state.isPanning = true;
        state.panStartX = e.clientX - state.mindMapPanX;
        state.panStartY = e.clientY - state.mindMapPanY;
        if (mindmapCanvasWrapper) {
            mindmapCanvasWrapper.classList.add('panning');
            mindmapCanvasWrapper.style.cursor = 'grabbing';
        }
    }
}

function pan(e) {
    if (state.isPanning) {
        state.mindMapPanX = e.clientX - state.panStartX;
        state.mindMapPanY = e.clientY - state.panStartY;
        applyMindMapTransform();
    }
}

function stopPan() {
    state.isPanning = false;
    if (mindmapCanvasWrapper) {
        mindmapCanvasWrapper.classList.remove('panning');
        // Restore cursor based on active tool
        if (state.activeTool === 'hand') {
            mindmapCanvasWrapper.style.cursor = 'grab';
        } else {
            setActiveTool(state.activeTool); // This will set the correct cursor
        }
    }
}

// Mind map zoom with mouse wheel
function handleMindMapWheel(e) {
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        state.mindMapZoom = Math.max(0.3, Math.min(2, state.mindMapZoom + delta));
        applyMindMapTransform();
    }
}

// ==================== DRAG & DROP ====================
function startDrag(e, element, type) {
    const itemData = state.notes.find(n => n.id == element.dataset.id);

    if (itemData && itemData.pinned) return;

    // Get current position from left/top
    const currentLeft = parseInt(element.style.left) || 0;
    const currentTop = parseInt(element.style.top) || 0;

    state.draggedItem = {
        element,
        type,
        startX: e.clientX,
        startY: e.clientY,
        elementX: currentLeft,
        elementY: currentTop,
        currentX: currentLeft,
        currentY: currentTop
    };

    // Disable transitions during drag for smooth movement
    element.style.transition = 'none';
    element.classList.add('dragging');

    // Add listeners
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!state.draggedItem) return;

    // Prevent default for touch
    if (e.type === 'touchmove') {
        e.preventDefault();
    }

    // Get correct coordinates for mouse or touch
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    // Use RAF for smooth 60fps dragging
    if (!state.rafScheduled) {
        state.rafScheduled = true;
        requestAnimationFrame(() => {
            updateDragPosition(clientX, clientY);
            state.rafScheduled = false;
        });
    }
}

function updateDragPosition(clientX, clientY) {
    if (!state.draggedItem) return;

    const element = state.draggedItem.element;

    // Calculate delta from start position
    const dx = clientX - state.draggedItem.startX;
    const dy = clientY - state.draggedItem.startY;

    // Calculate new position
    let x = state.draggedItem.elementX + dx;
    let y = state.draggedItem.elementY + dy;

    // Soft boundaries - allow 50% off-screen
    const halfWidth = element.offsetWidth / 2;
    const halfHeight = element.offsetHeight / 2;
    const maxX = window.innerWidth - halfWidth;
    const maxY = window.innerHeight - halfHeight - 70;
    const minX = -halfWidth;
    const minY = -halfHeight;

    x = Math.max(minX, Math.min(x, maxX));
    y = Math.max(minY, Math.min(y, maxY));

    // Store position
    state.draggedItem.currentX = x;
    state.draggedItem.currentY = y;

    // Update position using left/top directly
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

function stopDrag() {
    if (!state.draggedItem) return;

    const element = state.draggedItem.element;
    const finalX = state.draggedItem.currentX;
    const finalY = state.draggedItem.currentY;

    // Remove dragging state
    element.classList.remove('dragging');

    // Re-enable transitions with slight delay
    setTimeout(() => {
        element.style.transition = '';
    }, 50);

    // Update data
    const itemData = state.notes.find(n => n.id == element.dataset.id);
    if (itemData) {
        itemData.x = finalX;
        itemData.y = finalY;
        saveToStorage();
    }

    // Cleanup
    state.draggedItem = null;
    state.rafScheduled = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', stopDrag);
}

function bringToFront(element) {
    element.style.zIndex = ++state.highestZIndex;
    const itemData = state.notes.find(n => n.id == element.dataset.id);
    if (itemData) {
        itemData.zIndex = state.highestZIndex;
    }
}

// ==================== DRAWING ====================
function toggleDrawingMode() {
    state.drawingMode = !state.drawingMode;
    canvas.classList.toggle('active', state.drawingMode);
    toggleDrawBtn.classList.toggle('active', state.drawingMode);

    document.querySelectorAll('.sticky-note, .mindmap-node').forEach(item => {
        item.style.pointerEvents = state.drawingMode ? 'none' : 'auto';
    });
}

function startDrawing(e) {
    if (!state.drawingMode) return;

    state.isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
}

function draw(e) {
    if (!state.isDrawing || !state.drawingMode) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = state.penColor;
    ctx.lineWidth = state.penSize;

    ctx.lineTo(x, y);
    ctx.stroke();
}

function stopDrawing() {
    if (state.isDrawing) {
        state.isDrawing = false;
        ctx.closePath();
        saveCanvasToStorage();
    }
}

function clearCanvas() {
    showModal(
        'Clear All Drawings',
        'Are you sure you want to clear all drawings?',
        () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            saveCanvasToStorage();
        },
        'Clear'
    );
}

// ==================== CLEAR ALL ====================
function clearAll() {
    const message = state.currentMode === 'sticky'
        ? '<strong>Warning:</strong> This will delete all sticky notes and drawings. This action cannot be undone.'
        : '<strong>Warning:</strong> This will reset the mind map. This action cannot be undone.';

    showModal(
        'Clear Everything',
        message,
        () => {
            if (state.currentMode === 'sticky') {
                // Clear sticky notes
                document.querySelectorAll('.sticky-note').forEach((item, index) => {
                    setTimeout(() => {
                        item.style.animation = 'fadeOut 0.2s ease-out forwards';
                        setTimeout(() => item.remove(), 200);
                    }, index * 30);
                });

                setTimeout(() => {
                    state.notes = [];
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    saveToStorage();
                    saveCanvasToStorage();
                }, state.notes.length * 30 + 200);
            } else {
                // Reset mind map
                state.mindMapTree = null;
                state.selectedNode = null;
                initializeMindMap();
                renderMindMap();
            }
        },
        'Clear All'
    );
}

// ==================== STORAGE ====================

// Serialize mind map tree for storage
function serializeMindMapTree(node) {
    if (!node) return null;
    return {
        id: node.id,
        text: node.text,
        level: node.level,
        children: node.children.map(child => serializeMindMapTree(child))
    };
}

// Deserialize mind map tree from storage
function deserializeMindMapTree(data, parent = null) {
    if (!data) return null;
    const node = new MindMapNode(data.id, data.text, parent);
    node.level = data.level;
    node.children = data.children.map(childData => deserializeMindMapTree(childData, node));
    return node;
}

function saveToStorage() {
    localStorage.setItem('enhancedStickyNotes', JSON.stringify(state.notes));
    localStorage.setItem('enhancedMindMapTree', JSON.stringify(serializeMindMapTree(state.mindMapTree)));
    localStorage.setItem('enhancedCurrentMode', state.currentMode);
}

function saveCanvasToStorage() {
    localStorage.setItem('enhancedStickyCanvas', canvas.toDataURL());
}

function loadFromStorage() {
    // Load notes
    const savedNotes = localStorage.getItem('enhancedStickyNotes');
    if (savedNotes) {
        state.notes = JSON.parse(savedNotes);
        state.notes.forEach(noteData => {
            const noteElement = noteTemplate.content.cloneNode(true).querySelector('.sticky-note');
            noteElement.dataset.id = noteData.id;
            noteElement.dataset.type = 'note';
            noteElement.style.left = noteData.x + 'px';
            noteElement.style.top = noteData.y + 'px';
            noteElement.style.background = noteData.color;
            noteElement.style.zIndex = noteData.zIndex || 10;

            if (noteData.zIndex > state.highestZIndex) {
                state.highestZIndex = noteData.zIndex;
            }

            const content = noteElement.querySelector('.note-content');
            content.innerHTML = noteData.text;

            // Restore font size if saved
            if (noteData.fontSize) {
                content.style.fontSize = noteData.fontSize;
                const fontSelect = noteElement.querySelector('.note-font-size');
                if (fontSelect) {
                    fontSelect.value = noteData.fontSize;
                }
            }

            const timestamp = noteElement.querySelector('.note-timestamp');
            const date = new Date(noteData.timestamp);
            timestamp.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (noteData.pinned) {
                noteElement.classList.add('pinned');
            }

            setupNoteEventListeners(noteElement);
            stickyBoard.appendChild(noteElement);
        });
    }

    // Load mind map tree
    const savedTree = localStorage.getItem('enhancedMindMapTree');
    if (savedTree) {
        const treeData = JSON.parse(savedTree);
        state.mindMapTree = deserializeMindMapTree(treeData);
    }

    // Load current mode
    const savedMode = localStorage.getItem('enhancedCurrentMode');
    if (savedMode) {
        state.currentMode = savedMode;
    }

    // Load canvas
    const savedCanvas = localStorage.getItem('enhancedStickyCanvas');
    if (savedCanvas) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
        img.src = savedCanvas;
    }
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Global node drag handlers (single instance for all nodes)
    document.addEventListener('mousemove', handleGlobalNodeDragMove);
    document.addEventListener('mouseup', handleGlobalNodeDragEnd);

    // Mode switching
    stickyModeBtn.addEventListener('click', () => {
        switchMode('sticky');
    });

    mindmapModeBtn.addEventListener('click', () => {
        switchMode('mindmap');
    });

    // Add note
    addNoteBtn.addEventListener('click', () => {
        const x = Math.random() * (window.innerWidth - 350) + 50;
        const y = Math.random() * (window.innerHeight - 340) + 50;
        const note = createNote(x, y);
        setTimeout(() => {
            note.element.querySelector('.note-content').focus();
        }, 100);
    });

    // Mind map toolbar buttons
    addChildNodeBtn.addEventListener('click', () => {
        if (state.selectedNode) {
            addChildNode(state.selectedNode);
        } else {
            showModal(
                'No Node Selected',
                'Please select a node first by clicking on it, then add a child.',
                null,
                'OK',
                false
            );
        }
    });

    addSiblingNodeBtn.addEventListener('click', () => {
        if (state.selectedNode) {
            addSiblingNode(state.selectedNode);
        } else {
            showModal(
                'No Node Selected',
                'Please select a node first by clicking on it, then add a sibling.',
                null,
                'OK',
                false
            );
        }
    });

    resetMindMapBtn.addEventListener('click', () => {
        resetMindMap();
    });

    // Mind map zoom controls
    zoomInBtn.addEventListener('click', () => {
        zoomIn();
    });

    zoomOutBtn.addEventListener('click', () => {
        zoomOut();
    });

    fitToScreenBtn.addEventListener('click', () => {
        fitToScreen();
    });

    // Export mind map
    exportMindMapBtn.addEventListener('click', () => {
        exportMindMap();
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', () => {
        toggleTheme();
    });

    // Mind map pan (drag canvas) - use canvas wrapper
    if (mindmapCanvasWrapper) {
        mindmapCanvasWrapper.addEventListener('mousedown', startPan);
        mindmapCanvasWrapper.addEventListener('mousemove', pan);
        mindmapCanvasWrapper.addEventListener('mouseup', stopPan);
        mindmapCanvasWrapper.addEventListener('mouseleave', stopPan);

        // Mind map zoom with wheel
        mindmapCanvasWrapper.addEventListener('wheel', handleMindMapWheel, { passive: false });
    }

    // Drawnix-style tool buttons (both old and new selectors)
    const toolButtons = document.querySelectorAll('.tool-btn, .tool-btn-mindmap');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.dataset.tool;
            setActiveTool(tool);
        });
    });

    // Drawnix Mind Map specific buttons
    const backToModesBtn = document.getElementById('backToModesBtn');
    if (backToModesBtn) {
        backToModesBtn.addEventListener('click', () => {
            switchMode('sticky');
        });
    }

    const zoomInMindmap = document.getElementById('zoomInMindmap');
    if (zoomInMindmap) {
        zoomInMindmap.addEventListener('click', () => {
            zoomIn();
        });
    }

    const zoomOutMindmap = document.getElementById('zoomOutMindmap');
    if (zoomOutMindmap) {
        zoomOutMindmap.addEventListener('click', () => {
            zoomOut();
        });
    }

    const exportMindmapBtn = document.getElementById('exportMindmapBtn');
    if (exportMindmapBtn) {
        exportMindmapBtn.addEventListener('click', () => {
            exportMindMap();
        });
    }

    // Mouse position tracking for status bar
    if (mindmapCanvasWrapper) {
        mindmapCanvasWrapper.addEventListener('mousemove', (e) => {
            const statusXMindmap = document.getElementById('statusXMindmap');
            const statusYMindmap = document.getElementById('statusYMindmap');
            if (statusXMindmap && statusYMindmap) {
                const rect = mindmapCanvasWrapper.getBoundingClientRect();
                statusXMindmap.textContent = Math.round(e.clientX - rect.left);
                statusYMindmap.textContent = Math.round(e.clientY - rect.top);
            }
        });
    }

    // Canvas click for placing shapes/nodes with active tool
    if (mindmapCanvasWrapper) {
        mindmapCanvasWrapper.addEventListener('click', handleCanvasToolClick);
    }

    // REMOVED: Click on board to add note - Only use Add Note button

    // Drawing
    toggleDrawBtn.addEventListener('click', toggleDrawingMode);
    clearDrawBtn.addEventListener('click', clearCanvas);
    clearAllBtn.addEventListener('click', clearAll);

    // Colors
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedColor = btn.dataset.color;
        });
    });

    // Pen
    penColorInput.addEventListener('change', (e) => {
        state.penColor = e.target.value;
    });

    penSizeInput.addEventListener('input', (e) => {
        state.penSize = e.target.value;
    });

    // Canvas drawing
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Modal
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideModal();
        }
    });

    modalOverlay.querySelector('.modal-close').addEventListener('click', hideModal);
    modalOverlay.querySelector('.modal-cancel').addEventListener('click', hideModal);

    // Resize
    window.addEventListener('resize', () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

        setupCanvas();
        setupConnectionSvg();
        ctx.drawImage(tempCanvas, 0, 0);

        // Re-render mind map if in mind map mode
        if (state.currentMode === 'mindmap') {
            renderMindMap();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.target.matches('[contenteditable], input, textarea')) return;

        if (e.key === 'Escape') {
            if (state.drawingMode) {
                toggleDrawingMode();
            }
        }

        // Shortcuts that work in sticky mode
        if (state.currentMode === 'sticky') {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                addNoteBtn.click();
            }
            if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'n') {
                addNoteBtn.click();
            }
        }

        // Drawing toggle (works in sticky mode)
        if (state.currentMode === 'sticky') {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                toggleDrawingMode();
            }
            if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'd') {
                toggleDrawingMode();
            }
        }

        // Mind map shortcuts
        if (state.currentMode === 'mindmap') {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
                e.preventDefault();
                if (state.selectedNode) {
                    addChildNode(state.selectedNode);
                }
            }
            if (e.key === 'Tab' && state.selectedNode) {
                e.preventDefault();
                addSiblingNode(state.selectedNode);
            }
        }
    });
}

// ==================== START ====================
init();
