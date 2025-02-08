"use client";

import {
  DashboardContent,
  DashboardHeader,
  DashboardLayout,
  DashboardSidebar,
  DashboardSidebarGroup,
  DashboardSidebarLabel,
  DashboardSidebarItem,
  DashboardSidebarToggle,
  DashboardTitle,
  DashboardNav,
  DashboardNavToggle,
} from "@/components/ui/dashboard-layout";
import { ArrowUpRightIcon, Table2Icon } from "lucide-react";
import Link from "next/link";
import { DarkModeToggle } from "@/components/ui/dark-mode";
import { usePathname } from "next/navigation";

const items = [
  { text: "Introduction", link: "/introduction", icon: Table2Icon },
  { text: "Installation", link: "/installation", icon: Table2Icon },
  {
    text: "Dashboard Layout",
    link: "/components/dashboard-layout",
    icon: Table2Icon,
  },
];

export function DashboardLayoutDemo() {
  const pathname = usePathname();

  return (
    <DashboardLayout>
      <DashboardHeader>
        <DashboardTitle>
          <DashboardSidebarToggle />
          <Link href="/">drizzle-ui</Link>
        </DashboardTitle>
        <DashboardNav>
          <Link href="/introduction">Docs</Link>
          <Link
            href="https://www.drizzle-next.com"
            className="flex items-center gap-1"
            target="_blank"
          >
            Drizzle Next <ArrowUpRightIcon className="h-4 w-4 text-muted-500" />
          </Link>
          <DarkModeToggle />
        </DashboardNav>
        <DashboardNavToggle />
      </DashboardHeader>
      <DashboardSidebar>
        <DashboardSidebarGroup>
          <DashboardSidebarLabel>Documentation</DashboardSidebarLabel>
          {items.map((item) => (
            <Link key={item.link} href={item.link}>
              <DashboardSidebarItem active={pathname === item.link}>
                <item.icon className="h-4 w-4" /> {item.text}
              </DashboardSidebarItem>
            </Link>
          ))}
        </DashboardSidebarGroup>
      </DashboardSidebar>
      <DashboardContent>
        {Array.from({ length: 20 }).map((_, index) => (
          <p key={index} className="mb-5">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sequi
            soluta optio vel dolorum voluptatum ipsum, quam quidem animi nam qui
            eveniet, sapiente hic corrupti quibusdam dolor itaque blanditiis
            tenetur dolorem!
          </p>
        ))}
      </DashboardContent>
    </DashboardLayout>
  );
}
