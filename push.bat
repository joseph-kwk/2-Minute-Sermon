@echo off
git config user.email "joseph-kwk@users.noreply.github.com"
git config user.name "Joseph Kasongo"
git add .
git commit -m "feat: initial commit - 2-Minute Sermon platform"
git branch -M main
git remote add origin https://github.com/joseph-kwk/2-Minute-Sermon.git
git push -u origin main
