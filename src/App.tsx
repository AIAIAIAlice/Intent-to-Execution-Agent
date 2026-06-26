import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clipboard,
  Clock3,
  Database,
  Download,
  FileText,
  Gauge,
  Hand,
  Layers3,
  Pause,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Upload,
  UserRoundCheck,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "zh" | "en";
type TaskStatus = "Pending" | "Running" | "Need Confirmation" | "Failed" | "Completed";
type FlowStage =
  | "GoalInput"
  | "GoalClarification"
  | "PlanConfirmation"
  | "Execution"
  | "ErrorRecovery"
  | "ResultReview"
  | "FinalDelivery"
  | "Iteration"
  | "Interrupted"
  | "HumanHandoff";

type Task = { id: number; status: TaskStatus };
type Event = { id: number; time: string; title: string; detail: string; tone: "neutral" | "success" | "warning" | "danger" };
type Option = { id: string; label: string };

const optionIds = {
  platforms: ["taobao", "douyin", "xiaohongshu", "shopify", "amazon"],
  goals: ["newUsers", "conversion", "repurchase", "clearStock", "aov"],
  automation: ["suggest", "semiAuto", "fullAuto"],
} as const;

const translations = {
  zh: {
    subtitle: "智能体编排控制台",
    stageChip: {
      DISCOVER: "发现阶段 · DISCOVER",
      CLARIFY: "澄清阶段 · CLARIFY",
      APPROVE: "确认阶段 · APPROVE",
      EXECUTE: "执行阶段 · EXECUTE",
      RECOVER: "恢复阶段 · RECOVER",
      REVIEW: "验收阶段 · REVIEW",
      DELIVER: "交付阶段 · DELIVER",
      ITERATE: "迭代阶段 · ITERATE",
      PAUSED: "暂停阶段 · PAUSED",
      HANDOFF: "接管阶段 · HANDOFF",
    },
    topStatus: { completed: "已完成", human: "人工接管", blocked: "已阻塞", waiting: "等待确认", running: "执行中" },
    labels: {
      userControl: "USER CONTROL",
      contextOutput: "CONTEXT & OUTPUT",
      currentStage: "CURRENT STAGE",
      leftTitle: "目标输入与确认",
      goal: "目标",
      platform: "平台",
      target: "目标",
      scope: "边界",
      quickSelect: "快速选择",
      objective: "运营目标",
      automation: "自动化边界",
      keyConfirm: "关键确认",
      controls: "操作",
      status: "状态",
      next: "下一步",
      permission: "权限",
      taskDone: "任务已完成",
      queued: "等待中",
      blocked: "阻塞",
      planProgress: "计划进度",
      currentHighlighted: "当前任务高亮",
      eventTimeline: "事件时间线",
      explainableLog: "可解释执行日志",
      contextRiskDelivery: "上下文 / 风险 / 交付",
      contextSummary: "上下文摘要",
      riskRecovery: "风险与兜底",
      finalDelivery: "最终交付",
      primaryDelivery: "核心交付",
      supportingDelivery: "补充交付",
      executiveSummary: "EXECUTIVE SUMMARY",
    },
    stage: {
      GoalInput: { title: "等待目标确认", description: "从一个模糊目标开始，先澄清目标，再生成可执行计划。", step: "DISCOVER" },
      GoalClarification: { title: "需求澄清", description: "只追问影响执行方案的关键决策。", step: "CLARIFY" },
      PlanConfirmation: { title: "计划待确认", description: "执行计划已生成，需先确认范围与边界。", step: "APPROVE" },
      Execution: { title: "Agent 执行中", description: "持续推进任务，并在关键节点进行校验与记录。", step: "EXECUTE" },
      ErrorRecovery: { title: "异常恢复", description: "受影响分支已暂停，请选择安全兜底方案。", step: "RECOVER" },
      ResultReview: { title: "结果验收", description: "中间结果已生成，等待用户确认是否继续交付。", step: "REVIEW" },
      FinalDelivery: { title: "交付完成", description: "最终结果、风险说明与优化建议已汇总。", step: "DELIVER" },
      Iteration: { title: "后续迭代", description: "进入实验、监控和周期复盘。", step: "ITERATE" },
      Interrupted: { title: "已暂停", description: "当前状态和最近检查点已保存。", step: "PAUSED" },
      HumanHandoff: { title: "人工接管", description: "Agent 已冻结风险动作并移交人工处理。", step: "HANDOFF" },
    },
    status: {
      Pending: "排队",
      Running: "执行中",
      "Need Confirmation": "等待确认",
      Failed: "阻塞",
      Completed: "完成",
    },
    relation: { current: "当前", next: "下一步", done: "完成", queued: "等待中" },
    options: {
      platforms: ["淘宝", "抖音小店", "小红书", "Shopify", "Amazon"],
      goals: ["拉新", "提升转化", "复购", "清库存", "提升客单价"],
      automation: ["只给建议", "半自动执行", "全自动执行"],
    },
    tasks: [
      { title: "解析目标", detail: "识别用户意图、约束条件与未知信息" },
      { title: "澄清上下文", detail: "确认平台、运营目标与自动化边界" },
      { title: "结构化目标", detail: "生成可验证的目标状态与成功指标" },
      { title: "生成执行计划", detail: "拆解依赖、里程碑与验收标准" },
      { title: "数据与权限", detail: "配置最小必要数据源和访问权限" },
      { title: "读取业务数据", detail: "读取订单、商品、库存与流量数据" },
      { title: "诊断运营问题", detail: "定位流量、转化、库存和复购缺口" },
      { title: "生成优化策略", detail: "输出按优先级排序的运营动作" },
      { title: "用户验收确认", detail: "预览中间结果并确认是否继续交付" },
      { title: "输出最终交付", detail: "汇总报告、配置清单和下一步计划" },
    ],
    confirmCard: {
      badge: "需要用户确认",
      title: "从模糊目标开始",
      body: "Agent 不会立即执行操作。请先确认目标，随后系统会生成最少必要澄清问题与透明执行计划。",
    },
    buttons: {
      start: "开始澄清目标",
      buildPlan: "生成结构化计划",
      confirmExecute: "确认并执行",
      resume: "从检查点恢复",
      returnAgent: "交还 Agent",
      pause: "暂停",
      handoff: "人工接管",
      retry: "重新授权",
      uploadCsv: "上传 CSV",
      sampleData: "使用样例数据",
      approveDeliver: "验收并交付",
      export: "导出 Markdown",
      copy: "复制结果",
      copied: "已复制",
      nextIteration: "下一轮优化",
    },
    confirmation: {
      title: "执行边界确认",
      body: "允许自动读取与分析；改价、投放、删除、发布等高风险动作必须再次确认。",
    },
    banners: {
      toolFailure: "TOOL FAILURE / SAFE PAUSE",
      authTitle: "平台 API 授权失败",
      authBody: "请求返回 401。受影响分支已暂停，其余产物保留。",
      milestone: "MILESTONE REVIEW",
      resultTitle: "中间结果已生成",
      resultBody: "已发现 3 类运营问题，并生成优先级建议。",
      human: "HUMAN IN CONTROL",
      humanTitle: "人工接管中",
      humanBody: "Agent 已冻结冲突动作，并整理完整上下文。",
    },
    emptyTimeline: {
      title: "等待任务启动",
      body: "目标、状态、风险、恢复动作和用户决策会记录在这里。",
    },
    summary: {
      pending: "待确认",
      metricPending: "待定义",
      metricPrefix: "30 天内提升",
      platformPending: "平台待确认",
      targetPending: "目标待确认",
      scopePending: "边界待确认",
      metricLabelPending: "指标待定义",
    },
    risk: {
      attention: "项需要确认",
      lowRisk: "低风险任务可继续推进",
      action: "需处理",
      review: "待确认",
      initial: ["平台未确认", "成功指标未定义", "自动化边界不清晰"],
      recovery: ["实时数据不可用", "需要重新授权", "当前使用样例数据路径"],
      highNeedsApproval: "高风险动作需要审批",
      highManual: "高风险动作保持人工确认",
    },
    delivery: {
      main: ["结构化需求", "工作流配置", "测试报告"],
      supporting: ["功能清单", "风险策略", "优化建议"],
      ready: "就绪",
      draft: "草稿",
      pending: "排队",
      completedTitle: "Agent MVP 已完成",
      completedBody: "建议进入 7 天小流量试运行。",
      footerWait: "验收后开放最终交付",
    },
    states: {
      ready: "就绪",
      waiting: "等待中",
      completed: "完成",
      permissionDefault: "未配置",
      riskDefault: "未知",
      pendingApproval: "等待授权",
      assessing: "评估中",
      configuring: "配置中",
      readonly: "只读权限已授权",
      authFailed: "授权失败",
      sampleData: "使用样例数据",
    },
    events: {
      goalReceived: "目标已接收",
      gapIdentified: "缺口已识别",
      gapDetail: "需要确认平台、运营目标与自动化边界。",
      contextClarified: "上下文已确认",
      goalStructured: "目标已结构化",
      mappedGoal: (goal: string) => `已将增长目标映射为「${goal}」。`,
      planPending: "计划待确认",
      planPendingDetail: "高风险动作默认拦截，需用户确认后继续。",
      planApproved: "执行计划已确认",
      planApprovedDetail: "允许读取与分析；改价、投放、删除、发布仍需单独确认。",
      permissionReady: "权限已就绪",
      permissionReadyDetail: (platform: string) => `${platform} 只读权限已连接。`,
      dataFailed: "数据读取失败",
      dataFailedDetail: "第三方平台 API 返回 401。",
      retryAuth: "重新授权",
      retryAuthDetail: "模拟环境中授权仍不可用。",
      waitCsv: "等待 CSV",
      waitCsvDetail: "已生成数据上传模板。",
      fallback: "兜底方案已启用",
      fallbackDetail: "使用脱敏样例数据继续演示流程。",
      diagnosisDone: "诊断完成",
      diagnosisDetail: "发现转化缺口、12 个滞销 SKU 与复购触点缺失。",
      resultReady: "结果待验收",
      resultReadyDetail: "等待用户确认中间结果。",
      reviewPassed: "验收通过",
      reviewPassedDetail: "进入最终交付生成。",
      delivered: "交付完成",
      deliveredDetail: "需求文档、工作流、策略与检查清单已生成。",
      paused: "任务已暂停",
      pausedDetail: "当前检查点已保存。",
      resumed: "已恢复",
      resumedDetail: "从最近检查点继续执行。",
      handoff: "人工接管",
      handoffDetail: "冲突动作已冻结，并已整理上下文。",
      returned: "已交还 Agent",
      returnedDetail: "Agent 从安全检查点继续执行。",
      nextIteration: "下一轮优化",
      nextIterationDetail: "创建 7 天实验计划与周期复盘机制。",
    },
    report: {
      title: "Agent 最终交付报告",
      goal: "目标",
      platform: "平台",
      objective: "运营目标",
      automation: "自动化边界",
      permission: "权限状态",
      risk: "风险等级",
      unknown: "未确认",
      findings: "关键发现",
      findingList: ["商品详情页转化低于基准", "存在 12 个滞销 SKU", "复购触达链路缺失"],
    },
  },
  en: {
    subtitle: "ORCHESTRATION CONSOLE",
    stageChip: {
      DISCOVER: "DISCOVER",
      CLARIFY: "CLARIFY",
      APPROVE: "APPROVE",
      EXECUTE: "EXECUTE",
      RECOVER: "RECOVER",
      REVIEW: "REVIEW",
      DELIVER: "DELIVER",
      ITERATE: "ITERATE",
      PAUSED: "PAUSED",
      HANDOFF: "HANDOFF",
    },
    topStatus: { completed: "Completed", human: "Human", blocked: "Blocked", waiting: "Awaiting Input", running: "Running" },
    labels: {
      userControl: "USER CONTROL",
      contextOutput: "CONTEXT & OUTPUT",
      currentStage: "CURRENT STAGE",
      leftTitle: "Input / Confirm / Handoff",
      goal: "Goal",
      platform: "Platform",
      target: "Target",
      scope: "Scope",
      quickSelect: "Quick Select",
      objective: "Objective",
      automation: "Automation Boundary",
      keyConfirm: "Key Confirmation",
      controls: "Controls",
      status: "Status",
      next: "Next",
      permission: "Permission",
      taskDone: "tasks completed",
      queued: "queued",
      blocked: "blocked",
      planProgress: "Plan Progress",
      currentHighlighted: "Current task highlighted",
      eventTimeline: "Event Timeline",
      explainableLog: "Explainable execution log",
      contextRiskDelivery: "Context / Risk / Delivery",
      contextSummary: "Context Summary",
      riskRecovery: "Risk / Recovery",
      finalDelivery: "Final Delivery",
      primaryDelivery: "Primary Delivery",
      supportingDelivery: "Supporting Delivery",
      executiveSummary: "EXECUTIVE SUMMARY",
    },
    stage: {
      GoalInput: { title: "Waiting for Goal", description: "Start from a fuzzy goal, then clarify and build an executable plan.", step: "DISCOVER" },
      GoalClarification: { title: "Clarification", description: "Ask only for decisions that change the execution plan.", step: "CLARIFY" },
      PlanConfirmation: { title: "Plan Ready", description: "Plan is ready. Confirm scope and boundaries before execution.", step: "APPROVE" },
      Execution: { title: "Agent Executing", description: "Keep progressing while validating and logging key checkpoints.", step: "EXECUTE" },
      ErrorRecovery: { title: "Recovery", description: "Affected branch paused. Select a safe fallback path.", step: "RECOVER" },
      ResultReview: { title: "Result Review", description: "Intermediate result is ready for user acceptance.", step: "REVIEW" },
      FinalDelivery: { title: "Delivered", description: "Final result, risks and recommendations are consolidated.", step: "DELIVER" },
      Iteration: { title: "Iteration", description: "Move into experiments, monitoring and review cadence.", step: "ITERATE" },
      Interrupted: { title: "Paused", description: "Current state and latest checkpoint are saved.", step: "PAUSED" },
      HumanHandoff: { title: "Human Handoff", description: "Agent froze risky actions and handed off control.", step: "HANDOFF" },
    },
    status: {
      Pending: "Pending",
      Running: "Running",
      "Need Confirmation": "Awaiting Input",
      Failed: "Blocked",
      Completed: "Done",
    },
    relation: { current: "Current", next: "Next", done: "Done", queued: "Queued" },
    options: {
      platforms: ["Taobao", "Douyin Store", "Xiaohongshu", "Shopify", "Amazon"],
      goals: ["New Users", "Conversion", "Repurchase", "Clear Stock", "AOV"],
      automation: ["Suggest Only", "Semi-Auto", "Full-Auto"],
    },
    tasks: [
      { title: "Parse Goal", detail: "Identify intent, constraints and unknowns" },
      { title: "Clarify Context", detail: "Confirm platform, objective and automation boundary" },
      { title: "Structure Goal", detail: "Create verifiable goal state and success metrics" },
      { title: "Build Plan", detail: "Break down dependencies, milestones and acceptance criteria" },
      { title: "Data / Permissions", detail: "Configure minimum necessary data and access" },
      { title: "Ingest Data", detail: "Read order, product, inventory and traffic data" },
      { title: "Diagnose Issues", detail: "Locate traffic, conversion, inventory and retention gaps" },
      { title: "Generate Strategy", detail: "Output prioritized operating actions" },
      { title: "User Acceptance", detail: "Preview intermediate result and confirm delivery" },
      { title: "Final Delivery", detail: "Consolidate report, configs and next-step plan" },
    ],
    confirmCard: {
      badge: "USER CONFIRMATION REQUIRED",
      title: "Start from fuzzy goal",
      body: "Agent will not execute immediately. Confirm the goal first, then receive minimal clarification questions and a transparent execution plan.",
    },
    buttons: {
      start: "Start Clarification",
      buildPlan: "Build Structured Plan",
      confirmExecute: "Confirm & Execute",
      resume: "Resume from Checkpoint",
      returnAgent: "Return Control",
      pause: "Pause",
      handoff: "Human Takeover",
      retry: "Retry Auth",
      uploadCsv: "Upload CSV",
      sampleData: "Use Sample Data",
      approveDeliver: "Approve & Deliver",
      export: "Export Markdown",
      copy: "Copy Result",
      copied: "Copied",
      nextIteration: "Next Iteration",
    },
    confirmation: {
      title: "Execution Boundary Confirmation",
      body: "Read and analysis are approved; pricing, ads, deletion and publishing still require explicit confirmation.",
    },
    banners: {
      toolFailure: "TOOL FAILURE / SAFE PAUSE",
      authTitle: "Platform API auth failed",
      authBody: "Request returned 401. The affected branch is paused and other artifacts are preserved.",
      milestone: "MILESTONE REVIEW",
      resultTitle: "Intermediate result ready",
      resultBody: "Three issue clusters found with prioritized recommendations.",
      human: "HUMAN IN CONTROL",
      humanTitle: "Human takeover active",
      humanBody: "Agent froze conflicting actions and prepared full context.",
    },
    emptyTimeline: {
      title: "Waiting for task start",
      body: "Goal, status, risk, recovery actions and user decisions appear here.",
    },
    summary: {
      pending: "TBD",
      metricPending: "TBD",
      metricPrefix: "Improve ",
      platformPending: "Platform TBD",
      targetPending: "Target TBD",
      scopePending: "Scope TBD",
      metricLabelPending: "Metric TBD",
    },
    risk: {
      attention: "items need attention",
      lowRisk: "Low-risk work can continue",
      action: "Action",
      review: "Review",
      initial: ["Platform unknown", "Metric undefined", "Automation boundary unclear"],
      recovery: ["Live data unavailable", "Auth recovery needed", "Running on sample path"],
      highNeedsApproval: "High-risk actions need approval",
      highManual: "High-risk actions stay manual",
    },
    delivery: {
      main: ["Requirements", "Workflow Config", "Test Report"],
      supporting: ["Feature List", "Risk Policy", "Optimization Plan"],
      ready: "Ready",
      draft: "Draft",
      pending: "Pending",
      completedTitle: "Agent MVP completed",
      completedBody: "Recommend a 7-day limited rollout.",
      footerWait: "Delivery opens after acceptance",
    },
    states: {
      ready: "Ready",
      waiting: "Waiting",
      completed: "Done",
      permissionDefault: "Unconfigured",
      riskDefault: "Unknown",
      pendingApproval: "Pending Approval",
      assessing: "Assessing",
      configuring: "Configuring",
      readonly: "Read-only granted",
      authFailed: "Auth failed",
      sampleData: "Sample data",
    },
    events: {
      goalReceived: "Goal Received",
      gapIdentified: "Gap Identified",
      gapDetail: "Need platform, objective and automation boundary.",
      contextClarified: "Context Clarified",
      goalStructured: "Goal Structured",
      mappedGoal: (goal: string) => `Mapped sales goal to ${goal}.`,
      planPending: "Plan Pending",
      planPendingDetail: "High-risk actions are blocked by default until confirmed.",
      planApproved: "Plan Approved",
      planApprovedDetail: "Read and analysis approved; pricing, ads, deletion and publishing still need approval.",
      permissionReady: "Permission Ready",
      permissionReadyDetail: (platform: string) => `${platform} read-only connected.`,
      dataFailed: "Data Fetch Failed",
      dataFailedDetail: "Third-party platform API returned 401.",
      retryAuth: "Retry Auth",
      retryAuthDetail: "Simulated auth is still unavailable.",
      waitCsv: "Wait CSV",
      waitCsvDetail: "Upload template generated.",
      fallback: "Fallback Enabled",
      fallbackDetail: "Using sanitized sample data to continue the demo flow.",
      diagnosisDone: "Diagnosis Done",
      diagnosisDetail: "Conversion gap, 12 slow movers and retention gap found.",
      resultReady: "Result Ready",
      resultReadyDetail: "Awaiting user review.",
      reviewPassed: "Review Passed",
      reviewPassedDetail: "Move to final delivery.",
      delivered: "Delivered",
      deliveredDetail: "Requirements, workflow, strategy and checklist are ready.",
      paused: "Paused",
      pausedDetail: "Current checkpoint saved.",
      resumed: "Resumed",
      resumedDetail: "Recovered from latest checkpoint.",
      handoff: "Handoff",
      handoffDetail: "Conflicting actions frozen and full context prepared.",
      returned: "Returned",
      returnedDetail: "Agent continues from a safe checkpoint.",
      nextIteration: "Next Iteration",
      nextIterationDetail: "Create a 7-day experiment and review loop.",
    },
    report: {
      title: "Agent Final Report",
      goal: "Goal",
      platform: "Platform",
      objective: "Objective",
      automation: "Automation",
      permission: "Permissions",
      risk: "Risk",
      unknown: "N/A",
      findings: "Findings",
      findingList: ["PDP conversion below baseline", "12 slow-moving SKUs", "Retention touchpoints missing"],
    },
  },
} as const;

const statusVisual: Record<TaskStatus, { icon: typeof Circle; className: string }> = {
  Pending: { icon: Circle, className: "pending" },
  Running: { icon: RefreshCw, className: "running" },
  "Need Confirmation": { icon: Clock3, className: "waiting" },
  Failed: { icon: XCircle, className: "blocked" },
  Completed: { icon: CheckCircle2, className: "done" },
};

const initialTasks = (): Task[] => Array.from({ length: 10 }, (_, i) => ({ id: i + 1, status: "Pending" }));
const makeOptions = (ids: readonly string[], labels: readonly string[]): Option[] => ids.map((id, i) => ({ id, label: labels[i] }));

function runtimeString(startAt: number) {
  const s = Math.max(0, Math.floor((Date.now() - startAt) / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("complex-task-agent-lang");
    return saved === "en" ? "en" : "zh";
  });
  const t = translations[lang];
  const [goalInput, setGoalInput] = useState("帮我做一个电商自动化运营 Agent，提升店铺销量");
  const [platform, setPlatform] = useState("");
  const [goal, setGoal] = useState("");
  const [automation, setAutomation] = useState("");
  const [stage, setStage] = useState<FlowStage>("GoalInput");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<Event[]>([]);
  const [permissionState, setPermissionState] = useState<string>(t.states.permissionDefault);
  const [riskLevel, setRiskLevel] = useState<string>(t.states.riskDefault);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [runtimeStart] = useState(() => Date.now());
  const [runtime, setRuntime] = useState("00:00");
  const eventId = useRef(0);
  const timers = useRef<number[]>([]);
  const planListRef = useRef<HTMLDivElement | null>(null);

  const platformOptions = useMemo(() => makeOptions(optionIds.platforms, t.options.platforms), [t]);
  const goalOptions = useMemo(() => makeOptions(optionIds.goals, t.options.goals), [t]);
  const automationOptions = useMemo(() => makeOptions(optionIds.automation, t.options.automation), [t]);
  const platformLabel = platformOptions.find((o) => o.id === platform)?.label || "";
  const goalLabel = goalOptions.find((o) => o.id === goal)?.label || "";
  const automationLabel = automationOptions.find((o) => o.id === automation)?.label || "";

  useEffect(() => {
    localStorage.setItem("complex-task-agent-lang", lang);
  }, [lang]);

  useEffect(() => {
    const timer = window.setInterval(() => setRuntime(runtimeString(runtimeStart)), 1000);
    return () => window.clearInterval(timer);
  }, [runtimeStart]);

  useEffect(() => {
    if (stage === "GoalInput") planListRef.current?.scrollTo({ top: 0 });
  }, [stage, lang]);

  const addEvent = (title: string, detail: string, tone: Event["tone"] = "neutral") => {
    eventId.current += 1;
    setEvents((current) => [
      { id: eventId.current, time: new Date().toLocaleTimeString(), title, detail, tone },
      ...current,
    ]);
  };
  const schedule = (cb: () => void, delay: number) => timers.current.push(window.setTimeout(cb, delay));
  const clearTimers = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  };
  useEffect(() => () => clearTimers(), []);
  const setTaskStatus = (id: number, status: TaskStatus) => setTasks((current) => current.map((task) => (task.id === id ? { ...task, status } : task)));
  const completeThenRun = (completedId: number, runningId: number, title: string, detail: string) => {
    setTaskStatus(completedId, "Completed");
    setTaskStatus(runningId, "Running");
    addEvent(title, detail, "success");
  };

  const startFlow = () => {
    clearTimers();
    setStage("GoalClarification");
    setTasks(initialTasks().map((task) => (task.id === 1 ? { ...task, status: "Running" } : task)));
    setEvents([]);
    setPermissionState(t.states.pendingApproval);
    setRiskLevel(t.states.assessing);
    addEvent(t.events.goalReceived, goalInput);
    schedule(() => {
      setTaskStatus(1, "Completed");
      setTaskStatus(2, "Need Confirmation");
      addEvent(t.events.gapIdentified, t.events.gapDetail, "warning");
    }, 650);
  };
  const buildPlan = () => {
    if (!(platform && goal && automation)) return;
    clearTimers();
    setTaskStatus(2, "Completed");
    setTaskStatus(3, "Running");
    setRiskLevel(automation === "fullAuto" ? (lang === "zh" ? "高风险 L3" : "High L3") : automation === "semiAuto" ? (lang === "zh" ? "中风险 L2" : "Medium L2") : (lang === "zh" ? "低风险 L1" : "Low L1"));
    addEvent(t.events.contextClarified, `${platformLabel} / ${goalLabel} / ${automationLabel}`, "success");
    schedule(() => completeThenRun(3, 4, t.events.goalStructured, t.events.mappedGoal(goalLabel)), 650);
    schedule(() => {
      setTaskStatus(4, "Need Confirmation");
      setStage("PlanConfirmation");
      addEvent(t.events.planPending, t.events.planPendingDetail, "warning");
    }, 1350);
  };
  const confirmPlan = () => {
    if (stage !== "PlanConfirmation") return;
    clearTimers();
    setTaskStatus(4, "Completed");
    setTaskStatus(5, "Running");
    setStage("Execution");
    setPermissionState(t.states.configuring);
    addEvent(t.events.planApproved, t.events.planApprovedDetail, "success");
    schedule(() => {
      setTaskStatus(5, "Completed");
      setTaskStatus(6, "Running");
      setPermissionState(t.states.readonly);
      addEvent(t.events.permissionReady, t.events.permissionReadyDetail(platformLabel), "success");
    }, 700);
    schedule(() => {
      setTaskStatus(6, "Completed");
      setTaskStatus(7, "Running");
      addEvent(
        lang === "zh" ? "业务数据读取完成" : "Business Data Ready",
        lang === "zh" ? "已读取订单、商品、库存与流量数据。" : "Orders, products, inventory and traffic data loaded.",
        "success",
      );
    }, 1550);
    schedule(() => completeThenRun(7, 8, t.events.diagnosisDone, t.events.diagnosisDetail), 2400);
    schedule(() => {
      setTaskStatus(8, "Completed");
      setTaskStatus(9, automation === "fullAuto" ? "Need Confirmation" : "Running");
      setStage("ResultReview");
      addEvent(t.events.resultReady, t.events.resultReadyDetail, "warning");
      if (automation !== "fullAuto") {
        schedule(() => acceptResult(), 2200);
      }
    }, 3250);
  };
  const retryAuthorization = () => addEvent(t.events.retryAuth, t.events.retryAuthDetail, "warning");
  const uploadCsv = () => addEvent(t.events.waitCsv, t.events.waitCsvDetail, "neutral");
  const useSampleData = () => {
    clearTimers();
    setStage("Execution");
    setPermissionState(t.states.sampleData);
    setTaskStatus(6, "Completed");
    setTaskStatus(7, "Running");
    addEvent(t.events.fallback, t.events.fallbackDetail, "success");
    schedule(() => completeThenRun(7, 8, t.events.diagnosisDone, t.events.diagnosisDetail), 850);
    schedule(() => {
      setTaskStatus(8, "Completed");
      setTaskStatus(9, automation === "fullAuto" ? "Need Confirmation" : "Running");
      setStage("ResultReview");
      addEvent(t.events.resultReady, t.events.resultReadyDetail, "warning");
      if (automation !== "fullAuto") {
        schedule(() => acceptResult(), 2200);
      }
    }, 1750);
  };
  const acceptResult = () => {
    clearTimers();
    setTaskStatus(9, "Completed");
    setTaskStatus(10, "Running");
    setStage("Execution");
    addEvent(t.events.reviewPassed, t.events.reviewPassedDetail, "success");
    schedule(() => {
      setTaskStatus(10, "Completed");
      setStage("FinalDelivery");
      addEvent(t.events.delivered, t.events.deliveredDetail, "success");
    }, 900);
  };
  const interrupt = () => {
    clearTimers();
    setStage("Interrupted");
    addEvent(t.events.paused, t.events.pausedDetail, "warning");
  };
  const resume = () => {
    if (tasks.some((task) => task.status === "Failed")) setStage("ErrorRecovery");
    else if (tasks[8].status === "Need Confirmation") setStage("ResultReview");
    else if (tasks[3].status === "Need Confirmation") setStage("PlanConfirmation");
    else setStage("Execution");
    addEvent(t.events.resumed, t.events.resumedDetail, "success");
  };
  const humanHandoff = () => {
    clearTimers();
    setStage("HumanHandoff");
    addEvent(t.events.handoff, t.events.handoffDetail, "warning");
  };
  const returnToAgent = () => {
    setStage(tasks.some((task) => task.status === "Failed") ? "ErrorRecovery" : "Execution");
    addEvent(t.events.returned, t.events.returnedDetail, "success");
  };
  const resetFlow = () => {
    clearTimers();
    setStage("GoalInput");
    setPlatform("");
    setGoal("");
    setAutomation("");
    setTasks(initialTasks());
    setEvents([]);
    setPermissionState(t.states.permissionDefault);
    setRiskLevel(t.states.riskDefault);
    setSelectedTask(null);
  };
  const nextIteration = () => {
    setStage("Iteration");
    addEvent(t.events.nextIteration, t.events.nextIterationDetail, "success");
  };

  const completedCount = tasks.filter((task) => task.status === "Completed").length;
  const progress = Math.round((completedCount / tasks.length) * 100);
  const isComplete = stage === "FinalDelivery" || stage === "Iteration";
  const currentTask = tasks.find((task) => ["Running", "Need Confirmation", "Failed"].includes(task.status));
  const nextTask = tasks.find((task) => task.status === "Pending");
  const current = t.stage[stage];
  const stageChipText = t.stageChip[current.step as keyof typeof t.stageChip] || current.step;
  const requiresStrongReview = stage === "ResultReview" && automation === "fullAuto";
  const goalSummary = useMemo(() => ({
    platform: platformLabel || t.summary.pending,
    target: goalLabel || t.summary.pending,
    scope: automationLabel || t.summary.pending,
    metric: goalLabel ? `${t.summary.metricPrefix}${goalLabel}${lang === "zh" ? "" : " within 30 days"}` : t.summary.metricPending,
  }), [platformLabel, goalLabel, automationLabel, t, lang]);
  const gaps = stage === "GoalInput"
    ? t.risk.initial
    : stage === "ErrorRecovery"
      ? t.risk.recovery
      : [permissionState, riskLevel, automation === "fullAuto" ? t.risk.highNeedsApproval : t.risk.highManual];
  const isAwaitingUser = ["GoalInput", "GoalClarification", "PlanConfirmation"].includes(stage) || requiresStrongReview;
  const topStatusText = isComplete
    ? t.topStatus.completed
    : stage === "HumanHandoff"
      ? t.topStatus.human
      : stage === "ErrorRecovery"
        ? t.topStatus.blocked
        : isAwaitingUser
          ? t.topStatus.waiting
          : t.topStatus.running;
  const reportMarkdown = `# ${t.report.title}
- ${t.report.goal}: ${goalInput}
- ${t.report.platform}: ${platformLabel || t.report.unknown}
- ${t.report.objective}: ${goalLabel || t.report.unknown}
- ${t.report.automation}: ${automationLabel || t.report.unknown}
- ${t.report.permission}: ${permissionState}
- ${t.report.risk}: ${riskLevel}

## ${lang === "zh" ? "执行范围" : "Execution Scope"}
- ${lang === "zh" ? "允许 Agent 自动完成：目标结构化、任务拆解、数据分析、策略生成、报告汇总。" : "Allowed: goal structuring, task planning, data analysis, strategy generation and report assembly."}
- ${lang === "zh" ? "需要用户确认：平台选择、运营目标、自动化边界、执行计划、最终验收。" : "Requires confirmation: platform, objective, automation boundary, execution plan and final acceptance."}
- ${lang === "zh" ? "高风险动作默认拦截：自动改价、广告投放、删除、发布、自动回复。" : "High-risk actions are blocked by default: price changes, ad spend, deletion, publishing and auto replies."}

## ${lang === "zh" ? "任务完成情况" : "Task Completion"}
${tasks.map((task) => {
  const taskText = t.tasks[task.id - 1];
  return `- ${String(task.id).padStart(2, "0")} ${taskText.title}: ${t.status[task.status]}`;
}).join("\n")}

## ${t.report.findings}
${t.report.findingList.map((item, index) => `${index + 1}. ${item}`).join("\n")}

## ${lang === "zh" ? "最终交付物" : "Deliverables"}
${t.delivery.main.map((item) => `- ${item}`).join("\n")}
${t.delivery.supporting.map((item) => `- ${item}`).join("\n")}

## ${lang === "zh" ? "风险与假设" : "Risks and Assumptions"}
${gaps.map((gap) => `- ${gap}`).join("\n")}

## ${lang === "zh" ? "下一步建议" : "Next Recommendations"}
1. ${lang === "zh" ? "先以只读权限和样例数据验证工作流。" : "Validate workflow with read-only access and sample data first."}
2. ${lang === "zh" ? "将高风险动作设置为人工审批后执行。" : "Keep high-risk operations under human approval."}
3. ${lang === "zh" ? "进入 7 天小流量试运行，并根据复盘结果迭代。" : "Run a 7-day limited rollout and iterate through review results."}
`;
  const copyReport = async () => {
    await navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };
  const exportMarkdown = () => {
    const blob = new Blob([reportMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agent-final-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-shell">
      <header className="console-topbar">
        <div className="topbar-brand"><Terminal size={18} /><div><strong>Complex Task Agent</strong><span>{t.subtitle}</span></div></div>
        <div className="topbar-chips"><span className="brand-chip current"><i /> {stageChipText}</span><span className="brand-chip">Task #CTA-0621</span><span className="brand-chip"><Clock3 size={12} /> {runtime}</span></div>
        <div className="topbar-controls">
          <span className={`status-badge ${isComplete ? "done" : stage === "HumanHandoff" ? "warn" : stage === "ErrorRecovery" ? "danger" : "live"}`}>{topStatusText}</span>
          <div className="language-toggle" aria-label="Language switch">
            <button className={lang === "zh" ? "active" : ""} onClick={() => setLang("zh")}>中文</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          </div>
          <button className="ctrl-button" onClick={resetFlow} title="Reset"><RotateCcw size={15} /></button><div className="avatar">PM</div>
        </div>
      </header>

      <main className="workspace">
        <section className="left-panel panel">
          <PanelHeader icon={<WandSparkles size={17} />} eyebrow={t.labels.userControl} title={t.labels.leftTitle} />
          <div className="panel-scroll left-scroll">
            <div className="objective-card"><span>{t.labels.goal}</span><textarea value={goalInput} onChange={(e) => setGoalInput(e.target.value)} disabled={stage !== "GoalInput"} /><div className="objective-meta"><span>{t.labels.platform}: {goalSummary.platform}</span><span>{t.labels.target}: {goalSummary.target}</span><span>{t.labels.scope}: {goalSummary.scope}</span></div></div>
            <div className="left-section"><label>{t.labels.quickSelect}</label><ChoiceGroup label={t.labels.platform} options={platformOptions} value={platform} onChange={setPlatform} disabled={stage !== "GoalClarification"} /><ChoiceGroup label={t.labels.objective} options={goalOptions} value={goal} onChange={setGoal} disabled={stage !== "GoalClarification"} /><ChoiceGroup label={t.labels.automation} options={automationOptions} value={automation} onChange={setAutomation} disabled={stage !== "GoalClarification"} /></div>
            <div className="left-section"><label>{t.labels.keyConfirm}</label><div className={`confirm-panel ${stage === "PlanConfirmation" ? "active" : ""}`}><ShieldCheck size={18} /><div><strong>{t.confirmation.title}</strong><p>{t.confirmation.body}</p></div></div></div>
            <div className="left-section"><label>{t.labels.controls}</label><div className="controls-grid">{stage === "GoalInput" ? <button className="primary-wide" onClick={startFlow}>{t.buttons.start} <ArrowRight size={14} /></button> : stage === "GoalClarification" ? <button className="primary-wide" onClick={buildPlan} disabled={!(platform && goal && automation)}>{t.buttons.buildPlan} <ArrowRight size={14} /></button> : stage === "PlanConfirmation" ? <button className="primary-wide" onClick={confirmPlan}>{t.buttons.confirmExecute}</button> : stage === "Interrupted" ? <button className="primary-wide" onClick={resume}>{t.buttons.resume}</button> : stage === "HumanHandoff" ? <button className="primary-wide" onClick={returnToAgent}>{t.buttons.returnAgent}</button> : <><button className="ctrl-btn" onClick={interrupt}><Pause size={14} />{t.buttons.pause}</button><button className="ctrl-btn warn" onClick={humanHandoff}><Hand size={14} />{t.buttons.handoff}</button></>}</div></div>
          </div>
        </section>

        <section className="center-panel panel">
          <div className="center-hero">
            <div className="hero-left"><span className="hero-kicker">{current.step} / {t.labels.currentStage}</span><h1>{current.title}</h1><p>{current.description}</p><div className="hero-summary"><div><span>{t.labels.status}</span><strong>{currentTask ? t.status[currentTask.status] : isComplete ? t.states.completed : t.states.ready}</strong></div><div><span>{t.labels.next}</span><strong>{currentTask ? t.tasks[currentTask.id - 1].title : t.states.waiting}</strong></div><div><span>{t.labels.permission}</span><strong>{permissionState}</strong></div></div></div>
            <div className="hero-right"><div className="progress-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><b>{progress}%</b></div><div className="progress-stack"><strong>{completedCount} / {tasks.length}</strong><span>{t.labels.taskDone}</span><small>{tasks.filter((task) => task.status === "Pending").length} {t.labels.queued} / {tasks.filter((task) => task.status === "Failed").length} {t.labels.blocked}</small></div></div>
          </div>

          {stage === "GoalInput" && <div className="system-callout"><div className="callout-left"><Bot size={26} /><div><span>{t.confirmCard.badge}</span><h3>{t.confirmCard.title}</h3><p>{t.confirmCard.body}</p></div></div><button className="primary-action" onClick={startFlow}>{t.buttons.start} <ArrowRight size={14} /></button></div>}
          {stage === "ErrorRecovery" && <div className="banner danger"><AlertTriangle size={22} /><div><span>{t.banners.toolFailure}</span><h3>{t.banners.authTitle}</h3><p>{t.banners.authBody}</p></div><div className="banner-actions"><button onClick={retryAuthorization}><RefreshCw size={14} />{t.buttons.retry}</button><button onClick={uploadCsv}><Upload size={14} />{t.buttons.uploadCsv}</button><button className="strong" onClick={useSampleData}><Database size={14} />{t.buttons.sampleData}</button></div></div>}
          {stage === "ResultReview" && <div className="banner success"><UserRoundCheck size={22} /><div><span>{t.banners.milestone}</span><h3>{t.banners.resultTitle}</h3><p>{requiresStrongReview ? t.banners.resultBody : `${t.banners.resultBody} ${lang === "zh" ? "低风险交付将自动继续。" : "Low-risk delivery will continue automatically."}`}</p></div><button className="strong" onClick={acceptResult}>{t.buttons.approveDeliver} <ArrowRight size={14} /></button></div>}
          {stage === "HumanHandoff" && <div className="banner warn"><Hand size={22} /><div><span>{t.banners.human}</span><h3>{t.banners.humanTitle}</h3><p>{t.banners.humanBody}</p></div></div>}

          <div className="center-split">
            <div className="plan-pane"><div className="pane-header"><Layers3 size={15} /><strong>{t.labels.planProgress}</strong><span>{t.labels.currentHighlighted}</span></div><div className="plan-list" ref={planListRef}>{tasks.map((task) => {
              const visual = statusVisual[task.status]; const Icon = visual.icon;
              const rel = currentTask?.id === task.id ? "current" : nextTask?.id === task.id ? "next" : task.status === "Completed" ? "past" : "future";
              const taskText = t.tasks[task.id - 1];
              return <button key={task.id} className={`plan-item ${visual.className} ${rel}`} onClick={() => setSelectedTask(task.id === selectedTask ? null : task.id)}><div className="plan-id">{String(task.id).padStart(2, "0")}</div><div className="plan-body"><span className="plan-rel">{rel === "current" ? t.relation.current : rel === "next" ? t.relation.next : rel === "past" ? t.relation.done : t.relation.queued}</span><strong>{taskText.title}</strong><small>{taskText.detail}</small></div><span className={`pill ${visual.className}`}><Icon size={12} className={task.status === "Running" ? "spin" : ""} />{t.status[task.status]}</span></button>;
            })}</div></div>
            <div className="timeline-pane"><div className="pane-header"><Clock3 size={15} /><strong>{t.labels.eventTimeline}</strong><span>{t.labels.explainableLog}</span></div><div className="timeline-list">{events.length === 0 ? <div className="empty-timeline"><Bot size={26} /><strong>{t.emptyTimeline.title}</strong><p>{t.emptyTimeline.body}</p></div> : events.map((event, i) => <div key={event.id} className={`tl-item ${event.tone}`}><span className="dot" /><div className="tl-body"><div className="tl-top"><em>{i === 0 ? "JUST NOW" : event.tone === "danger" ? "BLOCKED" : event.tone === "warning" ? "ACTION" : "EXECUTED"}</em><time>{event.time}</time></div><strong>{event.title}</strong><p>{event.detail}</p></div></div>)}</div></div>
          </div>
        </section>

        <aside className="right-panel panel">
          <PanelHeader icon={<FileText size={17} />} eyebrow={t.labels.contextOutput} title={t.labels.contextRiskDelivery} />
          <div className="panel-scroll right-scroll">
            <Card title={t.labels.contextSummary} icon={<Sparkles size={15} />}>
              <div className="summary-chips"><span>{platformLabel ? `${t.labels.platform}: ${platformLabel}` : t.summary.platformPending}</span><span>{goalLabel ? `${t.labels.target}: ${goalLabel}` : t.summary.targetPending}</span><span>{automationLabel ? `${t.labels.scope}: ${automationLabel}` : t.summary.scopePending}</span><span>{goalLabel ? `${lang === "zh" ? "指标" : "Metric"}: ${goalSummary.metric}` : t.summary.metricLabelPending}</span></div>
              <div className="context-line"><span className={`dot ${stage}`} /><div><strong>{current.title}</strong><p>{current.description}</p></div></div>
            </Card>
            <Card title={t.labels.riskRecovery} icon={<ShieldAlert size={15} />} tone="warning">
              <div className="risk-banner"><AlertTriangle size={16} /><div><strong>{gaps.length} {t.risk.attention}</strong><span>{t.risk.lowRisk}</span></div></div>
              <div className="risk-list">{gaps.map((gap, i) => <div key={`${gap}-${i}`}><span>{gap}</span><small>{i === 0 ? t.risk.action : t.risk.review}</small></div>)}</div>
            </Card>
            <Card title={t.labels.finalDelivery} icon={<FileText size={15} />} accent={isComplete}>
              <div className="deliverables">
                <div className="primary"><label>{t.labels.primaryDelivery}</label><div>{t.delivery.main.map((item, i) => <div key={item} className={`deliver-row ${isComplete ? "ready" : ""}`}>{isComplete ? <Check size={14} /> : <Circle size={11} />}<span>{item}</span><small>{isComplete ? t.delivery.ready : i < completedCount / 3 ? t.delivery.draft : t.delivery.pending}</small></div>)}</div></div>
                <div className="secondary"><label>{t.labels.supportingDelivery}</label><div className="chip-wrap">{t.delivery.supporting.map((item) => <span key={item}>{item}</span>)}</div></div>
              </div>
              {isComplete && <div className="report-brief"><span>{t.labels.executiveSummary}</span><h3>{t.delivery.completedTitle}</h3><p>{t.delivery.completedBody}</p></div>}
            </Card>
          </div>
          <div className="right-footer">{isComplete ? <><button onClick={exportMarkdown}><Download size={14} />{t.buttons.export}</button><button onClick={copyReport}><Clipboard size={14} />{copied ? t.buttons.copied : t.buttons.copy}</button><button className="next" onClick={nextIteration} disabled={stage === "Iteration"}>{t.buttons.nextIteration} <ChevronRight size={14} /></button></> : <div className="footer-wait"><Gauge size={14} />{t.delivery.footerWait}</div>}</div>
        </aside>
      </main>
    </div>
  );
}

function PanelHeader({ icon, eyebrow, title }: { icon: React.ReactNode; eyebrow: string; title: string }) {
  return <div className="panel-head"><div className="panel-icon">{icon}</div><div><span>{eyebrow}</span><h2>{title}</h2></div></div>;
}

function ChoiceGroup({ label, options, value, onChange, disabled }: { label: string; options: Option[]; value: string; onChange: (v: string) => void; disabled: boolean }) {
  return <div className="choice"><label>{label}</label><div className="chip-row">{options.map((option) => <button key={option.id} className={value === option.id ? "active" : ""} disabled={disabled} onClick={() => onChange(option.id)}>{option.label}</button>)}</div></div>;
}

function Card({ title, icon, tone = "", accent = false, children }: { title: string; icon: React.ReactNode; tone?: string; accent?: boolean; children: React.ReactNode }) {
  return <section className={`card ${tone} ${accent ? "accent" : ""}`}><div className="card-title"><span>{icon}</span><strong>{title}</strong></div>{children}</section>;
}

export default App;
