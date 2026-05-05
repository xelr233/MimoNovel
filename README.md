# MimoNovel

基于小米 MiMo 大模型的小说有声书生成工具。支持中文/英文小说，自动识别角色、分配音色、生成高质量语音朗读。

## 核心功能

- **小说文本分析** — LLM 自动识别角色对话、旁白、情绪标注
- **多角色音色分配** — 每个角色独立音色，支持预置/设计/克隆三种模式
- **智能风格控制** — 根据上下文自动调整语气、情绪、语速
- **有声书播放** — 内置播放器，支持进度控制、倍速播放
- **音频导出** — 下载 WAV 文件，可导入其他播放器

## 架构

```
┌─────────────────────────────────────────────┐
│              Cloudflare Worker               │
│                                              │
│  ┌──────────┐    ┌───────────────────────┐   │
│  │ 静态前端  │    │  API Proxy Worker     │   │
│  │ (Assets) │    │  - /api/analyze → LLM │   │
│  │          │    │  - /api/tts → TTS     │   │
│  └──────────┘    │  - 隐藏 API Key       │   │
│                  └───────────────────────┘   │
└─────────────────────────────────────────────┘
         ↓                    ↓
   浏览器 UI          MiMo API (新加坡集群)
```

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | React + TypeScript + Vite | SPA 应用 |
| UI | Tailwind CSS + shadcn/ui | 组件库 |
| 状态 | Zustand | 轻量状态管理 |
| 后端 | Hono (Cloudflare Worker) | API 代理 |
| 部署 | Cloudflare Workers + Assets | 边缘部署 |
| 存储 | Cloudflare KV (可选) | 用户配置持久化 |

## MiMo API 使用

### LLM — 小说分析

- **模型**: `mimo-v2.5-pro`
- **协议**: OpenAI 兼容
- **Endpoint**: `https://token-plan-sgp.xiaomimimo.com/v1/chat/completions`
- **用途**: 角色识别、情绪标注、文本分段

### TTS — 语音合成

三种模式，按需选择：

| 模式 | 模型 ID | 场景 |
|------|---------|------|
| 预置音色 | `mimo-v2.5-tts` | 快速上手，8种精品音色 |
| 声音设计 | `mimo-v2.5-tts-voicedesign` | 文本描述生成自定义音色 |
| 声音克隆 | `mimo-v2.5-tts-voiceclone` | 上传音频样本复刻音色 |

**TTS 当前限时免费。**

**预置音色列表**:

| 音色 | Voice ID | 语言 | 性别 |
|------|----------|------|------|
| 冰糖 | 冰糖 | 中文 | 女性 |
| 茉莉 | 茉莉 | 中文 | 女性 |
| 苏打 | 苏打 | 中文 | 男性 |
| 白桦 | 白桦 | 中文 | 男性 |
| Mia | Mia | 英文 | 女性 |
| Chloe | Chloe | 英文 | 女性 |
| Milo | Milo | 英文 | 男性 |
| Dean | Dean | 英文 | 男性 |

**风格控制**: 支持自然语言和音频标签两种方式，可精细控制情绪、语速、语气等。

## 核心流程

```
用户粘贴小说文本
    ↓
POST /api/analyze → MiMo LLM
    返回: [{角色名, 推荐音色, 情绪, 文本段落}]
    ↓
用户确认/调整角色音色分配
    ↓
逐段 POST /api/tts → MiMo TTS
    返回: 音频数据
    ↓
前端拼接 → 播放器播放 / 导出下载
```

## 项目结构

```
MimoNovel/
├── src/
│   ├── worker/              # Cloudflare Worker 后端
│   │   ├── index.ts         # Hono 路由入口
│   │   ├── routes/
│   │   │   ├── analyze.ts   # LLM 分析接口
│   │   │   └── tts.ts       # TTS 合成接口
│   │   └── services/
│   │       ├── mimo-llm.ts  # MiMo LLM 客户端
│   │       └── mimo-tts.ts  # MiMo TTS 客户端
│   └── web/                 # React 前端
│       ├── src/
│       │   ├── App.tsx
│       │   ├── components/
│       │   │   ├── TextInput.tsx       # 文本输入区
│       │   │   ├── CharacterPanel.tsx  # 角色管理面板
│       │   │   ├── VoiceSelector.tsx   # 音色选择器
│       │   │   ├── AudioPlayer.tsx     # 音频播放器
│       │   │   └── ExportDialog.tsx    # 导出对话框
│       │   ├── stores/
│       │   │   ├── novel.ts            # 小说状态
│       │   │   └── audio.ts            # 音频状态
│       │   └── lib/
│       │       ├── api.ts              # API 调用封装
│       │       └── audio-utils.ts      # 音频处理工具
│       └── index.html
├── wrangler.toml            # Cloudflare Worker 配置
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 开发计划

### Phase 1 — MVP
- [ ] 项目脚手架搭建 (Vite + Hono + Cloudflare Worker)
- [ ] LLM 分析接口：输入小说文本，返回角色+情绪+分段
- [ ] TTS 合成接口：单段文本转语音
- [ ] 基础 UI：文本输入 → 角色列表 → 播放器
- [ ] 预置音色支持

### Phase 2 — 增强体验
- [ ] 声音设计模式（文本描述自定义音色）
- [ ] 声音克隆模式（上传音频样本）
- [ ] 风格控制面板（情绪/语速/语气调节）
- [ ] 批量生成 + 进度条
- [ ] 音频导出下载

### Phase 3 — 高级功能
- [ ] 长文本分章处理
- [ ] 用户配置持久化 (KV 存储)
- [ ] 多语言自动检测
- [ ] 背景音乐/音效叠加

## 环境变量

```bash
# Cloudflare Worker 环境变量
MIMO_API_KEY=your_mimo_api_key
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 部署到 Cloudflare
npm run deploy
```

## License

MIT
