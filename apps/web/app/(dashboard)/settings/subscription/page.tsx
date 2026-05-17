"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Zap, Star, Crown, AlertTriangle, CreditCard } from "lucide-react";

interface Subscription {
  id: string;
  status: string;
  planId: string;
  currentPeriodEnd: string;
  stripeCustomerId?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    interval: "month",
    features: [
      "Up to 3 projects",
      "1GB storage",
      "Community support",
      "Basic analytics",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 29,
    interval: "month",
    features: [
      "Unlimited projects",
      "50GB storage",
      "Priority email support",
      "Advanced analytics",
      "API access",
      "Custom domains",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 99,
    interval: "month",
    features: [
      "Everything in Pro",
      "Unlimited storage",
      "24/7 phone support",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
];

function StatusBanner({ status, onUpdatePayment }: { status: string; onUpdatePayment: () => void }) {
  if (status === "past_due") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Payment Past Due</p>
            <p className="text-sm text-yellow-700">
              Your last payment failed. Please update your payment method to continue using premium features.
            </p>
          </div>
        </div>
        <Button onClick={onUpdatePayment} variant="outline" size="sm">
          Update Payment
        </Button>
      </div>
    );
  }

  if (status === "canceled") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div>
            <p className="font-medium text-red-800">Subscription Canceled</p>
            <p className="text-sm text-red-700">
              Your subscription has been canceled. Some features may be disabled.
            </p>
          </div>
        </div>
        <Button onClick={onUpdatePayment}>
          Reactivate
        </Button>
      </div>
    );
  }

  if (status === "incomplete") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">Payment Incomplete</p>
            <p className="text-sm text-yellow-700">
              Your subscription setup is incomplete. Please complete your payment.
            </p>
          </div>
        </div>
        <Button onClick={onUpdatePayment} size="sm">
          Complete Payment
        </Button>
      </div>
    );
  }

  return null;
}

function PlanCard({
  plan,
  currentPlanId,
  onSelect,
  isLoading,
  isDisabled,
}: {
  plan: Plan;
  currentPlanId?: string;
  onSelect: (planId: string) => void;
  isLoading: boolean;
  isDisabled?: boolean;
}) {
  const isCurrent = currentPlanId === plan.id;
  const isFree = plan.id === "free";

  const Icon = plan.id === "free" ? Zap : plan.id === "pro" ? Star : Crown;

  return (
    <Card className={`relative ${isCurrent ? "border-primary" : ""} ${isDisabled ? "opacity-60" : ""}`}>
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="default">Current Plan</Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle>{plan.name}</CardTitle>
        </div>
        <CardDescription>
          {plan.price === 0 ? "Free forever" : `$${plan.price}/${plan.interval}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
        {isFree ? (
          <Button variant="outline" className="w-full" disabled>
            {isCurrent ? "Current Plan" : "Free Plan"}
          </Button>
        ) : isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            Current Plan
          </Button>
        ) : isDisabled ? (
          <Button className="w-full" disabled>
            Upgrade
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onSelect(plan.id)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upgrade"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPage() {
  const router = useRouter();

  const { data: subscription, isLoading } = useQuery<Subscription | null>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await apiClient.get<Subscription>("/api/v1/subscriptions/current");
      if (response.error || !response.data) {
        return null;
      }
      return response.data;
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await apiClient.post<{ url: string }>("/api/v1/subscriptions/checkout", {
        planId,
      });
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      }
    },
  });

  const handlePlanSelect = (planId: string) => {
    checkoutMutation.mutate(planId);
  };

  const handleUpdatePayment = () => {
    // Re-checkout with the current plan to update payment
    const planId = subscription?.planId || "pro";
    checkoutMutation.mutate(planId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "past_due":
        return <Badge variant="destructive">Past Due</Badge>;
      case "canceled":
        return <Badge variant="secondary">Canceled</Badge>;
      case "trialing":
        return <Badge variant="default">Trial</Badge>;
      case "incomplete":
        return <Badge variant="destructive">Incomplete</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isSubscriptionActive = subscription?.status === "active" || subscription?.status === "trialing";
  const isSubscriptionDisabled = subscription?.status === "past_due" || subscription?.status === "canceled" || subscription?.status === "incomplete";

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      {subscription?.status && <StatusBanner status={subscription.status} onUpdatePayment={handleUpdatePayment} />}

      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your current plan and billing status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-2xl font-bold capitalize">
                  {subscription?.planId || "Free"} Plan
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscription?.currentPeriodEnd ? (
                    <>Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</>
                  ) : (
                    <>No active subscription</>
                  )}
                </p>
              </div>
              {subscription?.status && getStatusBadge(subscription.status)}
            </div>
            {subscription?.stripeCustomerId && (
              <Button variant="outline" size="sm">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanId={subscription?.planId}
            onSelect={handlePlanSelect}
            isLoading={checkoutMutation.isPending}
            isDisabled={isSubscriptionDisabled}
          />
        ))}
      </div>

      {checkoutMutation.isError && (
        <p className="text-sm text-destructive text-center">
          {checkoutMutation.error instanceof Error
            ? checkoutMutation.error.message
            : "Failed to initiate checkout"}
        </p>
      )}
    </div>
  );
}