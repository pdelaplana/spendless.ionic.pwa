import { createCoachMessage, createCoachSession } from '@/domain/CoachSession';
import type { IPeriod } from '@/domain/Period';
import type { ISpend } from '@/domain/Spend';
import type { IWallet } from '@/domain/Wallet';
import { Timestamp } from 'firebase/firestore';
import { describe, expect, it } from 'vitest';
import {
  FREE_MESSAGES_DEFAULT,
  buildGeminiHistory,
  buildSystemPrompt,
  messageFromFirestore,
  messageToFirestore,
  sessionFromFirestore,
  sessionToFirestore,
} from './coachSessionUtils';

const makeFirestoreSession = (overrides = {}) => ({
  accountId: 'acc-1',
  userId: 'user-1',
  title: 'My Session',
  messageCount: 3,
  createdAt: Timestamp.fromDate(new Date('2026-01-01')),
  updatedAt: Timestamp.fromDate(new Date('2026-01-02')),
  archivedAt: null,
  ...overrides,
});

const makeFirestoreMessage = (overrides = {}) => ({
  sessionId: 'session-1',
  role: 'user',
  content: 'Hello coach',
  status: 'sent',
  createdAt: Timestamp.fromDate(new Date('2026-01-01')),
  ...overrides,
});

const makeSpend = (overrides: Partial<ISpend> = {}): ISpend => ({
  id: '1',
  accountId: 'acc-1',
  date: new Date('2026-01-15'),
  category: 'need',
  amount: 50,
  description: 'Grocery',
  notes: '',
  periodId: 'p1',
  walletId: 'w1',
  recurring: false,
  emotionalState: undefined,
  emotionalContext: [],
  satisfactionRating: undefined,
  necessityRating: undefined,
  personalReflections: [],
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makePeriod = (overrides: Partial<IPeriod> = {}): IPeriod => ({
  id: 'p1',
  name: 'January 2026',
  goals: '',
  targetSpend: 3000,
  targetSavings: 500,
  startAt: new Date('2026-01-01'),
  endAt: new Date('2026-01-31'),
  reflection: '',
  walletSetup: [
    { name: 'Groceries', spendingLimit: 600, isDefault: true },
    { name: 'Entertainment', spendingLimit: 200, isDefault: false },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

const makeWallet = (overrides: Partial<IWallet> = {}): IWallet => ({
  id: 'w1',
  accountId: 'acc-1',
  periodId: 'p1',
  name: 'Groceries',
  spendingLimit: 600,
  currentBalance: 0,
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('coachSessionUtils', () => {
  describe('sessionToFirestore', () => {
    it('should map session to Firestore format', () => {
      const session = createCoachSession({
        accountId: 'acc-1',
        userId: 'user-1',
        title: 'Budget Review',
        messageCount: 5,
      });

      const doc = sessionToFirestore(session);

      expect(doc.accountId).toBe('acc-1');
      expect(doc.userId).toBe('user-1');
      expect(doc.title).toBe('Budget Review');
      expect(doc.messageCount).toBe(5);
      expect(doc.createdAt).toBeInstanceOf(Timestamp);
      expect(doc.updatedAt).toBeInstanceOf(Timestamp);
      expect(doc.archivedAt).toBeNull();
    });

    it('should convert archivedAt Date to Timestamp', () => {
      const archivedAt = new Date('2026-02-01');
      const session = createCoachSession({ archivedAt });

      const doc = sessionToFirestore(session);

      expect(doc.archivedAt).toBeInstanceOf(Timestamp);
      expect(doc.archivedAt.toDate()).toEqual(archivedAt);
    });

    it('should map archivedAt to null when undefined', () => {
      const session = createCoachSession({});

      const doc = sessionToFirestore(session);

      expect(doc.archivedAt).toBeNull();
    });
  });

  describe('sessionFromFirestore', () => {
    it('should map Firestore document to ICoachSession', () => {
      const data = makeFirestoreSession();
      const session = sessionFromFirestore('session-123', data);

      expect(session.id).toBe('session-123');
      expect(session.accountId).toBe('acc-1');
      expect(session.userId).toBe('user-1');
      expect(session.title).toBe('My Session');
      expect(session.messageCount).toBe(3);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.archivedAt).toBeUndefined();
    });

    it('should convert archivedAt Timestamp to Date', () => {
      const archivedDate = new Date('2026-02-01');
      const data = makeFirestoreSession({ archivedAt: Timestamp.fromDate(archivedDate) });
      const session = sessionFromFirestore('s1', data);

      expect(session.archivedAt).toBeInstanceOf(Date);
      expect(session.archivedAt?.toISOString()).toBe(archivedDate.toISOString());
    });

    it('should default messageCount to 0 when missing', () => {
      const data = makeFirestoreSession({ messageCount: undefined });
      const session = sessionFromFirestore('s1', data);

      expect(session.messageCount).toBe(0);
    });
  });

  describe('messageToFirestore', () => {
    it('should map message to Firestore format', () => {
      const message = createCoachMessage({
        sessionId: 'session-1',
        role: 'model',
        content: 'Here is your advice.',
        status: 'sent',
      });

      const doc = messageToFirestore(message);

      expect(doc.sessionId).toBe('session-1');
      expect(doc.role).toBe('model');
      expect(doc.content).toBe('Here is your advice.');
      expect(doc.status).toBe('sent');
      expect(doc.createdAt).toBeInstanceOf(Timestamp);
    });

    it('should map sending status', () => {
      const message = createCoachMessage({ status: 'sending' });
      const doc = messageToFirestore(message);

      expect(doc.status).toBe('sending');
    });
  });

  describe('messageFromFirestore', () => {
    it('should map Firestore document to ICoachMessage', () => {
      const data = makeFirestoreMessage();
      const message = messageFromFirestore('msg-1', data);

      expect(message.id).toBe('msg-1');
      expect(message.sessionId).toBe('session-1');
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello coach');
      expect(message.status).toBe('sent');
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should default status to sent when missing', () => {
      const data = makeFirestoreMessage({ status: undefined });
      const message = messageFromFirestore('msg-1', data);

      expect(message.status).toBe('sent');
    });

    it('should handle model role', () => {
      const data = makeFirestoreMessage({ role: 'model' });
      const message = messageFromFirestore('msg-1', data);

      expect(message.role).toBe('model');
    });
  });

  describe('buildSystemPrompt', () => {
    it('should return base prompt when context is off', () => {
      const prompt = buildSystemPrompt({ includeContext: false });

      expect(prompt).toContain('AI Financial Coach');
      expect(prompt).toContain('No spending context has been shared');
    });

    it('should return base prompt when context is on but no spends provided', () => {
      const prompt = buildSystemPrompt({ includeContext: true, spends: [] });

      expect(prompt).toContain('No spending context has been shared');
    });

    it('should include spending data when context is on', () => {
      const spends: ISpend[] = [makeSpend()];

      const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD' });

      expect(prompt).toContain('Grocery');
      expect(prompt).toContain('need');
      expect(prompt).toContain('50.00');
      expect(prompt).toContain('USD');
    });

    it('should cap spends at 30 transactions', () => {
      const spends: ISpend[] = Array.from({ length: 40 }, (_, i) =>
        makeSpend({ description: `Item ${i}`, amount: 10 }),
      );

      const prompt = buildSystemPrompt({ includeContext: true, spends });

      expect(prompt).toContain('30 most recent transactions');
      expect(prompt).not.toContain('Item 30'); // 31st item should be excluded
      expect(prompt).toContain('Item 0');
    });

    it('should default currency to USD when not provided', () => {
      const spends: ISpend[] = [makeSpend({ amount: 20, description: 'Test' })];

      const prompt = buildSystemPrompt({ includeContext: true, spends });

      expect(prompt).toContain('USD');
    });

    describe('with period context', () => {
      it('should include period name and date range when period is provided', () => {
        const spends = [makeSpend()];
        const period = makePeriod();

        const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

        expect(prompt).toContain('January 2026');
        expect(prompt).toContain('01 Jan 2026');
        expect(prompt).toContain('31 Jan 2026');
      });

      it('should include overall budget line with spent and limit', () => {
        const spends = [makeSpend({ amount: 450, walletId: 'w1' })];
        const period = makePeriod({ targetSpend: 3000 });

        const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD', period });

        expect(prompt).toContain('450.00');
        expect(prompt).toContain('3,000.00');
      });

      it('should include wallet breakdown with actuals computed from spends', () => {
        const spends = [
          makeSpend({ amount: 450, walletId: 'w1' }),
          makeSpend({ amount: 280, walletId: 'w2' }),
        ];
        const period = makePeriod();
        const wallets = [
          makeWallet({ id: 'w1', name: 'Groceries', spendingLimit: 600 }),
          makeWallet({ id: 'w2', name: 'Entertainment', spendingLimit: 200, isDefault: false }),
        ];

        const prompt = buildSystemPrompt({
          includeContext: true,
          spends,
          currency: 'USD',
          period,
          wallets,
        });

        expect(prompt).toContain('Groceries');
        expect(prompt).toContain('450.00');
        expect(prompt).toContain('600.00');
        expect(prompt).toContain('Entertainment');
        expect(prompt).toContain('280.00');
        expect(prompt).toContain('200.00');
      });

      it('should show ⚠️ emoji for wallets over their spending limit', () => {
        const spends = [makeSpend({ amount: 280, walletId: 'w2' })];
        const period = makePeriod();
        const wallets = [
          makeWallet({ id: 'w2', name: 'Entertainment', spendingLimit: 200, isDefault: true }),
        ];

        const prompt = buildSystemPrompt({
          includeContext: true,
          spends,
          currency: 'USD',
          period,
          wallets,
        });

        expect(prompt).toContain('⚠️');
      });

      it('should NOT show ⚠️ for wallets within their limit', () => {
        const spends = [makeSpend({ amount: 100, walletId: 'w1' })];
        const period = makePeriod();
        const wallets = [makeWallet({ id: 'w1', name: 'Groceries', spendingLimit: 600 })];

        const prompt = buildSystemPrompt({
          includeContext: true,
          spends,
          currency: 'USD',
          period,
          wallets,
        });

        expect(prompt).not.toContain('⚠️');
      });

      it('should not include period section when includeContext is false', () => {
        const period = makePeriod();

        const prompt = buildSystemPrompt({ includeContext: false, period });

        expect(prompt).not.toContain('January 2026');
        expect(prompt).toContain('No spending context has been shared');
      });

      it('should not include period section when no period is passed', () => {
        const spends = [makeSpend()];

        const prompt = buildSystemPrompt({ includeContext: true, spends, currency: 'USD' });

        expect(prompt).not.toContain('Period:');
        expect(prompt).not.toContain('Wallets:');
      });

      it('should handle a wallet with zero spend correctly', () => {
        const spends = [makeSpend({ amount: 100, walletId: 'w1' })];
        const period = makePeriod();
        const wallets = [
          makeWallet({ id: 'w1', name: 'Groceries', spendingLimit: 600 }),
          makeWallet({ id: 'w3', name: 'Transport', spendingLimit: 300, isDefault: false }),
        ];

        const prompt = buildSystemPrompt({
          includeContext: true,
          spends,
          currency: 'USD',
          period,
          wallets,
        });

        expect(prompt).toContain('Transport');
        expect(prompt).toContain('0.00');
        expect(prompt).toContain('300.00');
      });
    });
  });

  describe('FREE_MESSAGES_DEFAULT', () => {
    it('should be 5', () => {
      expect(FREE_MESSAGES_DEFAULT).toBe(5);
    });
  });

  describe('buildGeminiHistory', () => {
    it('should return empty array for empty messages', () => {
      expect(buildGeminiHistory([])).toEqual([]);
    });

    it('should map sent user messages to Gemini Content format', () => {
      const messages = [createCoachMessage({ role: 'user', content: 'Hello', status: 'sent' })];
      const history = buildGeminiHistory(messages);

      expect(history).toHaveLength(1);
      expect(history[0].role).toBe('user');
      expect(history[0].parts).toEqual([{ text: 'Hello' }]);
    });

    it('should map sent model messages correctly', () => {
      const messages = [
        createCoachMessage({ role: 'model', content: 'Hi there!', status: 'sent' }),
      ];
      const history = buildGeminiHistory(messages);

      expect(history[0].role).toBe('model');
      expect(history[0].parts).toEqual([{ text: 'Hi there!' }]);
    });

    it('should exclude messages with sending status', () => {
      const messages = [
        createCoachMessage({ role: 'user', content: 'Sent message', status: 'sent' }),
        createCoachMessage({ role: 'user', content: 'In-flight message', status: 'sending' }),
      ];
      const history = buildGeminiHistory(messages);

      expect(history).toHaveLength(1);
      expect(history[0].parts[0].text).toBe('Sent message');
    });

    it('should exclude messages with error status', () => {
      const messages = [
        createCoachMessage({ role: 'user', content: 'Good message', status: 'sent' }),
        createCoachMessage({ role: 'user', content: 'Failed message', status: 'error' }),
      ];
      const history = buildGeminiHistory(messages);

      expect(history).toHaveLength(1);
      expect(history[0].parts[0].text).toBe('Good message');
    });

    it('should preserve message order', () => {
      const messages = [
        createCoachMessage({ role: 'user', content: 'First', status: 'sent' }),
        createCoachMessage({ role: 'model', content: 'Second', status: 'sent' }),
        createCoachMessage({ role: 'user', content: 'Third', status: 'sent' }),
      ];
      const history = buildGeminiHistory(messages);

      expect(history).toHaveLength(3);
      expect(history[0].parts[0].text).toBe('First');
      expect(history[1].parts[0].text).toBe('Second');
      expect(history[2].parts[0].text).toBe('Third');
    });
  });
});
