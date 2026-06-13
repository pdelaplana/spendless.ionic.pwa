import * as fs from 'node:fs';
import * as path from 'node:path';
import Sentry from '@sentry/node';
import admin from 'firebase-admin';
import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { convertMarkdownToHtml, replaceTemplateVariables } from './helpers/emailMarkdown';
import { sendEmailNotification } from './helpers/sendEmail';
import { extractFirstName } from './helpers/userHelpers';

/**
 * Loads and parses the premium subscription email template
 * @returns Object with subject and body from the template
 */
function loadEmailTemplate(): { subject: string; body: string } {
  // Templates are copied to lib/templates during build
  const templatePath = path.join(__dirname, 'templates', 'emails', 'premium-subscription-email.md');
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // Extract subject line (after "## Subject Line")
  const subjectMatch = templateContent.match(/## Subject Line\s*\n(.+)/);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'Thanks for upgrading to Premium!';

  // Extract email body (after "## Email Body" until "---" or "## Email Footer")
  const bodyMatch = templateContent.match(
    /## Email Body\s*\n([\s\S]*?)(?=\n---|## Email Footer|## Technical Notes|$)/,
  );
  const body = bodyMatch ? bodyMatch[1].trim() : '';

  return { subject, body };
}

/**
 * Cloud Function that sends a premium subscription email when subscriptionTier changes to "premium"
 * Trigger: Firestore onUpdate for accounts/{userId}
 */
export const sendPremiumSubscriptionEmail = onDocumentUpdated(
  'accounts/{userId}',
  async (event) => {
    return Sentry.startSpan(
      { name: 'sendPremiumSubscriptionEmail', op: 'function.firestore.onDocumentUpdated' },
      async () => {
        const userId = event.params.userId;
        const beforeData = event.data?.before.data();
        const afterData = event.data?.after.data();

        console.log(`Premium subscription email trigger fired for user: ${userId}`);

        // Check if subscriptionTier changed to "premium"
        const beforeTier = beforeData?.subscriptionTier;
        const afterTier = afterData?.subscriptionTier;

        if (afterTier === 'premium' && beforeTier !== 'premium') {
          console.log(
            `SubscriptionTier changed from "${beforeTier}" to "premium" for user ${userId}. Sending email.`,
          );

          try {
            // Fetch user from Firebase Auth
            const userRecord = await admin.auth().getUser(userId);

            if (!userRecord.email) {
              console.warn(
                `User ${userId} has no email address. Skipping premium subscription email.`,
              );
              Sentry.captureMessage(
                `User ${userId} has no email address for premium subscription email`,
                'warning',
              );
              return null;
            }

            // Extract first name from displayName
            const firstName = extractFirstName(userRecord.displayName);

            // Load email template
            const template = loadEmailTemplate();

            // Prepare template variables
            const currentYear = new Date().getFullYear().toString();
            const variables = {
              firstName,
              founderName: 'Patrick',
              currentYear,
            };

            // Replace variables in subject and body
            const subject = replaceTemplateVariables(template.subject, variables);
            const bodyMarkdown = replaceTemplateVariables(template.body, variables);

            // Convert markdown to HTML
            const bodyHtml = await convertMarkdownToHtml(bodyMarkdown);

            // Send email via Mailgun
            await sendEmailNotification({
              from: '"Spendless" <patrick@getspendless.com>',
              to: userRecord.email,
              subject,
              html: bodyHtml,
            });

            console.log(
              `Premium subscription email sent successfully to ${userRecord.email} (User: ${userId})`,
            );
          } catch (error) {
            // Log error but don't throw - email failures should not block account updates
            console.error(`Error sending premium subscription email for user ${userId}:`, error);
            Sentry.captureException(error, {
              extra: {
                userId,
                operation: 'sendPremiumSubscriptionEmail',
              },
            });
          }
        } else {
          console.log(
            `SubscriptionTier change detected but not to premium (before: "${beforeTier}", after: "${afterTier}"). Skipping email.`,
          );
        }

        return null;
      },
    );
  },
);
