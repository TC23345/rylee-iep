"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { MODULES, skillsForModule, MODULE1_SKILLS } from "@/lib/data";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const NAV = [{ href: "/", label: "Overview" }];
const WORKSPACE = [
  { href: "/business", label: "Business" },
  { href: "/clients", label: "Clients" },
  { href: "/artifacts", label: "Artifacts" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Sidebar>
      <SidebarHeader className="gap-1 px-3 pt-4">
        <Link href="/" className="font-serif text-lg font-bold leading-tight text-sidebar-foreground">
          Rylee&apos;s <span className="text-gold">IEP</span> Practice
        </Link>
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-sidebar-foreground/55">
          Workspace Dashboard
        </div>
        <div className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-[0.62rem] text-sidebar-foreground/80">
          <span className="size-1.5 rounded-full bg-gold" />
          Summer 2026 · Starts Jun 1
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigate</SidebarGroupLabel>
          <SidebarMenu>
            {NAV.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarMenu>
            {WORKSPACE.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)}>
                  <Link href={item.href}>{item.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Course Modules</SidebarGroupLabel>
          <SidebarMenu>
            {MODULES.map((mod) => (
              <SidebarMenuItem key={mod.n}>
                <SidebarMenuButton asChild isActive={isActive(`/module/${mod.n}`)}>
                  <Link href={`/module/${mod.n}`}>
                    <span className="font-mono text-[0.65rem] text-gold-dim">M{mod.n}</span>
                    <span className="truncate">{mod.short}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Skills</SidebarGroupLabel>
          <SidebarMenu>
            {MODULES.map((mod) => {
              const slugs = skillsForModule(mod.n);
              return (
                <Collapsible key={mod.n} defaultOpen={mod.n === 1} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <ChevronRight className="transition-transform group-data-[state=open]/collapsible:rotate-90" />
                        <span>Module {mod.n}</span>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {slugs.map((slug) => {
                          const authored = mod.n === 1 && slug in MODULE1_SKILLS;
                          return (
                            <SidebarMenuSubItem key={slug}>
                              <SidebarMenuSubButton asChild isActive={isActive(`/skill/${slug}`)}>
                                <Link href={`/skill/${slug}`}>
                                  <span className={authored ? "" : "text-sidebar-foreground/55"}>
                                    {slug}
                                  </span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/archive")}>
                <Link href="/archive">Archive</Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-2 py-1 font-mono text-[0.6rem] leading-relaxed text-sidebar-foreground/45">
          workspace/ is local-only (gitignored).
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
