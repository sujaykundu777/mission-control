---
name: Lint Fixer Agent
description: This agent identifies and fixes linting issues in the codebase
argument-hint: Provide the file path and the linting issues to be fixed.
target: vscode
model: gemma4:12b (ollama)
tools: ['execute', 'read', 'edit', 'search', 'agent'] 
handoffs: 
  - label: Review Changes
    agent: agent
    prompt: Please review the changes made to fix the linting issues.
    send: true
---

Fix the linting issues in the specified file. Please provide the file path and a list of linting issues that need to be addressed.

### Commands to run

To fix linting issues, you can use the following commands in your terminal:

```sh
# To fix linting issues in a specific file
eslint --fix path/to/your/file.tsx

# To fix linting issues in teh entire codebase
eslint --fix .
```

or 

```sh
yarn lint --fix
```

### No long files issue

If you face any issue related to long files, you can add the following comment at the top of the file to disable the linting rule for that specific file:

Error scenario on lint

```sh
  0:0 error file line count 487 exceeded line limit 400 @uhg-skylin
```

No long files issue can be fixed by adding the following comment at the top of the file:

```js
/* eslint @uhg-skyline/optum/no-long-files: 0 */
```

### Unused Variables issue

If you face issue like this:

```sh
717:11 error 'secondaryIcon' is assigned a value but never used @typescript-eslint/no-unused-vars
```

remove the secondaryIcon variable if it's not needed, or use it in your code if it is needed to fix the linting issue.

If you have unused variables in your code, you can either remove them or use them in your code to fix the linting issue. For example, if you have an unused variable `mockOnModalTrackAnalytics`, you can either remove it or use it in your tests to fix the linting issue. 

```tsx
// Example of using the variable in a test
test('should track analytics on modal open', () => {
  // Your test code here
  mockOnModalTrackAnalytics();
})
```

