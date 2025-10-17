// ==================== DRAWNIX MIND MAP - ALL TOOLS IMPLEMENTATION ====================
// Complete working implementation of all Mind Map tools

// State Management
const mindMapState = {
    currentTool: 'selection',
    zoom: 1,
    panX: 0,
    panY: 0,
    isPanning: false,
    isDrawing: false,
    startX: 0,
    startY: 0,
    shapes: [],
    selectedShape: null,
    history: [],
    historyIndex: -1,
    drawingPath: [],
    connectorStart: null
};

// Get DOM Elements
let mindmapCanvas, mindmapCanvasContainer, mindmapSvg;

// Initialization guard to prevent multiple event listener registration
let isInitialized = false;

// Initialize Mind Map Tools
function initMindMapTools() {
    // Prevent multiple initializations
    if (isInitialized) {
        console.log('⚠️ Mind Map tools already initialized, skipping');
        return;
    }

    mindmapCanvas = document.getElementById('mindmapCanvas');
    mindmapCanvasContainer = document.getElementById('mindmapContainer');
    mindmapSvg = document.getElementById('connectionSvg');

    if (!mindmapCanvas || !mindmapCanvasContainer || !mindmapSvg) {
        console.log('Mind Map elements not found, skipping initialization');
        return;
    }

    isInitialized = true;
    console.log('✅ Initializing Drawnix Mind Map Tools');

    // Tool Selection
    const toolButtons = document.querySelectorAll('[data-tool]');
    toolButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            toolButtons.forEach(b => b.classList.remove('tool-icon--selected'));
            btn.classList.add('tool-icon--selected');
            mindMapState.currentTool = btn.dataset.tool;
            updateCanvasCursor();
            console.log('Tool selected:', mindMapState.currentTool);
        });
    });

    // Back Button
    const backBtn = document.getElementById('backToModesBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            switchMode('sticky');
        });
    }

    // Zoom Controls
    const zoomInBtn = document.getElementById('zoomInBtn');
    const zoomOutBtn = document.getElementById('zoomOutBtn');
    const zoomDisplay = document.getElementById('zoomDisplay');

    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            mindMapState.zoom = Math.min(mindMapState.zoom + 0.1, 2);
            updateZoom();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            mindMapState.zoom = Math.max(mindMapState.zoom - 0.1, 0.5);
            updateZoom();
        });
    }

    // Canvas Event Listeners
    mindmapCanvas.addEventListener('mousedown', handleMouseDown);
    mindmapCanvas.addEventListener('mousemove', handleMouseMove);
    mindmapCanvas.addEventListener('mouseup', handleMouseUp);
    mindmapCanvas.addEventListener('wheel', handleWheel, { passive: false });

    // Export Button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportMindMap);
    }

    console.log('✅ Mind Map tools initialized successfully');
}

// Update Canvas Cursor Based on Tool
function updateCanvasCursor() {
    if (!mindmapCanvas) return;

    const cursors = {
        'hand': 'grab',
        'selection': 'default',
        'mind': 'crosshair',
        'text': 'text',
        'pen': 'crosshair',
        'arrow': 'crosshair',
        'rectangle': 'crosshair',
        'circle': 'crosshair',
        'eraser': 'not-allowed'
    };

    mindmapCanvas.style.cursor = cursors[mindMapState.currentTool] || 'default';
}

// Switch Tool (for auto-switching after creation)
function switchTool(toolName) {
    mindMapState.currentTool = toolName;
    const toolButtons = document.querySelectorAll('[data-tool]');
    toolButtons.forEach(btn => {
        if (btn.dataset.tool === toolName) {
            btn.classList.add('tool-icon--selected');
        } else {
            btn.classList.remove('tool-icon--selected');
        }
    });
    updateCanvasCursor();
}

// Handle Mouse Down
function handleMouseDown(e) {
    const rect = mindmapCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - mindMapState.panX) / mindMapState.zoom;
    const y = (e.clientY - rect.top - mindMapState.panY) / mindMapState.zoom;

    mindMapState.startX = x;
    mindMapState.startY = y;

    switch (mindMapState.currentTool) {
        case 'hand':
            mindMapState.isPanning = true;
            mindmapCanvas.style.cursor = 'grabbing';
            break;

        case 'selection':
            selectShape(x, y);
            break;

        case 'rectangle':
        case 'circle':
        case 'arrow':
            // Drag-to-create mode
            mindMapState.isDrawing = true;
            break;

        case 'pen':
            mindMapState.isDrawing = true;
            mindMapState.drawingPath = [{ x, y }];
            break;

        case 'text':
            createTextNode(x, y);
            break;

        case 'mind':
            createMindMapNode(x, y);
            break;

        case 'eraser':
            eraseShape(x, y);
            break;
    }
}

// Handle Mouse Move
function handleMouseMove(e) {
    const rect = mindmapCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - mindMapState.panX) / mindMapState.zoom;
    const y = (e.clientY - rect.top - mindMapState.panY) / mindMapState.zoom;

    if (mindMapState.isPanning) {
        const dx = e.movementX;
        const dy = e.movementY;
        mindMapState.panX += dx;
        mindMapState.panY += dy;
        updateTransform();
    }

    if (mindMapState.isDrawing && mindMapState.currentTool === 'pen') {
        mindMapState.drawingPath.push({ x, y });
        renderDrawingPath();
    }
}

// Handle Mouse Up
function handleMouseUp(e) {
    const rect = mindmapCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - mindMapState.panX) / mindMapState.zoom;
    const y = (e.clientY - rect.top - mindMapState.panY) / mindMapState.zoom;

    if (mindMapState.isPanning) {
        mindMapState.isPanning = false;
        mindmapCanvas.style.cursor = 'grab';
    }

    if (mindMapState.isDrawing) {
        const currentTool = mindMapState.currentTool;
        const width = Math.abs(x - mindMapState.startX);
        const height = Math.abs(y - mindMapState.startY);

        // Only create if drag distance is meaningful (>5px)
        const isDraggedEnough = width > 5 || height > 5;

        switch (currentTool) {
            case 'rectangle':
                if (isDraggedEnough) {
                    createRectangle(mindMapState.startX, mindMapState.startY, x, y);
                    switchTool('selection');
                }
                break;

            case 'circle':
                if (isDraggedEnough) {
                    createCircle(mindMapState.startX, mindMapState.startY, x, y);
                    switchTool('selection');
                }
                break;

            case 'arrow':
                if (isDraggedEnough) {
                    createArrow(mindMapState.startX, mindMapState.startY, x, y);
                    switchTool('selection');
                }
                break;

            case 'pen':
                if (mindMapState.drawingPath.length > 2) {
                    createFreehandPath(mindMapState.drawingPath);
                    switchTool('selection');
                }
                mindMapState.drawingPath = [];
                break;
        }
        mindMapState.isDrawing = false;
    }
}

// Handle Mouse Wheel (Zoom)
function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    mindMapState.zoom = Math.max(0.5, Math.min(2, mindMapState.zoom + delta));
    updateZoom();
}

// Update Zoom
function updateZoom() {
    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) {
        zoomDisplay.textContent = Math.round(mindMapState.zoom * 100) + '%';
    }
    updateTransform();
}

// Update Transform
function updateTransform() {
    if (mindmapCanvasContainer) {
        mindmapCanvasContainer.style.transform = `scale(${mindMapState.zoom}) translate(${mindMapState.panX}px, ${mindMapState.panY}px)`;
    }
}

// ==================== SHAPE CREATION FUNCTIONS ====================

// Create Rectangle
function createRectangle(x1, y1, x2, y2) {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);

    const shape = document.createElement('div');
    shape.className = 'mindmap-shape mindmap-rectangle';
    shape.style.left = x + 'px';
    shape.style.top = y + 'px';
    shape.style.width = width + 'px';
    shape.style.height = height + 'px';
    shape.style.position = 'absolute';
    shape.style.border = '2px solid #6698ff';
    shape.style.background = 'rgba(102, 152, 255, 0.1)';
    shape.style.borderRadius = '4px';

    mindmapCanvasContainer.appendChild(shape);
    mindMapState.shapes.push({ type: 'rectangle', element: shape, x, y, width, height });
    console.log('✅ Rectangle created');
}

// Create Circle
function createCircle(x1, y1, x2, y2) {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const size = Math.max(width, height);
    const x = x1;
    const y = y1;

    const shape = document.createElement('div');
    shape.className = 'mindmap-shape mindmap-circle';
    shape.style.left = x + 'px';
    shape.style.top = y + 'px';
    shape.style.width = size + 'px';
    shape.style.height = size + 'px';
    shape.style.position = 'absolute';
    shape.style.border = '2px solid #6698ff';
    shape.style.background = 'rgba(102, 152, 255, 0.1)';
    shape.style.borderRadius = '50%';

    mindmapCanvasContainer.appendChild(shape);
    mindMapState.shapes.push({ type: 'circle', element: shape, x, y, size });
    console.log('✅ Circle created');
}

// Create Mind Map Node
function createMindMapNode(x, y, parentNode = null) {
    const node = document.createElement('div');
    node.className = 'mindmap-node';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.style.position = 'absolute';
    node.style.padding = '12px 24px';
    node.style.border = '2px solid #6698ff';
    node.style.background = '#ffffff';
    node.style.borderRadius = '8px';
    node.style.cursor = 'move';
    node.style.fontSize = '16px';
    node.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    node.style.minWidth = '120px';
    node.style.textAlign = 'center';
    node.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    node.style.whiteSpace = 'nowrap';
    node.contentEditable = true;
    node.textContent = parentNode ? 'Child Node' : 'Central Theme';
    node.dataset.nodeId = 'node-' + Date.now();

    // Add child node button (appears on selection)
    const addChildBtn = document.createElement('button');
    addChildBtn.className = 'add-child-btn';
    addChildBtn.innerHTML = '+';
    addChildBtn.title = 'Add child node';
    addChildBtn.style.position = 'absolute';
    addChildBtn.style.right = '-40px';
    addChildBtn.style.top = '50%';
    addChildBtn.style.transform = 'translateY(-50%)';
    addChildBtn.style.width = '24px';
    addChildBtn.style.height = '24px';
    addChildBtn.style.borderRadius = '50%';
    addChildBtn.style.border = '2px solid #6698ff';
    addChildBtn.style.background = '#ffffff';
    addChildBtn.style.color = '#6698ff';
    addChildBtn.style.cursor = 'pointer';
    addChildBtn.style.fontSize = '18px';
    addChildBtn.style.lineHeight = '1';
    addChildBtn.style.display = 'none';
    addChildBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeRect = node.getBoundingClientRect();
        const canvasRect = mindmapCanvas.getBoundingClientRect();

        // Calculate child position based on existing children count
        const parentShape = mindMapState.shapes.find(s => s.id === node.dataset.nodeId);
        const childCount = parentShape ? parentShape.children.length : 0;

        // Position children vertically staggered (80px vertical spacing)
        const baseY = (nodeRect.top - canvasRect.top + nodeRect.height / 2 - mindMapState.panY) / mindMapState.zoom;
        const childX = (nodeRect.right - canvasRect.left - mindMapState.panX + 150) / mindMapState.zoom;
        const childY = baseY + (childCount * 80) - (childCount > 0 ? childCount * 20 : 0);

        const childNode = createMindMapNode(childX, childY, node);
        // Draw connector
        drawConnector(node, childNode.element);
    });
    node.appendChild(addChildBtn);

    // Make draggable
    node.addEventListener('mousedown', (e) => {
        if (mindMapState.currentTool === 'selection') {
            e.stopPropagation();
            makeDraggable(node, e);
        }
    });

    // Select text on first focus
    node.addEventListener('focus', () => {
        document.execCommand('selectAll', false, null);
    }, { once: true });

    // Show add child button on selection
    node.addEventListener('click', (e) => {
        if (mindMapState.currentTool === 'selection' && !node.isContentEditable) {
            e.stopPropagation();
            // Hide all other add child buttons
            document.querySelectorAll('.add-child-btn').forEach(btn => btn.style.display = 'none');
            // Show this node's button
            addChildBtn.style.display = 'block';
        }
    });

    mindmapCanvasContainer.appendChild(node);
    const shapeObj = {
        type: 'node',
        element: node,
        x,
        y,
        id: node.dataset.nodeId,
        parent: parentNode?.dataset?.nodeId || null,
        children: []
    };
    mindMapState.shapes.push(shapeObj);

    // Update parent's children array
    if (parentNode) {
        const parentShape = mindMapState.shapes.find(s => s.id === parentNode.dataset.nodeId);
        if (parentShape) {
            parentShape.children.push(node.dataset.nodeId);
        }
    }

    // Auto-select the created node
    mindMapState.selectedShape = shapeObj;
    node.classList.add('selected');
    addChildBtn.style.display = 'block';

    // Auto-switch to Selection tool
    switchTool('selection');

    // Focus for immediate editing
    setTimeout(() => node.focus(), 50);

    console.log('✅ Mind map node created');
    return shapeObj;
}

// Create Text Node
function createTextNode(x, y) {
    const text = document.createElement('div');
    text.className = 'mindmap-text';
    text.style.left = x + 'px';
    text.style.top = y + 'px';
    text.style.position = 'absolute';
    text.style.padding = '8px 12px';
    text.style.minWidth = '100px';
    text.style.color = '#333333';
    text.style.fontSize = '16px';
    text.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    text.style.background = 'transparent';
    text.style.cursor = 'text';
    text.contentEditable = true;
    text.textContent = 'Text';

    text.addEventListener('mousedown', (e) => {
        if (mindMapState.currentTool === 'selection') {
            e.stopPropagation();
            makeDraggable(text, e);
        }
    });

    // Select text on first focus
    text.addEventListener('focus', () => {
        document.execCommand('selectAll', false, null);
    }, { once: true });

    mindmapCanvasContainer.appendChild(text);
    const shapeObj = { type: 'text', element: text, x, y };
    mindMapState.shapes.push(shapeObj);

    // Auto-select the created text
    mindMapState.selectedShape = shapeObj;
    text.classList.add('selected');

    // Auto-switch to Selection tool
    switchTool('selection');

    // Focus for immediate editing
    setTimeout(() => text.focus(), 50);

    console.log('✅ Text node created');
}

// Create Freehand Path
function createFreehandPath(path) {
    if (path.length < 2) return;

    let pathData = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
        pathData += ` L ${path[i].x} ${path[i].y}`;
    }

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', '#6698ff');
    pathElement.setAttribute('stroke-width', '2');
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('stroke-linecap', 'round');

    mindmapSvg.appendChild(pathElement);
    mindMapState.shapes.push({ type: 'path', element: pathElement, path });
    console.log('✅ Freehand path created');
}

// Render Drawing Path (Preview)
function renderDrawingPath() {
    const tempPath = mindmapSvg.querySelector('.temp-path');
    if (tempPath) tempPath.remove();

    if (mindMapState.drawingPath.length < 2) return;

    let pathData = `M ${mindMapState.drawingPath[0].x} ${mindMapState.drawingPath[0].y}`;
    for (let i = 1; i < mindMapState.drawingPath.length; i++) {
        pathData += ` L ${mindMapState.drawingPath[i].x} ${mindMapState.drawingPath[i].y}`;
    }

    const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathElement.setAttribute('d', pathData);
    pathElement.setAttribute('stroke', '#6698ff');
    pathElement.setAttribute('stroke-width', '2');
    pathElement.setAttribute('fill', 'none');
    pathElement.setAttribute('stroke-linecap', 'round');
    pathElement.setAttribute('opacity', '0.5');
    pathElement.classList.add('temp-path');

    mindmapSvg.appendChild(pathElement);
}

// Handle Arrow Click
function handleArrowClick(x, y) {
    if (!mindMapState.connectorStart) {
        mindMapState.connectorStart = { x, y };
        console.log('Arrow start set');
    } else {
        createArrow(mindMapState.connectorStart.x, mindMapState.connectorStart.y, x, y);
        mindMapState.connectorStart = null;
        switchTool('selection');
    }
}

// Create Arrow
function createArrow(x1, y1, x2, y2) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', '#6698ff');
    line.setAttribute('stroke-width', '2');
    line.setAttribute('marker-end', 'url(#arrowhead)');

    mindmapSvg.appendChild(line);
    mindMapState.shapes.push({ type: 'arrow', element: line, x1, y1, x2, y2 });
    console.log('✅ Arrow created');
}

// Draw Connector between nodes
function drawConnector(parentNode, childNode) {
    const parentRect = parentNode.getBoundingClientRect();
    const childRect = childNode.getBoundingClientRect();
    const canvasRect = mindmapCanvas.getBoundingClientRect();

    // Calculate center points relative to canvas
    const x1 = (parentRect.right - canvasRect.left) / mindMapState.zoom;
    const y1 = (parentRect.top + parentRect.height / 2 - canvasRect.top) / mindMapState.zoom;
    const x2 = (childRect.left - canvasRect.left) / mindMapState.zoom;
    const y2 = (childRect.top + childRect.height / 2 - canvasRect.top) / mindMapState.zoom;

    // Create curved connector (Bezier curve)
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const controlPointX = x1 + (x2 - x1) / 2;
    const pathData = `M ${x1} ${y1} Q ${controlPointX} ${y1}, ${controlPointX} ${(y1 + y2) / 2} T ${x2} ${y2}`;

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#6698ff');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    path.classList.add('mindmap-connector');
    path.dataset.parentId = parentNode.dataset.nodeId;
    path.dataset.childId = childNode.dataset.nodeId;

    mindmapSvg.appendChild(path);
    mindMapState.shapes.push({
        type: 'connector',
        element: path,
        parentId: parentNode.dataset.nodeId,
        childId: childNode.dataset.nodeId
    });
    console.log('✅ Connector drawn');
}

// Select Shape
function selectShape(x, y) {
    // Check if clicking on a shape
    const clickedShape = mindMapState.shapes.find(shape => {
        if (shape.type === 'rectangle' || shape.type === 'circle' || shape.type === 'node' || shape.type === 'text') {
            const rect = shape.element.getBoundingClientRect();
            const canvasRect = mindmapCanvas.getBoundingClientRect();
            const relX = x * mindMapState.zoom + mindMapState.panX + canvasRect.left;
            const relY = y * mindMapState.zoom + mindMapState.panY + canvasRect.top;

            return relX >= rect.left && relX <= rect.right && relY >= rect.top && relY <= rect.bottom;
        }
        return false;
    });

    if (clickedShape) {
        mindMapState.selectedShape = clickedShape;
        console.log('Shape selected:', clickedShape.type);
    } else {
        mindMapState.selectedShape = null;
    }
}

// Make Element Draggable
function makeDraggable(element, startEvent) {
    startEvent.preventDefault();

    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const startLeft = parseFloat(element.style.left) || 0;
    const startTop = parseFloat(element.style.top) || 0;
    const nodeId = element.dataset.nodeId;

    // Add dragging class for visual feedback
    element.classList.add('dragging');

    function onMouseMove(e) {
        const dx = (e.clientX - startX) / mindMapState.zoom;
        const dy = (e.clientY - startY) / mindMapState.zoom;
        element.style.left = (startLeft + dx) + 'px';
        element.style.top = (startTop + dy) + 'px';

        // Update connectors if this is a mind map node
        if (nodeId) {
            updateConnectors(nodeId);
        }
    }

    function onMouseUp() {
        // Remove dragging class
        element.classList.remove('dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Update connectors when node moves
function updateConnectors(nodeId) {
    const connectors = mindMapState.shapes.filter(s =>
        s.type === 'connector' && (s.parentId === nodeId || s.childId === nodeId)
    );

    connectors.forEach(connector => {
        const parentNode = document.querySelector(`[data-node-id="${connector.parentId}"]`);
        const childNode = document.querySelector(`[data-node-id="${connector.childId}"]`);

        if (parentNode && childNode) {
            const parentRect = parentNode.getBoundingClientRect();
            const childRect = childNode.getBoundingClientRect();
            const canvasRect = mindmapCanvas.getBoundingClientRect();

            const x1 = (parentRect.right - canvasRect.left) / mindMapState.zoom;
            const y1 = (parentRect.top + parentRect.height / 2 - canvasRect.top) / mindMapState.zoom;
            const x2 = (childRect.left - canvasRect.left) / mindMapState.zoom;
            const y2 = (childRect.top + childRect.height / 2 - canvasRect.top) / mindMapState.zoom;

            const controlPointX = x1 + (x2 - x1) / 2;
            const pathData = `M ${x1} ${y1} Q ${controlPointX} ${y1}, ${controlPointX} ${(y1 + y2) / 2} T ${x2} ${y2}`;

            connector.element.setAttribute('d', pathData);
        }
    });
}

// Erase Shape
function eraseShape(x, y) {
    const shapeToRemove = mindMapState.shapes.find(shape => {
        if (shape.type === 'rectangle' || shape.type === 'circle' || shape.type === 'node' || shape.type === 'text') {
            const rect = shape.element.getBoundingClientRect();
            const canvasRect = mindmapCanvas.getBoundingClientRect();
            const relX = x * mindMapState.zoom + mindMapState.panX + canvasRect.left;
            const relY = y * mindMapState.zoom + mindMapState.panY + canvasRect.top;

            return relX >= rect.left && relX <= rect.right && relY >= rect.top && relY <= rect.bottom;
        }
        return false;
    });

    if (shapeToRemove) {
        shapeToRemove.element.remove();
        mindMapState.shapes = mindMapState.shapes.filter(s => s !== shapeToRemove);
        console.log('✅ Shape erased');
    }
}

// Export Mind Map
function exportMindMap() {
    console.log('Exporting mind map...');
    // This would convert the canvas to an image
    alert('Export functionality - would export canvas as PNG/SVG');
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMindMapTools);
} else {
    initMindMapTools();
}

console.log('✅ Mind Map Tools Script Loaded');
