import { describe, expect, it } from 'vitest';
import {
  type CoachMessageRole,
  type CoachMessageStatus,
  createCoachMessage,
  createCoachSession,
  createEmptyCoachSession,
  updateCoachSession,
} from './CoachSession';

describe('CoachSession Domain', () => {
  describe('createCoachMessage', () => {
    it('should create message with default values', () => {
      const message = createCoachMessage({});

      expect(message.sessionId).toBe('');
      expect(message.role).toBe('user');
      expect(message.content).toBe('');
      expect(message.status).toBe('sent');
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should create message with provided values', () => {
      const createdAt = new Date('2026-01-01');
      const message = createCoachMessage({
        sessionId: 'session-1',
        role: 'model',
        content: 'Here is your advice.',
        status: 'sent',
        createdAt,
      });

      expect(message.sessionId).toBe('session-1');
      expect(message.role).toBe('model');
      expect(message.content).toBe('Here is your advice.');
      expect(message.status).toBe('sent');
      expect(message.createdAt).toBe(createdAt);
    });

    it('should allow sending status', () => {
      const message = createCoachMessage({ status: 'sending' });

      expect(message.status).toBe('sending');
    });

    it('should allow error status', () => {
      const message = createCoachMessage({ status: 'error' });

      expect(message.status).toBe('error');
    });

    it('should allow user and model roles', () => {
      const userRole: CoachMessageRole = 'user';
      const modelRole: CoachMessageRole = 'model';

      expect(createCoachMessage({ role: userRole }).role).toBe('user');
      expect(createCoachMessage({ role: modelRole }).role).toBe('model');
    });

    it('should allow all status values', () => {
      const statuses: CoachMessageStatus[] = ['sending', 'sent', 'error'];
      for (const status of statuses) {
        expect(createCoachMessage({ status }).status).toBe(status);
      }
    });
  });

  describe('createCoachSession', () => {
    it('should create session with default values', () => {
      const session = createCoachSession({});

      expect(session.accountId).toBe('');
      expect(session.userId).toBe('');
      expect(session.title).toBe('New Session');
      expect(session.messageCount).toBe(0);
      expect(session.createdAt).toBeInstanceOf(Date);
      expect(session.updatedAt).toBeInstanceOf(Date);
      expect(session.archivedAt).toBeUndefined();
    });

    it('should create session with provided values', () => {
      const createdAt = new Date('2026-01-01');
      const session = createCoachSession({
        accountId: 'acc-1',
        userId: 'user-1',
        title: 'My Budget Review',
        messageCount: 5,
        createdAt,
      });

      expect(session.accountId).toBe('acc-1');
      expect(session.userId).toBe('user-1');
      expect(session.title).toBe('My Budget Review');
      expect(session.messageCount).toBe(5);
      expect(session.createdAt).toBe(createdAt);
    });

    it('should handle archivedAt when provided', () => {
      const archivedAt = new Date('2026-02-01');
      const session = createCoachSession({ archivedAt });

      expect(session.archivedAt).toBe(archivedAt);
    });
  });

  describe('createEmptyCoachSession', () => {
    it('should create session with all default values', () => {
      const session = createEmptyCoachSession();

      expect(session.accountId).toBe('');
      expect(session.userId).toBe('');
      expect(session.title).toBe('New Session');
      expect(session.messageCount).toBe(0);
      expect(session.archivedAt).toBeUndefined();
    });
  });

  describe('updateCoachSession', () => {
    it('should update title', () => {
      const session = createCoachSession({ title: 'Old Title' });
      const updated = updateCoachSession(session, { title: 'New Title' });

      expect(updated.title).toBe('New Title');
      expect(updated.accountId).toBe(session.accountId);
    });

    it('should update messageCount', () => {
      const session = createCoachSession({ messageCount: 0 });
      const updated = updateCoachSession(session, { messageCount: 3 });

      expect(updated.messageCount).toBe(3);
    });

    it('should set archivedAt', () => {
      const session = createCoachSession({});
      const archivedAt = new Date('2026-03-01');
      const updated = updateCoachSession(session, { archivedAt });

      expect(updated.archivedAt).toBe(archivedAt);
    });

    it('should update updatedAt timestamp', () => {
      const session = createCoachSession({});
      const originalUpdatedAt = session.updatedAt;
      const updated = updateCoachSession(session, { title: 'Updated' });

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(originalUpdatedAt.getTime());
    });

    it('should preserve other fields when updating', () => {
      const session = createCoachSession({
        accountId: 'acc-1',
        userId: 'user-1',
        title: 'Original',
        messageCount: 2,
      });
      const updated = updateCoachSession(session, { title: 'Updated' });

      expect(updated.accountId).toBe('acc-1');
      expect(updated.userId).toBe('user-1');
      expect(updated.messageCount).toBe(2);
    });
  });
});
