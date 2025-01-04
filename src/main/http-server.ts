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

        // 检查请求数据格式
        if (!data.text || !data.function) {
          throw new Error('Invalid request data: missing text or function');
        }

        // 验证function类型
        if (!['translate', 'explain'].includes(data.function)) {
          throw new Error('Invalid function type: must be translate or explain');
        }

        // 发送到渲染进程
        if (this.mainWindow) {
          this.mainWindow.webContents.send('trigger-function', {
            function: data.function,
            text: data.text
          });
        }

        res.json({ success: true });
      } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Internal server error' 
        });
      }
    });
  }

  public close() {
    if (this.server) {
      this.server.close();
    }
  }
}
