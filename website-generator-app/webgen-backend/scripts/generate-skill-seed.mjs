/**
 * Generates the skills seed JSON + Flyway SQL migrations.
 *
 * Run:  node scripts/generate-skill-seed.mjs
 *
 * Outputs:
 *   seed/skills.v1.json                                          (human-editable source of truth)
 *   src/main/resources/db/migration/V{N}__seed_skills_*.sql      (skills inserts)
 *   src/main/resources/db/migration/V{N+1}__seed_skill_aliases_*.sql  (alias inserts)
 *
 * ─── HOW TO ADD A NEW SKILL ───────────────────────────────────────────
 *
 * 1. Find the category array below (ENGINEERING, MARKETING, etc.)
 *    and add an entry in this format:
 *
 *      ["Canonical Skill Name", 1.0, ["Alias One", "Alias Two"]],
 *
 *    - First value  = canonical name (must be unique case-insensitively)
 *    - Second value = weight (keep 1.0 unless clearly justified)
 *    - Third value  = array of aliases (abbreviations, spelling variants, etc.)
 *
 * 2. IMPORTANT: Update the output filenames at the bottom of this file
 *    to the next available Flyway versions. Never overwrite already-applied
 *    migrations (V13/V14). For example, change:
 *
 *      V13__seed_skills_baseline.sql    →  V15__seed_skills_update.sql
 *      V14__seed_skill_aliases_baseline.sql  →  V16__seed_skill_aliases_update.sql
 *
 * 3. Run the script:   node scripts/generate-skill-seed.mjs
 *
 *    It will regenerate the JSON and write new migration files.
 *    The SQL uses upserts (ON CONFLICT / WHERE NOT EXISTS), so existing
 *    rows are safely updated and only new rows are created.
 *
 * 4. The script auto-validates for case-insensitive duplicates across
 *    all skill names and aliases. It will exit with an error if it finds
 *    a collision, or skip and log ambiguous aliases.
 * ──────────────────────────────────────────────────────────────────────
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ── UUID helpers ──────────────────────────────────────────────────────
// Deterministic, valid UUID v4 format: category prefix + sequential number.
// Category codes (hex):  1=eng, 2=mkt, 3=acc, 4=des, 5=bus
// Skill UUIDs:  {cat}0000000-0000-4000-a000-{seq 12 hex}
// Alias UUIDs:  {cat}1000000-0000-4000-a000-{seq 12 hex}
function skillUuid(catCode, seq) {
  return `${catCode}0000000-0000-4000-a000-${seq.toString(16).padStart(12, "0")}`;
}
function aliasUuid(catCode, seq) {
  return `${catCode}1000000-0000-4000-a000-${seq.toString(16).padStart(12, "0")}`;
}

// ── Skill definitions ────────────────────────────────────────────────
// Each entry: [canonical_name, weight, [...aliases]]
// Alias list may be empty (canonical name is enough).

const ENGINEERING = [
  // ── Programming Languages (25) ──
  ["JavaScript", 1.0, ["JS", "ECMAScript", "ES6", "ES2015+", "Vanilla JS"]],
  ["TypeScript", 1.0, ["TS"]],
  ["Python", 1.0, ["Python 3", "Python3", "CPython"]],
  ["Java", 1.0, ["Java SE", "Java EE", "J2EE", "Core Java"]],
  ["C#", 1.0, ["CSharp", "C Sharp", "Csharp"]],
  ["C++", 1.0, ["CPP", "Cpp", "C Plus Plus"]],
  ["C", 1.0, ["C Language", "ANSI C", "C99", "C11"]],
  ["Go", 1.0, ["Golang"]],
  ["Rust", 1.0, ["Rust Lang", "Rustlang"]],
  ["Ruby", 1.0, ["Ruby Language"]],
  ["PHP", 1.0, ["PHP 8", "PHP7"]],
  ["Swift", 1.0, ["Swift Language", "Apple Swift"]],
  ["Kotlin", 1.0, ["Kotlin/JVM"]],
  ["Scala", 1.0, []],
  ["R", 1.0, ["R Language", "R Programming"]],
  ["MATLAB", 1.0, ["Matlab"]],
  ["Perl", 1.0, []],
  ["Haskell", 1.0, []],
  ["Elixir", 1.0, []],
  ["Dart", 1.0, []],
  ["Lua", 1.0, []],
  ["Shell Scripting", 1.0, ["Bash", "Shell", "Bash Scripting", "Zsh", "sh"]],
  ["SQL", 1.0, ["Structured Query Language"]],
  ["HTML", 1.0, ["HTML5"]],
  ["CSS", 1.0, ["CSS3", "Cascading Style Sheets"]],

  // ── Frontend Frameworks (15) ──
  ["React", 1.0, ["React.js", "ReactJS", "React JS"]],
  ["Angular", 1.0, ["Angular 2+", "AngularJS", "Angular.js"]],
  ["Vue.js", 1.0, ["Vue", "VueJS", "Vue JS", "Vue 3"]],
  ["Svelte", 1.0, ["SvelteKit"]],
  ["Next.js", 1.0, ["NextJS", "Next JS", "Nextjs"]],
  ["Nuxt.js", 1.0, ["NuxtJS", "Nuxt"]],
  ["Gatsby", 1.0, ["GatsbyJS", "Gatsby.js"]],
  ["Ember.js", 1.0, ["EmberJS", "Ember"]],
  ["Backbone.js", 1.0, ["BackboneJS", "Backbone"]],
  ["jQuery", 1.0, ["JQuery", "jquery"]],
  ["Bootstrap", 1.0, ["Bootstrap 5", "Bootstrap CSS"]],
  ["Tailwind CSS", 1.0, ["TailwindCSS", "Tailwind"]],
  ["Material UI", 1.0, ["MUI", "Material-UI"]],
  ["Chakra UI", 1.0, ["ChakraUI"]],
  ["Ant Design", 1.0, ["AntD", "Ant Design System"]],

  // ── Backend Frameworks (15) ──
  ["Node.js", 1.0, ["NodeJS", "Node JS", "Node"]],
  ["Express.js", 1.0, ["ExpressJS", "Express"]],
  ["Django", 1.0, ["Django Framework"]],
  ["Flask", 1.0, ["Flask Framework"]],
  ["Spring Boot", 1.0, ["SpringBoot", "Spring Framework", "Spring"]],
  ["Ruby on Rails", 1.0, ["Rails", "RoR"]],
  ["ASP.NET", 1.0, ["ASP.NET Core", "ASPNET", ".NET", "DotNet", "Dotnet Core"]],
  ["FastAPI", 1.0, []],
  ["Laravel", 1.0, ["Laravel Framework"]],
  ["NestJS", 1.0, ["Nest.js", "Nest JS"]],
  ["Gin", 1.0, ["Gin Framework", "Gin-Gonic"]],
  ["Fiber", 1.0, ["GoFiber", "Go Fiber"]],
  ["Phoenix", 1.0, ["Phoenix Framework"]],
  ["Actix Web", 1.0, ["Actix", "Actix-Web"]],
  ["Koa.js", 1.0, ["KoaJS", "Koa"]],

  // ── Databases (15) ──
  ["PostgreSQL", 1.0, ["Postgres", "PG", "psql"]],
  ["MySQL", 1.0, ["MariaDB"]],
  ["MongoDB", 1.0, ["Mongo"]],
  ["Redis", 1.0, ["Redis Cache"]],
  ["Elasticsearch", 1.0, ["Elastic Search", "ES", "ELK"]],
  ["SQLite", 1.0, []],
  ["Oracle Database", 1.0, ["Oracle DB", "OracleDB", "Oracle"]],
  ["Microsoft SQL Server", 1.0, ["MSSQL", "MS SQL", "SQL Server", "T-SQL"]],
  ["Cassandra", 1.0, ["Apache Cassandra"]],
  ["DynamoDB", 1.0, ["AWS DynamoDB", "Amazon DynamoDB"]],
  ["Neo4j", 1.0, ["Neo4J"]],
  ["CouchDB", 1.0, ["Apache CouchDB"]],
  ["Firebase Realtime Database", 1.0, ["Firebase DB", "RTDB"]],
  ["InfluxDB", 1.0, ["Influx"]],
  ["Firestore", 1.0, ["Cloud Firestore", "Google Firestore"]],

  // ── Cloud & Infrastructure (20) ──
  ["Amazon Web Services", 1.0, ["AWS"]],
  ["Google Cloud Platform", 1.0, ["GCP", "Google Cloud"]],
  ["Microsoft Azure", 1.0, ["Azure"]],
  ["Docker", 1.0, ["Docker Containers", "Containerization"]],
  ["Kubernetes", 1.0, ["K8s", "k8s"]],
  ["Terraform", 1.0, ["HashiCorp Terraform", "TF"]],
  ["Ansible", 1.0, ["Ansible Automation"]],
  ["Jenkins", 1.0, ["Jenkins CI"]],
  ["GitHub Actions", 1.0, ["GH Actions", "Github Actions"]],
  ["GitLab CI/CD", 1.0, ["GitLab CI", "GitLab Pipelines"]],
  ["CircleCI", 1.0, ["Circle CI"]],
  ["Nginx", 1.0, ["NGINX", "nginx"]],
  ["Apache HTTP Server", 1.0, ["Apache", "httpd"]],
  ["Vercel", 1.0, []],
  ["Netlify", 1.0, []],
  ["Heroku", 1.0, []],
  ["DigitalOcean", 1.0, ["Digital Ocean", "DO"]],
  ["Cloudflare", 1.0, ["Cloudflare CDN"]],
  ["Pulumi", 1.0, []],
  ["Vagrant", 1.0, ["HashiCorp Vagrant"]],

  // ── DevOps & Observability (15) ──
  ["Git", 1.0, ["Git Version Control", "Git VCS"]],
  ["Linux", 1.0, ["Linux Administration", "Linux Sysadmin", "Ubuntu", "CentOS", "RHEL"]],
  ["CI/CD", 1.0, ["Continuous Integration", "Continuous Delivery", "Continuous Deployment"]],
  ["Prometheus", 1.0, ["Prometheus Monitoring"]],
  ["Grafana", 1.0, ["Grafana Dashboards"]],
  ["Datadog", 1.0, ["DataDog"]],
  ["New Relic", 1.0, ["NewRelic"]],
  ["Splunk", 1.0, []],
  ["ELK Stack", 1.0, ["Elastic Stack", "Logstash", "Kibana"]],
  ["Helm", 1.0, ["Helm Charts"]],
  ["ArgoCD", 1.0, ["Argo CD"]],
  ["HashiCorp Vault", 1.0, ["Vault"]],
  ["Consul", 1.0, ["HashiCorp Consul"]],
  ["Istio", 1.0, ["Istio Service Mesh"]],
  ["Service Mesh", 1.0, []],

  // ── Data & ML (20) ──
  ["TensorFlow", 1.0, ["Tensorflow", "TF"]],
  ["PyTorch", 1.0, ["Pytorch"]],
  ["Scikit-learn", 1.0, ["sklearn", "Scikit Learn", "scikit learn"]],
  ["Pandas", 1.0, ["pandas"]],
  ["NumPy", 1.0, ["Numpy", "numpy"]],
  ["Apache Spark", 1.0, ["Spark", "PySpark"]],
  ["Apache Kafka", 1.0, ["Kafka"]],
  ["Apache Airflow", 1.0, ["Airflow"]],
  ["dbt", 1.0, ["dbt Core", "dbt Cloud", "Data Build Tool"]],
  ["Snowflake", 1.0, ["Snowflake Data Cloud"]],
  ["BigQuery", 1.0, ["Google BigQuery", "GBQ"]],
  ["Amazon Redshift", 1.0, ["Redshift", "AWS Redshift"]],
  ["Tableau", 1.0, []],
  ["Power BI", 1.0, ["PowerBI", "Microsoft Power BI"]],
  ["Looker", 1.0, ["Google Looker"]],
  ["Hadoop", 1.0, ["Apache Hadoop", "HDFS"]],
  ["Apache Hive", 1.0, ["Hive"]],
  ["Presto", 1.0, ["PrestoDB", "Trino"]],
  ["MLflow", 1.0, ["ML Flow"]],
  ["Jupyter", 1.0, ["Jupyter Notebook", "Jupyter Notebooks", "JupyterLab"]],

  // ── Mobile (10) ──
  ["React Native", 1.0, ["ReactNative", "React-Native"]],
  ["Flutter", 1.0, ["Flutter SDK"]],
  ["iOS Development", 1.0, ["iOS Dev", "iPhone Development"]],
  ["Android Development", 1.0, ["Android Dev"]],
  ["Xcode", 1.0, []],
  ["Android Studio", 1.0, []],
  ["SwiftUI", 1.0, ["Swift UI"]],
  ["Jetpack Compose", 1.0, ["Compose"]],
  ["Expo", 1.0, ["Expo SDK"]],
  ["Ionic", 1.0, ["Ionic Framework"]],

  // ── Testing (10) ──
  ["Jest", 1.0, ["Jest Testing"]],
  ["Cypress", 1.0, ["Cypress.io"]],
  ["Selenium", 1.0, ["Selenium WebDriver"]],
  ["Playwright", 1.0, ["Playwright Testing"]],
  ["JUnit", 1.0, ["JUnit 5", "JUnit4"]],
  ["pytest", 1.0, ["Pytest", "py.test"]],
  ["Mocha", 1.0, ["Mocha.js"]],
  ["Chai", 1.0, ["Chai.js"]],
  ["TestNG", 1.0, []],
  ["Robot Framework", 1.0, ["RobotFramework"]],

  // ── Security & Networking (10) ──
  ["OWASP", 1.0, ["OWASP Top 10"]],
  ["Penetration Testing", 1.0, ["Pen Testing", "Pentesting", "Pentest"]],
  ["Cryptography", 1.0, ["Encryption"]],
  ["OAuth", 1.0, ["OAuth 2.0", "OAuth2"]],
  ["JWT", 1.0, ["JSON Web Tokens", "JSON Web Token"]],
  ["SSL/TLS", 1.0, ["SSL", "TLS", "HTTPS"]],
  ["Firewall Management", 1.0, ["Firewalls"]],
  ["VPN", 1.0, ["Virtual Private Network"]],
  ["SIEM", 1.0, ["Security Information and Event Management"]],
  ["SOC Operations", 1.0, ["SOC", "Security Operations Center"]],

  // ── Concepts & Architecture (15) ──
  ["REST API Design", 1.0, ["REST", "RESTful", "REST APIs", "RESTful APIs"]],
  ["GraphQL", 1.0, ["Graph QL"]],
  ["Microservices Architecture", 1.0, ["Microservices", "Micro Services"]],
  ["Event-Driven Architecture", 1.0, ["EDA", "Event Driven Architecture"]],
  ["Domain-Driven Design", 1.0, ["DDD"]],
  ["Agile", 1.0, ["Agile Methodology", "Scrum", "Agile/Scrum", "Kanban"]],
  ["System Design", 1.0, ["Systems Design", "Distributed Systems"]],
  ["Data Structures and Algorithms", 1.0, ["DSA", "Data Structures & Algorithms", "Algorithms"]],
  ["Object-Oriented Programming", 1.0, ["OOP", "Object Oriented Programming"]],
  ["Functional Programming", 1.0, ["FP"]],
  ["Design Patterns", 1.0, ["Software Design Patterns", "GoF Patterns"]],
  ["Clean Architecture", 1.0, ["Hexagonal Architecture", "Onion Architecture"]],
  ["Test-Driven Development", 1.0, ["TDD"]],
  ["WebSockets", 1.0, ["Web Sockets", "Socket.io"]],
  ["gRPC", 1.0, ["GRPC", "Google RPC"]],

  // ── Build & Tooling (10) ──
  ["Webpack", 1.0, ["WebPack"]],
  ["Vite", 1.0, ["ViteJS", "Vite.js"]],
  ["Babel", 1.0, ["BabelJS"]],
  ["ESLint", 1.0, ["Eslint"]],
  ["Prettier", 1.0, []],
  ["Storybook", 1.0, ["StorybookJS"]],
  ["Postman", 1.0, ["Postman API"]],
  ["Swagger", 1.0, ["OpenAPI", "Swagger/OpenAPI", "OpenAPI Specification"]],
  ["RabbitMQ", 1.0, ["Rabbit MQ", "RabbitMQ Messaging"]],
  ["Apache Maven", 1.0, ["Maven"]],
];

const MARKETING = [
  // ── SEO (10) ──
  ["SEO", 1.0, ["Search Engine Optimization"]],
  ["Technical SEO", 1.0, ["Tech SEO"]],
  ["Keyword Research", 1.0, ["KW Research"]],
  ["Link Building", 1.0, ["Backlink Strategy", "Backlinks"]],
  ["On-Page SEO", 1.0, ["On Page SEO", "On-Site SEO"]],
  ["Off-Page SEO", 1.0, ["Off Page SEO", "Off-Site SEO"]],
  ["Local SEO", 1.0, ["Google My Business", "GMB"]],
  ["SEO Auditing", 1.0, ["SEO Audit", "Site Audit"]],
  ["Schema Markup", 1.0, ["Structured Data", "JSON-LD"]],
  ["Core Web Vitals", 1.0, ["CWV", "Page Speed Optimization"]],

  // ── Content (10) ──
  ["Content Marketing", 1.0, ["Content Mktg"]],
  ["Copywriting", 1.0, ["Copy Writing", "Ad Copy"]],
  ["Content Strategy", 1.0, ["Content Planning"]],
  ["Blog Writing", 1.0, ["Blogging", "Blog Management"]],
  ["Technical Writing", 1.0, ["Tech Writing", "Documentation"]],
  ["Ghostwriting", 1.0, ["Ghost Writing"]],
  ["Editorial Planning", 1.0, ["Editorial Calendar"]],
  ["Content Distribution", 1.0, ["Content Syndication"]],
  ["Brand Storytelling", 1.0, ["Brand Narrative"]],
  ["UX Writing", 1.0, ["UX Copywriting", "Microcopy"]],

  // ── Social Media (10) ──
  ["Social Media Marketing", 1.0, ["SMM", "Social Media Management"]],
  ["Instagram Marketing", 1.0, ["Instagram Ads", "IG Marketing"]],
  ["Facebook Advertising", 1.0, ["Facebook Ads", "FB Ads", "Meta Ads"]],
  ["LinkedIn Marketing", 1.0, ["LinkedIn Ads"]],
  ["TikTok Marketing", 1.0, ["TikTok Ads"]],
  ["Twitter Marketing", 1.0, ["X Marketing", "Twitter/X"]],
  ["Pinterest Marketing", 1.0, ["Pinterest Ads"]],
  ["YouTube Marketing", 1.0, ["YouTube Ads", "Video Marketing"]],
  ["Influencer Marketing", 1.0, ["Influencer Outreach", "Creator Marketing"]],
  ["Community Management", 1.0, ["Community Building", "Online Community"]],

  // ── Paid / Performance (10) ──
  ["Google Ads", 1.0, ["Google AdWords", "AdWords", "Google PPC"]],
  ["Pay-Per-Click Advertising", 1.0, ["PPC", "Paid Search"]],
  ["Display Advertising", 1.0, ["Display Ads", "Banner Ads"]],
  ["Programmatic Advertising", 1.0, ["Programmatic Ads", "Programmatic Media Buying"]],
  ["Retargeting", 1.0, ["Remarketing", "Retargeting Ads"]],
  ["Facebook Ads Manager", 1.0, ["Meta Ads Manager", "FB Ads Manager"]],
  ["Conversion Rate Optimization", 1.0, ["CRO"]],
  ["A/B Testing", 1.0, ["Split Testing", "AB Testing", "Multivariate Testing"]],
  ["Attribution Modeling", 1.0, ["Marketing Attribution", "Multi-Touch Attribution"]],
  ["Performance Marketing", 1.0, ["Growth Performance"]],

  // ── Email (8) ──
  ["Email Marketing", 1.0, ["Email Campaigns", "Email Mktg"]],
  ["Mailchimp", 1.0, ["MailChimp"]],
  ["HubSpot Email", 1.0, ["HubSpot Email Marketing"]],
  ["Marketing Automation", 1.0, ["Marketing Ops", "MktOps"]],
  ["Drip Campaigns", 1.0, ["Drip Marketing", "Automated Email Sequences"]],
  ["Newsletter Management", 1.0, ["Email Newsletters"]],
  ["Email Deliverability", 1.0, ["Inbox Placement", "Email Reputation"]],
  ["Klaviyo", 1.0, []],

  // ── Analytics (8) ──
  ["Google Analytics", 1.0, ["GA4", "GA", "Google Analytics 4"]],
  ["Marketing Data Analysis", 1.0, ["Marketing Analytics"]],
  ["Google Tag Manager", 1.0, ["GTM"]],
  ["Mixpanel", 1.0, []],
  ["Amplitude", 1.0, ["Amplitude Analytics"]],
  ["Hotjar", 1.0, ["HotJar"]],
  ["Heap Analytics", 1.0, ["Heap"]],
  ["Segment", 1.0, ["Twilio Segment"]],

  // ── Brand & Strategy (8) ──
  ["Brand Strategy", 1.0, ["Branding", "Brand Development"]],
  ["Market Research", 1.0, ["Consumer Research"]],
  ["Competitive Analysis", 1.0, ["Competitor Research", "Competitive Intelligence"]],
  ["Go-to-Market Strategy", 1.0, ["GTM Strategy", "Go to Market"]],
  ["Product Marketing", 1.0, ["PMM", "Product Mktg"]],
  ["Growth Marketing", 1.0, ["Growth Hacking"]],
  ["Brand Identity", 1.0, ["Brand Guidelines", "Visual Identity"]],
  ["Positioning", 1.0, ["Brand Positioning", "Market Positioning"]],

  // ── PR & Comms (8) ──
  ["Public Relations", 1.0, ["PR"]],
  ["Press Releases", 1.0, ["Press Release Writing"]],
  ["Media Relations", 1.0, ["Media Outreach"]],
  ["Crisis Communications", 1.0, ["Crisis Management", "Crisis PR"]],
  ["Thought Leadership", 1.0, []],
  ["Event Marketing", 1.0, ["Event Planning", "Event Promotion"]],
  ["Sponsorship Marketing", 1.0, ["Sponsorships"]],
  ["Podcast Marketing", 1.0, ["Podcast Production"]],

  // ── Tools & Platforms (8) ──
  ["HubSpot", 1.0, ["HubSpot CRM Marketing", "HubSpot Marketing Hub"]],
  ["Salesforce Marketing Cloud", 1.0, ["SFMC", "Marketing Cloud"]],
  ["Marketo", 1.0, ["Adobe Marketo", "Marketo Engage"]],
  ["Hootsuite", 1.0, []],
  ["Buffer", 1.0, ["Buffer App"]],
  ["Canva", 1.0, ["Canva Design"]],
  ["Ahrefs", 1.0, []],
  ["SEMrush", 1.0, ["Semrush"]],
];

const ACCOUNTING = [
  // ── Financial (10) ──
  ["Financial Analysis", 1.0, ["Financial Analyst Skills"]],
  ["Financial Reporting", 1.0, ["Financial Statements"]],
  ["Financial Modeling", 1.0, ["Financial Models"]],
  ["Budgeting", 1.0, ["Budget Management", "Budget Planning"]],
  ["Forecasting", 1.0, ["Financial Forecasting", "Revenue Forecasting"]],
  ["Cash Flow Management", 1.0, ["Cash Flow Analysis", "Cash Management"]],
  ["Variance Analysis", 1.0, ["Budget Variance"]],
  ["Cost Accounting", 1.0, ["Cost Analysis", "Costing"]],
  ["Revenue Recognition", 1.0, ["ASC 606", "Rev Rec"]],
  ["Financial Planning and Analysis", 1.0, ["FP&A", "FPA"]],

  // ── Tax (8) ──
  ["Tax Preparation", 1.0, ["Tax Prep", "Tax Filing"]],
  ["Tax Planning", 1.0, ["Tax Strategy"]],
  ["Corporate Tax", 1.0, ["Corporate Taxation", "Business Tax"]],
  ["Individual Tax", 1.0, ["Personal Tax", "Individual Taxation"]],
  ["Sales Tax", 1.0, ["Sales & Use Tax", "Indirect Tax"]],
  ["Tax Compliance", 1.0, ["Tax Regulatory Compliance"]],
  ["International Tax", 1.0, ["Global Tax", "Cross-Border Tax"]],
  ["Transfer Pricing", 1.0, ["TP"]],

  // ── Audit (7) ──
  ["Internal Auditing", 1.0, ["Internal Audit"]],
  ["External Auditing", 1.0, ["External Audit", "Statutory Audit"]],
  ["SOX Compliance", 1.0, ["Sarbanes-Oxley", "SOX", "SOX 404"]],
  ["Risk Assessment", 1.0, ["Audit Risk Assessment"]],
  ["Fraud Detection", 1.0, ["Fraud Prevention", "Forensic Accounting"]],
  ["Audit Planning", 1.0, ["Audit Programs"]],
  ["Internal Controls", 1.0, ["Internal Control Framework", "COSO"]],

  // ── Software (8) ──
  ["QuickBooks", 1.0, ["QuickBooks Online", "QBO", "QuickBooks Desktop"]],
  ["SAP", 1.0, ["SAP ERP", "SAP FICO", "SAP S/4HANA"]],
  ["Oracle Financials", 1.0, ["Oracle ERP", "Oracle Cloud Financials"]],
  ["Xero", 1.0, ["Xero Accounting"]],
  ["NetSuite", 1.0, ["Oracle NetSuite", "NetSuite ERP"]],
  ["Sage", 1.0, ["Sage Intacct", "Sage 50"]],
  ["Microsoft Dynamics 365", 1.0, ["Dynamics 365", "D365", "Dynamics GP"]],
  ["BlackLine", 1.0, ["Blackline", "BlackLine Accounting"]],

  // ── Regulatory (6) ──
  ["GAAP", 1.0, ["US GAAP", "Generally Accepted Accounting Principles"]],
  ["IFRS", 1.0, ["International Financial Reporting Standards"]],
  ["Regulatory Compliance", 1.0, ["Financial Compliance"]],
  ["Anti-Money Laundering", 1.0, ["AML", "AML Compliance"]],
  ["Know Your Customer", 1.0, ["KYC", "KYC Compliance"]],
  ["SEC Reporting", 1.0, ["SEC Filings", "10-K", "10-Q"]],

  // ── Operations (6) ──
  ["Accounts Payable", 1.0, ["AP", "A/P"]],
  ["Accounts Receivable", 1.0, ["AR", "A/R"]],
  ["Payroll", 1.0, ["Payroll Processing", "Payroll Administration"]],
  ["General Ledger", 1.0, ["GL", "G/L", "General Ledger Accounting"]],
  ["Bank Reconciliation", 1.0, ["Account Reconciliation", "Reconciliations"]],
  ["Fixed Assets", 1.0, ["Fixed Asset Management", "Asset Accounting"]],
];

const DESIGN = [
  // ── UX (10) ──
  ["UX Design", 1.0, ["User Experience Design", "User Experience", "UXD"]],
  ["User Research", 1.0, ["UX Research", "UXR"]],
  ["Wireframing", 1.0, ["Wireframes", "Lo-Fi Design"]],
  ["Prototyping", 1.0, ["Rapid Prototyping", "Hi-Fi Prototyping"]],
  ["Usability Testing", 1.0, ["User Testing", "UT"]],
  ["Information Architecture", 1.0, ["IA"]],
  ["Interaction Design", 1.0, ["IxD"]],
  ["Design-Oriented Writing", 1.0, ["Design Writing", "Design Copywriting"]],
  ["Accessibility Design", 1.0, ["A11y", "WCAG", "ADA Compliance", "Inclusive Design"]],
  ["Design Systems", 1.0, ["Component Libraries", "Style Guides"]],

  // ── UI (8) ──
  ["UI Design", 1.0, ["User Interface Design", "UID"]],
  ["Visual Design", 1.0, ["Visual Communication"]],
  ["Responsive Design", 1.0, ["Responsive Web Design", "RWD", "Mobile-First Design"]],
  ["Mobile UI Design", 1.0, ["Mobile App Design", "App UI"]],
  ["Web Design", 1.0, ["Website Design"]],
  ["Icon Design", 1.0, ["Iconography"]],
  ["Color Theory", 1.0, ["Color Design"]],
  ["Layout Design", 1.0, ["Grid Systems"]],

  // ── Graphic (8) ──
  ["Graphic Design", 1.0, ["Graphics Design"]],
  ["Logo Design", 1.0, ["Logomark Design", "Brand Mark Design"]],
  ["Brand Design", 1.0, ["Brand Identity Design"]],
  ["Print Design", 1.0, ["Print Layout", "Publication Design"]],
  ["Packaging Design", 1.0, ["Package Design"]],
  ["Typography", 1.0, ["Type Design", "Typographic Design"]],
  ["Illustration", 1.0, ["Digital Illustration"]],
  ["Infographics", 1.0, ["Infographic Design", "Data Visualization Design"]],

  // ── Tools (10) ──
  ["Figma", 1.0, ["Figma Design"]],
  ["Sketch", 1.0, ["Sketch App"]],
  ["Adobe Photoshop", 1.0, ["Photoshop", "PS"]],
  ["Adobe Illustrator", 1.0, ["Illustrator", "AI"]],
  ["Adobe XD", 1.0, ["XD"]],
  ["InVision", 1.0, ["Invision"]],
  ["Framer", 1.0, ["Framer Design"]],
  ["Adobe InDesign", 1.0, ["InDesign"]],
  ["Adobe After Effects", 1.0, ["After Effects", "AE"]],
  ["Blender", 1.0, ["Blender 3D"]],

  // ── Motion & 3D (5) ──
  ["Motion Design", 1.0, ["Motion Graphics"]],
  ["Animation", 1.0, ["2D Animation", "Digital Animation"]],
  ["Video Editing", 1.0, ["Video Production", "Post-Production"]],
  ["3D Modeling", 1.0, ["3D Design", "3D Rendering"]],
  ["AR/VR Design", 1.0, ["Augmented Reality Design", "Virtual Reality Design", "XR Design"]],

  // ── Strategy (4) ──
  ["Design Thinking", 1.0, ["Human-Centered Design", "HCD"]],
  ["Design Strategy", 1.0, ["Strategic Design"]],
  ["Design Leadership", 1.0, ["Design Management"]],
  ["Cross-functional Design Collaboration", 1.0, ["Design Ops", "DesignOps"]],
];

const BUSINESS_SALES = [
  // ── Sales (10) ──
  ["Sales", 1.0, ["Selling"]],
  ["B2B Sales", 1.0, ["Business-to-Business Sales", "Enterprise Sales"]],
  ["B2C Sales", 1.0, ["Business-to-Consumer Sales", "Consumer Sales"]],
  ["Account Management", 1.0, ["Account Mgmt", "Key Account Management", "KAM"]],
  ["Sales Strategy", 1.0, ["Sales Planning"]],
  ["Pipeline Management", 1.0, ["Sales Pipeline", "Deal Pipeline"]],
  ["Cold Outreach", 1.0, ["Cold Calling", "Cold Email", "Outbound Sales"]],
  ["Sales Negotiation", 1.0, ["Negotiation", "Deal Negotiation"]],
  ["Closing", 1.0, ["Deal Closing", "Sales Closing"]],
  ["Territory Management", 1.0, ["Territory Planning"]],

  // ── CRM & Tools (7) ──
  ["Salesforce CRM", 1.0, ["Salesforce", "SFDC"]],
  ["HubSpot CRM", 1.0, ["HubSpot Sales"]],
  ["Pipedrive", 1.0, []],
  ["ZoomInfo", 1.0, ["Zoom Info"]],
  ["LinkedIn Sales Navigator", 1.0, ["Sales Navigator"]],
  ["Gong", 1.0, ["Gong.io"]],
  ["Outreach", 1.0, ["Outreach.io"]],

  // ── Strategy (8) ──
  ["Business Development", 1.0, ["Biz Dev", "BD"]],
  ["Strategic Planning", 1.0, ["Strategy Development"]],
  ["Partnership Development", 1.0, ["Partner Management", "Channel Partnerships"]],
  ["Market Analysis", 1.0, ["Market Intelligence"]],
  ["Business Intelligence", 1.0, ["BI"]],
  ["Stakeholder Management", 1.0, ["Stakeholder Engagement"]],
  ["Vendor Management", 1.0, ["Supplier Management"]],
  ["Contract Negotiation", 1.0, ["Contract Management"]],

  // ── Operations (8) ──
  ["Project Management", 1.0, ["PM", "Project Mgmt"]],
  ["Operations Management", 1.0, ["Ops Management", "Business Operations"]],
  ["Supply Chain Management", 1.0, ["SCM", "Supply Chain"]],
  ["Inventory Management", 1.0, ["Stock Management"]],
  ["Process Improvement", 1.0, ["Business Process Improvement", "BPI"]],
  ["Lean Six Sigma", 1.0, ["Six Sigma", "Lean", "LSS"]],
  ["Change Management", 1.0, ["Organizational Change"]],
  ["Risk Management", 1.0, ["Enterprise Risk Management", "ERM"]],

  // ── Analytics & Ops (6) ──
  ["Business Analysis", 1.0, ["BA", "Business Analyst Skills"]],
  ["Data-Driven Decision Making", 1.0, ["DDDM", "Data-Informed Decisions"]],
  ["KPI Tracking", 1.0, ["KPI Management", "Metrics"]],
  ["Revenue Operations", 1.0, ["RevOps", "Rev Ops"]],
  ["Customer Success", 1.0, ["CS", "Customer Success Management"]],
  ["Client Relations", 1.0, ["Client Management", "Client Services"]],

  // ── Communication (6) ──
  ["Presentation Skills", 1.0, ["Presentations", "Slide Decks"]],
  ["Public Speaking", 1.0, ["Speaking Engagements"]],
  ["Executive Communication", 1.0, ["Exec Communication", "C-Suite Communication"]],
  ["Proposal Writing", 1.0, ["RFP Responses", "Business Proposals"]],
  ["Cross-functional Leadership", 1.0, ["Cross-functional Collaboration"]],
  ["Team Management", 1.0, ["Team Leadership", "People Management"]],
];

// ── Build structured data ──────────────────────────────────────────
const CATEGORIES = [
  { code: "1", name: "engineering", skills: ENGINEERING },
  { code: "2", name: "marketing", skills: MARKETING },
  { code: "3", name: "accounting", skills: ACCOUNTING },
  { code: "4", name: "design", skills: DESIGN },
  { code: "5", name: "business_sales", skills: BUSINESS_SALES },
];

// Detect duplicate aliases and skill names globally
const allNames = new Map();   // lower(name) -> category
const allAliases = new Map(); // lower(alias) -> [skill_name, category]
const skippedAliases = [];

const jsonData = { version: "1.0", generated: new Date().toISOString().split("T")[0], categories: {} };
let globalAliasSeqByCat = {};

for (const cat of CATEGORIES) {
  globalAliasSeqByCat[cat.code] = 0;
  const catSkills = [];

  cat.skills.forEach(([name, weight, aliases], idx) => {
    const seq = idx + 1;
    const id = skillUuid(cat.code, seq);
    const lowerName = name.toLowerCase();

    // Check for duplicate skill name
    if (allNames.has(lowerName)) {
      console.error(`DUPLICATE SKILL NAME: "${name}" in ${cat.name}, already in ${allNames.get(lowerName)}`);
      process.exit(1);
    }
    allNames.set(lowerName, cat.name);

    // Check also that skill name doesn't collide with an alias
    if (allAliases.has(lowerName)) {
      console.error(`SKILL NAME COLLIDES WITH ALIAS: "${name}" (alias for ${allAliases.get(lowerName)[0]})`);
      process.exit(1);
    }

    // Deduplicate aliases
    const cleanAliases = [];
    for (const a of aliases) {
      const la = a.toLowerCase();
      if (la === lowerName) {
        skippedAliases.push({ alias: a, skill: name, reason: "identical to canonical name" });
        continue;
      }
      if (allAliases.has(la)) {
        skippedAliases.push({ alias: a, skill: name, reason: `conflicts with alias for "${allAliases.get(la)[0]}"` });
        continue;
      }
      if (allNames.has(la)) {
        skippedAliases.push({ alias: a, skill: name, reason: `conflicts with canonical skill "${allNames.get(la)}"` });
        continue;
      }
      allAliases.set(la, [name, cat.name]);
      globalAliasSeqByCat[cat.code]++;
      cleanAliases.push({
        id: aliasUuid(cat.code, globalAliasSeqByCat[cat.code]),
        alias: a,
      });
    }

    catSkills.push({ id, name, weight, aliases: cleanAliases });
  });

  jsonData.categories[cat.name] = catSkills;
}

// ── Write JSON ──────────────────────────────────────────────────────
const seedDir = join(ROOT, "seed");
mkdirSync(seedDir, { recursive: true });
writeFileSync(join(seedDir, "skills.v1.json"), JSON.stringify(jsonData, null, 2) + "\n");

// ── Write V13 (skills) ─────────────────────────────────────────────
function escSql(s) {
  return s.replace(/'/g, "''");
}

let v13 = `-- Flyway V13: Seed canonical skills baseline.
-- Source: seed/skills.v1.json
-- Generated: ${jsonData.generated}
--
-- Uses id-based upsert so re-running is safe:
--   ON CONFLICT (id) DO UPDATE SET name, category, weight, updated_at.
-- Future additions must go in new migration files (V15+, etc.).

`;

for (const cat of CATEGORIES) {
  const skills = jsonData.categories[cat.name];
  v13 += `-- ════════════════════════════════════════════════════════════════════\n`;
  v13 += `-- ${cat.name.toUpperCase()} (${skills.length} skills)\n`;
  v13 += `-- ════════════════════════════════════════════════════════════════════\n\n`;

  for (const s of skills) {
    v13 += `INSERT INTO public.skills (id, name, category, weight)\n`;
    v13 += `VALUES ('${s.id}', '${escSql(s.name)}', '${cat.name}', ${s.weight.toFixed(4)})\n`;
    v13 += `ON CONFLICT (id) DO UPDATE\n`;
    v13 += `    SET name       = EXCLUDED.name,\n`;
    v13 += `        category   = EXCLUDED.category,\n`;
    v13 += `        weight     = EXCLUDED.weight,\n`;
    v13 += `        updated_at = now();\n\n`;
  }
}

const migDir = join(ROOT, "src/main/resources/db/migration");
writeFileSync(join(migDir, "V13__seed_skills_baseline.sql"), v13);

// ── Write V14 (aliases) ─────────────────────────────────────────────
let v14 = `-- Flyway V14: Seed skill aliases baseline.
-- Source: seed/skills.v1.json
-- Generated: ${jsonData.generated}
--
-- Uses WHERE NOT EXISTS on lower(alias) to avoid violating the
-- unique index skill_aliases_alias_lower_key.
-- Future additions must go in new migration files (V15+, etc.).

`;

let totalAliases = 0;

for (const cat of CATEGORIES) {
  const skills = jsonData.categories[cat.name];
  const aliasSkills = skills.filter((s) => s.aliases.length > 0);
  const aliasCount = skills.reduce((sum, s) => sum + s.aliases.length, 0);
  totalAliases += aliasCount;

  v14 += `-- ════════════════════════════════════════════════════════════════════\n`;
  v14 += `-- ${cat.name.toUpperCase()} ALIASES (${aliasCount} aliases for ${aliasSkills.length} skills)\n`;
  v14 += `-- ════════════════════════════════════════════════════════════════════\n\n`;

  for (const s of skills) {
    if (s.aliases.length === 0) continue;

    v14 += `-- ${s.name}\n`;
    for (const a of s.aliases) {
      v14 += `INSERT INTO public.skill_aliases (id, skill_id, alias)\n`;
      v14 += `SELECT '${a.id}', '${s.id}', '${escSql(a.alias)}'\n`;
      v14 += `WHERE NOT EXISTS (\n`;
      v14 += `    SELECT 1 FROM public.skill_aliases WHERE lower(alias) = lower('${escSql(a.alias)}')\n`;
      v14 += `);\n`;
    }
    v14 += `\n`;
  }
}

writeFileSync(join(migDir, "V14__seed_skill_aliases_baseline.sql"), v14);

// ── Validation summary ──────────────────────────────────────────────
console.log("=== VALIDATION SUMMARY ===\n");
console.log("Skills by category:");
for (const cat of CATEGORIES) {
  console.log(`  ${cat.name.padEnd(16)} ${jsonData.categories[cat.name].length}`);
}
const totalSkills = CATEGORIES.reduce((s, c) => s + jsonData.categories[c.name].length, 0);
console.log(`  ${"TOTAL".padEnd(16)} ${totalSkills}`);
console.log(`\nTotal aliases: ${totalAliases}`);

if (skippedAliases.length > 0) {
  console.log(`\nSkipped aliases (${skippedAliases.length}):`);
  for (const s of skippedAliases) {
    console.log(`  "${s.alias}" for [${s.skill}]: ${s.reason}`);
  }
}
console.log("\n=== FILES WRITTEN ===");
console.log(`  seed/skills.v1.json`);
console.log(`  src/main/resources/db/migration/V13__seed_skills_baseline.sql`);
console.log(`  src/main/resources/db/migration/V14__seed_skill_aliases_baseline.sql`);
