// submit.js
import { useState } from 'react';
import { useStore } from './store';

export const SubmitButton = ({ fullscreenMode = false }) => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showPanel, setShowPanel] = useState(true);
    const { nodes, edges } = useStore((state) => ({ nodes: state.nodes, edges: state.edges }));

    const handleSubmit = async () => {
        if (nodes.length === 0 && edges.length === 0) {
            setAlert({
                title: '⚠️ Empty Pipeline',
                message: 'Please add some nodes to your pipeline before submitting.',
                numNodes: 0,
                numEdges: 0,
                isDag: true
            });
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nodes: nodes,
                    edges: edges,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAlert({
                title: '✅ Pipeline Validated',
                message: 'Your pipeline has been successfully analyzed.',
                numNodes: data.num_nodes,
                numEdges: data.num_edges,
                isDag: data.is_dag
            });
        } catch (error) {
            console.error('Error:', error);
            setAlert({
                title: '❌ Error',
                message: `Failed to submit pipeline: ${error.message}`,
                error: true
            });
        } finally {
            setLoading(false);
        }
    };

    const closeAlert = () => {
        setAlert(null);
    };

    return (
        <>
            <div className="submit-button-container">
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button 
                        className={`submit-button ${loading ? 'loading' : ''}`}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                {' Submitting...'}
                            </>
                        ) : (
                            '✓ Submit Pipeline'
                        )}
                    </button>
                    {!fullscreenMode && (
                        <button 
                            className="panel-toggle-button"
                            onClick={() => setShowPanel(!showPanel)}
                            title={showPanel ? 'Hide panel' : 'Show panel'}
                        >
                            {showPanel ? '▼ Info' : '▶ Info'}
                        </button>
                    )}
                </div>
            </div>

            {/* Info Panel */}
            {(fullscreenMode || showPanel) && (
                <div className={`info-panel ${fullscreenMode ? 'fullscreen-panel' : ''}`}>
                    <div className="info-panel-content">
                        <div className="info-stat">
                            <span className="info-label">📊 Total Nodes</span>
                            <span className="info-value">{nodes.length}</span>
                        </div>
                        <div className="info-stat">
                            <span className="info-label">🔗 Total Edges</span>
                            <span className="info-value">{edges.length}</span>
                        </div>
                        <div className="info-stat">
                            <span className="info-label">📋 Status</span>
                            <span className="info-value">{nodes.length === 0 ? 'Empty' : 'Ready'}</span>
                        </div>
                    </div>
                </div>
            )}

            {alert && (
                <>
                    <div className="alert-overlay" onClick={closeAlert}></div>
                    <div className="alert-dialog" style={{
                        borderLeft: `6px solid ${alert.error ? '#ff6b6b' : (alert.isDag ? '#51cf66' : '#ff6b6b')}`
                    }}>
                        <div className="alert-title">{alert.title}</div>
                        <div className="alert-content">{alert.message}</div>
                        
                        {!alert.error && (
                            <div>
                                <div className="alert-stat">
                                    <span className="alert-stat-label">Total Nodes</span>
                                    <span className="alert-stat-value">{alert.numNodes}</span>
                                </div>
                                <div className="alert-stat">
                                    <span className="alert-stat-label">Total Edges</span>
                                    <span className="alert-stat-value">{alert.numEdges}</span>
                                </div>
                                <div className="alert-stat" style={{ borderBottom: 'none' }}>
                                    <span className="alert-stat-label">Is DAG</span>
                                    <span className="alert-stat-value" style={{
                                        color: alert.isDag ? '#51cf66' : '#ff6b6b',
                                        fontWeight: 'bold'
                                    }}>
                                        {alert.isDag ? '✓ Valid' : '✗ Invalid (Cycle)'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="alert-buttons">
                            <button className="alert-button primary" onClick={closeAlert}>
                                Close
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
