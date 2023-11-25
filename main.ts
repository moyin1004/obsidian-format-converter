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