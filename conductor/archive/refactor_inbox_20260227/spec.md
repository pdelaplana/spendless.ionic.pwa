# Specification: Refactor AI Checkins Navigation

## Overview
This track involves refactoring the navigation for the "AI Checkins" feature. The page will be made accessible directly from the main sidebar menu under a new item labeled "Inbox". This item will use a traditional "Mail/Inbox" icon and will be positioned above the "Recurring Spending" menu item. The AI Checkins page itself will not undergo content or functional changes, only its placement within the app's routing and navigation structure.

## Functional Requirements
- **New Menu Item:** Add an "Inbox" item to the main sidebar navigation.
- **Icon:** Use a mail or inbox icon (e.g., `mailOutline` or `inboxOutline` from Ionicons) for the new menu item.
- **Positioning:** The "Inbox" menu item MUST be located immediately above the "Recurring Spending" item in the sidebar.
- **Routing:** 
  - Clicking "Inbox" navigates the user directly to the existing AI Checkins page.
  - Ensure any existing routes pointing to the old location of AI Checkins are updated or redirected appropriately.
- **No Content Changes:** The internal functionality, layout, and logic of the AI Checkins page remain unchanged.

## Non-Functional Requirements
- **Consistency:** The new menu item must match the styling and behavior of existing sidebar items.
- **Accessibility:** Ensure the new navigation item has appropriate ARIA labels and is keyboard accessible.

## Out of Scope
- Modifying the AI Checkins page content or its underlying logic.
- Adding sub-items or a collapsible group to the "Inbox" menu item.