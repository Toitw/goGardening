import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { CalendarIcon, Leaf, ListTodo, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

type JournalEntryFormData = {
  title: string;
  content: string;
  type: "observation" | "task" | "note";
};

export default function Journal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(insertJournalEntrySchema.omit({ userId: true })),
    defaultValues: {
      title: "",
      content: "",
      type: "note",
    },
  });

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/journal"],
    select: (data) => data as any[],
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: JournalEntryFormData) => {
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
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create journal entry",
        variant: "destructive",
      });
    },
  });

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
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createEntryMutation.mutate(data))}
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createEntryMutation.isPending}
                >
                  {createEntryMutation.isPending ? "Creating..." : "Create Entry"}
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
          {entries.map((entry: any) => (
            <Card key={entry.id}>
              <CardHeader className="space-y-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getEntryIcon(entry.type)}
                    <CardTitle className="text-lg">{entry.title}</CardTitle>
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {format(new Date(entry.createdAt), "PPp")}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{entry.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}