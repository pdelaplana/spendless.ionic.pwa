import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import Sentry from '@sentry/node';
import admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/v2/https';

import { parse } from 'json2csv';
import { sendEmailNotification } from '../helpers/sendEmail';

export const exportData = async ({ userId, userEmail }: { userId: string; userEmail: string }) => {
  return Sentry.startSpan({ name: 'exportData', op: 'function.job.exportData' }, async () => {
    if (!userId) {
      throw new Error('User ID is required.');
    }

    try {
      // Validate collection name (you can add more validation as needed)
      const accountRef = await admin
        .firestore()
        .collection('accounts')
        .doc(userId ?? '');

      if (!accountRef) {
        throw new Error(`Account with ID ${userId} not found.`);
      }

      // geet account information from the document
      const accountSnapshot = await accountRef.get();
      const account = accountSnapshot.data();

      // get periods collection
      const periodsSnapshot = await accountRef.collection('periods').get();
      const periods = periodsSnapshot.docs;

      // Get spending data from Firestore
      const spendingSnapshot = await accountRef.collection('spending').get();

      // Convert Firestore data to array
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const spending: any[] = [];
      for (const doc of spendingSnapshot.docs) {
        // Combine document ID with document data
        const period = periods.find((period) => period.id === doc.data().periodId)?.data() ?? {};

        spending.push({
          id: doc.id,

          spendingDate: doc.data().date.toDate(),
          spendingAmount: doc.data().amount,
          spendingDescription: doc.data().description,
          spendingCategory: doc.data().category,
          spendingNotes: doc.data().notes,
          spendingRecurring: doc.data().recurring,
          spendingCreatedAt: doc.data().createdAt.toDate(),
          spendingUpdatedAt: doc.data().updatedAt.toDate(),

          periodId: period?.id,
          periodName: period?.name,
          periodGoals: period?.goals,
          periodTargetSpend: period?.targetSpend,
          periodTargetSavings: period?.targetSavings,

          periodCreatedAt: period?.createdAt.toDate(),
          periodUpdatedAt: period?.updatedAt.toDate(),

          periodStartAt: period?.startAt.toDate(),
          periodEndAt: period?.endAt.toDate(),
          periodClosedAt: period?.closedAt?.toDate(),

          accountId: account?.id,
          accountName: account?.name,
          accountCurrency: account?.currency,
          accountDateFormat: account?.dateFormat,
          accountCreatedAt: account?.createdAt.toDate(),
          accountUpdatedAt: account?.updatedAt.toDate(),
        });
      }

      // If we have no documents, throw an error
      if (spending.length === 0) {
        throw new HttpsError('not-found', `No data found for ${userEmail}.`);
      }

      // Convert JSON to CSV
      const csv = parse(spending);

      // Create temp file
      const timestamp = Date.now();
      const tempFilePath = path.join(os.tmpdir(), `spending-export-${userId}-${timestamp}.csv`);
      fs.writeFileSync(tempFilePath, csv);

      // Upload to Firebase Storage
      const defaultBucket = process.env.STORAGE_BUCKET || 'spendless-dev-15971.firebasestorage.app';
      console.log('Using storage bucket:', defaultBucket);
      const bucket = admin.storage().bucket(defaultBucket);
      const storageFilePath = `users/${userId}/exports/spending-${timestamp}.csv`;

      await bucket.upload(tempFilePath, {
        destination: storageFilePath,
        metadata: {
          contentType: 'text/csv',
        },
      });

      // Clean up temp file
      fs.unlinkSync(tempFilePath);

      const [url] = await bucket.file(storageFilePath).getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Send email notification
      await sendEmailNotification({
        from: '"Spendless" <noreply@yourapp.com>',
        to: userEmail,
        subject: 'Your data export is ready',
        html: `
          <h2>Your data export is ready</h2>
          <p>You requested an export of your spending data. Your file is now ready for download.</p>
          <p><a href="${url}">Click here to download your CSV file</a></p>
          <p>This link will expire in 7 days.</p>
        `,
      });

      // Optionally, also send a notification via Firebase messaging
      //await sendFirebaseNotification(userId, collectionName, url);

      // Return success with download URL
      return {
        success: true,
        message: `${userEmail} data exported successfully.`,
        downloadUrl: url,
      };
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error exporting data:', error);
      return {
        success: false,
        message: `${error}`,
      };
    }
  });
};
