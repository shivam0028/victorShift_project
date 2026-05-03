// toolbar.js

import { DraggableNode } from './draggableNode';
import { useStore } from './store';

export const PipelineToolbar = () => {
    const darkMode = useStore((state) => state.darkMode);
    const toggleDarkMode = useStore((state) => state.toggleDarkMode);

    return (
        <div className="pipeline-toolbar">
            <div className="toolbar-title">📊 Pipeline Builder</div>
            <div className="toolbar-buttons">
                <DraggableNode type='customInput' label='Input' />
                <DraggableNode type='llm' label='LLM' />
                <DraggableNode type='customOutput' label='Output' />
                <DraggableNode type='text' label='Text' />
                <DraggableNode type='calculator' label='Calculator' />
                <DraggableNode type='database' label='Database' />
                <DraggableNode type='jsonparser' label='JSON Parser' />
                <DraggableNode type='filter' label='Filter' />
                <DraggableNode type='api' label='API' />
            </div>
            <button 
                className="dark-mode-toggle"
                onClick={toggleDarkMode}
                title={darkMode ? 'Light mode' : 'Dark mode'}
            >
                {darkMode ? '☀️' : '🌙'}
            </button>
        </div>
    );
};
