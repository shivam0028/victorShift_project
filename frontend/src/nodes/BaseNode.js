import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';
import '../styles/nodes.css';

/**
 * Position mapper - converts string positions to ReactFlow Position enum
 */
const getPosition = (positionString) => {
  const positionMap = {
    'left': Position.Left,
    'right': Position.Right,
    'top': Position.Top,
    'bottom': Position.Bottom,
  };
  return positionMap[positionString] || Position.Right;
};

/**
 * BaseNode - A reusable node component factory
 * Eliminates code duplication across different node types
 * 
 * @param {string} id - Node ID
 * @param {object} data - Node data
 * @param {string} type - Node type (determines styling and behavior)
 * @param {object} config - Node configuration object with:
 *   - title: Display name (e.g., "Input", "Output")
 *   - subtitle: Optional subtitle
 *   - fields: Array of field configs [{label, type, defaultValue, options}]
 *   - inputHandles: Array of input handle configs [{position, id, label}]
 *   - outputHandles: Array of output handle configs [{position, id, label}]
 *   - onFieldChange: Optional callback when fields change
 */
export const BaseNode = ({ 
  id, 
  data, 
  type,
  config = {} 
}) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const updateNodeField = useStore((state) => state.updateNodeField);
  const {
    title = 'Node',
    subtitle = null,
    fields = [],
    inputHandles = [],
    outputHandles = [],
    onFieldChange = null,
    minWidth = 200,
    minHeight = 80,
    variant = 'default'
  } = config;

  const [fieldValues, setFieldValues] = useState(() => {
    const initial = {};
    fields.forEach(field => {
      initial[field.name] = data?.[field.name] ?? field.defaultValue;
    });
    return initial;
  });

  const handleFieldChange = (fieldName, value) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    updateNodeField(id, fieldName, value); // 🔥 Sync with global store
    if (onFieldChange) {
      onFieldChange(fieldName, value);
    }
  };

  return (
    <div 
      className={`base-node base-node--${variant} base-node--${type}`}
      style={{
        width: minWidth,
        minHeight: minHeight,
      }}
    >
      {/* Input Handles */}
      {inputHandles.map((handle, idx) => (
        <Handle
          key={`input-${idx}`}
          type="target"
          position={getPosition(handle.position)}
          id={handle.id}
          className="node-handle"
          style={handle.style || {}}
        />
      ))}

      {/* Header */}
      <div className="node-header">
        <div className="node-title-section">
          <div className="node-title">{title}</div>
          {subtitle && <div className="node-subtitle">{subtitle}</div>}
        </div>
        <button 
          className="node-delete-btn"
          onClick={() => deleteNode(id)}
          title="Delete node"
        >
          ✕
        </button>
      </div>

      {/* Fields */}
      {fields.length > 0 && (
        <div className="node-fields">
          {fields.map(field => (
            <div key={field.name} className="node-field">
              <label className="node-field-label">{field.label}</label>
              {field.type === 'text' && (
                <input
                  type="text"
                  value={fieldValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="node-field-input"
                />
              )}
              {field.type === 'textarea' && (
                <textarea
                  value={fieldValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="node-field-textarea"
                  rows={field.rows || 4}
                />
              )}
              {field.type === 'select' && (
                <select
                  value={fieldValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="node-field-select"
                >
                  {field.options.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              )}
              {field.type === 'number' && (
                <input
                  type="number"
                  value={fieldValues[field.name]}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="node-field-input"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Output Handles */}
      {outputHandles.map((handle, idx) => (
        <Handle
          key={`output-${idx}`}
          type="source"
          position={getPosition(handle.position)}
          id={handle.id}
          className="node-handle"
          style={handle.style || {}}
        />
      ))}
    </div>
  );
};
