'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  BarChart3,
  ExternalLink,
  Trash2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type StudyStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

const statusConfig: Record<StudyStatus, { label: string; color: string }> = {
  DRAFT: { label: 'Draft', color: 'bg-slate-500' },
  ACTIVE: { label: 'Active', color: 'bg-emerald-500' },
  PAUSED: { label: 'Paused', color: 'bg-amber-500' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-500' },
  ARCHIVED: { label: 'Archived', color: 'bg-slate-400' },
};

interface StudyCard {
  id: string;
  label: string;
  description: string | null;
}

interface StudyCategory {
  id: string;
  name: string;
}

interface StudyDetail {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  mode: 'OPEN' | 'CLOSED';
  status: StudyStatus;
  allowUndo: boolean;
  showProgress: boolean;
  requireAllCardsSorted: boolean;
  randomizeCards: boolean;
  timeLimitMinutes: number | null;
  instructions: string | null;
  thankYouMessage: string | null;
  cards: StudyCard[];
  categories: StudyCategory[];
  _count: { sessions: number };
}

export default function EditStudyPage({ params }: { params: Promise<{ studyId: string }> }) {
  const { studyId } = use(params);
  const router = useRouter();

  const [study, setStudy] = useState<StudyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [allowUndo, setAllowUndo] = useState(true);
  const [showProgress, setShowProgress] = useState(true);
  const [randomizeCards, setRandomizeCards] = useState(true);
  const [requireAllCardsSorted, setRequireAllCardsSorted] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState('');

  useEffect(() => {
    const fetchStudy = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/studies/${studyId}`);
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Study not found' : 'Failed to load study');
        }
        const data: StudyDetail = await response.json();
        setStudy(data);
        setName(data.name);
        setDescription(data.description || '');
        setInstructions(data.instructions || '');
        setThankYouMessage(data.thankYouMessage || '');
        setAllowUndo(data.allowUndo);
        setShowProgress(data.showProgress);
        setRandomizeCards(data.randomizeCards);
        setRequireAllCardsSorted(data.requireAllCardsSorted);
        setTimeLimitMinutes(data.timeLimitMinutes ? String(data.timeLimitMinutes) : '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load study');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudy();
  }, [studyId]);

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Study name is required');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || null,
          settings: {
            allowUndo,
            showProgress,
            randomizeCards,
            requireAllCardsSorted,
            timeLimitMinutes: timeLimitMinutes ? Number(timeLimitMinutes) : null,
            instructions: instructions.trim() || null,
            thankYouMessage: thankYouMessage.trim() || null,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save study');
      }

      const updated: StudyDetail = await response.json();
      setStudy(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save study');
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (status: StudyStatus) => {
    setIsChangingStatus(true);
    try {
      const response = await fetch(`/api/studies/${studyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update status');
      }

      const updated: StudyDetail = await response.json();
      setStudy(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsChangingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!study) return;
    if (!confirm(`Delete "${study.name}"? This cannot be undone and will remove all collected responses.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/studies/${studyId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to delete study');
      }
      router.push('/admin/studies');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete study');
    }
  };

  const copyShareLink = async () => {
    if (!study) return;
    await navigator.clipboard.writeText(`${window.location.origin}/s/${study.slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !study) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-foreground font-medium">{error || 'Study not found'}</p>
          <Link href="/admin/studies">
            <Button variant="outline">Back to Studies</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[study.status];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/studies">
            <Button variant="ghost" size="icon" aria-label="Back to studies">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-foreground">{study.name}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <span className={cn('h-2 w-2 rounded-full', status.color)} />
                {status.label}
              </span>
            </div>
            <p className="text-muted-foreground">
              {study.mode === 'OPEN' ? 'Open Sort' : 'Closed Sort'} &middot; {study.cards.length} cards &middot; {study._count.sessions} responses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/admin/studies/${studyId}/results`}>
            <Button variant="outline" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Results
            </Button>
          </Link>
          {study.status === 'ACTIVE' && (
            <Link href={`/s/${study.slug}`} target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Status & sharing */}
      <section className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Status &amp; Sharing</h2>

        <div className="flex flex-wrap items-center gap-2">
          {study.status === 'DRAFT' && (
            <Button size="sm" disabled={isChangingStatus} onClick={() => changeStatus('ACTIVE')}>
              Launch Study
            </Button>
          )}
          {study.status === 'ACTIVE' && (
            <Button size="sm" variant="outline" disabled={isChangingStatus} onClick={() => changeStatus('PAUSED')}>
              Pause Study
            </Button>
          )}
          {study.status === 'PAUSED' && (
            <Button size="sm" disabled={isChangingStatus} onClick={() => changeStatus('ACTIVE')}>
              Resume Study
            </Button>
          )}
          {(study.status === 'ACTIVE' || study.status === 'PAUSED') && (
            <Button size="sm" variant="outline" disabled={isChangingStatus} onClick={() => changeStatus('COMPLETED')}>
              Mark Completed
            </Button>
          )}
          {study.status !== 'ARCHIVED' && (
            <Button size="sm" variant="outline" disabled={isChangingStatus} onClick={() => changeStatus('ARCHIVED')}>
              Archive
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Input readOnly value={`${typeof window !== 'undefined' ? window.location.origin : ''}/s/${study.slug}`} className="text-sm" />
          <Button type="button" variant="outline" size="icon" onClick={copyShareLink} aria-label="Copy share link">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        {copied && <p className="text-xs text-emerald-500">Link copied!</p>}
      </section>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
        {/* Basic Info */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>

          <div className="space-y-2">
            <Label htmlFor="name">Study Name *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal description for your reference"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </section>

        {/* Cards & Categories (read-only) */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Cards</h2>
            <p className="text-sm text-muted-foreground">
              Sorting mode and cards are locked after a study is created and can&apos;t be edited here yet.
            </p>
          </div>
          <ul className="space-y-2">
            {study.cards.map((card) => (
              <li key={card.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">{card.label}</p>
                {card.description && (
                  <p className="text-xs text-muted-foreground">{card.description}</p>
                )}
              </li>
            ))}
          </ul>

          {study.mode === 'CLOSED' && study.categories.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-foreground mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {study.categories.map((category) => (
                  <span
                    key={category.id}
                    className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Settings */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowUndo}
                onChange={(e) => setAllowUndo(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Allow undo (recommended for accessibility)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={showProgress}
                onChange={(e) => setShowProgress(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Show progress indicator</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeCards}
                onChange={(e) => setRandomizeCards(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Randomize card order per participant</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={requireAllCardsSorted}
                onChange={(e) => setRequireAllCardsSorted(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm text-foreground">Require all cards to be sorted before completion</span>
            </label>
          </div>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="timeLimit">Time limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="1"
              value={timeLimitMinutes}
              onChange={(e) => setTimeLimitMinutes(e.target.value)}
              placeholder="No limit"
            />
          </div>
        </section>

        {/* Messages */}
        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Participant Messages</h2>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions (optional)</Label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Custom instructions shown to participants at the start"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="thankYou">Thank You Message (optional)</Label>
            <textarea
              id="thankYou"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              placeholder="Message shown after completion"
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            className="gap-2 text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete Study
          </Button>

          <div className="flex items-center gap-3">
            <Link href="/admin/studies">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
            <Button type="button" onClick={handleSave} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
