# Grants Management System

A comprehensive web application for managing grant applications, projects, and funding workflows. Built with modern web technologies for efficiency and scalability.

## Features

- **Grant Application Management**: Submit and track grant applications
- **Project Lifecycle Management**: Monitor projects from initiation to closure
- **Role-based Access Control**: Different interfaces for applicants, reviewers, and administrators
- **Document Management**: Upload and manage project documents and reports
- **Milestone Tracking**: Track project milestones and deliverables
- **Partner Management**: Manage project partnerships and collaborations
- **Fund Requisition**: Handle funding requests and approvals
- **Review Workflows**: Streamlined review and approval processes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **State Management**: React Query
- **Routing**: React Router
- **Form Management**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```sh
git clone <repository-url>
cd grants-management-system
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

4. Open [http://localhost:8080](http://localhost:8080) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

- **Production URL**: `https://[your-username].github.io/grants-management-system/`
- **Automatic builds**: Configured via GitHub Actions workflow
- **Direct URL access**: Supports direct navigation to any route

Every push to the `main` branch triggers an automatic deployment.

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API services
├── data/               # Mock data files
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── context/            # React context providers
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.