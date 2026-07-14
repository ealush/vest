// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import path from 'path';
import { themes } from 'prism-react-renderer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function badgeLink(url, badge, name) {
  return `<a href="${url}" class="header-badge" target="_blank">
    <img src="${badge}" alt="${name}"/>
  </a>`;
}

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/',
  favicon: 'favicon.ico',
  title: 'Vest',
  tagline:
    'TypeScript validation-state framework for complex forms and progressive workflows.',
  url: 'https://vestjs.dev',
  onBrokenLinks: 'throw',
  markdown: {
    // @ts-ignore
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  organizationName: 'ealush', // Usually your GitHub org/user name.
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: path.resolve(__dirname, './sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/ealush/vest/edit/latest/website/',
          lastVersion: 'current',
          versions: {
            '4.x': {
              label: '4.x',
              banner: 'unmaintained',
            },
            '5.x': {
              label: '5.x',
            },
            current: {
              label: '6.x',
              banner: 'none',
            },
          },
        },
        pages: {
          path: 'src/pages',
          include: ['**/*.{js,jsx,ts,tsx,md,mdx}'],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
          ],
          mdxPageComponent: '@theme/MDXPage',
          rehypePlugins: [],
          beforeDefaultRemarkPlugins: [],
          beforeDefaultRehypePlugins: [],
        },
        theme: {
          customCss: path.resolve(__dirname, './src/css/custom.css'),
        },
        gtag: {
          trackingID: 'G-M420W03G2K',
          anonymizeIP: true,
        },
      }),
    ],
  ],

  projectName: 'vest', // Usually your repo name.

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/og.jpg',
      metadata: [
        {
          name: 'keywords',
          content:
            'vest, validation state, stateful validation, progressive validation, typescript form validation, async form validation, standard schema, javascript validations, unit tests, enforce, react validation, vue validation, svelte validation, angular validation, schema validation, framework agnostic',
        },
        {
          name: 'description',
          content:
            'Vest validates what changed, remembers what already passed, and prevents stale asynchronous validation results.',
        },
      ],

      colorMode: {
        defaultMode: 'light',
        disableSwitch: false,
      },
      navbar: {
        title: 'Vest',
        logo: {
          alt: 'Vest Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            position: 'left',
            sidebarId: 'tutorialSidebar',
            label: 'Getting Started',
          },
          {
            type: 'doc',
            docId: 'api_reference',
            position: 'left',
            label: 'API Reference',
          },
          {
            type: 'docsVersionDropdown',
            position: 'left',
          },
          {
            position: 'right',
            type: 'html',
            value: badgeLink(
              'https://www.npmjs.com/package/vest',
              'https://badgen.net/npm/v/vest?icon=npm&scale=1.2&color=red&label',
              'npm-badge',
            ),
          },
          {
            position: 'right',
            type: 'html',
            value: badgeLink(
              'https://github.com/ealush/vest',
              'https://badgen.net/github/stars/ealush/vest?scale=1.2&color=yellow&icon=github',
              'github-badge',
            ),
          },
          {
            position: 'right',
            type: 'html',
            value: badgeLink(
              'https://discord.gg/WmADZpJnSe',
              'https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&scale=1.2&label=Discord',
              'discord-badge',
            ),
          },
          {
            href: 'https://github.com/ealush/vest',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Get Started',
                to: '/docs/get_started',
              },
              {
                label: 'API Reference',
                to: '/docs/api_reference',
              },
              {
                label: 'Community Resources and Integrations',
                to: '/docs/community_resources/integrations',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/WmADZpJnSe',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/ealush/vest',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ealush`,
      },
      prism: {
        theme: themes.nightOwl,
        darkTheme: themes.nightOwl,
      },
      announcementBar: {
        id: 'announcementBar-vest-6-released',
        content:
          'Vest 6 is here! 🎉 <a href="/docs/upgrade_guide">Upgrade guide</a>',
        textColor: 'var(--announcement-bar-color)',
        isCloseable: true,
      },
      algolia: {
        // temporary disabled until the index gets updated
        // The application ID provided by Algolia
        appId: '08EPW2MDNA',

        // Public API key: it is safe to commit it
        apiKey: '68ec0830ab24fde651af5d85e19dddfe',

        indexName: 'vestjs',
      },
    }),
};

export default config;
