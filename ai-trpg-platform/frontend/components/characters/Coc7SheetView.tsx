import { asRecord, fieldText } from "../../lib/characterDisplay";
import {
  coc7SkillCategories,
  getCoc7SkillTotal,
  normalizeCoc7Skills,
} from "../../lib/coc7Skills";
import type { JsonRecord } from "../../types/character";
import type { Coc7OccupationPointCalculation } from "../../types/character";
import { normalizeCoc7Occupation } from "../../lib/coc7Occupations";
import Coc7OccupationSummary from "./Coc7OccupationSummary";
import styles from "./Coc7Theme.module.css";

type FieldItem = {
  label: string;
  key: string;
};

type DisplayItem = {
  label: string;
  value: string;
};

type WeaponRow = {
  key: string;
  name: string;
  skill: string;
  value: string;
  damage: string;
  range: string;
  attacks: string;
  ammo: string;
  malfunction: string;
};

type Coc7SheetViewProps = {
  sheet: unknown;
};

function parseRecord(value: unknown): JsonRecord {
  if (typeof value === "string") {
    try {
      return parseRecord(JSON.parse(value) as unknown);
    } catch {
      return {};
    }
  }

  return asRecord(value);
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function displayText(value: unknown, fallback = "未填写"): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function displayNumber(value: unknown, fallback = "0"): string {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? String(numberValue) : fallback;
}

function getHalf(value: unknown): string {
  const numberValue = Number(value);
  return Number.isFinite(numberValue)
    ? String(Math.floor(numberValue / 2))
    : "—";
}

function getFifth(value: unknown): string {
  const numberValue = Number(value);
  return Number.isFinite(numberValue)
    ? String(Math.floor(numberValue / 5))
    : "—";
}

function FieldGrid({
  items,
  record,
}: {
  items: FieldItem[];
  record: JsonRecord;
}) {
  return (
    <dl
      className={`${styles.sheetGrid} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}
    >
      {items.map((item) => (
        <div key={item.key} className="rounded-md bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">{item.label}</dt>
          <dd className="mt-1 break-words text-sm font-medium text-gray-900">
            {fieldText(record, item.key)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function DisplayGrid({ items }: { items: DisplayItem[] }) {
  return (
    <dl
      className={`${styles.sheetGrid} grid gap-3 sm:grid-cols-2 lg:grid-cols-3`}
    >
      {items.map((item) => (
        <div key={item.label} className="rounded-md bg-gray-50 px-3 py-2">
          <dt className="text-xs text-gray-500">{item.label}</dt>
          <dd className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-gray-900">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function TextList({
  emptyText = "未填写",
  items,
  title,
}: {
  emptyText?: string;
  items: unknown[];
  title: string;
}) {
  const values = items
    .map((item) => displayText(item, ""))
    .filter((item) => item.trim());

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-900">
          {values.map((item, index) => (
            <li key={`${item}-${index}`} className="break-words">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-gray-500">{emptyText}</p>
      )}
    </div>
  );
}

function SkillsSection({
  value,
  edu,
  dex,
  interestPoints,
}: {
  value: unknown;
  edu: number;
  dex: number;
  interestPoints: unknown;
}) {
  const record = parseRecord(value);
  const skills = normalizeCoc7Skills(record, edu, dex);
  const summary = [
    {
      label: "职业点数",
      value: displayNumber(record.occupation_points),
    },
    {
      label: "兴趣点数",
      value: displayNumber(interestPoints, displayNumber(record.interest_points)),
    },
    {
      label: "技能上限",
      value: displayNumber(record.skill_limit),
    },
  ];

  return (
    <section>
      <h3 className="text-base font-semibold text-gray-950">技能档案</h3>
      <div className="mt-3">
        <DisplayGrid items={summary} />
      </div>
      <div className="mt-5 space-y-6">
        {coc7SkillCategories.map((category) => {
          const categorySkills = skills.filter(
            (skill) => skill.category === category,
          );

          if (categorySkills.length === 0) {
            return null;
          }

          return (
            <div key={category}>
              <h4 className="border-b border-gray-200 pb-2 text-sm font-semibold text-gray-800">
                {category}
              </h4>
              <div
                className={`${styles.sheetTableWrap} mt-2 overflow-x-auto rounded-md border border-gray-200`}
              >
                <table className="min-w-[780px] w-full border-collapse text-left text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="px-3 py-2 font-medium">技能名称</th>
                      <th className="px-3 py-2 text-center font-medium">基础</th>
                      <th className="px-3 py-2 text-center font-medium">职业</th>
                      <th className="px-3 py-2 text-center font-medium">兴趣</th>
                      <th className="px-3 py-2 text-center font-medium">成长</th>
                      <th className="px-3 py-2 text-center font-medium">总值</th>
                      <th className="px-3 py-2 text-center font-medium">半值</th>
                      <th className="px-3 py-2 text-center font-medium">
                        五分之一
                      </th>
                      <th className="px-3 py-2 text-center font-medium">本职</th>
                      <th className="px-3 py-2 text-center font-medium">成长标记</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categorySkills.map((skill) => {
                      const total = getCoc7SkillTotal(skill);

                      return (
                        <tr
                          key={skill.key}
                          className="border-t border-gray-200"
                        >
                          <td className="px-3 py-2 font-medium text-gray-950">
                            {skill.name || skill.label}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.base}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.occupation}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.interest}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.growth}
                          </td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-950">
                            {total}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {getHalf(total)}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {getFifth(total)}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.isOccupation ? "是" : "否"}
                          </td>
                          <td className="px-3 py-2 text-center text-gray-700">
                            {skill.checked ? "是" : "否"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function getWeapons(value: unknown): WeaponRow[] {
  return asArray(value).map((item, index) => {
    const weapon = parseRecord(item);

    return {
      key: `${displayText(weapon.name, "weapon")}-${index}`,
      name: displayText(weapon.name),
      skill: displayText(weapon.skill),
      value: displayNumber(weapon.value, "—"),
      damage: displayText(weapon.damage),
      range: displayText(weapon.range),
      attacks: displayText(weapon.attacks),
      ammo: displayText(weapon.ammo),
      malfunction: displayText(weapon.malfunction),
    };
  });
}

function EquipmentSection({ value }: { value: unknown }) {
  const record = parseRecord(value);
  const weapons = getWeapons(record.weapons);

  return (
    <section>
      <h3 className="text-base font-semibold text-gray-950">装备与财产</h3>
      <div className="mt-3">
        <DisplayGrid
          items={[
            { label: "现金", value: displayText(record.cash) },
            {
              label: "消费水平",
              value: displayText(record.spending_level),
            },
            { label: "资产", value: displayText(record.assets) },
            { label: "护甲", value: displayText(record.armor) },
            {
              label: "魔法物品与典籍",
              value: displayText(record.magic_items),
            },
          ]}
        />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <TextList title="随身物品与装备" items={asArray(record.items)} />
        <TextList title="法术" items={asArray(record.spells)} />
      </div>
      <h4 className="mt-5 text-sm font-medium text-gray-700">武器</h4>
      {weapons.length > 0 ? (
        <div
          className={`${styles.sheetTableWrap} mt-2 overflow-x-auto rounded-md border border-gray-200`}
        >
          <table className="min-w-[760px] w-full border-collapse text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-3 py-2 font-medium">武器名称</th>
                <th className="px-3 py-2 font-medium">使用技能</th>
                <th className="px-3 py-2 font-medium">成功率</th>
                <th className="px-3 py-2 font-medium">伤害</th>
                <th className="px-3 py-2 font-medium">射程</th>
                <th className="px-3 py-2 font-medium">次数</th>
                <th className="px-3 py-2 font-medium">装弹量</th>
                <th className="px-3 py-2 font-medium">故障</th>
              </tr>
            </thead>
            <tbody>
              {weapons.map((weapon) => (
                <tr key={weapon.key} className="border-t border-gray-200">
                  <td className="px-3 py-2 font-medium text-gray-950">
                    {weapon.name}
                  </td>
                  <td className="px-3 py-2 text-gray-700">{weapon.skill}</td>
                  <td className="px-3 py-2 text-gray-700">{weapon.value}</td>
                  <td className="px-3 py-2 text-gray-700">{weapon.damage}</td>
                  <td className="px-3 py-2 text-gray-700">{weapon.range}</td>
                  <td className="px-3 py-2 text-gray-700">{weapon.attacks}</td>
                  <td className="px-3 py-2 text-gray-700">{weapon.ammo}</td>
                  <td className="px-3 py-2 text-gray-700">
                    {weapon.malfunction}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">暂无武器记录。</p>
      )}
    </section>
  );
}

function BackstorySection({ value }: { value: unknown }) {
  const record = parseRecord(value);
  const relationships = asArray(record.relationships);

  return (
    <section>
      <h3 className="text-base font-semibold text-gray-950">背景故事</h3>
      <div className="mt-3">
        <DisplayGrid
          items={[
            {
              label: "形象描述",
              value: displayText(record.personal_description),
            },
            { label: "思想与信念", value: displayText(record.ideology) },
            {
              label: "重要之人",
              value: displayText(record.significant_people),
            },
            {
              label: "意义非凡之地",
              value: displayText(record.meaningful_locations),
            },
            {
              label: "宝贵之物",
              value: displayText(record.treasured_possessions),
            },
            { label: "特质", value: displayText(record.traits) },
            {
              label: "伤口与疤痕",
              value: displayText(record.injuries_scars),
            },
            {
              label: "恐惧症与躁狂症",
              value: displayText(record.phobias_manias),
            },
            {
              label: "第三类接触与经历",
              value: displayText(record.encounters),
            },
            { label: "备注", value: displayText(record.notes) },
          ]}
        />
      </div>
      <div className="mt-5">
        <TextList title="关系人" items={relationships} />
      </div>
    </section>
  );
}

function StatusSection({ value }: { value: unknown }) {
  const record = parseRecord(value);

  return (
    <section>
      <h3 className="text-base font-semibold text-gray-950">状态记录</h3>
      <div className="mt-3">
        <DisplayGrid
          items={[
            {
              label: "重伤",
              value: record.major_wound === true ? "是" : "否",
            },
            {
              label: "临时性疯狂",
              value: record.temporary_insanity === true ? "是" : "否",
            },
            {
              label: "不定性疯狂",
              value: record.indefinite_insanity === true ? "是" : "否",
            },
          ]}
        />
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <TextList title="当前状态" items={asArray(record.conditions)} />
        <TextList title="伤口记录" items={asArray(record.wounds)} />
      </div>
    </section>
  );
}

export default function Coc7SheetView({ sheet }: Coc7SheetViewProps) {
  const record = parseRecord(sheet);
  const occupationIdValue = Number(record.occupation_id);
  const occupationId =
    Number.isInteger(occupationIdValue) && occupationIdValue > 0
      ? occupationIdValue
      : null;
  const embeddedOccupation = normalizeCoc7Occupation(
    record.occupation_info ?? record.occupation_data ?? record.occupation_record,
  );
  const pointDetailRecord = parseRecord(record.occupation_skill_points_detail);
  const pointCalculation = pointDetailRecord.calculation
    ? (pointDetailRecord as Coc7OccupationPointCalculation)
    : null;

  return (
    <div className={`${styles.sheet} space-y-8`}>
      <section className={styles.sheetPrimary}>
        <h3 className="text-base font-semibold text-gray-950">基础信息</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "职业", key: "occupation" },
              { label: "年龄", key: "age" },
              { label: "性别", key: "gender" },
              { label: "现居地", key: "residence" },
              { label: "出生地", key: "birthplace" },
              { label: "背景年代", key: "background" },
            ]}
          />
          <Coc7OccupationSummary
            calculation={pointCalculation}
            initialOccupation={embeddedOccupation}
            occupationId={occupationId}
            occupationName={displayText(record.occupation, "")}
            occupationPoints={Number(record.occupation_skill_points) || 0}
          />
        </div>
      </section>

      <section className={styles.sheetAttributes}>
        <h3 className="text-base font-semibold text-gray-950">属性</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "力量（STR）", key: "str" },
              { label: "体质（CON）", key: "con" },
              { label: "体型（SIZ）", key: "siz" },
              { label: "敏捷（DEX）", key: "dex" },
              { label: "外貌（APP）", key: "app" },
              { label: "智力（INT）", key: "int" },
              { label: "意志（POW）", key: "pow" },
              { label: "教育（EDU）", key: "edu" },
              { label: "幸运（LUC）", key: "luck" },
            ]}
          />
        </div>
      </section>

      <section className={styles.sheetDerived}>
        <h3 className="text-base font-semibold text-gray-950">衍生属性</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "当前生命值", key: "hp" },
              { label: "最大生命值", key: "max_hp" },
              { label: "魔法值", key: "mp" },
              { label: "理智值", key: "san" },
              { label: "体格", key: "build" },
              { label: "伤害加值", key: "damage_bonus" },
              { label: "移动率", key: "move" },
            ]}
          />
        </div>
      </section>

      <SkillsSection
        value={record.skills_json}
        edu={Number(record.edu) || 0}
        dex={Number(record.dex) || 0}
        interestPoints={record.personal_interest_points}
      />
      <EquipmentSection value={record.equipment_json} />
      <BackstorySection value={record.backstory_json} />
      <StatusSection value={record.status_json} />
    </div>
  );
}
