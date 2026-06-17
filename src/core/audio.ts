import { existsSync } from "node:fs";
import { getAudioPlayer, isWsl, toWindowsPath } from "../utils/platform.js";
import { spawnWithTimeout } from "../utils/spawn.js";
import { logToFile } from "../utils/logger.js";

function playSoundWsl(filePath: string, volume: number): void {
  // Convert the Linux path to a Windows path so PowerShell can open it.
  // Pass it as an env var to avoid any shell-quoting/injection issues.
  const winPath = toWindowsPath(filePath);
  const vol = volume.toFixed(2);
  // Use MediaPlayer (presentationCore) for volume control.
  // The file path is read from $env:AB_SOUND_FILE — never interpolated as code.
  const script = [
    "Add-Type -AssemblyName presentationCore;",
    "$m = [System.Windows.Media.MediaPlayer]::new();",
    "$m.Open([Uri]::new($env:AB_SOUND_FILE));",
    `$m.Volume = ${vol};`,
    "$m.Play();",
    "Start-Sleep -Milliseconds 3000;",
    "$m.Close()",
  ].join(" ");

  spawnWithTimeout(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
    { env: { ...process.env, AB_SOUND_FILE: winPath } },
  );
}

export function playSound(filePath: string, volume = 0.7): void {
  if (!existsSync(filePath)) return;

  try {
    if (isWsl()) {
      playSoundWsl(filePath, volume);
      return;
    }

    const player = getAudioPlayer();
    const args = [...player.volumeArgs(volume), filePath];
    spawnWithTimeout(player.command, args);
  } catch (error) {
    logToFile(`Failed to play sound: ${filePath}`, error);
  }
}
