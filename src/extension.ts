'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as request from 'request';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "zpl-viewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('zplViewer.preview', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');
        let editor = vscode.window.activeTextEditor;
        let selection = editor.selection;
        let zpl = editor.document.getText(selection);

        var options = {
            encoding: null,
            formData: { file: zpl },
            headers: { 'Accept': 'image/png' },
            url: 'http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/'
        };

        request.post(options, async function (err, resp, body) {
            if (err || resp.statusCode !== 200) {
                let error: string = resp.statusCode !== 200 ? resp.body : err;
                console.log(error);
                return vscode.window.showErrorMessage(`API error: ${error}`);
            }

            let rawImage: Uint8Array = resp.body;
            let thePath = path.join(os.tmpdir(), `zpl-${new Date().getTime()}.png`);

            fs.writeFileSync(thePath, rawImage);

            let uri = vscode.Uri.file(thePath);

            try {
                let success = await vscode.commands.executeCommand('vscode.open', uri);
            } catch (e) {
                return vscode.window.showErrorMessage(`Unable to open file: ${e}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}