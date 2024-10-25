# shadriz

Full Stack Next.js Scaffolding Framework

Build Next.js Apps Using Ruby on Rails Inspired Scaffolding Automations

- [Docs](https://travisluong.github.io/shadriz)
- [GitHub](https://github.com/travisluong/shadriz)

## Introduction

shadriz is a full stack automation tool for building TypeScript web applications. This is an ephemeral web framework. You do not install it into your project as a dependency. It is a command line interface code generation tool. You use it to generate customizable code that is typically used in full stack projects. You can also scaffold database schemas and user interfaces to use as a reference to build your own full stack application.

## Tech stack

- [Next.js](https://nextjs.org/) - React Framework
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Drizzle ORM](https://orm.drizzle.team/) - Object Relational Mapper
- [TailwindCSS](https://tailwindcss.com/) - CSS Framework
- [Auth.js](https://authjs.dev/) - Authentication
- [Stripe](https://www.stripe.com) - Payments
- [zod](https://zod.dev/) - Validation

## Installation

### Step 1: Create new project

Start by creating a new Next.js project using `create-next-app`.

```bash
npx create-next-app@latest my-app --typescript --eslint --tailwind --app --no-src-dir --no-import-alias
```

Alternatively, you can use shadriz to generate a new Next.js project using the recommended settings:

```
npx shadriz@latest new my-app
```

### Step 2: Run the CLI

Run the `shadriz init` command to setup your project.

```bash
npx shadriz@latest init
```

### Step 3: Configure project

You will be asked a few questions to configure the app.

```
? Which package manager do you want to use? npm
? Do you want to install latest packages or pinned packages? pinned
? Which database dialect would you like to use? sqlite
? Which primary key generation strategy would you like to use? cuid2
? Which authentication solution do you want to use? authjs
? Which auth providers would you like to use? github, google, credentials
? Which session strategy would you like to use? database
? Do you want to add an admin dashboard with role-based authorization? yes
? Do you want to add Stripe for payments? yes
```

Alternatively, you can also run the command non-interactively:

```
npx shadriz@latest init -p npm --latest --db-dialect sqlite -pk cuid2 --auth-solution authjs --auth-providers github,google,credentials --session-strategy database --admin --stripe
```

### Step 4: Project checklist

After initialization, you will be prompted to complete a few additional checklist items depending on the options you chose. For example:

- Update secrets in `.env.local`.
- Run database migrations.
- Set up the auth providers.
- Create a test user.
- Grant admin privilege.
- Set up Stripe.

## Scaffold

After the initial configuration is completed, you can create full stack scaffolding with the `scaffold` command.

This command will generate the user interface, database migration and schema, server actions, server components, and client components of a full stack feature.

The `-c` option takes a space-separated string of column configurations in the following format: `column_name:datatype`.

The `id` field is automatically generated by shadriz, and should be omitted from the command.

The `created_at` and `updated_at` timestamps are also automatically generated.

After scaffolding, you can review the schema and make any necessary changes before running the database migrations.

## Scaffold examples

For example, this command generates a typical blog application:

### sqlite example

```bash
npx shadriz@latest scaffold post -c title:text content:text is_draft:boolean published_at:text
```

### postgresql example

```bash
npx shadriz@latest scaffold post -c title:text content:text is_draft:boolean published_at:timestamp
```

### mysql example

```bash
npx shadriz@latest scaffold post -c title:varchar content:text is_draft:boolean published_at:timestamp
```

## Data types

**postgresql data types**

integer, smallint, bigint, serial, smallserial, bigserial, boolean, text, varchar, char, numeric, decimal, real, doublePrecision, json, jsonb, time, timestamp, date, uuid

**mysql data types**

int, tinyint, smallint, mediumint, bigint, real, decimal, double, float, serial, binary, varbinary, char, varchar, text, boolean, date, datetime, time, year, timestamp, json

**sqlite data types**

integer, real, text, boolean, bigint

## Primary key generation strategy

shadriz supports the following primary key generation strategies:

- `cuid2` - Uses the `@paralleldrive/cuid2` package
- `uuidv7` - Uses the `uuidv7` package
- `uuidv4` - Uses the `crypto` package
- `nanoid` - Uses the `nanoid` package

The strategy that you choose during the `init` process will be saved in `shadriz.config.json`. This will be used for the authentication, stripe, and scaffold schemas.

## Foreign key constraints

shadriz supports adding foreign key constraints using the following special data types:

- `references`
- `references_combobox`
- `references_select`

This will set up the Drizzle relations and the UI form controls for managing the relations.

For example, a one to many relationship where a post belongs to a category can be set up using the following scaffolds.

First, scaffold the `one` side of the relationship.

```bash
npx shadriz@latest scaffold category -c title:text
```

Second, scaffold the `many` side of the relationship using one of the references data types below:

### References Input

The standard `references` data type will use an Input component that accepts a foreign key string.

```bash
npx shadriz@latest scaffold post -c category:references title:text
```

### References Combobox

The `references_combobox` data type will use a Generic Combobox component where you can search for and select the related item.

```bash
npx shadriz@latest scaffold post -c category:references_combobox title:text
```

### References Select

The `references_select` data type will use a Generic Select component where you can select from a dropdown list of items.

```bash
npx shadriz@latest scaffold post -c category:references_select title:text
```

### Labels

For the `references_combobox` and `references_select` components, the `id` column will be used as the label. This can be changed in the code by passing in a different value for the `labelField` prop. Both components search on the `labelField`.

## File uploads

shadriz supports a `file` data type. This creates a text db column to store the file path along with a basic ui for uploads to the file system

Example:

```bash
npx shadriz@latest scaffold media -c title:text image:file video:file
```

Note: Next.js only generates routes for public files at compile time. If you need to serve the uploaded files, putting them into the `public` directory will not work in production without a new build every time.

If the uploaded files need to be served immediately after uploading, consider using a web server like nginx to serve the static files or an s3 compatible bucket instead.

In development, shadriz will put the files in `public/uploads`, so that they can be served during development. This works in development because routes are compiled without running a new build.

In production, shadriz will put the files in `/var/www/uploads`. You'll have to find a way to serve these files. For example, pointing an nginx location `/uploads/` to the `/var/www/uploads` folder. Note: This won't work in serverless environments. If you're using serverless, consider using object storage like s3.

The file URI will be saved to the database. The upload paths can be changed in `file-utils.ts`.

Example nginx config:

```
server {
      listen 80;
      server_name www.example.com;

       location /uploads/ {
          alias /var/www/uploads/;
          autoindex off;
          try_files $uri $uri/ =404;
       }

       location / {
          proxy_pass http://127.0.0.1:3000/;
       }
}
```

Tip: The Next.js `Image` component performs automatic resizing of images. This works well for static images. However, uploaded images will not show up immediately unless you use the `unoptimized` attribute. Alternatively, you can use a regular `img` tag.

## Auth

If auth was enabled during initialization, you will be able to scaffold using a `private` authorization level. These pages along with the server actions will require a user to be authenticated to access.

shadriz provides a `create-user.ts` script to create test users. This script is only generated if `credentials` is chosen as a provider.

In addition, shadriz provides a `SESSION_STRATEGY` variable in `auth.ts` that allows you to use either the `jwt` or `database` session strategy with any auth provider.

You can easily switch strategy with one line of code.

Warning: if you only use `credentials`, Auth.js will limit you to the `jwt` strategy.

### Private Dashboard

If auth was enabled, users will be able to sign in and access a user dashboard at `/dashboard`.

Any pages scaffolded with a `private` authorization level will be placed into the the `(private)` route group.

After running a private scaffold, a new link to the resource list page will be added to `private-sidebar.tsx`.

Users can sign in at `/signin`.

### Admin Dashboard

If admin was enabled, users with the `admin` role will be able to access the admin dashboard at `/admin`. The admin login is at `/admin-login`.

You will be able to scaffold using an `admin` authorization level. The pages will be put into the `(admin)` route group. These pages along with the server actions will require a user with the `admin` role to access.

After running an admin scaffold, a new link to the resource list page will be added to `admin-sidebar.tsx`.

A `grant-admin.ts` script is provided to grant users the admin role.

Additional roles can be added to the `users_roles` table according to project needs. Additional access control functions can be added to `authorization.ts` and used throughout the application.

## Add-on Extensions

Add-ons are full stack components that can be added after a project has been initialized.

An add-on extension can be added using the `add` command.

To see a list of available add-ons, run `npx shadriz@latest add -h`.

The `add` command will install all necessary UI components, npm dependencies and dev dependencies for the add-on.

Then it will write all of the necessary code for the add-on to your project.

### Stripe

```
npx shadriz@latest add stripe
```

Code will be generated for a one-time purchase, monthly subscription plan, and a dynamic pricing checkout. This includes the webhook, checkout session, and customer portal api endpoints.

A pricing page will be generated. The buttons will initiate a stripe checkout if the user is logged in. If the user is not logged in, they will redirect to the sign in page.

A `create-price.ts` script is provided to create the initial products on Stripe and on the local database. This is required before using the one-time purchase and subscription plan.

The dynamic pricing does not require creating and mapping to products on Stripe. Dynamic pricing is useful if you need to generate a custom price in the application.

The file `access.ts` contain utility functions to check user access to products and subscriptions. You can use this as you build out the paywall for the paid features.

Any of the code and content can be changed to fit your business model. The goal of this Stripe automation is to provide some common integration patterns to use as a starting point.

### Tiptap Editor

```
npx shadriz@latest add tiptap
```

This add-on will install several tiptap dependencies and write the code for a generic tiptap editor component.

After installing the add-on, you'll be able to scaffold with a `text_tiptap` data type.

For example:

```
npx shadriz@latest scaffold posts -c title:text content:text_tiptap
```

## Naming conventions

shadriz uses naming conventions as described in the table below. Number and case transformations will be applied to the generated code.

| Generated Code                     | Number           | Case         | Example                 |
| :--------------------------------- | :--------------- | :----------- | ----------------------- |
| Class names                        | singular         | pascal case  | FooBar                  |
| Database table names               | plural           | snake case   | foo_bars                |
| Database column names              | original         | snake case   | foo_bar                 |
| Database foreign keys              | singular         | snake case   | foo_bar_id              |
| Drizzle table variable names       | plural           | camel case   | fooBars                 |
| Drizzle column property names      | original         | camel case   | fooBar                  |
| Drizzle foreign key property names | singular         | camel case   | fooBarId                |
| Drizzle findMany variable names    | singular         | camel case   | fooBarList              |
| Drizzle findFirst variable names   | singular         | camel case   | fooBar                  |
| File names                         | singular, plural | kebab case   | foo-bar.ts, foo-bars.ts |
| Form input names                   | original         | camel case   | fooBar                  |
| React array props                  | singular         | camel case   | fooBarList              |
| React object props                 | singular         | camel case   | fooBar                  |
| URL pathnames                      | singular, plural | kebab case   | /foo-bar, /foo-bars     |
| Query string parameters            | original         | camel case   | ?fooBar=baz             |
| UI table and column names          | singular, plural | capital case | Foo Bar, Foo Bars       |

## Philosophy

### Technology curation

Many decisions happen at the beginnings of projects. A developer must decide on: a web framework, a database, UI component library, object relational mapper (ORM), CSS framework, authentication solution, validation library, payment solution, and other technologies relevant to the project. This can be time consuming and lead to decision fatigue. In the JavaScript world, this is known as JavaScript fatigue. It is a phenomenon describing the overwhelming array of technology choices in the JavaScript ecosystem. shadriz offers a preferred list of technologies to be used as a foundation for web app projects.

### Configuration automation

Typically, once the technologies are decided on, the next step is to wire everything together such that the application works as a cohesive whole. This means making sure the database connection is working, the UI component library is installed, and that integrations with external services are working.

Developers will often use libraries to add capabilities such as authentication, data validations, and payments. However, setting these up can be time consuming. shadriz provides an `init` command which allows you to choose from a short menu of features that you can add to your Next.js app. shadriz will write all the code necessary for the selected features.

By having a simple working example, you'll save time not having to build it entirely from scratch. You can customize the generated code to fit your project requirements. Additionally, shadriz will display a checklist of tasks to complete the initial configuration. The `init` command is intended to be run once at the beginning of a new project.

### Scaffold automation

Once the technologies are selected and configured, the next step is to begin building the interesting parts of the app. Typically, this involves a number of tasks including creating the database tables, API endpoints or server actions, user interface, layouts, pages, and web forms. This process may involve referencing documentation and writing the "boilerplate" code that the rest of the app will be built upon. This too is a time consuming process.

shadriz provides a `scaffold` command to automate the entire process of setting up the initial "boilerplate" code. You only have to provide the table name along with the columns and data types. shadriz will generate the database migration files, back end code, and front end code for the provided database schema.

What is the purpose of the scaffolded code? It is to provide a fully working full stack Create Read Update Delete (CRUD) feature that you can use as a reference to build the rest of your app. The `scaffold` command is intended to be run as many times as you need to generate full stack scaffolding. This automation is heavily inspired by the Ruby on Rails scaffold command.

## Technology and Inspiration

### Ruby on Rails

Nostalgia for Ruby on Rails style development is one motivation that led to the creation of shadriz. The `shadriz scaffold` command was modeled after the `rails scaffold` command. With a predefined set of conventions, you'll spend less time configuring things, and more time building.

### Next.js

Many of the full stack patterns used in shadriz are based on the official Next.js documentation. Next.js provides many conveniences out of the box, such as file system routing, server side rendering, code bundling, and more.

### shadcn/ui

shadcn/ui is the tool that copies and pastes beautifully styled components into your projects. Similarly, shadriz generates full stack components into your Next.js project. You have full control of the code that is generated instead of the code being hidden behind an external package.

### Drizzle ORM

Drizzle ORM provides both SQL-like and relational queries, as well as schema generation and database migrations. If you know SQL, you know Drizzle. If you prefer an ORM, you can use their query API. Drizzle always outputs 1 query.

### TailwindCSS

TailwindCSS is a CSS framework which provides reusable utility classes. TailwindCSS simplifies and improves scalability of styling by coupling markup with style.

### Auth.js

shadriz favors proven, open-source solutions that let you maintain control over your data. Similarly, with shadriz, you own not only your data but also your code.

### Zod

shadriz uses `zod` and `drizzle-zod` for data validations. Each server action that is generated by the scaffolding tool will also contain zod validations to check for the correctness of data being submitted.

## FAQ

**What can I build with shadriz?**

shadriz is suitable for full stack monolithic server side rendered web applications. It is a full stack tool kit that automates away the time consuming things you need to do at the start of a new full stack Next.js project, saving you days worth of boilerplate coding.

**What is a scaffold?**

A scaffold is all of the starter code, including the UI and data layer, that is required to have a fully functional CRUD application. Scaffolding was popular in MVC frameworks such as Ruby on Rails. With scaffolding, you spend less time looking things up because there is a point of reference to build upon. This frees up time and energy to focus on building the interesting parts of the app.

**Why not a web framework?**

shadriz differs in that it provides an opinionated abstraction for creating a solid starting point for app development. shadriz works by writing code to a new Next.js project. The code is written to your Next.js repo and you can review it before committing to anything.

**Why not a boilerplate?**

Boilerplates go obsolete fast. Shadriz offers a `latest` option to install latest dependencies. This means you'll get the latest version of Drizzle ORM, shadcn/ui components, Auth.js, Stripe, TailwindCSS, Zod, and more. If you prefer a more stable version, choose the `pinned` option during initialization and you'll get the pinned versions of each top-level dependency. The pinned versions can be found in `package-shadriz.json` in the shadriz GitHub repo.

## Author

Built by [travisluong](https://www.travisluong.com).

## License

MIT
