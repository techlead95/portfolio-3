/**
 * All site content lives here — edit this file to update the portfolio.
 * Text wrapped in **double asterisks** is rendered bold.
 */

export const profile = {
  name: "Luis Rasgado",
  firstName: "Luis",
  lastName: "Rasgado",
  initials: "LR",
  role: "Senior AI & Full Stack Engineer",
  location: "San Francisco, CA",
  timeZone: "America/Los_Angeles",
  email: "luis@lrasgado.com",
  phone: "(408) 673-8257",
  phoneHref: "tel:+14086738257",
  website: "https://lrasgado.netlify.app",
  websiteLabel: "lrasgado.netlify.app",
  resumeUrl: "/Luis_Rasgado_Resume.pdf",
  years: "11+",
  description:
    "Senior AI & Full Stack Engineer with 11+ years building secure, scalable software across Java, Python, and React for edtech and healthcare. Now bringing production AI to enterprise systems: agents, RAG, and MCP.",
  companies: ["Blackboard", "Medtronic", "Boston Consulting Group"],
} as const;

/** Scroll-lit statement under the hero. *word* = accent serif. */
export const summary =
  "Full stack across *Java, Python, and React,* now bringing *production AI* to enterprise systems: agents, RAG pipelines, and MCP integrations built for reliability and cost, with HIPAA and SOC 2 rigor.";

/** Words for the scroll-velocity marquee. */
export const focus = [
  "AI Agents",
  "RAG",
  "MCP",
  "Guardrails",
  "Python / FastAPI",
  "Java / Spring Boot",
  "React / TypeScript",
  "HIPAA",
  "SOC 2",
];

export type Viz =
  | { kind: "levers"; items: string[]; note: string }
  | { kind: "compare"; max: number; rows: { label: string; value: number; text: string }[] }
  | { kind: "week"; note: string }
  | { kind: "ring"; value: number; note: string }
  | { kind: "dots"; value: number; note: string };

export type ImpactItem = {
  label: string;
  where: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  unit?: string;
  text: string;
  viz: Viz;
};

/** Headline wins — the six numbers people should remember. */
export const impact: ImpactItem[] = [
  {
    label: "Diabetes business",
    where: "Medtronic",
    value: 2.2,
    decimals: 1,
    prefix: "$",
    suffix: "B",
    unit: "annual revenue",
    text: "Built the personalized insulin-dosing platform behind Medtronic's diabetes business.",
    viz: {
      kind: "levers",
      items: ["Spring Boot", "GraphQL", "React", "HIPAA"],
      note: "full stack, end to end",
    },
  },
  {
    label: "Funding scaled through",
    where: "BCG · Axle",
    value: 126,
    prefix: "$",
    suffix: "M",
    unit: "Series B",
    text: "Re-architected Axle's monolith into event-driven microservices that carried it from Series A to B.",
    viz: {
      kind: "compare",
      max: 126,
      rows: [
        { label: "series A", value: 10, text: "$10M" },
        { label: "series B", value: 126, text: "$126M" },
      ],
    },
  },
  {
    label: "Uptime SLA",
    where: "BCG",
    value: 99.99,
    decimals: 2,
    suffix: "%",
    text: "Kubernetes on GCP with CI/CD, Prometheus, and Grafana.",
    viz: { kind: "ring", value: 99.99, note: "≈ 4 min of downtime a month, max" },
  },
  {
    label: "Instructor time",
    where: "Blackboard",
    value: 8,
    unit: "hrs / week saved",
    text: "LangGraph + Claude agents flag at-risk students and draft outreach for every instructor.",
    viz: { kind: "week", note: "a full workday back, every week" },
  },
  {
    label: "Urgent-message recall",
    where: "Medtronic",
    value: 97,
    suffix: "%",
    unit: "accuracy 78% → 91%",
    text: "Fine-tuned healthcare NLP so urgent patient messages are almost never missed.",
    viz: { kind: "dots", value: 97, note: "97 of every 100 urgent messages caught" },
  },
  {
    label: "LLM spend",
    where: "Blackboard",
    value: 200,
    prefix: "$",
    suffix: "K",
    unit: "/ yr saved",
    text: "Premium models reserved for the tasks that need them.",
    viz: {
      kind: "levers",
      items: ["prompts", "routing", "retrieval", "context"],
      note: "four levers, one bill",
    },
  },
];

/** The six outcomes repeated large in the marquee under the hero. */
export const outcomes = [
  { value: "$2.2B", label: "diabetes business" },
  { value: "$126M", label: "Series B" },
  { value: "99.99%", label: "uptime" },
  { value: "8 hrs", label: "/ week saved" },
  { value: "97%", label: "urgent recall" },
  { value: "$200K", label: "/ yr saved" },
];

export type Experience = {
  company: string;
  role: string;
  period: string;
  location: string;
  headlines: { value: string; label: string }[];
  highlights: string[];
};

export const experience: Experience[] = [
  {
    company: "Blackboard",
    role: "Applied AI Engineer",
    period: "2024 → 2026",
    location: "Reston, VA",
    headlines: [
      { value: "$200K", label: "LLM spend saved / yr" },
      { value: "8 hrs", label: "saved / instructor / week" },
    ],
    highlights: [
      "Built LangGraph + Claude agents that flag at-risk students, saving **8 hrs/week per instructor**.",
      "Shipped RAG course search (LangChain, Pinecone) for millions of learners, cutting discovery from **2 min to under 30s**.",
      "Cut **$200K/yr in LLM spend** with model routing plus prompt, retrieval, and context tuning.",
      "Python guardrail pipelines verify answers and filter PII, cutting **ungrounded answers from 6% to under 1%**.",
      "Built **Python/FastAPI services** and secure **MCP servers** that plug AI agents, RAG search, and guardrails into Blackboard Learn's **Java/Spring Boot** platform.",
    ],
  },
  {
    company: "Medtronic",
    role: "Full Stack AI Engineer",
    period: "2022 → 2024",
    location: "Northridge, CA",
    headlines: [
      { value: "$2.2B", label: "diabetes business" },
      { value: "97%", label: "urgent-message recall" },
    ],
    highlights: [
      "Built a personalized insulin-dosing platform for a **$2.2B diabetes business** (Spring Boot, GraphQL, React).",
      "Fine-tuned healthcare NLP models, raising **accuracy from 78% to 91%** with **97% recall** on urgent messages.",
      "Created an ADA-compliant React design system with **95% fewer accessibility defects**.",
      "Delivered **HIPAA-compliant** security and observability, and mentored engineers on architecture and testing.",
    ],
  },
  {
    company: "Boston Consulting Group",
    role: "Senior Software Engineer",
    period: "2015 → 2022",
    location: "San Francisco, CA",
    headlines: [
      { value: "99.99%", label: "uptime SLA" },
      { value: "$126M", label: "Series B, scaled through" },
    ],
    highlights: [
      "Re-architected Axle's monolith into event-driven microservices, scaling it through its **$10M Series A** and **$126M Series B**.",
      "Ran Docker/Kubernetes on GCP with CI/CD and alerting to support a **99.99% uptime SLA**.",
      "Cut regressions by **85%** with automated testing, and built the security controls behind **SOC 2** compliance.",
      "Built React/Next.js apps (**+15% mobile conversion**) and Kafka/Spark pipelines for **50M events**.",
    ],
  },
];

/** Every tool, grouped (groups feed structured data; the site shows one cloud). */
export const toolkit: { group: string; items: string[] }[] = [
  { group: "AI & LLMs", items: ["Claude", "OpenAI", "LangGraph", "LangChain", "RAG", "Agentic AI", "MCP", "Pinecone", "PyTorch", "Hugging Face"] },
  { group: "Python", items: ["Python", "FastAPI", "Pydantic"] },
  { group: "Java & Spring", items: ["Java 21", "Spring Boot", "Spring Cloud", "Spring Security", "Spring Data JPA", "Hibernate", "Resilience4j", "REST", "OpenAPI", "GraphQL", "Event-driven"] },
  { group: "Security", items: ["OAuth 2.0 / JWT", "OIDC", "RBAC"] },
  { group: "Frontend", items: ["TypeScript", "JavaScript", "React", "Next.js", "Redux", "Tailwind CSS", "Material UI", "Storybook"] },
  { group: "Data & Messaging", items: ["SQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Kafka", "Spark Streaming"] },
  { group: "Cloud & DevOps", items: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "OpenTelemetry", "Prometheus", "Grafana"] },
  { group: "Testing & Quality", items: ["JUnit", "Mockito", "Testcontainers", "Jest", "React Testing Library", "Cypress", "SonarQube"] },
];

/** Flat list (for structured data). */
export const skills = toolkit.map((g) => ({ category: g.group, items: g.items }));

export type NeedIcon = "spark" | "server" | "window" | "shield" | "database" | "cloud" | "check";

/** "What do you need built?" Each need lights up its tools and shows a proof point. */
export const needs: {
  title: string;
  tag: string;
  icon: NeedIcon;
  tools: string[];
  proof: string;
  where: string;
}[] = [
  {
    title: "An AI feature that actually works",
    tag: "AI / LLM",
    icon: "spark",
    tools: ["Claude", "OpenAI", "LangGraph", "LangChain", "RAG", "Agentic AI", "MCP", "Pinecone", "Python", "FastAPI", "Pydantic"],
    proof: "Cut ungrounded answers from **6% to under 1%** and saved **$200K a year** in LLM spend.",
    where: "Blackboard",
  },
  {
    title: "A Java backend that holds up under growth",
    tag: "Java",
    icon: "server",
    tools: ["Java 21", "Spring Boot", "Spring Cloud", "Spring Data JPA", "Hibernate", "Resilience4j", "Event-driven", "REST", "OpenAPI", "GraphQL", "Kafka", "PostgreSQL", "Redis"],
    proof: "Turned a monolith into event-driven microservices that scaled through a **$126M Series B**.",
    where: "BCG · Axle",
  },
  {
    title: "A React app people enjoy using",
    tag: "Frontend",
    icon: "window",
    tools: ["React", "Next.js", "TypeScript", "JavaScript", "Redux", "Tailwind CSS", "Material UI", "Storybook", "Jest", "React Testing Library"],
    proof: "Lifted mobile conversion by **15%** and cut accessibility defects by **95%**.",
    where: "BCG · Medtronic",
  },
  {
    title: "Healthcare software that passes audit",
    tag: "Security",
    icon: "shield",
    tools: ["Spring Security", "OAuth 2.0 / JWT", "OIDC", "RBAC", "OpenTelemetry", "Prometheus", "Grafana", "PyTorch", "Hugging Face"],
    proof: "Shipped HIPAA-compliant security and observability for a **$2.2B** diabetes business.",
    where: "Medtronic",
  },
  {
    title: "Data pipelines that keep up",
    tag: "Data",
    icon: "database",
    tools: ["Kafka", "Spark Streaming", "SQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "Python"],
    proof: "Built pipelines that process **50 million** user events for engagement dashboards.",
    where: "BCG",
  },
  {
    title: "Infrastructure you don't have to babysit",
    tag: "DevOps",
    icon: "cloud",
    tools: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins", "Git", "OpenTelemetry", "Prometheus", "Grafana"],
    proof: "Kept a **99.99%** uptime SLA with Kubernetes on GCP and CI/CD.",
    where: "BCG",
  },
  {
    title: "Releases that don't break things",
    tag: "Testing",
    icon: "check",
    tools: ["JUnit", "Mockito", "Testcontainers", "Jest", "React Testing Library", "Cypress", "SonarQube"],
    proof: "Cut regression issues by **85%** with automated tests and quality gates.",
    where: "BCG",
  },
];

export const education = {
  school: "University of San Francisco",
  degree: "B.S. Computer Science",
  year: "2015",
};

/** Illustrative traces shown in the hero terminal. */
export const traces = [
  {
    file: "at_risk_outreach.py",
    command: 'agent.run("Flag at-risk students in BIO 101")',
    steps: [
      { kind: "mcp", name: "lms.get_gradebook", meta: "118ms", status: "ok" },
      { kind: "mcp", name: "lms.get_engagement", meta: "94ms", status: "ok" },
      { kind: "rag", name: "course_content.search", meta: "61ms", status: "ok" },
      { kind: "route", name: "claude · premium tier", meta: "complex", status: "ok" },
      { kind: "guard", name: "pii_filter", meta: "pass", status: "ok" },
    ],
    result: "students flagged · outreach drafted for review",
  },
  {
    file: "course_search.py",
    command: 'search("self-paced intro to machine learning")',
    steps: [
      { kind: "embed", name: "query → vector", meta: "22ms", status: "ok" },
      { kind: "rag", name: "pinecone.query top_k=8", meta: "41ms", status: "ok" },
      { kind: "rank", name: "course_relevance", meta: "35ms", status: "ok" },
      { kind: "route", name: "efficient tier", meta: "routine", status: "ok" },
      { kind: "guard", name: "grounding_check", meta: "pass", status: "ok" },
    ],
    result: "8 courses found · discovery < 30s (was 2 min)",
  },
  {
    file: "guardrails.py",
    command: 'answer("When is the final exam for CS 201?")',
    steps: [
      { kind: "rag", name: "syllabus.search", meta: "48ms", status: "ok" },
      { kind: "llm", name: "draft_answer", meta: "310ms", status: "ok" },
      { kind: "guard", name: "grounding_check", meta: "pass", status: "ok" },
      { kind: "guard", name: "pii_filter", meta: "redacted 1", status: "warn" },
      { kind: "guard", name: "content_policy", meta: "pass", status: "ok" },
    ],
    result: "grounded answer delivered · 2 citations",
  },
] as const;
