# drizzle-next

## TypeScript Scaffolding Automation Web Framework

A CLI Tool That Generates Full Stack Apps Using Next.js, shadcn/ui, and Drizzle ORM.

- [Next.js](https://nextjs.org/) - React Framework<br>
- [shadcn/ui](https://ui.shadcn.com/) - Customizable Components<br>
- [Drizzle ORM](https://orm.drizzle.team/) - Database Migrations, ORM, and Query Builder<br>
- [Auth.js](https://authjs.dev/) - Authentication<br>
- [Zod](https://zod.dev/) - Data Validation

## Documentation

https://docs.drizzle-next.com

## Introduction

drizzle-next is a full stack automation tool for building TypeScript web applications. This is an ephemeral web framework. You do not install it into your project as a dependency. It is a command line interface code generation tool. You use it to generate customizable code for full stack projects. You can scaffold database schemas and user interfaces to use as a reference to build your own full stack application.

## Usage Examples

Create a new Next.js app using the required configurations:

```
npx drizzle-next@latest new my-app
```

Initialize drizzle-next after changing into the app directory:

```
cd my-app
npx drizzle-next@latest init
```

Scaffold a CRUD application:

```
npx drizzle-next@latest scaffold post -c title:text content:text is_draft:boolean published_at:timestamp
npx drizzle-next@latest scaffold tags -c name:text
npx drizzle-next@latest scaffold posts_tags -c post_id:references tag_id:references
```

Add an optional add-on extension:

```
npx drizzle-next@latest add stripe
npx drizzle-next@latest add tiptap
```

## License

MIT
