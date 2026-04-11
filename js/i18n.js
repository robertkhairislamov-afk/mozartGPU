/**
 * MOZART i18n — Selector-based internationalisation
 * Languages: English (en), Russian (ru)
 *
 * Architecture:
 *   TRANSLATIONS  – key -> localised string
 *   SELECTORS     – key -> CSS selector (querySelectorAll)
 *   setLanguage() – applies translations + persists choice
 */

(() => {
  'use strict';

  // ─────────────────────────────────────────────
  // TRANSLATIONS
  // ─────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      // ── Navigation (desktop, 4 items) ──
      'nav__why-us':   'WHY US',
      'nav__solutions':'SOLUTIONS',
      'nav__pricing':  'PRICING',
      'nav__contact':  'CONTACT',

      // ── Navigation (mobile) ──
      'mobile-nav__why-us':   'WHY US',
      'mobile-nav__solutions':'SOLUTIONS',
      'mobile-nav__pricing':  'PRICING',
      'mobile-nav__contact':  'CONTACT',

      // ── Hero (crypto-first) ──
      'hero__title':       'GPU Cloud.\nNo KYC.\nPay with Crypto.',
      'hero__cta':         'Rent GPU Now',
      'hero__cta-clone':   'Rent GPU Now',
      'hero__price':       'From $0.45/hr. Pay with BTC, USDT, USDC. No KYC.',
      'hero__description': 'Rent NVIDIA H100, A100, RTX 4090 by the hour. Pay with BTC, USDT, or USDC. No identity verification. SSH access in minutes.',

      // ── Ethos Section ──
      'ethos__label':        'Our approach',
      'ethos__headline':     'Raw Power.\nZero Friction.',
      'ethos__body':         'We provide instant access to the world\'s most powerful GPUs. No long-term contracts. No complex setup. Just raw computing power, ready when you need it, billed by the hour.',
      'ethos__cta':          'Start Computing',
      'ethos__cta-clone':    'Start Computing',
      'ethos-card-1__title': 'Instant Deploy',
      'ethos-card-1__body':  'Launch a GPU instance in under 60 seconds. Pre-configured environments for PyTorch, TensorFlow, and more. No DevOps required.',
      'ethos-card-2__title': 'Pay Per Hour',
      'ethos-card-2__body':  'No upfront costs, no monthly minimums. Pay only for the GPU hours you consume. Transparent pricing with no hidden fees.',
      'ethos-card-3__title': 'Enterprise GPUs',
      'ethos-card-3__body':  'Access NVIDIA H100, A100, L40S, RTX 4090 and more. Data center grade hardware with ECC memory and NVLink interconnects.',
      'ethos-card-4__title': 'Scale Freely',
      'ethos-card-4__body':  'From a single GPU to multi-node clusters. Scale your workloads up or down instantly based on demand. True elastic computing.',

      // ── How It Works (crypto flow) ──
      'hiw__label':      'How It Works',
      'hiw__headline':   'Three Steps to GPU Power',
      'hiw__subline':    'From zero to running GPU in under 60 seconds.',
      'hiw-step-1__title': 'Choose GPU & Package',
      'hiw-step-1__body':  'Pick your GPU \u2014 from RTX 4090 to H100. Select a prepaid hour package. No account required.',
      'hiw-step-2__title': 'Pay with Crypto',
      'hiw-step-2__body':  'Send BTC, USDT, or USDC. Payment confirms in minutes. No KYC, no bank account, no delays.',
      'hiw-step-3__title': 'Get SSH Access',
      'hiw-step-3__body':  'Receive your GPU credentials via Telegram. Pre-installed CUDA, PyTorch, TensorFlow. Start computing immediately.',

      // ── Social Proof Stats ──
      'sp__gpu-models':    'GPU Models',
      'sp__regions':       'Payment Methods',
      'sp__uptime':        'Telegram Support',
      'sp__deploy-time':   'Time to SSH',

      // ── Focus / Fleet ──
      'focus__label':    'Our GPU Fleet',
      'focus__headline': 'Top-tier hardware. Unlimited potential.',
      'focus__body':     'AI training, inference, rendering, simulation, scientific research. Whatever your workload demands, we have the GPU power to match. Enterprise hardware, cloud flexibility.',

      // ── Industries ──
      'industry-1__title': 'AI / ML Training',
      'industry-1__body':  'Train large language models, computer vision systems, and deep learning networks at scale.',
      'industry-2__title': 'AI Inference',
      'industry-2__body':  'Deploy and serve AI models with low latency and high throughput for production workloads.',
      'industry-3__title': 'LLM Fine-tuning',
      'industry-3__body':  'Fine-tune open-source language models with LoRA, QLoRA, and full fine-tuning on high-VRAM GPUs.',
      'industry-4__title': 'Scientific Computing',
      'industry-4__body':  'Run molecular dynamics, climate modeling, and physics simulations on powerful GPU arrays.',
      'industry-5__title': 'AI Agents',
      'industry-5__body':  'Deploy autonomous AI agents with persistent GPU instances for continuous learning and real-time decision making.',
      'industry-6__title': 'Bittensor & DePIN',
      'industry-6__body':  'Run Bittensor subnet miners, DePIN nodes, and decentralized AI workloads with crypto-native GPU infrastructure.',
      'industry-7__title': 'ZK Proofs',
      'industry-7__body':  'Generate zero-knowledge proofs for zkSync, StarkNet, Polygon zkEVM, and Scroll with dedicated GPU compute.',
      'industry-8__title': 'Batch Processing',
      'industry-8__body':  'Process large-scale data workloads efficiently with GPU-accelerated batch computing pipelines.',

      // ── Access Methods Section ──
      'dev__label':    'Access Methods',
      'dev__headline': 'Three Ways to Rent',
      'dev__subline':  'Dashboard UI, Telegram Bot, and BTCPay crypto checkout. No CLI required.',
      'dev__tab_cli':    'Dashboard',
      'dev__tab_python': 'Telegram Bot',
      'dev__tab_api':    'Crypto Payment',

      // ── GPU Catalog / Portfolio ──
      'portfolio__label':    'Available GPUs',
      'portfolio__headline': 'Enterprise hardware. Cloud prices. Instant access.',
      'portfolio__cta':      'View pricing',
      'portfolio__cta-clone':'View pricing',

      // ── Comparison Table ──
      'table__headline':     'Compare All GPUs',
      'table__th-gpu':       'GPU',
      'table__th-vram':      'VRAM',
      'table__th-bandwidth': 'Bandwidth',
      'table__th-tflops':    'TFLOPS',
      'table__th-price':     'Price/hr',
      'table__th-bestfor':   'Best For',
      'table__h100-bestfor': 'LLM training, HPC',
      'table__a100-bestfor': 'ML training, inference',
      'table__l40s-bestfor': 'Inference, rendering',
      'table__4090-bestfor': 'Fine-tuning, dev',
      'table__3090-bestfor': 'Budget ML, rendering',
      'table__footnote':     'Volume discounts available. Contact sales for enterprise pricing.',

      // ── Pricing Packages ──
      'pkg__label':    'Pricing',
      'pkg__headline': 'Prepaid GPU Packages',
      'pkg__subline':  'Buy hours upfront. No subscription. No commitment. Pay with crypto.',
      'pkg1__name':    'RTX 4090 Starter',
      'pkg1__rate':    '10 hours \u00b7 $0.80/hr',
      'pkg1__feat1':   'SSH access in 15 min',
      'pkg1__feat2':   'CUDA 12.4 pre-installed',
      'pkg1__feat3':   '50 GB storage included',
      'pkg2__name':    'A100 Pro',
      'pkg2__rate':    '50 hours \u00b7 $1.60/hr',
      'pkg2__feat1':   'SSH access in 15 min',
      'pkg2__feat2':   'PyTorch / TensorFlow ready',
      'pkg2__feat3':   '100 GB storage included',
      'pkg2__feat4':   'Save 11% vs hourly',
      'pkg3__name':    'H100 Enterprise',
      'pkg3__rate':    '50 hours \u00b7 $2.20/hr',
      'pkg3__feat1':   'SSH access in 15 min',
      'pkg3__feat2':   'vLLM / CUDA 12.4',
      'pkg3__feat3':   '200 GB storage included',
      'pkg3__feat4':   'Save 12% vs hourly',
      'pkg3__feat5':   'Priority support',
      'pkg__cta':      'Pay with Crypto',
      'pkg__cta-clone':'Pay with Crypto',
      'pkg__btcpay':   'Powered by BTCPay Server \u00b7 Self-custodial \u00b7 No intermediaries',

      // ── Pricing \u2014 For Developers ──
      'pricing-dev__label':    'For Developers',
      'pricing-dev__headline': 'Scale your compute. Not your costs.',
      'pricing-dev__body':     'Whether you need a single GPU for a few hours or a cluster for weeks, our flexible pricing adapts to your workload.',
      'pricing-dev__cta':      'Start now',
      'pricing-dev__cta-clone':'Start now',
      'pricing-dev-card-1__title': 'Instant availability',
      'pricing-dev-card-1__body':  'Launch GPU instances in seconds. Pre-installed CUDA, cuDNN, and popular ML frameworks ready to go.',
      'pricing-dev-card-2__title': 'Transparent pricing',
      'pricing-dev-card-2__body':  'Per-hour billing with no hidden costs. Volume discounts for sustained usage. Save up to 40% with reserved instances.',
      'pricing-dev-card-3__title': 'Global infrastructure',
      'pricing-dev-card-3__body':  'Data centers across multiple regions. Low-latency access wherever your team or users are located.',

      // ── Pricing \u2014 For Enterprise ──
      'pricing-ent__label':    'For Enterprise',
      'pricing-ent__headline': 'Dedicated power. Zero compromise.',
      'pricing-ent__body':     'Custom GPU clusters, priority support, and enterprise-grade security for teams that demand the best.',
      'pricing-ent__cta':      'Contact sales',
      'pricing-ent__cta-clone':'Contact sales',
      'pricing-ent-card-1__title': 'Dedicated clusters on demand',
      'pricing-ent-card-1__body':  'Custom multi-GPU and multi-node configurations tailored to your specific workload requirements.',
      'pricing-ent-card-2__title': 'Enterprise SLA & Support',
      'pricing-ent-card-2__body':  '99.9% uptime guarantee. Dedicated support team. Priority hardware allocation and maintenance windows.',
      'pricing-ent-card-3__title': 'Secure & Compliant',
      'pricing-ent-card-3__body':  'Isolated environments. End-to-end encryption. Enterprise-grade security with data residency options.',

      // ── Technology Stack / Partners ──
      'partners__label':    'Technology Stack',
      'partners__headline': 'Built on industry standards.',
      'partners__body':     'Our infrastructure runs on industry-leading hardware and open-source software trusted by millions of developers worldwide.',
      'partners__cta':      'Learn more',
      'partners__cta-clone':'Learn more',
      'partner-nvidia__label':     'GPU Hardware',
      'partner-amd__label':        'CPU Platform',
      'partner-cuda__label':       'Compute SDK',
      'partner-docker__label':     'Containers',
      'partner-kubernetes__label': 'Orchestration',
      'partner-pytorch__label':    'ML Framework',

      // ── FAQ (9 items) ──
      'faq__label':    'FAQ',
      'faq__headline': 'Questions & Answers',
      'faq-1__q': 'What crypto do you accept?',
      'faq-1__a': 'We accept BTC, USDT (TRC-20), and USDC (ERC-20/TRC-20) via BTCPay Server. Payment confirms in 1\u201330 minutes depending on the network.',
      'faq-2__q': 'Do you require KYC?',
      'faq-2__a': 'No. We do not require identity verification, government ID, or bank account linking. Rent GPUs pseudonymously with crypto.',
      'faq-3__q': 'How fast can I get a GPU?',
      'faq-3__a': 'You\'ll receive SSH credentials within 15 minutes of confirmed crypto payment. Automated sub-60s provisioning coming soon.',
      'faq-4__q': 'Do I need a credit card?',
      'faq-4__a': 'No credit card, no bank account needed. Pay with BTC, USDT, or USDC. No KYC or identity verification required.',
      'faq-5__q': 'What software is pre-installed?',
      'faq-5__a': 'All instances come with CUDA, cuDNN, and your choice of PyTorch, TensorFlow, or JAX. Custom Docker images are also supported.',
      'faq-6__q': 'Can I scale to multiple GPUs?',
      'faq-6__a': 'Yes. Request multi-GPU instances (up to 8x per node) or multi-node clusters for distributed training.',
      'faq-7__q': 'What happens if a GPU fails?',
      'faq-7__a': 'We monitor all instances. If a failure occurs, we manually migrate your workload and credit the downtime to your account.',
      'faq-8__q': 'Is my data secure?',
      'faq-8__a': 'All instances run in isolated Docker containers. Your data is accessible only via your SSH key. SOC 2 certification planned for Q3 2026.',
      'faq-9__q': 'Do you offer volume discounts?',
      'faq-9__a': 'Yes. Prepaid hour packages offer 10\u201315% savings. For 100+ GPU-hours per week, contact us on Telegram for custom pricing.',

      // ── Trust Badges ──
      'trust-1': 'Isolated Containers',
      'trust-2': 'Zero KYC Required',
      'trust-3': 'BTC / USDT / USDC Accepted',
      'trust-4': '24/7 Telegram Support',

      // ── Footer ──
      'footer__cta-headline': 'Power your next project.',
      'footer__cta-body':     'GPU by the hour. Crypto payments. No KYC. Start building today.',
      'footer__cta-btn':      'Rent GPU Now',
      'footer__cta-btn-clone':'Rent GPU Now',
      'footer-col-product__heading':  'PRODUCT',
      'footer-link__gpu-catalog':     'GPU Catalog',
      'footer-link__pricing':         'Pricing',
      'footer-link__enterprise':      'Enterprise',
      'footer-link__status':          'Status Page',
      'footer-col-dev__heading':      'DEVELOPERS',
      'footer-link__docs':            'Documentation',
      'footer-link__api':             'API Reference',
      'footer-link__cli':             'CLI Guide',
      'footer-link__sdk':             'Python SDK',
      'footer-col-company__heading':  'COMPANY',
      'footer-link__about':           'About',
      'footer-link__blog':            'Blog',
      'footer-link__careers':         'Careers',
      'footer-link__contact':         'Contact',
      'footer__privacy':   'Privacy Policy',
      'footer__terms':     'Terms and Conditions',
      'footer__cookies':   'Cookie Policy',
      'footer__copyright': 'Copyright \u00a9 2026 MOZART GPU',

      // ── Contact Modal ──
      'modal__headline':         'Get in touch.',
      'modal__telegram-text':    'Fastest way to get started:',
      'modal__telegram-btn':     'Chat on Telegram',
      'modal__telegram-btn-clone':'Chat on Telegram',
      'modal__label-firstname':  'First name *',
      'modal__placeholder-firstname': 'First name',
      'modal__label-lastname':   'Last name *',
      'modal__placeholder-lastname': 'Last name',
      'modal__label-email':      'Email *',
      'modal__placeholder-email':'Email',
      'modal__label-company':    'Company',
      'modal__placeholder-company': 'Company name',
      'modal__label-gpu':        'What GPU do you need?',
      'modal__label-message':    'Message',
      'modal__placeholder-message': 'Tell us about your project (optional)',
      'modal__submit':           'Send message',
      'modal__submit-clone':     'Send message',
      'modal__gpu_other':        'Other',
      'modal__thank_you':        'Thank you! We will contact you soon.',
      'footer__privacy_alert':   'Privacy Policy \u2014 Coming Soon',
      'footer__terms_alert':     'Terms and Conditions \u2014 Coming Soon',
      'footer__cookies_alert':   'Cookie Policy \u2014 Coming Soon',
    },

    // ─────────────────────────────────────────
    ru: {
      // ── Navigation ──
      'nav__why-us':   '\u041e \u041d\u0410\u0421',
      'nav__solutions':'\u0420\u0415\u0428\u0415\u041d\u0418\u042f',
      'nav__pricing':  '\u0426\u0415\u041d\u042b',
      'nav__contact':  '\u041a\u041e\u041d\u0422\u0410\u041a\u0422',
      'mobile-nav__why-us':   '\u041e \u041d\u0410\u0421',
      'mobile-nav__solutions':'\u0420\u0415\u0428\u0415\u041d\u0418\u042f',
      'mobile-nav__pricing':  '\u0426\u0415\u041d\u042b',
      'mobile-nav__contact':  '\u041a\u041e\u041d\u0422\u0410\u041a\u0422',

      // ── Hero ──
      'hero__title':       'GPU \u041e\u0431\u043b\u0430\u043a\u043e.\n\u0411\u0435\u0437 KYC.\n\u041e\u043f\u043b\u0430\u0442\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0439.',
      'hero__cta':         '\u0410\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c GPU',
      'hero__cta-clone':   '\u0410\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c GPU',
      'hero__price':       '\u041e\u0442 $0.45/\u0447\u0430\u0441. \u041e\u043f\u043b\u0430\u0442\u0430 BTC, USDT, USDC. \u0411\u0435\u0437 KYC.',
      'hero__description': '\u0410\u0440\u0435\u043d\u0434\u0430 NVIDIA H100, A100, RTX 4090 \u043f\u043e\u0447\u0430\u0441\u043e\u0432\u043e. \u041e\u043f\u043b\u0430\u0442\u0430 BTC, USDT \u0438\u043b\u0438 USDC. \u0411\u0435\u0437 \u0432\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438. SSH-\u0434\u043e\u0441\u0442\u0443\u043f \u0437\u0430 \u043c\u0438\u043d\u0443\u0442\u044b.',

      // ── Ethos ──
      'ethos__label':        '\u041d\u0430\u0448 \u043f\u043e\u0434\u0445\u043e\u0434',
      'ethos__headline':     '\u0427\u0438\u0441\u0442\u0430\u044f \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c.\n\u0411\u0435\u0437 \u0431\u0430\u0440\u044c\u0435\u0440\u043e\u0432.',
      'ethos__body':         '\u041c\u044b \u043f\u0440\u0435\u0434\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u0435\u043c \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f \u043a \u0441\u0430\u043c\u044b\u043c \u043c\u043e\u0449\u043d\u044b\u043c GPU \u0432 \u043c\u0438\u0440\u0435. \u0411\u0435\u0437 \u0434\u043e\u043b\u0433\u043e\u0441\u0440\u043e\u0447\u043d\u044b\u0445 \u043a\u043e\u043d\u0442\u0440\u0430\u043a\u0442\u043e\u0432. \u0411\u0435\u0437 \u0441\u043b\u043e\u0436\u043d\u043e\u0439 \u043d\u0430\u0441\u0442\u0440\u043e\u0439\u043a\u0438. \u0422\u043e\u043b\u044c\u043a\u043e \u0432\u044b\u0447\u0438\u0441\u043b\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c \u2014 \u043a\u043e\u0433\u0434\u0430 \u043d\u0443\u0436\u043d\u0430, \u0441 \u043e\u043f\u043b\u0430\u0442\u043e\u0439 \u043f\u043e \u0447\u0430\u0441\u0430\u043c.',
      'ethos__cta':          '\u041d\u0430\u0447\u0430\u0442\u044c \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f',
      'ethos__cta-clone':    '\u041d\u0430\u0447\u0430\u0442\u044c \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f',
      'ethos-card-1__title': '\u041c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0439 \u0437\u0430\u043f\u0443\u0441\u043a',
      'ethos-card-1__body':  'GPU-\u0438\u043d\u0441\u0442\u0430\u043d\u0441 \u0433\u043e\u0442\u043e\u0432 \u043c\u0435\u043d\u0435\u0435 \u0447\u0435\u043c \u0437\u0430 60 \u0441\u0435\u043a\u0443\u043d\u0434. \u041f\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0435 \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f \u0434\u043b\u044f PyTorch, TensorFlow \u0438 \u0434\u0440\u0443\u0433\u0438\u0445 \u0444\u0440\u0435\u0439\u043c\u0432\u043e\u0440\u043a\u043e\u0432. DevOps \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f.',
      'ethos-card-2__title': '\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e \u0447\u0430\u0441\u0430\u043c',
      'ethos-card-2__body':  '\u0411\u0435\u0437 \u0430\u0432\u0430\u043d\u0441\u043e\u0432\u044b\u0445 \u043f\u043b\u0430\u0442\u0435\u0436\u0435\u0439 \u0438 \u0435\u0436\u0435\u043c\u0435\u0441\u044f\u0447\u043d\u044b\u0445 \u043c\u0438\u043d\u0438\u043c\u0443\u043c\u043e\u0432. \u041f\u043b\u0430\u0442\u0438\u0442\u0435 \u0442\u043e\u043b\u044c\u043a\u043e \u0437\u0430 \u0444\u0430\u043a\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u043d\u044b\u0435 GPU-\u0447\u0430\u0441\u044b. \u041f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u044b\u0435 \u0446\u0435\u043d\u044b \u0431\u0435\u0437 \u0441\u043a\u0440\u044b\u0442\u044b\u0445 \u043a\u043e\u043c\u0438\u0441\u0441\u0438\u0439.',
      'ethos-card-3__title': '\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0435 GPU',
      'ethos-card-3__body':  '\u0414\u043e\u0441\u0442\u0443\u043f \u043a NVIDIA H100, A100, L40S, RTX 4090 \u0438 \u0434\u0440\u0443\u0433\u0438\u043c \u043c\u043e\u0434\u0435\u043b\u044f\u043c. \u0414\u0430\u0442\u0430-\u0446\u0435\u043d\u0442\u0440\u043e\u0432\u043e\u0435 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435 \u0441 \u043f\u0430\u043c\u044f\u0442\u044c\u044e ECC \u0438 \u0438\u043d\u0442\u0435\u0440\u043a\u043e\u043d\u043d\u0435\u043a\u0442\u0430\u043c\u0438 NVLink.',
      'ethos-card-4__title': '\u0421\u0432\u043e\u0431\u043e\u0434\u043d\u043e\u0435 \u043c\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435',
      'ethos-card-4__body':  '\u041e\u0442 \u043e\u0434\u043d\u043e\u0433\u043e GPU \u0434\u043e \u043c\u043d\u043e\u0433\u043e\u0443\u0437\u043b\u043e\u0432\u044b\u0445 \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u043e\u0432. \u041c\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u0443\u0439\u0442\u0435 \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u043c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u043e \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0438 \u043e\u0442 \u0441\u043f\u0440\u043e\u0441\u0430. \u041d\u0430\u0441\u0442\u043e\u044f\u0449\u0438\u0435 \u044d\u043b\u0430\u0441\u0442\u0438\u0447\u043d\u044b\u0435 \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f.',

      // ── How It Works ──
      'hiw__label':      '\u041a\u0430\u043a \u044d\u0442\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442',
      'hiw__headline':   '\u0422\u0440\u0438 \u0448\u0430\u0433\u0430 \u043a \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u0438 GPU',
      'hiw__subline':    '\u041e\u0442 \u043d\u0443\u043b\u044f \u0434\u043e \u0440\u0430\u0431\u043e\u0442\u0430\u044e\u0449\u0435\u0433\u043e GPU \u043c\u0435\u043d\u0435\u0435 \u0447\u0435\u043c \u0437\u0430 60 \u0441\u0435\u043a\u0443\u043d\u0434.',
      'hiw-step-1__title': '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 GPU \u0438 \u043f\u0430\u043a\u0435\u0442',
      'hiw-step-1__body':  '\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 GPU \u2014 \u043e\u0442 RTX 4090 \u0434\u043e H100. \u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0447\u0435\u043d\u043d\u044b\u0439 \u043f\u0430\u043a\u0435\u0442 \u0447\u0430\u0441\u043e\u0432. \u0410\u043a\u043a\u0430\u0443\u043d\u0442 \u043d\u0435 \u043d\u0443\u0436\u0435\u043d.',
      'hiw-step-2__title': '\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u0435 \u043a\u0440\u0438\u043f\u0442\u043e\u0439',
      'hiw-step-2__body':  '\u041e\u0442\u043f\u0440\u0430\u0432\u044c\u0442\u0435 BTC, USDT \u0438\u043b\u0438 USDC. \u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0441\u044f \u0437\u0430 \u043c\u0438\u043d\u0443\u0442\u044b. \u0411\u0435\u0437 KYC, \u0431\u0435\u0437 \u0431\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e \u0441\u0447\u0451\u0442\u0430, \u0431\u0435\u0437 \u0437\u0430\u0434\u0435\u0440\u0436\u0435\u043a.',
      'hiw-step-3__title': '\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 SSH-\u0434\u043e\u0441\u0442\u0443\u043f',
      'hiw-step-3__body':  '\u041f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 \u0443\u0447\u0451\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 GPU \u0447\u0435\u0440\u0435\u0437 Telegram. \u041f\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u044b CUDA, PyTorch, TensorFlow. \u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f \u043d\u0435\u043c\u0435\u0434\u043b\u0435\u043d\u043d\u043e.',

      // ── Social Proof ──
      'sp__gpu-models':    '\u041c\u043e\u0434\u0435\u043b\u0435\u0439 GPU',
      'sp__regions':       '\u0421\u043f\u043e\u0441\u043e\u0431\u043e\u0432 \u043e\u043f\u043b\u0430\u0442\u044b',
      'sp__uptime':        '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0432 Telegram',
      'sp__deploy-time':   '\u0412\u0440\u0435\u043c\u044f \u0434\u043e SSH',

      // ── Focus / Fleet ──
      'focus__label':    '\u041d\u0430\u0448 \u043f\u0430\u0440\u043a GPU',
      'focus__headline': '\u0422\u043e\u043f\u043e\u0432\u043e\u0435 \u0436\u0435\u043b\u0435\u0437\u043e. \u0411\u0435\u0437\u0433\u0440\u0430\u043d\u0438\u0447\u043d\u044b\u0439 \u043f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b.',
      'focus__body':     '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 \u0418\u0418, \u0438\u043d\u0444\u0435\u0440\u0435\u043d\u0441, \u0440\u0435\u043d\u0434\u0435\u0440\u0438\u043d\u0433, \u0441\u0438\u043c\u0443\u043b\u044f\u0446\u0438\u0438, \u043d\u0430\u0443\u0447\u043d\u044b\u0435 \u0438\u0441\u0441\u043b\u0435\u0434\u043e\u0432\u0430\u043d\u0438\u044f. \u041a\u0430\u043a\u043e\u0439 \u0431\u044b \u043d\u0438 \u0431\u044b\u043b\u0430 \u0432\u0430\u0448\u0430 \u0437\u0430\u0434\u0430\u0447\u0430 \u2014 \u0443 \u043d\u0430\u0441 \u0435\u0441\u0442\u044c \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c \u043f\u043e\u0434 \u043d\u0435\u0451. \u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0435 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435, \u043e\u0431\u043b\u0430\u0447\u043d\u0430\u044f \u0433\u0438\u0431\u043a\u043e\u0441\u0442\u044c.',

      // ── Industries ──
      'industry-1__title': '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 \u0418\u0418 / ML',
      'industry-1__body':  '\u041e\u0431\u0443\u0447\u0430\u0439\u0442\u0435 \u0431\u043e\u043b\u044c\u0448\u0438\u0435 \u044f\u0437\u044b\u043a\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438, \u0441\u0438\u0441\u0442\u0435\u043c\u044b \u043a\u043e\u043c\u043f\u044c\u044e\u0442\u0435\u0440\u043d\u043e\u0433\u043e \u0437\u0440\u0435\u043d\u0438\u044f \u0438 \u0433\u043b\u0443\u0431\u043e\u043a\u0438\u0435 \u043d\u0435\u0439\u0440\u043e\u043d\u043d\u044b\u0435 \u0441\u0435\u0442\u0438 \u0432 \u043b\u044e\u0431\u043e\u043c \u043c\u0430\u0441\u0448\u0442\u0430\u0431\u0435.',
      'industry-2__title': '\u0418\u043d\u0444\u0435\u0440\u0435\u043d\u0441 \u0418\u0418',
      'industry-2__body':  '\u0420\u0430\u0437\u0432\u043e\u0440\u0430\u0447\u0438\u0432\u0430\u0439\u0442\u0435 \u0438 \u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u0418\u0418-\u043c\u043e\u0434\u0435\u043b\u0438 \u0441 \u043d\u0438\u0437\u043a\u043e\u0439 \u0437\u0430\u0434\u0435\u0440\u0436\u043a\u043e\u0439 \u0438 \u0432\u044b\u0441\u043e\u043a\u043e\u0439 \u043f\u0440\u043e\u043f\u0443\u0441\u043a\u043d\u043e\u0439 \u0441\u043f\u043e\u0441\u043e\u0431\u043d\u043e\u0441\u0442\u044c\u044e \u0434\u043b\u044f \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0445 \u043d\u0430\u0433\u0440\u0443\u0437\u043e\u043a.',
      'industry-3__title': '\u0424\u0430\u0439\u043d-\u0442\u044e\u043d\u0438\u043d\u0433 LLM',
      'industry-3__body':  '\u0414\u043e\u043e\u0431\u0443\u0447\u0430\u0439\u0442\u0435 open-source \u044f\u0437\u044b\u043a\u043e\u0432\u044b\u0435 \u043c\u043e\u0434\u0435\u043b\u0438 \u0441 LoRA, QLoRA \u0438 \u043f\u043e\u043b\u043d\u044b\u043c \u0444\u0430\u0439\u043d-\u0442\u044e\u043d\u0438\u043d\u0433\u043e\u043c \u043d\u0430 GPU \u0441 \u0431\u043e\u043b\u044c\u0448\u0438\u043c \u043e\u0431\u044a\u0451\u043c\u043e\u043c VRAM.',
      'industry-4__title': '\u041d\u0430\u0443\u0447\u043d\u044b\u0435 \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f',
      'industry-4__body':  '\u0417\u0430\u043f\u0443\u0441\u043a\u0430\u0439\u0442\u0435 \u043c\u043e\u043b\u0435\u043a\u0443\u043b\u044f\u0440\u043d\u0443\u044e \u0434\u0438\u043d\u0430\u043c\u0438\u043a\u0443, \u043a\u043b\u0438\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u043c\u043e\u0434\u0435\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435 \u0438 \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0441\u0438\u043c\u0443\u043b\u044f\u0446\u0438\u0438 \u043d\u0430 \u043c\u043e\u0449\u043d\u044b\u0445 GPU-\u043c\u0430\u0441\u0441\u0438\u0432\u0430\u0445.',
      'industry-5__title': '\u0418\u0418-\u0430\u0433\u0435\u043d\u0442\u044b',
      'industry-5__body':  '\u0420\u0430\u0437\u0432\u0451\u0440\u0442\u044b\u0432\u0430\u0439\u0442\u0435 \u0430\u0432\u0442\u043e\u043d\u043e\u043c\u043d\u044b\u0445 \u0418\u0418-\u0430\u0433\u0435\u043d\u0442\u043e\u0432 \u043d\u0430 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u044b\u0445 GPU-\u0438\u043d\u0441\u0442\u0430\u043d\u0441\u0430\u0445 \u0434\u043b\u044f \u043d\u0435\u043f\u0440\u0435\u0440\u044b\u0432\u043d\u043e\u0433\u043e \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f \u0438 \u043f\u0440\u0438\u043d\u044f\u0442\u0438\u044f \u0440\u0435\u0448\u0435\u043d\u0438\u0439 \u0432 \u0440\u0435\u0430\u043b\u044c\u043d\u043e\u043c \u0432\u0440\u0435\u043c\u0435\u043d\u0438.',
      'industry-6__title': 'Bittensor \u0438 DePIN',
      'industry-6__body':  '\u0417\u0430\u043f\u0443\u0441\u043a\u0430\u0439\u0442\u0435 \u043c\u0430\u0439\u043d\u0435\u0440\u044b \u043f\u043e\u0434\u0441\u0435\u0442\u0435\u0439 Bittensor, \u0443\u0437\u043b\u044b DePIN \u0438 \u0434\u0435\u0446\u0435\u043d\u0442\u0440\u0430\u043b\u0438\u0437\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u0418\u0418-\u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0438 \u043d\u0430 \u043a\u0440\u0438\u043f\u0442\u043e-\u043d\u0430\u0442\u0438\u0432\u043d\u043e\u0439 GPU-\u0438\u043d\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0435.',
      'industry-7__title': 'ZK-\u0434\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430',
      'industry-7__body':  '\u0413\u0435\u043d\u0435\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u0434\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430 \u0441 \u043d\u0443\u043b\u0435\u0432\u044b\u043c \u0440\u0430\u0437\u0433\u043b\u0430\u0448\u0435\u043d\u0438\u0435\u043c \u0434\u043b\u044f zkSync, StarkNet, Polygon zkEVM \u0438 Scroll \u043d\u0430 \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0445 GPU.',
      'industry-8__title': '\u041f\u0430\u043a\u0435\u0442\u043d\u0430\u044f \u043e\u0431\u0440\u0430\u0431\u043e\u0442\u043a\u0430',
      'industry-8__body':  '\u042d\u0444\u0444\u0435\u043a\u0442\u0438\u0432\u043d\u043e \u043e\u0431\u0440\u0430\u0431\u0430\u0442\u044b\u0432\u0430\u0439\u0442\u0435 \u043a\u0440\u0443\u043f\u043d\u044b\u0435 \u043d\u0430\u0431\u043e\u0440\u044b \u0434\u0430\u043d\u043d\u044b\u0445 \u0441 \u043f\u043e\u043c\u043e\u0449\u044c\u044e GPU-\u0443\u0441\u043a\u043e\u0440\u0435\u043d\u043d\u044b\u0445 \u043a\u043e\u043d\u0432\u0435\u0439\u0435\u0440\u043e\u0432 \u043f\u0430\u043a\u0435\u0442\u043d\u044b\u0445 \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u0439.',

      // ── Access Methods Section ──
      'dev__label':    '\u0421\u043f\u043e\u0441\u043e\u0431\u044b \u0434\u043e\u0441\u0442\u0443\u043f\u0430',
      'dev__headline': '\u0422\u0440\u0438 \u0441\u043f\u043e\u0441\u043e\u0431\u0430 \u0430\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c',
      'dev__subline':  '\u0414\u0430\u0448\u0431\u043e\u0440\u0434, Telegram \u0431\u043e\u0442 \u0438 BTCPay \u043e\u043f\u043b\u0430\u0442\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0432\u0430\u043b\u044e\u0442\u043e\u0439.',
      'dev__tab_cli':    '\u0414\u0430\u0448\u0431\u043e\u0440\u0434',
      'dev__tab_python': 'Telegram Bot',
      'dev__tab_api':    '\u041e\u043f\u043b\u0430\u0442\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0439',

      // ── GPU Catalog ──
      'portfolio__label':    '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b\u0435 GPU',
      'portfolio__headline': '\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u043e\u0435 \u0436\u0435\u043b\u0435\u0437\u043e. \u041e\u0431\u043b\u0430\u0447\u043d\u044b\u0435 \u0446\u0435\u043d\u044b. \u041c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u044b\u0439 \u0434\u043e\u0441\u0442\u0443\u043f.',
      'portfolio__cta':      '\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0446\u0435\u043d\u044b',
      'portfolio__cta-clone':'\u0421\u043c\u043e\u0442\u0440\u0435\u0442\u044c \u0446\u0435\u043d\u044b',

      // ── Comparison Table ──
      'table__headline':     '\u0421\u0440\u0430\u0432\u043d\u0435\u043d\u0438\u0435 \u0432\u0441\u0435\u0445 GPU',
      'table__th-gpu':       'GPU',
      'table__th-vram':      'VRAM',
      'table__th-bandwidth': '\u041f\u0440\u043e\u043f\u0443\u0441\u043a\u043d\u0430\u044f \u0441\u043f\u043e\u0441\u043e\u0431\u043d\u043e\u0441\u0442\u044c',
      'table__th-tflops':    'TFLOPS',
      'table__th-price':     '\u0426\u0435\u043d\u0430/\u0447\u0430\u0441',
      'table__th-bestfor':   '\u041b\u0443\u0447\u0448\u0435 \u0432\u0441\u0435\u0433\u043e \u0434\u043b\u044f',
      'table__h100-bestfor': '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 LLM, HPC',
      'table__a100-bestfor': '\u041e\u0431\u0443\u0447\u0435\u043d\u0438\u0435 ML, \u0438\u043d\u0444\u0435\u0440\u0435\u043d\u0441',
      'table__l40s-bestfor': '\u0418\u043d\u0444\u0435\u0440\u0435\u043d\u0441, \u0440\u0435\u043d\u0434\u0435\u0440\u0438\u043d\u0433',
      'table__4090-bestfor': '\u0424\u0430\u0439\u043d-\u0442\u044e\u043d\u0438\u043d\u0433, \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0430',
      'table__3090-bestfor': '\u0411\u044e\u0434\u0436\u0435\u0442\u043d\u044b\u0439 ML, \u0440\u0435\u043d\u0434\u0435\u0440\u0438\u043d\u0433',
      'table__footnote':     '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0441\u043a\u0438\u0434\u043a\u0438 \u0437\u0430 \u043e\u0431\u044a\u0451\u043c. \u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043e\u0442\u0434\u0435\u043b\u043e\u043c \u043f\u0440\u043e\u0434\u0430\u0436 \u0434\u043b\u044f \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0445 \u0443\u0441\u043b\u043e\u0432\u0438\u0439.',

      // ── Pricing Packages ──
      'pkg__label':    '\u0426\u0435\u043d\u044b',
      'pkg__headline': '\u041f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0447\u0435\u043d\u043d\u044b\u0435 GPU-\u043f\u0430\u043a\u0435\u0442\u044b',
      'pkg__subline':  '\u041a\u0443\u043f\u0438\u0442\u0435 \u0447\u0430\u0441\u044b \u0437\u0430\u0440\u0430\u043d\u0435\u0435. \u0411\u0435\u0437 \u043f\u043e\u0434\u043f\u0438\u0441\u043a\u0438. \u0411\u0435\u0437 \u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u0441\u0442\u0432. \u041e\u043f\u043b\u0430\u0442\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0439.',
      'pkg1__name':    'RTX 4090 \u0421\u0442\u0430\u0440\u0442',
      'pkg1__rate':    '10 \u0447\u0430\u0441\u043e\u0432 \u00b7 $0.80/\u0447\u0430\u0441',
      'pkg1__feat1':   'SSH-\u0434\u043e\u0441\u0442\u0443\u043f \u0437\u0430 15 \u043c\u0438\u043d',
      'pkg1__feat2':   'CUDA 12.4 \u043f\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0430',
      'pkg1__feat3':   '50 \u0413\u0411 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0430',
      'pkg2__name':    'A100 Pro',
      'pkg2__rate':    '50 \u0447\u0430\u0441\u043e\u0432 \u00b7 $1.60/\u0447\u0430\u0441',
      'pkg2__feat1':   'SSH-\u0434\u043e\u0441\u0442\u0443\u043f \u0437\u0430 15 \u043c\u0438\u043d',
      'pkg2__feat2':   'PyTorch / TensorFlow \u0433\u043e\u0442\u043e\u0432\u044b',
      'pkg2__feat3':   '100 \u0413\u0411 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0430',
      'pkg2__feat4':   '\u042d\u043a\u043e\u043d\u043e\u043c\u0438\u044f 11% \u043e\u0442 \u043f\u043e\u0447\u0430\u0441\u043e\u0432\u043e\u0439',
      'pkg3__name':    'H100 Enterprise',
      'pkg3__rate':    '50 \u0447\u0430\u0441\u043e\u0432 \u00b7 $2.20/\u0447\u0430\u0441',
      'pkg3__feat1':   'SSH-\u0434\u043e\u0441\u0442\u0443\u043f \u0437\u0430 15 \u043c\u0438\u043d',
      'pkg3__feat2':   'vLLM / CUDA 12.4',
      'pkg3__feat3':   '200 \u0413\u0411 \u0445\u0440\u0430\u043d\u0438\u043b\u0438\u0449\u0430',
      'pkg3__feat4':   '\u042d\u043a\u043e\u043d\u043e\u043c\u0438\u044f 12% \u043e\u0442 \u043f\u043e\u0447\u0430\u0441\u043e\u0432\u043e\u0439',
      'pkg3__feat5':   '\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
      'pkg__cta':      '\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c \u043a\u0440\u0438\u043f\u0442\u043e\u0439',
      'pkg__cta-clone':'\u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c \u043a\u0440\u0438\u043f\u0442\u043e\u0439',
      'pkg__btcpay':   '\u0420\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043d\u0430 BTCPay Server \u00b7 \u0411\u0435\u0437 \u043f\u043e\u0441\u0440\u0435\u0434\u043d\u0438\u043a\u043e\u0432 \u00b7 \u0421\u0430\u043c\u043e\u043e\u0431\u0441\u043b\u0443\u0436\u0438\u0432\u0430\u043d\u0438\u0435',

      // ── Pricing \u2014 For Developers ──
      'pricing-dev__label':    '\u0414\u043b\u044f \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u043e\u0432',
      'pricing-dev__headline': '\u041c\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u0443\u0439\u0442\u0435 \u0432\u044b\u0447\u0438\u0441\u043b\u0435\u043d\u0438\u044f. \u0410 \u043d\u0435 \u0440\u0430\u0441\u0445\u043e\u0434\u044b.',
      'pricing-dev__body':     '\u041d\u0443\u0436\u0435\u043d \u043e\u0434\u0438\u043d GPU \u043d\u0430 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u0447\u0430\u0441\u043e\u0432 \u0438\u043b\u0438 \u043a\u043b\u0430\u0441\u0442\u0435\u0440 \u043d\u0430 \u043d\u0435\u0434\u0435\u043b\u0438 \u2014 \u043d\u0430\u0448\u0435 \u0433\u0438\u0431\u043a\u043e\u0435 \u0446\u0435\u043d\u043e\u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u0435 \u0430\u0434\u0430\u043f\u0442\u0438\u0440\u0443\u0435\u0442\u0441\u044f \u043f\u043e\u0434 \u0432\u0430\u0448\u0443 \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0443.',
      'pricing-dev__cta':      '\u041d\u0430\u0447\u0430\u0442\u044c \u0441\u0435\u0439\u0447\u0430\u0441',
      'pricing-dev__cta-clone':'\u041d\u0430\u0447\u0430\u0442\u044c \u0441\u0435\u0439\u0447\u0430\u0441',
      'pricing-dev-card-1__title': '\u041c\u0433\u043d\u043e\u0432\u0435\u043d\u043d\u0430\u044f \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u044c',
      'pricing-dev-card-1__body':  'GPU-\u0438\u043d\u0441\u0442\u0430\u043d\u0441\u044b \u0437\u0430\u043f\u0443\u0441\u043a\u0430\u044e\u0442\u0441\u044f \u0437\u0430 \u0441\u0435\u043a\u0443\u043d\u0434\u044b. CUDA, cuDNN \u0438 \u043f\u043e\u043f\u0443\u043b\u044f\u0440\u043d\u044b\u0435 ML-\u0444\u0440\u0435\u0439\u043c\u0432\u043e\u0440\u043a\u0438 \u043f\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u044b \u0438 \u0433\u043e\u0442\u043e\u0432\u044b \u043a \u0440\u0430\u0431\u043e\u0442\u0435.',
      'pricing-dev-card-2__title': '\u041f\u0440\u043e\u0437\u0440\u0430\u0447\u043d\u044b\u0435 \u0446\u0435\u043d\u044b',
      'pricing-dev-card-2__body':  '\u041f\u043e\u0447\u0430\u0441\u043e\u0432\u0430\u044f \u043e\u043f\u043b\u0430\u0442\u0430 \u0431\u0435\u0437 \u0441\u043a\u0440\u044b\u0442\u044b\u0445 \u0437\u0430\u0442\u0440\u0430\u0442. \u0421\u043a\u0438\u0434\u043a\u0438 \u0437\u0430 \u043e\u0431\u044a\u0451\u043c \u043f\u0440\u0438 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u043e\u043c \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u0438. \u0421\u044d\u043a\u043e\u043d\u043e\u043c\u044c\u0442\u0435 \u0434\u043e 40% \u0441 \u0437\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u043c\u0438 \u0438\u043d\u0441\u0442\u0430\u043d\u0441\u0430\u043c\u0438.',
      'pricing-dev-card-3__title': '\u0413\u043b\u043e\u0431\u0430\u043b\u044c\u043d\u0430\u044f \u0438\u043d\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430',
      'pricing-dev-card-3__body':  '\u0414\u0430\u0442\u0430-\u0446\u0435\u043d\u0442\u0440\u044b \u0432 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u0438\u0445 \u0440\u0435\u0433\u0438\u043e\u043d\u0430\u0445. \u041d\u0438\u0437\u043a\u0430\u044f \u0437\u0430\u0434\u0435\u0440\u0436\u043a\u0430 \u0442\u0430\u043c, \u0433\u0434\u0435 \u043d\u0430\u0445\u043e\u0434\u0438\u0442\u0441\u044f \u0432\u0430\u0448\u0430 \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u0438\u043b\u0438 \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u0438.',

      // ── Pricing \u2014 For Enterprise ──
      'pricing-ent__label':    '\u0414\u043b\u044f \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0446\u0438\u0439',
      'pricing-ent__headline': '\u0412\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u0430\u044f \u043c\u043e\u0449\u043d\u043e\u0441\u0442\u044c. \u0411\u0435\u0437 \u043a\u043e\u043c\u043f\u0440\u043e\u043c\u0438\u0441\u0441\u043e\u0432.',
      'pricing-ent__body':     '\u0418\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0435 GPU-\u043a\u043b\u0430\u0441\u0442\u0435\u0440\u044b, \u043f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 \u0438 \u043a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u0430\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u0434\u043b\u044f \u043a\u043e\u043c\u0430\u043d\u0434, \u043a\u043e\u0442\u043e\u0440\u044b\u043c \u043d\u0443\u0436\u043d\u043e \u043b\u0443\u0447\u0448\u0435\u0435.',
      'pricing-ent__cta':      '\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043f\u0440\u043e\u0434\u0430\u0436\u0430\u043c\u0438',
      'pricing-ent__cta-clone':'\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f \u0441 \u043f\u0440\u043e\u0434\u0430\u0436\u0430\u043c\u0438',
      'pricing-ent-card-1__title': '\u0412\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u044b\u0435 \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u044b \u043f\u043e \u0437\u0430\u043f\u0440\u043e\u0441\u0443',
      'pricing-ent-card-1__body':  '\u0418\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0435 \u043a\u043e\u043d\u0444\u0438\u0433\u0443\u0440\u0430\u0446\u0438\u0438 \u0441 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u0438\u043c\u0438 GPU \u0438 \u0443\u0437\u043b\u0430\u043c\u0438, \u0430\u0434\u0430\u043f\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043f\u043e\u0434 \u043a\u043e\u043d\u043a\u0440\u0435\u0442\u043d\u044b\u0435 \u0442\u0440\u0435\u0431\u043e\u0432\u0430\u043d\u0438\u044f \u0432\u0430\u0448\u0435\u0439 \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0438.',
      'pricing-ent-card-2__title': '\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0439 SLA \u0438 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430',
      'pricing-ent-card-2__body':  '\u0413\u0430\u0440\u0430\u043d\u0442\u0438\u044f \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0441\u0442\u0438 99.9%. \u0412\u044b\u0434\u0435\u043b\u0435\u043d\u043d\u0430\u044f \u043a\u043e\u043c\u0430\u043d\u0434\u0430 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0438. \u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442\u043d\u043e\u0435 \u0432\u044b\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f \u0438 \u043f\u043b\u0430\u043d\u043e\u0432\u044b\u0435 \u0440\u0430\u0431\u043e\u0442\u044b \u0432 \u0443\u0434\u043e\u0431\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f.',
      'pricing-ent-card-3__title': '\u0411\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u0438 \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0438\u0435 \u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u0430\u043c',
      'pricing-ent-card-3__body':  '\u0418\u0437\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043e\u043a\u0440\u0443\u0436\u0435\u043d\u0438\u044f. \u0421\u043a\u0432\u043e\u0437\u043d\u043e\u0435 \u0448\u0438\u0444\u0440\u043e\u0432\u0430\u043d\u0438\u0435. \u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u0430\u044f \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u044c \u0441 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u043e\u0439 \u043b\u043e\u043a\u0430\u043b\u044c\u043d\u043e\u0433\u043e \u0445\u0440\u0430\u043d\u0435\u043d\u0438\u044f \u0434\u0430\u043d\u043d\u044b\u0445.',

      // ── Partners ──
      'partners__label':    '\u0422\u0435\u0445\u043d\u043e\u043b\u043e\u0433\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u0441\u0442\u0435\u043a',
      'partners__headline': '\u041f\u043e\u0441\u0442\u0440\u043e\u0435\u043d\u043e \u043d\u0430 \u043e\u0442\u0440\u0430\u0441\u043b\u0435\u0432\u044b\u0445 \u0441\u0442\u0430\u043d\u0434\u0430\u0440\u0442\u0430\u0445.',
      'partners__body':     '\u041d\u0430\u0448\u0430 \u0438\u043d\u0444\u0440\u0430\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0440\u0430\u0431\u043e\u0442\u0430\u0435\u0442 \u043d\u0430 \u0432\u0435\u0434\u0443\u0449\u0435\u043c \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0438 \u0438 \u043e\u0442\u043a\u0440\u044b\u0442\u043e\u043c \u041f\u041e, \u043a\u043e\u0442\u043e\u0440\u043e\u043c\u0443 \u0434\u043e\u0432\u0435\u0440\u044f\u044e\u0442 \u043c\u0438\u043b\u043b\u0438\u043e\u043d\u044b \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u0447\u0438\u043a\u043e\u0432 \u043f\u043e \u0432\u0441\u0435\u043c\u0443 \u043c\u0438\u0440\u0443.',
      'partners__cta':      '\u0423\u0437\u043d\u0430\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435',
      'partners__cta-clone':'\u0423\u0437\u043d\u0430\u0442\u044c \u0431\u043e\u043b\u044c\u0448\u0435',
      'partner-nvidia__label':     '\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435 GPU',
      'partner-amd__label':        '\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u0430 CPU',
      'partner-cuda__label':       'Compute SDK',
      'partner-docker__label':     '\u041a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u044b',
      'partner-kubernetes__label': '\u041e\u0440\u043a\u0435\u0441\u0442\u0440\u0430\u0446\u0438\u044f',
      'partner-pytorch__label':    'ML-\u0444\u0440\u0435\u0439\u043c\u0432\u043e\u0440\u043a',

      // ── FAQ (9 items) ──
      'faq__label':    'FAQ',
      'faq__headline': '\u0412\u043e\u043f\u0440\u043e\u0441\u044b \u0438 \u043e\u0442\u0432\u0435\u0442\u044b',
      'faq-1__q': '\u041a\u0430\u043a\u0443\u044e \u043a\u0440\u0438\u043f\u0442\u043e\u0432\u0430\u043b\u044e\u0442\u0443 \u0432\u044b \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u0442\u0435?',
      'faq-1__a': '\u041c\u044b \u043f\u0440\u0438\u043d\u0438\u043c\u0430\u0435\u043c BTC, USDT (TRC-20) \u0438 USDC (ERC-20/TRC-20) \u0447\u0435\u0440\u0435\u0437 BTCPay Server. \u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0435\u0442\u0441\u044f \u0437\u0430 1\u201330 \u043c\u0438\u043d\u0443\u0442 \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043c\u043e\u0441\u0442\u0438 \u043e\u0442 \u0441\u0435\u0442\u0438.',
      'faq-2__q': '\u0422\u0440\u0435\u0431\u0443\u0435\u0442\u0441\u044f \u043b\u0438 KYC?',
      'faq-2__a': '\u041d\u0435\u0442. \u041c\u044b \u043d\u0435 \u0442\u0440\u0435\u0431\u0443\u0435\u043c \u0432\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438, \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u043e\u0432 \u0438\u043b\u0438 \u043f\u0440\u0438\u0432\u044f\u0437\u043a\u0438 \u0431\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u043e\u0433\u043e \u0441\u0447\u0451\u0442\u0430. \u0410\u0440\u0435\u043d\u0434\u0443\u0439\u0442\u0435 GPU \u043f\u0441\u0435\u0432\u0434\u043e\u043d\u0438\u043c\u043d\u043e \u0437\u0430 \u043a\u0440\u0438\u043f\u0442\u043e\u0432\u0430\u043b\u044e\u0442\u0443.',
      'faq-3__q': '\u041a\u0430\u043a \u0431\u044b\u0441\u0442\u0440\u043e \u044f \u043f\u043e\u043b\u0443\u0447\u0443 GPU?',
      'faq-3__a': '\u0412\u044b \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u0435 SSH-\u0443\u0447\u0451\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435 \u0432 \u0442\u0435\u0447\u0435\u043d\u0438\u0435 15 \u043c\u0438\u043d\u0443\u0442 \u043f\u043e\u0441\u043b\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0438\u044f \u043a\u0440\u0438\u043f\u0442\u043e-\u043f\u043b\u0430\u0442\u0435\u0436\u0430. \u0410\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0435 \u0440\u0430\u0437\u0432\u0451\u0440\u0442\u044b\u0432\u0430\u043d\u0438\u0435 \u043c\u0435\u043d\u0435\u0435 \u0447\u0435\u043c \u0437\u0430 60 \u0441\u0435\u043a\u0443\u043d\u0434 \u2014 \u0441\u043a\u043e\u0440\u043e.',
      'faq-4__q': '\u041d\u0443\u0436\u043d\u0430 \u043b\u0438 \u0431\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u0430\u044f \u043a\u0430\u0440\u0442\u0430?',
      'faq-4__a': '\u0411\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u0430\u044f \u043a\u0430\u0440\u0442\u0430 \u0438 \u0431\u0430\u043d\u043a\u043e\u0432\u0441\u043a\u0438\u0439 \u0441\u0447\u0451\u0442 \u043d\u0435 \u043d\u0443\u0436\u043d\u044b. \u041f\u043b\u0430\u0442\u0438\u0442\u0435 BTC, USDT \u0438\u043b\u0438 USDC. \u0411\u0435\u0437 KYC \u0438 \u0432\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438 \u043b\u0438\u0447\u043d\u043e\u0441\u0442\u0438.',
      'faq-5__q': '\u041a\u0430\u043a\u043e\u0435 \u041f\u041e \u043f\u0440\u0435\u0434\u0443\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043e?',
      'faq-5__a': '\u0412\u0441\u0435 \u0438\u043d\u0441\u0442\u0430\u043d\u0441\u044b \u043f\u043e\u0441\u0442\u0430\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u0441 CUDA, cuDNN \u0438 \u043d\u0430 \u0432\u044b\u0431\u043e\u0440 PyTorch, TensorFlow \u0438\u043b\u0438 JAX. \u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c\u0441\u043a\u0438\u0435 Docker-\u043e\u0431\u0440\u0430\u0437\u044b \u0442\u043e\u0436\u0435 \u043f\u043e\u0434\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044e\u0442\u0441\u044f.',
      'faq-6__q': '\u041c\u043e\u0436\u043d\u043e \u043b\u0438 \u043c\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u043e\u0432\u0430\u0442\u044c\u0441\u044f \u0434\u043e \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u0438\u0445 GPU?',
      'faq-6__a': '\u0414\u0430. \u0417\u0430\u043f\u0440\u0430\u0448\u0438\u0432\u0430\u0439\u0442\u0435 \u043c\u0443\u043b\u044c\u0442\u0438-GPU \u0438\u043d\u0441\u0442\u0430\u043d\u0441\u044b (\u0434\u043e 8 GPU \u043d\u0430 \u0443\u0437\u0435\u043b) \u0438\u043b\u0438 \u043c\u043d\u043e\u0433\u043e\u0443\u0437\u043b\u043e\u0432\u044b\u0435 \u043a\u043b\u0430\u0441\u0442\u0435\u0440\u044b \u0434\u043b\u044f \u0440\u0430\u0441\u043f\u0440\u0435\u0434\u0435\u043b\u0451\u043d\u043d\u043e\u0433\u043e \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f.',
      'faq-7__q': '\u0427\u0442\u043e \u0431\u0443\u0434\u0435\u0442 \u043f\u0440\u0438 \u0441\u0431\u043e\u0435 GPU?',
      'faq-7__a': '\u041c\u044b \u043c\u043e\u043d\u0438\u0442\u043e\u0440\u0438\u043c \u0432\u0441\u0435 \u0438\u043d\u0441\u0442\u0430\u043d\u0441\u044b. \u041f\u0440\u0438 \u0441\u0431\u043e\u0435 \u043c\u044b \u0432\u0440\u0443\u0447\u043d\u0443\u044e \u043f\u0435\u0440\u0435\u043d\u0435\u0441\u0451\u043c \u0432\u0430\u0448\u0443 \u043d\u0430\u0433\u0440\u0443\u0437\u043a\u0443 \u0438 \u0437\u0430\u0447\u0438\u0441\u043b\u0438\u043c \u0432\u0440\u0435\u043c\u044f \u043f\u0440\u043e\u0441\u0442\u043e\u044f \u043d\u0430 \u0432\u0430\u0448 \u0430\u043a\u043a\u0430\u0443\u043d\u0442.',
      'faq-8__q': '\u041c\u043e\u0438 \u0434\u0430\u043d\u043d\u044b\u0435 \u0432 \u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u0438?',
      'faq-8__a': '\u0412\u0441\u0435 \u0438\u043d\u0441\u0442\u0430\u043d\u0441\u044b \u0440\u0430\u0431\u043e\u0442\u0430\u044e\u0442 \u0432 \u0438\u0437\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0445 Docker-\u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u0430\u0445. \u0414\u0430\u043d\u043d\u044b\u0435 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u044b \u0442\u043e\u043b\u044c\u043a\u043e \u0447\u0435\u0440\u0435\u0437 \u0432\u0430\u0448 SSH-\u043a\u043b\u044e\u0447. \u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u044f SOC 2 \u0437\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u0430 \u043d\u0430 Q3 2026.',
      'faq-9__q': '\u0415\u0441\u0442\u044c \u043b\u0438 \u0441\u043a\u0438\u0434\u043a\u0438 \u0437\u0430 \u043e\u0431\u044a\u0451\u043c?',
      'faq-9__a': '\u0414\u0430. \u041f\u0440\u0435\u0434\u043e\u043f\u043b\u0430\u0447\u0435\u043d\u043d\u044b\u0435 \u043f\u0430\u043a\u0435\u0442\u044b \u0447\u0430\u0441\u043e\u0432 \u0434\u0430\u044e\u0442 \u044d\u043a\u043e\u043d\u043e\u043c\u0438\u044e 10\u201315%. \u041f\u0440\u0438 \u043f\u043e\u0442\u0440\u0435\u0431\u043b\u0435\u043d\u0438\u0438 100+ GPU-\u0447\u0430\u0441\u043e\u0432 \u0432 \u043d\u0435\u0434\u0435\u043b\u044e \u0441\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438 \u0432 Telegram \u0434\u043b\u044f \u0438\u043d\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043b\u044c\u043d\u044b\u0445 \u0443\u0441\u043b\u043e\u0432\u0438\u0439.',

      // ── Trust Badges ──
      'trust-1': '\u0418\u0437\u043e\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0435 \u043a\u043e\u043d\u0442\u0435\u0439\u043d\u0435\u0440\u044b',
      'trust-2': '\u0411\u0435\u0437 KYC',
      'trust-3': 'BTC / USDT / USDC',
      'trust-4': '\u041f\u043e\u0434\u0434\u0435\u0440\u0436\u043a\u0430 24/7 \u0432 Telegram',

      // ── Footer ──
      'footer__cta-headline': '\u0417\u0430\u043f\u0443\u0441\u0442\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 \u0441\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u043f\u0440\u043e\u0435\u043a\u0442.',
      'footer__cta-body':     'GPU \u043f\u043e\u0447\u0430\u0441\u043e\u0432\u043e. \u041a\u0440\u0438\u043f\u0442\u043e-\u043e\u043f\u043b\u0430\u0442\u0430. \u0411\u0435\u0437 KYC. \u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0441\u0435\u0433\u043e\u0434\u043d\u044f.',
      'footer__cta-btn':      '\u0410\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c GPU',
      'footer__cta-btn-clone':'\u0410\u0440\u0435\u043d\u0434\u043e\u0432\u0430\u0442\u044c GPU',
      'footer-col-product__heading':  '\u041f\u0420\u041e\u0414\u0423\u041a\u0422',
      'footer-link__gpu-catalog':     '\u041a\u0430\u0442\u0430\u043b\u043e\u0433 GPU',
      'footer-link__pricing':         '\u0426\u0435\u043d\u044b',
      'footer-link__enterprise':      '\u041a\u043e\u0440\u043f\u043e\u0440\u0430\u0442\u0438\u0432\u043d\u044b\u0439',
      'footer-link__status':          '\u0421\u0442\u0430\u0442\u0443\u0441 \u0441\u0435\u0440\u0432\u0438\u0441\u043e\u0432',
      'footer-col-dev__heading':      '\u0420\u0410\u0417\u0420\u0410\u0411\u041e\u0422\u0427\u0418\u041a\u0410\u041c',
      'footer-link__docs':            '\u0414\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430\u0446\u0438\u044f',
      'footer-link__api':             '\u0421\u043f\u0440\u0430\u0432\u043a\u0430 \u043f\u043e API',
      'footer-link__cli':             '\u0420\u0443\u043a\u043e\u0432\u043e\u0434\u0441\u0442\u0432\u043e \u043f\u043e CLI',
      'footer-link__sdk':             'Python SDK',
      'footer-col-company__heading':  '\u041a\u041e\u041c\u041f\u0410\u041d\u0418\u042f',
      'footer-link__about':           '\u041e \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438',
      'footer-link__blog':            '\u0411\u043b\u043e\u0433',
      'footer-link__careers':         '\u0412\u0430\u043a\u0430\u043d\u0441\u0438\u0438',
      'footer-link__contact':         '\u041a\u043e\u043d\u0442\u0430\u043a\u0442',
      'footer__privacy':   '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438',
      'footer__terms':     '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f',
      'footer__cookies':   '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 Cookie',
      'footer__copyright': 'Copyright \u00a9 2026 MOZART GPU',

      // ── Contact Modal ──
      'modal__headline':         '\u0421\u0432\u044f\u0436\u0438\u0442\u0435\u0441\u044c \u0441 \u043d\u0430\u043c\u0438.',
      'modal__telegram-text':    '\u0421\u0430\u043c\u044b\u0439 \u0431\u044b\u0441\u0442\u0440\u044b\u0439 \u0441\u043f\u043e\u0441\u043e\u0431 \u043d\u0430\u0447\u0430\u0442\u044c:',
      'modal__telegram-btn':     '\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 Telegram',
      'modal__telegram-btn-clone':'\u041d\u0430\u043f\u0438\u0441\u0430\u0442\u044c \u0432 Telegram',
      'modal__label-firstname':  '\u0418\u043c\u044f *',
      'modal__placeholder-firstname': '\u0418\u043c\u044f',
      'modal__label-lastname':   '\u0424\u0430\u043c\u0438\u043b\u0438\u044f *',
      'modal__placeholder-lastname': '\u0424\u0430\u043c\u0438\u043b\u0438\u044f',
      'modal__label-email':      'Email *',
      'modal__placeholder-email':'Email',
      'modal__label-company':    '\u041a\u043e\u043c\u043f\u0430\u043d\u0438\u044f',
      'modal__placeholder-company': '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435 \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438',
      'modal__label-gpu':        '\u041a\u0430\u043a\u043e\u0439 GPU \u0432\u0430\u043c \u043d\u0443\u0436\u0435\u043d?',
      'modal__label-message':    '\u0421\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
      'modal__placeholder-message': '\u0420\u0430\u0441\u0441\u043a\u0430\u0436\u0438\u0442\u0435 \u043e \u0432\u0430\u0448\u0435\u043c \u043f\u0440\u043e\u0435\u043a\u0442\u0435 (\u043d\u0435\u043e\u0431\u044f\u0437\u0430\u0442\u0435\u043b\u044c\u043d\u043e)',
      'modal__submit':           '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
      'modal__submit-clone':     '\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u0435',
      'modal__gpu_other':        '\u0414\u0440\u0443\u0433\u043e\u0435',
      'modal__thank_you':        '\u0421\u043f\u0430\u0441\u0438\u0431\u043e! \u041c\u044b \u0441\u0432\u044f\u0436\u0435\u043c\u0441\u044f \u0441 \u0432\u0430\u043c\u0438 \u0432 \u0431\u043b\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043c\u044f.',
      'footer__privacy_alert':   '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u2014 \u0421\u043a\u043e\u0440\u043e',
      'footer__terms_alert':     '\u0423\u0441\u043b\u043e\u0432\u0438\u044f \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u2014 \u0421\u043a\u043e\u0440\u043e',
      'footer__cookies_alert':   '\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 cookies \u2014 \u0421\u043a\u043e\u0440\u043e',
    }
  };

  // ─────────────────────────────────────────────
  // SELECTORS
  // ─────────────────────────────────────────────
  const SELECTORS = {
    // ── Navigation (desktop, 4 items) ──
    'nav__why-us':   '.nav-desktop li:nth-child(1) .nav-link-text',
    'nav__solutions':'.nav-desktop li:nth-child(2) .nav-link-text',
    'nav__pricing':  '.nav-desktop li:nth-child(3) .nav-link-text',
    'nav__contact':  '.nav-desktop li:nth-child(4) .nav-link-text',

    // ── Navigation (mobile) ──
    'mobile-nav__why-us':   '.mobile-menu-list .mobile-menu-item:nth-child(1) a',
    'mobile-nav__solutions':'.mobile-menu-list .mobile-menu-item:nth-child(2) a',
    'mobile-nav__pricing':  '.mobile-menu-list .mobile-menu-item:nth-child(3) a',
    'mobile-nav__contact':  '.mobile-menu-list .mobile-menu-item:nth-child(4) a',

    // ── Hero ──
    'hero__cta':         '.hero .btn-text',
    'hero__cta-clone':   '.hero .btn-text-clone',
    'hero__price':       '.hero-price',
    'hero__description': '.hero-description',

    // ── Ethos Section ──
    'ethos__label':        '.ethos-header > div:first-child > h2',
    'ethos__headline':     '.ethos-header .h5.uppercase',
    'ethos__body':         '.ethos-header > div:last-child > p.p1',
    'ethos__cta':          '.ethos-header .btn .btn-text',
    'ethos__cta-clone':    '.ethos-header .btn .btn-text-clone',
    'ethos-card-1__title': '.ethos-card-1 .ethos-card-content h3',
    'ethos-card-1__body':  '.ethos-card-1 .ethos-card-content .p2-mono p:last-child',
    'ethos-card-2__title': '.ethos-card-2 .ethos-card-content h3',
    'ethos-card-2__body':  '.ethos-card-2 .ethos-card-content .p2-mono p:last-child',
    'ethos-card-3__title': '.ethos-card-3 .ethos-card-content h3',
    'ethos-card-3__body':  '.ethos-card-3 .ethos-card-content .p2-mono p:last-child',
    'ethos-card-4__title': '.ethos-card-4 .ethos-card-content h3',
    'ethos-card-4__body':  '.ethos-card-4 .ethos-card-content .p2-mono p:last-child',

    // ── How It Works ──
    'hiw__label':        '.hiw-header > span',
    'hiw__headline':     '.hiw-header > h2',
    'hiw__subline':      '.hiw-header > p',
    'hiw-step-1__title': '.hiw-steps .hiw-step:nth-child(1) h3',
    'hiw-step-1__body':  '.hiw-steps .hiw-step:nth-child(1) p',
    'hiw-step-2__title': '.hiw-steps .hiw-step:nth-child(2) h3',
    'hiw-step-2__body':  '.hiw-steps .hiw-step:nth-child(2) p',
    'hiw-step-3__title': '.hiw-steps .hiw-step:nth-child(3) h3',
    'hiw-step-3__body':  '.hiw-steps .hiw-step:nth-child(3) p',

    // ── Social Proof ──
    'sp__gpu-models':  '.sp-stat:nth-child(1) .sp-label',
    'sp__regions':     '.sp-stat:nth-child(2) .sp-label',
    'sp__uptime':      '.sp-stat:nth-child(3) .sp-label',
    'sp__deploy-time': '.sp-stat:nth-child(4) .sp-label',

    // ── Focus / Fleet ──
    'focus__label':    '.focus-content h2',
    'focus__headline': '.focus-content h3',
    'focus__body':     '.focus-content p',

    // ── Industries ──
    'industry-1__title': '.industry-item:nth-child(1) .industry-title',
    'industry-1__body':  '.industry-item:nth-child(1) .industry-description p',
    'industry-2__title': '.industry-item:nth-child(2) .industry-title',
    'industry-2__body':  '.industry-item:nth-child(2) .industry-description p',
    'industry-3__title': '.industry-item:nth-child(3) .industry-title',
    'industry-3__body':  '.industry-item:nth-child(3) .industry-description p',
    'industry-4__title': '.industry-item:nth-child(4) .industry-title',
    'industry-4__body':  '.industry-item:nth-child(4) .industry-description p',
    'industry-5__title': '.industry-item:nth-child(5) .industry-title',
    'industry-5__body':  '.industry-item:nth-child(5) .industry-description p',
    'industry-6__title': '.industry-item:nth-child(6) .industry-title',
    'industry-6__body':  '.industry-item:nth-child(6) .industry-description p',
    'industry-7__title': '.industry-item:nth-child(7) .industry-title',
    'industry-7__body':  '.industry-item:nth-child(7) .industry-description p',
    'industry-8__title': '.industry-item:nth-child(8) .industry-title',
    'industry-8__body':  '.industry-item:nth-child(8) .industry-description p',

    // ── Access Methods Section ──
    'dev__label':    '.dev-header > span',
    'dev__headline': '.dev-header > h2',
    'dev__subline':  '.dev-header > p',
    'dev__tab_cli':    '.dev-tabs .dev-tab[data-tab="dashboard"]',
    'dev__tab_python': '.dev-tabs .dev-tab[data-tab="telegram"]',
    'dev__tab_api':    '.dev-tabs .dev-tab[data-tab="crypto"]',

    // ── GPU Catalog / Portfolio ──
    'portfolio__label':    '.portfolio-header h2',
    'portfolio__headline': '.portfolio-header p.h5',
    'portfolio__cta':      '.portfolio-header .btn .btn-text',
    'portfolio__cta-clone':'.portfolio-header .btn .btn-text-clone',

    // ── Comparison Table ──
    'table__headline':     '.pricing-table-wrap > h3',
    'table__th-gpu':       '.pricing-table thead th:nth-child(1)',
    'table__th-vram':      '.pricing-table thead th:nth-child(2)',
    'table__th-bandwidth': '.pricing-table thead th:nth-child(3)',
    'table__th-tflops':    '.pricing-table thead th:nth-child(4)',
    'table__th-price':     '.pricing-table thead th:nth-child(5)',
    'table__th-bestfor':   '.pricing-table thead th:nth-child(6)',
    'table__h100-bestfor': '.pricing-table tbody tr:nth-child(1) td:nth-child(6)',
    'table__a100-bestfor': '.pricing-table tbody tr:nth-child(2) td:nth-child(6)',
    'table__l40s-bestfor': '.pricing-table tbody tr:nth-child(3) td:nth-child(6)',
    'table__4090-bestfor': '.pricing-table tbody tr:nth-child(4) td:nth-child(6)',
    'table__3090-bestfor': '.pricing-table tbody tr:nth-child(5) td:nth-child(6)',
    'table__footnote':     '.pricing-table-wrap > p',

    // ── Pricing Packages ──
    'pkg__label':     '#packages > .container > div:first-child > span',
    'pkg__headline':  '#packages > .container > div:first-child > h2',
    'pkg__subline':   '#packages > .container > div:first-child > p',
    'pkg1__name':     '.pricing-packages > .pricing-package:nth-child(1) > h3',
    'pkg1__rate':     '.pricing-packages > .pricing-package:nth-child(1) > .pricing-package-rate',
    'pkg1__feat1':    '.pricing-packages > .pricing-package:nth-child(1) .pricing-package-features li:nth-child(1)',
    'pkg1__feat2':    '.pricing-packages > .pricing-package:nth-child(1) .pricing-package-features li:nth-child(2)',
    'pkg1__feat3':    '.pricing-packages > .pricing-package:nth-child(1) .pricing-package-features li:nth-child(3)',
    'pkg2__name':     '.pricing-packages > .pricing-package:nth-child(2) > h3',
    'pkg2__rate':     '.pricing-packages > .pricing-package:nth-child(2) > .pricing-package-rate',
    'pkg2__feat1':    '.pricing-packages > .pricing-package:nth-child(2) .pricing-package-features li:nth-child(1)',
    'pkg2__feat2':    '.pricing-packages > .pricing-package:nth-child(2) .pricing-package-features li:nth-child(2)',
    'pkg2__feat3':    '.pricing-packages > .pricing-package:nth-child(2) .pricing-package-features li:nth-child(3)',
    'pkg2__feat4':    '.pricing-packages > .pricing-package:nth-child(2) .pricing-package-features li:nth-child(4)',
    'pkg3__name':     '.pricing-packages > .pricing-package:nth-child(3) > h3',
    'pkg3__rate':     '.pricing-packages > .pricing-package:nth-child(3) > .pricing-package-rate',
    'pkg3__feat1':    '.pricing-packages > .pricing-package:nth-child(3) .pricing-package-features li:nth-child(1)',
    'pkg3__feat2':    '.pricing-packages > .pricing-package:nth-child(3) .pricing-package-features li:nth-child(2)',
    'pkg3__feat3':    '.pricing-packages > .pricing-package:nth-child(3) .pricing-package-features li:nth-child(3)',
    'pkg3__feat4':    '.pricing-packages > .pricing-package:nth-child(3) .pricing-package-features li:nth-child(4)',
    'pkg3__feat5':    '.pricing-packages > .pricing-package:nth-child(3) .pricing-package-features li:nth-child(5)',
    'pkg__cta':       '.pricing-package .btn .btn-text',
    'pkg__cta-clone': '.pricing-package .btn .btn-text-clone',
    'pkg__btcpay':    '#packages > .container > p:last-child',

    // ── Pricing — For Developers ──
    'pricing-dev__label':    '.investors-founders > div:nth-child(2) .if-sticky-header h2',
    'pricing-dev__headline': '.investors-founders > div:nth-child(2) .if-sticky-header p',
    'pricing-dev__body':     '.investors-founders > div:nth-child(2) .if-sticky-desc',
    'pricing-dev__cta':      '.investors-founders > div:nth-child(2) .if-sticky .btn .btn-text',
    'pricing-dev__cta-clone':'.investors-founders > div:nth-child(2) .if-sticky .btn .btn-text-clone',
    'pricing-dev-card-1__title': '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(1) h3',
    'pricing-dev-card-1__body':  '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(1) .if-card-bottom p.p1',
    'pricing-dev-card-2__title': '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(2) h3',
    'pricing-dev-card-2__body':  '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(2) .if-card-bottom p.p1',
    'pricing-dev-card-3__title': '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(3) h3',
    'pricing-dev-card-3__body':  '.investors-founders > div:nth-child(2) .if-cards .if-card:nth-child(3) .if-card-bottom p.p1',

    // ── Pricing — For Enterprise ──
    'pricing-ent__label':    '.investors-founders > div:nth-child(3) .if-sticky-header h2',
    'pricing-ent__headline': '.investors-founders > div:nth-child(3) .if-sticky-header p',
    'pricing-ent__body':     '.investors-founders > div:nth-child(3) .if-sticky-desc',
    'pricing-ent__cta':      '.investors-founders > div:nth-child(3) .if-sticky .btn .btn-text',
    'pricing-ent__cta-clone':'.investors-founders > div:nth-child(3) .if-sticky .btn .btn-text-clone',
    'pricing-ent-card-1__title': '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(1) h3',
    'pricing-ent-card-1__body':  '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(1) .if-card-bottom p.p1',
    'pricing-ent-card-2__title': '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(2) h3',
    'pricing-ent-card-2__body':  '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(2) .if-card-bottom p.p1',
    'pricing-ent-card-3__title': '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(3) h3',
    'pricing-ent-card-3__body':  '.investors-founders > div:nth-child(3) .if-cards .if-card:nth-child(3) .if-card-bottom p.p1',

    // ── Technology Stack / Partners ──
    'partners__label':    '.partners-left .if-sticky-header h2',
    'partners__headline': '.partners-left .if-sticky-header h3',
    'partners__body':     '.partners-left > p',
    'partners__cta':      '.partners-left .btn .btn-text',
    'partners__cta-clone':'.partners-left .btn .btn-text-clone',
    'partner-nvidia__label':     '.partner-logo:nth-child(1) .partner-label',
    'partner-amd__label':        '.partner-logo:nth-child(2) .partner-label',
    'partner-cuda__label':       '.partner-logo:nth-child(3) .partner-label',
    'partner-docker__label':     '.partner-logo:nth-child(4) .partner-label',
    'partner-kubernetes__label': '.partner-logo:nth-child(5) .partner-label',
    'partner-pytorch__label':    '.partner-logo:nth-child(6) .partner-label',

    // ── FAQ (9 items) ──
    'faq__label':    '.faq-header > span',
    'faq__headline': '.faq-header > h2',
    'faq-1__q': '.faq-item:nth-child(1) .faq-question',
    'faq-1__a': '.faq-item:nth-child(1) .faq-answer p',
    'faq-2__q': '.faq-item:nth-child(2) .faq-question',
    'faq-2__a': '.faq-item:nth-child(2) .faq-answer p',
    'faq-3__q': '.faq-item:nth-child(3) .faq-question',
    'faq-3__a': '.faq-item:nth-child(3) .faq-answer p',
    'faq-4__q': '.faq-item:nth-child(4) .faq-question',
    'faq-4__a': '.faq-item:nth-child(4) .faq-answer p',
    'faq-5__q': '.faq-item:nth-child(5) .faq-question',
    'faq-5__a': '.faq-item:nth-child(5) .faq-answer p',
    'faq-6__q': '.faq-item:nth-child(6) .faq-question',
    'faq-6__a': '.faq-item:nth-child(6) .faq-answer p',
    'faq-7__q': '.faq-item:nth-child(7) .faq-question',
    'faq-7__a': '.faq-item:nth-child(7) .faq-answer p',
    'faq-8__q': '.faq-item:nth-child(8) .faq-question',
    'faq-8__a': '.faq-item:nth-child(8) .faq-answer p',
    'faq-9__q': '.faq-item:nth-child(9) .faq-question',
    'faq-9__a': '.faq-item:nth-child(9) .faq-answer p',

    // ── Trust Badges ──
    'trust-1': '.trust-badge:nth-child(1) .p3-mono',
    'trust-2': '.trust-badge:nth-child(2) .p3-mono',
    'trust-3': '.trust-badge:nth-child(3) .p3-mono',
    'trust-4': '.trust-badge:nth-child(4) .p3-mono',

    // ── Footer ──
    'footer__cta-headline': '.footer-cta h2',
    'footer__cta-body':     '.footer-cta p',
    'footer__cta-btn':      '.footer-cta .btn .btn-text',
    'footer__cta-btn-clone':'.footer-cta .btn .btn-text-clone',
    'footer-col-product__heading':  '.footer-col:nth-child(1) h4',
    'footer-link__gpu-catalog':     '.footer-col:nth-child(1) li:nth-child(1) a',
    'footer-link__pricing':         '.footer-col:nth-child(1) li:nth-child(2) a',
    'footer-link__enterprise':      '.footer-col:nth-child(1) li:nth-child(3) a',
    'footer-link__status':          '.footer-col:nth-child(1) li:nth-child(4) span',
    'footer-col-dev__heading':      '.footer-col:nth-child(2) h4',
    'footer-link__docs':            '.footer-col:nth-child(2) li:nth-child(1) a',
    'footer-link__api':             '.footer-col:nth-child(2) li:nth-child(2) span',
    'footer-link__cli':             '.footer-col:nth-child(2) li:nth-child(3) span',
    'footer-link__sdk':             '.footer-col:nth-child(2) li:nth-child(4) span',
    'footer-col-company__heading':  '.footer-col:nth-child(3) h4',
    'footer-link__about':           '.footer-col:nth-child(3) li:nth-child(1) a',
    'footer-link__blog':            '.footer-col:nth-child(3) li:nth-child(2) span',
    'footer-link__careers':         '.footer-col:nth-child(3) li:nth-child(3) span',
    'footer-link__contact':         '.footer-col:nth-child(3) li:nth-child(4) a',
    'footer__privacy':   '.footer-legal__item:nth-child(1)',
    'footer__terms':     '.footer-legal__item:nth-child(2)',
    'footer__cookies':   '.footer-legal__item:nth-child(3)',
    'footer__copyright': '.footer-copyright p',

    // ── Contact Modal ──
    'modal__headline':           '.modal-panel h2',
    'modal__telegram-text':      '.modal-panel p.p1-mono',
    'modal__telegram-btn':       '.modal-panel a.btn .btn-text',
    'modal__telegram-btn-clone': '.modal-panel a.btn .btn-text-clone',
    'modal__label-firstname':  'label[for="firstName"]',
    'modal__label-lastname':   'label[for="lastName"]',
    'modal__label-email':      'label[for="email"]',
    'modal__label-company':    'label[for="company"]',
    'modal__label-gpu':        '.form-group:has(.form-radio-group) > .form-label',
    'modal__label-message':    'label[for="message"]',
    'modal__submit':           '.modal-panel form .btn .btn-text',
    'modal__submit-clone':     '.modal-panel form .btn .btn-text-clone',
    'modal__gpu_other':        '.form-radio-group .form-radio:last-child',
  };

  // Keys that need placeholder attribute updates
  const PLACEHOLDER_SELECTORS = {
    'modal__placeholder-firstname': '#firstName',
    'modal__placeholder-lastname':  '#lastName',
    'modal__placeholder-email':     '#email',
    'modal__placeholder-company':   '#company',
    'modal__placeholder-message':   '#message',
  };

  // ─────────────────────────────────────────────
  // RADIO LABEL TEXT — preserve the <input> child
  // ─────────────────────────────────────────────
  const RADIO_LABEL_KEYS = new Set(['modal__gpu_other']);

  function setRadioLabelText(el, text) {
    for (let i = el.childNodes.length - 1; i >= 0; i--) {
      if (el.childNodes[i].nodeType === Node.TEXT_NODE) {
        el.childNodes[i].textContent = ' ' + text;
        return;
      }
    }
    el.appendChild(document.createTextNode(' ' + text));
  }

  // ─────────────────────────────────────────────
  // FAQ ICON PRESERVATION
  // ─────────────────────────────────────────────
  const FAQ_QUESTION_KEYS = new Set([
    'faq-1__q','faq-2__q','faq-3__q','faq-4__q',
    'faq-5__q','faq-6__q','faq-7__q','faq-8__q','faq-9__q'
  ]);

  function setFaqQuestion(el, text) {
    const icon = el.querySelector('.faq-icon');
    el.textContent = text;
    if (icon) el.appendChild(icon);
  }

  // ─────────────────────────────────────────────
  // HERO TITLE — multiline using <br> tags
  // ─────────────────────────────────────────────
  function setHeroTitle(text) {
    const el = document.querySelector('.hero-title');
    if (!el) return;
    el.innerHTML = text.replace(/\n/g, '<br>');
  }

  // ─────────────────────────────────────────────
  // setLanguage — core function
  // ─────────────────────────────────────────────
  function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) return;

    document.documentElement.lang = lang;
    localStorage.setItem('mozart-lang', lang);

    const t = TRANSLATIONS[lang];

    // ── Hero title (special multiline handling) ──
    if (t['hero__title']) setHeroTitle(t['hero__title']);

    // ── All standard text nodes ──
    for (const [key, text] of Object.entries(t)) {
      if (key === 'hero__title') continue;
      if (!SELECTORS[key]) continue;

      const els = document.querySelectorAll(SELECTORS[key]);
      els.forEach(el => {
        if (FAQ_QUESTION_KEYS.has(key)) {
          setFaqQuestion(el, text);
        } else if (RADIO_LABEL_KEYS.has(key)) {
          setRadioLabelText(el, text);
        } else {
          el.textContent = text;
        }
      });
    }

    // ── Placeholder attributes ──
    for (const [key, selector] of Object.entries(PLACEHOLDER_SELECTORS)) {
      if (!t[key]) continue;
      const el = document.querySelector(selector);
      if (el) el.setAttribute('placeholder', t[key]);
    }

    // ── Inline alert strings ──
    const thankYouMsg = t['modal__thank_you'] || TRANSLATIONS.en['modal__thank_you'];
    const form = document.querySelector('.modal-panel form, form[onsubmit]');
    if (form) {
      form.setAttribute('onsubmit', "event.preventDefault(); alert('" + thankYouMsg.replace(/'/g, "\\'") + "')");
    }

    // ── Active lang-btn state ──
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  // ─────────────────────────────────────────────
  // Expose globally
  // ─────────────────────────────────────────────
  window.mozartI18n = { setLanguage, TRANSLATIONS };

  // ─────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('mozart-lang') || 'en';

    if (saved !== 'en') {
      setLanguage(saved);
    }

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
    });
  });

})();
