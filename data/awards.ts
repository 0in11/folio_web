export interface Award {
  title: string;
  date: string;
  organizer?: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: number;
  doi?: string;
}
