export const menuItems = [
  {
    isHeadr: true,
    title: "menu",
  },

  // {
  //   title: "Dashboard",
  //   icon: "heroicons-outline:home",
  //   isOpen: true,
  //   isHide: true,
  //   link: "dashboard",
  //   child: [
  //     // {
  //     //   childtitle: "Analytics Dashboard",
  //     //   childlink: "dashboard",
  //     // },
  //     // {
  //     //   childtitle: "Ecommerce Dashboard",
  //     //   childlink: "ecommerce",
  //     // },
  //     // {
  //     //   childtitle: "Project  Dashbaord",
  //     //   childlink: "project",
  //     // },
  //     // {
  //     //   childtitle: " CRM Dashbaord",
  //     //   childlink: "crm",
  //     // },
  //     // {
  //     //   childtitle: "Banking Dashboard",
  //     //   childlink: "banking",
  //     // },
  //   ],
  // },
  {
    title: "Dashboard",
    isHide: true,
    icon: "heroicons-outline:home",
    link: "dashboard",
  },
  // {
  //   title: "changelog",
  //   icon: "heroicons:arrow-trending-up",
  //   link: "changelog",
  //   isHide: false,
  //   badge: "1.0.0",
  // },
  // {
  //   isHeadr: true,
  //   title: "apps",
  // },

  // {
  //   title: "Chat",
  //   isHide: true,
  //   icon: "heroicons-outline:chat",
  //   link: "chat",
  // },

  // {
  //   title: "Email",
  //   isHide: true,
  //   icon: "heroicons-outline:mail",
  //   link: "email",
  // },

  // {
  //   title: "Kanban",
  //   isHide: true,
  //   icon: "heroicons-outline:view-boards",
  //   link: "kanban",
  // },
  // {
  //   title: "Calender",
  //   isHide: true,
  //   icon: "heroicons-outline:calendar",
  //   link: "calender",
  // },

  // {
  //   title: "Todo",
  //   isHide: true,
  //   icon: "heroicons-outline:clipboard-check",
  //   link: "todo",
  // },

  // {
  //   title: "Projects",
  //   icon: "heroicons-outline:document",
  //   link: "#",
  //   isHide: true,
  //   child: [
  //     {
  //       childtitle: "Projects",
  //       childlink: "projects",
  //     },
  //     {
  //       childtitle: "Project Details",
  //       childlink: "project-details",
  //     },
  //   ],
  // },
  // {
  //   title: "Ecommerce",
  //   icon: "heroicons:shopping-bag",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "User App",

  //       multi_menu: [
  //         {
  //           multiTitle: "Products",
  //           multiLink: "products",
  //         },
  //         {
  //           multiTitle: "Products Details",
  //           multiLink: "products/1",
  //         },

  //         {
  //           multiTitle: "Cart",
  //           multiLink: "cart",
  //         },
  //         {
  //           multiTitle: "Wishlist",
  //           multiLink: "wishlist",
  //         },
  //       ],
  //     },
  //     {
  //       childtitle: "Admin App",

  //       multi_menu: [
  //         {
  //           multiTitle: "Orders",
  //           multiLink: "orders",
  //           badge: "soon",
  //         },

  //         {
  //           multiTitle: "Add Product",
  //           multiLink: "add-product",
  //           badge: "soon",
  //         },
  //         {
  //           multiTitle: "Edit Product",
  //           multiLink: "edit-product",
  //           badge: "soon",
  //         },
  //         {
  //           multiTitle: "Customers",
  //           multiLink: "customers",
  //           badge: "soon",
  //         },
  //         {
  //           multiTitle: "Sellers",
  //           multiLink: "sellers",
  //           badge: "soon",
  //         },
  //         {
  //           multiTitle: "Invoice",
  //           multiLink: "invoice-ecommerce",
  //           badge: "soon",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   isHeadr: true,
  //   title: "Pages",
  // },
  {
    title: "Sectors",
    isHide: true,
    icon: "heroicons-outline:building-library",
    link: "Sector-table",
  },
  {
    title: "Industry",
    isHide: true,
    icon: "heroicons-outline:home-modern",
    link: "Industry"
  },
  {
    title: "Company",
    isHide: true,
    icon: "heroicons:building-office",
    link: "Company"
  },
  {
    title: "Company",
    isHide: true,
    icon: "heroicons:building-office",
    link: "Company/:id"
  },
  {
    title: "Building",
    isHide: true,
    icon: "heroicons:home-modern",
    link: "Building"
  },
  {
    title: "Employees",
    isHide: true,
    icon: "heroicons:user",
    link: "Employee",
  },
  {
    title: "Employee Email Record",
    isHide: true,
    icon: "heroicons:envelope",
    link: "Email-Reporting",
  },
  {
    title: "Scope 1",
    icon: "heroicons-outline:home",
    isOpen: true,
    isHide: true,
    icon: "mdi:factory",
    link: "Scope-1",
    child: [
      {
        childtitle: "Scope 1 Report",
        childlink: "Scope-One-Report",
      },
      {
        childtitle: "Stationary Combustion",
        childlink: "Stationary-Combustion",
      },
      {
        childtitle: "Mobile Combustion",
        childlink: "Mobile-Combustion",
      },
      {
        childtitle: "Fugitve Emissions",
        childlink: "Fugitive-Emissions",
      },
      {
        childtitle: "Process Emissions",
        childlink: "Process-Emissions",
      },
    ]
  },
  {
    title: "Scope 2",
    icon: "heroicons-outline:home",
    isOpen: true,
    isHide: true,
    icon: "mdi:power-plug",
    link: "Scope-2",
    child: [
      {
        childtitle: "Scope 2 Report",
        childlink: "Scope-Two-Report",
      },
      {
        childtitle: "Purchased Electricity",
        childlink: "Purchased-Electricity",
      },
    ]
  },
  {
    title: "Scope 3",
    icon: "heroicons-outline:home",
    isOpen: true,
    isHide: true,
    icon: "mdi:share-variant",
    link: "Scope-3",
    child: [
      {
        childtitle: "Scope 3 Report",
        childlink: "Scope-Three-Report",
      },
      {
        childtitle: "Purchased Goods and Services",
        childlink: "Purchased-Good-Services",
      },
      {
        childtitle: "Capital Goods",
        childlink: "Capital-Goods",
      },
      {
        childtitle: "Fuel and Energy Related Activities",
        childlink: "fuel-energy",
      },
      {
        childtitle: "Waste Generated in Operations",
        childlink: "Waste-Generated",
      },
      {
        childtitle: "Business Travel",
        childlink: "Business-Travel",
      },//Email-Reporting

      // {
      //   childtitle: "Employee Email Sent",
      //   childlink: "EmailSent",
      // },
      {
        childtitle: "Employee Commuting",
        childlink: "Commuting",
      },

      {
        childtitle: "Upstream Transportation and Distribution",
        childlink: "Upstream-Transportation",
      },
      {
        childtitle: "Downstream Transportation and Distribution",
        childlink: "Downstream-Transportation",
      },


    ]

  },

  {
    title: "Out of Scope / Other Air Emissions",
    isHide: true,
    icon: "heroicons:no-symbol",
    link: "Air-Emission-Report-Page"
  },
  //   {
  //   title: "Scope one",
  //   isHide: true,
  //   icon: "heroicons:globe-alt",
  //   link: "Scope-1"
  // },
  // {
  //   title: "Stationary Combustion",
  //   isHide: true,
  //   icon: "heroicons:fire",
  //   link: "Stationary-Combustion"
  // },
  // {
  //   title: "Mobile Combustion",
  //   isHide: true,
  //   icon: "heroicons:truck",
  //   link: "Mobile-Combustion"
  // },
  //  {
  //   title: "Fugitive Emissions",
  //   isHide: true,
  //   icon: "heroicons:cloud",
  //   link: "Fugitive-Emissions"
  // },
  // {
  //   title: "Process Emissions",
  //   isHide: true,
  //   icon: "heroicons:cog-6-tooth",
  //   link: "Process-Emissions"
  // },

  // {
  //   title: "Authentication",
  //   icon: "heroicons-outline:lock-closed",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Signin One",
  //       childlink: "/",
  //     },
  //     {
  //       childtitle: "Signin Two",
  //       childlink: "/login2",
  //     },
  //     {
  //       childtitle: "Signin Three",
  //       childlink: "/login3",
  //     },
  //     {
  //       childtitle: "Signup One",
  //       childlink: "/reg",
  //     },
  //     {
  //       childtitle: "Signup Two",
  //       childlink: "/reg2",
  //     },
  //     {
  //       childtitle: "Signup Three",
  //       childlink: "/reg3",
  //     },
  //     {
  //       childtitle: "Forget Password One",
  //       childlink: "/forgot-password",
  //     },
  //     {
  //       childtitle: "Forget Password Two",
  //       childlink: "/forgot-password2",
  //     },
  //     {
  //       childtitle: "Forget Password Three",
  //       childlink: "/forgot-password3",
  //     },
  //     {
  //       childtitle: "Lock Screen One",
  //       childlink: "/lock-screen",
  //     },
  //     {
  //       childtitle: "Lock Screen Two",
  //       childlink: "/lock-screen2",
  //     },
  //     {
  //       childtitle: "Lock Screen Three",
  //       childlink: "/lock-screen3",
  //     },
  //   ],
  // },
  // {
  //   title: "Utility",
  //   icon: "heroicons-outline:view-boards",
  //   link: "#",
  //   isHide: false,
  //   child: [
  //     {
  //       childtitle: "Invoice",
  //       childlink: "invoice",
  //     },
  //     {
  //       childtitle: "Pricing",
  //       childlink: "pricing",
  //     },
  //     // {
  //     //   childtitle: "Testimonial",
  //     //   childlink: "testimonial",
  //     // },
  //     {
  //       childtitle: "FAQ",
  //       childlink: "faq",
  //     },
  //     {
  //       childtitle: "Blog",
  //       childlink: "blog",
  //     },
  //     {
  //       childtitle: "Blank page",
  //       childlink: "blank-page",
  //     },
  //     {
  //       childtitle: "Prfoile",
  //       childlink: "profile",
  //     },
  //     {
  //       childtitle: "Settings",
  //       childlink: "settings",
  //     },
  //     {
  //       childtitle: "404 page",
  //       childlink: "/404",
  //     },

  //     {
  //       childtitle: "Coming Soon",
  //       childlink: "/coming-soon",
  //     },
  //     {
  //       childtitle: "Under Maintanance page",
  //       childlink: "/under-construction",
  //     },
  //   ],
  // },


  // {
  //   title: "Widgets",
  //   icon: "heroicons-outline:view-grid-add",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Basic",
  //       childlink: "basic",
  //     },
  //     {
  //       childtitle: "Statistic",
  //       childlink: "statistic",
  //     },
  //   ],
  // },
  // {
  //   title: "Components",
  //   icon: "heroicons-outline:collection",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Typography",
  //       childlink: "typography",
  //     },
  //     {
  //       childtitle: "Colors",
  //       childlink: "colors",
  //     },
  //     {
  //       childtitle: "Alert",
  //       childlink: "alert",
  //     },
  //     {
  //       childtitle: "Button",
  //       childlink: "button",
  //     },
  //     {
  //       childtitle: "Card",
  //       childlink: "card",
  //     },
  //     {
  //       childtitle: "Carousel",
  //       childlink: "carousel",
  //     },
  //     {
  //       childtitle: "Dropdown",
  //       childlink: "dropdown",
  //     },
  //     {
  //       childtitle: "Image",
  //       childlink: "image",
  //     },
  //     {
  //       childtitle: "Modal",
  //       childlink: "modal",
  //     },
  //     {
  //       childtitle: "Progress bar",
  //       childlink: "progress-bar",
  //     },
  //     {
  //       childtitle: "Placeholder",
  //       childlink: "placeholder",
  //     },
  //     {
  //       childtitle: "Tab & Accordion",
  //       childlink: "tab-accordion",
  //     },
  //     {
  //       childtitle: "Badges",
  //       childlink: "badges",
  //     },
  //     {
  //       childtitle: "Paginatins",
  //       childlink: "paginations",
  //     },
  //     {
  //       childtitle: "Video",
  //       childlink: "video",
  //     },
  //     {
  //       childtitle: "Tooltip & Popover",
  //       childlink: "tooltip-popover",
  //     },
  //   ],
  // },
  // {
  //   title: "Forms",
  //   icon: "heroicons-outline:clipboard-list",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Input",
  //       childlink: "input",
  //     },
  //     {
  //       childtitle: "Input group",
  //       childlink: "input-group",
  //     },
  //     {
  //       childtitle: "Input layout",
  //       childlink: "input-layout",
  //     },
  //     {
  //       childtitle: "Form validation",
  //       childlink: "form-validation",
  //     },
  //     {
  //       childtitle: "Wizard",
  //       childlink: "form-wizard",
  //     },
  //     {
  //       childtitle: "Input mask",
  //       childlink: "input-mask",
  //     },
  //     {
  //       childtitle: "File input",
  //       childlink: "file-input",
  //     },
  //     {
  //       childtitle: "Form repeater",
  //       childlink: "form-repeater",
  //     },
  //     {
  //       childtitle: "Textarea",
  //       childlink: "textarea",
  //     },
  //     {
  //       childtitle: "Checkbox",
  //       childlink: "checkbox",
  //     },
  //     {
  //       childtitle: "Radio button",
  //       childlink: "radio-button",
  //     },
  //     {
  //       childtitle: "Switch",
  //       childlink: "switch",
  //     },
  //     {
  //       childtitle: "Select & Vue select",
  //       childlink: "select",
  //     },
  //     {
  //       childtitle: "Date time picker",
  //       childlink: "date-time-picker",
  //     },
  //   ],
  // },
  // {
  //   title: "Table",
  //   icon: "heroicons-outline:table",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Basic Table",
  //       childlink: "table-basic",
  //     },
  //     {
  //       childtitle: "React Table",
  //       childlink: "react-table",
  //     },
  //   ],
  // },
  // {
  //   title: "Chart",
  //   icon: "heroicons-outline:chart-bar",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Apex chart",
  //       childlink: "appex-chart",
  //     },
  //     {
  //       childtitle: "Chart js",
  //       childlink: "chartjs",
  //     },
  //     {
  //       childtitle: "Recharts",
  //       childlink: "recharts",
  //     },
  //   ],
  // },
  // {
  //   title: "Map",
  //   icon: "heroicons-outline:map",
  //   link: "map",
  // },
  // {
  //   title: "Icons",
  //   icon: "heroicons-outline:emoji-happy",
  //   link: "icons",
  // },
  // {
  //   title: "Multi Level",
  //   icon: "heroicons:share",
  //   link: "#",
  //   child: [
  //     {
  //       childtitle: "Level 1.1",
  //       childlink: "icons",
  //     },
  //     {
  //       childtitle: "Level 1.2",
  //       childlink: "Level-1",
  //       multi_menu: [
  //         {
  //           multiTitle: "Level 2.1",
  //           multiLink: "Level-2",
  //         },
  //         {
  //           multiTitle: "Level 2.2",
  //           multiLink: "Level-2.3",
  //         },
  //       ],
  //     },
  //   ],
  // },
];

export const topMenu = [
  {
    title: "Dashboard",
    icon: "heroicons-outline:home",
    link: "/app/home",
    child: [
      {
        childtitle: "Analytics Dashboard",
        childlink: "dashboard",
        childicon: "heroicons:presentation-chart-line",
      },
      {
        childtitle: "Ecommerce Dashboard",
        childlink: "ecommerce",
        childicon: "heroicons:shopping-cart",
      },
      {
        childtitle: "Project  Dashboard",
        childlink: "project",
        childicon: "heroicons:briefcase",
      },
      {
        childtitle: "CRM Dashboard",
        childlink: "crm",
        childicon: "ri:customer-service-2-fill",
      },
      {
        childtitle: "Banking Dashboard",
        childlink: "banking",
        childicon: "heroicons:wrench-screwdriver",
      },
    ],
  },
  {
    title: "App",
    icon: "heroicons-outline:chip",
    link: "/app/home",
    child: [
      {
        childtitle: "Calendar",
        childlink: "calender",
        childicon: "heroicons-outline:calendar",
      },
      {
        childtitle: "Kanban",
        childlink: "kanban",
        childicon: "heroicons-outline:view-boards",
      },
      {
        childtitle: "Todo",
        childlink: "todo",
        childicon: "heroicons-outline:clipboard-check",
      },
      {
        childtitle: "Projects",
        childlink: "projects",
        childicon: "heroicons-outline:document",
      },
    ],
  },
  {
    title: "Pages",
    icon: "heroicons-outline:view-boards",
    link: "/app/home",
    megamenu: [
      {
        megamenutitle: "Authentication",
        megamenuicon: "heroicons-outline:user",
        singleMegamenu: [
          {
            m_childtitle: "Signin One",
            m_childlink: "/",
          },
          {
            m_childtitle: "Signin Two",
            m_childlink: "/login2",
          },
          {
            m_childtitle: "Signin Three",
            m_childlink: "/login3",
          },
          {
            m_childtitle: "Signup One",
            m_childlink: "/register",
          },
          {
            m_childtitle: "Signup Two",
            m_childlink: "/register/register2",
          },
          {
            m_childtitle: "Signup Three",
            m_childlink: "/register/register3",
          },
          {
            m_childtitle: "Forget Password One",
            m_childlink: "/forgot-password",
          },
          {
            m_childtitle: "Forget Password Two",
            m_childlink: "/forgot-password2",
          },
          {
            m_childtitle: "Forget Password Three",
            m_childlink: "/forgot-password3",
          },
          {
            m_childtitle: "Lock Screen One",
            m_childlink: "/lock-screen",
          },
          {
            m_childtitle: "Lock Screen Two",
            m_childlink: "/lock-screen2",
          },
          {
            m_childtitle: "Lock Screen Three",
            m_childlink: "/lock-screen3",
          },
        ],
      },

      {
        megamenutitle: "Components",
        megamenuicon: "heroicons-outline:user",
        singleMegamenu: [
          {
            m_childtitle: "typography",
            m_childlink: "typography",
          },
          {
            m_childtitle: "colors",
            m_childlink: "colors",
          },
          {
            m_childtitle: "alert",
            m_childlink: "alert",
          },
          {
            m_childtitle: "button",
            m_childlink: "button",
          },
          {
            m_childtitle: "card",
            m_childlink: "card",
          },
          {
            m_childtitle: "carousel",
            m_childlink: "carousel",
          },
          {
            m_childtitle: "dropdown",
            m_childlink: "dropdown",
          },
          {
            m_childtitle: "image",
            m_childlink: "image",
          },
          {
            m_childtitle: "modal",
            m_childlink: "modal",
          },
          {
            m_childtitle: "Progress bar",
            m_childlink: "progress-bar",
          },
          {
            m_childtitle: "Placeholder",
            m_childlink: "placeholder",
          },

          {
            m_childtitle: "Tab & Accordion",
            m_childlink: "tab-accordion",
          },
        ],
      },
      {
        megamenutitle: "Forms",
        megamenuicon: "heroicons-outline:user",
        singleMegamenu: [
          {
            m_childtitle: "Input",
            m_childlink: "input",
          },
          {
            m_childtitle: "Input group",
            m_childlink: "input-group",
          },
          {
            m_childtitle: "Input layout",
            m_childlink: "input-layout",
          },
          {
            m_childtitle: "Form validation",
            m_childlink: "form-validation",
          },
          {
            m_childtitle: "Wizard",
            m_childlink: "form-wizard",
          },
          {
            m_childtitle: "Input mask",
            m_childlink: "input-mask",
          },
          {
            m_childtitle: "File input",
            m_childlink: "file-input",
          },
          {
            m_childtitle: "Form repeater",
            m_childlink: "form-repeater",
          },
          {
            m_childtitle: "Textarea",
            m_childlink: "textarea",
          },
          {
            m_childtitle: "Checkbox",
            m_childlink: "checkbox",
          },
          {
            m_childtitle: "Radio button",
            m_childlink: "radio-button",
          },
          {
            m_childtitle: "Switch",
            m_childlink: "switch",
          },
        ],
      },
      {
        megamenutitle: "Utility",
        megamenuicon: "heroicons-outline:user",
        singleMegamenu: [
          {
            m_childtitle: "Invoice",
            m_childlink: "invoice",
          },
          {
            m_childtitle: "Pricing",
            m_childlink: "pricing",
          },

          // {
          //   m_childtitle: "Testimonial",
          //   m_childlink: "testimonial",
          // },
          {
            m_childtitle: "FAQ",
            m_childlink: "faq",
          },
          {
            m_childtitle: "Blank page",
            m_childlink: "blank-page",
          },
          {
            m_childtitle: "Blog",
            m_childlink: "blog",
          },
          {
            m_childtitle: "404 page",
            m_childlink: "/404",
          },
          {
            m_childtitle: "Coming Soon",
            m_childlink: "/coming-soon",
          },
          {
            m_childtitle: "Under Maintanance page",
            m_childlink: "/under-construction",
          },
        ],
      },
    ],
  },

  {
    title: "Widgets",
    icon: "heroicons-outline:view-grid-add",
    link: "form-elements",
    child: [
      {
        childtitle: "Basic",
        childlink: "basic",
        childicon: "heroicons-outline:document-text",
      },
      {
        childtitle: "Statistic",
        childlink: "statistic",
        childicon: "heroicons-outline:document-text",
      },
    ],
  },

  {
    title: "Extra",
    icon: "heroicons-outline:template",

    child: [
      {
        childtitle: "Basic Table",
        childlink: "table-basic",
        childicon: "heroicons-outline:table",
      },
      {
        childtitle: "Advanced table",
        childlink: "table-advanced",
        childicon: "heroicons-outline:table",
      },
      {
        childtitle: "Apex chart",
        childlink: "appex-chart",
        childicon: "heroicons-outline:chart-bar",
      },
      {
        childtitle: "Chart js",
        childlink: "chartjs",
        childicon: "heroicons-outline:chart-bar",
      },
      {
        childtitle: "Map",
        childlink: "map",
        childicon: "heroicons-outline:map",
      },
    ],
  },
];


export const countryData = [
  {
    "value": "Afghanistan",
    "label": "Afghanistan"
  },
  {
    "value": "Albania",
    "label": "Albania"
  },
  {
    "value": "Algeria",
    "label": "Algeria"
  },
  {
    "value": "American Samoa",
    "label": "American Samoa"
  },
  {
    "value": "Andorra",
    "label": "Andorra"
  },
  {
    "value": "Angola",
    "label": "Angola"
  },
  {
    "value": "Anguilla",
    "label": "Anguilla"
  },
  {
    "value": "Antarctica",
    "label": "Antarctica"
  },
  {
    "value": "Antigua and Barbuda",
    "label": "Antigua and Barbuda"
  },
  {
    "value": "Argentina",
    "label": "Argentina"
  },
  {
    "value": "Armenia",
    "label": "Armenia"
  },
  {
    "value": "Aruba",
    "label": "Aruba"
  },
  {
    "value": "Australia",
    "label": "Australia"
  },
  {
    "value": "Austria",
    "label": "Austria"
  },
  {
    "value": "Azerbaijan",
    "label": "Azerbaijan"
  },
  {
    "value": "Bahamas",
    "label": "Bahamas"
  },
  {
    "value": "Bahrain",
    "label": "Bahrain"
  },
  {
    "value": "Bangladesh",
    "label": "Bangladesh"
  },
  {
    "value": "Barbados",
    "label": "Barbados"
  },
  {
    "value": "Belarus",
    "label": "Belarus"
  },
  {
    "value": "Belgium",
    "label": "Belgium"
  },
  {
    "value": "Belize",
    "label": "Belize"
  },
  {
    "value": "Benin",
    "label": "Benin"
  },
  {
    "value": "Bermuda",
    "label": "Bermuda"
  },
  {
    "value": "Bhutan",
    "label": "Bhutan"
  },
  {
    "value": "Bolivia",
    "label": "Bolivia"
  },
  {
    "value": "Bosnia and Herzegovina",
    "label": "Bosnia and Herzegovina"
  },
  {
    "value": "Botswana",
    "label": "Botswana"
  },
  {
    "value": "Bouvet Island",
    "label": "Bouvet Island"
  },
  {
    "value": "Brazil",
    "label": "Brazil"
  },
  {
    "value": "British Indian Ocean Territory",
    "label": "British Indian Ocean Territory"
  },
  {
    "value": "British Virgin Islands",
    "label": "British Virgin Islands"
  },
  {
    "value": "Brunei",
    "label": "Brunei"
  },
  {
    "value": "Bulgaria",
    "label": "Bulgaria"
  },
  {
    "value": "Burkina Faso",
    "label": "Burkina Faso"
  },
  {
    "value": "Burundi",
    "label": "Burundi"
  },
  {
    "value": "Cambodia",
    "label": "Cambodia"
  },
  {
    "value": "Cameroon",
    "label": "Cameroon"
  },
  {
    "value": "Canada",
    "label": "Canada"
  },
  {
    "value": "Cape Verde",
    "label": "Cape Verde"
  },
  {
    "value": "Caribbean Netherlands",
    "label": "Caribbean Netherlands"
  },
  {
    "value": "Cayman Islands",
    "label": "Cayman Islands"
  },
  {
    "value": "Central African Republic",
    "label": "Central African Republic"
  },
  {
    "value": "Chad",
    "label": "Chad"
  },
  {
    "value": "Chile",
    "label": "Chile"
  },
  {
    "value": "China",
    "label": "China"
  },
  {
    "value": "Christmas Island",
    "label": "Christmas Island"
  },
  {
    "value": "Cocos (Keeling) Islands",
    "label": "Cocos (Keeling) Islands"
  },
  {
    "value": "Colombia",
    "label": "Colombia"
  },
  {
    "value": "Comoros",
    "label": "Comoros"
  },
  {
    "value": "Congo",
    "label": "Congo"
  },
  {
    "value": "Cook Islands",
    "label": "Cook Islands"
  },
  {
    "value": "Costa Rica",
    "label": "Costa Rica"
  },
  {
    "value": "Croatia",
    "label": "Croatia"
  },
  {
    "value": "Cuba",
    "label": "Cuba"
  },
  {
    "value": "Curaçao",
    "label": "Curaçao"
  },
  {
    "value": "Cyprus",
    "label": "Cyprus"
  },
  {
    "value": "Czechia",
    "label": "Czechia"
  },
  {
    "value": "DR Congo",
    "label": "DR Congo"
  },
  {
    "value": "Denmark",
    "label": "Denmark"
  },
  {
    "value": "Djibouti",
    "label": "Djibouti"
  },
  {
    "value": "Dominica",
    "label": "Dominica"
  },
  {
    "value": "Dominican Republic",
    "label": "Dominican Republic"
  },
  {
    "value": "Ecuador",
    "label": "Ecuador"
  },
  {
    "value": "Egypt",
    "label": "Egypt"
  },
  {
    "value": "El Salvador",
    "label": "El Salvador"
  },
  {
    "value": "Equatorial Guinea",
    "label": "Equatorial Guinea"
  },
  {
    "value": "Eritrea",
    "label": "Eritrea"
  },
  {
    "value": "Estonia",
    "label": "Estonia"
  },
  {
    "value": "Eswatini",
    "label": "Eswatini"
  },
  {
    "value": "Ethiopia",
    "label": "Ethiopia"
  },
  {
    "value": "Falkland Islands",
    "label": "Falkland Islands"
  },
  {
    "value": "Faroe Islands",
    "label": "Faroe Islands"
  },
  {
    "value": "Fiji",
    "label": "Fiji"
  },
  {
    "value": "Finland",
    "label": "Finland"
  },
  {
    "value": "France",
    "label": "France"
  },
  {
    "value": "French Guiana",
    "label": "French Guiana"
  },
  {
    "value": "French Polynesia",
    "label": "French Polynesia"
  },
  {
    "value": "French Southern and Antarctic Lands",
    "label": "French Southern and Antarctic Lands"
  },
  {
    "value": "Gabon",
    "label": "Gabon"
  },
  {
    "value": "Gambia",
    "label": "Gambia"
  },
  {
    "value": "Georgia",
    "label": "Georgia"
  },
  {
    "value": "Germany",
    "label": "Germany"
  },
  {
    "value": "Ghana",
    "label": "Ghana"
  },
  {
    "value": "Gibraltar",
    "label": "Gibraltar"
  },
  {
    "value": "Greece",
    "label": "Greece"
  },
  {
    "value": "Greenland",
    "label": "Greenland"
  },
  {
    "value": "Grenada",
    "label": "Grenada"
  },
  {
    "value": "Guadeloupe",
    "label": "Guadeloupe"
  },
  {
    "value": "Guam",
    "label": "Guam"
  },
  {
    "value": "Guatemala",
    "label": "Guatemala"
  },
  {
    "value": "Guernsey",
    "label": "Guernsey"
  },
  {
    "value": "Guinea",
    "label": "Guinea"
  },
  {
    "value": "Guinea-Bissau",
    "label": "Guinea-Bissau"
  },
  {
    "value": "Guyana",
    "label": "Guyana"
  },
  {
    "value": "Haiti",
    "label": "Haiti"
  },
  {
    "value": "Heard Island and McDonald Islands",
    "label": "Heard Island and McDonald Islands"
  },
  {
    "value": "Honduras",
    "label": "Honduras"
  },
  {
    "value": "Hong Kong",
    "label": "Hong Kong"
  },
  {
    "value": "Hungary",
    "label": "Hungary"
  },
  {
    "value": "Iceland",
    "label": "Iceland"
  },
  {
    "value": "India",
    "label": "India"
  },
  {
    "value": "Indonesia",
    "label": "Indonesia"
  },
  {
    "value": "Iran",
    "label": "Iran"
  },
  {
    "value": "Iraq",
    "label": "Iraq"
  },
  {
    "value": "Ireland",
    "label": "Ireland"
  },
  {
    "value": "Isle of Man",
    "label": "Isle of Man"
  },
  {
    "value": "Israel",
    "label": "Israel"
  },
  {
    "value": "Italy",
    "label": "Italy"
  },
  {
    "value": "Ivory Coast",
    "label": "Ivory Coast"
  },
  {
    "value": "Jamaica",
    "label": "Jamaica"
  },
  {
    "value": "Japan",
    "label": "Japan"
  },
  {
    "value": "Jersey",
    "label": "Jersey"
  },
  {
    "value": "Jordan",
    "label": "Jordan"
  },
  {
    "value": "Kazakhstan",
    "label": "Kazakhstan"
  },
  {
    "value": "Kenya",
    "label": "Kenya"
  },
  {
    "value": "Kiribati",
    "label": "Kiribati"
  },
  {
    "value": "Kosovo",
    "label": "Kosovo"
  },
  {
    "value": "Kuwait",
    "label": "Kuwait"
  },
  {
    "value": "Kyrgyzstan",
    "label": "Kyrgyzstan"
  },
  {
    "value": "Laos",
    "label": "Laos"
  },
  {
    "value": "Latvia",
    "label": "Latvia"
  },
  {
    "value": "Lebanon",
    "label": "Lebanon"
  },
  {
    "value": "Lesotho",
    "label": "Lesotho"
  },
  {
    "value": "Liberia",
    "label": "Liberia"
  },
  {
    "value": "Libya",
    "label": "Libya"
  },
  {
    "value": "Liechtenstein",
    "label": "Liechtenstein"
  },
  {
    "value": "Lithuania",
    "label": "Lithuania"
  },
  {
    "value": "Luxembourg",
    "label": "Luxembourg"
  },
  {
    "value": "Macau",
    "label": "Macau"
  },
  {
    "value": "Madagascar",
    "label": "Madagascar"
  },
  {
    "value": "Malawi",
    "label": "Malawi"
  },
  {
    "value": "Malaysia",
    "label": "Malaysia"
  },
  {
    "value": "Maldives",
    "label": "Maldives"
  },
  {
    "value": "Mali",
    "label": "Mali"
  },
  {
    "value": "Malta",
    "label": "Malta"
  },
  {
    "value": "Marshall Islands",
    "label": "Marshall Islands"
  },
  {
    "value": "Martinique",
    "label": "Martinique"
  },
  {
    "value": "Mauritania",
    "label": "Mauritania"
  },
  {
    "value": "Mauritius",
    "label": "Mauritius"
  },
  {
    "value": "Mayotte",
    "label": "Mayotte"
  },
  {
    "value": "Mexico",
    "label": "Mexico"
  },
  {
    "value": "Micronesia",
    "label": "Micronesia"
  },
  {
    "value": "Moldova",
    "label": "Moldova"
  },
  {
    "value": "Monaco",
    "label": "Monaco"
  },
  {
    "value": "Mongolia",
    "label": "Mongolia"
  },
  {
    "value": "Montenegro",
    "label": "Montenegro"
  },
  {
    "value": "Montserrat",
    "label": "Montserrat"
  },
  {
    "value": "Morocco",
    "label": "Morocco"
  },
  {
    "value": "Mozambique",
    "label": "Mozambique"
  },
  {
    "value": "Myanmar",
    "label": "Myanmar"
  },
  {
    "value": "Namibia",
    "label": "Namibia"
  },
  {
    "value": "Nauru",
    "label": "Nauru"
  },
  {
    "value": "Nepal",
    "label": "Nepal"
  },
  {
    "value": "Netherlands",
    "label": "Netherlands"
  },
  {
    "value": "New Caledonia",
    "label": "New Caledonia"
  },
  {
    "value": "New Zealand",
    "label": "New Zealand"
  },
  {
    "value": "Nicaragua",
    "label": "Nicaragua"
  },
  {
    "value": "Niger",
    "label": "Niger"
  },
  {
    "value": "Nigeria",
    "label": "Nigeria"
  },
  {
    "value": "Niue",
    "label": "Niue"
  },
  {
    "value": "Norfolk Island",
    "label": "Norfolk Island"
  },
  {
    "value": "North Korea",
    "label": "North Korea"
  },
  {
    "value": "North Macedonia",
    "label": "North Macedonia"
  },
  {
    "value": "Northern Mariana Islands",
    "label": "Northern Mariana Islands"
  },
  {
    "value": "Norway",
    "label": "Norway"
  },
  {
    "value": "Oman",
    "label": "Oman"
  },
  {
    "value": "Pakistan",
    "label": "Pakistan"
  },
  {
    "value": "Palau",
    "label": "Palau"
  },
  {
    "value": "Palestine",
    "label": "Palestine"
  },
  {
    "value": "Panama",
    "label": "Panama"
  },
  {
    "value": "Papua New Guinea",
    "label": "Papua New Guinea"
  },
  {
    "value": "Paraguay",
    "label": "Paraguay"
  },
  {
    "value": "Peru",
    "label": "Peru"
  },
  {
    "value": "Philippines",
    "label": "Philippines"
  },
  {
    "value": "Pitcairn Islands",
    "label": "Pitcairn Islands"
  },
  {
    "value": "Poland",
    "label": "Poland"
  },
  {
    "value": "Portugal",
    "label": "Portugal"
  },
  {
    "value": "Puerto Rico",
    "label": "Puerto Rico"
  },
  {
    "value": "Qatar",
    "label": "Qatar"
  },
  {
    "value": "Romania",
    "label": "Romania"
  },
  {
    "value": "Russia",
    "label": "Russia"
  },
  {
    "value": "Rwanda",
    "label": "Rwanda"
  },
  {
    "value": "Réunion",
    "label": "Réunion"
  },
  {
    "value": "Saint Barthélemy",
    "label": "Saint Barthélemy"
  },
  {
    "value": "Saint Helena, Ascension and Tristan da Cunha",
    "label": "Saint Helena, Ascension and Tristan da Cunha"
  },
  {
    "value": "Saint Kitts and Nevis",
    "label": "Saint Kitts and Nevis"
  },
  {
    "value": "Saint Lucia",
    "label": "Saint Lucia"
  },
  {
    "value": "Saint Martin",
    "label": "Saint Martin"
  },
  {
    "value": "Saint Pierre and Miquelon",
    "label": "Saint Pierre and Miquelon"
  },
  {
    "value": "Saint Vincent and the Grenadines",
    "label": "Saint Vincent and the Grenadines"
  },
  {
    "value": "Samoa",
    "label": "Samoa"
  },
  {
    "value": "San Marino",
    "label": "San Marino"
  },
  {
    "value": "Saudi Arabia",
    "label": "Saudi Arabia"
  },
  {
    "value": "Senegal",
    "label": "Senegal"
  },
  {
    "value": "Serbia",
    "label": "Serbia"
  },
  {
    "value": "Seychelles",
    "label": "Seychelles"
  },
  {
    "value": "Sierra Leone",
    "label": "Sierra Leone"
  },
  {
    "value": "Singapore",
    "label": "Singapore"
  },
  {
    "value": "Sint Maarten",
    "label": "Sint Maarten"
  },
  {
    "value": "Slovakia",
    "label": "Slovakia"
  },
  {
    "value": "Slovenia",
    "label": "Slovenia"
  },
  {
    "value": "Solomon Islands",
    "label": "Solomon Islands"
  },
  {
    "value": "Somalia",
    "label": "Somalia"
  },
  {
    "value": "South Africa",
    "label": "South Africa"
  },
  {
    "value": "South Georgia",
    "label": "South Georgia"
  },
  {
    "value": "South Korea",
    "label": "South Korea"
  },
  {
    "value": "South Sudan",
    "label": "South Sudan"
  },
  {
    "value": "Spain",
    "label": "Spain"
  },
  {
    "value": "Sri Lanka",
    "label": "Sri Lanka"
  },
  {
    "value": "Sudan",
    "label": "Sudan"
  },
  {
    "value": "Suriname",
    "label": "Suriname"
  },
  {
    "value": "Svalbard and Jan Mayen",
    "label": "Svalbard and Jan Mayen"
  },
  {
    "value": "Sweden",
    "label": "Sweden"
  },
  {
    "value": "Switzerland",
    "label": "Switzerland"
  },
  {
    "value": "Syria",
    "label": "Syria"
  },
  {
    "value": "São Tomé and Príncipe",
    "label": "São Tomé and Príncipe"
  },
  {
    "value": "Taiwan",
    "label": "Taiwan"
  },
  {
    "value": "Tajikistan",
    "label": "Tajikistan"
  },
  {
    "value": "Tanzania",
    "label": "Tanzania"
  },
  {
    "value": "Thailand",
    "label": "Thailand"
  },
  {
    "value": "Timor-Leste",
    "label": "Timor-Leste"
  },
  {
    "value": "Togo",
    "label": "Togo"
  },
  {
    "value": "Tokelau",
    "label": "Tokelau"
  },
  {
    "value": "Tonga",
    "label": "Tonga"
  },
  {
    "value": "Trinidad and Tobago",
    "label": "Trinidad and Tobago"
  },
  {
    "value": "Tunisia",
    "label": "Tunisia"
  },
  {
    "value": "Turkmenistan",
    "label": "Turkmenistan"
  },
  {
    "value": "Turks and Caicos Islands",
    "label": "Turks and Caicos Islands"
  },
  {
    "value": "Tuvalu",
    "label": "Tuvalu"
  },
  {
    "value": "Türkiye",
    "label": "Türkiye"
  },
  {
    "value": "Uganda",
    "label": "Uganda"
  },
  {
    "value": "Ukraine",
    "label": "Ukraine"
  },
  {
    "value": "United Arab Emirates",
    "label": "United Arab Emirates"
  },
  {
    "value": "United Kingdom",
    "label": "United Kingdom"
  },
  {
    "value": "United States",
    "label": "United States"
  },
  {
    "value": "United States Minor Outlying Islands",
    "label": "United States Minor Outlying Islands"
  },
  {
    "value": "United States Virgin Islands",
    "label": "United States Virgin Islands"
  },
  {
    "value": "Uruguay",
    "label": "Uruguay"
  },
  {
    "value": "Uzbekistan",
    "label": "Uzbekistan"
  },
  {
    "value": "Vanuatu",
    "label": "Vanuatu"
  },
  {
    "value": "Vatican City",
    "label": "Vatican City"
  },
  {
    "value": "Venezuela",
    "label": "Venezuela"
  },
  {
    "value": "Vietnam",
    "label": "Vietnam"
  },
  {
    "value": "Wallis and Futuna",
    "label": "Wallis and Futuna"
  },
  {
    "value": "Western Sahara",
    "label": "Western Sahara"
  },
  {
    "value": "Yemen",
    "label": "Yemen"
  },
  {
    "value": "Zambia",
    "label": "Zambia"
  },
  {
    "value": "Zimbabwe",
    "label": "Zimbabwe"
  },
  {
    "value": "Åland Islands",
    "label": "Åland Islands"
  }
]

export const currencyOptions = [
  { value: "AED", label: "AED" },
  { value: "AFN", label: "AFN" },
  { value: "ALL", label: "ALL" },
  { value: "AMD", label: "AMD" },
  { value: "ANG", label: "ANG" },
  { value: "AOA", label: "AOA" },
  { value: "ARS", label: "ARS" },
  { value: "AUD", label: "AUD" },
  { value: "AWG", label: "AWG" },
  { value: "AZN", label: "AZN" },
  { value: "BAM", label: "BAM" },
  { value: "BBD", label: "BBD" },
  { value: "BDT", label: "BDT" },
  { value: "BHD", label: "BHD" },
  { value: "BIF", label: "BIF" },
  { value: "BMD", label: "BMD" },
  { value: "BND", label: "BND" },
  { value: "BOB", label: "BOB" },
  { value: "BRL", label: "BRL" },
  { value: "BSD", label: "BSD" },
  { value: "BTN", label: "BTN" },
  { value: "BWP", label: "BWP" },
  { value: "BYN", label: "BYN" },
  { value: "BZD", label: "BZD" },
  { value: "CAD", label: "CAD" },
  { value: "CDF", label: "CDF" },
  { value: "CHF", label: "CHF" },
  { value: "CKD", label: "CKD" },
  { value: "CLP", label: "CLP" },
  { value: "CNY", label: "CNY" },
  { value: "COP", label: "COP" },
  { value: "CRC", label: "CRC" },
  { value: "CUC", label: "CUC" },
  { value: "CUP", label: "CUP" },
  { value: "CVE", label: "CVE" },
  { value: "CZK", label: "CZK" },
  { value: "DJF", label: "DJF" },
  { value: "DKK", label: "DKK" },
  { value: "DOP", label: "DOP" },
  { value: "DZD", label: "DZD" },
  { value: "EGP", label: "EGP" },
  { value: "ERN", label: "ERN" },
  { value: "ETB", label: "ETB" },
  { value: "EUR", label: "EUR" },
  { value: "FJD", label: "FJD" },
  { value: "FKP", label: "FKP" },
  { value: "FOK", label: "FOK" },
  { value: "GBP", label: "GBP" },
  { value: "GEL", label: "GEL" },
  { value: "GGP", label: "GGP" },
  { value: "GHS", label: "GHS" },
  { value: "GIP", label: "GIP" },
  { value: "GMD", label: "GMD" },
  { value: "GNF", label: "GNF" },
  { value: "GTQ", label: "GTQ" },
  { value: "GYD", label: "GYD" },
  { value: "HKD", label: "HKD" },
  { value: "HNL", label: "HNL" },
  { value: "HTG", label: "HTG" },
  { value: "HUF", label: "HUF" },
  { value: "IDR", label: "IDR" },
  { value: "ILS", label: "ILS" },
  { value: "IMP", label: "IMP" },
  { value: "INR", label: "INR" },
  { value: "IQD", label: "IQD" },
  { value: "IRR", label: "IRR" },
  { value: "ISK", label: "ISK" },
  { value: "JEP", label: "JEP" },
  { value: "JMD", label: "JMD" },
  { value: "JOD", label: "JOD" },
  { value: "JPY", label: "JPY" },
  { value: "KES", label: "KES" },
  { value: "KGS", label: "KGS" },
  { value: "KHR", label: "KHR" },
  { value: "KID", label: "KID" },
  { value: "KMF", label: "KMF" },
  { value: "KPW", label: "KPW" },
  { value: "KRW", label: "KRW" },
  { value: "KWD", label: "KWD" },
  { value: "KYD", label: "KYD" },
  { value: "KZT", label: "KZT" },
  { value: "LAK", label: "LAK" },
  { value: "LBP", label: "LBP" },
  { value: "LKR", label: "LKR" },
  { value: "LRD", label: "LRD" },
  { value: "LSL", label: "LSL" },
  { value: "LYD", label: "LYD" },
  { value: "MAD", label: "MAD" },
  { value: "MDL", label: "MDL" },
  { value: "MGA", label: "MGA" },
  { value: "MKD", label: "MKD" },
  { value: "MMK", label: "MMK" },
  { value: "MNT", label: "MNT" },
  { value: "MOP", label: "MOP" },
  { value: "MRU", label: "MRU" },
  { value: "MUR", label: "MUR" },
  { value: "MVR", label: "MVR" },
  { value: "MWK", label: "MWK" },
  { value: "MXN", label: "MXN" },
  { value: "MYR", label: "MYR" },
  { value: "MZN", label: "MZN" },
  { value: "NAD", label: "NAD" },
  { value: "NGN", label: "NGN" },
  { value: "NIO", label: "NIO" },
  { value: "NOK", label: "NOK" },
  { value: "NPR", label: "NPR" },
  { value: "NZD", label: "NZD" },
  { value: "OMR", label: "OMR" },
  { value: "PAB", label: "PAB" },
  { value: "PEN", label: "PEN" },
  { value: "PGK", label: "PGK" },
  { value: "PHP", label: "PHP" },
  { value: "PKR", label: "PKR" },
  { value: "PLN", label: "PLN" },
  { value: "PYG", label: "PYG" },
  { value: "QAR", label: "QAR" },
  { value: "RON", label: "RON" },
  { value: "RSD", label: "RSD" },
  { value: "RUB", label: "RUB" },
  { value: "RWF", label: "RWF" },
  { value: "SAR", label: "SAR" },
  { value: "SBD", label: "SBD" },
  { value: "SCR", label: "SCR" },
  { value: "SDG", label: "SDG" },
  { value: "SEK", label: "SEK" },
  { value: "SGD", label: "SGD" },
  { value: "SHP", label: "SHP" },
  { value: "SLE", label: "SLE" },
  { value: "SOS", label: "SOS" },
  { value: "SRD", label: "SRD" },
  { value: "SSP", label: "SSP" },
  { value: "STN", label: "STN" },
  { value: "SYP", label: "SYP" },
  { value: "SZL", label: "SZL" },
  { value: "THB", label: "THB" },
  { value: "TJS", label: "TJS" },
  { value: "TMT", label: "TMT" },
  { value: "TND", label: "TND" },
  { value: "TOP", label: "TOP" },
  { value: "TRY", label: "TRY" },
  { value: "TTD", label: "TTD" },
  { value: "TVD", label: "TVD" },
  { value: "TWD", label: "TWD" },
  { value: "TZS", label: "TZS" },
  { value: "UAH", label: "UAH" },
  { value: "UGX", label: "UGX" },
  { value: "USD", label: "USD" },
  { value: "UYU", label: "UYU" },
  { value: "UZS", label: "UZS" },
  { value: "VES", label: "VES" },
  { value: "VND", label: "VND" },
  { value: "VUV", label: "VUV" },
  { value: "WST", label: "WST" },
  { value: "XAF", label: "XAF" },
  { value: "XCD", label: "XCD" },
  { value: "XOF", label: "XOF" },
  { value: "XPF", label: "XPF" },
  { value: "YER", label: "YER" },
  { value: "ZAR", label: "ZAR" },
  { value: "ZMW", label: "ZMW" },
  { value: "ZWB", label: "ZWB" }
]

import User1 from "@/assets/images/all-img/user.png";
import User2 from "@/assets/images/all-img/user2.png";
import User3 from "@/assets/images/all-img/user3.png";
import User4 from "@/assets/images/all-img/user4.png";
export const notifications = [
  {
    title: "Your order is placed",
    desc: "Amet minim mollit non deser unt ullamco est sit aliqua.",

    image: User1,
    link: "#",
  },
  {
    title: "Congratulations Darlene  🎉",
    desc: "Won the monthly best seller badge",
    unread: true,
    image: User2,
    link: "#",
  },
  {
    title: "Revised Order 👋",
    desc: "Won the monthly best seller badge",

    image: User3,
    link: "#",
  },
  {
    title: "Brooklyn Simmons",
    desc: "Added you to Top Secret Project group...",

    image: User4,
    link: "#",
  },
];

export const message = [
  {
    title: "Wade Warren",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: true,
    notification_count: 1,
    image: User1,
    link: "#",
  },
  {
    title: "Savannah Nguyen",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: false,
    image: User2,
    link: "#",
  },
  {
    title: "Ralph Edwards",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: true,
    notification_count: 8,
    image: User3,
    link: "#",
  },
  {
    title: "Cody Fisher",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: false,
    image: User4,
    link: "#",
  },
  {
    title: "Savannah Nguyen",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: false,
    image: User2,
    link: "#",
  },
  {
    title: "Ralph Edwards",
    desc: "Hi! How are you doing?.....",
    active: false,
    hasnotifaction: true,
    notification_count: 8,
    image: User3,
    link: "#",
  },
  {
    title: "Cody Fisher",
    desc: "Hi! How are you doing?.....",
    active: true,
    hasnotifaction: false,
    image: User4,
    link: "#",
  },
];

export const colors = {
  primary: "#4669FA",
  secondary: "#A0AEC0",
  danger: "#F1595C",
  black: "#111112",
  warning: "#FA916B",
  info: "#0CE7FA",
  light: "#425466",
  success: "#50C793",
  "gray-f7": "#F7F8FC",
  dark: "#1E293B",
  "dark-gray": "#0F172A",
  gray: "#68768A",
  gray2: "#EEF1F9",
  "dark-light": "#CBD5E1",
};

export const hexToRGB = (hex, alpha) => {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
};

export const topFilterLists = [
  {
    name: "Inbox",
    value: "all",
    icon: "uil:image-v",
  },
  {
    name: "Starred",
    value: "fav",
    icon: "heroicons:star",
  },
  {
    name: "Sent",
    value: "sent",
    icon: "heroicons-outline:paper-airplane",
  },

  {
    name: "Drafts",
    value: "drafts",
    icon: "heroicons-outline:pencil-alt",
  },
  {
    name: "Spam",
    value: "spam",
    icon: "heroicons:information-circle",
  },
  {
    name: "Trash",
    value: "trash",
    icon: "heroicons:trash",
  },
];

export const bottomFilterLists = [
  {
    name: "personal",
    value: "personal",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Social",
    value: "social",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Promotions",
    value: "promotions",
    icon: "heroicons:chevron-double-right",
  },
  {
    name: "Business",
    value: "business",
    icon: "heroicons:chevron-double-right",
  },
];

import meetsImage1 from "@/assets/images/svg/sk.svg";
import meetsImage2 from "@/assets/images/svg/path.svg";
import meetsImage3 from "@/assets/images/svg/dc.svg";
import meetsImage4 from "@/assets/images/svg/sk.svg";

export const meets = [
  {
    img: meetsImage1,
    title: "Meeting with client",
    date: "01 Nov 2021",
    meet: "Zoom meeting",
  },
  {
    img: meetsImage2,
    title: "Design meeting (team)",
    date: "01 Nov 2021",
    meet: "Skyp meeting",
  },
  {
    img: meetsImage3,
    title: "Background research",
    date: "01 Nov 2021",
    meet: "Google meeting",
  },
  {
    img: meetsImage4,
    title: "Meeting with client",
    date: "01 Nov 2021",
    meet: "Zoom meeting",
  },
];
import file1Img from "@/assets/images/icon/file-1.svg";
import file2Img from "@/assets/images/icon/pdf-1.svg";
import file3Img from "@/assets/images/icon/zip-1.svg";
import file4Img from "@/assets/images/icon/pdf-2.svg";
import file5Img from "@/assets/images/icon/scr-1.svg";

export const files = [
  {
    img: file1Img,
    title: "Dashboard.fig",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file2Img,
    title: "Ecommerce.pdf",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file3Img,
    title: "Job portal_app.zip",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file4Img,
    title: "Ecommerce.pdf",
    date: "06 June 2021 / 155MB",
  },
  {
    img: file5Img,
    title: "Screenshot.jpg",
    date: "06 June 2021 / 155MB",
  },
];

// ecommarce data

import blackJumper from "@/assets/images/e-commerce/product-card/classical-black-tshirt.png";
import blackTshirt from "@/assets/images/e-commerce/product-card/black-t-shirt.png";
import checkShirt from "@/assets/images/e-commerce/product-card/check-shirt.png";
import grayJumper from "@/assets/images/e-commerce/product-card/gray-jumper.png";
import grayTshirt from "@/assets/images/e-commerce/product-card/gray-t-shirt.png";
import pinkBlazer from "@/assets/images/e-commerce/product-card/pink-blazer.png";
import redTshirt from "@/assets/images/e-commerce/product-card/red-t-shirt.png";
import yellowFrok from "@/assets/images/e-commerce/product-card/yellow-frok.png";
import yellowJumper from "@/assets/images/e-commerce/product-card/yellow-jumper.png";

export const products = [
  {
    img: blackJumper,
    category: "men",
    name: "Classical Black T-Shirt Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt. The best cotton black branded shirt.",
    rating: "4.8",
    price: 489,
    oldPrice: "$700",
    percent: "40%",
    brand: "apple",
  },
  {
    img: blackTshirt,
    category: "men",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 20,
    oldPrice: "$700",
    percent: "40%",
    brand: "apex",
  },
  {
    img: checkShirt,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 120,
    oldPrice: "$700",
    percent: "40%",
    brand: "easy",
  },
  {
    img: grayJumper,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 70,
    oldPrice: "$700",
    percent: "40%",
    brand: "pixel",
  },
  {
    img: grayTshirt,
    category: "baby",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 30,
    oldPrice: "$700",
    percent: "40%",
    brand: "apex",
  },
  {
    img: pinkBlazer,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 40,
    oldPrice: "$700",
    percent: "40%",
    brand: "apple",
  },
  {
    img: redTshirt,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 90,
    oldPrice: "$700",
    percent: "40%",
    brand: "easy",
  },
  {
    img: yellowFrok,
    category: "women",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 80,
    oldPrice: "$700",
    percent: "40%",
    brand: "pixel",
  },
  {
    img: yellowJumper,
    category: "furniture",
    name: "Classical Black T-Shirt",
    subtitle: "The best cotton black branded shirt.",
    desc: "The best cotton black branded shirt",
    rating: "4.8",
    price: 20,
    oldPrice: "$700",
    percent: "40%",
    brand: "samsung",
  },
];

export const categories = [
  { label: "All", value: "all", count: "9724" },
  { label: "Men", value: "men", count: "1312" },
  { label: "Women", value: "women", count: "3752" },
  { label: "Child", value: "child", count: "985" },
  { label: "Baby", value: "baby", count: "745" },
  { label: "Footwear", value: "footwear", count: "1280" },
  { label: "Furniture", value: "furniture", count: "820" },
  { label: "Mobile", value: "mobile", count: "2460" },
];

export const brands = [
  { label: "Apple", value: "apple", count: "9724" },
  { label: "Apex", value: "apex", count: "1312" },
  { label: "Easy", value: "easy", count: "3752" },
  { label: "Pixel", value: "pixel", count: "985" },
  { label: "Samsung", value: "samsung", count: "2460" },
];

export const price = [
  {
    label: "$0 - $199",
    value: {
      min: 0,
      max: 199,
    },
    count: "9724",
  },
  {
    label: "$200 - $449",
    value: {
      min: 200,
      max: 499,
    },
    count: "1312",
  },
  {
    label: "$450 - $599",
    value: {
      min: 450,
      max: 599,
    },
    count: "3752",
  },
  {
    label: "$600 - $799",
    value: {
      min: 600,
      max: 799,
    },
    count: "985",
  },
  {
    label: "$800 & Above",
    value: {
      min: 800,
      max: 1000,
    },
    count: "745",
  },
];

export const ratings = [
  { name: 5, value: 5, count: "9724" },
  { name: 4, value: 4, count: "1312" },
  { name: 3, value: 3, count: "3752" },
  { name: 2, value: 2, count: "985" },
  { name: 1, value: 1, count: "2460" },
];

export const selectOptions = [
  {
    value: "option1",
    label: "Option 1",
  },
  {
    value: "option2",
    label: "Option 2",
  },
  {
    value: "option3",
    label: "Option 3",
  },
];
export const selectCategory = [
  {
    value: "option1",
    label: "Top Rated",
  },
  {
    value: "option2",
    label: "Option 2",
  },
  {
    value: "option3",
    label: "Option 3",
  },
];

import bkash from "@/assets/images/e-commerce/cart-icon/bkash.png";
import fatoorah from "@/assets/images/e-commerce/cart-icon/fatoorah.png";
import instamojo from "@/assets/images/e-commerce/cart-icon/instamojo.png";
import iyzco from "@/assets/images/e-commerce/cart-icon/iyzco.png";
import nagad from "@/assets/images/e-commerce/cart-icon/nagad.png";
import ngenious from "@/assets/images/e-commerce/cart-icon/ngenious.png";
import payfast from "@/assets/images/e-commerce/cart-icon/payfast.png";
import payku from "@/assets/images/e-commerce/cart-icon/payku.png";
import paypal from "@/assets/images/e-commerce/cart-icon/paypal.png";
import paytm from "@/assets/images/e-commerce/cart-icon/paytm.png";
import razorpay from "@/assets/images/e-commerce/cart-icon/razorpay.png";
import ssl from "@/assets/images/e-commerce/cart-icon/ssl.png";
import stripe from "@/assets/images/e-commerce/cart-icon/stripe.png";
import truck from "@/assets/images/e-commerce/cart-icon/truck.png";
import vougepay from "@/assets/images/e-commerce/cart-icon/vougepay.png";

export const payments = [
  {
    img: bkash,
    value: "bkash",
  },
  {
    img: fatoorah,
    value: "fatoorah",
  },
  {
    img: instamojo,
    value: "instamojo",
  },
  {
    img: iyzco,
    value: "iyzco",
  },
  {
    img: nagad,
    value: "nagad",
  },
  {
    img: ngenious,
    value: "ngenious",
  },

  {
    img: payfast,
    value: "payfast",
  },
  {
    img: payku,
    value: "payku",
  },
  {
    img: paypal,
    value: "paypal",
  },
  {
    img: paytm,
    value: "paytm",
  },
  {
    img: razorpay,
    value: "razorpay",
  },
  {
    img: ssl,
    value: "ssl",
  },
  {
    img: stripe,
    value: "stripe",
  },
  {
    img: truck,
    value: "truck",
  },
  {
    img: vougepay,
    value: "vougepay",
  },
];
