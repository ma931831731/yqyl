@echo off
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" "server.mjs" > "%~dp0server.out.log" 2> "%~dp0server.err.log"
