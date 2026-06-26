# Intent-to-Execution-Agent Demo

英文文档：[README.md](README.md)

这是一个面向复杂任务协作的 Agent 产品化 Demo。项目展示了用户如何从模糊目标出发，经过需求澄清、计划确认、任务推进、阶段验收、人工接管和最终交付，完成一个复杂任务闭环。

项目以“电商自动化运营 Agent”为参考场景，但核心流程可以迁移到市场研究、软件开发、活动策划、数据分析等长周期复杂任务。

## 核心能力

- 模糊目标输入与关键需求澄清。
- 结构化目标和执行计划确认。
- 多步骤任务进度和状态推进。
- 可解释事件日志和任务时间线。
- 风险提示、暂停/恢复和人工接管。
- 阶段结果验收和最终交付导出。
- 下一轮优化和持续迭代入口。

## 技术栈

- React
- TypeScript
- Vite
- lucide-react

## 安装

```bash
npm install
```

## 运行 Demo

```bash
npm run dev
```

浏览器访问：

```text
http://127.0.0.1:5173
```

生产构建：

```bash
npm run build
```

本地预览构建产物：

```bash
npm run preview
```

## 演示路径

推荐体验流程：

1. 在目标输入区保留或修改默认目标：“帮我做一个电商自动化运营 Agent，提升店铺销量”。
2. 点击目标澄清操作。
3. 选择平台、运营目标和自动化边界。
4. 生成并确认结构化执行计划。
5. 观察任务进度、事件日志、风险状态和交付状态变化。
6. 在执行中尝试暂停、恢复或人工接管。
7. 结果生成后完成验收，并导出最终交付物。

完整说明见：[docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)。

## 快速预览

![目标输入](assets/screenshots/01_goal_input.png)

![最终交付](assets/screenshots/05_final_delivery.png)

## 项目结构

```text
.
|-- docs/       # 产品规格和 Demo 指南
|-- assets/     # 截图、图示和演示录屏
|-- public/     # 静态资源
|-- src/        # React 应用源码
|-- package.json
`-- vite.config.ts
```

## 文档

- 产品规格：[docs/PROJECT_2_AGENT_USER_FLOW_SPEC.md](docs/PROJECT_2_AGENT_USER_FLOW_SPEC.md)
- Demo 指南：[docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md)

## 说明

本仓库保留 Demo 截图和短录屏作为评审材料。本地依赖、构建产物、日志和本地环境文件已通过 `.gitignore` 忽略，不应提交到仓库。
