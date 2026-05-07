# TTS Studio 页面设计文档

## 概述

新增一个独立的 TTS Studio 页面，用于调试和体验 MiMo TTS 的三种模型（预置音色 / 音色设计 / 音色克隆）。用户可以在该页面上自由选择模型、配置音色、输入文本并试听合成效果。

## 技术方案

### 路由

不引入 react-router，在 Header 中添加导航 Tab，通过顶层 `page` state 切换视图：
- **首页** — 现有的小说有声书生成流程
- **Studio** — TTS 调试/试听页面

### 页面布局

```
┌─────────────────────────────────────────────┐
│ Header  [首页]  [Studio]         [GitHub]   │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─ TTS 模型选择 ─────────────────────────┐ │
│  │  [预置音色]  [音色设计]  [音色克隆]      │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ 音色配置 ─────────────────────────────┐ │
│  │  预置音色: 下拉选择 (8个预置音色)       │ │
│  │  音色设计: 文本描述输入框               │ │
│  │  音色克隆: 音频文件上传                 │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ 风格控制 (可选) ──────────────────────┐ │
│  │  自然语言风格指令输入框                 │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  ┌─ 合成文本 ─────────────────────────────┐ │
│  │  多行文本输入框                         │ │
│  └────────────────────────────────────────┘ │
│                                             │
│  [生成语音]                                 │
│                                             │
│  ┌─ 试听 ─────────────────────────────────┐ │
│  │  ▶ ━━━━━━━━━━━━━━━━━━━━━━━ 00:00/00:00 │ │
│  └────────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

### TTS 模型与参数映射

| 模型 | Model ID | voice 参数 | user message | assistant message |
|------|----------|-----------|-------------|------------------|
| 预置音色 | `mimo-v2.5-tts` | 预置音色 ID（如 `冰糖`） | 风格指令（可选） | 合成文本 |
| 音色设计 | `mimo-v2.5-tts-voicedesign` | 不传 | 音色描述（必填） | 合成文本 |
| 音色克隆 | `mimo-v2.5-tts-voiceclone` | `data:{mime};base64,{audio}` | 风格指令（可选） | 合成文本 |

### API 变更

#### 前端 `api.ts`

扩展 `synthesizeSpeech` 支持完整参数：
```typescript
export async function synthesizeSpeech(
  text: string,
  options: {
    voice?: string;
    style?: string;
    model?: string;
  } = {}
): Promise<string>
```

#### 后端 `tts.ts` 路由

已有 `model` 参数支持，无需修改路由层。

#### 后端 `mimo-tts.ts` 服务

已有 `model` 参数支持。音色克隆场景下 `voice` 为 base64 data URI，当前实现直接透传，无需修改。

### 预置音色列表

| 音色名 | Voice ID | 语言 | 性别 |
|--------|----------|------|------|
| 冰糖 | 冰糖 | 中文 | 女性 |
| 茉莉 | 茉莉 | 中文 | 女性 |
| 苏打 | 苏打 | 中文 | 男性 |
| 白桦 | 白桦 | 中文 | 男性 |
| Mia | Mia | 英文 | 女性 |
| Chloe | Chloe | 英文 | 女性 |
| Milo | Milo | 英文 | 男性 |
| Dean | Dean | 英文 | 男性 |

### AI 辅助生成

Studio 页面集成了 MiMo V2.5 Pro 作为 AI 辅助，帮助用户快速生成音色描述和合成文本。

#### 功能点

| 位置 | 触发方式 | 说明 |
|------|---------|------|
| 音色描述输入框 | 点击「AI 生成」按钮 | 输入几个关键词，LLM 扩写为完整的音色设计描述 |
| 合成文本输入框 | 点击「AI 生成」按钮 | 根据当前音色描述，LLM 生成匹配的合成文本 |

#### 后端 API

新增 `POST /api/generate` 端点（`src/worker/routes/generate.ts`）：

```typescript
// 请求
{ type: "voice-desc" | "synthesis-text", prompt: string }

// 响应
{ text: string }
```

- `voice-desc`：将关键词扩写为详细的音色设计描述（参考 MiMo TTS voice design 最佳实践）
- `synthesis-text`：根据音色描述生成适合朗读的文本（50-150 字，有情感起伏）
- 模型：`mimo-v2.5-pro`，temperature: 0.8

#### 交互流程

```
用户输入关键词（如"温柔治愈女声"）
  → 点击「AI 生成」
  → LLM 扩写为完整音色描述
  → 用户可手动微调
  → 点击「AI 生成」生成匹配文本
  → 用户可手动微调
  → 生成语音 → 试听
```

### 文件变更清单

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/web/src/App.tsx` | 修改 | 添加 page state，切换首页/Studio 视图 |
| `src/web/src/components/Header.tsx` | 修改 | 添加导航 Tab（首页 / Studio） |
| `src/web/src/lib/api.ts` | 修改 | `synthesizeSpeech` 支持 model 参数，新增 `generateText` |
| `src/web/src/components/Studio.tsx` | 新增 | Studio 页面主组件（含 AI 辅助） |
| `src/worker/routes/generate.ts` | 新增 | AI 文本生成 API 端点 |
| `src/worker/index.ts` | 修改 | 注册 generate 路由 |
| `docs/tts-studio.md` | 新增 | 本文档 |

### 设计规范

- 遵循现有 UI 风格：深色主题（ink-950 背景）、amber 高亮、圆角卡片
- 使用 Tailwind CSS，不写自定义 CSS
- 使用现有动画类（`animate-fade-in-up`）
- 组件使用函数式组件 + hooks

### 流式支持（预留）

当前 MiMo TTS 的流式为兼容模式（非真正低延迟），Studio 页面不实现流式播放。架构上预留：
- 后端 TTS service 已支持 `format: "pcm16"` 参数
- 未来 MiMo 真正流式上线后，前端播放器可扩展 chunk 拼接能力
