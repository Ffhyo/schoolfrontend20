import { useState, useRef, useEffect, useCallback } from 'react';
import React from 'react';

// Enhanced custom hooks
const useCanvasOperations = () => {
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(5, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
    setCanvasPosition({ x: 0, y: 0 });
  }, []);

  const zoomToFit = useCallback((elements, tables, padding = 50) => {
    if (elements.length === 0 && tables.length === 0) return;
    
    const allItems = [...elements, ...tables];
    const bounds = allItems.reduce((acc, item) => {
      return {
        minX: Math.min(acc.minX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxX: Math.max(acc.maxX, item.x + item.width),
        maxY: Math.max(acc.maxY, item.y + item.height)
      };
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const contentWidth = bounds.maxX - bounds.minX + padding * 2;
    const contentHeight = bounds.maxY - bounds.minY + padding * 2;
    
    const scaleX = canvas.width / contentWidth;
    const scaleY = canvas.height / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1);
    
    setScale(newScale);
    setCanvasPosition({
      x: -bounds.minX * newScale + padding * newScale,
      y: -bounds.minY * newScale + padding * newScale
    });
  }, []);

  return {
    canvasPosition, setCanvasPosition,
    scale, setScale,
    isDraggingCanvas, setIsDraggingCanvas,
    dragStart, setDragStart,
    zoomIn, zoomOut, resetZoom, zoomToFit
  };
};

const useSelection = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedCells, setSelectedCells] = useState([]);
  const [selectedElements, setSelectedElements] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const clearAllSelections = useCallback(() => {
    setSelectedTable(null);
    setSelectedCells([]);
    setSelectedElements([]);
    setSelectedGroup(null);
  }, []);

  const isElementSelected = useCallback((elementId) => {
    return selectedElements.includes(elementId);
  }, [selectedElements]);

  return {
    selectedTable, setSelectedTable,
    selectedCells, setSelectedCells,
    selectedElements, setSelectedElements,
    selectedGroup, setSelectedGroup,
    clearAllSelections,
    isElementSelected
  };
};

const useElements = () => {
  const [elements, setElements] = useState([]);
  const [groups, setGroups] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const addElement = useCallback((element) => {
    setElements(prev => {
      const newElements = [...prev, { ...element, zIndex: prev.length }];
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
  }, [historyIndex]);

  const updateElement = useCallback((id, updates) => {
    setElements(prev => {
      const newElements = prev.map(el => 
        el.id === id ? { ...el, ...updates } : el
      );
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
  }, [historyIndex]);

  const deleteElements = useCallback((ids) => {
    setElements(prev => {
      const newElements = prev.filter(el => !ids.includes(el.id));
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), newElements]);
      setHistoryIndex(prev => prev + 1);
      return newElements;
    });
  }, [historyIndex]);

  const duplicateElements = useCallback((ids) => {
    const newElements = ids.map(id => {
      const original = elements.find(el => el.id === id);
      return original ? {
        ...original,
        id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: original.x + 20,
        y: original.y + 20,
        isSelected: false
      } : null;
    }).filter(Boolean);

    setElements(prev => {
      const updatedElements = [...prev, ...newElements];
      setHistory(prevHistory => [...prevHistory.slice(0, historyIndex + 1), updatedElements]);
      setHistoryIndex(prev => prev + 1);
      return updatedElements;
    });
    return newElements.map(el => el.id);
  }, [elements, historyIndex]);

  const bringToFront = useCallback((ids) => {
    setElements(prev => {
      const otherElements = prev.filter(el => !ids.includes(el.id));
      const selectedElements = prev.filter(el => ids.includes(el.id));
      const newElements = [...otherElements, ...selectedElements].map((el, index) => ({
        ...el,
        zIndex: index
      }));
      return newElements;
    });
  }, []);

  const sendToBack = useCallback((ids) => {
    setElements(prev => {
      const otherElements = prev.filter(el => !ids.includes(el.id));
      const selectedElements = prev.filter(el => ids.includes(el.id));
      const newElements = [...selectedElements, ...otherElements].map((el, index) => ({
        ...el,
        zIndex: index
      }));
      return newElements;
    });
  }, []);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      setElements(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1);
      setElements(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  return {
    elements,
    setElements,
    groups,
    setGroups,
    addElement,
    updateElement,
    deleteElements,
    duplicateElements,
    bringToFront,
    sendToBack,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};

const useTables = () => {
  const [tables, setTables] = useState([]);

  const addTable = useCallback((table) => {
    setTables(prev => [...prev, table]);
  }, []);

  const updateTable = useCallback((id, updates) => {
    setTables(prev => prev.map(table => 
      table.id === id ? { ...table, ...updates } : table
    ));
  }, []);

  const deleteTable = useCallback((id) => {
    setTables(prev => prev.filter(table => table.id !== id));
  }, []);

  return {
    tables,
    setTables,
    addTable,
    updateTable,
    deleteTable
  };
};

// Enhanced Constants
const ELEMENT_TYPES = {
  SELECT: 'select',
  FRAME: 'frame',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  LINE: 'line',
  ARROW: 'arrow',
  TEXT: 'text',
  IMAGE: 'image',
  PATH: 'path',
  FREEHAND: 'freehand',
  STAR: 'star',
  POLYGON: 'polygon',
  ICON: 'icon',
  EMBED: 'embed'
};

const TOOL_SHORTCUTS = {
  'v': ELEMENT_TYPES.SELECT,
  'f': ELEMENT_TYPES.FRAME,
  'r': ELEMENT_TYPES.RECTANGLE,
  'o': ELEMENT_TYPES.CIRCLE,
  't': ELEMENT_TYPES.TEXT,
  'p': ELEMENT_TYPES.FREEHAND,
  'l': ELEMENT_TYPES.LINE,
  'i': ELEMENT_TYPES.IMAGE
};

const GRID_SIZE = 20;

// Utility functions
const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Icon Components
const CursorIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
const FrameIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const RectangleIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>;
const CircleIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" /></svg>;
const TriangleIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2L3 22h18L12 2z" /></svg>;
const LineIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5l14 14" /></svg>;
const ArrowIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>;
const TextIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;
const ImageIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const IconIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>;
const FreehandIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const StarIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;
const PolygonIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16.002V20m9-8h-1m-16 0h-1m3.5 7.5l1-1m12-12l-1 1m-12 12l1 1m12-12l-1-1m-2.5-4.5l-1 1m12 12l1-1m-12-12l-1-1m2.5 4.5l1 1" /></svg>;
const DuplicateIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const DeleteIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const BringToFrontIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h11m0 0l-4-4m4 4l-4 4m4-4v11a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1h9a1 1 0 011 1v5z" /></svg>;
const SendToBackIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 14H3m0 0l4-4m-4 4l4 4m14-4h-8m0 0l4-4m-4 4l4 4m-4-4V5a1 1 0 011-1h9a1 1 0 011 1v9a1 1 0 01-1 1h-5z" /></svg>;
const UndoIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v0M3 10l4 4m-4-4l4-4" /></svg>;
const RedoIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v0m21-10l-4 4m4-4l-4-4" /></svg>;
const ZoomToFitIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>;
const UploadIcon = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const SearchIcon = ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const CloseIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in DocumentEditor:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 border border-red-400 rounded">
          <h2 className="text-red-700 font-bold">Something went wrong.</h2>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main Component
const DocumentEditor = () => {
  // State management using custom hooks
  const canvasOps = useCanvasOperations();
  const selection = useSelection();
  const elementsManager = useElements();
  const tablesManager = useTables();

  // ALL STATE DECLARATIONS AT THE TOP - FIXED
  const [activeTool, setActiveTool] = useState(ELEMENT_TYPES.SELECT);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [editingTextElement, setEditingTextElement] = useState(null);
  const [textEditValue, setTextEditValue] = useState('');

  // Enhanced element editing state
  const [resizingElement, setResizingElement] = useState(null);
  const [resizeElementStart, setResizeElementStart] = useState({ x: 0, y: 0 });
  const [resizeElementType, setResizeElementType] = useState(null);
  const [elementOriginalSize, setElementOriginalSize] = useState(null);
  const [draggingElement, setDraggingElement] = useState(null);
  const [elementDragStart, setElementDragStart] = useState({ x: 0, y: 0 });

  // Enhanced UI state
  const [showToolbox, setShowToolbox] = useState(true);
  const [showLayers, setShowLayers] = useState(true);
  const [showAssetPanel, setShowAssetPanel] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showIconSearch, setShowIconSearch] = useState(false);
  const [showGridLines, setShowGridLines] = useState(true);

  // Asset search state
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [iconResults, setIconResults] = useState([]);

  // Refs
  const canvasRef = useRef(null);
  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Coordinate conversion
  const screenToCanvas = useCallback((screenX, screenY) => {
    return {
      x: (screenX - canvasOps.canvasPosition.x) / canvasOps.scale,
      y: (screenY - canvasOps.canvasPosition.y) / canvasOps.scale
    };
  }, [canvasOps.canvasPosition, canvasOps.scale]);

  // Enhanced element creation
  const createElement = useCallback((type, canvasX, canvasY, options = {}) => {
    const baseElement = {
      id: `elem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: canvasX,
      y: canvasY,
      width: options.width || 100,
      height: options.height || 100,
      rotation: 0,
      zIndex: elementsManager.elements.length,
      isSelected: false,
      locked: false,
      visible: true,
      name: options.name || `${type.charAt(0).toUpperCase() + type.slice(1)}`,
      style: {
        fill: options.fill || (type === ELEMENT_TYPES.TEXT ? 'none' : '#ffffff'),
        stroke: options.stroke || '#3b82f6',
        strokeWidth: options.strokeWidth || 2,
        strokeDasharray: options.strokeDasharray || 'none',
        opacity: 1,
        cornerRadius: options.cornerRadius || 0,
        shadow: options.shadow || 'none',
      }
    };

    switch (type) {
      case ELEMENT_TYPES.FRAME:
        return {
          ...baseElement,
          width: 400,
          height: 300,
          style: {
            ...baseElement.style,
            fill: options.fill || '#f8fafc',
            stroke: options.stroke || '#e2e8f0',
            strokeWidth: 2
          },
          clipContent: true
        };
      
      case ELEMENT_TYPES.TEXT:
        return {
          ...baseElement,
          content: options.content || 'Double click to edit text',
          width: 200,
          height: 40,
          style: {
            ...baseElement.style,
            fontSize: options.fontSize || 16,
            fontFamily: options.fontFamily || 'Inter',
            fontWeight: options.fontWeight || 'normal',
            textColor: options.textColor || '#000000',
            textAlign: options.textAlign || 'left',
            lineHeight: options.lineHeight || 1.2,
            letterSpacing: options.letterSpacing || 0
          }
        };
      
      case ELEMENT_TYPES.IMAGE:
        return {
          ...baseElement,
          width: 200,
          height: 150,
          src: options.src || '',
          alt: options.alt || 'Image',
          preserveAspectRatio: true,
          filters: {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            hue: 0
          }
        };
      
      case ELEMENT_TYPES.ICON:
        return {
          ...baseElement,
          width: 24,
          height: 24,
          iconData: options.iconData || '',
          iconName: options.iconName || 'icon',
          color: options.color || '#000000'
        };
      
      default:
        return baseElement;
    }
  }, [elementsManager.elements.length]);

  // Element manipulation functions
  const addElementToCanvas = useCallback((type, options = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const canvasPos = screenToCanvas(centerX, centerY);
    
    const newElement = createElement(type, canvasPos.x, canvasPos.y, options);
    elementsManager.addElement(newElement);
    selection.setSelectedElements([newElement.id]);
    selection.clearAllSelections();
  }, [screenToCanvas, createElement, elementsManager, selection]);

  const deleteSelectedElements = useCallback(() => {
    if (selection.selectedElements.length === 0) return;
    elementsManager.deleteElements(selection.selectedElements);
    selection.setSelectedElements([]);
  }, [selection.selectedElements, elementsManager, selection]);

  // Element styling
  const updateElementStyle = useCallback((elementId, styleUpdates) => {
    const element = elementsManager.elements.find(el => el.id === elementId);
    if (element) {
      elementsManager.updateElement(elementId, {
        style: { ...element.style, ...styleUpdates }
      });
    }
  }, [elementsManager]);

  const updateSelectedElementsStyle = useCallback((styleUpdates) => {
    selection.selectedElements.forEach(id => {
      updateElementStyle(id, styleUpdates);
    });
  }, [selection.selectedElements, updateElementStyle]);

  const toggleFill = useCallback(() => {
    if (selection.selectedElements.length === 0) return;
    
    const firstElement = elementsManager.elements.find(el => el.id === selection.selectedElements[0]);
    if (!firstElement) return;

    const hasFill = firstElement.style.fill !== 'none' && firstElement.style.fill !== 'transparent';
    const newFill = hasFill ? 'none' : '#ffffff';
    
    updateSelectedElementsStyle({ fill: newFill });
  }, [selection.selectedElements, elementsManager.elements, updateSelectedElementsStyle]);

  // Element transformation
  const handleElementResizeStart = useCallback((e, elementId, resizeType) => {
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const element = elementsManager.elements.find(el => el.id === elementId);
    if (!element) return;

    setResizingElement(elementId);
    setResizeElementStart({ x: screenX, y: screenY });
    setResizeElementType(resizeType);
    setElementOriginalSize({
      width: element.width,
      height: element.height,
      x: element.x,
      y: element.y
    });
  }, [elementsManager.elements]);

  const handleElementResize = useCallback(throttle((e) => {
    if (!resizingElement || !resizeElementType) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const deltaX = (screenX - resizeElementStart.x) / canvasOps.scale;
    const deltaY = (screenY - resizeElementStart.y) / canvasOps.scale;

    elementsManager.setElements(prev => prev.map(el => {
      if (el.id === resizingElement) {
        const newElement = { ...el };
        
        switch (resizeElementType) {
          case 'bottom-right':
            newElement.width = Math.max(10, elementOriginalSize.width + deltaX);
            newElement.height = Math.max(10, elementOriginalSize.height + deltaY);
            break;
          
          case 'bottom-left':
            newElement.width = Math.max(10, elementOriginalSize.width - deltaX);
            newElement.height = Math.max(10, elementOriginalSize.height + deltaY);
            newElement.x = elementOriginalSize.x + deltaX;
            break;
          
          case 'top-right':
            newElement.width = Math.max(10, elementOriginalSize.width + deltaX);
            newElement.height = Math.max(10, elementOriginalSize.height - deltaY);
            newElement.y = elementOriginalSize.y + deltaY;
            break;
          
          case 'top-left':
            newElement.width = Math.max(10, elementOriginalSize.width - deltaX);
            newElement.height = Math.max(10, elementOriginalSize.height - deltaY);
            newElement.x = elementOriginalSize.x + deltaX;
            newElement.y = elementOriginalSize.y + deltaY;
            break;
          
          default:
            break;
        }

        if (newElement.type === ELEMENT_TYPES.CIRCLE) {
          newElement.radius = Math.min(newElement.width, newElement.height) / 2;
        }

        return newElement;
      }
      return el;
    }));

    setResizeElementStart({ x: screenX, y: screenY });
  }, 16), [resizingElement, resizeElementType, resizeElementStart, elementOriginalSize, canvasOps.scale, elementsManager]);

  const handleElementResizeEnd = useCallback(() => {
    setResizingElement(null);
    setResizeElementType(null);
    setElementOriginalSize(null);
  }, []);

  // Element dragging
  const handleElementDragStart = useCallback((e, elementId) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (!selection.selectedElements.includes(elementId)) {
      if (e.shiftKey) {
        selection.setSelectedElements(prev => [...prev, elementId]);
      } else {
        selection.setSelectedElements([elementId]);
      }
    }

    setDraggingElement(elementId);
    setElementDragStart({ x: screenX, y: screenY });
    selection.setSelectedTable(null);
    selection.setSelectedCells([]);
  }, [selection]);

  const handleElementDrag = useCallback(throttle((e) => {
    if (!draggingElement || selection.selectedElements.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const deltaX = (screenX - elementDragStart.x) / canvasOps.scale;
    const deltaY = (screenY - elementDragStart.y) / canvasOps.scale;

    elementsManager.setElements(prev => prev.map(el => {
      if (selection.selectedElements.includes(el.id)) {
        return {
          ...el,
          x: el.x + deltaX,
          y: el.y + deltaY
        };
      }
      return el;
    }));

    setElementDragStart({ x: screenX, y: screenY });
  }, 16), [draggingElement, selection.selectedElements, elementDragStart, canvasOps.scale, elementsManager]);

  const handleElementDragEnd = useCallback(() => {
    setDraggingElement(null);
  }, []);

  // Text editing
  const startTextEditing = useCallback((elementId) => {
    const element = elementsManager.elements.find(el => el.id === elementId);
    if (!element || element.type !== ELEMENT_TYPES.TEXT) return;

    setEditingTextElement(elementId);
    setTextEditValue(element.content || '');
    
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        textInputRef.current.select();
      }
    }, 10);
  }, [elementsManager.elements]);

  const saveTextEdit = useCallback(() => {
    if (!editingTextElement) return;

    elementsManager.updateElement(editingTextElement, { content: textEditValue });
    setEditingTextElement(null);
    setTextEditValue('');
  }, [editingTextElement, textEditValue, elementsManager]);

  // Asset management
  const searchImages = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock implementation
      const mockResults = [
        {
          id: '1',
          urls: { regular: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400' },
          alt: 'Book',
          photographer: 'John Doe'
        },
        {
          id: '2', 
          urls: { regular: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=400' },
          alt: 'Person',
          photographer: 'Jane Smith'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Image search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const searchIcons = useCallback(async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Mock implementation
      const mockIcons = [
        { name: 'mdi:home', data: 'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z' },
        { name: 'mdi:star', data: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' },
      ];
      
      setIconResults(mockIcons);
    } catch (error) {
      console.error('Icon search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const addImageFromUrl = useCallback((url, alt = 'Image') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const canvasPos = screenToCanvas(centerX, centerY);

    const newImage = createElement(ELEMENT_TYPES.IMAGE, canvasPos.x, canvasPos.y, {
      src: url,
      alt: alt,
      width: 200,
      height: 150
    });

    elementsManager.addElement(newImage);
    selection.setSelectedElements([newImage.id]);
    setShowImageSearch(false);
  }, [screenToCanvas, createElement, elementsManager, selection]);

  const addIcon = useCallback((iconData, iconName) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const canvasPos = screenToCanvas(centerX, centerY);

    const newIcon = createElement(ELEMENT_TYPES.ICON, canvasPos.x, canvasPos.y, {
      iconData: iconData,
      iconName: iconName,
      color: '#000000',
      width: 24,
      height: 24
    });

    elementsManager.addElement(newIcon);
    selection.setSelectedElements([newIcon.id]);
    setShowIconSearch(false);
  }, [screenToCanvas, createElement, elementsManager, selection]);

  // File handling
  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      addImageFromUrl(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  }, [addImageFromUrl]);

  // Image filters
  const applyImageFilter = useCallback((elementId, filterType, value) => {
    elementsManager.updateElement(elementId, {
      filters: {
        ...elementsManager.elements.find(el => el.id === elementId)?.filters,
        [filterType]: value
      }
    });
  }, [elementsManager]);

  // Mouse event handlers
  const handleCanvasMouseDown = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const canvasPos = screenToCanvas(screenX, screenY);

    // Check for element interactions
    let clickedElement = null;
    for (let i = elementsManager.elements.length - 1; i >= 0; i--) {
      const element = elementsManager.elements[i];
      if (canvasPos.x >= element.x && canvasPos.x <= element.x + element.width &&
          canvasPos.y >= element.y && canvasPos.y <= element.y + element.height) {
        clickedElement = element;
        break;
      }
    }

    if (clickedElement) {
      if (e.detail === 2 && clickedElement.type === ELEMENT_TYPES.TEXT) {
        startTextEditing(clickedElement.id);
        return;
      }

      // Check for resize handles
      const handle = getResizeHandleAtPoint(clickedElement, canvasPos);
      if (handle && selection.selectedElements.includes(clickedElement.id)) {
        handleElementResizeStart(e, clickedElement.id, handle);
        return;
      }

      handleElementDragStart(e, clickedElement.id);
      return;
    }

    // Start selection or canvas drag
    if (activeTool === ELEMENT_TYPES.SELECT) {
      setSelectionStart(canvasPos);
      setIsSelecting(true);
      selection.setSelectedElements([]);
    } else {
      canvasOps.setIsDraggingCanvas(true);
      canvasOps.setDragStart({ x: screenX, y: screenY });
      selection.clearAllSelections();
    }
  }, [
    activeTool, screenToCanvas, elementsManager.elements,
    selection, handleElementResizeStart, handleElementDragStart, canvasOps,
    startTextEditing
  ]);

  const handleCanvasMouseMove = useCallback(throttle((e) => {
    if (resizingElement) {
      handleElementResize(e);
    } else if (draggingElement) {
      handleElementDrag(e);
    } else if (canvasOps.isDraggingCanvas) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const deltaX = screenX - canvasOps.dragStart.x;
      const deltaY = screenY - canvasOps.dragStart.y;
      
      canvasOps.setCanvasPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      canvasOps.setDragStart({ x: screenX, y: screenY });
    }
  }, 16), [
    resizingElement, draggingElement, canvasOps.isDraggingCanvas,
    handleElementResize, handleElementDrag, canvasOps
  ], { leading: true });

  const handleCanvasMouseUp = useCallback((e) => {
    if (resizingElement) {
      handleElementResizeEnd();
    } else if (draggingElement) {
      handleElementDragEnd();
    }
    
    canvasOps.setIsDraggingCanvas(false);
    setIsSelecting(false);
  }, [
    resizingElement, draggingElement,
    handleElementResizeEnd, handleElementDragEnd, canvasOps
  ]);

  // Helper functions
  const getResizeHandleAtPoint = (element, point) => {
    const handles = [
      { type: 'top-left', x: element.x, y: element.y },
      { type: 'top-right', x: element.x + element.width, y: element.y },
      { type: 'bottom-left', x: element.x, y: element.y + element.height },
      { type: 'bottom-right', x: element.x + element.width, y: element.y + element.height }
    ];

    const handleSize = 8 / canvasOps.scale;
    
    for (const handle of handles) {
      if (Math.abs(point.x - handle.x) < handleSize && 
          Math.abs(point.y - handle.y) < handleSize) {
        return handle.type;
      }
    }
    
    return null;
  };

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    // Tool shortcuts
    if (!e.ctrlKey && !e.metaKey && TOOL_SHORTCUTS[e.key]) {
      setActiveTool(TOOL_SHORTCUTS[e.key]);
      e.preventDefault();
      return;
    }

    // Delete selected elements
    if ((e.key === 'Delete' || e.key === 'Backspace') && selection.selectedElements.length > 0) {
      deleteSelectedElements();
      e.preventDefault();
    }

    // Duplicate with Ctrl/Cmd + D
    if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selection.selectedElements.length > 0) {
      elementsManager.duplicateElements(selection.selectedElements);
      e.preventDefault();
    }

    // Select all with Ctrl/Cmd + A
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      selection.setSelectedElements(elementsManager.elements.map(el => el.id));
      e.preventDefault();
    }

    // Escape to clear selection
    if (e.key === 'Escape') {
      selection.clearAllSelections();
    }
  }, [selection, elementsManager.elements, deleteSelectedElements]);

  // Enhanced rendering
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    if (showGridLines) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      const gridSize = 20 * canvasOps.scale;
      
      for (let x = canvasOps.canvasPosition.x % gridSize; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = canvasOps.canvasPosition.y % gridSize; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.translate(canvasOps.canvasPosition.x, canvasOps.canvasPosition.y);
    ctx.scale(canvasOps.scale, canvasOps.scale);

    // Draw elements
    const sortedElements = [...elementsManager.elements].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedElements.forEach(element => {
      if (!element.visible) return;

      ctx.save();
      ctx.translate(element.x, element.y);
      
      const isSelected = selection.isElementSelected(element.id);

      // Draw element based on type
      switch (element.type) {
        case ELEMENT_TYPES.TEXT:
          ctx.fillStyle = element.style.textColor || '#000000';
          ctx.font = `${element.style.fontWeight || 'normal'} ${element.style.fontSize || 16}px ${element.style.fontFamily || 'Inter'}`;
          ctx.textAlign = element.style.textAlign || 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(element.content || 'Text', 0, 0);
          break;
        
        case ELEMENT_TYPES.IMAGE:
          if (element.src) {
            // Draw image placeholder
            ctx.fillStyle = '#f3f4f6';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.fillRect(0, 0, element.width, element.height);
            ctx.strokeRect(0, 0, element.width, element.height);
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('Image', element.width / 2, element.height / 2);
          }
          break;
        
        case ELEMENT_TYPES.ICON:
          if (element.iconData) {
            ctx.fillStyle = element.color || '#000000';
            // Simple icon rendering
            ctx.fillRect(0, 0, element.width, element.height);
          }
          break;
        
        case ELEMENT_TYPES.FRAME:
          ctx.fillStyle = element.style.fill || '#f8fafc';
          ctx.strokeStyle = element.style.stroke || '#e2e8f0';
          ctx.lineWidth = element.style.strokeWidth || 2;
          ctx.fillRect(0, 0, element.width, element.height);
          ctx.strokeRect(0, 0, element.width, element.height);
          break;
        
        case ELEMENT_TYPES.RECTANGLE:
          if (element.style.fill !== 'none') {
            ctx.fillStyle = element.style.fill;
            ctx.fillRect(0, 0, element.width, element.height);
          }
          if (element.style.stroke !== 'none') {
            ctx.strokeStyle = element.style.stroke;
            ctx.lineWidth = element.style.strokeWidth;
            ctx.strokeRect(0, 0, element.width, element.height);
          }
          break;
        
        default:
          break;
      }

      // Draw selection
      if (isSelected) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
        ctx.setLineDash([]);

        // Draw resize handles
        ctx.fillStyle = '#3b82f6';
        const handleSize = 6;
        ctx.fillRect(-handleSize/2, -handleSize/2, handleSize, handleSize);
        ctx.fillRect(element.width - handleSize/2, -handleSize/2, handleSize, handleSize);
        ctx.fillRect(-handleSize/2, element.height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(element.width - handleSize/2, element.height - handleSize/2, handleSize, handleSize);
      }

      ctx.restore();
    });

    ctx.restore();
  }, [
    canvasOps.canvasPosition, canvasOps.scale, showGridLines,
    elementsManager.elements, selection.isElementSelected
  ]);

  // Effects
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    const handleKeyDownWrapper = (e) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyDownWrapper);
    return () => window.removeEventListener('keydown', handleKeyDownWrapper);
  }, [handleKeyDown]);

  // Layers Panel Component
  const LayersPanel = () => (
    <div className="space-y-1">
      {elementsManager.elements.map((element) => (
        <div
          key={element.id}
          className={`p-2 rounded cursor-pointer text-xs ${
            selection.selectedElements.includes(element.id) ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'
          }`}
          onClick={() => {
            selection.setSelectedElements([element.id]);
            selection.setSelectedTable(null);
          }}
        >
          <div className="font-medium">{element.name}</div>
          <div className="text-gray-500 truncate">
            {element.type} • {Math.round(element.x)}, {Math.round(element.y)}
          </div>
        </div>
      ))}
    </div>
  );

  // Toolbar Component
  const Toolbar = () => (
    <div className="bg-white border-b border-gray-200 p-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Left side - Tools */}
          <div className="flex items-center space-x-1 border-r pr-4">
            <button
              onClick={() => setActiveTool(ELEMENT_TYPES.SELECT)}
              className={`p-2 rounded ${
                activeTool === ELEMENT_TYPES.SELECT ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              title="Select (V)"
            >
              <CursorIcon />
            </button>
            
            <button
              onClick={() => addElementToCanvas(ELEMENT_TYPES.FRAME)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Frame (F)"
            >
              <FrameIcon />
            </button>
            
            <button
              onClick={() => addElementToCanvas(ELEMENT_TYPES.RECTANGLE)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Rectangle (R)"
            >
              <RectangleIcon />
            </button>
            
            <button
              onClick={() => addElementToCanvas(ELEMENT_TYPES.CIRCLE)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Circle (O)"
            >
              <CircleIcon />
            </button>
            
            <button
              onClick={() => addElementToCanvas(ELEMENT_TYPES.TEXT)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Text (T)"
            >
              <TextIcon />
            </button>

            <button
              onClick={() => setShowImageSearch(true)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Image (I)"
            >
              <ImageIcon />
            </button>

            <button
              onClick={() => setShowIconSearch(true)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Icons"
            >
              <IconIcon />
            </button>
          </div>

          {/* Center - Actions */}
          {selection.selectedElements.length > 0 && (
            <div className="flex items-center space-x-1 border-r pr-4">
              <button
                onClick={() => elementsManager.duplicateElements(selection.selectedElements)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Duplicate (Ctrl+D)"
              >
                <DuplicateIcon />
              </button>
              
              <button
                onClick={deleteSelectedElements}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                title="Delete (Del)"
              >
                <DeleteIcon />
              </button>
              
              <button
                onClick={() => elementsManager.bringToFront(selection.selectedElements)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Bring to Front"
              >
                <BringToFrontIcon />
              </button>

              <button
                onClick={() => elementsManager.sendToBack(selection.selectedElements)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                title="Send to Back"
              >
                <SendToBackIcon />
              </button>
            </div>
          )}

          {/* Right - View Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={elementsManager.undo}
              disabled={!elementsManager.canUndo}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              <UndoIcon />
            </button>

            <button
              onClick={elementsManager.redo}
              disabled={!elementsManager.canRedo}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              title="Redo (Ctrl+Shift+Z)"
            >
              <RedoIcon />
            </button>

            <button
              onClick={() => canvasOps.zoomToFit(elementsManager.elements, tablesManager.tables)}
              className="p-2 bg-gray-200 rounded hover:bg-gray-300"
              title="Zoom to Fit"
            >
              <ZoomToFitIcon />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={canvasOps.zoomOut}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <span className="text-sm">{Math.round(canvasOps.scale * 100)}%</span>
          <button
            onClick={canvasOps.zoomIn}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            +
          </button>
          <button
            onClick={canvasOps.resetZoom}
            className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );

  // Asset Panel Component
  const AssetPanel = () => (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4">Assets</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Images</h4>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
          >
            <UploadIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Upload Image</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        <div>
          <h4 className="font-medium mb-2">Icons</h4>
          <button
            onClick={() => setShowIconSearch(true)}
            className="w-full p-3 border border-gray-300 rounded-lg hover:border-blue-500 text-center"
          >
            <SearchIcon className="w-6 h-6 mx-auto mb-2" />
            <span className="text-sm">Search Icons</span>
          </button>
        </div>

        <div>
          <h4 className="font-medium mb-2">Recent Colors</h4>
          <div className="grid grid-cols-5 gap-2">
            {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'].map(color => (
              <button
                key={color}
                className="w-8 h-8 rounded border"
                style={{ backgroundColor: color }}
                onClick={() => updateSelectedElementsStyle({ fill: color })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Image Search Modal
  const ImageSearchModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 h-4/5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Images</h2>
          <button
            onClick={() => setShowImageSearch(false)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={imageSearchQuery}
              onChange={(e) => setImageSearchQuery(e.target.value)}
              placeholder="Search for images..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={() => searchImages(imageSearchQuery)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {searchResults.map((image) => (
                  <div
                    key={image.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => addImageFromUrl(image.urls.regular, image.alt)}
                  >
                    <img
                      src={image.urls.regular}
                      alt={image.alt}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{image.alt}</p>
                      <p className="text-xs text-gray-500">{image.photographer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Icon Search Modal
  const IconSearchModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 h-4/5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Icons</h2>
          <button
            onClick={() => setShowIconSearch(false)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={iconSearchQuery}
              onChange={(e) => setIconSearchQuery(e.target.value)}
              placeholder="Search for icons..."
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              onClick={() => searchIcons(iconSearchQuery)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-4">
                {iconResults.map((icon, index) => (
                  <button
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
                    onClick={() => addIcon(icon.data, icon.name)}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-8 h-8"
                      fill="currentColor"
                    >
                      <path d={icon.data} />
                    </svg>
                    <span className="text-xs mt-2 truncate w-full text-center">
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex flex-col h-screen bg-gray-100">
        <Toolbar />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Tools & Layers */}
          {showToolbox && (
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Tools</h3>
                <div className="mt-2 space-y-2">
                  <button
                    onClick={() => setShowToolbox(!showToolbox)}
                    className="w-full px-3 py-2 text-left text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {showToolbox ? 'Hide Toolbox' : 'Show Toolbox'}
                  </button>
                  <button
                    onClick={() => setShowLayers(!showLayers)}
                    className="w-full px-3 py-2 text-left text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    {showLayers ? 'Hide Layers' : 'Show Layers'}
                  </button>
                </div>
              </div>
              {showLayers && (
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="font-semibold mb-4">Layers</h3>
                  <LayersPanel />
                </div>
              )}
            </div>
          )}

          {/* Canvas Area */}
          <div className="flex-1 relative overflow-hidden bg-gray-50">
            <canvas
              ref={canvasRef}
              width={window.innerWidth - (showToolbox ? 256 : 0) - (showAssetPanel ? 320 : 0)}
              height={window.innerHeight - 120}
              className="absolute cursor-crosshair"
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
            />

            {/* Text Input for Editing */}
            {editingTextElement && (
              <textarea
                ref={textInputRef}
                value={textEditValue}
                onChange={(e) => setTextEditValue(e.target.value)}
                onBlur={saveTextEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    saveTextEdit();
                  } else if (e.key === 'Escape') {
                    setEditingTextElement(null);
                    setTextEditValue('');
                  }
                }}
                style={{
                  position: 'fixed',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  width: '400px',
                  height: '200px',
                  padding: '12px',
                  border: '2px solid #3b82f6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontFamily: 'Arial',
                  resize: 'none',
                  outline: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </div>

          {/* Right Panels */}
          {showAssetPanel && <AssetPanel />}
        </div>

        {/* Modals */}
        {showImageSearch && <ImageSearchModal />}
        {showIconSearch && <IconSearchModal />}

        {/* Status Bar */}
        <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>
              {selection.selectedElements.length > 0 && (
                <span>
                  Selected: {selection.selectedElements.length} element{selection.selectedElements.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div>
              Tool: {activeTool} | 
              Elements: {elementsManager.elements.length} | 
              Scale: {Math.round(canvasOps.scale * 100)}%
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DocumentEditor;