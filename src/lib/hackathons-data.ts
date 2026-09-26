export interface HackathonCompetition {
  id: string;
  name: string;
  organizer: string;
  category: "Hackathon" | "Coding Contest" | "Open Source" | "Research & Innovation";
  mode: "Online" | "Hybrid" | "In-Person";
  frequency: "Annual" | "Quarterly" | "Ongoing";
  overview: string;
  eligibility: string;
  rewards: string;
  winningTips: string[];
  linkHint: string;
}

export interface ResearchGuideStep {
  stepNumber: number;
  title: string;
  summary: string;
  actionableTechnique: string;
  studentChecklist: string[];
}

export const COMPETITIONS_DATA: HackathonCompetition[] = [
  {
    id: "comp-sih",
    name: "Smart India Hackathon (SIH)",
    organizer: "Ministry of Education & AICTE",
    category: "Hackathon",
    mode: "Hybrid",
    frequency: "Annual",
    overview:
      "World's biggest open innovation hackathon where student teams build digital and hardware solutions for real ministries, departments, and industrial problem statements.",
    eligibility:
      "Engineering and college students across all accredited institutions (6-member teams with min 1 female participant).",
    rewards:
      "₹1,00,000 cash prize per problem statement + Government incubator funding opportunities.",
    winningTips: [
      "Select problem statements with clear government department sponsors.",
      "Build a working MVP demo rather than just UI wireframes.",
      "Show measurable impact: e.g. 'Reduces paperwork delay by 70% with offline sync'.",
      "Prepare a flawless 3-minute video presentation addressing edge cases and scalability.",
    ],
    linkHint: "sih.gov.in",
  },
  {
    id: "comp-google-solution",
    name: "Google Solution Challenge",
    organizer: "Google Developer Student Clubs (GDSC)",
    category: "Hackathon",
    mode: "Online",
    frequency: "Annual",
    overview:
      "Global competition challenging university students to solve one or more of the United Nations 17 Sustainable Development Goals using Google technologies.",
    eligibility: "University students worldwide (teams of 1 to 4).",
    rewards:
      "$3,000 to $10,000 per student in top teams + Mentorship from Google engineers + Global showcase.",
    winningTips: [
      "Pick a specific UN Sustainable Development Goal (e.g. Good Health, Quality Education, Clean Water).",
      "Integrate Google cloud or developer tools genuinely (Firebase, Flutter, Gemini API, TensorFlow, Google Maps Platform).",
      "Focus on community testing: record genuine user feedback from actual people benefiting from your app.",
    ],
    linkHint: "developers.google.com/community/gdsc-solution-challenge",
  },
  {
    id: "comp-icpc",
    name: "International Collegiate Programming Contest (ICPC)",
    organizer: "ICPC Foundation & Global Universities",
    category: "Coding Contest",
    mode: "Hybrid",
    frequency: "Annual",
    overview:
      "The premier global algorithmic programming contest for college students. Teams of 3 solve 8-13 algorithmic brainteasers under intense 5-hour time pressure.",
    eligibility: "College students under 24 years old; university-level registration.",
    rewards:
      "Global prestige, ICPC World Finals medals, direct technical recruitment into world's elite hedge funds and tech firms.",
    winningTips: [
      "Specialize roles within your 3-person team: one expert in Graphs/Trees, one in Math/DP, one in Debugging/Fast Typing.",
      "Master fast C++ STL template with fast I/O.",
      "Solve easiest problems first to avoid accumulating penalty time on unsubmitted solutions.",
    ],
    linkHint: "icpc.global",
  },
  {
    id: "comp-imagine-cup",
    name: "Microsoft Imagine Cup",
    organizer: "Microsoft",
    category: "Hackathon",
    mode: "Online",
    frequency: "Annual",
    overview:
      "Global technology competition for student entrepreneurs building purpose-driven AI and cloud startups.",
    eligibility: "Students 16+ enrolled in university or high school.",
    rewards: "$100,000 USD grant + Mentorship with Microsoft Chairman & CEO Satya Nadella.",
    winningTips: [
      "Treat your entry as a scalable commercial startup, not just a weekend hobby toy.",
      "Demonstrate customer traction: pilot interviews, waitlists, or beta tester metrics.",
      "Leverage Microsoft Azure Cloud and AI models effectively.",
    ],
    linkHint: "imaginecup.microsoft.com",
  },
];

export const RESEARCH_GUIDE_STEPS: ResearchGuideStep[] = [
  {
    stepNumber: 1,
    title: "Finding High-Impact Papers (IEEE / ACM / arXiv)",
    summary:
      "Stop reading random blog posts. Locate peer-reviewed baseline literature in reputable conferences (NeurIPS, CVPR, SIGCOMM, ICSE, IEEE Transactions).",
    actionableTechnique:
      "Use Google Scholar and Connected Papers. Identify the 'Seminal Paper' (the paper cited by everyone) and trace its forward citation graph.",
    studentChecklist: [
      "Search keyword + 'survey' or 'review' first (e.g., 'Edge AI quantization survey 2024')",
      "Look for papers published in last 3 years with public GitHub code reproduction repositories",
      "Check conference rankings using CORE portal (aim for A* or A tier conferences)",
    ],
  },
  {
    stepNumber: 2,
    title: "The Three-Pass Reading Method (Prof. Keshav)",
    summary:
      "Never read an academic paper linearly from beginning to end on your first try. Read in three deliberate layers of depth.",
    actionableTechnique:
      "Pass 1 (10 mins): Read Title, Abstract, Section Headings, Conclusion. Pass 2 (1 hour): Grasp graphs, diagrams, figures, and key proofs, ignoring details. Pass 3 (3 hours): Mentally re-implement the paper, questioning every assumption.",
    studentChecklist: [
      "Pass 1: What category of paper is it? (Measurement, system, new algorithm, survey)",
      "Pass 2: Can you explain the paper's core hypothesis to a peer in 3 minutes?",
      "Pass 3: Where does the author's benchmark fail or cherry-pick data?",
    ],
  },
  {
    stepNumber: 3,
    title: "Formulating a Novel Research Problem (Research Gap)",
    summary:
      "Research is not about re-inventing the wheel; it is about extending the edge of human knowledge by even 2% in a specific constrained scenario.",
    actionableTechnique:
      "Look at the 'Future Work' or 'Limitations' section of 5 recent papers. Combine techniques from two distinct fields (e.g., Graph Neural Networks applied to IoT network anomaly detection).",
    studentChecklist: [
      "Clearly write down: 'Existing methods fail at X because of Y. We propose Z to fix this.'",
      "Verify that your proposed method has a measurable metric (e.g., 20% lower latency, 15% fewer parameters)",
      "Ensure you have access to a standard open dataset (Kaggle, PhysioNet, ImageNet, CIC-IDS) to compare against baselines",
    ],
  },
  {
    stepNumber: 4,
    title: "Publishing & Patent Basics for Undergraduates",
    summary:
      "Transform your capstone project or engineering innovation into a recognized intellectual property asset.",
    actionableTechnique:
      "Write in LaTeX using standard IEEE Conference templates on Overleaf. Ensure all experimental figures are vector SVGs / PDFs with labeled error bars.",
    studentChecklist: [
      "Never publish code or public blog posts before filing a provisional patent if seeking IP protection",
      "Avoid predatory open-access journals that charge money without rigorous double-blind peer review",
      "Submit to student research tracks at reputable IEEE/ACM conferences for indexed conference proceedings",
    ],
  },
];
