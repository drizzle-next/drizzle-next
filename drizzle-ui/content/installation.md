# Installation

Drizzle UI was built specifically for use by the full stack Drizzle Next framework. The components were extracted from the source code of Drizzle Next and made available as a standalone package. The components can be copied and pasted or it can be installed as a dependency for a Next.js project. This library is designed for Next.js as some of the components use Next.js specific hooks.

There are three ways to install Drizzle UI.

## Option 1: Use Drizzle Next

Drizzle UI is the default UI solution for Drizzle Next. There is nothing extra you need to do other than follow the [installation instructions here](https://www.drizzle-next.com/installation.html) for Drizzle Next. This is the recommended way to use Drizzle UI. However, if you want to use Drizzle UI without Drizzle Next, there are a few ways to do a standalone installation as outlined below.

## Option 2: Drizzle UI CLI

Using the Drizzle UI CLI is the fastest way to copy and paste components into your project.

Step 1: Create a new Next.js project

```bash
npx create-next-app@latest my-app --typescript --eslint --tailwind --app --no-src-dir --no-import-alias --turbopack
```

Step 2: Run the init command

```bash
npx drizzle-ui@latest init
```

Step 3: Add components

```bash
npx drizzle-ui@latest add alert avatar button
```

Alternatively, you can manually copy and paste the components on this website into your `components/ui` folder.

## Option 3: Install as dependency

This is an experimental option that installs drizzle-ui as a dependency. This is the classic UI library approach. You can still style your components by adding extra classes, however you won't be able to change the underlying implementation, like adding new variants and functionality. If you don't care about customization, this option might be suitable.

Step 1: Create a new Next.js project

```bash
npx create-next-app@latest my-app --typescript --eslint --tailwind --app --no-src-dir --no-import-alias --turbopack
```

Step 2: Install drizzle-ui

```bash
npm i drizzle-ui
```

Step 3: Copy `tailwind.config.ts` into your project

```ts
import type { Config } from "tailwindcss";
import color from "tailwindcss/colors";

export default {
  darkMode: "class",

  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/drizzle-ui/dist/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: color.zinc,
        muted: color.gray,
        danger: color.red,
        info: color.blue,
        success: color.green,
        warning: color.yellow,
      },
    },
  },
  plugins: [],
} satisfies Config;
```

Step 4: Use components

You can now import components from `drizzle-ui`.

```tsx
import { Button } from "drizzle-ui";

export function ButtonDemo() {
  return (
    <div className="flex gap-5">
      <Button variant="primary">Primary</Button>
      <Button variant="muted">Muted</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="info">Info</Button>
    </div>
  );
}
```
