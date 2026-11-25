# Architecture Diagrams

Source-of-truth versions of every diagram embedded in the main README, kept here so they can be reviewed/edited independently of the README's layout. All diagrams reflect the actual implementation in this repository, not an idealized target.

## 1. Overall test automation architecture

```mermaid
flowchart TB
    DEV["Developer machine"] -->|npx playwright test| RUNNER
    GHA["GitHub Actions"] -->|npx playwright test| RUNNER

    subgraph RUNNER["Playwright Test Runner"]
        UI["UI Test Suite\nPage Object Model"]
        API["API Test Suite\nAPIRequestContext"]
    end

    RUNNER --> SUT["ERPNext (SUT)\nhttp://localhost:8080"]
    SUT --> DB[("MariaDB")]
    SUT --> REDIS[("Redis cache + queue")]

    RUNNER --> REPORT["Playwright HTML Report\nplaywright-report/"]
```

## 2. End-to-end business workflow (Order-to-Cash)

```mermaid
flowchart LR
    C["Customer\ncreated"] --> I["Item\ncreated"]
    I --> Q["Quotation\ncreate + submit"]
    Q -->|"Create ▸ Sales Order"| SO["Sales Order\ncreate + submit"]
    SO -->|"Create ▸ Sales Invoice"| SI["Sales Invoice\ncreate + submit"]
    SI --> T{"Grand totals match\nacross SO → SI?"}
    T -->|yes| PASS["sales-flow.spec.ts passes"]
```

## 3. UI automation architecture (Page Object Model)

```mermaid
flowchart TB
    Base["BaseFormPage\nfillText / fillLink / fillDate\nsave / submit / cancel\nfillChildField / createFrom"]
    Base --> Login["LoginPage"]
    Base --> Customer["CustomerPage"]
    Base --> Item["ItemPage"]
    Base --> Quotation["QuotationPage"]
    Base --> SalesOrder["SalesOrderPage"]
    Base --> SalesInvoice["SalesInvoicePage"]
    Base --> Employee["EmployeePage"]

    Specs["tests/ui/specs/*.spec.ts"] --> Login
    Specs --> Customer
    Specs --> Item
    Specs --> Quotation
    Specs --> SalesOrder
    Specs --> SalesInvoice
    Specs --> Employee
```

## 4. REST API testing workflow

```mermaid
sequenceDiagram
    participant Test as API spec
    participant Helper as apiClient.ts
    participant API as Frappe REST API

    Test->>Helper: createApiContext()
    Helper->>API: POST /api/method/login (usr, pwd)
    API-->>Helper: Set-Cookie: sid=...
    Helper-->>Test: APIRequestContext (session cookie attached)
    Test->>API: POST/GET/PUT/DELETE /api/resource/<Doctype>
    API-->>Test: JSON (data / exception)
    Test->>Test: assert status code + response body
```

## 5. Docker test environment (frappe_docker `pwd.yml`)

```mermaid
flowchart TB
    subgraph Compose["docker compose -f pwd.yml"]
        Frontend["frontend\n(nginx, :8080)"]
        Backend["backend\n(gunicorn)"]
        Scheduler["scheduler\n(cron jobs)"]
        QueueShort["queue-short"]
        QueueLong["queue-long"]
        WS["websocket"]
        DB[("db — MariaDB")]
        RedisCache[("redis-cache")]
        RedisQueue[("redis-queue")]
        Configurator["configurator\n(one-shot)"]
        CreateSite["create-site\n(one-shot)"]
    end

    Frontend --> Backend
    Backend --> DB
    Backend --> RedisCache
    Backend --> RedisQueue
    Scheduler --> DB
    QueueShort --> RedisQueue
    QueueLong --> RedisQueue
    Configurator -.->|runs once, configures| Backend
    CreateSite -.->|runs once, creates site| DB
```

## 6. GitHub Actions CI/CD pipeline

```mermaid
flowchart TB
    Trigger["push / pull_request / workflow_dispatch"] --> Checkout["Checkout erpnext-qa-portfolio"]
    Checkout --> Clone["git clone frappe_docker (depth 1)"]
    Clone --> Up["docker compose -f pwd.yml up -d"]
    Up --> Wait["Poll /api/method/ping\nuntil ERPNext responds"]
    Wait --> Node["Set up Node.js 20"]
    Node --> Install["npm ci"]
    Install --> Browsers["npx playwright install --with-deps chromium"]
    Browsers --> Env["Write .env\n(BASE_URL, ADMIN_USER, ADMIN_PASSWORD)"]
    Env --> Run["npx playwright test"]
    Run --> Upload["Upload playwright-report/\nas build artifact"]
    Upload --> Down["docker compose down\n(always, even on failure)"]
```

## 7. Authentication and session management

```mermaid
flowchart TB
    subgraph UITests["UI tests"]
        Setup["ui/auth.setup.ts\n(setup project)"]
        Wizard{"Landed on\nSetup Wizard?"}
        Complete["Complete Setup Wizard\n(minimal company details)"]
        Storage["Save storageState\nplaywright/.auth/admin.json"]
        Chromium["chromium project\n(depends on setup,\nreuses storageState)"]
        Unauth["unauthenticated project\n(login.spec.ts only,\nno storageState)"]
    end

    subgraph APITests["API tests"]
        ApiClient["apiClient.ts\ncreateApiContext()"]
        SessionLogin["POST /api/method/login\n(usr=Administrator, pwd=admin)"]
    end

    Setup --> Wizard
    Wizard -->|yes| Complete --> Storage
    Wizard -->|no| Storage
    Storage --> Chromium
    Unauth -.->|independent, fresh context| Login2["LoginPage.loginAs()"]

    ApiClient --> SessionLogin --> Cookie["Session cookie reused\nfor subsequent API calls"]
```
