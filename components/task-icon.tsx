"use client"

import {
  Sparkles,
  Droplets,
  Shirt,
  Coffee,
  Brain,
  Dumbbell,
  BookOpen,
  Newspaper,
  Plus,
  type LucideProps,
} from "lucide-react"

const iconMap: Record<string, React.FC<LucideProps>> = {
  sparkles: Sparkles,
  droplets: Droplets,
  shirt: Shirt,
  coffee: Coffee,
  brain: Brain,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  newspaper: Newspaper,
  plus: Plus,
}

interface TaskIconProps extends LucideProps {
  iconKey: string
}

export function TaskIcon({ iconKey, ...props }: TaskIconProps) {
  const Icon = iconMap[iconKey] || Sparkles
  return <Icon {...props} />
}

export const availableIcons = Object.keys(iconMap).filter((k) => k !== "plus")
