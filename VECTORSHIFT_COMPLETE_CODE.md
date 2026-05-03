# 🎯 VectorShift - Complete Beginner's Guide
## Understanding Every Part of the Code (Like You're 5 Years Old!)

---

# 📖 PART 1: WHAT IS VECTORSHIFT? 

Imagine you have a **LEGO factory** where:
- Each LEGO piece is a **NODE** (like Input, Output, Calculator, Database)
- You can **drag and drop** nodes onto a canvas
- You can **connect** them with lines (edges)
- When you click **"Submit Pipeline"**, it checks if your connections make sense

**VectorShift does exactly this!** It's a visual tool to build **pipelines** (chains of operations) without writing code.

---

# 🏗️ PART 2: HOW THE PROJECT IS ORGANIZED

```
VectorShift/
├── frontend/          ← The pretty page you see (React)
│   ├── src/
│   │   ├── App.js                 ← Main entry point
│   │   ├── store.js               ← The memory of the app (Zustand)
│   │   ├── ui.js                  ← The canvas where you drag nodes
│   │   ├── submit.js              ← The submit button
│   │   ├── toolbar.js             ← The toolbar with node buttons
│   │   ├── draggableNode.js       ← Makes nodes draggable
│   │   ├── resizableLayout.js    ← Split screen control
│   │   ├── nodes/
│   │   │   ├── BaseNode.js        ← Template for all nodes
│   │   │   ├── nodeFactory.js     ← Creates Input, LLM, Output, Text nodes
│   │   │   └── demonstrationNodes.js ← Creates Calculator, Database, etc.
│   │   └── styles/                ← CSS for styling
│   └── package.json               ← List of tools (libraries)
│
└── backend/           ← The brain (Python with FastAPI)
    └── main.py        ← Handles data and validation
```

---

# 🎨 PART 3: FRONTEND FILES EXPLAINED (THE PRETTY SIDE)

## 1️⃣ **App.js** - The Entry Point (The Main Door)

### What It Does:
- This is the **first file that runs** when you open the website
- It's like the main door of a building - everything starts here
- It handles the dark mode (light/dark theme)

### Code Breakdown:
```javascript
import { PipelineToolbar } from './toolbar';           // Import the toolbar
import { ResizableLayout } from './resizableLayout';  // Import the layout
import { useStore } from './store';                   // Import memory
import { useEffect } from 'react';                    // Import React feature

function App() {
  // Get the darkMode state from memory
  const darkMode = useStore((state) => state.darkMode);
  
  // Function to change dark mode
  const setDarkMode = useStore((state) => state.setDarkMode);

  // When page loads, check if user saved dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, [setDarkMode]);

  // Apply dark mode if enabled
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');  // Add dark CSS
    } else {
      document.documentElement.classList.remove('dark-mode'); // Remove dark CSS
    }
  }, [darkMode]);

  // Render the main components
  return (
    <div className="app-container">
      <PipelineToolbar />      {/* Show the toolbar */}
      <ResizableLayout />      {/* Show the canvas and panel */}
    </div>
  );
}

export default App;
```

### Why This Matters:
- ✅ Organizes everything
- ✅ Manages the dark/light theme
- ✅ Saves your preference using `localStorage` (the browser's memory)

---

## 2️⃣ **store.js** - The Memory (Zustand Store)

### What It Does:
Think of it like the **brain of the app**. It remembers:
- All the nodes you added
- All the connections (edges)
- The dark mode setting
- Functions to update information

### Why We Use Zustand:
Zustand is a **state management library** - it's like having a notebook where everyone can read and write:
- Fast ⚡ (doesn't make the app slow)
- Simple 🎯 (easy to understand)
- Not complicated like Context API ❌

### Code Breakdown:
```javascript
import { create } from "zustand";

// Create a store (the brain)
export const useStore = create((set, get) => ({
    
    // ===== DATA (What the brain remembers) =====
    nodes: [],           // Empty list of nodes at start
    edges: [],           // Empty list of connections at start
    darkMode: false,     // Dark mode is OFF at start
    nodeIDs: {},         // Counter for creating unique node IDs

    // ===== FUNCTIONS (What the brain can do) =====
    
    // Set dark mode on/off
    setDarkMode: (darkMode) => {
      set({ darkMode });
      localStorage.setItem('darkMode', String(darkMode));  // Save to browser memory
    },

    // Toggle (flip) dark mode
    toggleDarkMode: () => {
      const nextDarkMode = !get().darkMode;  // Get current and flip it
      set({ darkMode: nextDarkMode });
      localStorage.setItem('darkMode', String(nextDarkMode));
    },

    // Create unique ID for each node
    getNodeID: (type) => {
        const newIDs = {...get().nodeIDs};
        if (newIDs[type] === undefined) {
            newIDs[type] = 0;
        }
        newIDs[type] += 1;
        set({nodeIDs: newIDs});
        return `${type}-${newIDs[type]}`;  // Returns "input-1", "llm-2", etc.
    },

    // Add a new node to the list
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]  // Add node to the list
        });
    },

    // Update a specific field in a node
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };  // Change the field
          }
          return node;
        }),
      });
    },

    // Delete a node and its connections
    deleteNode: (nodeId) => {
      set({
        nodes: get().nodes.filter((node) => node.id !== nodeId),  // Remove the node
        edges: get().edges.filter((edge) => 
          edge.source !== nodeId && edge.target !== nodeId  // Remove connected edges
        ),
      });
    },
  }));
```

### Simple Translation:
- **nodes** = List of all LEGO pieces on the canvas
- **edges** = List of all lines connecting pieces
- **darkMode** = Light or dark theme
- **updateNodeField** = When you type something in a node, save it to memory 🔥
- **deleteNode** = When you click delete, remove the node AND all lines connected to it

---

## 3️⃣ **ui.js** - The Canvas (Where You Drag Nodes)

### What It Does:
This is the **white area** where you see and drag nodes. It uses **ReactFlow** (a library for drawing flowcharts).

### How It Works (Step by Step):

#### Step 1: Drag Over Canvas
```
User starts dragging a node button → onDragOver() runs
→ Sets cursor to "move"
```

#### Step 2: Drop Node
```
User drops the node → onDrop() runs
→ Gets the position where they dropped
→ Gets the node type from the drag data
→ Creates a new node object
→ Adds it to memory via addNode()
```

#### Step 3: Canvas Renders
```
React sees nodes changed in memory
→ Re-renders the canvas
→ Shows the new node at that position
```

### Code Breakdown:
```javascript
import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';

// Tell ReactFlow what each node type looks like
const nodeTypes = {
  customInput: InputNode,      // When type="customInput", show InputNode
  llm: LLMNode,                // When type="llm", show LLMNode
  customOutput: OutputNode,
  text: TextNode,
  calculator: CalculatorNode,
  database: DatabaseNode,
  // ... more types
};

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);  // Reference to the canvas div
    const [reactFlowInstance, setReactFlowInstance] = useState(null);  // The canvas object
    
    // Get data from memory
    const {
      nodes,           // All nodes currently on canvas
      edges,           // All connections
      getNodeID,       // Function to create unique IDs
      addNode,         // Function to add new node
      onNodesChange,   // React to node position changes
      onEdgesChange,   // React to edge deletions
      onConnect        // React to new connections
    } = useStore(selector, shallow);

    // When user DROPS a node
    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          // Get the canvas position
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          
          // Get the node type from draggable item
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // If no type, stop
            if (typeof type === 'undefined' || !type) return;
      
            // Calculate position where user dropped
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            // Create new node
            const nodeID = getNodeID(type);  // Get unique ID like "input-1"
            const newNode = {
              id: nodeID,
              type,
              position,
              data: { id: nodeID, nodeType: type },
            };
      
            // Add to memory (this triggers re-render)
            addNode(newNode);
          }
        },
        [addNode, getNodeID, reactFlowInstance]
    );

    // When user DRAGS over canvas
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';  // Show "move" cursor
    }, []);

    return (
        <div ref={reactFlowWrapper} className="pipeline-canvas-container">
            <ReactFlow
                nodes={nodes}                    {/* Show these nodes */}
                edges={edges}                    {/* Show these connections */}
                onNodesChange={onNodesChange}    {/* When node moves, update */}
                onEdgesChange={onEdgesChange}    {/* When edge deletes, update */}
                onConnect={onConnect}            {/* When connected, create edge */}
                onDrop={onDrop}                  {/* When dropped, create node */}
                onDragOver={onDragOver}          {/* Allow dragging */}
                onInit={setReactFlowInstance}    {/* Get canvas object */}
                nodeTypes={nodeTypes}            {/* Tell it what node types exist */}
                connectionLineType='smoothstep'  {/* Curved connection lines */}
            >
                <Background color="#aaa" gap={20} />  {/* Grid background */}
                <Controls />                           {/* Zoom controls */}
                <MiniMap />                            {/* Mini map in corner */}
            </ReactFlow>
        </div>
    )
}
```

### Simple Translation:
- **ReactFlow** = Magic library that draws flowcharts
- **onDrop** = "User dropped a node, create it!"
- **onConnect** = "User connected two nodes, draw a line!"
- **Background/Controls/MiniMap** = Extra features

---

## 4️⃣ **submit.js** - The Submit Button (The Magic Wand)

### What It Does:
When you click "Submit Pipeline", this file:
1. Takes all your nodes and connections
2. Sends them to the backend (Python server)
3. Gets back validation results (is it a valid DAG?)
4. Shows a colored message (green = good, red = bad)

### Step by Step:

```
1. User clicks "Submit Pipeline"
   ↓
2. handleSubmit() runs
   ↓
3. Check if pipeline is empty
   ├─ YES: Show warning → STOP
   └─ NO: Continue
   ↓
4. Show "Loading..." spinner
   ↓
5. Create JSON data: {nodes: [...], edges: [...]}
   ↓
6. Send to backend: fetch('http://127.0.0.1:8000/pipelines/parse', {
     method: 'POST',
     body: JSON.stringify({nodes, edges})
   })
   ↓
7. Wait for response from backend...
   ↓
8. Get response: {num_nodes: 5, num_edges: 4, is_dag: true, ...}
   ↓
9. Show alert with:
     - Green border if is_dag = true ✓
     - Red border if is_dag = false ✗
   ↓
10. Hide "Loading..." spinner
```

### Code Breakdown:
```javascript
import { useState } from 'react';
import { useStore } from './store';

export const SubmitButton = ({ fullscreenMode = false }) => {
    const [loading, setLoading] = useState(false);     // Is it loading?
    const [alert, setAlert] = useState(null);          // Show alert message?
    
    // Get nodes and edges from memory
    const { nodes, edges } = useStore((state) => ({ 
      nodes: state.nodes, 
      edges: state.edges 
    }));

    const handleSubmit = async () => {
        // Check if empty
        if (nodes.length === 0 && edges.length === 0) {
            setAlert({
                title: '⚠️ Empty Pipeline',
                message: 'Please add some nodes first.',
            });
            return;
        }

        setLoading(true);  // Show "Loading..." spinner
        try {
            // Send to backend (Python server)
            const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
                method: 'POST',                    // Send data (not just request)
                headers: {
                    'Content-Type': 'application/json',  // Format: JSON
                },
                body: JSON.stringify({             // Convert to JSON text
                    nodes: nodes,                  // Send all nodes
                    edges: edges,                  // Send all connections
                }),
            });

            // Check if request worked
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the response from backend
            const data = await response.json();
            
            // Show success message with response info
            setAlert({
                title: '✅ Pipeline Validated',
                message: 'Your pipeline has been successfully analyzed.',
                numNodes: data.num_nodes,
                numEdges: data.num_edges,
                isDag: data.is_dag,               // Is it a valid DAG?
            });
        } catch (error) {
            console.error('Error:', error);
            // Show error message
            setAlert({
                title: '❌ Error',
                message: `Failed to submit: ${error.message}`,
                error: true
            });
        } finally {
            setLoading(false);  // Hide spinner
        }
    };

    // Close the alert message
    const closeAlert = () => {
        setAlert(null);
    };

    return (
        <>
            {/* Submit Button */}
            <button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : '✓ Submit Pipeline'}
            </button>

            {/* Alert Message (with color feedback) */}
            {alert && (
                <div className="alert-dialog" style={{
                    borderLeft: `6px solid ${
                        alert.error ? '#ff6b6b' :           // Red for error
                        (alert.isDag ? '#51cf66' : '#ff6b6b')  // Green for valid, Red for invalid
                    }`
                }}>
                    <div className="alert-title">{alert.title}</div>
                    <div className="alert-content">{alert.message}</div>
                    
                    {!alert.error && (
                        <div>
                            <div className="alert-stat">
                                <span>Total Nodes</span>
                                <span>{alert.numNodes}</span>
                            </div>
                            <div className="alert-stat">
                                <span>Total Edges</span>
                                <span>{alert.numEdges}</span>
                            </div>
                            <div className="alert-stat">
                                <span>Is Valid DAG?</span>
                                <span style={{
                                    color: alert.isDag ? '#51cf66' : '#ff6b6b',  // Color coded!
                                    fontWeight: 'bold'
                                }}>
                                    {alert.isDag ? '✓ Valid (No Cycles)' : '✗ Invalid (Has Cycles)'}
                                </span>
                            </div>
                        </div>
                    )}

                    <button onClick={closeAlert}>Close</button>
                </div>
            )}
        </>
    );
}
```

### Key Concepts:

#### What is `async/await`?
```javascript
const response = await fetch(...);  // Wait for response
const data = await response.json(); // Wait for parsing
```
- `async` = "This function waits for things"
- `await` = "Wait for this to finish"
- It's like: "Send package, wait for response, then continue"

#### What is `fetch()`?
```javascript
fetch('http://127.0.0.1:8000/pipelines/parse', {
  method: 'POST',        // Tell server we're SENDING data
  body: JSON.stringify({nodes, edges})  // The data
})
```
- `fetch()` = Send an HTTP request to the server
- `method: 'POST'` = We're sending data (not just asking)
- Waits for response

---

## 5️⃣ **toolbar.js** - The Draggable Buttons

### What It Does:
Shows buttons at the top that you can drag onto the canvas.

```javascript
import { DraggableNode } from './draggableNode';

export const PipelineToolbar = () => {
    return (
        <div className="toolbar">
            <h1>🔗 VectorShift</h1>
            
            {/* Draggable node buttons */}
            <DraggableNode type="customInput" label="📥 Input" />
            <DraggableNode type="llm" label="🤖 LLM" />
            <DraggableNode type="customOutput" label="📤 Output" />
            <DraggableNode type="text" label="✏️ Text" />
            <DraggableNode type="calculator" label="🧮 Calculator" />
            <DraggableNode type="database" label="🗄️ Database" />
            {/* ... more nodes */}
        </div>
    );
}
```

### Simple Translation:
- Displays all node types available
- Each button is draggable
- When dragged, it triggers node creation on the canvas

---

## 6️⃣ **draggableNode.js** - Make Things Draggable

### What It Does:
Makes the buttons in the toolbar draggable and sends the node type data.

```javascript
export const DraggableNode = ({ type, label }) => {
    const onDragStart = (event, nodeType) => {
      event.target.style.cursor = 'grabbing';  // Change cursor to hand
      
      // Send the node type with the drag data
      event.dataTransfer.setData('application/reactflow', JSON.stringify({
        nodeType  // This tells canvas: "I'm dragging a nodeType"
      }));
      
      event.dataTransfer.effectAllowed = 'move';  // Allow drop
    };
  
    return (
      <button
        className="draggable-node-button"
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        draggable  // Make it draggable
      >
          {label}
      </button>
    );
};
```

### How It Works:

```
User clicks and holds button
  ↓
onDragStart() runs
  ↓
event.dataTransfer.setData() stores the node type
  ↓
User drags across screen
  ↓
Cursor changes to show "move"
  ↓
User releases (drops)
  ↓
Canvas receives nodeType data
  ↓
Canvas creates new node
```

---

## 7️⃣ **nodes/BaseNode.js** - The Template (The Cookie Cutter)

### What It Does:
Instead of coding each node type separately, we created **one template** that works for all nodes. This saves A LOT of code!

### Why We Use It:
Imagine making cookies:
- ❌ Without template: Make each cookie shape by hand (hard, LOTS of code)
- ✅ With template: Use cookie cutter for every shape (easy, less code)

### How It Works:

```
1. A node is created with a CONFIG object (settings)
2. BaseNode receives the config
3. BaseNode renders based on config:
   ├─ Title from config
   ├─ Fields from config (Input boxes, dropdowns, etc.)
   ├─ Input handles from config (dots on left)
   └─ Output handles from config (dots on right)
```

### Code Breakdown:
```javascript
import { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

// Convert string positions to Position enum (required by ReactFlow)
const getPosition = (positionString) => {
  const positionMap = {
    'left': Position.Left,
    'right': Position.Right,
    'top': Position.Top,
    'bottom': Position.Bottom,
  };
  return positionMap[positionString] || Position.Right;
};

export const BaseNode = ({ id, data, type, config = {} }) => {
  // Get functions from memory
  const deleteNode = useStore((state) => state.deleteNode);
  const updateNodeField = useStore((state) => state.updateNodeField);
  
  // Extract config (settings for this node)
  const {
    title = 'Node',
    subtitle = null,
    fields = [],           // Input fields (Name, Type, etc.)
    inputHandles = [],     // Inputs (left side - dots)
    outputHandles = [],    // Outputs (right side - dots)
    minWidth = 200,
    minHeight = 80,
  } = config;

  // Local state for field values
  const [fieldValues, setFieldValues] = useState(() => {
    const initial = {};
    fields.forEach(field => {
      initial[field.name] = data?.[field.name] ?? field.defaultValue;
    });
    return initial;
  });

  // When user types in a field
  const handleFieldChange = (fieldName, value) => {
    // Step 1: Update local state (for UI)
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
    
    // Step 2: Update global memory (CRITICAL!) 🔥
    updateNodeField(id, fieldName, value);
  };

  return (
    <div className={`base-node`}>
      
      {/* Input handles (connection points on left) */}
      {inputHandles.map((handle, idx) => (
        <Handle
          key={`input-${idx}`}
          type="target"              // This accepts connections
          position={getPosition(handle.position)}
          id={handle.id}             // Unique ID for this handle
        />
      ))}

      {/* Header with title */}
      <div className="node-header">
        <div className="node-title">{title}</div>
        {subtitle && <div className="node-subtitle">{subtitle}</div>}
        
        {/* Delete button */}
        <button onClick={() => deleteNode(id)}>✕</button>
      </div>

      {/* Input fields (based on config) */}
      {fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          
          {field.type === 'text' && (
            <input
              type="text"
              value={fieldValues[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          )}
          
          {field.type === 'textarea' && (
            <textarea
              value={fieldValues[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          )}
          
          {field.type === 'select' && (
            <select
              value={fieldValues[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            >
              {field.options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          )}
          
          {field.type === 'number' && (
            <input
              type="number"
              value={fieldValues[field.name]}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      {/* Output handles (connection points on right) */}
      {outputHandles.map((handle, idx) => (
        <Handle
          key={`output-${idx}`}
          type="source"              // This sends connections
          position={getPosition(handle.position)}
          id={handle.id}
        />
      ))}
    </div>
  );
};
```

### Key Concepts:

#### What is a "Handle"?
```
Input Node                    Output Node
    ●━━━━━━━━━━━━━━━━━━━━━┓
    ↑                      ↓
  Handle              Connection (Edge)
```
- **Handle** = Small dot where you can click to connect
- **type="target"** = This handle RECEIVES connections (left side)
- **type="source"** = This handle SENDS connections (right side)

#### The Critical Line 🔥
```javascript
updateNodeField(id, fieldName, value);
```
This line is **SUPER IMPORTANT**! It saves your changes to the global memory so when you submit, the backend gets the right data!

---

## 8️⃣ **nodes/nodeFactory.js** - Making Node Types

### What It Does:
Uses the BaseNode template to quickly create different node types with different configs.

### Code Breakdown:
```javascript
import { BaseNode } from './BaseNode';

// Factory function: Creates a component from a config
export const createNodeComponent = (config) => {
  return ({ id, data }) => {
    return <BaseNode id={id} data={data} type={config.type} config={config} />;
  };
};

// Example 1: INPUT NODE - Takes data in
export const InputNode = createNodeComponent({
  type: 'customInput',
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

// Example 2: LLM NODE - Uses AI
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
      label: 'System'
    },
    {
      id: 'prompt',
      position: 'left',
      label: 'Prompt'
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

// Example 3: OUTPUT NODE - Takes data out
export const OutputNode = createNodeComponent({
  type: 'customOutput',
  title: 'Output',
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      defaultValue: 'output_1'
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
```

### Simple Translation:
- **createNodeComponent()** = "Make a new node type from this config"
- Each config defines:
  - Title (what it's called)
  - Fields (input boxes)
  - Input handles (where connections come in)
  - Output handles (where connections go out)

---

# 🐍 PART 4: BACKEND FILES (THE BRAIN)

## 1️⃣ **main.py** - The Backend Server (Python FastAPI)

### What It Does:
The backend is a **Python server** that:
1. Listens for data from the frontend
2. Validates the pipeline
3. Checks if it's a valid DAG
4. Sends results back

### Why We Use FastAPI:
FastAPI is a **web framework** for Python:
- ⚡ Fast (super quick)
- 📚 Auto docs (explains itself)
- ✅ Modern (uses new Python features)
- 🔒 Secure (good validation)

### How It Works (The Server Journey):

```
1. Frontend sends HTTP POST request to 'http://127.0.0.1:8000/pipelines/parse'
   ↓
2. Server receives request
   ↓
3. FastAPI converts JSON to Python objects (nodes, edges)
   ↓
4. Backend validates:
   ├─ Check: Do edges reference real nodes?
   ├─ Check: Is it a DAG (no cycles)?
   └─ Count: How many invalid edges?
   ↓
5. Convert results to JSON
   ↓
6. Send back to frontend
   ↓
7. Frontend receives and shows results
```

### Code Breakdown:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque

# Create the app (the server)
app = FastAPI()

# Enable CORS (let frontend talk to backend)
# Without this, browser blocks the request!
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow from anywhere
    allow_credentials=True,
    allow_methods=["*"],  # Allow GET, POST, etc.
    allow_headers=["*"],  # Allow any headers
)

# ===== DATA MODELS (What data looks like) =====

class Node(BaseModel):
    """What a node looks like"""
    id: str                      # Unique ID (like "input-1")
    type: str                    # Type: "customInput", "llm", etc.
    position: Dict[str, float]   # x, y coordinates
    data: Dict[str, Any]         # User data (name, model, etc.)

class Edge(BaseModel):
    """What a connection looks like"""
    source: str        # From which node ID
    target: str        # To which node ID
    id: str            # Unique ID for this edge
    animated: bool = False

class Pipeline(BaseModel):
    """What a complete pipeline looks like"""
    nodes: List[Node]  # List of all nodes
    edges: List[Edge]  # List of all connections

# ===== TEST ENDPOINT =====

@app.get('/')
def read_root():
    """Test endpoint - check if server is working"""
    return {'Ping': 'Pong'}
    # When you visit http://127.0.0.1:8000/, you get: {"Ping": "Pong"}

# ===== VALIDATION FUNCTIONS =====

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Check if pipeline is a Directed Acyclic Graph (DAG).
    
    DAG = No loops/cycles
    Example valid: Input → Process → Output ✓
    Example invalid: A → B → C → A (loop!) ✗
    
    Uses Kahn's algorithm (topological sort)
    """
    if not edges:
        return True  # No connections = always valid
    
    # Build a graph (map of connections)
    graph = defaultdict(list)  # { source: [targets...] }
    in_degree = defaultdict(int)  # { node: count_of_incoming_edges }
    
    # Initialize all nodes
    node_ids = {node.id for node in nodes}  # Set of all node IDs
    for node_id in node_ids:
        in_degree[node_id] = 0
    
    # Add edges to graph
    for edge in edges:
        # Safety check: both nodes must exist
        if edge.source in node_ids and edge.target in node_ids:
            graph[edge.source].append(edge.target)  # source → target
            in_degree[edge.target] += 1  # Count incoming edges to target
    
    # Kahn's algorithm: Find and remove nodes with no incoming edges
    queue = deque([
        node_id for node_id in node_ids 
        if in_degree[node_id] == 0  # Nodes with no dependencies
    ])
    sorted_count = 0  # Count of nodes we successfully "removed"
    
    while queue:
        node = queue.popleft()  # Get first node
        sorted_count += 1  # We removed one node
        
        # For each outgoing edge from this node
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1  # One less dependency
            # If neighbor now has no dependencies, add to queue
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # If we removed all nodes, no cycles exist = valid DAG!
    # If we didn't remove all nodes, cycles exist = invalid
    return sorted_count == len(node_ids)

# ===== MAIN ENDPOINT =====

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    """
    The MAIN endpoint that frontend calls
    
    Receives: POST data with {nodes: [...], edges: [...]}
    Returns: JSON {num_nodes, num_edges, is_dag, invalid_edges}
    """
    # Count total nodes and edges
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    
    # Validate: Check for broken edges
    # (edges pointing to nodes that don't exist)
    node_ids = {node.id for node in pipeline.nodes}  # All valid node IDs
    
    invalid_edges = [
        edge for edge in pipeline.edges
        # If source or target don't exist, it's invalid
        if edge.source not in node_ids or edge.target not in node_ids
    ]
    
    # Check if it's a valid DAG (no cycles)
    is_dag_result = is_dag(pipeline.nodes, pipeline.edges)
    
    # Return results as JSON
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag_result,           # True = valid, False = has cycles
        'invalid_edges': len(invalid_edges)  # Count of broken edges
    }
```

### Key Concepts:

#### What is a DAG?
```
Valid DAG:                    Invalid (has cycle):
  A                              A
  ↓                              ↓
  B                              B
  ↓                              ↓
  C ✓                            C
                                 ↓
                                 A ✗ (loop back!)
```

#### Kahn's Algorithm Explained:
```
Step 1: Find nodes with NO dependencies (no incoming edges)
Step 2: Remove them from the graph
Step 3: For each removed node, decrease dependency count of neighbors
Step 4: If any new node now has 0 dependencies, go to Step 2
Step 5: If all nodes removed → No cycles (DAG) ✓
        If some nodes remain → Cycles exist ✗
```

---

# 🔗 PART 5: HOW FRONTEND & BACKEND TALK

## The Communication Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                                                              │
│  1. User clicks "✓ Submit Pipeline"                         │
│     ↓                                                        │
│  2. submit.js: handleSubmit() runs                           │
│     ↓                                                        │
│  3. Create JSON data from memory:                           │
│     {nodes: [...], edges: [...]}                            │
│     ↓                                                        │
│  4. Send HTTP POST request:                                 │
│     fetch('http://127.0.0.1:8000/pipelines/parse', {       │
│       method: 'POST',                                       │
│       body: JSON.stringify({nodes, edges})                  │
│     })                                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                    ━━━ NETWORK ━━━
                    (JSON over HTTP)
                         │
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Python)                         │
│                                                              │
│  5. FastAPI receives POST request                           │
│     ↓                                                        │
│  6. parse_pipeline() function runs:                         │
│     ├─ Validate edges (check nodes exist)                   │
│     ├─ Check if DAG (run is_dag())                          │
│     └─ Count invalid edges                                  │
│     ↓                                                        │
│  7. Return JSON:                                            │
│     {                                                        │
│       num_nodes: 5,                                         │
│       num_edges: 4,                                         │
│       is_dag: true,          ← Valid? No cycles?            │
│       invalid_edges: 0        ← Any broken connections?     │
│     }                                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                         │
                    ━━━ NETWORK ━━━
                    (JSON over HTTP)
                         │
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│                                                              │
│  8. submit.js receives response                             │
│     ↓                                                        │
│  9. Parse response: data = await response.json()            │
│     ↓                                                        │
│ 10. Show alert with colors:                                 │
│     - is_dag: true → 🟢 Green border + "✓ Valid"           │
│     - is_dag: false → 🔴 Red border + "✗ Invalid"          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## API Call Detailed:

```javascript
// Step 1: Create the fetch request
const response = await fetch(
  'http://127.0.0.1:8000/pipelines/parse',  // Backend URL
  {
    method: 'POST',  // Tell server we're SENDING data
    
    headers: {
      'Content-Type': 'application/json',  // Data format is JSON
    },
    
    body: JSON.stringify({               // Convert objects to JSON text
      nodes: nodes,                       // All nodes from memory
      edges: edges,                       // All edges from memory
    }),
  }
);

// Step 2: Check if request was successful
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}

// Step 3: Parse the response
const data = await response.json();  // Convert JSON text to JavaScript object

// Step 4: Use the response
console.log(data);  // Shows:
// {
//   num_nodes: 5,
//   num_edges: 4,
//   is_dag: true,
//   invalid_edges: 0
// }

// Step 5: Show results to user
setAlert({
  isDag: data.is_dag,              // Get is_dag from response
  numNodes: data.num_nodes,        // Get num_nodes from response
  numEdges: data.num_edges,        // Get num_edges from response
});
```

---

# 🎮 PART 6: HOW TO USE THE APP (STEP BY STEP TUTORIAL)

## Tutorial: Create Your First Pipeline

### Step 1: Start the App
```bash
# In one terminal, start the backend:
cd backend
python main.py
# You should see: "Uvicorn running on http://127.0.0.1:8000"

# In another terminal, start the frontend:
cd frontend
npm start
# Browser opens at http://localhost:3000
```

### Step 2: Add Your First Node
1. Look at the **left toolbar** (shows all node types)
2. Click and **DRAG** "📥 Input" button
3. **Drop** it on the white canvas
4. A box appears! That's your first node.

### Step 3: Add More Nodes
1. Drag a "🤖 LLM" node to the canvas
2. Drag a "📤 Output" node to the canvas
Now you have 3 nodes!

### Step 4: Edit Node Data
1. Click inside the **Input node**
2. You'll see input fields:
   - Name: (text box to type in)
   - Type: (dropdown to pick)
3. Type something like "User Question"
4. The data is **automatically saved** 🎉

### Step 5: Connect the Nodes
1. Find the small **dot** on the right side of the Input node
2. Click and **drag** from that dot
3. Drag to the **dot** on the left of the LLM node
4. **A line appears!** That's an edge/connection

### Step 6: Create More Connections
1. Connect the LLM output (right dot) to the Output input (left dot)
2. Now you have: Input → LLM → Output

### Step 7: Submit Your Pipeline
1. Click **"✓ Submit Pipeline"** button (bottom right)
2. You'll see a message saying "Loading..."
3. Backend checks if your pipeline is valid
4. Results show:
   - **🟢 Green border** = Valid! No cycles ✓
   - **🔴 Red border** = Invalid! Has cycles ✗

---

# 🛠️ PART 7: KEY CONCEPTS EXPLAINED (ELI5)

## What is a DAG?
**DAG = Directed Acyclic Graph**

Imagine a recipe book:
- Input: "Add flour" 🥄
- Process: "Mix well" 🥄
- Output: "Get dough" 🥖

✅ **VALID DAG** (flows one direction):
```
Flour → Mix → Dough
```

❌ **INVALID DAG** (loops back on itself):
```
Flour → Mix → Dough
  ↑              ↓
  └──────────────
  (You're adding dough back to flour - infinite loop!)
```

## What is Zustand?
**Zustand = Shared Memory**

Imagine a classroom:
- ❌ Old way: Each student has their own notebook
  - "Wait, what did we write down?"
  - Everyone has different answers = Chaos!

- ✅ New way: One shared whiteboard
  - Everyone reads from same place
  - Everyone writes to same place
  - Everyone agrees on the data

```javascript
// Everyone can access and change the same data
const nodes = useStore((state) => state.nodes);  // Read
useStore((state) => state.addNode(newNode));      // Write
```

## What is ReactFlow?
**ReactFlow = Drawing Library**

It's like giving you a magic notepad that:
- Draws boxes (nodes)
- Draws lines (edges)
- Lets you drag boxes around
- Lets you connect lines
- Shows a minimap

Without ReactFlow, you'd need 1000s of lines of code!

## What is FastAPI?
**FastAPI = Recipe Converter**

You give it a recipe in Python:
```python
@app.post('/pipelines/parse')
def parse_pipeline(data):
    return {'result': 'something'}
```

FastAPI automatically:
- ✅ Listens for requests on that URL
- ✅ Takes the request data
- ✅ Runs your function
- ✅ Sends back the result as JSON
- ✅ Handles errors nicely

It's like: "I'll be your waiter and customer service!"

## What is Async/Await?
**Async/Await = Waiting for Things**

```javascript
const data = await fetch(...);  // Wait for response
```

It's like:
- You order pizza (async)
- You wait for it (await)
- Pizza arrives
- You eat it
- Not: You wait in the kitchen doing nothing

With async/await, your app stays responsive while waiting!

---

# 📊 PART 8: COMPLETE DATA FLOW DIAGRAM

```
USER OPENS APP
  ↓
App.js runs
  ↓
App.js checks if dark mode saved
  ↓
App.js shows:
  ├─ PipelineToolbar (buttons on left)
  └─ ResizableLayout
      ├─ PipelineUI (canvas in middle)
      └─ SubmitButton (button at bottom)
  ↓
STORE (Memory) initializes:
  ├─ nodes: []
  ├─ edges: []
  ├─ darkMode: false
  └─ All functions

═══════════════════════════════════════════════════════

USER DRAGS "INPUT" BUTTON
  ↓
draggableNode.js: onDragStart()
  ├─ Sets cursor to "grab"
  └─ Stores node type in drag data

USER DRAGS OVER CANVAS
  ↓
ui.js: onDragOver()
  └─ Shows "move" cursor

USER DROPS ON CANVAS
  ↓
ui.js: onDrop()
  ├─ Gets drop position
  ├─ Gets node type from drag data
  ├─ Calls getNodeID() to get unique ID (e.g., "input-1")
  ├─ Creates node object
  └─ Calls addNode() to add to memory
  ↓
store.js: addNode()
  └─ Adds node to memory

React sees memory changed
  ↓
Canvas re-renders
  ↓
ReactFlow shows the new node

═══════════════════════════════════════════════════════

USER TYPES IN NODE
  ↓
BaseNode.js: handleFieldChange()
  ├─ Updates local state for instant UI update
  └─ Calls updateNodeField() to save to memory 🔥
  ↓
store.js: updateNodeField()
  └─ Updates node data in memory

React sees memory changed
  ↓
Canvas re-renders (to show any visual changes)

═══════════════════════════════════════════════════════

USER CONNECTS TWO NODES
  ↓
ui.js: onConnect()
  ├─ Creates edge object
  └─ Calls onConnect() to add to memory
  ↓
store.js: onConnect()
  └─ Adds edge to memory

React sees memory changed
  ↓
Canvas re-renders
  ↓
ReactFlow shows the new connection line

═══════════════════════════════════════════════════════

USER CLICKS "SUBMIT PIPELINE"
  ↓
submit.js: handleSubmit()
  ├─ Check if pipeline is empty
  │  ├─ YES: Show warning → STOP
  │  └─ NO: Continue
  ├─ Set loading = true (show spinner)
  ├─ Get nodes & edges from memory
  ├─ Create JSON: {nodes, edges}
  └─ Call fetch() to send to backend
  ↓
HTTP Request travels to backend
  ↓
BACKEND - main.py: parse_pipeline() receives request
  ├─ Convert JSON to Python objects
  ├─ Count nodes and edges
  ├─ Validate edges (check both nodes exist)
  ├─ Run is_dag() to check for cycles
  │  ├─ If valid → is_dag: true
  │  └─ If invalid → is_dag: false
  ├─ Count invalid edges
  └─ Create response JSON
  ↓
Response JSON travels back to frontend
  ↓
submit.js receives response
  ├─ Parse JSON
  ├─ Create alert with response data
  ├─ Set loading = false (hide spinner)
  └─ Show alert to user:
      ├─ Green border + "✓ Valid" if is_dag: true
      └─ Red border + "✗ Invalid" if is_dag: false
  ↓
USER SEES THE RESULT! 🎉
```

---

# ✅ PART 9: QUICK SUMMARY TABLE

| **File** | **What It Does** | **Why It Exists** |
|----------|-----------------|------------------|
| **App.js** | Starts the app, manages dark mode | Entry point for React |
| **store.js** | Shared memory (Zustand) | Everyone accesses data from here |
| **ui.js** | Canvas with ReactFlow | Displays nodes and edges |
| **submit.js** | Submit button + color feedback | Sends data to backend |
| **toolbar.js** | Draggable buttons | Create new nodes |
| **draggableNode.js** | Handle drag events | Make buttons draggable |
| **BaseNode.js** | Node template/factory | Reuse code for all node types |
| **nodeFactory.js** | Create specific nodes | Input, LLM, Output, etc. |
| **demonstrationNodes.js** | More node types | Calculator, Database, etc. |
| **resizableLayout.js** | Split screen resize | Drag divider to resize |
| **main.py** | Backend server (FastAPI) | Validate pipelines, check DAG |

---

# 🚀 PART 10: START THE APP

## Prerequisites:
- Node.js installed (for frontend)
- Python 3.8+ installed (for backend)

## Start the Backend:
```bash
cd backend
pip install fastapi uvicorn pydantic
python main.py
```
**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

## Start the Frontend (New Terminal):
```bash
cd frontend
npm install  # First time only
npm start
```
**Expected output:**
```
Compiled successfully!
You can now view the app in your browser at http://localhost:3000
```

## Open in Browser:
Visit: **http://localhost:3000**

---

# 🎯 PART 11: TROUBLESHOOTING

| **Problem** | **Cause** | **Solution** |
|-----------|---------|------------|
| **Edges won't connect** | Position values are strings, not Position enum | Fixed with getPosition() function |
| **Data doesn't save** | updateNodeField not called | Fixed in BaseNode handleFieldChange |
| **Backend unreachable** | CORS not enabled | FastAPI middleware added |
| **State is inconsistent** | Only local state updated | Added updateNodeField sync |
| **Too many handles overlap** | Fixed 30px spacing | Dynamic spacing based on count |
| **Pipeline won't submit** | Empty nodes/edges | Shows warning message |
| **Node won't drag** | Drag data not set | draggableNode.js sets it |

---

# 🎓 FINAL SUMMARY

### The 5 Biggest Ideas:

1. **Frontend = What User Sees** (React)
   - Buttons, canvas, text fields
   - Shows live updates

2. **Store = Shared Memory** (Zustand)
   - Everyone reads/writes here
   - Single source of truth

3. **Backend = The Brain** (FastAPI/Python)
   - Validates your work
   - Checks for errors
   - Sends results back

4. **Nodes = The Boxes** (BaseNode template)
   - Input, LLM, Output, Calculator, etc.
   - Configured via JSON

5. **Edges = The Connections** (ReactFlow)
   - Lines between nodes
   - Represent data flow

### The Magic: 🔥
```javascript
updateNodeField(id, fieldName, value);
```
When you type in a node, this line saves it to memory. Without it, the backend gets old data!

### The Flow:
```
User → Frontend → Memory (Store) → Backend → Validation → Result → Display
```

---

# 🎉 **YOU NOW UNDERSTAND VECTORSHIFT!**

Congratulations! You learned:
- ✅ What each file does
- ✅ Why it exists
- ✅ How it works
- ✅ How to use it
- ✅ How frontend & backend talk
- ✅ Key concepts explained simply

**You're ready to explain this to anyone!** 🚀
