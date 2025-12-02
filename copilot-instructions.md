1.  Use atomic design principles to structure your components. Break down your UI into the following hierarchical levels:
    **Atoms**: The most basic building blocks of your UI, such as buttons, input fields, labels, and icons. These are indivisible components that serve as the foundation for more complex structures.
    **Molecules**: Combinations of atoms that function together as a unit. For example, a search form might consist of an input field (atom) and a button (atom).
    **Organisms**: More complex components that are made up of groups of molecules and/or atoms. An example could be a header section that includes a logo (atom), navigation menu (molecule), and search form (molecule).
    **Templates**: Page-level structures that define the layout and arrangement of organisms. Templates provide context for how organisms fit together on a page but do not contain specific content.
    **Pages**: Specific instances of templates that include real content. Pages represent the final output that users interact with and showcase how the design system is applied in practice.

2.  **Documentation**: Maintain comprehensive documentation for each level of the atomic design hierarchy. This should include usage guidelines, code examples, and best practices to ensure consistency and ease of use across the development team.

3.  **Avoid inline styles**: Refrain from using inline styles within your components. Instead, utilize CSS classes or styled-components to maintain a clean separation of concerns and promote reusability.

4.  **Avoid not delete**: Move any used files to a **trash** folder.

5.  **JS file sizes**: JS Files shouldnt have more than 1000 lines of code. If they do, break them down into smaller components.

6.  **Error handling**: Create a custom function to handle errors consistently across your application. This function should log errors, display user-friendly messages, and optionally report errors to an external monitoring service, this function should be reusable and centralized to maintain consistency and added to every component.
