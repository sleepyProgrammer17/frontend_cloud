"use client"

import * as React from "react"
import {
  LayoutDashboard,
  BookOpen,
  Stamp,
  Calendar,
} from "lucide-react"
import { Link } from "react-router-dom"
import { Logo } from "@/components/logo"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const role = user?.role || "student"

  const roleAvatarMap: Record<string, string> = {
    student:   "identicon",
    teacher:   "persona",
    librarian: "identicon",
  }

  const avatarStyle = roleAvatarMap[role] ?? "identicon"
  const avatar = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${user?.email || Math.random()}`

  const userData = {
    name:   user?.full_name || "Guest",
    email:  user?.email     || "guest@example.com",
    avatar,
  }

  // ── All nav groups ────────────────────────────────────────────────────────

  const allGroups = [
    // Librarian-only
    {
      label: "Dashboards",
      roles: ["librarian"],
      items: [
        { title: "Dashboard",   url: "/dashboard",   icon: LayoutDashboard },
      ],
    },

    // Student / Teacher
    {
      label: "Library",
      roles: ["student", "teacher"],
      items: [
        { title: "Books",          url: "/books",             icon: BookOpen  },
        { title: "Digital",        url: "/digital-resources", icon: Calendar  },
        { title: "Academic Works", url: "/research",          icon: Stamp     },
       { title: "Borrowed Books",   url: "/borrow-books",          icon: BookOpen  },
        { title: "Book Suggestions", url: "/book-suggestions",      icon: BookOpen  },
      ],
    },

    // Librarian-only
    {
      label: "Management",
      roles: ["librarian"],
      items: [
        { title: "Books",            url: "/books/admin",           icon: BookOpen  },
        { title: "Digital",          url: "/digital-resources/admin", icon: Calendar },
        { title: "Academic Works",   url: "/users",              icon: Stamp     },
        { title: "Borrowed Books",   url: "/borrow-books",          icon: BookOpen  },
        { title: "Book Suggestions", url: "/book-suggestions",      icon: BookOpen  },
   
      ],
    },
  ]

  // Filter groups to only those that include the current role
  const navGroups = allGroups.filter((g) => g.roles.includes(role))

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Cloud Library</span>
                  <span className="truncate text-xs">
                    {role === "librarian" ? "Admin Dashboard" : "Library"}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}