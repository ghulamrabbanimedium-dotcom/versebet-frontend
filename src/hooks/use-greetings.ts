import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertGreeting } from "@shared/routes";

export function useGreetings() {
  return useQuery({
    queryKey: [api.greetings.list.path],
    queryFn: async () => {
      const res = await fetch(api.greetings.list.path);
      if (!res.ok) throw new Error("Failed to fetch greetings");
      return api.greetings.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGreeting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertGreeting) => {
      const validated = api.greetings.create.input.parse(data);
      const res = await fetch(api.greetings.create.path, {
        method: api.greetings.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.greetings.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to post greeting");
      }
      
      return api.greetings.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.greetings.list.path] });
    },
  });
}
