from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from collections import defaultdict, deque

app = FastAPI()

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

class Node(BaseModel):
    id: str
    type: str
    position: Dict[str, float]
    data: Dict[str, Any]

class Edge(BaseModel):
    source: str
    target: str
    id: str
    animated: bool = False

class Pipeline(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

def is_dag(nodes: List[Node], edges: List[Edge]) -> bool:
    """
    Check if the pipeline forms a Directed Acyclic Graph (DAG).
    Uses topological sort (Kahn's algorithm) to detect cycles.
    """
    if not edges:
        return True  # No edges means it's a DAG
    
    # Build adjacency list
    graph = defaultdict(list)
    in_degree = defaultdict(int)
    
    # Initialize all nodes
    node_ids = {node.id for node in nodes}
    for node_id in node_ids:
        in_degree[node_id] = 0
    
    # Build graph
    for edge in edges:
        if edge.source in node_ids and edge.target in node_ids:
            graph[edge.source].append(edge.target)
            in_degree[edge.target] += 1
    
    # Kahn's algorithm for topological sort
    queue = deque([node_id for node_id in node_ids if in_degree[node_id] == 0])
    sorted_count = 0
    
    while queue:
        node = queue.popleft()
        sorted_count += 1
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # If we sorted all nodes, it's a DAG; otherwise, there's a cycle
    return sorted_count == len(node_ids)

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: Pipeline):
    """
    Parse and validate a pipeline.
    Returns:
    - num_nodes: Total number of nodes
    - num_edges: Total number of edges
    - is_dag: Whether the pipeline forms a Directed Acyclic Graph
    - invalid_edges: Count of edges referencing non-existent nodes
    """
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    
    # Validate edges: check if source and target nodes exist
    node_ids = {node.id for node in pipeline.nodes}
    invalid_edges = [
        edge for edge in pipeline.edges
        if edge.source not in node_ids or edge.target not in node_ids
    ]
    
    is_dag_result = is_dag(pipeline.nodes, pipeline.edges)
    
    return {
        'num_nodes': num_nodes,
        'num_edges': num_edges,
        'is_dag': is_dag_result,
        'invalid_edges': len(invalid_edges)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
