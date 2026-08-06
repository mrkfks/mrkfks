import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { promises as fs } from 'node:fs';
import { existsSync, mkdirSync } from 'node:fs';
import { randomBytes } from 'node:crypto';

const browserDistFolder = join(import.meta.dirname, '../browser');
const docsFolder = join(process.cwd(), 'public/docs');

// Ensure docs folder exists
if (!existsSync(docsFolder)) {
  mkdirSync(docsFolder, { recursive: true });
}

const app = express();
const angularApp = new AngularNodeAppEngine();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/**
 * API Endpoints for document management
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

// POST /api/files - Create new file or folder
app.post('/api/files', async (req, res) => {
  try {
    const { name, type, parentPath } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Name and type required' });
    }

    // Validate .md extension for files
    if (type === 'file' && !name.endsWith('.md')) {
      return res.status(400).json({ success: false, error: 'Only .md files allowed' });
    }

    const fullPath = join(docsFolder, parentPath || '', name);

    if (type === 'file') {
      await fs.writeFile(fullPath, '');
    } else {
      mkdirSync(fullPath, { recursive: true });
    }

    const tree = await buildFileTree(docsFolder, '');
    return res.json({ success: true, data: tree });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// GET /api/files/:path - Read file content
app.get('/api/files/content/:path', async (req, res) => {
  try {
    const filePath = join(docsFolder, req.params.path);
    
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

// PUT /api/files/:path - Update file content
app.put('/api/files/content/:path', async (req, res) => {
  try {
    const filePath = join(docsFolder, req.params.path);
    
    // Security check
    if (!filePath.startsWith(docsFolder)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { content } = req.body;
    await fs.writeFile(filePath, content || '');
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// DELETE /api/files/:path - Delete file or folder
app.delete('/api/files/:path', async (req, res) => {
  try {
    const filePath = join(docsFolder, req.params.path);
    
    // Security check
    if (!filePath.startsWith(docsFolder)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const stat = await fs.stat(filePath);
    if (stat.isDirectory()) {
      await fs.rm(filePath, { recursive: true });
    } else {
      await fs.unlink(filePath);
    }

    const tree = await buildFileTree(docsFolder, '');
    return res.json({ success: true, data: tree });
  } catch (error) {
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// POST /api/upload - Upload image
app.post('/api/upload', express.raw({ type: 'application/octet-stream', limit: '10mb' }), async (req, res) => {
  try {
    const { imageData, filename } = req.body && typeof req.body === 'object' ? req.body : { imageData: null, filename: null };
    
    // If body is already a buffer (raw upload)
    let buffer: Buffer | null = null;
    let name = filename || 'image.jpg';
    
    if (Buffer.isBuffer(req.body)) {
      buffer = req.body;
    } else if (req.body && typeof req.body === 'object') {
      // Base64 upload from FormData
      const base64 = req.body.imageData || imageData;
      if (base64) {
        buffer = Buffer.from(base64, 'base64');
      }
    }

    if (!buffer) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Create uploads folder if it doesn't exist
    const uploadsFolder = join(import.meta.dirname, '../public/uploads');
    if (!existsSync(uploadsFolder)) {
      mkdirSync(uploadsFolder, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const random = randomBytes(4).toString('hex');
    const ext = name.split('.').pop() || 'jpg';
    const uniqueName = `${timestamp}-${random}.${ext}`;
    
    const filePath = join(uploadsFolder, uniqueName);
    await fs.writeFile(filePath, buffer);

    return res.json({ 
      success: true, 
      data: { 
        url: `/uploads/${uniqueName}`,
        filename: uniqueName
      } 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * Helper function to build file tree structure
 */
async function buildFileTree(folderPath: string, basePath: string): Promise<any[]> {
  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });
    const nodes: any[] = [];
    let idCounter = 0;

    for (const entry of entries) {
      const name = entry.name;
      const path = basePath ? `${basePath}/${name}` : name;
      const id = `item-${++idCounter}-${Date.now()}`;

      if (entry.isDirectory()) {
        const children = await buildFileTree(join(folderPath, name), path);
        nodes.push({
          id,
          name,
          path,
          type: 'folder',
          isOpen: false,
          children,
        });
      } else if (entry.isFile() && name.endsWith('.md')) {
        nodes.push({
          id,
          name,
          path,
          type: 'file',
        });
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
  } catch (error) {
    console.error('[buildFileTree] Error:', error);
    return [];
  }
}

// GET /api/search - Search in filenames and content
app.get('/api/search', async (req, res) => {
  try {
    const query = ((req.query['q'] as string) || '').toLowerCase();
    
    if (!query.trim()) {
      return res.json({ success: true, data: { byName: [], byContent: [] } });
    }

    const tree = await buildFileTree(docsFolder, '');
    const byName: any[] = [];
    const byContent: any[] = [];

    // Search in all files
    async function searchFiles(nodes: any[], currentPath: string = '') {
      for (const node of nodes) {
        const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;
        
        if (node.type === 'file') {
          // Check filename
          if (node.name.toLowerCase().includes(query)) {
            byName.push({
              path: node.path,
              name: node.name,
              type: 'file'
            });
          }

          // Check file content
          try {
            const filePath = join(docsFolder, node.path);
            const content = await fs.readFile(filePath, 'utf-8');
            if (content.toLowerCase().includes(query)) {
              // Find context lines
              const lines = content.split('\n');
              const matches = lines
                .map((line, idx) => ({ line, idx }))
                .filter(({ line }) => line.toLowerCase().includes(query))
                .slice(0, 3); // First 3 matches

              byContent.push({
                path: node.path,
                name: node.name,
                type: 'file',
                matchCount: lines.filter(l => l.toLowerCase().includes(query)).length,
                preview: matches.map(m => m.line.trim()).join(' ... ')
              });
            }
          } catch (err) {
            // Skip if can't read
          }
        } else if (node.type === 'folder' && node.children) {
          // Check folder name
          if (node.name.toLowerCase().includes(query)) {
            byName.push({
              path: node.path,
              name: node.name,
              type: 'folder'
            });
          }
          // Recurse
          await searchFiles(node.children, nodePath);
        }
      }
    }

    await searchFiles(tree);
    return res.json({ success: true, data: { byName, byContent } });
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

/**
 * Serve static files from /browser and /public
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

// Serve uploads folder
app.use('/uploads', express.static(join(import.meta.dirname, '../public/uploads'), {
  maxAge: '30d',
}));

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
