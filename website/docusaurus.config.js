// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const lightCodeTheme = require('prism-react-renderer/themes/github');

/** @type {import('@docusaurus/types').Config} */
const config = {
  baseUrl: '/',
  favicon: 'img/favicon.ico',
  title: 'Vest',
  tagline:
    'Declarative validations framework inspired by unit testing libraries',
  url: 'https://vestjs.dev',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  organizationName: 'ealush', // Usually your GitHub org/user name.
  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        indexBlog: false,
      },
    ],
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-M420W03G2K',
        anonymizeIP: true,
      },
    ],
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/ealush/vest/edit/latest/website/',
          lastVersion: 'current',
          versions: {
            current: {
              label: '5.x',
            },
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  projectName: 'vest', // Usually your repo name.

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        {
          name: 'keywords',
          content:
            'vest, validations, javascript validations, unit tests, enforce, async validations, react validation, vue validation, svelte validation, reactjs, vuejs, angular, schema validation, js, unit tests, declarative, framework agnostic',
        },
        {
          name: 'description',
          content:
            'Vest is an open source validations framework that makes it easy to write your JS form validation.',
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
              'https://badgen.net/npm/v/vest?icon=npm&scale=1.2&color=red&label'
            ),
          },
          {
            position: 'right',
            type: 'html',
            value: badgeLink(
              'https://github.com/ealush/vest',
              'https://badgen.net/github/stars/ealush/vest?scale=1.2&color=yellow&icon=github'
            ),
          },
          {
            position: 'right',
            type: 'html',
            value: badgeLink(
              'https://discord.gg/WmADZpJnSe',
              'https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&scale=1.2&label=Discord'
            ),
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
              // {
              //   label: "Blog",
              //   to: "/blog",
              // },
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
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;

function badgeLink(url, badge) {
  return `<a href="${url}" class="header-badge" target="_blank">
    <img src="${badge}" />
  </a>`;
}
