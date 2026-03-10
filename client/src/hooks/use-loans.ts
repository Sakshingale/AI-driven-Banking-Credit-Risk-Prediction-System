import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type LoanApplicationInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useLoans() {
  return useQuery({
    queryKey: [api.loans.list.path],
    queryFn: async () => {
      const res = await fetch(api.loans.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch loans");
      return api.loans.list.responses[200].parse(await res.json());
    },
  });
}

export function useLoan(id: number) {
  return useQuery({
    queryKey: [api.loans.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.loans.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch loan");
      return api.loans.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: LoanApplicationInput) => {
      const validated = api.loans.create.input.parse(data);
      const res = await fetch(api.loans.create.path, {
        method: api.loans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.loans.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create application");
      }
      return api.loans.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      toast({ title: "Application created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateLoanStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const url = buildUrl(api.loans.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.loans.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.loans.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.loans.get.path, variables.id] });
      toast({ title: `Application marked as ${variables.status}` });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useAnalyzeLoan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.loans.analyze.path, { id });
      const res = await fetch(url, {
        method: api.loans.analyze.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to run analysis");
      return api.loans.analyze.responses[200].parse(await res.json());
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.loans.get.path, id] });
      toast({ title: "AI Analysis Complete", description: "Risk profile has been generated." });
    },
    onError: (error) => {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    }
  });
}
