@echo off
REM ============================================================
REM  Objavi "Prehrana" na GitHub  -  dvoklik na ovu datoteku
REM  Preduvjet: Git (https://git-scm.com) i GitHub CLI "gh"
REM  (https://cli.github.com) s prijavom:  gh auth login
REM ============================================================

cd /d "%~dp0"
set REPO=prehrana

echo.
echo === Priprema repozitorija ===

REM --- init ako jos nije git repo ---
git rev-parse --is-inside-work-tree >nul 2>nul
if not %errorlevel%==0 (
  git init
)

REM --- identitet (ako nije globalno postavljen) ---
git config user.email >nul 2>nul || git config user.email "dolcic.igor@outlook.com"
git config user.name  >nul 2>nul || git config user.name  "Dox"

REM --- commit svih promjena (ako ih ima) ---
git add -A
git commit -m "Prehrana: azuriranje" 2>nul

echo.
echo === Objava na GitHub (%REPO%) ===
where gh >nul 2>nul
if %errorlevel%==0 (
  git remote get-url origin >nul 2>nul
  if %errorlevel%==0 (
    git push -u origin HEAD
  ) else (
    gh repo create %REPO% --public --source=. --remote=origin --push
  )
) else (
  echo GitHub CLI "gh" nije pronaden. Instaliraj ga s https://cli.github.com
  echo ili napravi PRAZAN repo na https://github.com/new pa pokreni:
  echo   git remote add origin https://github.com/^<korisnik^>/%REPO%.git
  echo   git push -u origin HEAD
)

echo.
echo Gotovo.
pause
