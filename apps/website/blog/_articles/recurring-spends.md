---
title: Introducing Smarter Recurring Spends
description: Automation for your accounting periods - a new way to manage regular bills and subscriptions in Spendless
date: 2025-01-15
author: Patrick
tags:
  - recurring expenses
  - automation
  - budgeting
  - subscriptions
  - financial planning
---

Building a product solo means I’m constantly looking for ways to kill manual overhead—both for myself and for you.

I’ll be honest: the old way Spendless handled recurring expenses was a bit of a "v1" hack. It worked, but it wasn't elegant. I’ve spent the last few days rebuilding the engine from the ground up to make it feel like the automated assistant it should be.


## The Old Way: Good, But Not Great
Previously, Spendless relied on an `isRecurring` flag on individual spend records. When you start a new period, the app would look for these flags and copy the records over and make adjustments to the date based on when the period started.  While it worked, it was brittle and functionally, it was hard to track what was coming up and difficult to manage changes to your subscriptions over time.

## The New Way: Pure Automation
In the last release, I’ve introduced a dedicated **Recurring Spending** feature . Instead of marking individual spends as recurring, you now define your regular expenses once, and Spendless does the heavy lifting for you.

<div class="video">
<div class="iphone-frame">
<div class="iphone-screen">
<div class="iphone-status-bar">
<span class="iphone-status-time">9:41</span>
<div class="iphone-status-icons">
<div class="iphone-signal"><span></span><span></span><span></span><span></span></div>
<div class="iphone-wifi"><span></span></div>
<div class="iphone-battery"><div class="iphone-battery-body"><div class="iphone-battery-level"></div></div><div class="iphone-battery-cap"></div></div>
</div>
</div>
<video width="300" autoplay muted loop playsinline>
  <source src="https://firebasestorage.googleapis.com/v0/b/spendless-prod-24e2c.firebasestorage.app/o/website%2Fblog%2Fspendless-recurring-spends.mp4?alt=media&token=774cf75c-9ee8-46f3-838f-ac922cc3ed1e" type="video/mp4">
  Your browser does not support the video tag.
</video>
</div>
</div>
</div>

### What’s New?

### 1. Dedicated Management
Visit the new **Recurring Spending** page from the main menu to see all your active subscriptions and bills in one place. You can easily add, edit, or remove your regular expenses without affecting your historical data.

### 2. Intelligent Auto-Generation
When you create a new accounting period, the system automatically scans your recurring expenses and identifies every single occurrence that falls within your new period's dates.
*   **Weekly & Fortnightly**: Every occurrence in the range is captured.
*   **Monthly**: Perfectly timed based on your preferred day of the month.

### 3. Full Transparency with Preview
No more guessing what will be created.  When creating a new period, the dedicated "Recurring Expenses" stepwill give you live preview of the exact spend records that will be generated, including their calculated dates and amounts.

### 4. Smart Wallet Mapping
Even if your wallet IDs change between periods, Spendless is smart enough to map your recurring spends to the correct wallet by name, falling back to your default wallet if necessary. This ensures your spending is always tracked exactly where it should be.

## How to Get Started
1.  **Set Up Your Spends**: Head to the "Recurring Spending" menu and add your regular bills (Rent, Netflix, Insurance, etc.).
2.  **Create a New Period**: When it’s time for a new month or week, open the Period Modal.
3.  **Preview and Confirm**: Review the "Recurring Expenses" step to see your auto-generated spends.
4.  **Done!**: Once you create the period, all those spends are instantly added for you.

This update is all about giving you more control and less manual work. We can't wait for you to try it!



*Happy Spending (and Saving)!*

