
# 🛰️ Dynamic Microservice Registry & Discovery Engine

A lightweight, zero-dependency service discovery directory layer built natively in Node.js. This core utility acts as a localized orchestrator, permitting distributed cluster apps to register instances dynamically and fetch healthy routing maps in real-time.

## 🛠 Advanced Architectures
- **Dynamic Heartbeat Evictions**: Implements an active background daemon sweep loop that calculates delta timestamps to evict unresponsive service nodes dynamically.
- **Nested Hash Map Topologies**: Organizes internal routing layers natively inside a nested ES6 `Map` paradigm for memory-efficient lookup time complexities ($O(1)$).
- **Decoupled Load Distribution**: Exposes runtime discovery routes returning random healthy node targets, introducing entry-level client-side load balancing.
- **Fail-Soft Registry Scopes**: Isolates network state structures directly in volatile memory arrays to guarantee instant lookups without calling disk persistence loops.

## 🚀 Execution & Quick Start
1. **Initialize Workspace**:
   ```bash
   npm install express
   ```
2. **Start Registry Discovery Node**:
   ```bash
   node server.js
   ```
3. **Simulate a Cluster Node Heartbeat**:
   Announce a microservice instance is online and running via a simple POST payload:
   ```bash
   curl -X POST http://localhost:3000/api/register \
     -H "Content-Type: application/json" \
     -d '{"serviceName": "auth-srv", "instanceId": "auth-node-01", "url": "http://10.0.0.5:8080"}'
   ```
4. **Discover a Live Node Reference**:
   Query the directory routing mesh to resolve target endpoints for systemic internal requests:
   ```bash
   curl http://localhost:3000/api/discover/auth-srv
   ```

## ⚙️ Technical Reasoning
Hardcoding network IP properties directly inside microservice environments introduces strict coupling and breaks down completely under elastic scaling patterns. Centralizing active endpoint tracking inside a lightweight runtime daemon layer provides a highly adaptive backend system where services can deploy, crash, restart, or replicate without breaking upstream logic maps.

## License
MIT
