# Mergro API

Backend for the Mergro mobile app (`~/Projects/Mergro-Mobile-App`), built on the Express + MongoDB
template described further below.

## Run locally

1. `npm install` (Node 22 per `package.json`; also verified on Node 26).
2. `cp .env.example .env` and fill in `MONGO_HOST`, `JWTSECRET` and the other values. `.env` is
   git-ignored; never commit secrets or put them in code.
3. `npm run seed` once: creates the `settings` document, the 5 Mergro roles, the reset/invite email
   templates and demo users `admin@yopmail.com`, `agent@yopmail.com`, `lead@yopmail.com` with
   password `Emp1234$` (set `SEED_USER_PASSWORD` to choose another). Safe to re-run.
4. `node server-start.js` → `http://localhost:2282/api` (health check: `/api/health-check`).

## Endpoints used by the app

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/auth/login` | `{email, password, entityType: "employee"}` → `accessToken` |
| GET | `/api/auth/me` | Bearer token → user, `brokerageName`, `onboardingCompleted` |
| POST | `/api/auth/logout` | Ends the session |
| POST | `/api/auth/forgotPassword?email=` | `{entityType: "employee"}`; emails a single-use reset link |
| POST | `/api/auth/changeRecoverPassword` | `{enEmail, token, newPassword, confirmPassword, entityType}`; also activates invited users |
| GET | `/api/onboarding` | Role, steps, completed/skipped steps, saved drafts |
| PUT | `/api/onboarding/steps/:stepId` | `{data}` (validated in `services/onboardingSteps.js`) or `{skipped: true}` |
| POST | `/api/onboarding/complete` | Needs every required step; activates an admin's brokerage |
| POST | `/api/team/invites` | Admins: `{invites: [{email, role}]}` → per-email results |

Errors follow the template: HTTP 200 with `{errorCode: "9001", errorMessage}`; expired sessions
also carry `sessionExpired: true`. Emails are only sent when the `settings` document has
`enableMails: true`, `sendGridApiKey` and `sendGridEmail`; links point at `WEB_APP_URL`.

---

[![Gitter](https://badges.gitter.im/JoinChat.svg)](https://gitter.im/linnovate/mean?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# [![MEAN Logo](http://mean.io/wp-content/themes/twentysixteen-child/images/meanlogo.png)](http://mean.io/) MEAN<sup>2</sup>

#### The Full Stack Javascript Framework.

MEAN started out as a combination of MongoDB, ExpressJS, AngularJS and Node.js.   
With <strong>MEAN<sup>2</sup></strong> we are providing the ability to mix and match additional frontend frameworks, databases and technologies.
We aim to create a robust, flexible and scalable full-stack javascript solution.

The default MEAN stack you get out of the box can work with either Angular or React and is built with the following technologies...

* [Node.js](https://nodejs.org/en/)
* [Angular4 web starter](https://github.com/AngularClass/angular-starter)
* [MongoDB](https://www.mongodb.com)
* [Express](https://expressjs.com/)
* [Innograph](https://github.com/linnovate/innograph) (uses GraphQL for schema standartization)
* [Bit](https://bitsrc.io/) - (Manages js components, services and schemas)

If you're looking for the classic angular-1.x version of mean, it has moved to this [1.x branch](https://github.com/linnovate/mean/tree/1.x). 

## Prerequisite Technologies

* [Git](https://git-scm.com/downloads)
* [MongoDB](https://www.mongodb.org/downloads)
* [Node 6.x](https://nodejs.org/en/download/)
* npm 3.x ( or yarn)

> If you have an older version of Node.js and NPM, you can use Node Version Manager [NVM](https://github.com/creationix/nvm) to use multiple node versions on your system. MEAN<sup>2</sup> only supports Node 6.x or higher versions.

## Installation

To start your application with MEAN, you need to clone the base MEAN repository from Github. This repository contains all the packages, modules and also a sample code base in order to start and make it easy to develop your application. Following the steps below will guide you to install the latest MEAN version.

```
git clone --depth 1 https://github.com/linnovate/mean.git  
cd mean
npm install  
npm start  
```
If all the packages and modules installed successfully, your default web browser will open and you can see the default MEAN application at `http://localhost:3000`. This is the default port unless you change that manually.

### Deploy on a public cloud
A pre-configured server with a stable version of MEAN.IO is available for you to start developing quickly.
Click the following button to deploy MEAN.IO on Microsoft Azure public cloud:

<a href="https://azuremarketplace.microsoft.com/en-us/marketplace/apps/meanio.mean-machine-20" target="_blank">
    <img src="http://azuredeploy.net/deploybutton.png"/>
</a>

## Additional Tools used in MEAN

* [Mongoose](http://mongoosejs.com/) - Mongoose provides a straight-forward, schema-based solution to model your application data. It includes built-in type casting, validation, query building, business logic hooks and more, out of the box.
* [Bootstrap](http://getbootstrap.com/) - Bootstrap is an open source toolkit for developing with HTML, CSS, and JS. Quickly prototype your ideas or build your entire app with our Sass variables and mixins, responsive grid system, extensive prebuilt components, and powerful plugins built on jQuery.
* [Karma](https://karma-runner.github.io/1.0/index.html) - A simple tool that allows you to execute JavaScript code in multiple real browsers. Mainly on testing purposes.
* [Protractor](http://www.protractortest.org/#/) - Protractor is an end-to-end test framework for Angular and AngularJS applications. Protractor runs tests against your application running in a real browser, interacting with it as a user would. 
* [Jasmine](https://jasmine.github.io/) - Jasmine is a behavior-driven development framework for testing JavaScript code. It does not depend on any other JavaScript frameworks
* [Istanbul](https://istanbul.js.org/) - Istanbul instruments your ES5 and ES2015+ JavaScript code with line counters, so that you can track how well your unit-tests exercise your codebase.
* [TypeScript](https://www.typescriptlang.org/) - TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.
* [Webpack](https://webpack.js.org/) - webpack is a static module bundler for modern JavaScript applications. When webpack processes your application, it recursively builds a dependency graph that includes every module your application needs, then packages all of those modules into one or more bundles.
