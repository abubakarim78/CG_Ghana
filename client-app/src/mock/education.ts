import { EducationModule } from '../types/models';

export const EDUCATION_MODULES: EducationModule[] = [
  // MODULE 1: Child Labour
  {
    id: 'EDU-001',
    category: 'labour',
    title: 'Understanding Child Labour',
    summary:
      'Learn what child labour is, how to recognise the warning signs, what Ghanaian law says, and how to take action to protect children in your community.',
    iconName: 'Shovel',
    color: '#D97706',
    completedBy: 312,
    sections: [
      {
        heading: 'What Is Child Labour?',
        type: 'definition',
        items: [
          'Child labour is work that deprives children of their childhood, potential, and dignity, and harms their physical and mental development.',
          'It includes work that is hazardous, interferes with education, or is performed by a child below the minimum working age.',
          'In Ghana, the minimum age for light work is 15 years; hazardous work is prohibited for children under 18.',
          'Not all work by children is harmful — age-appropriate chores or supervised light tasks that do not affect schooling are different from exploitative labour.',
          'Common forms in Ghana include: farming (cocoa, tomatoes, yam), fishing on lakes and coastal areas, artisanal gold mining (galamsey), domestic service, street hawking, and quarrying.',
        ],
      },
      {
        heading: 'Warning Signs',
        type: 'signs',
        items: [
          'A child regularly absent from school or dropped out without clear reason.',
          'A child who appears malnourished, excessively tired, or has unexplained injuries on hands, feet, or body.',
          'A child seen working long hours — especially before dawn or after dark.',
          'A child working in a hazardous environment such as a mine, quarry, or on open water without adult family supervision.',
          'A child living with an employer or non-family adult and having little contact with their own family.',
          'A child who expresses fear about returning home or to their workplace.',
          'Children selling goods or begging at markets, traffic intersections, or lorry parks.',
        ],
      },
      {
        heading: 'What You Can Do',
        type: 'actions',
        items: [
          'Report your concern using the ChildGuard Ghana app — you can report anonymously.',
          'Contact ChildLine Ghana on 116 (free call) to speak with a trained counsellor.',
          'Inform a local school headteacher or District Social Welfare Officer.',
          'Do not confront employers or families directly if you fear it could put the child at risk.',
          'Document what you observed — time, location, a description of the child and working conditions.',
          'Encourage community dialogue about children\'s right to education and safe childhoods.',
        ],
      },
      {
        heading: 'Ghana Law on Child Labour',
        type: 'law',
        items: [
          'Children\'s Act 560 (1998) — protects children from exploitative labour and sets out the rights of the child in Ghana.',
          'Labour Act 651 (2003) — prohibits hazardous child labour and sets minimum working ages.',
          'Ghana defines hazardous child labour to include: mining and quarrying, fishing on deep waters, working with chemicals or dangerous machinery, portering heavy loads, and night work.',
          'Violations are prosecuted by the Ghana Police Service (DOVVSU), the Labour Department, and the Attorney General\'s Department.',
          'Employers found guilty of using child labour may face fines, imprisonment, and loss of business licence.',
        ],
      },
    ],
    quiz: [
      {
        question: 'At what minimum age can a child in Ghana perform light, non-hazardous work?',
        options: ['12 years', '13 years', '15 years', '18 years'],
        correctIndex: 2,
        explanation:
          'Under Ghana\'s Labour Act 651, the minimum age for light work is 15 years. Hazardous work is prohibited for all children under 18.',
      },
      {
        question: 'Which of the following is a warning sign of child labour?',
        options: [
          'A child helping parents with light household chores after school',
          'A child regularly absent from school and seen carrying heavy loads at a market',
          'A teenager doing weekend volunteer work at a community farm',
          'A child learning to cook traditional meals at home',
        ],
        correctIndex: 1,
        explanation:
          'Regular school absence combined with heavy physical work is a key indicator of exploitative child labour that requires reporting.',
      },
      {
        question: 'Which free number can you call to report child labour concerns in Ghana?',
        options: ['999', '116', '191', '0302-666-441'],
        correctIndex: 1,
        explanation:
          'ChildLine Ghana (116) is a free, confidential helpline for reporting child abuse and labour concerns. It is available nationwide.',
      },
    ],
  },

  // MODULE 2: Child Trafficking
  {
    id: 'EDU-002',
    category: 'trafficking',
    title: 'Recognising Child Trafficking',
    summary:
      'Understand what child trafficking is, spot the red flags in your community, and know Ghana\'s legal framework under the Anti-Human Trafficking Act 694.',
    iconName: 'AlertTriangle',
    color: '#DC2626',
    completedBy: 278,
    sections: [
      {
        heading: 'What Is Child Trafficking?',
        type: 'definition',
        items: [
          'Child trafficking is the recruitment, transportation, transfer, harbouring, or receipt of a child for the purpose of exploitation — regardless of whether force or deception was used.',
          'Exploitation includes forced labour, sexual exploitation, domestic servitude, forced begging, and organ trafficking.',
          'Unlike adult trafficking, a child cannot legally consent — any trafficking of a child is a crime even if the child appears willing.',
          'In Ghana, trafficking occurs internally (rural to urban, northern to southern regions) and across borders (from neighbouring countries such as Togo, Burkina Faso, and Niger).',
          'The Volta Lake is a known zone for child trafficking for fishing, where boys as young as 5 are "sold" or "leased" to fishermen.',
        ],
      },
      {
        heading: 'Warning Signs in Your Community',
        type: 'signs',
        items: [
          'An adult claiming to be a "relative" or "friend" who frequently moves children from one place to another.',
          'Children who cannot account for who they live with or who their guardian is.',
          'Children brought from another region or country under promises of education or a better life who end up working instead.',
          'A group of children living together under the control of one adult, with restricted movement.',
          'Children who appear fearful, submissive, or avoid eye contact when adults are present.',
          'Children with no identification documents, unable to say where they are from.',
        ],
      },
      {
        heading: 'Red Flags of Recruitment',
        type: 'signs',
        items: [
          'Strangers offering parents cash or gifts in exchange for taking their child to a city for "better opportunities".',
          'Promises of free schooling, accommodation, or apprenticeships that come with conditions or paperwork.',
          'Recruiters who discourage children from contacting their families.',
          'Community members who act as "agents" regularly taking children out of the village.',
          'Social media contact from unknown adults offering job opportunities to teenagers.',
        ],
      },
      {
        heading: 'Ghana Law — Anti-Human Trafficking Act 694',
        type: 'law',
        items: [
          'The Human Trafficking Act 694 (2005) criminalises all forms of trafficking in Ghana with penalties of up to 25 years imprisonment.',
          'The Act establishes the Human Trafficking Secretariat, responsible for prevention, protection, and prosecution.',
          'Both trafficking and attempted trafficking are offences. Receiving proceeds from trafficking is also a crime.',
          'Ghana Police DOVVSU (Domestic Violence and Victim Support Unit) and the Human Trafficking Unit have jurisdiction.',
          'Survivors are entitled to protection, counselling, and rehabilitation services under the Act.',
          'Reporting trafficking to the National Human Trafficking Hotline: 0800-111-999 (toll-free).',
        ],
      },
    ],
    quiz: [
      {
        question: 'Can a child legally consent to being trafficked if they are not physically forced?',
        options: [
          'Yes, if they are above 12 years old',
          'Yes, if a parent also gives consent',
          'No — child trafficking is always a crime regardless of consent',
          'Only if the purpose is labour, not sexual exploitation',
        ],
        correctIndex: 2,
        explanation:
          'Under Ghana\'s Anti-Human Trafficking Act 694 and international law, children cannot consent to trafficking. Any exploitation of a child through trafficking is a crime.',
      },
      {
        question: 'Which of the following is a known trafficking route in Ghana?',
        options: [
          'Children trafficked from cities to rural farms for vacation',
          'Children from Northern Ghana or neighbouring countries trafficked to Accra or the Volta Lake for labour',
          'Children sent abroad for legitimate international school programmes',
          'Children fostered by extended family in the same region',
        ],
        correctIndex: 1,
        explanation:
          'Internal trafficking from the Northern region and cross-border trafficking from neighbouring countries for labour or fishing on the Volta Lake are well-documented patterns in Ghana.',
      },
      {
        question: 'What is the maximum prison sentence for trafficking a child under Ghana\'s Human Trafficking Act 694?',
        options: ['5 years', '10 years', '15 years', '25 years'],
        correctIndex: 3,
        explanation:
          'Ghana\'s Anti-Human Trafficking Act 694 provides for up to 25 years imprisonment for convicted traffickers, reflecting the severity of the crime.',
      },
    ],
  },

  // MODULE 3: How to Report
  {
    id: 'EDU-003',
    category: 'how_to_report',
    title: 'How to Report a Case',
    summary:
      'Know when and how to report a concern, how to use the ChildGuard Ghana app, and what happens after you submit a report.',
    iconName: 'Send',
    color: '#2563EB',
    completedBy: 415,
    sections: [
      {
        heading: 'When Should You Report?',
        type: 'actions',
        items: [
          'Report immediately if you believe a child is in immediate danger — physical harm, trafficking, or sexual exploitation.',
          'Report if a child appears to be working in hazardous conditions (mines, fishing, heavy machinery).',
          'Report if a child is regularly absent from school and you suspect labour or domestic servitude.',
          'Report if you see signs of physical abuse: bruises, burns, fractures, or a child expressing fear of a caregiver.',
          'Report even if you are not 100% certain — trained officers will verify and investigate. It is better to report a concern that turns out to be unfounded than to stay silent about one that is real.',
          'You do not need to have all the details — report what you know.',
        ],
      },
      {
        heading: 'How to Use ChildGuard Ghana',
        type: 'actions',
        items: [
          'Open the app and tap "Report a Case" on the home screen.',
          'Select the type of concern from the list (e.g., child labour, trafficking, physical abuse).',
          'Mark "Emergency" if the child is in immediate danger — this triggers a priority alert.',
          'Enter the child\'s approximate age, gender, and physical description if known.',
          'Set the location using the map or type the area name, community, and district.',
          'Describe what you observed in as much detail as you can in the description field.',
          'Add photos if you have them and if it is safe to take them.',
          'Choose whether to submit anonymously or with your contact details for follow-up.',
          'Submit — you will receive a case reference number to track the status of your report.',
        ],
      },
      {
        heading: 'What Happens After You Report',
        type: 'facts',
        items: [
          'Your report is received and reviewed by a trained case manager within the system.',
          'A risk score is assigned based on the details you provide.',
          'The case is assigned to the appropriate officer — a social worker, DOVVSU officer, labour inspector, or NGO agent — based on the type and location.',
          'The assigned officer conducts a field assessment, usually within 24–72 hours for high-priority cases.',
          'You can track the status of your case using the reference number in the "My Reports" section of the app.',
          'If you provided contact details, the officer may reach out to you for additional information.',
          'Outcomes may include: family counselling, school re-enrolment, child removal to safety, prosecution of perpetrators, or referral to support services.',
        ],
      },
      {
        heading: 'Emergency Contact Numbers',
        type: 'facts',
        items: [
          'ChildLine Ghana: 116 (free, 24/7, trained child protection counsellors)',
          'Ghana Police Service Emergency: 191',
          'DOVVSU (Domestic Violence & Victim Support Unit): 0302-773-906',
          'Department of Social Welfare: 0302-666-441',
          'National Human Trafficking Hotline: 0800-111-999 (toll-free)',
          'Ambulance / Medical Emergency: 193',
        ],
      },
    ],
    quiz: [
      {
        question: 'What should you do if you are not 100% certain that a child is being abused?',
        options: [
          'Wait until you are certain before reporting',
          'Confront the suspected abuser directly',
          'Report your concern — trained officers will investigate and verify',
          'Only report if you have photographic evidence',
        ],
        correctIndex: 2,
        explanation:
          'You do not need certainty to report. Trained professionals will assess your concern. Reporting a concern that is not confirmed is far better than failing to report a real case of harm.',
      },
      {
        question: 'Which free emergency number connects you to trained child protection counsellors in Ghana?',
        options: ['191', '193', '116', '999'],
        correctIndex: 2,
        explanation:
          'ChildLine Ghana (116) is a free, 24/7 helpline staffed by trained child protection counsellors. It can be called from any network in Ghana.',
      },
      {
        question: 'After submitting a report on ChildGuard Ghana, how can you track its progress?',
        options: [
          'You cannot track it — reports are anonymous',
          'By calling the Department of Social Welfare',
          'Using the case reference number in the "My Reports" section of the app',
          'Only assigned officers can see case status updates',
        ],
        correctIndex: 2,
        explanation:
          'Every submitted report receives a unique case reference number. You can use this number in the "My Reports" section to follow the status of your case at any time.',
      },
    ],
  },

  // MODULE 4: Safety Tips
  {
    id: 'EDU-004',
    category: 'safety_tips',
    title: 'Staying Safe While Reporting',
    summary:
      'Protect yourself and the child when reporting. Learn how to report safely, how to avoid putting the child at greater risk, and how to build community networks for child protection.',
    iconName: 'ShieldCheck',
    color: '#059669',
    completedBy: 189,
    sections: [
      {
        heading: 'Protecting Yourself as a Reporter',
        type: 'actions',
        items: [
          'You can always report anonymously using the ChildGuard Ghana app — your identity will not be shared.',
          'Do not tell people in the community that you have made a report, especially if the suspected abuser is known locally.',
          'Avoid confronting the alleged perpetrator directly — this can escalate the situation and put you and the child at risk.',
          'If you feel threatened after making a report, contact the Ghana Police Service (191) or DOVVSU immediately.',
          'Keep a personal record of what you observed, with dates, times, and locations, in a secure place.',
          'If you are a professional (teacher, health worker, community leader), you may have a mandatory reporting duty — your institution should have a protocol to follow.',
        ],
      },
      {
        heading: 'Protecting the Child',
        type: 'actions',
        items: [
          'Do not tell the child you are reporting their situation unless it is necessary and safe — the child may inadvertently disclose this to the abuser.',
          'If a child discloses abuse to you, listen calmly, do not express shock or disbelief, and reassure them that it is not their fault.',
          'Do not ask the child to repeat their disclosure multiple times — this can cause additional trauma.',
          'If the child is in immediate physical danger, prioritise getting them to safety (a neighbour\'s house, a school, a health facility) and then call 116 or 191.',
          'Do not photograph or film a child in a vulnerable situation for reporting purposes unless absolutely necessary — text descriptions are sufficient.',
          'After a report is made, try to maintain normal interactions with the child to avoid alerting the perpetrator.',
        ],
      },
      {
        heading: 'Community Child Protection Networks',
        type: 'facts',
        items: [
          'Community Child Protection Committees (CCPCs) exist in many districts in Ghana — join or support yours.',
          'Schools, churches, mosques, and community centres can be safe spaces for children to report concerns.',
          'Trained community volunteers (Community Child Protection Volunteers) can be a first point of contact in areas with limited formal services.',
          'Educating parents, chiefs, and opinion leaders about child rights reduces tolerance for abuse at the community level.',
          'Encouraging open conversations in your community about child protection normalises reporting and reduces stigma.',
          'Partner with local NGOs, faith-based organisations, and District Assembly Social Services departments for coordinated responses.',
        ],
      },
    ],
    quiz: [
      {
        question: 'If you are concerned about your own safety after making a report, what should you do?',
        options: [
          'Keep it to yourself and hope the situation improves',
          'Confront the perpetrator to establish a direct resolution',
          'Contact the Ghana Police Service (191) or DOVVSU for protection',
          'Withdraw your report to reduce the risk',
        ],
        correctIndex: 2,
        explanation:
          'Your safety matters. If you feel threatened, contact the Ghana Police Service at 191 or DOVVSU. Withdrawing a report does not remove the risk and could leave the child unprotected.',
      },
      {
        question: 'A child discloses abuse to you. What is the most appropriate first response?',
        options: [
          'Immediately confront the alleged abuser',
          'Ask the child to repeat the story in detail so you have all the facts',
          'Listen calmly, reassure the child it is not their fault, and report to authorities',
          'Tell other community members so they can help investigate',
        ],
        correctIndex: 2,
        explanation:
          'When a child discloses abuse, the right response is to listen without judgment, reassure them, and then report to trained professionals. Confronting the abuser or involving others prematurely can put the child at further risk.',
      },
      {
        question: 'What is a Community Child Protection Committee (CCPC)?',
        options: [
          'A government ministry that handles child trafficking',
          'A local group of trained volunteers who support child protection in their community',
          'A court that prosecutes child abusers',
          'An international organisation that funds child welfare programmes',
        ],
        correctIndex: 1,
        explanation:
          'CCPCs are local structures — often comprising community leaders, teachers, health workers, and volunteers — that support child protection at the grassroots level in Ghana.',
      },
    ],
  },
];
