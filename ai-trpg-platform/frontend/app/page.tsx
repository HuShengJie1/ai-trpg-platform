import Link from "next/link";

const modules = [
  "用户系统",
  "角色车卡",
  "投骰工具",
  "模组管理",
  "PDF 模组导入",
  "AI 带团",
  "战役存档",
  "规则查询",
  "玩家论坛",
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
          项目当前处于初始化阶段，只包含前后端骨架、模块入口和设计文档。
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
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((name) => (
            <div
              key={name}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
              <p className="mt-2 text-sm text-gray-500">后续 MVP 阶段开发</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
