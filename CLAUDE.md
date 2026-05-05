# MimoNovel

基于小米 MiMo 大模型的小说有声书生成工具。

## 项目概述

将小说文本转为多角色有声书。核心流程：LLM 分析角色 → 分配音色 → TTS 生成语音 → 播放/导出。

## 技术栈

- 前端：React + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand
- 后端：Hono (Cloudflare Worker)，作为 API 代理隐藏 MiMo API Key
- 部署：Cloudflare Workers + Assets
- API：小米 MiMo 开放平台（新加坡集群）

## API 信息

- LLM Base URL: `https://token-plan-sgp.xiaomimimo.com/v1`
- TTS Base URL: `https://api.xiaomimimo.com/v1`
- 协议：OpenAI 兼容
- 认证：Header `api-key: $MIMO_API_KEY`

### 使用的模型

| 用途 | 模型 ID | temperature |
|------|---------|-------------|
| 角色分析（结构化输出） | `mimo-v2.5-pro` | 0.3 |
| 风格指令生成 | `mimo-v2.5-pro` | 0.8 |
| TTS 预置音色 | `mimo-v2.5-tts` | 0.6 (默认) |
| TTS 声音设计 | `mimo-v2.5-tts-voicedesign` | 0.6 (默认) |
| TTS 声音克隆 | `mimo-v2.5-tts-voiceclone` | 0.6 (默认) |

## 代码规范

- 语言：TypeScript，严格模式
- 前端组件用函数式组件 + hooks
- API 调用统一封装在 `src/worker/services/` 下
- 状态管理用 Zustand，按功能拆分 store
- 样式用 Tailwind CSS，不写自定义 CSS

## 项目结构

- `src/worker/` — Cloudflare Worker 后端（Hono 路由 + API 代理）
- `src/web/` — React 前端
- `wrangler.toml` — Cloudflare Worker 配置

## 关键决策

- TTS 目标文本必须放在 `role: assistant` 的消息中，user 消息放风格指令
- 流式 TTS 目前降级为兼容模式（非真正流式），输出格式用 pcm16
- 预置音色：中文（冰糖/茉莉/苏打/白桦），英文（Mia/Chloe/Milo/Dean）
- TTS 当前限时免费
