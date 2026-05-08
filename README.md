# PUTMC: Portable UV Trap for Mosquito Control

![PUTMC](public/putmc.svg)

Welcome to the official web platform for the **Portable UV Trap for Mosquito Control (PUTMC)** research project, developed by the research team at **Cebu Technological University - Main Campus**.

This project is a highly interactive, 3D-integrated web application built to showcase the PUTMC trap, educate the public on its eco-friendly mosquito control mechanism, and collect community feedback.

## 🌟 Features

- **Interactive 3D Visualization**: Features an interactive 3D render of the PUTMC trap using Three.js and React Three Fiber. Users can drag, rotate, and inspect the trap in real-time.
- **Immersive UI/UX**: Built with Framer Motion for smooth page transitions, parallax scrolling, and animated background particles.
- **Community Feedback System**: A real-time comment and 5-star rating system powered by JSONbin.io, with a seamless LocalStorage fallback mechanism.
- **Secure Admin Dashboard**: A password-protected administrative area allowing researchers to moderate and delete feedback.
- **Responsive Design**: The 3D canvas and user interface automatically scale and adjust to provide a flawless experience across mobile, tablet, and desktop devices.

## 🛠️ Technology Stack

- **Frontend Framework**: [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **3D Rendering**: [Three.js](https://threejs.org/), [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber/), [@react-three/drei](https://github.com/pmndrs/drei)
- **Post-Processing (Bloom effect)**: [@react-three/postprocessing](https://docs.pmnd.rs/react-three-postprocessing)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Database / Backend**: [JSONbin.io](https://jsonbin.io/) (NoSQL JSON storage)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16.x or later recommended)
- npm or yarn

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd putmc-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory (alongside `package.json`) and configure the following variables to enable database and admin features:

```env
# JSONbin API credentials for the feedback system
VITE_JSONBIN_BIN_ID=your_jsonbin_bin_id_here
VITE_JSONBIN_API_KEY=your_jsonbin_api_key_here

# Password used to access the Admin Portal
VITE_ADMIN_PASSWORD=your_secure_password_here
```
*(Note: The application includes a `DISABLE_API` flag in `App.tsx` which can be toggled to bypass JSONbin and strictly use LocalStorage during development).*

### Running the Application

Start the Vite development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173/` by default.

### Building for Production

To create a production-ready build:

```bash
npm run build
```

---

## 📚 Comprehensive Documentation

### 1. Application Structure (`src/App.tsx`)

`App.tsx` serves as the core of the application, managing global state, routing (handled via conditional rendering), and rendering the 3D Canvas.

#### State Management
- **`comments`**: Stores an array of `CommentData` objects fetched from JSONbin.
- **Navigation States**: `showCommentsPage` and `showAdminPage` toggle the view between the main landing page, the community feedback page, and the admin portal.
- **Security**: `showPasswordModal` manages the admin login popup, validating against `VITE_ADMIN_PASSWORD`.

#### API Integration
- **Data Fetching (`useEffect`)**: On mount, the app fetches the latest comments from JSONbin using the `X-Master-Key`. If the API fails or is disabled (`DISABLE_API = true`), it falls back to parsing `putmc_comments` from `localStorage`.
- **Data Mutation (`handleCommentSubmit`, `handleDeleteComment`)**: Optimistically updates the UI state before sending `PUT` requests to overwrite the JSONbin array. It simultaneously backs up data to `localStorage`.

#### The 3D Canvas Setup
The Three.js Canvas is configured with `THREE.NoToneMapping` and `THREE.SRGBColorSpace` to ensure the customized glowing materials do not get washed out.
- **Lighting**: Utilizes ambient and directional lights tinted in `#5d3eaf` (purple) and `#ffd5c0` (orange) to integrate the model cleanly into the dark website background.
- **Post-Processing**: Implements `<EffectComposer>` with a `<Bloom>` pass to give the UV light in the trap a realistic glowing emission.

### 2. The 3D Model (`src/Putmc.tsx`)

The `Model` component is responsible for loading and rendering the GLTF/GLB asset (`/putmc.glb`).

- **useGLTF**: Automatically loads the model and separates it into nodes and materials.
- **UV Glow Material**: A custom `THREE.MeshBasicMaterial` is applied to the trap's UV light component (`nodes.ID26`). It multiplies a base purple color (`#7f54f8`) by a scalar of 10 to push it above the Bloom threshold configured in `App.tsx`. `toneMapped: false` is used to prevent the browser from dimming the intense color.
- **Animation (`useFrame`)**: The trap's internal fan (`ID19`) is bound to a React `useRef` and continuously rotated around the Z-axis frame-by-frame based on the clock delta.

### 3. Animations & UI (Framer Motion)

- **Scroll Reveal**: An Intersection Observer is used alongside CSS classes (`.reveal-on-scroll` & `.is-visible`) to trigger animations as the user scrolls down the page.
- **Page Transitions**: The `<AnimatePresence>` component from Framer Motion wraps the main application views (Home, Comments, Admin) to orchestrate smooth fade-in and slide-up transitions when navigating.
- **Parallax Particles**: A memoized array of 30 particles is generated on load. Their vertical positioning is tethered to the scroll position using Framer Motion's `useScroll` and `useTransform` hooks, creating a sense of depth.

---

## 👥 Research Team

- **Jose Marie L. Bacalso**
- **Trese Ray Bustamante**
- **Faith Andrea Egas**
- **Marx Carl Hife**
- **Dave Lawas**
- **Jhon Hervy Yu**

## 📄 License

© {Current Year} PUTMC Research Team, Cebu Technological University - Main Campus. All rights reserved.