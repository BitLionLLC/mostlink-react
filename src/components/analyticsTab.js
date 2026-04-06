import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LinearProgress } from "@mui/material";
import { SitesContext } from "../contexts/sitesContext";
import styles from "./analyticsTab.module.css";

const PERIODS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
];

function StatCard({ label, value }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

function DeviceBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={styles.deviceRow}>
      <div className={styles.deviceLabel}>{label}</div>
      <LinearProgress
        variant="determinate"
        value={pct}
        className={styles.deviceBar}
      />
      <div className={styles.devicePct}>{pct}%</div>
    </div>
  );
}

function formatDate(dateStr, days) {
  const d = new Date(dateStr);
  if (days <= 7) {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyticsTab({ siteId }) {
  const { theme } = useContext(SitesContext);
  const isDark = theme === "dark";
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE}/api/analytics/stats/${siteId}?days=${days}`,
        { withCredentials: true }
      );
      setStats(res.data);
    } catch {
      setError("Couldn't load analytics. Try again later.");
    } finally {
      setLoading(false);
    }
  }, [siteId, days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const chartData = stats?.dailyViews?.map((d) => ({
    ...d,
    label: formatDate(d.date, days),
  }));

  const axisColor = isDark ? "#aaa" : "#666";
  const gridColor = isDark ? "#3a3a3e" : "#e0e0e0";
  const tooltipBg = isDark ? "#1e1e22" : "#fff";
  const tooltipBorder = isDark ? "#444" : "#ccc";

  const deviceTotal =
    stats?.deviceBreakdown
      ? Object.values(stats.deviceBreakdown).reduce((a, b) => a + b, 0)
      : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <div className={styles.periodSelector}>
          {PERIODS.map((p) => (
            <button
              key={p.days}
              className={`${styles.periodBtn} ${days === p.days ? styles.periodBtnActive : ""}`}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className={styles.loadingWrap}>
          <LinearProgress />
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && stats && (
        <>
          <div className={styles.statCards}>
            <StatCard label="Page Views" value={stats.totalViews.toLocaleString()} />
            <StatCard label="Link Clicks" value={stats.totalClicks.toLocaleString()} />
            <StatCard label="Click-through Rate" value={`${stats.ctr}%`} />
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Views Over Time</h2>
            <div className={styles.chartWrap}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: axisColor }}
                    interval={days <= 7 ? 0 : "preserveStartEnd"}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: axisColor }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [v, "Views"]}
                    labelFormatter={(l) => l}
                    contentStyle={{
                      background: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: 6,
                      color: isDark ? "#fff" : "#000",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {stats.topLinks.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Top Links</h2>
              <table className={styles.linksTable}>
                <thead>
                  <tr>
                    <th>Link</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topLinks.map((link) => (
                    <tr key={link.href}>
                      <td>
                        <span className={styles.linkTitle}>{link.title}</span>
                        <span className={styles.linkHref}>{link.href}</span>
                      </td>
                      <td className={styles.clickCount}>{link.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Device Breakdown</h2>
            <div className={styles.deviceList}>
              <DeviceBar label="Desktop" count={stats.deviceBreakdown.desktop} total={deviceTotal} />
              <DeviceBar label="Mobile" count={stats.deviceBreakdown.mobile} total={deviceTotal} />
              <DeviceBar label="Tablet" count={stats.deviceBreakdown.tablet} total={deviceTotal} />
            </div>
          </div>
        </>
      )}

      {!loading && !error && stats && stats.totalViews === 0 && (
        <p className={styles.emptyNote}>
          No data yet for this period — views will appear once visitors load your site.
        </p>
      )}
    </div>
  );
}
