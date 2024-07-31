**Resident** is an authentication framework for Node.js applications.

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

## Installation

[coming soon]

## Development

### Run the tests

```
yarn test
```
