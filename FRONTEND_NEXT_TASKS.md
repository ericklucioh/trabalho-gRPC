# Frontend Next Tasks

## Purpose

- Build the browser-facing app in Next.js.
- Expose a single screen for the MVP.
- Keep the browser UI ready for a future REST/BFF layer.
- Use a typed adapter boundary now, so the real gRPC-backed transport can be plugged in later.
- Keep WebSocket optional and out of the current MVP implementation.

## Scope

- One page only.
- One tool selection flow.
- One configure button.
- One input area.
- One result area.
- One status area.
- One error display area.
- No authentication in this phase.
- No multi-page routing in this phase.

## Product Goal

- Let the user load the tool list.
- Let the user choose `json2yaml` or `yaml2json`.
- Let the user configure the selected tool.
- Simulate receiving the WASM module in the browser.
- Execute the conversion locally through a replaceable runtime adapter.
- Show the configuration flow in the demo without requiring the Go backend yet.

## UI Responsibilities

- Render a clean landing view.
- Explain that the app is a WASM tool storefront.
- Present the available tools as cards or list items.
- Accept user input through a focused form.
- Display validation feedback before submission.
- Show loading while the request is in flight.
- Render success output in a readable format.
- Render failure output with actionable details.
- Show the `tool configurada` state after module load.

## Page Layout Tasks

- Create the page shell.
- Add a top header with project identity.
- Add a concise subtitle for the current tool.
- Add the tool list section.
- Add the configure button section.
- Add the input form section.
- Add the response section.
- Add a status badge area.
- Add an error callout area.
- Keep spacing consistent and simple.

## Visual Rules

- Prefer a clear visual hierarchy.
- Use one font family consistently.
- Avoid default boilerplate styling.
- Keep the layout stable on mobile and desktop.
- Make the primary action obvious.
- Make the result area visually distinct.
- Use restrained color accents.
- Do not add decorative complexity that hides the workflow.

## Component Breakdown

- Build a page component.
- Build a tool list component.
- Build a configure button component.
- Build an input form component.
- Build an output preview component.
- Build a loading indicator component.
- Build an error banner component.
- Build a status label component.

## Form Tasks

- Support text input for JSON or YAML content.
- Validate that the field is not empty.
- Validate JSON or YAML shape before send when possible.
- Show inline validation messages.
- Disable submit while request is running.
- Reset previous output on new submission.
- Preserve the latest input between rerenders.

## State Tasks

- Store the current tool selection.
- Store the current input text.
- Store loading state.
- Store the response payload.
- Store the last error message.
- Store the request timestamp.
- Store the request duration.
- Store the configured tool state.
- Avoid hidden state in helper modules.

## Data Flow Tasks

- Transform form values into request DTOs.
- Serialize request DTOs explicitly.
- Send browser requests to `Next` endpoints.
- Await the browser-facing response.
- Map the response into view state.
- Keep network details out of presentation components.
- Keep view formatting out of transport adapters.

## Browser Transport Tasks

- Define a typed browser API boundary.
- Keep request creation in one module.
- Keep response parsing in one module.
- Convert transport errors into UI-safe messages.
- Separate message mapping from React components.
- Make the adapter replaceable in tests.
- Avoid calling backend logic directly from components.
- Keep the current implementation mock-driven until the backend exists.

## Next Server Tasks

- Use the app router unless there is a reason not to.
- Keep interactive pieces as client components.
- Put gRPC calls in route handlers or server utilities later, when the backend is available.
- Split server and client responsibilities explicitly.
- Avoid mixing page layout and transport concerns.
- Keep Next-specific logic thin.

## Validation Tasks

- Reject blank input before request submission.
- Reject malformed JSON before request submission.
- Reject malformed YAML before request submission.
- Show the exact invalid value when possible.
- Keep validation messages short and specific.
- Surface backend validation failures separately.

## Error Handling Tasks

- Handle network failures.
- Handle invalid backend responses.
- Handle timeout scenarios.
- Handle unsupported content.
- Show retry guidance when appropriate.
- Keep error wording honest and specific.

## Result Rendering Tasks

- Render JSON responses in a formatted block.
- Render YAML responses in a readable block.
- Preserve whitespace in code-style output.
- Show a copy button if useful.
- Show metadata such as duration if available.
- Keep the success area visible after submit.

## Accessibility Tasks

- Label every input element.
- Ensure keyboard-only submission works.
- Ensure focus is visible.
- Keep contrast readable.
- Associate errors with the relevant field.
- Avoid color-only status cues.

## Performance Tasks

- Keep the page bundle small.
- Avoid large client-side dependencies.
- Render the static shell quickly.
- Avoid unnecessary rerenders.
- Keep state updates minimal.
- Avoid expensive formatting on every keystroke.

## Typing Tasks

- Use explicit TypeScript types.
- Avoid `any`.
- Type request and response models.
- Type component props.
- Type error objects from adapters.
- Type status transitions.

## Module Boundaries

- Keep UI components separate from transport code.
- Keep adapter code separate from browser view models.
- Keep validation logic separate from rendering.
- Keep formatting helpers separate from state logic.

## Suggested File Split

- `app/page.tsx`
- `app/api/tools/route.ts`
- `app/api/tools/[toolId]/prepare/route.ts`
- `components/tool-card.tsx`
- `components/tool-input-form.tsx`
- `components/tool-output-panel.tsx`
- `components/request-status-badge.tsx`
- `lib/go-grpc-client.ts`
- `lib/browser-wasm-runtime.ts`
- `lib/request-validation.ts`
- `lib/output-formatters.ts`

## Build Tasks

- Configure the Next.js app.
- Configure TypeScript strictness.
- Configure linting.
- Configure formatting.
- Configure environment variables.
- Configure local dev scripts.

## Environment Tasks

- Define the Go gRPC endpoint.
- Define the artifact base URL.
- Define the optional WebSocket URL.
- Keep defaults documented.
- Avoid hardcoding local endpoints in components.

## Single Page Behavior

- Treat the page as the demo surface.
- Keep navigation unnecessary for now.
- Present two tools only.
- Make the workflow linear from selection to result.
- Keep future catalog expansion in mind without implementing it now.

## Demo Flow Tasks

- Open the page.
- Load the tool list.
- Pick `json2yaml`.
- Click `configurar tool`.
- Show the loading state.
- Show the `tool configurada` state.
- Paste text.
- Show the converted result.
- Repeat with `yaml2json`.

## Implementation Order

- Create the page shell.
- Create typed state and request models.
- Create validation helpers.
- Create the server-side gRPC adapter.
- Create the browser WASM runtime adapter.
- Create the form component.
- Create the result component.
- Connect all pieces in the page.

## Test Tasks

- Test form validation.
- Test request state transitions.
- Test successful rendering.
- Test failure rendering.
- Test keyboard submission.
- Test mobile layout.
- Test adapter mapping.

## Definition Of Done

- The page loads without errors.
- The tool list loads from the browser-facing API.
- The configure flow reaches the Go backend through `Next`.
- The WASM module downloads and instantiates in the browser.
- The response renders on screen.
- Errors are visible and understandable.
- The code remains split by responsibility.

## Task List

- Define the page shell.
- Define the visual hierarchy.
- Define the input contract.
- Define the output contract.
- Define the error contract.
- Define the loading contract.
- Define the transport boundary.
- Define the validation boundary.
- Define the formatting boundary.
- Define the status boundary.
- Implement the page container.
- Implement the form component.
- Implement the output component.
- Implement the status badge.
- Implement the browser transport adapter.
- Implement the server-side gRPC adapter.
- Implement JSON and YAML validation.
- Implement error mapping.
- Implement response mapping.
- Implement copy behavior if useful.
- Implement empty-state messaging.
- Implement loading state messaging.
- Implement retry handling.
- Implement responsive layout.
- Implement keyboard handling.
- Implement accessibility labels.
- Implement tests for core behavior.
- Review module boundaries.
- Review typing completeness.
- Review error surfaces.
- Review visual clarity.
- Review demo readiness.
