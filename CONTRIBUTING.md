# Contributing to infura-mcp

Thank you for considering contributing to **infura-mcp**! 🎉  
Whether it’s code, documentation, bug reports, or new ideas, your contributions help make infura-mcp better for everyone.

---

## Code of Conduct

We aim to maintain a **friendly, welcoming, and inclusive** community.  
Please be respectful, collaborative, and constructive.  

See [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for details.

---

## How to Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/deflang/infura-mcp.git
cd infura-mcp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a branch

- Always branch from **main**
- Use descriptive [branch names](https://conventional-branch.github.io)

```bash
git checkout -b feature/add-uniswap-query
git checkout -b fix/usdc-filter-bug
```

### 4. Make changes

- Follow existing TypeScript style (use eslint and prettier).
- Add unit tests in [tests](./tests) folder for any new functionality.
- Validate query plans against /core/schemas/queryPlan.schema.json
- Ensure your code passes linting and type checks

```bash
npm run lint
npm run typecheck
```

### 5. Run tests

```bash
npm test
```
- All tests must pass before submitting a PR.

### 6. Commit guidelines

Use clear, concise [commit messages](https://www.conventionalcommits.org/en/v1.0.0/):

### 7. Submit a PR

1. Push your branch to your fork

```bash
git push origin feature/add-uniswap-query
```

2. Open a PR against main in the main repository.
3. Include a **clear description** of your changes and any relevant screenshots or examples.
4. Make sure CI passes and tests are included if applicable.

## Documentation

- Update README.md or /docs if your changes introduce new features or usage patterns.
- Add examples in /examples if applicable, so users can copy-paste quickly.

## Reporting Issues

- Use GitHub Issues for bugs, feature requests, or questions.

- Include:
    1. Steps to reproduce the problem
    2. Relevant code snippets or queries
    3. Screenshots or JSON examples if applicable

## Licensing

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
This ensures that all contributions remain free, open-source, and usable by the community, just like the rest of infura-mcp.