"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  showSeparator?: boolean;
  content?: React.ReactNode;
}

interface UserDropdownProps {
  trigger: React.ReactNode;
  label?: string;
  items: DropdownItem[];
}

export function UserDropdown({ trigger, label, items }: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 pb-1">
        {label && (
          <>
            <DropdownMenuLabel className="font-normal text-muted-foreground text-xs">
              {label}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}

        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.content ? (
              <div className="px-1 py-1">{item.content}</div>
            ) : (
              <DropdownMenuItem
                onClick={item.onClick}
                className="cursor-pointer gap-2"
              >
                {item.icon}
                <span>{item.label}</span>
              </DropdownMenuItem>
            )}
            {item.showSeparator && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
