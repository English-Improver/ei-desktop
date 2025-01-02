import express from 'express';
import { BrowserWindow } from 'electron';
import cors from 'cors';

export class HttpServer {
  private app: express.Application;
  private server: any;
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow, port: number = 24678) {
    this.mainWindow = mainWindow;
    this.app = express();
    
    // Enable CORS and JSON parsing
    this.app.use(cors());
    this.app.use(express.json());

    this.setupRoutes();
    this.server = this.app.listen(port, () => {
      console.log(`HTTP Server running on port ${port}`);
    });
  }

  private setupRoutes() {
    // Endpoint to receive messages
    this.app.post('/trigger', (req, res) => {
      try {
        const data = req.body;
        console.log('Received data:', data);

        // Forward data to renderer process
        if (this.mainWindow) {
          this.mainWindow.webContents.send('trigger-function', data);
        }

        res.json({ success: true });
      } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
      }
    });
  }

  public close() {
    if (this.server) {
      this.server.close();
    }
  }
}
