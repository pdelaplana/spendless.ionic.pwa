export interface FeedbackFormData {
  board_slug: string;
  type: 'feedback' | 'bug' | 'improvement';
  title: string;
  description: string;
  user_email?: string;
}

export function useSendFeedback() {
  const sendFeedback = async (data: FeedbackFormData): Promise<void> => {
    const response = await fetch(`${import.meta.env.VITE_PRODUCTQUARRY_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send feedback: ${response.statusText}`);
    }
  };

  return { sendFeedback };
}
