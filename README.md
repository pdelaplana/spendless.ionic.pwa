# Spendless - A Mindful Spending Tracker

<div align="center">
  <img src="public/favicon.png" alt="Spendless Logo" width="120" />
  <h3>Track your expenses mindfully</h3>
</div>

## Overview

Spendless is a Progressive Web App (PWA) built with Ionic and React that helps users track their expenses and income in a mindful way. It's designed to provide a seamless financial tracking experience across all devices, even when offline.

## Features

- **Expense Tracking**: Log and categorize your spending
- **Income Management**: Track your income sources
- **Account Management**: Manage multiple accounts and currencies
- **Offline Capabilities**: Full PWA support for offline usage
- **Data Export**: Export your financial data
- **Multi-language Support**: Available in English and Portuguese
- **Responsive Design**: Works on mobile, tablet, and desktop

## Tech Stack

- **Frontend**: React, TypeScript, Ionic Framework
- **State Management**: React Query
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Build Tools**: Vite, PWA Plugin
- **Deployment**: Firebase Hosting with GitHub Actions CI/CD
- **Monitoring**: Sentry for error tracking
- **Testing**: Vitest for unit tests, Cypress for E2E testing
- **Localization**: i18next for multi-language support

## Progressive Web App (PWA)

This application is built as a PWA, which means:

- It can be installed on mobile and desktop devices
- Works offline or with poor network connectivity
- Fast loading with service worker caching
- Responsive across all device types
- Push notifications support (where available)

## PWA Asset Generation Guide

### Recommended Approach: Pre-commit Generation

This project includes PWA (Progressive Web App) capability, which requires various icon sizes and splash screens. We recommend generating these assets locally before committing changes:

```bash
npm run generate-pwa-assets
```

Only regenerate PWA assets when:

You change the app's favicon or logo
You modify the PWA theme colors
You update the app's name or description in the manifest
Alternative: CI/CD Pipelin

Assets are generated from public/favicon.png using the configuration in the generate-pwa-assets script in package.json.
