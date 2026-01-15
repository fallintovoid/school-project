export interface User {
  id?: string | number;
  username: string;
  [k: string]: any;
}

export interface Playlist {
  id: string | number;
  name: string;
  songsCount?: number;
  [k: string]: any;
}

export interface Song {
  id: string | number;
  band: string;
  title: string;
  genre: string;
  votes: number;
  userVoted?: boolean;
  [k: string]: any;
}
