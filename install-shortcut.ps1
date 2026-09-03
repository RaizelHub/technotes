$WshShell = New-Object -ComObject WScript.Shell
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ElectronExe = Join-Path $ScriptDir "node_modules\electron\dist\electron.exe"
$MainScript = Join-Path $ScriptDir "electron\main.cjs"

if (-not (Test-Path $ElectronExe)) {
    Write-Error "Electron binary not found at $ElectronExe. Please run 'npm install' first."
    exit 1
}

# 1. Desktop Shortcut
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$DesktopShortcutPath = Join-Path $DesktopPath "TechNotes.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = $ElectronExe
$Shortcut.Arguments = "`"$MainScript`""
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "TechNotes - Technical Support, Cisco, Full-Stack & AI Learning Notebook"
$Shortcut.IconLocation = "$ElectronExe,0"
$Shortcut.Save()
Write-Host "Created Desktop Shortcut: $DesktopShortcutPath" -ForegroundColor Green

# 2. Start Menu Shortcut (Indexed by Windows Search)
$StartMenuPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
$StartMenuShortcutPath = Join-Path $StartMenuPath "TechNotes.lnk"
$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$StartShortcut.TargetPath = $ElectronExe
$StartShortcut.Arguments = "`"$MainScript`""
$StartShortcut.WorkingDirectory = $ScriptDir
$StartShortcut.Description = "TechNotes - Technical Support, Cisco, Full-Stack & AI Learning Notebook"
$StartShortcut.IconLocation = "$ElectronExe,0"
$StartShortcut.Save()
Write-Host "Created Start Menu Shortcut: $StartMenuShortcutPath" -ForegroundColor Green

Write-Host "`nTechNotes has been successfully configured on your system!" -ForegroundColor Cyan
Write-Host "You can now open TechNotes from:" -ForegroundColor White
Write-Host "  1. Windows Search (Press Windows Key and type 'TechNotes')" -ForegroundColor Yellow
Write-Host "  2. Start Menu > All Apps" -ForegroundColor Yellow
Write-Host "  3. Desktop Shortcut" -ForegroundColor Yellow
