
  # eMotion Mobile App

![eMotion Logo](https://via.placeholder.com/150) <!-- Replace with actual logo if available -->

eMotion is a mobile application designed to enhance your trekking experiences by tracking and managing emotions during outdoor adventures. Whether you're hiking solo or joining group treks, eMotion helps you log your feelings, connect with fellow trekkers, and maintain a personal history of your journeys.

## Features

- **User Authentication**: Secure login and signup with profile setup.
- **Trek Management**: Join or create treks, track active adventures.
- **Emotion Logging**: Record and monitor emotions throughout your treks.
- **Dashboard**: Overview of your trekking history and statistics.
- **Offline Support**: Queue actions for offline use with automatic sync.
- **Responsive Design**: Optimized for mobile devices using modern web technologies.

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **State Management**: React hooks and context
- **Deployment**: Ready for mobile deployment via web technologies

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Supabase account (for backend services)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd eMotion-Mobile-App
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` (if available)
   - Add your Supabase URL and API keys

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173` (or the port specified by Vite).

## Usage

- **Splash & Welcome**: Initial screens for onboarding.
- **Login/Signup**: Authenticate to access the app.
- **Dashboard**: View your trek history and stats.
- **Join Trek**: Connect with ongoing treks.
- **Active Trek**: Monitor current adventures.
- **Profile Setup**: Customize your user profile.

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components
│   └── ...
├── assets/                  # Static assets
├── styles/                  # CSS files
└── utils/                   # Utility functions
supabase/                    # Backend configuration and functions
```

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Original design from [Figma](https://www.figma.com/design/rAz9aEaD7nRyltwRY2Eqx1/eMotion-Mobile-App)
- Built with [shadcn/ui](https://ui.shadcn.com/) for UI components
- Powered by [Supabase](https://supabase.com/)

For more information, visit the [project repository](https://github.com/your-repo/eMotion-Mobile-App).
  