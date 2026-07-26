const fs = require('fs');
const dbPath = './src/db/data.json';

try {
  const fileData = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(fileData);
  
  // Prune logs to a single initialization message
  db.logs = [
    {
      id: "l1",
      timestamp: "2026-07-05T05:13:00.000Z",
      ip: "127.0.0.1",
      action: "System Initialization",
      details: "Arnob's Creation database was initialized successfully with premium design settings.",
      status: "info"
    }
  ];
  
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log("Successfully cleaned data.json!");
} catch (e) {
  console.error("Failed to clean database:", e);
}
