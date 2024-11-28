# Layout Kit

**Layout Kit** is a reusable collection of flexible and lightweight view components designed to provide essential layout structures for React applications. These components have been prototyped and refined over several years across various projects.

Despite their maturity and reliability, they have not yet been migrated to their own dedicated repository.

## Features

- **Flexibility:** Components offer sensible defaults but are customizable to suit different project needs.
- **Responsiveness:** Designed to work seamlessly across devices and screen sizes.
- **Accessibility:** Prioritizes accessibility, ensuring compatibility with assistive technologies.
- **Reusable:** Components are modular and can be easily integrated into any React project.
- **Minimal Styling:** Provides only essential styles, enabling developers to customize the look and feel according to their project's design system.

## Components

### Core Layout Components

1. **`Layout`**  
   A container for the overall structure of your application. Supports children such as `Header`, `Content`, `Footer`, and `Aside`.

2. **`Header`**  
   Represents the top section of the layout, typically used for navigation or branding.

3. **`Footer`**  
   Represents the bottom section of the layout, ideal for footer links or additional information.

4. **`Content`**  
   The main area of the layout where the primary content resides. Automatically adapts when `Aside` components are present.

5. **`Aside`**  
   A sidebar component for supplementary content such as navigation menus or widgets.

### Utility Components

6. **`AutoScaler`**  
   Automatically scales its children to fit within its parent container using CSS transforms. Ideal for elements with fixed resolutions like videos or canvases.

7. **`Center`**  
   Vertically and horizontally centers its children, useful for creating focus areas or loading screens.

8. **`Cover`**  
   Overlays a `Full` element on top of the parent view, with equal dimensions and positioning of the parent. Supports click-through functionality for specific use cases (such as overlaying watermarks, etc.)

9. **`Scrollable`**  
   Enables horizontal and vertical scrolling with optional reset behavior.

10. **`Full`**  
    A container that fills its parent’s space entirely, providing a base for other layout elements.

11. **`FullViewport`**  
    Consumes the entire viewport of the browser, adjusting for dynamic viewport height (e.g., on mobile devices).

