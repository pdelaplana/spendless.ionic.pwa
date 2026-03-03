export type CoachMessageRole = 'user' | 'model';
export type CoachMessageStatus = 'sending' | 'sent' | 'error';

export interface ICoachMessage {
  readonly id?: string;
  readonly sessionId: string;
  readonly role: CoachMessageRole;
  readonly content: string;
  readonly status: CoachMessageStatus;
  readonly createdAt: Date;
}

export interface ICoachSession {
  readonly id?: string;
  readonly accountId: string;
  readonly userId: string;
  readonly title: string;
  readonly messageCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly archivedAt?: Date;
}

export type CreateCoachMessageDTO = Omit<ICoachMessage, 'id'>;
export type CreateCoachSessionDTO = Omit<ICoachSession, 'id'>;

export const createCoachMessage = (data: Partial<CreateCoachMessageDTO>): ICoachMessage => ({
  sessionId: data.sessionId ?? '',
  role: data.role ?? 'user',
  content: data.content ?? '',
  status: data.status ?? 'sent',
  createdAt: data.createdAt ?? new Date(),
});

export const createCoachSession = (data: Partial<CreateCoachSessionDTO>): ICoachSession => ({
  accountId: data.accountId ?? '',
  userId: data.userId ?? '',
  title: data.title ?? 'New Session',
  messageCount: data.messageCount ?? 0,
  createdAt: data.createdAt ?? new Date(),
  updatedAt: data.updatedAt ?? new Date(),
  archivedAt: data.archivedAt,
});

export const createEmptyCoachSession = (): ICoachSession => createCoachSession({});

export const updateCoachSession = (
  session: ICoachSession,
  updates: Partial<ICoachSession>,
): ICoachSession => ({
  ...session,
  ...updates,
  updatedAt: new Date(),
});
