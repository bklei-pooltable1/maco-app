// Hex values must stay in sync with src/theme.js — see C.* tokens for textMid, green, gold.
export const TIERS = {
  general:      { rank: 1, label: "General Member",      color: "#6B5248" },
  financial:    { rank: 2, label: "Financial Member",    color: "#2D8A4E" },
  foundational: { rank: 3, label: "Foundational Member", color: "#D8A737" },
};

export const TIER_KEYS = ["general", "financial", "foundational"];

// Returns true if a member of `memberTier` can see content tagged `requiredTier`
export function canSee(memberTier, requiredTier) {
  const memberRank = TIERS[memberTier]?.rank ?? 0;
  const requiredRank = TIERS[requiredTier]?.rank ?? 1;
  return memberRank >= requiredRank;
}

// Returns true if `tier` is a valid tier key
export function isValidTier(tier) {
  return TIER_KEYS.includes(tier);
}
