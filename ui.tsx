import React from "react";
import { Card } from "@heroui/react";
import { ChevronRight } from "lucide-react";

export function Panel({
  title,
  subtitle,
  icon: Icon,
  tone = "",
  action,
  children,
  className = "",
}: any) {
  return (
    <Card className={"panel " + tone + " " + className}>
      <Card.Header>
        <div className="panel-heading">
          <div className="panel-title">
            {Icon && <Icon size={18} />}
            <Card.Title>{title}</Card.Title>
          </div>
          {action}
        </div>
        {subtitle && <Card.Description>{subtitle}</Card.Description>}
      </Card.Header>
      <Card.Content>{children}</Card.Content>
    </Card>
  );
}

export function Row({
  icon: Icon,
  iconColor = "#0a84ff",
  label,
  value,
  onPress,
  last,
}: any) {
  return (
    <button
      type="button"
      className={"ios-row" + (last ? " last" : "")}
      onClick={onPress}
    >
      <span className="ios-row-icon" style={{ color: iconColor }}>
        <Icon size={17} />
      </span>
      <span className="ios-row-label">{label}</span>
      {value && <span className="ios-row-value">{value}</span>}
      <ChevronRight size={16} className="ios-row-chevron" />
    </button>
  );
}

export function GroupCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={"ios-group " + className}>{children}</div>;
}
