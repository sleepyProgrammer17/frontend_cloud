"use client"

import { useEffect, useState, useCallback } from "react"
import { AxiosError } from "axios"
import {
  BookOpen,
  BookMarked,
  AlertTriangle,
  MonitorPlay,
  FlaskConical,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Banknote,
  BarChart3,
  Settings2,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Layers,
  Activity,
  Building2,
  Tag,
} from "lucide-react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,

} from "recharts"

import { BaseLayout } from "@/components/layouts/base-layout"
import {
  Card,
  CardContent,
  CardDescription,

  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import api from "@/lib/api"
import {
  useDepartmentList,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type DepartmentItem,
} from "@/hooks/useDepartment"
import {
  useCategoryList,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type CategoryItem,
} from "@/hooks/useCategory"

// =========================================================
// Types
// =========================================================

interface AnalyticsSummary {
  total_physical_books: number
  total_copies: number
  available_copies: number
  borrowed_copies: number
  utilization_rate: number
  total_borrows: number
  active_borrows: number
  overdue_books: number
  returned_this_month: number
  overdue_rate: number
  borrow_trend: number
  total_digital_resources: number
  total_reads: number
  digital_trend: number
  total_research: number
  total_research_views: number
  research_trend: number
  total_outstanding_fees: string
  collected_fees: string
}

interface MonthlyPoint {
  month: string
  year: number
  borrows: number
  returns: number
  overdue: number
  new_books: number
  new_digital: number
  new_research: number
}

interface TopItem {
  id: string
  title: string
  times_borrowed?: number
  times_read?: number
  times_viewed?: number
  author?: string
  type?: string
  "department__name"?: string
  copies_available?: number
}

interface ByCategoryItem {
  "category__name": string | null
  count: number
  available?: number
  total_reads?: number
  total_views?: number
}

interface ByTypeItem {
  type: string
  count: number
  total_reads: number
}

interface ByDeptItem {
  "department__name": string | null
  count: number
  total_views: number
}

interface CopyStatus {
  available?: number
  borrowed?: number
  lost?: number
}

interface OverdueItem {
  id: string
  user: string
  book: string
  due_date: string
  days_overdue: number
  total_fee: string
}

interface Debtor {
  user__username: string
  "user__userprofile__full_name": string | null
  total_owed: string
  borrow_count: number
}

interface AnalyticsOverview {
  summary: AnalyticsSummary
  monthly: MonthlyPoint[]
  books: {
    total: number
    by_category: ByCategoryItem[]
    top_borrowed: TopItem[]
    copy_status: CopyStatus
  }
  digital: {
    total: number
    total_reads: number
    by_type: ByTypeItem[]
    by_category: ByCategoryItem[]
    top_read: TopItem[]
  }
  research: {
    total: number
    total_views: number
    by_department: ByDeptItem[]
    by_category: ByCategoryItem[]
    top_viewed: TopItem[]
  }
  borrowing: {
    by_status: { status: string; count: number }[]
    overdue_list: OverdueItem[]
    avg_borrow_duration_days: number | null
  }
  fees: {
    outstanding_total: string
    outstanding_count: number
    collected_total: string
    collected_count: number
    top_debtors: Debtor[]
  }
}

// =========================================================
// Types — Overdue Settings (matches actual API response)
// =========================================================

interface OverdueSetting {
  id: string
  created_at: string
  fee_per_day: string
  active: boolean          // API returns "active", NOT "is_active"
}

// =========================================================
// Hooks
// =========================================================

function useOverdueSettings() {
  const [data, setData] = useState<OverdueSetting[]>([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<OverdueSetting[]>("/overdue/")
      setData(res)
    } catch {
      setError("Failed to load overdue settings.")
    } finally {
      setLoading(false)
    }
  }, [])

  const create = useCallback(async (payload: Omit<OverdueSetting, "id" | "created_at">) => {
    const { data: res } = await api.post<OverdueSetting>("/overdue/", payload)
    setData((prev) => [...prev, res])
    return res
  }, [])

  const update = useCallback(async (id: string, payload: Partial<Omit<OverdueSetting, "id" | "created_at">>) => {
    const { data: res } = await api.patch<OverdueSetting>(`/overdue/${id}/`, payload)
    setData((prev) => prev.map((s) => (s.id === id ? res : s)))
    return res
  }, [])

  const remove = useCallback(async (id: string) => {
    await api.delete(`/overdue/${id}/`)
    setData((prev) => prev.filter((s) => s.id !== id))
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  return { data, isLoading, error, refetch: fetchAll, create, update, remove }
}

function useAnalyticsOverview() {
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<AnalyticsOverview>("/analytics/overview/")
      setData(res)
    } catch (err) {
      const msg =
        (err as AxiosError<{ detail?: string }>).response?.data?.detail ??
        "Failed to load analytics."
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { data, isLoading, error, refetch: fetch }
}

// =========================================================
// Helpers
// =========================================================

function fmt(n: number) { return n.toLocaleString() }
function money(s: string) {
  return `₱${parseFloat(s).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })
}

// Elegant chart palette — deep indigo anchor with jewel accents
const PALETTE = [
  "#6366f1", // indigo
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#34d399", // emerald
  "#fb923c", // amber-orange
  "#f472b6", // pink
  "#facc15", // yellow
]

// =========================================================
// Custom Tooltip
// =========================================================

interface ChartTooltipProps {
  active?: boolean
  payload?: { name?: string; value?: number | string; color?: string }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 backdrop-blur-sm px-3 py-2.5 shadow-xl text-xs">
      {label && <p className="font-semibold text-foreground mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground ml-auto pl-3">
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// =========================================================
// Trend Badge
// =========================================================

function TrendBadge({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
        up
          ? "bg-emerald-500/10 text-emerald-500"
          : "bg-rose-500/10 text-rose-500"
      }`}
    >
      {up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {up ? "+" : ""}{value.toFixed(1)}%
    </span>
  )
}

// =========================================================
// KPI Card
// =========================================================

function KpiCard({
  icon,
  label,
  value,
  trend,
  sub,
  footer,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  trend?: number
  sub?: string
  footer?: string
  accent?: string
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* accent stripe */}
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-2xl"
        style={{ background: accent ?? PALETTE[0] }}
      />
      <div className="flex items-start justify-between gap-3 pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-muted-foreground">{icon}</span>
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {label}
            </span>
          </div>
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-2xl font-bold tabular-nums text-foreground leading-none">
              {value}
            </span>
            {trend !== undefined && <TrendBadge value={trend} />}
          </div>
          {sub && <p className="mt-2 text-xs font-medium text-foreground/80">{sub}</p>}
          {footer && <p className="mt-0.5 text-[11px] text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
  )
}

function KpiSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-7 w-32 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

// =========================================================
// Page
// =========================================================

export default function Page() {
  const { data, isLoading, error, refetch } = useAnalyticsOverview()

  if (error) {
    return (
      <BaseLayout title="Dashboard" description="Library analytics overview">
        <div className="flex flex-col items-center justify-center gap-3 p-16 text-center text-sm text-muted-foreground">
          <AlertTriangle className="size-8 text-destructive" />
          <p>{error}</p>
          <Button size="sm" variant="outline" onClick={refetch}>
            <RefreshCw className="size-3 mr-1" /> Retry
          </Button>
        </div>
      </BaseLayout>
    )
  }

  const s = data?.summary
  const monthly = data?.monthly ?? []
  const books = data?.books
  const digital = data?.digital
  const research = data?.research
  const borrowing = data?.borrowing
  const fees = data?.fees

  return (
    <BaseLayout title="Dashboard" description="Library analytics overview">
      <div className="px-4 lg:px-6 space-y-8 pb-12">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Analytics Overview
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Live data from the library system
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={refetch}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                accent={PALETTE[0]}
                icon={<BookOpen className="size-3.5" />}
                label="Active Borrows"
                value={fmt(s?.active_borrows ?? 0)}
                trend={s?.borrow_trend}
                sub={s?.overdue_books ? `${s.overdue_books} overdue` : "All on time"}
                footer={`${s?.utilization_rate ?? 0}% collection utilization`}
              />
              <KpiCard
                accent={PALETTE[2]}
                icon={<BookMarked className="size-3.5" />}
                label="Physical Collection"
                value={fmt(s?.total_physical_books ?? 0)}
                sub={`${fmt(s?.available_copies ?? 0)} copies available`}
                footer={`${fmt(s?.total_copies ?? 0)} total copies`}
              />
              <KpiCard
                accent={PALETTE[4]}
                icon={<AlertTriangle className="size-3.5" />}
                label="Overdue Books"
                value={fmt(s?.overdue_books ?? 0)}
                trend={s?.overdue_books ? -Math.abs(s.overdue_rate) : 0}
                sub={
                  parseFloat(s?.total_outstanding_fees ?? "0") > 0
                    ? `${money(s!.total_outstanding_fees)} outstanding`
                    : "No outstanding fees"
                }
                footer={`${s?.overdue_rate ?? 0}% overdue rate`}
              />
              <KpiCard
                accent={PALETTE[1]}
                icon={<MonitorPlay className="size-3.5" />}
                label="Digital Resources"
                value={fmt(s?.total_digital_resources ?? 0)}
                trend={s?.digital_trend}
                sub={`${fmt(s?.total_reads ?? 0)} total reads`}
                footer={`${fmt(s?.total_research ?? 0)} research · ${fmt(s?.total_research_views ?? 0)} views`}
              />
            </>
          )}
        </div>

        {/* ── Main Charts ─────────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Trend area chart */}
          <Card className="lg:col-span-2 border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Activity className="size-4 text-muted-foreground" />
                    Borrow & Return Trend
                  </CardTitle>
                  <CardDescription className="text-xs mt-0.5">Last 6 months activity</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  {[
                    { color: PALETTE[0], label: "Borrows" },
                    { color: PALETTE[3], label: "Returns" },
                    { color: PALETTE[4], label: "Overdue" },
                  ].map(({ color, label }) => (
                    <span key={label} className="flex items-center gap-1">
                      <span className="size-2 rounded-full inline-block" style={{ background: color }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 px-3 pb-3">
              {isLoading ? (
                <Skeleton className="h-[220px] w-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={monthly} margin={{ left: -16, right: 4, top: 4 }}>
                    <defs>
                      {[
                        { id: "gBorrow", color: PALETTE[0] },
                        { id: "gReturn", color: PALETTE[3] },
                      ].map(({ id, color }) => (
                        <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      dataKey="borrows"
                      name="Borrows"
                      type="monotone"
                      stroke={PALETTE[0]}
                      fill="url(#gBorrow)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: PALETTE[0], strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: PALETTE[0], strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    />
                    <Area
                      dataKey="returns"
                      name="Returns"
                      type="monotone"
                      stroke={PALETTE[3]}
                      fill="url(#gReturn)"
                      strokeWidth={2}
                      dot={{ r: 3, fill: PALETTE[3], strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: PALETTE[3], strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    />
                    <Area
                      dataKey="overdue"
                      name="Overdue"
                      type="monotone"
                      stroke={PALETTE[4]}
                      fill="none"
                      strokeWidth={1.5}
                      strokeDasharray="5 3"
                      dot={{ r: 2.5, fill: PALETTE[4], strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Copy status donut */}
          <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Layers className="size-4 text-muted-foreground" />
                Copy Status
              </CardTitle>
              <CardDescription className="text-xs">Current availability</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pt-4 pb-2">
              {isLoading ? (
                <Skeleton className="h-[200px] w-[200px] rounded-full" />
              ) : (
                <>
                  <PieChart width={200} height={190}>
                    <Pie
                      data={[
                        { name: "Available", value: books?.copy_status.available ?? 0 },
                        { name: "Borrowed",  value: books?.copy_status.borrowed  ?? 0 },
                        { name: "Lost",      value: books?.copy_status.lost       ?? 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {[PALETTE[3], PALETTE[0], PALETTE[4]].map((c, i) => (
                        <Cell key={i} fill={c} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                  {/* Custom legend */}
                  <div className="flex flex-col gap-1.5 w-full px-2 mt-1">
                    {[
                      { label: "Available", value: books?.copy_status.available ?? 0, color: PALETTE[3] },
                      { label: "Borrowed",  value: books?.copy_status.borrowed  ?? 0, color: PALETTE[0] },
                      { label: "Lost",      value: books?.copy_status.lost       ?? 0, color: PALETTE[4] },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full" style={{ background: color }} />
                          <span className="text-muted-foreground">{label}</span>
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {fmt(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <Tabs defaultValue="books">
          <TabsList className="mb-4 h-9 gap-0.5 bg-muted/60 p-0.5 rounded-xl">
            {[
              { value: "books",            icon: <BookMarked className="size-3.5" />,   label: "Books" },
              { value: "digital",          icon: <MonitorPlay className="size-3.5" />,  label: "Digital" },
              { value: "research",         icon: <FlaskConical className="size-3.5" />, label: "Research" },
              { value: "borrowing",        icon: <Clock className="size-3.5" />,        label: "Borrowing" },
              { value: "fees",             icon: <Banknote className="size-3.5" />,     label: "Fees" },
              { value: "overdue-settings", icon: <Settings2 className="size-3.5" />,   label: "Fee Rules" },
              { value: "departments",      icon: <Building2 className="size-3.5" />,   label: "Departments" },
              { value: "categories",       icon: <Tag className="size-3.5" />,          label: "Categories" },
            ].map(({ value, icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="gap-1.5 cursor-pointer text-xs h-8 px-3 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {icon} {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Books ──────────────────────────────────────────────────────── */}
          <TabsContent value="books" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Books by Category</CardTitle>
                  <CardDescription className="text-xs">Top 8 categories by title count</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-3 pb-3">
                  {isLoading ? <Skeleton className="h-[240px]" /> : (
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart
                        data={books?.by_category.slice(0, 8) ?? []}
                        layout="vertical"
                        margin={{ left: 4, right: 16 }}
                        barSize={14}
                      >
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="category__name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          width={96}
                          tickFormatter={(v) => v ?? "Uncategorized"}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="count" name="Titles" radius={[0, 6, 6, 0]}>
                          {books?.by_category.slice(0, 8).map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.9} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Top Borrowed Books</CardTitle>
                  <CardDescription className="text-xs">Ranked by borrow frequency</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? <Skeleton className="h-[240px] mx-4 mt-4 mb-4" /> : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">Title</TableHead>
                          <TableHead className="text-right text-xs w-20">Borrows</TableHead>
                          <TableHead className="text-right text-xs w-20">Avail.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {books?.top_borrowed.slice(0, 8).map((b, i) => (
                          <TableRow key={b.id} className="text-xs">
                            <TableCell>
                              <span className="size-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                                style={{ background: PALETTE[i % PALETTE.length] + "20", color: PALETTE[i % PALETTE.length] }}>
                                {i + 1}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium max-w-[160px] truncate">{b.title}</TableCell>
                            <TableCell className="text-right tabular-nums">{b.times_borrowed}</TableCell>
                            <TableCell className="text-right tabular-nums">{b.copies_available}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Digital ────────────────────────────────────────────────────── */}
          <TabsContent value="digital" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Resources by Type</CardTitle>
                  <CardDescription className="text-xs">Total reads per resource type</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-3 pb-3">
                  {isLoading ? <Skeleton className="h-[200px]" /> : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={digital?.by_type ?? []} margin={{ left: -16, right: 8, top: 4 }} barSize={28}>
                        <CartesianGrid
                          vertical={false}
                          strokeDasharray="3 3"
                          stroke="hsl(var(--border))"
                          strokeOpacity={0.5}
                        />
                        <XAxis
                          dataKey="type"
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="total_reads" name="Total Reads" radius={[6, 6, 0, 0]}>
                          {digital?.by_type.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.9} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Most Read Resources</CardTitle>
                  <CardDescription className="text-xs">Top digital resources by read count</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? <Skeleton className="h-[200px] mx-4 mt-4 mb-4" /> : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">Title</TableHead>
                          <TableHead className="text-xs w-20">Type</TableHead>
                          <TableHead className="text-right text-xs w-20">Reads</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {digital?.top_read.slice(0, 8).map((d, i) => (
                          <TableRow key={d.id} className="text-xs">
                            <TableCell>
                              <span className="size-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                                style={{ background: PALETTE[i % PALETTE.length] + "20", color: PALETTE[i % PALETTE.length] }}>
                                {i + 1}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium max-w-[140px] truncate">{d.title}</TableCell>
                            <TableCell className="text-muted-foreground">{d.type}</TableCell>
                            <TableCell className="text-right tabular-nums">{d.times_read}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Research ───────────────────────────────────────────────────── */}
          <TabsContent value="research" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Research by Department</CardTitle>
                  <CardDescription className="text-xs">Views per department</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 px-3 pb-3">
                  {isLoading ? <Skeleton className="h-[200px]" /> : (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={research?.by_department ?? []}
                        layout="vertical"
                        margin={{ left: 4, right: 16 }}
                        barSize={14}
                      >
                        <XAxis
                          type="number"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="department__name"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                          width={90}
                          tickFormatter={(v) => v ?? "General"}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="total_views" name="Views" radius={[0, 6, 6, 0]}>
                          {research?.by_department.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} fillOpacity={0.9} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-border/40">
                  <CardTitle className="text-sm font-semibold">Most Viewed Research</CardTitle>
                  <CardDescription className="text-xs">Top research by view count</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? <Skeleton className="h-[200px] mx-4 mt-4 mb-4" /> : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs">#</TableHead>
                          <TableHead className="text-xs">Title</TableHead>
                          <TableHead className="text-xs w-28">Dept.</TableHead>
                          <TableHead className="text-right text-xs w-16">Views</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {research?.top_viewed.slice(0, 8).map((r, i) => (
                          <TableRow key={r.id} className="text-xs">
                            <TableCell>
                              <span className="size-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                                style={{ background: PALETTE[i % PALETTE.length] + "20", color: PALETTE[i % PALETTE.length] }}>
                                {i + 1}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium max-w-[130px] truncate">{r.title}</TableCell>
                            <TableCell className="text-muted-foreground">{r["department__name"] ?? "—"}</TableCell>
                            <TableCell className="text-right tabular-nums">{r.times_viewed}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Borrowing ──────────────────────────────────────────────────── */}
          <TabsContent value="borrowing" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-4 mb-1">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
              ) : (
                <>
                  {borrowing?.by_status.map((s, i) => (
                    <KpiCard
                      key={s.status}
                      accent={PALETTE[i % PALETTE.length]}
                      icon={<BarChart3 className="size-3.5" />}
                      label={s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      value={fmt(s.count)}
                    />
                  ))}
                  <KpiCard
                    accent={PALETTE[1]}
                    icon={<Clock className="size-3.5" />}
                    label="Avg. Duration"
                    value={borrowing?.avg_borrow_duration_days != null
                      ? `${borrowing.avg_borrow_duration_days}d`
                      : "—"}
                    footer="Average days per borrow"
                  />
                </>
              )}
            </div>

            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold">Overdue Books</CardTitle>
                <CardDescription className="text-xs">Up to 20 most recent overdue records</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? <Skeleton className="h-[200px] mx-4 my-4" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Borrower</TableHead>
                        <TableHead className="text-xs">Book</TableHead>
                        <TableHead className="text-right text-xs w-24">Days Over</TableHead>
                        <TableHead className="text-right text-xs w-24">Fee</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowing?.overdue_list.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground py-10 text-sm">
                            No overdue books 🎉
                          </TableCell>
                        </TableRow>
                      ) : (
                        borrowing?.overdue_list.map((o) => (
                          <TableRow key={o.id} className="text-xs">
                            <TableCell className="font-medium">{o.user}</TableCell>
                            <TableCell className="max-w-[180px] truncate text-muted-foreground">{o.book}</TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                o.days_overdue > 7
                                  ? "bg-rose-500/10 text-rose-500"
                                  : "bg-amber-500/10 text-amber-600"
                              }`}>
                                {o.days_overdue}d
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-semibold">{money(o.total_fee)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Fees ───────────────────────────────────────────────────────── */}
          <TabsContent value="fees" className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, i) => <KpiSkeleton key={i} />)
              ) : (
                <>
                  <KpiCard
                    accent={PALETTE[4]}
                    icon={<AlertTriangle className="size-3.5" />}
                    label="Outstanding Fees"
                    value={money(fees?.outstanding_total ?? "0")}
                    sub={`${fees?.outstanding_count ?? 0} unpaid records`}
                  />
                  <KpiCard
                    accent={PALETTE[3]}
                    icon={<Banknote className="size-3.5" />}
                    label="Collected Fees"
                    value={money(fees?.collected_total ?? "0")}
                    sub={`${fees?.collected_count ?? 0} paid records`}
                  />
                </>
              )}
            </div>

            <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-sm font-semibold">Top Debtors</CardTitle>
                <CardDescription className="text-xs">Borrowers with highest outstanding fees</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? <Skeleton className="h-[200px] mx-4 my-4" /> : (
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs">Borrower</TableHead>
                        <TableHead className="text-right text-xs w-20">Records</TableHead>
                        <TableHead className="text-right text-xs w-28">Total Owed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees?.top_debtors.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground py-10 text-sm">
                            No outstanding fees 🎉
                          </TableCell>
                        </TableRow>
                      ) : (
                        fees?.top_debtors.map((d, i) => (
                          <TableRow key={i} className="text-xs">
                            <TableCell className="font-medium">
                              {d["user__userprofile__full_name"] || d.user__username}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{d.borrow_count}</TableCell>
                            <TableCell className="text-right font-semibold text-rose-500">
                              {money(d.total_owed)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Overdue Settings ───────────────────────────────────────────── */}
          <TabsContent value="overdue-settings" className="space-y-4">
            <OverdueSettingsTab />
          </TabsContent>

          {/* ── Departments ────────────────────────────────────────────────── */}
          <TabsContent value="departments" className="space-y-4">
            <DepartmentsTab />
          </TabsContent>

          {/* ── Categories ─────────────────────────────────────────────────── */}
          <TabsContent value="categories" className="space-y-4">
            <CategoriesTab />
          </TabsContent>
        </Tabs>
      </div>
    </BaseLayout>
  )
}

// =========================================================
// Overdue Settings Tab — matches actual API shape
// { id, created_at, fee_per_day, active }
// =========================================================

const EMPTY_FORM = { fee_per_day: "", active: true }

function OverdueSettingsTab() {
  const { data, isLoading, error, refetch, create, update, remove } = useOverdueSettings()

  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function startCreate() {
    setForm(EMPTY_FORM)
    setEditing("new")
    setFormError(null)
  }

  function startEdit(s: OverdueSetting) {
    setForm({ fee_per_day: s.fee_per_day, active: s.active })
    setEditing(s.id)
    setFormError(null)
  }

  function cancelEdit() {
    setEditing(null)
    setFormError(null)
  }

  async function handleSave() {
    if (!form.fee_per_day || isNaN(parseFloat(form.fee_per_day))) {
      setFormError("A valid fee per day is required.")
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      if (editing === "new") {
        await create(form)
      } else if (editing) {
        await update(editing, form)
      }
      setEditing(null)
    } catch {
      setFormError("Failed to save. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleteId(id)
    try {
      await remove(id)
    } catch {
      refetch()
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Overdue Fee Rules</CardTitle>
          <CardDescription className="text-xs">Fee per day applied to overdue borrowed books</CardDescription>
        </div>
        <Button size="sm" onClick={startCreate} disabled={editing === "new"} className="gap-1.5 h-8">
          <Plus className="size-3.5" /> Add Rule
        </Button>
      </CardHeader>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-destructive border-b border-border/40 bg-destructive/5">
          <AlertTriangle className="size-3.5 shrink-0" /> {error}
          <Button variant="ghost" size="sm" onClick={refetch} className="ml-auto h-6 text-xs">Retry</Button>
        </div>
      )}
      {formError && (
        <div className="px-4 py-2 text-xs text-destructive bg-destructive/8 border-b border-border/40">
          {formError}
        </div>
      )}

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs">Created</TableHead>
              <TableHead className="text-xs w-40">Fee / Day (₱)</TableHead>
              <TableHead className="text-xs w-28">Status</TableHead>
              <TableHead className="text-xs text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* New row */}
            {editing === "new" && (
              <TableRow className="bg-muted/30">
                <TableCell className="text-xs text-muted-foreground italic">Now</TableCell>
                <TableCell>
                  <Input
                    className="h-7 text-xs w-28"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.fee_per_day}
                    onChange={(e) => setForm({ ...form, fee_per_day: e.target.value })}
                    autoFocus
                  />
                </TableCell>
                <TableCell>
                  <button onClick={() => setForm({ ...form, active: !form.active })}>
                    <ActiveBadge active={form.active} />
                  </button>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="icon" variant="ghost" className="size-7" onClick={handleSave} disabled={saving}>
                      <Check className="size-3.5 text-emerald-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Existing rows */}
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : data.map((s) =>
                  editing === s.id ? (
                    <TableRow key={s.id} className="bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(s.created_at)}</TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs w-28"
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.fee_per_day}
                          onChange={(e) => setForm({ ...form, fee_per_day: e.target.value })}
                          autoFocus
                        />
                      </TableCell>
                      <TableCell>
                        <button onClick={() => setForm({ ...form, active: !form.active })}>
                          <ActiveBadge active={form.active} clickable />
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="icon" variant="ghost" className="size-7" onClick={handleSave} disabled={saving}>
                            <Check className="size-3.5 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={s.id} className="text-xs">
                      <TableCell className="text-muted-foreground">{fmtDate(s.created_at)}</TableCell>
                      <TableCell className="font-semibold tabular-nums">
                        ₱{parseFloat(s.fee_per_day).toFixed(2)}
                        <span className="ml-1 text-muted-foreground font-normal">/ day</span>
                      </TableCell>
                      <TableCell><ActiveBadge active={s.active} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => startEdit(s)}
                            disabled={editing !== null}
                          >
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => handleDelete(s.id)}
                            disabled={deleteId === s.id}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
            }

            {!isLoading && data.length === 0 && editing !== "new" && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-12 text-sm">
                  No fee rules yet. Click "Add Rule" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// =========================================================
// Departments Tab
// =========================================================

function DepartmentsTab() {
  const { data: departments, isLoading, error, fetchAll, clearError } = useDepartmentList()
  const { create, isLoading: creating, error: createError, clearError: clearCreateError } = useCreateDepartment()
  const { update, isLoading: updating, error: updateError, clearError: clearUpdateError } = useUpdateDepartment()
  const { remove, isLoading: deleting, error: deleteError, clearError: clearDeleteError } = useDeleteDepartment()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [nameValue, setNameValue] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [fetchAll])

  const anyError = error ?? createError ?? updateError ?? deleteError

  function startCreate() {
    setNameValue("")
    setEditing("new")
    setFormError(null)
    clearError()
    clearCreateError()
  }

  function startEdit(dept: DepartmentItem) {
    setNameValue(dept.name)
    setEditing(dept.id)
    setFormError(null)
    clearUpdateError()
  }

  function cancelEdit() {
    setEditing(null)
    setFormError(null)
  }

  async function handleSave() {
    const trimmed = nameValue.trim()
    if (!trimmed) {
      setFormError("Department name is required.")
      return
    }
    setFormError(null)

    if (editing === "new") {
      const result = await create({ name: trimmed })
      if (result.ok) {
        await fetchAll()
        setEditing(null)
      } else {
        setFormError(result.error)
      }
    } else if (typeof editing === "number") {
      const result = await update(editing, { name: trimmed })
      if (result.ok) {
        await fetchAll()
        setEditing(null)
      } else {
        setFormError(result.error)
      }
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    clearDeleteError()
    const result = await remove(id)
    if (result.ok) {
      await fetchAll()
    }
    setDeletingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") cancelEdit()
  }

  const isSaving = creating || updating

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Building2 className="size-4 text-muted-foreground" />
            Departments
          </CardTitle>
          <CardDescription className="text-xs">
            Manage academic or organizational departments
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={startCreate}
          disabled={editing === "new"}
          className="gap-1.5 h-8"
        >
          <Plus className="size-3.5" /> Add Department
        </Button>
      </CardHeader>

      {anyError && !formError && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-destructive border-b border-border/40 bg-destructive/5">
          <AlertTriangle className="size-3.5 shrink-0" />
          {anyError}
          <Button
            variant="ghost" size="sm"
            onClick={() => { clearError(); clearDeleteError(); fetchAll() }}
            className="ml-auto h-6 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {formError && (
        <div className="px-4 py-2 text-xs text-destructive bg-destructive/8 border-b border-border/40">
          {formError}
        </div>
      )}

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs w-16">#</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

            {editing === "new" && (
              <TableRow className="bg-muted/30">
                <TableCell className="text-xs text-muted-foreground italic">—</TableCell>
                <TableCell>
                  <Input
                    className="h-7 text-xs max-w-xs"
                    placeholder="e.g. Computer Science"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon" variant="ghost" className="size-7"
                      onClick={handleSave} disabled={isSaving}
                    >
                      <Check className="size-3.5 text-emerald-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : (departments ?? []).map((dept, i) =>
                  editing === dept.id ? (
                    <TableRow key={dept.id} className="bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {dept.id}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs max-w-xs"
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={handleSave} disabled={isSaving}
                          >
                            <Check className="size-3.5 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    <TableRow key={dept.id} className="text-xs group">
                      <TableCell>
                        <span
                          className="size-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            background: PALETTE[i % PALETTE.length] + "20",
                            color: PALETTE[i % PALETTE.length],
                          }}
                        >
                          {i + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{dept.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => startEdit(dept)}
                            disabled={editing !== null}
                          >
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => handleDelete(dept.id)}
                            disabled={deletingId === dept.id || deleting}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
            }

            {!isLoading && (departments ?? []).length === 0 && editing !== "new" && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12 text-sm">
                  No departments yet. Click "Add Department" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// =========================================================
// Categories Tab
// =========================================================

function CategoriesTab() {
  const { data: categories, isLoading, error, fetchAll, clearError } = useCategoryList()
  const { create, isLoading: creating, error: createError, clearError: clearCreateError } = useCreateCategory()
  const { update, isLoading: updating, error: updateError, clearError: clearUpdateError } = useUpdateCategory()
  const { remove, isLoading: deleting, error: deleteError, clearError: clearDeleteError } = useDeleteCategory()

  const [editing, setEditing] = useState<number | "new" | null>(null)
  const [nameValue, setNameValue] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => { fetchAll() }, [fetchAll])

  const anyError = error ?? createError ?? updateError ?? deleteError

  function startCreate() {
    setNameValue("")
    setEditing("new")
    setFormError(null)
    clearError()
    clearCreateError()
  }

  function startEdit(cat: CategoryItem) {
    setNameValue(cat.name)
    setEditing(cat.id)
    setFormError(null)
    clearUpdateError()
  }

  function cancelEdit() {
    setEditing(null)
    setFormError(null)
  }

  async function handleSave() {
    const trimmed = nameValue.trim()
    if (!trimmed) {
      setFormError("Category name is required.")
      return
    }
    setFormError(null)

    if (editing === "new") {
      const result = await create({ name: trimmed })
      if (result.ok) {
        await fetchAll()
        setEditing(null)
      } else {
        setFormError(result.error)
      }
    } else if (typeof editing === "number") {
      const result = await update(editing, { name: trimmed })
      if (result.ok) {
        await fetchAll()
        setEditing(null)
      } else {
        setFormError(result.error)
      }
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    clearDeleteError()
    const result = await remove(id)
    if (result.ok) {
      await fetchAll()
    }
    setDeletingId(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSave()
    if (e.key === "Escape") cancelEdit()
  }

  const isSaving = creating || updating

  return (
    <Card className="border-border/50 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Tag className="size-4 text-muted-foreground" />
            Categories
          </CardTitle>
          <CardDescription className="text-xs">
            Manage categories for books, digital resources, and research
          </CardDescription>
        </div>
        <Button
          size="sm"
          onClick={startCreate}
          disabled={editing === "new"}
          className="gap-1.5 h-8"
        >
          <Plus className="size-3.5" /> Add Category
        </Button>
      </CardHeader>

      {anyError && !formError && (
        <div className="flex items-center gap-2 px-4 py-3 text-xs text-destructive border-b border-border/40 bg-destructive/5">
          <AlertTriangle className="size-3.5 shrink-0" />
          {anyError}
          <Button
            variant="ghost" size="sm"
            onClick={() => { clearError(); clearDeleteError(); fetchAll() }}
            className="ml-auto h-6 text-xs"
          >
            Retry
          </Button>
        </div>
      )}

      {formError && (
        <div className="px-4 py-2 text-xs text-destructive bg-destructive/8 border-b border-border/40">
          {formError}
        </div>
      )}

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs w-16">#</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs text-right w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

            {/* New row */}
            {editing === "new" && (
              <TableRow className="bg-muted/30">
                <TableCell className="text-xs text-muted-foreground italic">—</TableCell>
                <TableCell>
                  <Input
                    className="h-7 text-xs max-w-xs"
                    placeholder="e.g. Science Fiction"
                    value={nameValue}
                    onChange={(e) => setNameValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon" variant="ghost" className="size-7"
                      onClick={handleSave} disabled={isSaving}
                    >
                      <Check className="size-3.5 text-emerald-500" />
                    </Button>
                    <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                      <X className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* Existing rows */}
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              : (categories ?? []).map((cat, i) =>
                  editing === cat.id ? (
                    // Edit row
                    <TableRow key={cat.id} className="bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground tabular-nums">
                        {cat.id}
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-7 text-xs max-w-xs"
                          value={nameValue}
                          onChange={(e) => setNameValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={handleSave} disabled={isSaving}
                          >
                            <Check className="size-3.5 text-emerald-500" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7" onClick={cancelEdit}>
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    // Read row
                    <TableRow key={cat.id} className="text-xs group">
                      <TableCell>
                        <span
                          className="size-5 inline-flex items-center justify-center rounded-full text-[10px] font-bold"
                          style={{
                            background: PALETTE[i % PALETTE.length] + "20",
                            color: PALETTE[i % PALETTE.length],
                          }}
                        >
                          {i + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => startEdit(cat)}
                            disabled={editing !== null}
                          >
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            size="icon" variant="ghost" className="size-7"
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id || deleting}
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
            }

            {/* Empty state */}
            {!isLoading && (categories ?? []).length === 0 && editing !== "new" && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground py-12 text-sm">
                  No categories yet. Click "Add Category" to create one.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// =========================================================
// ActiveBadge helper
// =========================================================

function ActiveBadge({ active, clickable }: { active: boolean; clickable?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ${
        active
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-muted text-muted-foreground"
      } ${clickable ? "cursor-pointer hover:opacity-80" : ""}`}
    >
      <span className={`size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  )
}
