const express = require('express');
const os = require('os'); // For hostname
const app = express();

const PORT = process.env.PORT || 3000;

// Generate a unique ID for this instance
const instanceId = `${os.hostname()}-${Math.random()
  .toString(36)
  .substr(2, 6)}`;

app.get('/', (req, res) => {
  res.send(`Hello from instance: ${instanceId}`);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
