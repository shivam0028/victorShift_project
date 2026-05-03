import { createNodeComponent } from './nodeFactory';

/**
 * Five new demonstration nodes
 * These showcase the flexibility and efficiency of the node abstraction
 */

// 1. Calculator Node - Performs mathematical operations
export const CalculatorNode = createNodeComponent({
  type: 'calculator',
  title: 'Calculator',
  subtitle: 'Math Operations',
  fields: [
    {
      name: 'operation',
      label: 'Operation',
      type: 'select',
      defaultValue: 'add',
      options: ['add', 'subtract', 'multiply', 'divide', 'power']
    }
  ],
  inputHandles: [
    {
      id: 'valueA',
      position: 'left',
      label: 'Value A',
      style: { top: '25%' }
    },
    {
      id: 'valueB',
      position: 'left',
      label: 'Value B',
      style: { top: '75%' }
    }
  ],
  outputHandles: [
    {
      id: 'result',
      position: 'right',
      label: 'Result'
    }
  ]
});

// 2. Database Node - Connects to databases
export const DatabaseNode = createNodeComponent({
  type: 'database',
  title: 'Database',
  subtitle: 'Data Source',
  fields: [
    {
      name: 'dbType',
      label: 'Type',
      type: 'select',
      defaultValue: 'PostgreSQL',
      options: ['PostgreSQL', 'MySQL', 'MongoDB', 'DynamoDB', 'Firestore']
    },
    {
      name: 'query',
      label: 'Query',
      type: 'textarea',
      defaultValue: 'SELECT * FROM table',
      rows: 3
    }
  ],
  outputHandles: [
    {
      id: 'results',
      position: 'right',
      label: 'Results'
    }
  ]
});

// 3. JSON Parser Node - Parses and transforms JSON
export const JSONParserNode = createNodeComponent({
  type: 'jsonparser',
  title: 'JSON Parser',
  subtitle: 'Transform JSON',
  fields: [
    {
      name: 'mode',
      label: 'Mode',
      type: 'select',
      defaultValue: 'parse',
      options: ['parse', 'stringify', 'validate', 'transform']
    }
  ],
  inputHandles: [
    {
      id: 'input',
      position: 'left',
      label: 'Input'
    }
  ],
  outputHandles: [
    {
      id: 'output',
      position: 'right',
      label: 'Output'
    }
  ]
});

// 4. Filter Node - Filters data based on conditions
export const FilterNode = createNodeComponent({
  type: 'filter',
  title: 'Filter',
  subtitle: 'Data Filter',
  fields: [
    {
      name: 'filterType',
      label: 'Filter Type',
      type: 'select',
      defaultValue: 'equals',
      options: ['equals', 'contains', 'greater', 'less', 'regex']
    },
    {
      name: 'filterValue',
      label: 'Filter Value',
      type: 'text',
      defaultValue: ''
    }
  ],
  inputHandles: [
    {
      id: 'data',
      position: 'left',
      label: 'Data'
    }
  ],
  outputHandles: [
    {
      id: 'filtered',
      position: 'right',
      label: 'Filtered'
    },
    {
      id: 'rejected',
      position: 'right',
      label: 'Rejected',
      style: { bottom: '10px' }
    }
  ]
});

// 5. API Node - Calls external APIs
export const APINode = createNodeComponent({
  type: 'api',
  title: 'API',
  subtitle: 'HTTP Request',
  fields: [
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      defaultValue: 'GET',
      options: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      defaultValue: 'https://api.example.com'
    }
  ],
  inputHandles: [
    {
      id: 'params',
      position: 'left',
      label: 'Params',
      style: { top: '33%' }
    },
    {
      id: 'body',
      position: 'left',
      label: 'Body',
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
