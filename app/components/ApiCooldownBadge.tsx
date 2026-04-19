"use client";

type Props = {
  cooldown: number;
};

export function ApiCooldownBadge({
  cooldown,
}: Props) {
  if (cooldown <= 0) {
    return (
      <div className="text-xs text-emerald-400">
        🟢 API Ready
      </div>
    );
  }

  return (
    <div className="text-xs text-yellow-400">
      🟡 API Wait {cooldown}s
    </div>
  );
}