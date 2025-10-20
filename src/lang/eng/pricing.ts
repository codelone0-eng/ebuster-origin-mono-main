export const eng = {
  hero: {
    badge: "Pricing",
    title: "Choose the",
    subtitle: "right plan",
    description: "Start for free and scale as your needs grow. All plans include access to our powerful API and developer community."
  },
  plans: [
    {
      name: "Free",
      price: "0₽",
      period: "forever",
      description: "Perfect for beginner developers",
      features: [
        "Up to 1 user script",
        "Basic management features"
      ],
      buttonText: "Start Free",
      popular: false
    },
    {
      name: "Premium",
      price: "990₽",
      period: "per month",
      description: "For professional developers",
      features: [
        "Unlimited user scripts",
        "API access",
        "Priority support",
        "Advanced management features",
        "Export and import scripts"
      ],
      buttonText: "Choose Premium",
      popular: true
    }
  ],
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "Can I change my plan at any time?",
        answer: "Yes, you can change your plan at any time. When upgrading to a higher plan, you'll get access to new features immediately."
      },
      {
        question: "What happens to my data when I cancel my subscription?",
        answer: "Your data is kept for 30 days after canceling your subscription. You can export all your scripts and projects."
      }
    ]
  },
  cta: {
    title: "Ready to start?",
    description: "Choose a plan that fits your needs and start creating powerful Chrome extensions",
    downloadExtension: "Download Extension",
    contactUs: "Contact Us"
  }
};
