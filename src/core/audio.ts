import { existsSync, copyFileSync, unlinkSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { getAudioPlayer, isWsl, toWindowsPath } from "../utils/platform.js";
import { spawnWithTimeout } from "../utils/spawn.js";
import { logToFile } from "../utils/logger.js";

function playSoundWsl(filePath: string): void {
  // SoundPlayer cannot read from \\wsl.localhost\ UNC paths.
  // Copy the wav to the Windows TEMP directory first, then play and delete.
  const winTemp = execFileSync("powershell.exe", [
    "-NoProfile", "-NonInteractive", "-Command", "[System.IO.Path]::GetTempPath()",
  ]).toString().trim();
  const winTempLinux = execFileSync("wslpath", ["-u", winTemp])
    .toString().trim();
  const tmpFile = `${winTempLinux}/agent-bell-${Date.now()}.wav`;

  copyFileSync(filePath, tmpFile);
  const tmpWinPath = toWindowsPath(tmpFile);

  const script = `(New-Object Media.SoundPlayer '${tmpWinPath.replaceAll("'", "''")}').PlaySync()`;

  spawnWithTimeout(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", script],
  );

  // Clean up after a delay longer than the longest wav file (~3s)
  setTimeout(() => {
    try { unlinkSync(tmpFile); } catch { /* already gone */ }
  }, 10_000);
}

export function playSound(filePath: string, volume = 0.7): void {
  if (!existsSync(filePath)) return;

  try {
    if (isWsl()) {
      playSoundWsl(filePath);
      return;
    }

    const player = getAudioPlayer();
    const args = [...player.volumeArgs(volume), filePath];
    spawnWithTimeout(player.command, args);
  } catch (error) {
    logToFile(`Failed to play sound: ${filePath}`, error);
  }
}
