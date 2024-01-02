# TreeAPI Documentation 🌲
## Overview
The TreeAPI serves as the backend for Tree Sitter Visualizer, handling parsing, querying, and node relationship retrieval. It operates on the JavaScript grammar using Tree Sitter.

## Endpoints
### 1. Parse Code
**Endpoint:** /parse  
**Method:** POST  
**Payload:**
```json
{
  "code": "your JavaScript code here"
}
```
**Response:** Parsed Abstract Syntax Tree (AST) in React tree format.

### 2. Run Query
**Endpoint:** /query  
**Method:** POST  
**Payload:**
```json
{
  "code": "your JavaScript code here",
  "query": "your Tree Sitter query here"
}
```
**Response:** Matches for the query in React tree format.

### 3. Get Node Relationship
**Endpoint:** /getRelationship  
**Method:** POST  
**Payload:**
```json
{
  "code": "your JavaScript code here",
  "sourceNodeKey": "key of the source node",
  "targetNodeKey": "key of the target node"
}
```
**Response:** Relationship path between the specified nodes.

## Notes
- Ensure the TreeAPI server is running before interacting with the React app.
- CORS is temporarily allowed for testing purposes.
- For query errors, a 400 status with an error message is returned.
- Check the console for server status when running code or queries.