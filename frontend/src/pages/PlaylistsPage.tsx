import { useEffect, useMemo, useState } from "react";
import { Crown, ListMusic, Music2, Plus } from "lucide-react";
import { Header } from "@/components/Header";
import { PlaylistCard } from "@/components/PlaylistCard";
import { SongCard } from "@/components/SongCard";
import { AddSongDialog } from "@/components/AddSongDialog";
import { CreatePlaylistDialog } from "@/components/CreatePlaylistDialog";
import { Playlist, Song } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { playlistsApi } from "@/lib/apiClient";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";

export function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<"playlists" | "top">("playlists");
  const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(false);
  const [isSongsLoading, setIsSongsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState<string | null>(null);
  const [songsError, setSongsError] = useState<string | null>(null);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId) || null;

  const topSongs = useMemo(
    () => songs.filter((song) => song.votes > 0).sort((a, b) => b.votes - a.votes),
    [songs]
  );

  const loadPlaylists = async () => {
    setIsPlaylistsLoading(true);
    setPlaylistsError(null);
    try {
      const data = await playlistsApi.list();
      setPlaylists(data);
      if (!selectedPlaylistId && data.length > 0) {
        setSelectedPlaylistId(data[0].id);
      } else if (selectedPlaylistId && !data.some((playlist) => playlist.id === selectedPlaylistId)) {
        setSelectedPlaylistId(data[0]?.id ?? null);
      }
    } catch (error: any) {
      setPlaylistsError(error?.message || "Failed to load playlists");
      toast.error(error?.message || "Failed to load playlists");
    } finally {
      setIsPlaylistsLoading(false);
    }
  };

  const loadPlaylistDetails = async (playlistId: string | number) => {
    setIsSongsLoading(true);
    setSongsError(null);
    try {
      const { playlist, songs: playlistSongs } = await playlistsApi.details(playlistId);
      setSongs(playlistSongs);
      setPlaylists((prev) =>
        prev.map((p) =>
          p.id === playlistId ? { ...p, ...playlist, songsCount: playlistSongs.length } : p
        )
      );
    } catch (error: any) {
      setSongsError(error?.message || "Failed to load songs");
      toast.error(error?.message || "Failed to load songs");
    } finally {
      setIsSongsLoading(false);
    }
  };

  useEffect(() => {
    void loadPlaylists();
  }, []);

  useEffect(() => {
    if (selectedPlaylistId !== null) {
      void loadPlaylistDetails(selectedPlaylistId);
    } else {
      setSongs([]);
    }
  }, [selectedPlaylistId]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as "playlists" | "top");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

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
                    {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
                  </p>
                  <CreatePlaylistDialog
                    onCreated={loadPlaylists}
                    trigger={
                      <Button variant="ghost" size="icon">
                        <Plus className="w-5 h-5" />
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {isPlaylistsLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : playlistsError ? (
                    <p className="text-sm text-muted-foreground">{playlistsError}</p>
                  ) : (
                    playlists.map((playlist) => (
                      <PlaylistCard
                        key={playlist.id}
                        playlist={playlist}
                        isSelected={selectedPlaylistId === playlist.id}
                        onClick={() => setSelectedPlaylistId(playlist.id)}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="top" className="flex-1 flex flex-col mt-0 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
                  </p>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {isPlaylistsLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : playlistsError ? (
                    <p className="text-sm text-muted-foreground">{playlistsError}</p>
                  ) : playlists.length > 0 ? (
                    playlists.map((playlist) => (
                      <div
                        key={playlist.id}
                        className={`group relative p-4 rounded-xl transition-all duration-200 cursor-pointer ${
                          selectedPlaylistId === playlist.id
                            ? "bg-primary/20 border border-primary/50 shadow-lg"
                            : "bg-secondary/30 hover:bg-secondary/50 border border-transparent"
                        }`}
                        onClick={() => setSelectedPlaylistId(playlist.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center flex-shrink-0">
                            <Crown className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{playlist.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              Top songs - {playlist.songsCount ?? 0} songs
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                        <Crown className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No playlists yet</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        Create a playlist to see top voted songs
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Songs Panel */}
          <div
            className="glass rounded-2xl p-4 md:p-6 flex flex-col h-fit lg:h-[calc(100vh-8rem)] animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            {activeTab === "playlists" && selectedPlaylist ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display font-semibold text-xl text-primary">
                      {selectedPlaylist.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {songs.length} {songs.length === 1 ? "song" : "songs"} - Vote for your favorites
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <AddSongDialog playlistId={selectedPlaylist.id} onSongAdded={() => loadPlaylistDetails(selectedPlaylist.id)} />
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {isSongsLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : songsError ? (
                    <p className="text-sm text-muted-foreground">{songsError}</p>
                  ) : songs.length > 0 ? (
                    songs
                      .slice()
                      .sort((a, b) => b.votes - a.votes)
                      .map((song, index) => (
                        <SongCard
                          key={song.id}
                          song={song}
                          index={index}
                          onRefresh={() => loadPlaylistDetails(selectedPlaylist.id)}
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
                      <AddSongDialog
                        playlistId={selectedPlaylist.id}
                        onSongAdded={() => loadPlaylistDetails(selectedPlaylist.id)}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : activeTab === "top" && selectedPlaylist ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <h2 className="font-display font-semibold text-xl text-primary">
                        {selectedPlaylist.name}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                     Top voted songs (votes {"\u003E"} 0)
                    </p>
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto flex-1 pr-2">
                  {isSongsLoading ? (
                    <>
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </>
                  ) : songsError ? (
                    <p className="text-sm text-muted-foreground">{songsError}</p>
                  ) : topSongs.length > 0 ? (
                    topSongs.map((song, index) => (
                      <div
                        key={song.id}
                        className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-transparent"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{song.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{song.band}</p>
                        </div>
                        <div className="text-sm text-muted-foreground">{song.votes} votes</div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                        <Crown className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No voted songs yet</h3>
                      <p className="text-sm text-muted-foreground max-w-[200px]">
                        Vote on songs to see them appear here
                      </p>
                    </div>
                  )}
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
                  {activeTab === "playlists" ? "Select a Playlist" : "Select a Playlist"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {activeTab === "playlists"
                    ? "Choose a playlist from the left to view and vote on songs"
                    : "Choose a playlist to view the most voted songs"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
