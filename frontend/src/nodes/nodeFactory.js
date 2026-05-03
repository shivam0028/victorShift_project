import { BaseNode } from './BaseNode';
import { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

/**
 * Node Factory
 * Creates node components with pre-configured settings
 */

export const createNodeComponent = (config) => {
  return ({ id, data }) => {
    return <BaseNode id={id} data={data} type={config.type} config={config} />;
  };
};

/**
 * Pre-configured node types
 */

export const InputNode = createNodeComponent({
  type: 'input',
  title: 'Input',
  fields: [
    {
      name: 'inputName',
      label: 'Name',
      type: 'text',
      defaultValue: 'input_1'
    },
    {
      name: 'inputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: ['Text', 'File', 'Number', 'Boolean']
    }
  ],
  outputHandles: [
    {
      id: 'value',
      position: 'right',
      label: 'Value'
    }
  ]
});

export const OutputNode = createNodeComponent({
  type: 'output',
  title: 'Output',
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      defaultValue: 'output_1'
    },
    {
      name: 'outputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: ['Text', 'File', 'Image', 'Json']
    }
  ],
  inputHandles: [
    {
      id: 'value',
      position: 'left',
      label: 'Input'
    }
  ]
});

export const LLMNode = createNodeComponent({
  type: 'llm',
  title: 'LLM',
  subtitle: 'Language Model',
  fields: [
    {
      name: 'model',
      label: 'Model',
      type: 'select',
      defaultValue: 'GPT-4',
      options: ['GPT-4', 'GPT-3.5', 'Claude', 'Llama']
    },
    {
      name: 'temperature',
      label: 'Temperature',
      type: 'number',
      defaultValue: 0.7
    }
  ],
  inputHandles: [
    {
      id: 'system',
      position: 'left',
      label: 'System',
      style: { top: '33%' }
    },
    {
      id: 'prompt',
      position: 'left',
      label: 'Prompt',
      style: { top: '67%' }
    }
  ],
  outputHandles: [
    {
      id: 'response',
      position: 'right',
      label: 'Response'
    }
  ]
});

/**
 * Enhanced TextNode with:
 * 1. Auto-resize based on text content
 * 2. Variable binding with {{variableName}} syntax
 */
export const TextNode = ({ id, data }) => {
  const deleteNode = useStore((state) => state.deleteNode);
  const [currText, setCurrText] = useState(data?.text || '{{input}}');
  const [height, setHeight] = useState(80);
  const [variables, setVariables] = useState([]);

  // Extract variables from text in {{variableName}} format
  useEffect(() => {
    const variablePattern = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
    const matches = [...currText.matchAll(variablePattern)];
    const uniqueVars = [...new Set(matches.map(m => m[1]))];
    setVariables(uniqueVars);
  }, [currText]);

  const handleTextChange = (e) => {
    const textarea = e.target;
    setCurrText(textarea.value);
    
    // Auto-resize: adjust height based on scroll height
    textarea.style.height = 'auto';
    const newHeight = Math.min(Math.max(textarea.scrollHeight, 60), 200);
    setHeight(newHeight);
  };

  return (
    <div 
      className="base-node base-node--text"
      style={{
        width: 250,
        minHeight: Math.max(height + 80, 150),
      }}
    >
      {/* Variable Input Handles */}
      {variables.map((varName, idx) => {
        // Scalable spacing: clamp handle spacing to prevent overlap
        const spacing = Math.min(30, 120 / variables.length);
        return (
          <Handle
            key={`var-${varName}`}
            type="target"
            position={Position.Left}
            id={`${id}-${varName}`}
            className="node-handle"
            style={{ top: `${40 + idx * spacing}px` }}
            title={`Variable: ${varName}`}
          />
        );
      })}

      <div className="node-header">
        <div className="node-title-section">
          <div className="node-title">Text</div>
          {variables.length > 0 && (
            <div className="node-subtitle">
              {variables.length} variable{variables.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        <button
          className="node-delete-btn"
          onClick={() => deleteNode(id)}
          title="Delete node"
        >
          x
        </button>
      </div>

      <div className="node-fields">
        <label className="node-field-label">Content</label>
        <textarea
          value={currText}
          onChange={handleTextChange}
          className="node-field-textarea"
          style={{ height: `${height}px`, resize: 'none' }}
          placeholder="Enter text with variables like {{variableName}}"
        />
        {variables.length > 0 && (
          <div className="node-variable-list">
            <strong>Variables:</strong> {variables.join(', ')}
          </div>
        )}
      </div>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-output`}
        className="node-handle"
      />
    </div>
  );
};
