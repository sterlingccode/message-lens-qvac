# MessageLens — QVAC Local AI App

sterlingccode MessageLens is a small local-first web app that reads a pasted message and returns its **intent, urgency, tone, a one-sentence summary, and a suggested reply**.

The inference is performed locally by QVAC through the Node.js SDK. No API key is required and the message is not sent to a cloud AI service.

## Requirements

- Node.js 22+
- npm
- A GitHub account if you want to publish the project

## Install

```bash
npm install
```

## Run

```bash
npm start
```

Then open:

```text
http://localhost:3000
```

The first analysis can take longer because QVAC may download the model it needs.

## QVAC requirement

This project declares:

- `@qvac/sdk` **0.20.0**
- `@qvac/inference` **0.20.0**

The code calls QVAC's `loadModel()` and `completion()` APIs. All AI inference is local to the machine running the app.

## Suggested 3-commit history

The bounty requires at least three commits authored by you. After creating the repo, use three meaningful commits such as:

```bash
git add .
git commit -m "feat: create MessageLens local app"

git add .
git commit -m "feat: add QVAC message analysis"

git add .
git commit -m "docs: add setup and usage instructions"
```

If your GitHub submission rules require each commit to contain a real change, make the first commit after the initial UI, the second after QVAC integration, and the third after README/license polish.
