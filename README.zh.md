# agent-bell

**AI 编程助手的音频提醒工具 — 任务完成、出错或需要你决策时，第一时间知晓。**

[![npm version](https://img.shields.io/npm/v/agent-bell)](https://www.npmjs.com/package/agent-bell)
[![license](https://img.shields.io/npm/l/agent-bell)](LICENSE)
[![node](https://img.shields.io/node/v/agent-bell)](package.json)

---

## 功能介绍

agent-bell 会在 AI 编程助手完成任务、遇到错误或需要你输入时播放声音提醒。它直接接入 **Claude Code**、**Cursor**、**Gemini CLI** 和 **OpenCode**，让你可以离开终端，依然不错过任何动态。

- 主题化音频提醒，支持升级模式（若长时间无响应则音量加大）
- 桌面横幅通知（可点击 — 自动切换到对应窗口）
- 终端响铃、文字转语音（TTS）及 tmux 状态栏提示
- 每个工具独立冷却时间，防止通知刷屏
- 零配置上手 — `npx agent-bell init` 向导一步搞定

## 快速开始

```bash
npx agent-bell init
```

交互式向导将：

1. 自动检测已安装的 AI 工具（Claude Code、Cursor、Gemini CLI、OpenCode）
2. 让你选择触发事件、通知方式和音效主题
3. 自动安装 hooks — 完成

或者全局安装：`npm install -g agent-bell`

更新：`npm update -g agent-bell`（使用 npx 时运行 `npx agent-bell@latest init`）。

更新后运行 `agent-bell doctor` 验证配置。如果你自定义了 hooks，请重新运行 `agent-bell init` 以获取新的事件或 hook 格式变更。

## 支持的工具

| 工具            | Hook 机制                                                                        |
| --------------- | -------------------------------------------------------------------------------- |
| **Claude Code** | 写入 `~/.claude/settings.json`，监听 `Stop`、`StopFailure` 和 `Notification` 事件 |
| **Cursor**      | 在 Cursor 配置中安装事件 hooks                                                   |
| **Gemini CLI**  | 写入 Gemini 配置文件，使用基于 matcher 的 hooks                                  |
| **OpenCode**    | 写入 OpenCode 配置，使用基于事件的插件                                           |

Hooks 调用 `agent-bell play <event> --source <tool>`，这是一条快速路径命令，跳过完整 CLI 框架的加载。

## 事件

| 事件            | 说明                                    | 默认状态 |
| --------------- | --------------------------------------- | -------- |
| `task-complete` | 智能体完成任务                          | 开启     |
| `needs-input`   | 智能体等待你的输入（权限确认、空闲中）  | 开启     |
| `error`         | 智能体遇到错误                          | 开启     |
| `session-start` | 新的智能体会话开始                      | 关闭     |
| `tool-use`      | 智能体调用了工具                        | 关闭     |

## 通知方式

| 方式              | 说明                                       | 默认状态 |
| ----------------- | ------------------------------------------ | -------- |
| **声音**          | 通过系统音频播放主题化 `.wav` 文件         | 开启     |
| **桌面通知**      | macOS/Linux 横幅通知（可点击聚焦到窗口）   | 开启     |
| **终端响铃**      | 触发终端内置响铃（`\a`）                   | 开启     |
| **语音播报（TTS）** | 朗读事件内容                             | 关闭     |
| **Tmux**          | 在 tmux 状态栏设置提示标志                 | 关闭     |

## 音效主题

内置三套主题，每套包含普通版和升级版音效：

| 主题                    | 风格                     |
| ----------------------- | ------------------------ |
| **galactic**（默认）    | 太空感、未来科技风音效   |
| **arcane**              | 神秘魔法风音效           |
| **cyberpunk**           | 霓虹赛博朋克风音效       |

预听主题：

```bash
agent-bell themes preview galactic
```

从包含 `theme.json` 清单和 `.wav` 文件的目录添加自定义主题：

```bash
agent-bell themes add ./my-theme
```

想自制主题？参见[创建自定义主题](docs/custom-themes.md)。

## 智能特性

### 冷却时间

防止通知刷屏。默认每个工具之间至少间隔 **3 秒**。冷却期内触发的事件会被静默忽略。

### 升级提醒

若超过 **30 秒**（可配置）没有响应，下一次通知将播放升级版音效 — 音量更大、更抓人注意。与工具交互后自动重置。

## 配置与 CLI

配置文件存储在 `~/.agent-bell/config.json`，通过 CLI 管理：

```bash
agent-bell config show              # 查看当前配置
agent-bell config set theme cyberpunk
agent-bell config set volume 0.5
agent-bell config set cooldown 5
agent-bell config set notifications.say true
```

嵌套键支持点号语法（如 `notifications.desktop`、`tools.claude.enabled`）。

| 命令                                  | 说明                                                                 |
| ------------------------------------- | -------------------------------------------------------------------- |
| `agent-bell init`                     | 交互式配置向导                                                       |
| `agent-bell play <event>`             | 播放提醒音效（由 hooks 调用）                                        |
| `agent-bell config show`              | 查看当前配置                                                         |
| `agent-bell config set <key> <value>` | 设置配置项                                                           |
| `agent-bell themes list`              | 列出可用主题                                                         |
| `agent-bell themes preview <name>`    | 预听主题音效                                                         |
| `agent-bell themes add <path>`        | 从目录添加自定义主题                                                 |
| `agent-bell status`                   | 显示当前配置和 hook 状态                                             |
| `agent-bell pause`                    | 临时静音所有通知                                                     |
| `agent-bell resume`                   | 恢复通知                                                             |
| `agent-bell test`                     | 发送测试通知验证配置                                                 |
| `agent-bell doctor`                   | 诊断常见问题                                                         |
| `agent-bell uninstall`                | 移除所有 hooks（加 `--remove-config` 同时删除 `~/.agent-bell/`）     |

## 使用技巧

### 减少 needs-input 通知

每次 Claude Code 权限确认都会触发 `needs-input` 通知。预先授予基础只读权限可减少这类打扰。在 `~/.claude/settings.json` 中添加：

```json
{
  "permissions": {
    "allow": [
      "Bash(cat:*)", "Bash(find:*)", "Bash(grep:*)",
      "Bash(head:*)", "Bash(tail:*)", "Bash(wc:*)", "Bash(ls:*)",
      "Bash(gh api:*)", "Bash(gh pr view:*)", "Bash(gh pr list:*)",
      "Bash(gh pr checks:*)", "Bash(gh pr diff:*)", "Bash(gh repo view:*)",
      "Bash(gh run view:*)", "Bash(gh run list:*)",
      "Bash(gh issue view:*)", "Bash(gh issue list:*)",
      "Bash(gh workflow list:*)", "Bash(gh workflow view:*)"
    ]
  }
}
```

同理，其他工具预授权越多，被打断就越少。

### 根据工作流调整冷却时间

如果智能体频繁连续调用工具，适当增大冷却时间可避免通知轰炸：

```bash
agent-bell config set cooldown 10
```

## 常见问题

**如何更新？**
`npm update -g agent-bell` 或 `npx agent-bell@latest init`，更新后运行 `agent-bell doctor`。

**`needs-input` 通知太多？**
预授予只读权限减少权限确认提示，参见[使用技巧](#减少-needs-input-通知)。

**不全局安装能用吗？**
可以 — `npx agent-bell init` 无需全局安装即可使用。

**如何临时静音？**
`agent-bell pause` 静音，`agent-bell resume` 恢复。

**通知没有声音？**
运行 `agent-bell doctor` 和 `agent-bell test`，再用 `agent-bell status` 检查 hooks 状态。

**Linux 下能用吗？**
声音和桌面通知正常工作，TTS 需要安装 `espeak` 或类似工具。

**WSL 下能用吗？**
支持。音频会自动通过 PowerShell 路由到 Windows 音频系统播放，无需配置 PulseAudio。

**不同工具能用不同配置吗？**
暂不支持，已在路线图中。目前所有工具共享同一套配置。

## 工作原理

1. `agent-bell init` 将 hooks 安装到 AI 工具的配置文件
2. 工具触发事件时（如任务完成），hook 运行 `agent-bell play <event>`
3. `play` 命令走快速路径 — 跳过 Commander，只加载必要模块
4. 根据你的配置，播放声音、发送桌面通知、响终端铃等
5. 冷却和升级逻辑在防止刷屏的同时确保你不错过重要事件

## 环境要求

- **Node.js** >= 18
- **macOS**（主平台）— 全面支持所有通知方式
- **Linux** — 支持声音和桌面通知；TTS 需要 `espeak` 或类似工具
- **WSL**（Windows Subsystem for Linux）— 支持，音频通过 PowerShell 桥接到 Windows 播放

## 许可证

[MIT](LICENSE)
