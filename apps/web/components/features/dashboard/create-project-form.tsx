"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiClient } from "@/lib/api";

interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const response = await apiClient.post<{ id: string; name: string }>("/api/v1/projects", data);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>
          Enter a name and optional description for your new project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Awesome Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="A brief description of what this project does"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          {createMutation.isError && (
            <p className="text-sm text-destructive">
              {createMutation.error instanceof Error ? createMutation.error.message : "Failed to create project"}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}