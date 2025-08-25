# @cosva-lab/api-commons

> Common utilities and helpers for Node.js/TypeScript projects at Cosva Lab.

---

## Features

- Utility functions for environment variable management
- AWS Secrets Manager integration (inject secrets into `process.env`)
- UUID helpers
- TypeScript-first, fully typed

## Installation

```bash
npm install @cosva-lab/api-commons
```

## Usage

### Injecting AWS Secrets into Environment Variables

```typescript
import { injectSecrets } from '@cosva-lab/api-commons';

(async () => {
  await injectSecrets('arn:aws:secretsmanager:region:account-id:secret:your-secret-id');
  // Now process.env contains your secrets
})();
```

## Scripts

- `npm run build` – Build the TypeScript sources
- `npm test` – Run tests with Jest
- `npm run lint` – Lint the codebase

## Contributing

Contributions, issues and feature requests are welcome!  
Feel free to open an [issue](https://github.com/cosva-lab/cosva-api-commons/issues) or submit a pull request.

## License

MIT © [Eduard Castellanos](https://github.com/eduardcastellanos)
