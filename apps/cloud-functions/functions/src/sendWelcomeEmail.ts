import * as fs from 'node:fs';
import * as path from 'node:path';
import Sentry from '@sentry/node';
import admin from 'firebase-admin';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { convertMarkdownToHtml, replaceTemplateVariables } from './helpers/emailMarkdown';
import { sendEmailNotification } from './helpers/sendEmail';
import { extractFirstName } from './helpers/userHelpers';

/**
 * Loads and parses the welcome email template
 * @returns Object with subject and body from the template
 */
function loadEmailTemplate(): { subject: string; body: string } {
  // Templates are copied to lib/templates during build
  const templatePath = path.join(__dirname, 'templates', 'emails', 'welcome-email.md');
  const templateContent = fs.readFileSync(templatePath, 'utf-8');

  // Extract subject line (after "## Subject Line")
  const subjectMatch = templateContent.match(/## Subject Line\s*\n(.+)/);
  const subject = subjectMatch ? subjectMatch[1].trim() : 'Welcome to Spendless!';

  // Extract email body (after "## Email Body" until "---" or "## Email Footer")
  const bodyMatch = templateContent.match(
    /## Email Body\s*\n([\s\S]*?)(?=\n---|## Email Footer|## Technical Notes|$)/,
  );
  const body = bodyMatch ? bodyMatch[1].trim() : '';

  return { subject, body };
}

/**
 * Cloud Function that sends a welcome email when a new Account is created
 * Trigger: Firestore onCreate for accounts/{userId}
 */
export const sendWelcomeEmail = onDocumentCreated('accounts/{userId}', async (event) => {
  return Sentry.startSpan(
    { name: 'sendWelcomeEmail', op: 'function.firestore.onDocumentCreated' },
    async () => {
      const userId = event.params.userId;

      console.log(`Welcome email trigger fired for user: ${userId}`);

      try {
        // Fetch user from Firebase Auth
        const userRecord = await admin.auth().getUser(userId);

        if (!userRecord.email) {
          console.warn(`User ${userId} has no email address. Skipping welcome email.`);
          Sentry.captureMessage(`User ${userId} has no email address for welcome email`, 'warning');
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

        console.log(`Welcome email sent successfully to ${userRecord.email} (User: ${userId})`);
      } catch (error) {
        // Log error but don't throw - email failures should not block account creation
        console.error(`Error sending welcome email for user ${userId}:`, error);
        Sentry.captureException(error, {
          extra: {
            userId,
            operation: 'sendWelcomeEmail',
          },
        });
      }

      return null;
    },
  );
});
