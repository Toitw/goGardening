import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJournalEntrySchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CalendarIcon, Leaf, ListTodo, StickyNote, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

type JournalEntryFormData = {
  title: string;
  content: string;
  type: "observation" | "task" | "note";
  imageUrl?: string;
};

type JournalEntry = {
  id: number;
  title: string;
  content: string;
  type: "observation" | "task" | "note";
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(insertJournalEntrySchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      content: "",
      type: "note",
      imageUrl: "",
    },
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/journal"],
    select: (data) => data as JournalEntry[],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        const { imageUrl } = await uploadResponse.json();
        data.imageUrl = imageUrl;
      }

      const response = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create journal entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal entry created successfully",
      });
      form.reset();
      setIsDialogOpen(false);
      setImageFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData & { id: number }) => {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }
        const { imageUrl } = await uploadResponse.json();
        data.imageUrl = imageUrl;
      }

      const response = await fetch(`/api/journal/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to update journal entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal entry updated successfully",
      });
      setSelectedEntry(null);
      setIsDialogOpen(false);
      setImageFile(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update journal entry",
        variant: "destructive",
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/journal/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete journal entry");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
      toast({
        title: "Success",
        description: "Journal entry deleted successfully",
      });
      setSelectedEntry(null);
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete journal entry",
        variant: "destructive",
      });
    },
  });

  const handleEditEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    form.reset({
      title: entry.title,
      content: entry.content,
      type: entry.type,
      imageUrl: entry.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "observation":
        return <Leaf className="w-4 h-4" />;
      case "task":
        return <ListTodo className="w-4 h-4" />;
      case "note":
        return <StickyNote className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Garden Journal</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedEntry ? "Edit Journal Entry" : "Create Journal Entry"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => {
                  if (selectedEntry) {
                    updateEntryMutation.mutate({ ...data, id: selectedEntry.id });
                  } else {
                    createEntryMutation.mutate(data);
                  }
                })}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select entry type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="observation">Plant Observation</SelectItem>
                          <SelectItem value="task">Garden Task</SelectItem>
                          <SelectItem value="note">General Note</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>Image</FormLabel>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createEntryMutation.isPending || updateEntryMutation.isPending}
                >
                  {createEntryMutation.isPending || updateEntryMutation.isPending
                    ? "Saving..."
                    : selectedEntry
                    ? "Update Entry"
                    : "Create Entry"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div>Loading journal entries...</div>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No journal entries yet. Click "New Entry" to start documenting your garden journey.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="relative">
              <CardHeader className="space-y-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getEntryIcon(entry.type)}
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {format(new Date(entry.createdAt), "PPp")}
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedEntry(entry);
                    setIsViewDialogOpen(true);
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap line-clamp-3">
                    {entry.content}
                  </p>
                  {entry.imageUrl && (
                    <div className="mt-2 relative w-full pt-[56.25%]">
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedEntry && (
                <>
                  {getEntryIcon(selectedEntry.type)}
                  <span>{selectedEntry.title}</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {selectedEntry &&
                format(new Date(selectedEntry.createdAt), "PPpp")}
            </DialogDescription>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap">{selectedEntry.content}</p>
              {selectedEntry.imageUrl && (
                <div className="relative w-full pt-[56.25%]">
                  <img
                    src={selectedEntry.imageUrl}
                    alt={selectedEntry.title}
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this journal entry? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedEntry && deleteEntryMutation.mutate(selectedEntry.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}