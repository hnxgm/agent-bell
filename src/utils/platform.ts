import { platform } from "node:os";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export type SupportedPlatform = "darwin" | "linux";

export function getPlatform(): SupportedPlatform {
  const p = platform();
  if (p === "darwin" || p === "linux") return p;
  throw new Error(`Unsupported platform: ${p}. agent-bell supports macOS and Linux.`);
}

export function isWsl(): boolean {
  try {
    const release = readFileSync("/proc/version", "utf8");
    return /microsoft|wsl/i.test(release);
  } catch {
    return false;
  }
}

// Converts a Linux path to its Windows equivalent via wslpath (no shell involved).
export function toWindowsPath(linuxPath: string): string {
  return execFileSync("wslpath", ["-w", linuxPath]).toString().trim();
}

export function getAudioPlayer(): { command: string; volumeArgs: (vol: number) => string[] } {
  const p = getPlatform();

  if (p === "darwin") {
    return {
      command: "afplay",
      volumeArgs: (vol: number) => ["-v", String(vol)],
    };
  }

  // Linux: try paplay first, fall back to aplay
  // WSL is handled separately in audio.ts before this function is called.
  try {
    execFileSync("which", ["paplay"], { stdio: "ignore" });
    return {
      command: "paplay",
      volumeArgs: (vol: number) => [`--volume=${Math.round(vol * 65_536)}`],
    };
  } catch {
    return {
      command: "aplay",
      volumeArgs: () => [], // aplay doesn't support volume control
    };
  }
}
