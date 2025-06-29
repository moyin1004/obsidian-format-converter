import { App, Editor, MarkdownView, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
}

export default class HelloWorldPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		var cmd = this.addCommand({
			id: 'Tran Admonitions To Callouts',
			name: 'Tran Admonitions To Callouts',
			editorCallback: (editor: Editor) => {
				console.log(editor.getDoc());
				const match_str = [":::info", ":::warning", ":::tips", ":::success", ":::danger"];
				const replace_str = ["> [!info]", "> [!warn]", "> [!tip]", "> [!success]", "> [!danger]"];
				var find = false;
				for (var i = 0; i < editor.lineCount(); ++i) {
					var index = match_str.findIndex((element) => element == editor.getLine(i));
					if (index != -1) {
						editor.setLine(i, replace_str[index]);
						find = true;
					} else if (find) {
						var cur = editor.getLine(i);
						if (cur == ":::") {
							find = false;
							editor.setLine(i, "");
						} else {
							editor.setLine(i, "> "+editor.getLine(i));
						}
					}
				}
				return true;
			}
		});

		let handleSingleRow = (line: string) => {
			let cur = 0;
			let newline = '';
			while (cur < line.length) {
				const startIndex = line.indexOf('$ ', cur);
				let endIndex = line.indexOf(' $', startIndex+2);
				if (startIndex == -1 || endIndex == -1) {
					break
				}
				if ((startIndex > 0 && line[startIndex-1] == '$') || (endIndex+2 < line.length && line[endIndex+2] == '$')) {
					break
				}
				// 单行公式包含在一行内
				endIndex += 2;
				let preText = line.slice(cur, startIndex);
				const formulaText = line.slice(startIndex + 2, endIndex - 2);
				newline += preText + `$${formulaText}$`;
				cur = endIndex
			}
			newline += line.slice(cur)
			return {newline, cur};
		}

		var cmd = this.addCommand({
			id: 'Tran 语雀公式',
			name: 'Tran 语雀公式',
			editorCallback: (editor: Editor) => {
				let doc = editor.getDoc();
				// let line = handleSingleRow(doc.getValue());
				// console.log(line);
				// editor.replaceRange(line, { line: 0, ch: 0 }, { line: doc.lineCount(), ch: 0 });
                let lines = [];
                let inMathBlock = false;
                let mathBlockLines: string[] = [];
                let preText = ''; // 用于存储 $ 符号前的文本

                // 遍历所有行
                for (let i = 0; i < doc.lineCount(); i++) {
                    let line = doc.getLine(i);
					if (!inMathBlock) {
						let {newline, cur} = handleSingleRow(line);
						line = newline;
						const startIndex = line.indexOf('$ ', cur);
						if (startIndex != -1 && !(startIndex > 0 && line[startIndex-1] == '$')) {
							// 公式块开始
							inMathBlock = true;
							preText = line.slice(0, startIndex);
							mathBlockLines.push(line.slice(startIndex + 2));
						} else {
							// 普通行
                        	lines.push(line);
						}
					} else {
						const endIndex = line.indexOf(' $');
						if (endIndex != -1 && !(endIndex+2 < line.length && line[endIndex+2] == '$')) {
							// 公式块结束
							inMathBlock = false;
							mathBlockLines.push(line.slice(0, endIndex));
							const mergedFormula = `$${mathBlockLines.join(' ').trim()}$`;
							lines.push(preText + mergedFormula + handleSingleRow(line.slice(endIndex + 2)).newline);
							mathBlockLines = [];
							preText = '';
						} else {
							// 公式块中间行
                        	mathBlockLines.push(line);
						}
					}
                }
                // 替换文档内容
                editor.replaceRange(lines.join('\n'), { line: 0, ch: 0 }, { line: doc.lineCount(), ch: 0 });

                return true;
			}
		});

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', 'Tran Admonitions To Callouts', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('run trans');
			var view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (view && cmd.editorCallback) {
				cmd.editorCallback(view.editor, view);
			}
			// Editor.call(cmd.editorCallback);
		});

		

	}

	onunload() {
		console.log('unloading plugin')
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		// this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// export class SampleSettingTab extends PluginSettingTab {
// 	plugin: HelloWorldPlugin;

// 	constructor(app: App, plugin: HelloWorldPlugin) {
// 		super(app, plugin);
// 		this.plugin = plugin;
// 	}

// 	display(): void {
// 		let {containerEl} = this;

// 		containerEl.empty();

// 		new Setting(containerEl)
// 			.setName('Format Converter')
// 			.setDesc('It\'s a secret')
// 			.addText(text => text
// 				.setPlaceholder('Enter your secret')
// 				.setValue(this.plugin.settings.mySetting)
// 				.onChange(async (value) => {
// 					this.plugin.settings.mySetting = value;
// 					await this.plugin.saveSettings();
// 				}));
// 	}
// }