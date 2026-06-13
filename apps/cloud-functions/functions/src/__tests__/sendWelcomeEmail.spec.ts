import * as admin from 'firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';
import { sendEmailNotification } from '../helpers/sendEmail';

// Mock firebase-admin (same pattern as deleteAccount.spec.ts)
jest.mock('firebase-admin', () => {
  return {
    firestore: jest.fn().mockReturnValue({
      collection: jest.fn(),
    }),
    storage: jest.fn().mockReturnValue({
      bucket: jest.fn(),
    }),
    auth: jest.fn().mockReturnValue({
      getUser: jest.fn(),
    }),
  };
});

// Mock email sending
jest.mock('../helpers/sendEmail', () => ({
  sendEmailNotification: jest.fn().mockResolvedValue({}),
}));

// Mock Sentry
jest.mock('@sentry/node', () => ({
  default: {
    startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
  },
  startSpan: jest.fn().mockImplementation((_options, fn) => fn()),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

// Mock fs/promises for template loading
jest.mock('node:fs/promises', () => ({
  readFile: jest.fn().mockResolvedValue(`
# Welcome Email - New User

## Subject Line
Hey {firstName}, welcome to Spendless!

## Email Body

Hey {firstName},

Thanks for signing up! I'm glad you're here.

You know that feeling when you check your bank account and wonder where all your money went? Yeah, we've all been there. That's why I built Spendless - to help you actually understand your spending without the guilt trip.

### Here's how to get rolling:

**Create a period** - Pick how you want to track your spending: weekly, monthly, or whatever works for you.

**Set up your wallets** - Create as many wallets as you need. Personal spending, groceries, business expenses - you name it. Set a spending limit for each one, and the app will help you stay on track.

**Start tracking** - Add your first expense. That coffee, lunch, or whatever you just bought. Takes like 10 seconds. You'll see how much of your limit is left.

### A few things you might like:

- Works offline - track expenses anywhere, sync when you're back online
- Your currency - track in AUD, PHP USD, or EUR, (more currencies coming soon)
- Customized tags - organize expenses your way with personalized categories
- Mood tracking - coming soon, ever notice how emotions affect spending?
- Privacy first - no ads, no selling your data, ever

There's no "right way" to use Spendless. Some people track everything, others just the big stuff. Do what works for you.

One more thing - Spendless is actively being developed and improved. Your feedback shapes what gets built next. Found a bug? Have an idea? Want something to work differently? Just send me an email. I actually read these and they matter.

Cheers,
{founderName}
Founder, Spendless

P.S. - Start simple. You can always add more detail later.

---

## Email Footer

© {currentYear} Spendless. All rights reserved.

[Privacy Policy] | [Terms of Service] | [Help Center]
  `),
}));

// Mock marked for markdown conversion
jest.mock('marked', () => ({
  marked: {
    parse: jest.fn().mockImplementation((markdown: string) => {
      // Simple mock that converts markdown to basic HTML
      let html = markdown;
      html = html.replace(/### (.+)/g, '<h3>$1</h3>');
      html = html.replace(/## (.+)/g, '<h2>$1</h2>');
      html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      html = html.replace(/\n\n/g, '</p><p>');
      return Promise.resolve(`<p>${html}</p>`);
    }),
    use: jest.fn(),
  },
}));

// Import after mocks are set up
import { sendWelcomeEmail } from '../sendWelcomeEmail';

describe('sendWelcomeEmail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send welcome email successfully with displayName', async () => {
    // Mock user with displayName
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'john.doe@example.com',
      displayName: 'John Doe',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Verify email was sent
    expect(sendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"Spendless" <patrick@getspendless.com>',
        to: 'john.doe@example.com',
        subject: expect.stringContaining('John'),
        html: expect.any(String),
      }),
    );

    // Verify the subject contains the first name
    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];
    expect(emailCall.subject).toContain('John');
    expect(emailCall.subject).not.toContain('{firstName}');

    // Verify the body contains replaced variables
    expect(emailCall.html).toContain('John');
    expect(emailCall.html).toContain('Patrick');
  });

  it('should use "there" as fallback when displayName is undefined', async () => {
    // Mock user without displayName
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'jane@example.com',
      displayName: undefined,
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Verify email was sent with "there" as firstName
    expect(sendEmailNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        subject: expect.stringContaining('there'),
      }),
    );

    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];
    expect(emailCall.html).toContain('there');
  });

  it('should use "there" as fallback when displayName is empty string', async () => {
    // Mock user with empty displayName
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: '',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Verify email was sent with "there" as firstName
    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];
    expect(emailCall.subject).toContain('there');
    expect(emailCall.html).toContain('there');
  });

  it('should extract first name correctly from multi-word displayName', async () => {
    // Mock user with multi-word displayName
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Mary Jane Watson',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Verify only first name is used
    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];
    expect(emailCall.subject).toContain('Mary');
    expect(emailCall.subject).not.toContain('Jane');
    expect(emailCall.subject).not.toContain('Watson');
  });

  it('should not send email when user has no email address', async () => {
    // Mock user without email
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: undefined,
      displayName: 'John Doe',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Verify email was NOT sent
    expect(sendEmailNotification).not.toHaveBeenCalled();
  });

  it('should handle Firebase Auth user not found error gracefully', async () => {
    // Mock getUser to throw error
    const authError = new Error('User not found');
    (admin.auth().getUser as jest.Mock).mockRejectedValue(authError);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function - should not throw
    await expect(sendWelcomeEmail(mockEvent as never)).resolves.not.toThrow();

    // Verify email was NOT sent
    expect(sendEmailNotification).not.toHaveBeenCalled();
  });

  it('should handle email sending failure gracefully', async () => {
    // Mock user data
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'john@example.com',
      displayName: 'John Doe',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Mock sendEmailNotification to fail
    const emailError = new Error('Mailgun API error');
    (sendEmailNotification as jest.Mock).mockRejectedValue(emailError);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function - should not throw (graceful error handling)
    await expect(sendWelcomeEmail(mockEvent as never)).resolves.not.toThrow();
  });

  it('should replace all template variables correctly', async () => {
    // Mock user data
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Alice',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Get the email that was sent
    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];

    // Verify all variables were replaced
    expect(emailCall.html).toContain('Alice');
    expect(emailCall.html).toContain('Patrick');

    // Verify no placeholders remain
    expect(emailCall.html).not.toContain('{firstName}');
    expect(emailCall.html).not.toContain('{founderName}');
  });

  it('should convert markdown to HTML', async () => {
    // Mock user data
    const mockUserRecord: Partial<UserRecord> = {
      uid: 'user123',
      email: 'test@example.com',
      displayName: 'Bob',
    };

    (admin.auth().getUser as jest.Mock).mockResolvedValue(mockUserRecord);

    // Create mock event
    const mockEvent = {
      params: { userId: 'user123' },
      data: null,
    };

    // Execute function by calling the handler directly
    await sendWelcomeEmail(mockEvent as never);

    // Get the email that was sent
    const emailCall = (sendEmailNotification as jest.Mock).mock.calls[0][0];

    // Verify HTML tags are present
    expect(emailCall.html).toContain('<p>');
    expect(emailCall.html).toContain('<h3>');
    expect(emailCall.html).toContain('<strong>');
  });
});
