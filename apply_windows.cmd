set vscode_user_directory=%APPDATA%\Code\User
copy %~dp0settings.json "%vscode_user_directory%\settings.json"
copy %~dp0keybindings.json "%vscode_user_directory%\keybindings.json"