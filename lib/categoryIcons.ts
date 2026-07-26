import {
  Globe, Sparkles, Trophy, Bitcoin, Landmark,
  LineChart, Gamepad2, Clapperboard, BarChart3, Clock,
  type LucideIcon,
} from "lucide-react";
import { MarketCategory } from "./types";

export const CATEGORY_ICONS: Record<MarketCategory, LucideIcon> = {
  all:           Globe,
  new:           Sparkles,
  closing:       Clock,
  sports:        Trophy,
  crypto:        Bitcoin,
  politics:      Landmark,
  finance:       LineChart,
  esports:       Gamepad2,
  entertainment: Clapperboard,
  economy:       BarChart3,
};

export const DEFAULT_CATEGORY_ICON: LucideIcon = BarChart3;

export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category as MarketCategory] ?? DEFAULT_CATEGORY_ICON;
}
