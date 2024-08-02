import { users } from "@prisma/client";

export interface MUSICAL_LIST_TYPE {
  date: string;
  duration: number;
  genre: string;
  groupAttended: boolean;
  userAttended: USER_ATTENDANCE_TYPE;
  playbill: string;
  banner: string;
  location: string;
  playhouse: string;
  premiere: string;
  title: string;
  year: string;
}

export interface USER_ATTENDANCE_TYPE {
  musicalsandmayhem: boolean; // Group
  danoru: boolean; // Daniel
  annabanza: boolean; // Anna
  Benito: boolean; // Ben
  TommyExpress: boolean; // Tommy
  Kelsey: boolean; // Kelsey
  Marochan: boolean; // Mallory
}

declare module "next-auth" {
  interface Session {
    user: users;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user: users;
  }
}
