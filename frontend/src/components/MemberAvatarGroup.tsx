import { members } from "../data/mockData";

export default function MemberAvatarGroup({ limit = 4 }: { limit?: number }) {
  return (
    <div className="flex -space-x-2">
      {members.slice(0, limit).map((m) => (
        <div key={m.name} title={m.name} className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-semibold text-brand-700">
          {m.avatar}
        </div>
      ))}
    </div>
  );
}
