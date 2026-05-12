# DVA CLIK Research Notes

## Sources Used

- CLIK public site source at `https://clik.dva.gov.au/`.
- DVA public site source at `https://www.dva.gov.au/`.
- DVA article, "Leveraging technology to better support the veteran community", published 4 November 2025.
- Agileware portfolio case study, "Department of Veterans' Affairs".
- Candidate response form supplied by the user.

## Findings

CLIK is publicly identified as a Drupal 10 + GovCMS site. Its theme debug output shows a custom theme path under `themes/custom/custom/iconagency`, with Bootstrap Barrio contrib templates and Twig page, block, menu and field templates.

The main DVA website is also Drupal 10 + GovCMS. Its public source shows a Bootstrap 5 subtheme named `dva_b5subtheme`, Bootstrap Icons, Layout Builder-style output and a feedback webform.

The main DVA site loads an AI assistant bundle from `https://dva-ai-assets.dva.gov.au/dist/dva-ai-widget.umd.js`. Inspection of the public bundle shows React runtime code and custom elements such as `qa-drawer`, `qa-search-box` and `qa-landing-search-box`.

This means the strongest public conclusion is:

- Drupal/Twig/Bootstrap for the public DVA and CLIK page shells.
- A packaged React-based web component for the DVA AI assistant.
- No public evidence that the core CLIK site shell is Vue, React or Angular.

## Role-Relevant Implications

The prototype should not over-index on SPA development. It should demonstrate:

- Drupal 10/GovCMS literacy.
- Custom theme and Twig awareness.
- Migration and structured publishing workflow.
- Taxonomy and metadata design for policy libraries.
- Accessibility and content-quality governance.
- AI search/chatbot content-readiness, because CLIKChat depends on current and accurate public policy content.
- Pragmatic integration planning with DVA's broader platform patterns.
