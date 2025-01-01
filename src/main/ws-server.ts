import WebSocket from 'ws';
import { BrowserWindow } from 'electron';

export class WebSocketServer {
  private wss: WebSocket.Server;
  private mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow, port: number = 8080) {
    this.mainWindow = mainWindow;
    this.wss = new WebSocket.Server({ port });
    this.init();
  }

  private init() {
    this.wss.on('connection', (ws) => {
      console.log('New client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('Received message:', data);
          
          // Forward message to renderer process
          if (this.mainWindow) {
            this.mainWindow.webContents.send('trigger-function', data);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });
  }

  public close() {
    this.wss.close();
  }
}
