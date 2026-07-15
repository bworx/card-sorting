import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// In-memory store for demo mode (no database required)
// Demo mode is enabled when DATABASE_URL is missing or doesn't look like a real PostgreSQL URL.
// Disabled outright in production so a misconfigured DATABASE_URL fails loudly (a real DB
// error) instead of silently serving fake in-memory data.
const DEMO_MODE = process.env.NODE_ENV !== 'production' && (
  !process.env.DATABASE_URL ||
  !process.env.DATABASE_URL.startsWith('postgresql://') ||
  process.env.DATABASE_URL.includes('demo')
);

interface DemoStudy {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  mode: 'OPEN' | 'CLOSED';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  allowUndo: boolean;
  showProgress: boolean;
  requireAllCardsSorted: boolean;
  randomizeCards: boolean;
  timeLimitMinutes: number | null;
  instructions: string | null;
  thankYouMessage: string | null;
  cards: { id: string; label: string; description: string | null; sortOrder: number }[];
  categories: { id: string; name: string; sortOrder: number }[];
  createdAt: Date;
  updatedAt: Date;
  _count: { cards: number; sessions: number };
}

// Demo data store (persists in memory during server runtime)
const demoStudies: Map<string, DemoStudy> = new Map();

// Initialize with sample study
const sampleStudy: DemoStudy = {
  id: 'demo-study-1',
  name: 'Product Feature Organization (Demo)',
  description: 'Demo study - data is stored in memory only',
  slug: 'product-features-demo',
  mode: 'OPEN',
  status: 'ACTIVE',
  allowUndo: true,
  showProgress: true,
  requireAllCardsSorted: false,
  randomizeCards: true,
  timeLimitMinutes: null,
  instructions: 'Sort these product features into groups that make sense to you.',
  thankYouMessage: 'Thank you for participating in this demo!',
  cards: [
    { id: 'c1', label: 'Budget Planning', description: 'Create and manage budgets', sortOrder: 0 },
    { id: 'c2', label: 'Invoice Generation', description: 'Generate and send invoices', sortOrder: 1 },
    { id: 'c3', label: 'Team Chat', description: 'Real-time messaging', sortOrder: 2 },
    { id: 'c4', label: 'Video Calls', description: 'Host meetings', sortOrder: 3 },
    { id: 'c5', label: 'Task Assignment', description: 'Assign tasks to team', sortOrder: 4 },
    { id: 'c6', label: 'Progress Tracking', description: 'Monitor progress', sortOrder: 5 },
  ],
  categories: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  _count: { cards: 6, sessions: 0 },
};
demoStudies.set(sampleStudy.id, sampleStudy);

// GET /api/studies - List all studies
export async function GET(request: NextRequest) {
  try {
    if (DEMO_MODE) {
      // Demo mode - return in-memory studies
      const studies = Array.from(demoStudies.values()).map(s => ({
        ...s,
        _count: { cards: s.cards.length, sessions: s._count.sessions },
      }));
      return NextResponse.json(studies);
    }

    // Database mode
    const { prisma } = await import('@/lib/db');
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    
    const session = await getServerSession(authOptions);
    
    let userId: string;
    if (!session?.user) {
      const demoUser = await prisma.user.findFirst({ where: { email: 'admin@example.com' } });
      if (!demoUser) {
        return NextResponse.json({ 
          error: 'No demo user found. Run `npm run db:seed` to create one.' 
        }, { status: 401 });
      }
      userId = demoUser.id;
    } else {
      userId = (session.user as { id: string }).id;
    }

    const studies = await prisma.study.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            cards: true,
            sessions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(studies);
  } catch (error) {
    console.error('Error fetching studies:', error);
    return NextResponse.json({ error: 'Failed to fetch studies' }, { status: 500 });
  }
}

// POST /api/studies - Create a new study
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      name,
      description,
      mode = 'OPEN',
      cards = [],
      categories = [],
      settings = {},
    } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Study name is required' }, { status: 400 });
    }

    if (cards.length === 0) {
      return NextResponse.json({ error: 'At least one card is required' }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${baseSlug}-${nanoid(8)}`;

    if (DEMO_MODE) {
      // Demo mode - store in memory
      const study: DemoStudy = {
        id: `demo-${nanoid(10)}`,
        name: name.trim(),
        description: description?.trim() || null,
        slug,
        mode,
        status: 'DRAFT',
        allowUndo: settings.allowUndo ?? true,
        showProgress: settings.showProgress ?? true,
        requireAllCardsSorted: settings.requireAllCardsSorted ?? false,
        randomizeCards: settings.randomizeCards ?? true,
        timeLimitMinutes: settings.timeLimitMinutes || null,
        instructions: settings.instructions?.trim() || null,
        thankYouMessage: settings.thankYouMessage?.trim() || null,
        cards: cards.map((card: { label: string; description?: string }, index: number) => ({
          id: `card-${nanoid(8)}`,
          label: card.label.trim(),
          description: card.description?.trim() || null,
          sortOrder: index,
        })),
        categories: mode === 'CLOSED' 
          ? categories.map((cat: { name: string }, index: number) => ({
              id: `cat-${nanoid(8)}`,
              name: cat.name.trim(),
              sortOrder: index,
            }))
          : [],
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cards: cards.length, sessions: 0 },
      };

      demoStudies.set(study.id, study);
      return NextResponse.json(study, { status: 201 });
    }

    // Database mode
    const { prisma } = await import('@/lib/db');
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth');
    
    const session = await getServerSession(authOptions);
    
    let userId: string;
    if (!session?.user) {
      const demoUser = await prisma.user.findFirst({ where: { email: 'admin@example.com' } });
      if (!demoUser) {
        return NextResponse.json({ 
          error: 'No demo user found. Run `npm run db:seed` to create one.' 
        }, { status: 401 });
      }
      userId = demoUser.id;
    } else {
      userId = (session.user as { id: string }).id;
    }

    const study = await prisma.study.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        slug,
        mode,
        ownerId: userId,
        allowUndo: settings.allowUndo ?? true,
        showProgress: settings.showProgress ?? true,
        requireAllCardsSorted: settings.requireAllCardsSorted ?? false,
        randomizeCards: settings.randomizeCards ?? true,
        timeLimitMinutes: settings.timeLimitMinutes || null,
        instructions: settings.instructions?.trim() || null,
        thankYouMessage: settings.thankYouMessage?.trim() || null,
        cards: {
          create: cards.map((card: { label: string; description?: string }, index: number) => ({
            label: card.label.trim(),
            description: card.description?.trim() || null,
            sortOrder: index,
          })),
        },
        categories: mode === 'CLOSED' ? {
          create: categories.map((cat: { name: string }, index: number) => ({
            name: cat.name.trim(),
            sortOrder: index,
          })),
        } : undefined,
      },
      include: {
        cards: true,
        categories: true,
      },
    });

    return NextResponse.json(study, { status: 201 });
  } catch (error) {
    console.error('Error creating study:', error);
    return NextResponse.json({ error: 'Failed to create study' }, { status: 500 });
  }
}

// Export for use by other routes
export { demoStudies, DEMO_MODE };
export type { DemoStudy };
