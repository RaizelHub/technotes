$WshShell = New-Object -ComObject WScript.Shell
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetVbs = Join-Path $ScriptDir "TechNotes-Silent.vbs"
$IconPath = Join-Path $ScriptDir "node_modules\electron\dist\electron.exe"

# 1. Desktop Shortcut
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$DesktopShortcutPath = Join-Path $DesktopPath "TechNotes.lnk"
$Shortcut = $WshShell.CreateShortcut($DesktopShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"$TargetVbs`""
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "TechNotes - Technical Support and Cisco Learning Notes"
if (Test-Path $IconPath) {
    $Shortcut.IconLocation = "$IconPath,0"
}
$Shortcut.Save()
Write-Host "Created Desktop Shortcut: $DesktopShortcutPath" -ForegroundColor Green

# 2. Start Menu Shortcut
$StartMenuPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Programs)
$StartMenuShortcutPath = Join-Path $StartMenuPath "TechNotes.lnk"
$StartShortcut = $WshShell.CreateShortcut($StartMenuShortcutPath)
$StartShortcut.TargetPath = "wscript.exe"
$StartShortcut.Arguments = "`"$TargetVbs`""
$StartShortcut.WorkingDirectory = $ScriptDir
$StartShortcut.Description = "TechNotes - Technical Support and Cisco Learning Notes"
if (Test-Path $IconPath) {
    $StartShortcut.IconLocation = "$IconPath,0"
}
$StartShortcut.Save()
Write-Host "Created Start Menu Shortcut: $StartMenuShortcutPath" -ForegroundColor Green

Write-Host "`nTechNotes has been successfully installed on your laptop!" -ForegroundColor Cyan
Write-Host "You can now open it from your Desktop or by searching 'TechNotes' in the Windows Start Menu." -ForegroundColor White
