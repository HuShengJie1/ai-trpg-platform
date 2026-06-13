import {
  asRecord,
  fieldText,
  formatJsonValue,
} from "../../lib/characterDisplay";
import type { JsonRecord } from "../../types/character";

type FieldItem = {
  label: string;
  key: string;
};

type Dnd5eSheetViewProps = {
  sheet: unknown;
};

function FieldGrid({
  items,
  record,
}: {
  items: FieldItem[];
  record: JsonRecord;
}) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  return (
    <section>
      <h3 className="text-base font-semibold text-gray-950">{label}</h3>
      <pre className="mt-3 overflow-x-auto rounded-md bg-gray-950 p-4 text-sm leading-6 text-gray-100">
        {formatJsonValue(value)}
      </pre>
    </section>
  );
}

export default function Dnd5eSheetView({ sheet }: Dnd5eSheetViewProps) {
  const record = asRecord(sheet);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-gray-950">基础信息</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "种族", key: "race" },
              { label: "职业", key: "class_name" },
              { label: "子职业", key: "subclass" },
              { label: "等级", key: "level" },
              { label: "背景", key: "background" },
              { label: "阵营", key: "alignment" },
              { label: "玩家", key: "player_name" },
              { label: "经验值", key: "experience_points" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-gray-950">六维属性</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "Strength", key: "strength" },
              { label: "Dexterity", key: "dexterity" },
              { label: "Constitution", key: "constitution" },
              { label: "Intelligence", key: "intelligence" },
              { label: "Wisdom", key: "wisdom" },
              { label: "Charisma", key: "charisma" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-gray-950">战斗字段</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "AC", key: "armor_class" },
              { label: "先攻", key: "initiative" },
              { label: "速度", key: "speed" },
              { label: "最大 HP", key: "max_hp" },
              { label: "当前 HP", key: "current_hp" },
              { label: "临时 HP", key: "temporary_hp" },
              { label: "Hit Dice", key: "hit_dice" },
            ]}
          />
        </div>
      </section>

      <JsonBlock label="熟练项 JSON" value={record.proficiencies_json} />
      <JsonBlock label="技能 JSON" value={record.skills_json} />
      <JsonBlock label="装备 JSON" value={record.equipment_json} />
      <JsonBlock label="法术 JSON" value={record.spellcasting_json} />
      <JsonBlock label="特性 JSON" value={record.features_json} />
      <JsonBlock label="状态 JSON" value={record.status_json} />
    </div>
  );
}
