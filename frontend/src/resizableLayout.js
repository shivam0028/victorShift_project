// resizableLayout.js
import React, { useState, useRef, useEffect } from 'react';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';

export const ResizableLayout = () => {
  const [canvasHeight, setCanvasHeight] = useState(70); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(null); // null, 'canvas', or 'panel'
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const newCanvasHeight = ((e.clientY - rect.top) / rect.height) * 100;

      // Keep canvas between 20% and 80% of container
      if (newCanvasHeight > 20 && newCanvasHeight < 80) {
        setCanvasHeight(newCanvasHeight);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Reset to default 70/30 split
  const resetLayout = () => {
    setCanvasHeight(70);
  };

  // Full-screen canvas
  const toggleCanvasFullscreen = () => {
    setFullscreenMode(fullscreenMode === 'canvas' ? null : 'canvas');
  };

  // Full-screen panel
  const togglePanelFullscreen = () => {
    setFullscreenMode(fullscreenMode === 'panel' ? null : 'panel');
  };

  if (fullscreenMode === 'canvas') {
    return (
      <div className="fullscreen-layout">
        <div className="fullscreen-canvas-wrapper">
          <div className="fullscreen-controls">
            <button 
              className="fullscreen-button"
              onClick={toggleCanvasFullscreen}
              title="Exit fullscreen"
            >
              ↙ Split View
            </button>
          </div>
          <PipelineUI />
          <SubmitButton />
        </div>
      </div>
    );
  }

  if (fullscreenMode === 'panel') {
    return (
      <div className="fullscreen-layout">
        <div className="fullscreen-panel-wrapper">
          <div className="fullscreen-controls">
            <button 
              className="fullscreen-button"
              onClick={togglePanelFullscreen}
              title="Exit fullscreen"
            >
              ↙ Split View
            </button>
          </div>
          <SubmitButton fullscreenMode={true} />
        </div>
      </div>
    );
  }

  return (
    <div className="resizable-layout" ref={containerRef}>
      {/* Canvas Section */}
      <div 
        className="layout-section canvas-section"
        style={{ height: `${canvasHeight}%` }}
      >
        <div className="section-header canvas-header">
          <span>🖼️ Canvas</span>
          <button 
            className="section-control-btn"
            onClick={toggleCanvasFullscreen}
            title="Canvas fullscreen"
          >
            ⛶
          </button>
        </div>
        <PipelineUI />
      </div>

      {/* Draggable Divider */}
      <div 
        className="divider"
        onMouseDown={handleMouseDown}
        onDoubleClick={resetLayout}
        title="Drag to resize | Double-click to reset"
      >
        <div className="divider-handle">
          <span className="divider-text">⋯</span>
        </div>
      </div>

      {/* Panel Section */}
      <div 
        className="layout-section panel-section"
        style={{ height: `${100 - canvasHeight}%` }}
      >
        <div className="section-header panel-header">
          <span>📊 Pipeline Info</span>
          <button 
            className="section-control-btn"
            onClick={togglePanelFullscreen}
            title="Panel fullscreen"
          >
            ⛶
          </button>
        </div>
        <SubmitButton />
      </div>
    </div>
  );
};
