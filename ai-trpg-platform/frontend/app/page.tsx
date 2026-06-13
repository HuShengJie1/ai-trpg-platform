import Link from "next/link";

const modules = [
  {
    name: "用户系统",
    description: "注册、登录和当前账号信息。",
    href: "/me",
    status: "已完成",
  },
  {
    name: "角色车卡系统",
    description: "支持 COC7 和 DND5E 的多规则角色卡创建、查看和编辑。",
    href: "/characters",
    status: "新增",
  },
  {
    name: "投骰工具",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "模组管理",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "PDF 模组导入",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "AI 带团",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "战役存档",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "规则查询",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
  {
    name: "玩家论坛",
    description: "后续 MVP 阶段开发。",
    href: null,
    status: "待开发",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <p className="text-sm font-medium text-indigo-600">AI 跑团平台</p>
        <h1 className="mt-3 text-4xl font-bold tracking-normal text-gray-950">
          AI TRPG Platform
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
          项目当前已包含用户系统和多规则角色车卡前端，支持 COC7 与
          DND5E 角色卡的基础管理流程。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            href="/register"
          >
            注册
          </Link>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            href="/login"
          >
            登录
          </Link>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            href="/me"
          >
            我的账号
          </Link>
          <Link
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50"
            href="/characters"
          >
            角色车卡系统
          </Link>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const card = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {module.name}
                  </h2>
                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                    {module.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {module.description}
                </p>
              </>
            );

            return module.href ? (
              <Link
                key={module.name}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm hover:border-indigo-200 hover:shadow"
                href={module.href}
              >
                {card}
              </Link>
            ) : (
              <div
                key={module.name}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                {card}
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
