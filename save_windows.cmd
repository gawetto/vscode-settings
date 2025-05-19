set vscode_user_directory=%APPDATA%\Code\User
copy "%vscode_user_directory%\settings.json" %~dp0settings.json
copy "%vscode_user_directory%\keybindings.json" %~dp0keybindings.json 