import type { Person } from "~/data/types";

export const CURRENT_USER_ID = "rizal";

// Avatars 01–17 are the memoji set supplied for the prototype; unused ones are spares for new people.
function avatar(n: number): string {
  return `/images/avatars/avatar-${String(n).padStart(2, "0")}.webp`;
}

// Central Perk Indonesia's marketing team.
export const PEOPLE: Person[] = [
  {
    id: "rizal",
    name: "Rizal Candra",
    title: "Head of Marketing",
    color: "teal",
    avatar: avatar(1)
  },
  { id: "maya", name: "Maya Putri", title: "Brand manager", color: "lime", avatar: avatar(13) },
  { id: "dewi", name: "Dewi Lestari", title: "Brand designer", color: "pink", avatar: avatar(14) },
  { id: "kevin", name: "Kevin Tan", title: "Content creator", color: "sky", avatar: avatar(3) },
  {
    id: "nadia",
    name: "Nadia Rahma",
    title: "Social media specialist",
    color: "violet",
    avatar: avatar(6)
  },
  {
    id: "fajar",
    name: "Fajar Nugroho",
    title: "Performance marketer",
    color: "amber",
    avatar: avatar(15)
  }
];

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((person) => person.id === id);
}
