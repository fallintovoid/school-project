import { useState } from "react";
import { ListMusic, Music2, Plus, Crown, Trash2 } from "lucide-react";
import { Header } from "@/components/Header";
import { PlaylistCard } from "@/components/PlaylistCard";
import { SongCard } from "@/components/SongCard";
import { AddSongDialog } from "@/components/AddSongDialog";
import { CreatePlaylistDialog } from "@/components/CreatePlaylistDialog";
import { Button } from "@/components/ui/button";
import { Playlist, Song, TopPlaylist } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Mock data for UI demonstration
const mockPlaylists: Playlist[] = [
  { id: "1", name: "Summer Vibes 2024", songCount: 12, createdAt: "2024-01-15" },
  { id: "2", name: "Workout Mix", songCount: 8, createdAt: "2024-01-10" },
  { id: "3", name: "Chill Evening", songCount: 15, createdAt: "2024-01-05" },
  { id: "4", name: "Road Trip Classics", songCount: 20, createdAt: "2024-01-01" },
];

const mockSongs: Record<string, Song[]> = {
  "1": [
    { id: "s1", title: "Blinding Lights", artist: "The Weeknd", votes: 24, hasVoted: true, duration: "3:20" },
    { id: "s2", title: "Watermelon Sugar", artist: "Harry Styles", votes: 18, hasVoted: false, duration: "2:54" },
    { id: "s3", title: "Levitating", artist: "Dua Lipa", votes: 15, hasVoted: false, duration: "3:23" },
    { id: "s4", title: "Good 4 U", artist: "Olivia Rodrigo", votes: 12, hasVoted: true, duration: "2:58" },
  ],
  "2": [
    { id: "s5", title: "Stronger", artist: "Kanye West", votes: 32, hasVoted: false, duration: "5:12" },
    { id: "s6", title: "Eye of the Tiger", artist: "Survivor", votes: 28, hasVoted: true, duration: "4:05" },
    { id: "s7", title: "Lose Yourself", artist: "Eminem", votes: 25, hasVoted: false, duration: "5:26" },
  ],
  "3": [
    { id: "s8", title: "Sunset Lover", artist: "Petit Biscuit", votes: 20, hasVoted: false, duration: "3:31" },
    { id: "s9", title: "Breathe", artist: "Télépopmusik", votes: 16, hasVoted: true, duration: "4:48" },
  ],
  "4": [
    { id: "s10", title: "Hotel California", artist: "Eagles", votes: 45, hasVoted: true, duration: "6:30" },
    { id: "s11", title: "Sweet Home Alabama", artist: "Lynyrd Skynyrd", votes: 38, hasVoted: false, duration: "4:45" },
  ],
};

interface PlaylistsPageProps {
  username: string;
  onLogout: () => void;
}

export function PlaylistsPage({ username, onLogout }: PlaylistsPageProps) {
  const [playlists, setPlaylists] = useState(mockPlaylists);
  const [topPlaylists, setTopPlaylists] = useState<TopPlaylist[]>([]);
  const [songs, setSongs] = useState(mockSongs);
  const [topPlaylistSongs, setTopPlaylistSongs] = useState<Record<string, Song[]>>({});
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [selectedTopPlaylistId, setSelectedTopPlaylistId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"playlists" | "top">("playlists");
  const [newPlaylistOpen, setNewPlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);
  const selectedTopPlaylist = topPlaylists.find((p) => p.id === selectedTopPlaylistId);
  const currentSongs = selectedPlaylistId ? songs[selectedPlaylistId] || [] : [];
  const currentTopSongs = selectedTopPlaylistId ? topPlaylistSongs[selectedTopPlaylistId] || [] : [];

  const handleVote = (songId: string) => {
    if (!selectedPlaylistId) return;
    
    setSongs((prev) => ({
      ...prev,
      [selectedPlaylistId]: prev[selectedPlaylistId].map((song) =>
        song.id === songId
          ? { 
              ...song, 
              votes: song.hasVoted ? song.votes - 1 : song.votes + 1,
              hasVoted: !song.hasVoted 
            }
          : song
      ),
    }));
  };

  const handleAddSong = (newSong: { title: string; artist: string }) => {
    if (!selectedPlaylistId) return;
    
    const song: Song = {
      id: `s${Date.now()}`,
      title: newSong.title,
      artist: newSong.artist,
      votes: 0,
      hasVoted: false,
    };
    
    setSongs((prev) => ({
      ...prev,
      [selectedPlaylistId]: [...(prev[selectedPlaylistId] || []), song],
    }));

    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === selectedPlaylistId
          ? { ...p, songCount: p.songCount + 1 }
          : p
      )
    );
  };

  const handleCreateTopPlaylist = (name: string) => {
    if (!selectedPlaylistId || !selectedPlaylist) return;
    
    const topSongs = [...currentSongs]
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    const newTopPlaylist: TopPlaylist = {
      id: `tp${Date.now()}`,
      name,
      sourcePlaylistId: selectedPlaylistId,
      sourcePlaylistName: selectedPlaylist.name,
      songCount: topSongs.length,
      createdAt: new Date().toISOString(),
    };

    setTopPlaylists((prev) => [...prev, newTopPlaylist]);
    setTopPlaylistSongs((prev) => ({
      ...prev,
      [newTopPlaylist.id]: topSongs.map((s) => ({ ...s, id: `tp-${s.id}-${Date.now()}` })),
    }));

    // Switch to top playlists tab and select the new playlist
    setActiveTab("top");
    setSelectedTopPlaylistId(newTopPlaylist.id);
    setSelectedPlaylistId(null);
  };

  const handleDeleteTopPlaylist = (topPlaylistId: string) => {
    setTopPlaylists((prev) => prev.filter((p) => p.id !== topPlaylistId));
    setTopPlaylistSongs((prev) => {
      const updated = { ...prev };
      delete updated[topPlaylistId];
      return updated;
    });
    if (selectedTopPlaylistId === topPlaylistId) {
      setSelectedTopPlaylistId(null);
    }
  };

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: `p${Date.now()}`,
      name: newPlaylistName.trim(),
      songCount: 0,
      createdAt: new Date().toISOString(),
    };

    setPlaylists((prev) => [...prev, newPlaylist]);
    setSongs((prev) => ({ ...prev, [newPlaylist.id]: [] }));
    setNewPlaylistName("");
    setNewPlaylistOpen(false);
    setSelectedPlaylistId(newPlaylist.id);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "playlists" | "top");
    if (value === "playlists") {
      setSelectedTopPlaylistId(null);
    } else {
      setSelectedPlaylistId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header username={username} onLogout={onLogout} />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <main className="flex-1 container px-4 md:px-6 py-6 relative">
        <div className="grid lg:grid-cols-[400px_1fr] gap-6 h-full">
          {/* Playlists Panel with Tabs */}
          <div className="glass rounded-2xl p-4 md:p-6 flex flex-col h-fit lg:h-[calc(100vh-8rem)] animate-slide-in">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="playlists" className="gap-2">
                  <ListMusic className="w-4 h-4" />
                  Your Playlists
                </TabsTrigger>
                <TabsTrigger value="top" className="gap-2">
                  <Crown className="w-4 h-4" />
                  Top Playlists
                </TabsTrigger>
              </TabsList>

              <TabsContent value="playlists" className="flex-1 flex flex-col mt-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
                  </p>
                  
                  <Dialog open={newPlaylistOpen} onOpenChange={setNewPlaylistOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Plus className="w-5 h-5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-border/50">
                      <DialogHeader>
                        <DialogTitle className="font-display">Create New Playlist</DialogTitle>
                        <DialogDescription>
                          Give your new playlist a name to get started.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="new-playlist-name">Playlist Name</Label>
                        <Input
                          id="new-playlist-name"
                          placeholder="My Awesome Playlist..."
                          value={newPlaylistName}
                          onChange={(e) => setNewPlaylistName(e.target.value)}
                          className="mt-2 bg-secondary/50 border-border focus:border-primary"
                          onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setNewPlaylistOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="glow" onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>
                          Create
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {playlists.map((playlist) => (
                    <PlaylistCard
                      key={playlist.id}
                      playlist={playlist}
                      isSelected={selectedPlaylistId === playlist.id}
                      onClick={() => setSelectedPlaylistId(playlist.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="top" className="flex-1 flex flex-col mt-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {topPlaylists.length} {topPlaylists.length === 1 ? 'top playlist' : 'top playlists'}
                  </p>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {topPlaylists.length > 0 ? (
                    topPlaylists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`group relative p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          selectedTopPlaylistId === playlist.id
                            ? "bg-primary/20 border border-primary/50 shadow-lg"
                            : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
                        }`}
                        onClick={() => setSelectedTopPlaylistId(playlist.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center flex-shrink-0">
                            <Crown className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              From: {playlist.sourcePlaylistName} • {playlist.songCount} songs
                            </p>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass border-border/50">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Top Playlist?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{playlist.name}". This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDeleteTopPlaylist(playlist.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                        <Crown className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No top playlists yet</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        Create one from your playlists using "Create Top Playlist"
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Songs Panel */}
          <div className="glass rounded-2xl p-4 md:p-6 flex flex-col h-fit lg:h-[calc(100vh-8rem)] animate-fade-in" style={{ animationDelay: "100ms" }}>
            {activeTab === "playlists" && selectedPlaylist ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-xl text-primary">
                      {selectedPlaylist.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentSongs.length} {currentSongs.length === 1 ? 'song' : 'songs'} • Vote for your favorites
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AddSongDialog onAddSong={handleAddSong} />
                    {currentSongs.length > 0 && (
                      <CreatePlaylistDialog 
                        onCreatePlaylist={handleCreateTopPlaylist}
                        topSongsCount={Math.min(5, currentSongs.length)}
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {currentSongs.length > 0 ? (
                    currentSongs
                      .sort((a, b) => b.votes - a.votes)
                      .map((song, index) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          index={index}
                          onVote={handleVote}
                        />
                      ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                        <Music2 className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-display font-medium text-lg mb-2">No songs yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add your first song to this playlist
                      </p>
                      <AddSongDialog onAddSong={handleAddSong} />
                    </div>
                  )}
                </div>
              </>
            ) : activeTab === "top" && selectedTopPlaylist ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h2 className="font-display font-semibold text-xl text-primary">
                        {selectedTopPlaylist.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Top songs from {selectedTopPlaylist.sourcePlaylistName}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {currentTopSongs.map((song, index) => (
                    <div
                      key={song.id}
                      className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-transparent"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{song.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {song.votes} votes
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  {activeTab === "playlists" ? (
                    <Music2 className="w-10 h-10 text-muted-foreground" />
                  ) : (
                    <Crown className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="font-display font-semibold text-xl mb-2">
                  {activeTab === "playlists" ? "Select a Playlist" : "Select a Top Playlist"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {activeTab === "playlists"
                    ? "Choose a playlist from the left to view and vote on songs"
                    : "Choose a top playlist to view the most voted songs"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
