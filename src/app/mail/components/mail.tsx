"use client"

import * as React from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { MailDisplay } from "@/app/mail/components/mail-display"
import { MailList } from "@/app/mail/components/mail-list"
import { type Mail } from "@/app/mail/data"
import { useMail } from "@/app/mail/use-mail"

interface MailProps {
  accounts: { label: string; email: string; icon: React.ReactNode }[]
  mails: Mail[]
  defaultLayout?: number[]
  defaultCollapsed?: boolean
  navCollapsedSize: number
}

export function Mail({ mails, defaultLayout = [20, 32, 48] }: MailProps) {
  const [mail] = useMail()
  const selectedMail = mails.find((item) => item.id === mail.selected) || null

  return (
    <TooltipProvider delayDuration={0}>
      {/* ── Mobile layout ── */}
      <div className="h-full flex flex-col md:hidden rounded-lg border overflow-hidden">
        {selectedMail ? (
          <MailDisplay mail={selectedMail} />
        ) : (
          <Tabs defaultValue="all" className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center px-4 py-1.5 shrink-0">
              <h1 className="text-foreground text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="cursor-pointer">All mail</TabsTrigger>
                <TabsTrigger value="unread" className="cursor-pointer">Unread</TabsTrigger>
              </TabsList>
            </div>
            <Separator className="shrink-0" />
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur shrink-0">
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 size-4" />
                <Input placeholder="Search" className="pl-8" />
              </div>
            </div>
            <TabsContent value="all" className="m-0 flex-1 overflow-hidden">
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0 flex-1 overflow-hidden">
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* ── Desktop layout ── */}
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(sizes)}`
        }}
        className="h-full items-stretch rounded-lg border overflow-hidden hidden md:flex"
      >
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="all" className="gap-1">
            <div className="flex items-center px-4 py-1.5">
              <h1 className="text-foreground text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger value="all" className="cursor-pointer">All mail</TabsTrigger>
                <TabsTrigger value="unread" className="cursor-pointer">Unread</TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-4 backdrop-blur">
              <form>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-2.5 left-2 size-4 cursor-pointer" />
                  <Input placeholder="Search" className="pl-8 cursor-text" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <MailDisplay mail={selectedMail} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}