import { ReactNode, useState } from "react";
import { Sparkles, ListMusic } from "lucide-react";
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
import { playlistsApi } from "@/lib/apiClient";

interface CreatePlaylistDialogProps {
  onCreated: () => void | Promise<void>;
  trigger?: ReactNode;
}

export function CreatePlaylistDialog({ onCreated, trigger }: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setIsSubmitting(true);
      try {
        await playlistsApi.create(name.trim());
        toast.success("Playlist created");
        setName("");
        setOpen(false);
        await onCreated();
      } catch (error: any) {
        toast.error(error?.message || "Failed to create playlist");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" className="gap-2 border-primary/30 hover:border-primary hover:bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            Create Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-primary" />
            Create New Playlist
          </DialogTitle>
          <DialogDescription>
            Give your new playlist a name to get started.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="playlist-name">Playlist Name</Label>
              <Input
                id="playlist-name"
                placeholder="My Top Hits..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary/50 border-border focus:border-primary"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" disabled={!name.trim() || isSubmitting}>
              <Sparkles className="w-4 h-4" />
              Create Playlist
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
