import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface StatusBadgeProps {
  status: "pending" | "approved" | "released" | "rejected";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: "Pending Verification",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dotColor: "bg-amber-500",
  },
  approved: {
    icon: CheckCircle2,
    label: "Approved",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dotColor: "bg-green-500",
  },
  released: {
    icon: CheckCircle2,
    label: "Released",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dotColor: "bg-blue-500",
  },
  rejected: {
    icon: AlertCircle,
    label: "Rejected",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    dotColor: "bg-red-500",
  },
};

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-2 text-sm gap-2",
    lg: "px-4 py-2.5 text-base gap-2",
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.border} ${config.text} font-medium ${sizeClasses[size]}`}
    >
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}
