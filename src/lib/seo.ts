type PageSeo = {
  title: string;
  description: string;
};

export const PAGE_SEO = {
  home: {
    title: "Live-in Home Care in Cumbria | Gracefield Living in Care",
    description:
      "Dedicated live-in care helping older people stay safely in the home they love, with a carefully chosen carer by their side.",
  },
  about: {
    title: "About Gracefield Living in Care",
    description:
      "Learn why Gracefield was founded and the values that guide our live-in home care across the UK.",
  },
  liveInCare: {
    title: "Live-in Care Services | Gracefield",
    description:
      "One-to-one live-in support for personal care, meals, medication, daily life and companionship at home.",
  },
  careers: {
    title: "Live-in Care Jobs | Gracefield Living in Care",
    description:
      "Apply to become a live-in carer with Gracefield. Fair pay, ongoing support and placements chosen with fit in mind.",
  },
  contact: {
    title: "Contact Gracefield Living in Care",
    description:
      "Talk to Gracefield about live-in care, a referral, or becoming a live-in carer. Call, WhatsApp or email us.",
  },
  signIn: {
    title: "Sign In | Gracefield Living in Care",
    description: "Sign in to your Gracefield account to continue a live-in care request.",
  },
  createAccount: {
    title: "Create an Account | Gracefield Living in Care",
    description: "Create a Gracefield account to start a live-in care request for your loved one.",
  },
  requestCare: {
    title: "Request Live-in Care | Gracefield",
    description: "Tell us what would help at home. We will listen and guide the next steps.",
  },
  account: {
    title: "Your Account | Gracefield Living in Care",
    description: "See your care request, assigned carer and personal details in your Gracefield account.",
  },
  forgotPassword: {
    title: "Forgot Password | Gracefield Living in Care",
    description: "Reset the password for your Gracefield account.",
  },
  resetPassword: {
    title: "Choose a New Password | Gracefield Living in Care",
    description: "Choose a new password for your Gracefield account.",
  },
} satisfies Record<string, PageSeo>;
