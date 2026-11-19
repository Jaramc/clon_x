# Clon de X

A single-page application (SPA) that clones the core features of the social network X (formerly Twitter). Users can sign up, sign in with a username or with Google, publish tweets, follow other users, and browse the tweets of the people they follow.

Built with React and Firebase as a course project.

## Features

- **Authentication**
  - Sign up with full name, username, email, and password.
  - Usernames and emails must be unique.
  - Sign in with a username (or email) and password, or with Google.
- **Tweets**
  - Publish tweets of up to 280 characters, with an optional image.
  - Each tweet is shown as `Full name, @username - date and time`, with the message below.
- **Feed**
  - Your own tweets and the tweets of the users you follow, newest first, 10 per page.
- **Follow system**
  - Follow and unfollow users.
  - Follow a user by their `@username`, with a notice when you already follow them.
- **Lists**
  - Followers and following lists, sorted alphabetically by full name, 10 users per page.
  - A **Seguir** (Follow) button for users you don't follow yet.
- **User page**
  - A user's tweets, newest first, 10 per page.
  - Their follower and following counts, and a follow button.
- **Counters**
  - Follower and following counts on the home page.
- **Common header**
  - Logo linking to home, the signed-in username, and a sign-out button.

## Tech stack

| Area | Technology |
|---|---|
| UI | React 19, React Router 7 |
| Build tool | Vite 8 |
| Backend | Firebase Authentication, Cloud Firestore |
| Code style | ESLint (Airbnb config) + Prettier |
| Version control | Git and GitHub (feature branches + pull requests) |

## Getting started

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm
- A Firebase project (see [Firebase setup](#firebase-setup))

### Install and run

```bash
git clone https://github.com/Jaramc/clon_x.git
cd clon_x
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npx eslint src --ext .js,.jsx` | Run the linter |

## Firebase setup

1. Create a project in the [Firebase console](https://console.firebase.google.com/) and register a web app.
2. **Authentication → Sign-in method**: enable **Email/Password** and **Google**.
3. **Authentication → Settings → Authorized domains**: make sure `localhost` is listed.
4. **Firestore Database**: create the database, then publish the contents of [`firestore.rules`](firestore.rules) in the **Rules** tab.
5. Copy your web app config into `src/lib/firebase.js`.

### Data model

| Collection | Document ID | Purpose |
|---|---|---|
| `users` | Firebase Auth `uid` | Public profile: `name`, `username`, `usernameLower`, `email`, `bio`, `avatar`, `createdAt` |
| `usernames` | lowercase username | Unique index that maps a username to its `uid` |
| `tweets` | auto-generated | `userId`, `username`, `name`, `text`, `imageUrl` (optional), `likes`, `createdAt` |
| `follows` | `{followerId}_{followingId}` | `followerId`, `followingId`, `createdAt` |

The security rules make sure that:
- each user can only create their own profile;
- usernames stay unique;
- tweets are at most 280 characters;
- users can only create tweets and follows as themselves.

## Project structure

```
src/
├── app/          # App root, router and protected route
├── components/
│   ├── common/   # Reusable UI: TweetCard, UserCard, FollowButton, Pagination, ...
│   └── layout/   # Header (sidebar) and main layout
├── context/      # AuthContext: session state
├── hooks/        # useAuth, usePagination, useToast
├── lib/          # Firebase init, validators, date formatting, storage helpers
├── mocks/        # Mock users, tweets and follows used as a fallback
├── pages/        # One component per route
├── services/     # Firebase access: auth, users, tweets, follows
└── styles/       # Design tokens and global styles
```

### Routes

| Path | Page |
|---|---|
| `/login` | Sign in |
| `/register` | Sign up |
| `/` or `/feed` | Home and feed |
| `/compose` | Publish a tweet |
| `/following` | Users you follow |
| `/followers` | Your followers |
| `/profile` | Your own tweets |
| `/users/:username` | A user's tweets, counters and follow button |
| `/users/:username/following` | Users that user follows |
| `/users/:username/followers` | That user's followers |

Every route except `/login` and `/register` requires a signed-in user.

## Development workflow

- Code, comments, and documentation are written in English. The UI text is in Spanish.
- Every change is made in its own branch (`feature/...`, `fix/...`, `chore/...`, `docs/...`) and merged into `dev` through a pull request.
- `main` only receives tested releases from `dev`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `refactor:`, `chore:`, `docs:`).
- Run the linter and the build before opening a pull request.

## AI assistance

The team used AI assistants during development. Every interaction is logged in [`bitacora.md`](bitacora.md), as the course requires. Each entry records:
- the date and time;
- the tool and model;
- the exact prompt;
- a summary of the response;
- the files that were created or changed.

## Team

| Member | GitHub |
|---|---|
| Ximena Jaramillo | [@Jaramc](https://github.com/Jaramc) |
| [Nicolás — full name] | [@Narcolas211](https://github.com/Narcolas211) |

Fredy ([@johnf733](https://github.com/johnf733)) contributed to the initial follow system, pagination and alphabetical sorting, and later withdrew from the course.
