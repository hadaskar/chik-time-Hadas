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
  Apple,
  Baby,
  Bath,
  Bed,
  Bike,
  Brush,
  Cat,
  Dog,
  Egg,
  Eye,
  Flower2,
  Footprints,
  GlassWater,
  Headphones,
  Heart,
  Lamp,
  Leaf,
  Moon,
  Music,
  Pencil,
  Pill,
  Salad,
  Sandwich,
  School,
  Smile,
  Sun,
  Sunrise,
  Timer,
  Utensils,
  Wind,
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
  apple: Apple,
  baby: Baby,
  bath: Bath,
  bed: Bed,
  bike: Bike,
  brush: Brush,
  cat: Cat,
  dog: Dog,
  egg: Egg,
  eye: Eye,
  flower: Flower2,
  footprints: Footprints,
  "glass-water": GlassWater,
  headphones: Headphones,
  heart: Heart,
  lamp: Lamp,
  leaf: Leaf,
  moon: Moon,
  music: Music,
  pencil: Pencil,
  pill: Pill,
  salad: Salad,
  sandwich: Sandwich,
  school: School,
  smile: Smile,
  sun: Sun,
  sunrise: Sunrise,
  timer: Timer,
  utensils: Utensils,
  wind: Wind,
}

interface TaskIconProps extends LucideProps {
  iconKey: string
}

export function TaskIcon({ iconKey, ...props }: TaskIconProps) {
  const Icon = iconMap[iconKey] || Sparkles
  return <Icon {...props} />
}

// Top 8 most useful for daily routines first
export const availableIcons = [
  "coffee", "droplets", "shirt", "utensils", "dumbbell", "book-open", "brain", "sunrise",
  ...Object.keys(iconMap).filter(
    (k) => k !== "plus" && !["coffee","droplets","shirt","utensils","dumbbell","book-open","brain","sunrise"].includes(k)
  ),
]
