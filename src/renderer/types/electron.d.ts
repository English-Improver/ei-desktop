export interface IElectronAPI {
  sendMessage: (message: string) => void;
  onTriggerFunction: (callback: (params: any) => void) => void;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
