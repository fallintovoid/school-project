export interface Song {
  id: string;
  title: string;
  artist: string;
  votes: number;
  hasVoted: boolean;
  duration?: string;
  albumArt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songCount: number;
  coverImage?: string;
  createdAt: string;
}

export interface TopPlaylist {
  id: string;
  name: string;
  sourcePlaylistId: string;
  sourcePlaylistName: string;
  songCount: number;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
}
