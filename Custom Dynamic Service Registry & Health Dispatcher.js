
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Core Memory State Store (Service Name -> Map of Instances)
const registry = new Map();
const INSTANCE_TTL_MS = 15000; // Nodes must heartbeat every 15s or get evicted

// Advanced Background Daemon: Actively prunes dead microservice allocations
setInterval(() => {
    const now = Date.now();
    console.log(`[Registry Daemon] Running passive TTL sweep across cluster definitions...`);

    for (const [serviceName, instances] of registry.entries()) {
        for (const [instanceId, instanceData] of instances.entries()) {
            if (now - instanceData.lastHeartbeat > INSTANCE_TTL_MS) {
                console.warn(`🚨 [Eviction] Node "${instanceId}" dead. Purging from "${serviceName}" registry.`);
                instances.delete(instanceId);
            }
        }
        // If a service has zero online instances, clean up its root map entry
        if (instances.size === 0) {
            registry.delete(serviceName);
        }
    }
}, 5000); // Sweeps every 5 seconds

app.use(express.json());

// 1. Ingestion Endpoint: Microservices announce they are online or send heartbeats
app.post('/api/register', (req, res) => {
    const { serviceName, instanceId, url } = req.body;
    
    if (!serviceName || !instanceId || !url) {
        return res.status(400).json({ error: 'Schema invalid. Parameters "serviceName", "instanceId", and "url" are mandatory.' });
    }

    if (!registry.has(serviceName)) {
        registry.set(serviceName, new Map());
    }

    const instances = registry.get(serviceName);
    instances.set(instanceId, {
        url,
        lastHeartbeat: Date.now()
    });

    console.log(`[Registry] Service "${serviceName}" updated node: ${instanceId} -> ${url}`);
    res.status(200).json({ registered: true, instanceId, ttl: `${INSTANCE_TTL_MS / 1000}s` });
});

// 2. Discovery Endpoint: Clients query this to get an active node for a service (Client-side load balancing)
app.get('/api/discover/:serviceName', (req, res) => {
    const { serviceName } = req.params;
    const instances = registry.get(serviceName);

    if (!instances || instances.size === 0) {
        return res.status(404).json({ error: `No active instances found for service: ${serviceName}` });
    }

    // Basic Round-Robin or Random array allocation selection
    const instancesArray = Array.from(instances.values());
    const randomNode = instancesArray[Math.floor(Math.random() * instancesArray.length)];

    res.json({
        service: serviceName,
        targetNodeUrl: randomNode.url,
        totalHealthyNodes: instancesArray.length
    });
});

// Telemetry state dump route for infrastructure auditing
app.get('/admin/registry-dump', (req, res) => {
    const output = {};
    for (const [service, instances] of registry.entries()) {
        output[service] = Object.fromEntries(instances);
    }
    res.json({ activeServicesCount: registry.size, topology: output });
});

app.listen(PORT, () => console.log(`🛰️ Service Registry & Discovery Node active on port ${PORT}`));


// # 🛰️ Dynamic Microservice Registry & Discovery Engine

// A lightweight, zero-dependency service discovery directory layer built natively in Node.js. This core utility acts as a localized orchestrator, permitting distributed cluster apps to register instances dynamically and fetch healthy routing maps in real-time.

// ## 🛠 Advanced Architectures
// - **Dynamic Heartbeat Evictions**: Implements an active background daemon sweep loop that calculates delta timestamps to evict unresponsive service nodes dynamically.
// - **Nested Hash Map Topologies**: Organizes internal routing layers natively inside a nested ES6 `Map` paradigm for memory-efficient lookup time complexities ($O(1)$).
// - **Decoupled Load Distribution**: Exposes runtime discovery routes returning random healthy node targets, introducing entry-level client-side load balancing.
// - **Fail-Soft Registry Scopes**: Isolates network state structures directly in volatile memory arrays to guarantee instant lookups without calling disk persistence loops.

// ## 🚀 Execution & Quick Start
// 1. **Initialize Workspace**:
//    ```bash
//    npm install express
//    ```
// 2. **Start Registry Discovery Node**:
//    ```bash
//    node server.js
//    ```
// 3. **Simulate a Cluster Node Heartbeat**:
//    Announce a microservice instance is online and running via a simple POST payload:
//    ```bash
//    curl -X POST http://localhost:3000/api/register \
//      -H "Content-Type: application/json" \
//      -d '{"serviceName": "auth-srv", "instanceId": "auth-node-01", "url": "http://10.0.0.5:8080"}'
//    ```
// 4. **Discover a Live Node Reference**:
//    Query the directory routing mesh to resolve target endpoints for systemic internal requests:
//    ```bash
//    curl http://localhost:3000/api/discover/auth-srv
//    ```

// ## ⚙️ Technical Reasoning
// Hardcoding network IP properties directly inside microservice environments introduces strict coupling and breaks down completely under elastic scaling patterns. Centralizing active endpoint tracking inside a lightweight runtime daemon layer provides a highly adaptive backend system where services can deploy, crash, restart, or replicate without breaking upstream logic maps.

// ## License
// MIT
