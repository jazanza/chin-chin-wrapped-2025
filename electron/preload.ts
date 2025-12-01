import { contextBridge } from "electron";
// Removed ipcRenderer as openDbFile is no longer needed

// Removed contextBridge.exposeInMainWorld("electronAPI", { openDbFile: ... });
// No electronAPI functions are exposed anymore.