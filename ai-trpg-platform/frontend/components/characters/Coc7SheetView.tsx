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

type Coc7SheetViewProps = {
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

export default function Coc7SheetView({ sheet }: Coc7SheetViewProps) {
  const record = asRecord(sheet);

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-base font-semibold text-gray-950">基础信息</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "职业", key: "occupation" },
              { label: "年龄", key: "age" },
              { label: "性别", key: "gender" },
              { label: "居住地", key: "residence" },
              { label: "出生地", key: "birthplace" },
              { label: "背景", key: "background" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-gray-950">属性</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "STR", key: "str" },
              { label: "CON", key: "con" },
              { label: "SIZ", key: "siz" },
              { label: "DEX", key: "dex" },
              { label: "APP", key: "app" },
              { label: "INT", key: "int" },
              { label: "POW", key: "pow" },
              { label: "EDU", key: "edu" },
              { label: "Luck", key: "luck" },
            ]}
          />
        </div>
      </section>

      <section>
        <h3 className="text-base font-semibold text-gray-950">衍生属性</h3>
        <div className="mt-3">
          <FieldGrid
            record={record}
            items={[
              { label: "HP", key: "hp" },
              { label: "MP", key: "mp" },
              { label: "SAN", key: "san" },
              { label: "Build", key: "build" },
              { label: "Damage Bonus", key: "damage_bonus" },
              { label: "Move", key: "move" },
            ]}
          />
        </div>
      </section>

      <JsonBlock label="技能 JSON" value={record.skills_json} />
      <JsonBlock label="装备 JSON" value={record.equipment_json} />
      <JsonBlock label="背景 JSON" value={record.backstory_json} />
      <JsonBlock label="状态 JSON" value={record.status_json} />
    </div>
  );
}
