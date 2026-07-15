'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Users, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudySummary {
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  _count: { sessions: number };
  sessions?: { id: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudies: 0,
    activeStudies: 0,
    totalParticipants: 0,
    avgCompletionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/studies');
        if (response.ok) {
          const studies: StudySummary[] = await response.json();
          const totalSessions = studies.reduce((sum, s) => sum + s._count.sessions, 0);
          const completedSessions = studies.reduce((sum, s) => sum + (s.sessions?.length ?? 0), 0);
          setStats({
            totalStudies: studies.length,
            activeStudies: studies.filter((s) => s.status === 'ACTIVE').length,
            totalParticipants: totalSessions,
            avgCompletionRate: totalSessions > 0 ? completedSessions / totalSessions : 0,
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your card sorting studies
          </p>
        </div>
        <Link href="/admin/studies/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Study
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FolderKanban className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats.totalStudies}</p>
              <p className="text-sm text-muted-foreground">Total Studies</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-emerald-500/10 p-3">
              <FolderKanban className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats.activeStudies}</p>
              <p className="text-sm text-muted-foreground">Active Studies</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '—' : stats.totalParticipants}</p>
              <p className="text-sm text-muted-foreground">Total Participants</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <BarChart3 className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{isLoading ? '—' : `${Math.round(stats.avgCompletionRate * 100)}%`}</p>
              <p className="text-sm text-muted-foreground">Avg Completion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/admin/studies/new"
              className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Create New Study</p>
                  <p className="text-sm text-muted-foreground">Set up a new card sorting study</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Link
              href="/admin/studies"
              className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">View All Studies</p>
                  <p className="text-sm text-muted-foreground">Manage your existing studies</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Getting Started</h2>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <p className="font-medium text-foreground">Create a Study</p>
                <p>Define your cards and choose open or closed sorting mode</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <p className="font-medium text-foreground">Share the Link</p>
                <p>Send participants a unique link to complete the sort</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <p className="font-medium text-foreground">Analyze Results</p>
                <p>View similarity matrices, dendrograms, and insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
