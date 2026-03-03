import type { ICoachMessage } from '@/domain/CoachSession';
import { createCoachMessage } from '@/domain/CoachSession';
import { useLogging } from '@/hooks';
import { ai, db } from '@/infrastructure/firebase';
import * as Sentry from '@sentry/browser';
import { useMutation } from '@tanstack/react-query';
import { getGenerativeModel } from 'firebase/ai';
import { Timestamp, addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import {
  ACCOUNTS_COLLECTION,
  COACH_SESSIONS_SUBCOLLECTION,
  MESSAGES_SUBCOLLECTION,
  buildGeminiHistory,
  messageToFirestore,
} from './coachSessionUtils';

interface SendCoachMessageParams {
  accountId: string;
  sessionId: string;
  content: string;
  systemPrompt: string;
  history: ICoachMessage[];
  decrementMessages?: () => Promise<void>;
}

export function useSendCoachMessage() {
  const { logError } = useLogging();

  return useMutation({
    mutationFn: async ({
      accountId,
      sessionId,
      content,
      systemPrompt,
      history,
      decrementMessages,
    }: SendCoachMessageParams) => {
      return Sentry.startSpan({ name: 'useSendCoachMessage', op: 'mutation' }, async (span) => {
        const messagesRef = collection(
          db,
          ACCOUNTS_COLLECTION,
          accountId,
          COACH_SESSIONS_SUBCOLLECTION,
          sessionId,
          MESSAGES_SUBCOLLECTION,
        );

        // 1. Save user message with 'sending' status so the UI shows it immediately
        const userMessage = createCoachMessage({
          sessionId,
          role: 'user',
          content,
          status: 'sending',
        });
        const userMessageRef = await addDoc(messagesRef, messageToFirestore(userMessage));

        try {
          // 2. Call Gemini with history as context
          const model = getGenerativeModel(ai, {
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt,
          });

          const chat = model.startChat({ history: buildGeminiHistory(history) });
          const result = await chat.sendMessage(content);
          const responseText = result.response.text();

          // 3. Save AI response
          const aiMessage = createCoachMessage({
            sessionId,
            role: 'model',
            content: responseText,
            status: 'sent',
          });
          await addDoc(messagesRef, messageToFirestore(aiMessage));

          // 4. Mark user message as sent
          await updateDoc(userMessageRef, { status: 'sent' });

          // 5. Update session metadata
          const sessionRef = doc(
            db,
            ACCOUNTS_COLLECTION,
            accountId,
            COACH_SESSIONS_SUBCOLLECTION,
            sessionId,
          );
          await updateDoc(sessionRef, {
            messageCount: increment(2),
            updatedAt: Timestamp.now(),
          });

          // 6. Decrement trial counter if applicable
          if (decrementMessages) {
            await decrementMessages();
          }

          span.setAttributes({ accountId, sessionId });
          return responseText;
        } catch (error) {
          // Mark user message as failed so the UI can show an error state
          await updateDoc(userMessageRef, { status: 'error' });
          throw error;
        }
      });
    },
    onError: (error) => {
      logError(error);
    },
  });
}
