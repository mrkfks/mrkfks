const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { existsSync, mkdirSync } = require('fs');

const app = express();
const PORT = process.env.PORT || 4200;
const docsFolder = path.join(__dirname, 'public/docs');

// Ensure docs folder exists
if (!existsSync(docsFolder)) {
  mkdirSync(docsFolder, { recursive: true });
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist/mrkfks/browser')));

/**
 * API Endpoints
 */

// GET /api/files - Get file tree structure
app.get('/api/files', async (req, res) => {
  try {
    const tree = await buildFileTree(docsFolder, '');
    res.json({ success: true, data: tree });
  } catch (error) {
    console.error('Error building file tree:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// GET /api/files/content/:path - Read file content
app.get('/api/files/content/:path', async (req, res) => {
  try {
    const filePath = path.join(docsFolder, req.params.path);
    
    // Security check
    if (!filePath.startsWith(docsFolder)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const content = await fs.readFile(filePath, 'utf-8');
    return res.json({ success: true, data: content });
  } catch (error) {
    return res.status(404).json({ success: false, error: 'File not found' });
  }
});

/**
 * Helper function to build file tree structure
 */
async function buildFileTree(folderPath, basePath) {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const nodes = [];
    let idCounter = 0;

    for (const entry of entries) {
      const name = entry.name;
      const entryPath = basePath ? `${basePath}/${name}` : name;
      const id = `item-${++idCounter}-${Date.now()}`;

      if (entry.isDirectory()) {
        const children = await buildFileTree(path.join(folderPath, name), entryPath);
        nodes.push({
          id,
          name,
          path: entryPath,
          type: 'folder',
          isFolder: true,
          children
        });
      } else if (name.endsWith('.md')) {
        nodes.push({
          id,
          name,
          path: entryPath,
          type: 'file',
          isFile: true
        });
      }
    }

    return nodes;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
}

// Handle all other routes by serving index.html (SPA)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist/mrkfks/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
