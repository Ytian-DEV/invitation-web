<!-- PROJECT BADGES -->
<!-- Add build status, version, or license badges here if available -->

# Birthday Celebration Invitation Website

An interactive, modern invitation web app for special events, inspired by a Figma design. Features a beautiful landing animation, RSVP form, and event details, built with React, Vite, Tailwind CSS, and Supabase serverless functions.

---

## ✨ Features

- Animated envelope landing page and invitation reveal
- Responsive, mobile-first UI with custom design system ([see guidelines](src/guidelines/Guidelines.md))
- RSVP form with real-time validation and Supabase backend integration
- Countdown timer to event
- Accessible, themeable UI components (see [`src/components/ui/`](src/components/ui/))
- Serverless backend logic (see [`src/supabase/functions/server/`](src/supabase/functions/server/))

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation
```sh
git clone <this-repo-url>
cd invitation-web
npm install
```

### Development
```sh
npm run dev
# App runs at http://localhost:3000
```

### Production Build
```sh
npm run build
```

---

## 🛠️ Project Structure

- `src/App.tsx`, `src/main.tsx`: App entry and bootstrap
- `src/components/`: Feature components (e.g., `EnvelopeLanding`, `InvitationContent`, `RSVPForm`)
- `src/components/ui/`: Reusable UI primitives (buttons, dialogs, etc.)
- `src/styles/globals.css`: Tailwind and custom global styles
- `src/guidelines/Guidelines.md`: Design system and UI rules
- `src/supabase/functions/server/`: Serverless backend endpoints (Hono, Supabase)
- `src/utils/`: Utility functions and Supabase config

---

## 🧑‍💻 Usage Example

To add a new RSVP field, edit [`src/components/RSVPForm.tsx`](src/components/RSVPForm.tsx) and update the backend handler in [`src/supabase/functions/server/index.tsx`](src/supabase/functions/server/index.tsx).

For new UI elements, use or extend components in [`src/components/ui/`](src/components/ui/), following the [design guidelines](src/guidelines/Guidelines.md).

---

## 📚 Documentation & Support

- [Design guidelines](src/guidelines/Guidelines.md)
- [Attributions](src/Attributions.md)
- For questions or help, open an issue in this repository.

---

## 🤝 Maintainers & Contributions

- Maintained by: [Ytian-DEV](https://github.com/Ytian-DEV)
- Contributions welcome! Please follow the [design guidelines](src/guidelines/Guidelines.md) and open a pull request.
- No `CONTRIBUTING.md` yet—add one if you want to formalize contribution rules.

---

## 📝 License

See [LICENSE](LICENSE) for license details. Some UI and images are used under MIT and Unsplash licenses (see [Attributions](src/Attributions.md)).
  