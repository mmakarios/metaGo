import * as readline from "readline";
import * as vscode from "vscode";


export class SpaceBlockJumper {
    activate(context: vscode.ExtensionContext) {
        context.subscriptions.push(vscode.commands.registerCommand("spaceBlockJumper.moveUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, true));
        }));

        context.subscriptions.push(vscode.commands.registerCommand("spaceBlockJumper.moveDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(editor, this.nextPosition(editor.document, editor.selection.active, false));
        }));

        context.subscriptions.push(vscode.commands.registerCommand("spaceBlockJumper.selectUp", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(
                editor,
                this.nextPosition(editor.document, editor.selection.active, true),
                this.anchorPosition(editor.selection)
            );
        }));

        context.subscriptions.push(vscode.commands.registerCommand("spaceBlockJumper.selectDown", () => {
            const editor = vscode.window.activeTextEditor;
            this.markSelection(
                editor,
                this.nextPosition(editor.document, editor.selection.active, false),
                this.anchorPosition(editor.selection)
            );
        }));
    }
    private nextPosition(document: vscode.TextDocument, position: vscode.Position, up: boolean = false): number {
        const step = up ? -1 : 1;
        const boundary = up ? 0 : document.lineCount - 1;
        let index = position.line + step;
        if (position.line === boundary) return position.line;
        return this.afterBlock(document, step, boundary, position.line);
    }

    private afterBlock(document: vscode.TextDocument, step: number, boundary: number, index: number, startedBlock: boolean = false): number {
        const line = document.lineAt(index);
        return index === boundary || startedBlock && line.isEmptyOrWhitespace
            ? index
            : this.afterBlock(document, step, boundary, index + step, startedBlock || !line.isEmptyOrWhitespace);
    }

    private anchorPosition(selection: vscode.Selection) {
        return selection.active.line === selection.end.line ? selection.start : selection.end
    }

    private markSelection(editor: vscode.TextEditor, next: number, anchor?: vscode.Position) {
        const active = editor.selection.active.with(next, 0);
        editor.selection = new vscode.Selection(anchor || active, active);
        editor.revealRange(new vscode.Range(active, active));
    }
}
