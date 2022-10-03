// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

import io, { connect, Socket } from "socket.io-client";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
let globalSocket: Socket | null = null;

const HOST = "localhost:3000";

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated

  //Create output channel
  let console = vscode.window.createOutputChannel("test-console");
  function log(log: string) {
    console.appendLine(log);
  }
  console.show();

  globalSocket = connect(`ws://${HOST}/vscode`, {
    transports: ["websocket"],
  });

  globalSocket.on("connect", () => {
    log("connect" + "\n" + vscode.env.appHost + "\n" + vscode.env.sessionId);
    vscode.window.showInformationMessage("connect");
    if (vscode.workspace.workspaceFolders) {
      const username =
        vscode.workspace.workspaceFolders[0].uri.path.split("/")[2];

      if (username) {
        globalSocket?.emit("join", username);
      }
    }
  });

  vscode.workspace.onDidChangeTextDocument((e) => {
    // log(e.document.getText());
    if (globalSocket) {
      globalSocket.emit("sendCode", {
        filename: e.document.fileName,
        code: e.document.getText(),
      });
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {
  globalSocket?.close();
}
