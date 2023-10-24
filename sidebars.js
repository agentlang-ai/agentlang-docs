/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually

  Sidebar: [
    "intro",
    "installation",
    "quick-start",
    "tutorial",
    "rbac",
    {
      type: "category",
      label: "Concepts",
      items: [
        "concepts/intro",
        "concepts/data-model",
        "concepts/entity-db-mapping",
        "concepts/zero-trust-programming",
        "concepts/declarative-dataflow",
        "concepts/resolvers",
      ],
    },
    {
      type: 'category',
      label: 'Language Reference',
      items:
        [
          'language/overview',
          'language/component',
          {
            type: 'category',
            label: 'Data model',
            items:
              [
                'language/data-model/record',
                'language/data-model/entity',
                'language/data-model/relationship',
                'language/data-model/attribute',
              ],
          },
          {
            type: 'category',
            label: 'Business Logic',
            items:
              [
                'language/business-logic/event',
                'language/business-logic/dataflow',
                'language/business-logic/dataflow-patterns',
              ],
          },
          {
            type: 'category',
            label: 'Kernel',
            items:
              [
                'language/kernel/intro',
                'language/kernel/lang',
                'language/kernel/identity',
                'language/kernel/rbac',
              ]
          },
        'language/config',
        ],
    },
    {
      type: "category",
      label: "Design Studio",
      items: [
        "design-studio/intro",
        {
          type: "category",
          label: "Reference",
          items: [
            {
              type: "category",
              label: "Models",
              items: [
                "design-studio/models/creating-a-model",
                "design-studio/models/importing-a-model",
              ],
            },
            {
              type: "category",
              label: "Data Model",
              items: [
                // 'data-model/intro',
                {
                  type: "category",
                  label: "Components",
                  items: [
                    "design-studio/data-model/components/create-component",
                    "design-studio/data-model/components/delete-component",
                  ],
                },
                {
                  type: "category",
                  label: "Entities",
                  items: [
                    "design-studio/data-model/entities/create-entity",
                    "design-studio/data-model/entities/delete-entity",
                    "design-studio/data-model/entities/add-attribute",
                    "design-studio/data-model/entities/delete-attribute",
                  ],
                },
                {
                  type: "category",
                  label: "Records",
                  items: [
                    "design-studio/data-model/records/create-record",
                    "design-studio/data-model/records/delete-record",
                    "design-studio/data-model/records/add-attribute",
                    "design-studio/data-model/records/delete-attribute",
                  ],
                },
                {
                  type: "category",
                  label: "Relationships",
                  items: [
                    "design-studio/data-model/relationships/create-relationship",
                    "design-studio/data-model/relationships/delete-relationship",
                    "design-studio/data-model/relationships/add-attribute",
                    "design-studio/data-model/relationships/delete-attribute",
                  ],
                },
              ],
            },
            {
              type: "category",
              label: "Dataflow",
              items: [
                "design-studio/dataflow/navigate-to-dataflow-page",
                {
                  type: "category",
                  label: "Events",
                  items: [
                    "design-studio/dataflow/events/create-event",
                    "design-studio/dataflow/events/delete-event",
                    "design-studio/dataflow/events/add-attribute",
                    "design-studio/dataflow/events/delete-attribute",
                  ],
                },
                {
                  type: "category",
                  label: "Dataflows",
                  items: [
                    {
                      type: "category",
                      label: "Adding Dataflow Pattern",
                      items: [
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/create-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/update-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/query-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/delete-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/loop-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/match-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/event-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/reference-pattern",
                        "design-studio/dataflow/dataflows/adding-dataflow-pattern/eval-pattern",
                      ],
                    },
                    "design-studio/dataflow/dataflows/delete-dataflow-pattern",
                  ],
                },
                {
                  type: "category",
                  label: "Entity Dataflows",
                  items: [
                    "design-studio/dataflow/entity-dataflows/create-entity-dataflow",
                    "design-studio/dataflow/entity-dataflows/delete-entity-dataflow",
                  ],
                }
              ],
            },
            {
              type: "category",
              label: "Role Based Access Control",
              items: [
                "design-studio/rbac/navigate-to-security",
                "design-studio/rbac/create-role",
                "design-studio/rbac/delete-role",
                "design-studio/rbac/component-rbac",
                "design-studio/rbac/entity-rbac",
                "design-studio/rbac/relationship-rbac"
              ],
            },
          ],
        },
      ],
    },
  ],
};

module.exports = sidebars;
