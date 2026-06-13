export const mockAnalysisResult = {
  score: {
    ats_score: 78,
    matched_keywords: [
      "React",
      "JavaScript",
      "REST APIs",
      "Agile",
      "Team collaboration",
    ],
    missing_keywords: ["TypeScript", "CI/CD", "Unit testing", "AWS"],
    suggestions: [
      "Add a professional summary tailored to the target role.",
      "Quantify achievements with metrics (e.g., 'improved load time by 30%').",
      "Include TypeScript and AWS experience if applicable.",
      "Use stronger action verbs at the start of each bullet point.",
    ],
  },
  cv: {
    name: "Juan Dela Cruz",
    contact: {
      email: "juan.delacruz@email.com",
      phone: "+63 912 345 6789",
      linkedin: "linkedin.com/in/juandelacruz",
      location: "Lucena City, Quezon, Philippines",
    },
    summary:
      "Frontend developer with 4+ years of experience building responsive web applications using React and modern JavaScript. Proven track record of collaborating with cross-functional teams to deliver high-quality products on schedule.",
    education: [
      {
        school: "University of the Philippines",
        degree: "B.S. in Computer Science",
        dates: "2016 - 2020",
        details: "Cum Laude, Dean's Lister (6 semesters)",
      },
    ],
    experience: [
      {
        company: "TechCorp Solutions",
        title: "Frontend Developer",
        dates: "Jan 2022 - Present",
        bullets: [
          "Developed and maintained 10+ React-based web applications serving over 50,000 monthly active users",
          "Collaborated with design and backend teams in an Agile environment to ship features bi-weekly",
          "Optimized application performance, reducing page load times by 35%",
          "Integrated REST APIs to support dynamic data rendering across multiple platforms",
        ],
      },
      {
        company: "Digital Innovations Inc.",
        title: "Junior Web Developer",
        dates: "Jun 2020 - Dec 2021",
        bullets: [
          "Built responsive UI components using JavaScript, HTML, and CSS",
          "Assisted senior developers in debugging and resolving production issues",
          "Participated in code reviews and contributed to internal documentation",
        ],
      },
    ],
    skills: [
      "React",
      "JavaScript (ES6+)",
      "HTML5 & CSS3",
      "Tailwind CSS",
      "REST APIs",
      "Git & GitHub",
      "Agile/Scrum",
    ],
    activities: [
      "Volunteer Web Developer, Local Youth Coding Bootcamp (2023 - Present)",
      "Member, Philippine Web Developers Community",
    ],
  },
};

export default mockAnalysisResult;