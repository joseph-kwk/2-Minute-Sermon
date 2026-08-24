@echo off
del push.bat
git add -A
git commit -m "chore: remove temp push script"
git push
