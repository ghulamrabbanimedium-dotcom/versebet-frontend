import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateGreeting } from "@/hooks/use-greetings";
import { insertGreetingSchema, type InsertGreeting } from "@shared/schema";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function GuestbookForm() {
  const { toast } = useToast();
  const createGreeting = useCreateGreeting();
  const [isFocused, setIsFocused] = useState(false);

  const form = useForm<InsertGreeting>({
    resolver: zodResolver(insertGreetingSchema),
    defaultValues: {
      name: "",
      message: "",
    },
  });

  const onSubmit = (data: InsertGreeting) => {
    createGreeting.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Message signed!",
          description: "Thanks for leaving a note in the guestbook.",
        });
        form.reset();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="bg-secondary/30 p-8 rounded-2xl border border-border/50 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold font-display text-foreground">Sign the Guestbook</h3>
        <p className="text-muted-foreground text-sm mt-1">Leave a message for future visitors.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="sr-only">Name</label>
          <input
            id="name"
            {...form.register("name")}
            placeholder="Your Name"
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200"
          />
          {form.formState.errors.name && (
            <p className="text-destructive text-xs mt-1 pl-1">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="sr-only">Message</label>
          <textarea
            id="message"
            {...form.register("message")}
            placeholder="Write a warm message..."
            rows={3}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200 resize-none"
          />
          {form.formState.errors.message && (
            <p className="text-destructive text-xs mt-1 pl-1">{form.formState.errors.message.message}</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={createGreeting.isPending}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm
              bg-primary text-primary-foreground shadow-lg shadow-primary/20
              hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5
              active:translate-y-0 active:shadow-sm
              disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none
              transition-all duration-200 ease-out
            `}
          >
            {createGreeting.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing...
              </>
            ) : (
              <>
                Sign Guestbook
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
