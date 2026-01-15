import { useState } from "react";
import { Plus, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { songsApi } from "@/lib/apiClient";

interface AddSongDialogProps {
  playlistId: string | number;
  onSongAdded: () => void | Promise<void>;
}

export function AddSongDialog({ playlistId, onSongAdded }: AddSongDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [band, setBand] = useState("");
  const [genre, setGenre] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !band.trim() || !genre.trim()) return;
    setIsSubmitting(true);
    try {
      await songsApi.add({
        title: title.trim(),
        band: band.trim(),
        genre: genre.trim(),
        playlistId,
      });
      toast.success("Song added");
      setTitle("");
      setBand("");
      setGenre("");
      setOpen(false);
      await onSongAdded();
    } catch (error: any) {
      toast.error(error?.message || "Failed to add song");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Song
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            Add New Song
          </DialogTitle>
          <DialogDescription>
            Add a new song to this playlist for others to vote on.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Song Title</Label>
              <Input
                id="title"
                placeholder="Enter song title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="band">Band</Label>
              <Input
                id="band"
                placeholder="Enter band name..."
                value={band}
                onChange={(e) => setBand(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                placeholder="Enter genre..."
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="glow"
              disabled={!title.trim() || !band.trim() || !genre.trim() || isSubmitting}
            >
              Add Song
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
