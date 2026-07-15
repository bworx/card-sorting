'use client';

import Link from 'next/link';
import { 
  FolderKanban, 
  Accessibility, 
  BarChart3, 
  Users, 
  ArrowRight,
  Github,
  Keyboard,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">Card Sorting AnySurfer</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="https://github.com/jgadsbypeet/card-sorting" target="_blank">
              <Button variant="ghost" size="sm" className="gap-2">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="sm">Admin Login</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6">
            <Accessibility className="h-4 w-4" />
            WCAG AAA Accessible
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Open Source Card Sorting for{' '}
            <span className="text-primary">Everyone</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A free, accessible alternative to Optimal Workshop and Lyssna. 
            Built with a focus on creating a frictionless experience for participants using assistive technology.
          </p>
          {/* <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/s/product-features-demo">
              <Button size="lg" className="gap-2">
                Try Demo Study
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button size="lg" variant="outline" className="gap-2">
                Create Your Own
              </Button>
            </Link>
          </div> */}
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Built for Accessibility
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Keyboard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Full Keyboard Navigation</h3>
              <p className="text-muted-foreground">
                Tab, Space, Enter, Arrow keys — complete the entire sorting task without a mouse.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Screen Reader Support</h3>
              <p className="text-muted-foreground">
                ARIA live regions announce all changes. Works with NVDA, JAWS, and VoiceOver.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Powerful Analysis</h3>
              <p className="text-muted-foreground">
                Similarity matrices, dendrograms, and auto-generated insights from your data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Studies */}
      {/* <section className="border-t border-border">
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-4">
            Try It Now
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            Experience the participant view with our demo studies. No account required.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link 
              href="/s/product-features-demo"
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  Open Sort
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Product Features Demo</h3>
              <p className="text-sm text-muted-foreground">
                Create your own categories to organize software features. See how participants naturally group items.
              </p>
            </Link>

            <Link 
              href="/s/navigation-menu-demo"
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                  Closed Sort
                </span>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Navigation Menu Demo</h3>
              <p className="text-sm text-muted-foreground">
                Sort items into pre-defined categories. Test your existing information architecture.
              </p>
            </Link>
          </div>
        </div>
      </section> */}

      {/* CTA */}
      {/* <section className="border-t border-border bg-primary/5">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to run your own study?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Create an account, set up your cards, and share the link with participants.
          </p>
          <Link href="/admin/login">
            <Button size="lg" className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Open source card sorting tool
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="https://github.com/jgadsbypeet/card-sorting" target="_blank" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
              <Link href="/admin/login" className="hover:text-foreground transition-colors">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
