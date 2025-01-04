import express from 'express';
import { BrowserWindow, App } from 'electron';
import cors from 'cors';

export class HttpServer {
  private app: express.Application;
  private server: any;
  private mainWindow: BrowserWindow;
  private electronApp: App;

  constructor(mainWindow: BrowserWindow, electronApp: App, port: number = 24678) {
    this.mainWindow = mainWindow;
    this.electronApp = electronApp;
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
    // 处理应用激活请求
    this.app.get('/activate', (req, res) => {
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) {
          this.mainWindow.restore();
        }
        this.mainWindow.show();
        this.mainWindow.focus();
        res.json({ success: true, message: 'Window activated' });
      } else {
        res.status(404).json({ success: false, message: 'Window not found' });
      }
    });

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

        // 激活窗口
        if (this.mainWindow) {
          if (this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
          }
          this.mainWindow.show();
          this.mainWindow.focus();

          // 发送到渲染进程
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
