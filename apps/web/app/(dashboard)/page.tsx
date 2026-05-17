"use client";

import * as React from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, User } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ExternalLink, FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateProjectForm } from "@/components/features/dashboard/create-project-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Subscription {
  id: string;
  status: string;
  planId: string;
  currentPeriodEnd: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface UserWithSubscription extends User {
  subscription?: Subscription;
}

function CreateProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Create a new project to get started
          </DialogDescription>
        </DialogHeader>
        <CreateProjectForm
          onSuccess={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useQuery<UserWithSubscription>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await apiClient.get<User>("/api/v1/user/me");
      if (response.error || !response.data) {
        throw new Error(response.error || "Failed to fetch user");
      }

      const subResponse = await apiClient.get<Subscription>("/api/v1/subscriptions/current");

      return {
        ...response.data,
        subscription: subResponse.data,
      };
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await apiClient.get<Project[]>("/api/v1/projects");
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
  });

  if (userLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const subscriptionStatus = user?.subscription?.status || "active";

  return (
    <div className="space-y-8">
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your account
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge
                variant={subscriptionStatus === "active" ? "success" : "secondary"}
              >
                {subscriptionStatus}
              </Badge>
              {user?.subscription?.currentPeriodEnd && (
                <span className="text-xs text-muted-foreground">
                  Renews {new Date(user.subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Active projects in your workspace
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {user?.subscription?.planId || "Free"}
            </div>
            <Button variant="outline" size="sm" className="mt-2">
              Upgrade Plan
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
        {projectsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                You haven&apos;t created any projects yet
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card
                  className="relative group cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.preventDefault()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description || "No description"}
                    </p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      View Project <ExternalLink className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}