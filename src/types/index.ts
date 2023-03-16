export interface MUSICAL_LIST_TYPE {
  date: string;
  duration: number;
  genre: string;
  groupAttended: boolean;
  playbill: string;
  banner: string;
  location: string;
  playhouse: string;
  premiere: string;
  title: string;
  year: string;
}

export interface EVENT_LIST_TYPE {
  id: number;
  title: string;
  playhouse: string;
  location: string;
  start: string;
  end: string;
  attending: boolean;
}
