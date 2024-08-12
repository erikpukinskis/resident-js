**Resident** is an authentication framework for Node.js applications.

ResidentJS is a spiritual successor to [PassportJS](https://passportjs.org/), addressing some limitations that Password can't or won't address:

- 🔠 Resident is typed
- ⏳ Resident is async
- 🗂️ Resident is backend agnostic
- 💡 Resident is opinionated about best practices
- 🔒 Resident bundles a core set of auth strategies

More details in the [Why](#why) below.

**Table of contents**

- [Getting started](#getting-started)
- [Why](#why)
  - [Resident is typed](#resident-is-typed)
  - [Resident is async](#resident-is-async)
  - [Resident is backend agnostic](#resident-is-backend-agnostic)
  - [Resident is opinionated about best practices](#resident-is-opinionated-about-best-practices)
  - [Resident bundles a core set of auth strategies](#resident-bundles-a-core-set-of-auth-strategies)
- [Development](#development)
  - [Install and run the tests](#install-and-run-the-tests)
  - [Build for distribution](#build-for-distribution)
  - [Use yalc to test locally](#use-yalc-to-test-locally)

# Getting started

Install it via npm, yarn, pnpm, or bun:

```
npm add resident
yarn add resident
pnpm add resident
bun add resident
```

First you'll need to decide what data is going to get serialized into your session payload. This is data which will always be instantly available on both the client and server, without doing any database reads:

```ts
type SessionPayload = {
  email: string
  organizationId: string
}
```

The main `Resident` instance is typically created once per request:

```ts
const resident = new Resident<SessionPayload>({
  secrets: ["secret generated with openssl rand -hex 32"],
  onSession(token) {
    res.cookie("session", token)
  },
})
```

You won't do much with the `Resident` instance, because most authentication activities will go through specific "strategies" like a `PasswordStrategy`. However you will use the `Resident` instance to authenticate based on the session token:

```ts
// Authenticating from a session token stored in the cookies:
const sessionFromToken = resident.authenticateFromToken(req.cookies["session"])
```

Let's set up our first authentication strategy, the `PasswordStrategy`:

```ts
const passwordStrategy = new PasswordStrategy({
  resident,
  authenticate({ username: email, password }) {
    const user = await db.User.findByEmail(email)
    const hashAttempt = PasswordStrategy.hashPassword(password, user.salt)

    if (hashAttempt !== user.hashedPassword) {
      return {
        email,
        organizationId: user.organizationId,
      }
    } else {
      return null
    }
  },
})
```

That is assuming you saved your user with a hashed password and its salt. Resident will help you do that:

```ts
function createUser({ email, password, organizationId }) {
  const salt = await PasswordStrategy.generateSalt()
  const user = await db.User.create({
    email,
    hashedPassword: await PasswordStrategy.hashPassword(password, salt)
    organizationId,
  })
}
```

After you did that, you could authenticate the user with the email and password, or you could authenticate them directly:

```ts
await resident.authenticate({
  email: "someone@example.com",
  organizationId,
})
```

It's up to you how you organize this kind of configuration code, but an idiomatic way to set it up in Express might be to create a middleware:

```ts
app.use((req, res, next) => {
  const resident = new Resident(
    ...
  )
  const passwordStrategy = new PasswordStrategy({
    resident,
    ...
  })
  req.resident = resident
  req.passwordStrategy = passwordStrategy
})
```

With the `passwordStrategy` instantiated you can authenticate a user based on their username and password:

```ts
app.post("/login", (req, res) => {
  const sessionPayload = req.passwordStrategy.authenticateFromPassword({
    username: req.body.username,
    password: req.body.password,
  })

  if (!sessionPayload) {
    throw new Error("Invalid username or password")
  }

  return sessionPayload
})
```

# Why

Resident is a spiritual successor to Passport, addressing some limitations that Password can't or won't address:

### Resident is typed

It's written in TypeScript, and strictly typed. The Passport maintainer [has no interest](https://github.com/jaredhanson/passport/discussions/961#discussioncomment-4662393) in migrating Passport to TypeScript.

### Resident is async

The Resident APIs use async/await rather than callbacks.

### Resident is backend agnostic

The Passport API is deeply intertwined with the concept of middleware. Every interaction your application has with Passport must pass via some kind of REST middleware. So for example, if you want some of your application code to authenticate a specific user (say for masquerading) or request new scopes from a specific identity provider, you must run those requests through a REST middleware. Because REST is untyped, this means you have no guarantees at the code level that your application is set up correctly.

Resident, in contrast, is backend agnostic. The APIs are just normal everyday JavaScript, which can be called from anywhere in your Node application, whether you're using REST, or GraphQL, or tRPC or whatever.

On the one hand, this means you will need to maintain a bit more boilerplate to wire up all of the webhooks different identity providers need. On the other hand, this makes your code far more debuggable. There's no ✨magic✨ here, just good old fashioned, strictly typed JavaScript APIs.

### Resident is opinionated about best practices

Passport will let you store and manage passwords, cookies, etc however you like. You can use JWTs or not. You can use secure cookies or not. You can salt your passwords... or not. Although Resident is not opinionated about how your application is set up, it does takes a "batteries included" approach to authentication.

Included in the box are:

- Password salting and hashing
- Secure cookie management
- Session serialization

If there's a security-critical feature needed to build a secure, authenticated Node application, we'll build it and test it and package it.

### Resident bundles a core set of auth strategies

Passport doesn't ship with any authentication strategies, it lets you install whichever strategies you like, published by whoever you choose. This has allowed an ecosystem of strategies to evolve around it, so that it can support every identity scheme under the sun.

However, it also means that every strategy uses slightly different configuration options, is documented slightly differently, and maintained differently. And there are no guarantees that the maintainers of these different packages are trustworthy.

Resident bundles a core set of auth strategies, so that you can get quickly up and running with the most common identity providers.

# Development

### Install and run the tests

```
git clone git@github.com:erikpukinskis/resident-js.git
cd resident-js
yarn install
yarn test
```

### Build for distribution

```
yarn build
```

### Use [yalc](https://github.com/wclr/yalc) to test locally

From the `resident-js/`...

```
yalc add
```

Then in your application folder:

```
yalc add resident
```
