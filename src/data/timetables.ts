export const SEMESTER_START = "2026-08-29";
export const SEMESTER_END = "2026-11-29";

export type DayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri";

export const DAY_KEYS: DayKey[] = ["Mon", "Tue", "Wed", "Thu", "Fri"];

export interface Subject {
  slot: string;
  code: string;
  name: string;
}

export interface Section {
  id: string;
  name: string;
  detail: string;
  venue: string;
  subjects: Subject[];
  /** 9 period columns per day; null = free period / break */
  grid: Record<DayKey, (string | null)[]>;
}

const f = (...cells: (string | null)[]): (string | null)[] => {
  const row = [...cells];
  while (row.length < 9) row.push(null);
  return row.slice(0, 9);
};

export const SECTIONS: Section[] = [
  {
    id: "iv-ece-a",
    name: "IV ECE-A",
    detail: "IV Year · ECE A · VII Semester",
    venue: "IST 225",
    subjects: [
      { slot: "A", code: "21GNH401T", name: "Behavioural Psychology" },
      { slot: "B", code: "21ECC401T", name: "Wireless Communication and Antenna Systems" },
      { slot: "C", code: "21ECC402P", name: "Computer Communication and Network Security" },
      { slot: "D", code: "21ECE461T", name: "Semiconductor Memory Design" },
      { slot: "E", code: "21ECE463T", name: "Scripting Language for Electronic Design Automation" },
      { slot: "F", code: "21CSO355T", name: "Machine Learning for All" },
      { slot: "LAB", code: "21ECC402P", name: "Computer Communication and Network Security Lab" },
    ],
    grid: {
      Mon: f("C", null, "A", "D"),
      Tue: f("C", "D", "B", "F"),
      Wed: f("B", "LAB", "E", "F"),
      Thu: f("F", "A", "E", "B"),
      Fri: f("C", "A", "D", "E"),
    },
  },
  {
    id: "iv-ece-b",
    name: "IV ECE-B",
    detail: "IV Year · ECE B · VII Semester",
    venue: "IST 227",
    subjects: [
      { slot: "A", code: "21GNH401T", name: "Behavioural Psychology" },
      { slot: "B", code: "21ECC401T", name: "Wireless Communication and Antenna Systems" },
      { slot: "C", code: "21ECC402P", name: "Computer Communication and Network Security" },
      { slot: "D", code: "21ECE461T", name: "Semiconductor Memory Design" },
      { slot: "E", code: "21ECE463T", name: "Scripting Language for Electronic Design Automation" },
      { slot: "F", code: "21CSO355T", name: "Machine Learning for All" },
      { slot: "LAB", code: "21ECC402P", name: "Computer Communication and Network Security Lab" },
    ],
    grid: {
      Mon: f("C", "A", "E", "F"),
      Tue: f("C", "E", "F", "B"),
      Wed: f("C", "D", "A", "B"),
      Thu: f("D", "B", "LAB", "A"),
      Fri: f("E", "D", "F", null),
    },
  },
  {
    id: "iii-ece-a",
    name: "III ECE-A",
    detail: "III Year · ECE A · V Semester",
    venue: "IST 518 / FN",
    subjects: [
      { slot: "A", code: "21MAB302T", name: "Discrete Mathematics" },
      { slot: "B", code: "21ECC301P", name: "Microprocessor, Microcontroller and Interfacing Techniques" },
      { slot: "C", code: "21ECC303T", name: "VLSI Design and Technology" },
      { slot: "D", code: "21ECE468T", name: "System and Network on Chip" },
      { slot: "E", code: "21CSO355T", name: "Machine Learning for All" },
      { slot: "F", code: "21GNP301L", name: "Community Connect" },
      { slot: "G", code: "21PDM301L", name: "Analytical and Logical Thinking Skills" },
      { slot: "H", code: "21LEM301T", name: "Indian Art Form" },
      { slot: "LAB", code: "21ECC311L", name: "VLSI Design / Microprocessor Laboratory" },
    ],
    grid: {
      Mon: f("E", "B", "B", "A", null, "G", "G"),
      Tue: f("H", "D", "B", "B"),
      Wed: f("C", "A", "D", "F", null, null, null, "LAB", "LAB"),
      Thu: f("A", "E", "C", "F"),
      Fri: f("D", "A", "E", "C", null, "LAB", "LAB"),
    },
  },
  {
    id: "iii-ece-b",
    name: "III ECE-B",
    detail: "III Year · ECE B · V Semester",
    venue: "IST 518 / AN",
    subjects: [
      { slot: "A", code: "21MAB302T", name: "Discrete Mathematics" },
      { slot: "B", code: "21ECC301P", name: "Microprocessor, Microcontroller and Interfacing Techniques" },
      { slot: "C", code: "21ECC303T", name: "VLSI Design and Technology" },
      { slot: "D", code: "21ECE468T", name: "System and Network on Chip" },
      { slot: "E", code: "21CSO355T", name: "Machine Learning for All" },
      { slot: "F", code: "21GNP301L", name: "Community Connect" },
      { slot: "G", code: "21PDM301L", name: "Analytical and Logical Thinking Skills" },
      { slot: "H", code: "21LEM301T", name: "Indian Art Form" },
      { slot: "LAB", code: "21ECC311L", name: "VLSI Design / Microprocessor Laboratory" },
    ],
    grid: {
      Mon: f("LAB", "LAB", null, null, null, "E", "B", "A", "D"),
      Tue: f("G", "G", null, null, null, "F", "B", "D", "C"),
      Wed: f(null, null, null, null, null, "B", "B", "A", "H"),
      Thu: f("LAB", "LAB", null, null, null, "A", "C", "E", "F"),
      Fri: f(null, null, null, null, null, "C", "A", "E", "D"),
    },
  },
  {
    id: "iii-ece-ds",
    name: "III ECE-DS",
    detail: "III Year · ECE Data Science · V Semester",
    venue: "IST 519 / FN",
    subjects: [
      { slot: "A", code: "21MAB302T", name: "Discrete Mathematics" },
      { slot: "B", code: "21ECC301P", name: "Microprocessor, Microcontroller and Interfacing Techniques" },
      { slot: "C", code: "21ECC303T", name: "VLSI Design and Technology" },
      { slot: "D", code: "21CSO355T", name: "Machine Learning for All" },
      { slot: "E", code: "21ECE371T", name: "Database Design and Management" },
      { slot: "F", code: "21GNP301L", name: "Community Connect" },
      { slot: "G", code: "21PDM301L", name: "Analytical and Logical Thinking Skills" },
      { slot: "H", code: "21LEM301T", name: "Indian Art Form" },
      { slot: "LAB", code: "21ECC311L", name: "VLSI Design / Microprocessor Laboratory" },
    ],
    grid: {
      Mon: f("E", "B", "C", "A"),
      Tue: f("C", "B", "D", "F", null, "LAB", "LAB"),
      Wed: f("H", "B", "A", "C", null, null, null, "G", "G"),
      Thu: f("A", "D", "E", "F"),
      Fri: f("D", "A", "E", "B", null, null, null, "LAB", "LAB"),
    },
  },
  {
    id: "ii-ece-ds-a",
    name: "II ECE-DS A",
    detail: "II Year · ECE Data Science A · III Semester",
    venue: "IST 416 / FN",
    subjects: [
      { slot: "A", code: "21MAB201T", name: "Transforms and Boundary Value Problems" },
      { slot: "B", code: "21ECC201T", name: "Solid State Devices" },
      { slot: "C", code: "21CSS201T", name: "Computer Organization and Architecture" },
      { slot: "D", code: "21ECC203T", name: "Digital Logic Design" },
      { slot: "E", code: "21ECC205T", name: "Electromagnetic Theory and Interference" },
      { slot: "F", code: "21LEM201T", name: "Professional Ethics" },
      { slot: "G", code: "21LEM202T", name: "Universal Human Values II" },
      { slot: "H", code: "21PDM201L", name: "Verbal Reasoning" },
      { slot: "I", code: "21PDH209T", name: "Social Engineering" },
      { slot: "LAB", code: "21ECC211L", name: "Devices and Digital IC Laboratory" },
    ],
    grid: {
      Mon: f("E", "A", "I", "I", null, "G", "G", "LAB", "LAB"),
      Tue: f("C", "A", "E", "D", null, "G", null, "H", "H"),
      Wed: f("A", "B", "C", "D"),
      Thu: f("B", "C", "A", "F", null, "LAB", "LAB"),
      Fri: f("D", "B", "E", "C"),
    },
  },
  {
    id: "ii-ece-ds-b",
    name: "II ECE-DS B",
    detail: "II Year · ECE Data Science B · III Semester",
    venue: "IST 411 / AN",
    subjects: [
      { slot: "A", code: "21MAB201T", name: "Transforms and Boundary Value Problems" },
      { slot: "B", code: "21ECC201T", name: "Solid State Devices" },
      { slot: "C", code: "21CSS201T", name: "Computer Organization and Architecture" },
      { slot: "D", code: "21ECC203T", name: "Digital Logic Design" },
      { slot: "E", code: "21ECC205T", name: "Electromagnetic Theory and Interference" },
      { slot: "F", code: "21LEM201T", name: "Professional Ethics" },
      { slot: "G", code: "21LEM202T", name: "Universal Human Values II" },
      { slot: "H", code: "21PDM201L", name: "Verbal Reasoning" },
      { slot: "I", code: "21PDH209T", name: "Social Engineering" },
      { slot: "LAB", code: "21ECC211L", name: "Devices and Digital IC Laboratory" },
    ],
    grid: {
      Mon: f("LAB", "LAB", null, null, null, "D", "B", "C", "I"),
      Tue: f("LAB", "LAB", null, null, null, "C", "D", "E", "A"),
      Wed: f("G", "G", null, null, null, "I", "E", "A", "D"),
      Thu: f("G", null, "H", "H", null, "A", "C", "B", "E"),
      Fri: f(null, null, null, null, null, "F", "A", "B", "C"),
    },
  },
  {
    id: "ii-bme",
    name: "II BME",
    detail: "II Year · Biomedical Engineering · III Semester",
    venue: "IST 602 / FN",
    subjects: [
      { slot: "A", code: "21MAB201T", name: "Transforms and Boundary Value Problems" },
      { slot: "B", code: "21BMC202T", name: "Biomedical Signals and Systems" },
      { slot: "C", code: "21BMC203J", name: "Electric and Electronic Circuits" },
      { slot: "D", code: "21BMC204J", name: "Digital Logic for Medical Systems" },
      { slot: "E", code: "21PYS202T", name: "Medical Physics" },
      { slot: "F", code: "21LEM201T", name: "Professional Ethics" },
      { slot: "G", code: "21LEM202T", name: "Universal Human Values II" },
      { slot: "H", code: "21PDM201L", name: "Verbal Reasoning" },
      { slot: "I", code: "21PDH201T", name: "Social Engineering" },
      { slot: "LAB", code: "DLMS/EEC", name: "DLMS / EEC Laboratory" },
    ],
    grid: {
      Mon: f("E", "C", "I", "I", null, "LAB", "LAB"),
      Tue: f("C", "E", "B", "A", null, "H", "H"),
      Wed: f("B", "D", "A", null, null, null, null, "G", "G"),
      Thu: f("A", "E", "B", "D", null, null, null, "LAB", "LAB"),
      Fri: f("F", "A", "C", "D", null, null, null, "G"),
    },
  },
  {
    id: "iii-bme",
    name: "III BME",
    detail: "III Year · Biomedical Engineering · V Semester",
    venue: "IST 211 / AN",
    subjects: [
      { slot: "A", code: "21MAB301T", name: "Probability and Statistics" },
      { slot: "B", code: "21BMC302J", name: "Microcontrollers and Its Application in Medicine" },
      { slot: "C", code: "21BMC301J", name: "Biomedical Signal Processing" },
      { slot: "D", code: "21BME266T", name: "Biometrics" },
      { slot: "E", code: "21ECO103T", name: "Modern Wireless Communication System" },
      { slot: "F", code: "21BMC303T", name: "Principles of Medical Imaging" },
      { slot: "G", code: "21PDM301L", name: "Analytical and Logical Thinking Skills" },
      { slot: "H", code: "21LEM301T", name: "Indian Art Form" },
      { slot: "I", code: "21GNP301L", name: "Community Connect" },
      { slot: "MPMC", code: "MPMC Lab", name: "Microprocessor Laboratory" },
      { slot: "BDSP", code: "BIO DSP Lab", name: "Biomedical Signal Processing Laboratory" },
    ],
    grid: {
      Mon: f("G", "G", "MPMC", "MPMC", null, "E", "B", "F", "H"),
      Tue: f("BDSP", "BDSP", null, null, null, "C", "D", "A", "B"),
      Wed: f(null, null, null, null, null, "C", "A", "F", "D"),
      Thu: f(null, null, null, "I", null, "A", "C", "E", "B"),
      Fri: f("I", null, null, null, null, "F", "A", "D", "E"),
    },
  },
  {
    id: "i-ece-a",
    name: "I ECE-A",
    detail: "I Year · ECE A · I Semester",
    venue: "IST 602",
    subjects: [
      { slot: "A", code: "21MAB102T", name: "Advanced Calculus and Complex Analysis" },
      { slot: "B", code: "21CYB101J", name: "Chemistry" },
      { slot: "C", code: "21BTB102J", name: "Electronic System and PCB Design" },
      { slot: "D", code: "21CSS101J", name: "Programming for Problem Solving" },
      { slot: "E", code: "21GNH101J", name: "Philosophy of Engineering" },
      { slot: "F", code: "21BTB103T", name: "Biology" },
      { slot: "GER", code: "21LEH104T", name: "German" },
      { slot: "WS", code: "21MES101L", name: "Basic Civil and Mechanical Workshop" },
      { slot: "CDC", code: "21PDM102L", name: "General Aptitude" },
      { slot: "NSS", code: "21GNM102L", name: "NSS" },
      { slot: "CHEL", code: "21CYB101J", name: "Chemistry Laboratory" },
      { slot: "PPSL", code: "21CSS101J", name: "Programming Laboratory" },
      { slot: "PCBL", code: "21BTB102J", name: "PCB Laboratory" },
    ],
    grid: {
      Mon: f("E", "E", "B", "A", null, "CHEL", "CHEL", "F", "CDC"),
      Tue: f("C", "B", "A", "D", null, "WS", "WS", "WS", "WS"),
      Wed: f("B", "E", "D", null, null, "PPSL", "PPSL", "PCBL"),
      Thu: f(null, "GER", "GER", "A", null, "CDC", "CDC", "NSS"),
      Fri: f("D", "A", "C", "B", null, "F", "GER", "GER", "GER"),
    },
  },
  {
    id: "i-ece-b-eee",
    name: "I ECE-B & EEE",
    detail: "I Year · ECE B and EEE · I Semester",
    venue: "IST 602",
    subjects: [
      { slot: "A", code: "21MAB102T", name: "Advanced Calculus and Complex Analysis" },
      { slot: "B", code: "21CYB101J", name: "Chemistry" },
      { slot: "C", code: "21BTB103T", name: "Biology" },
      { slot: "D", code: "21CSS101J", name: "Programming for Problem Solving" },
      { slot: "E", code: "21GNH101J", name: "Philosophy of Engineering" },
      { slot: "F", code: "21BTB102J", name: "Electronic System and PCB Design" },
      { slot: "GER", code: "21LEH104T", name: "German" },
      { slot: "WS", code: "21MES101L", name: "Basic Civil and Mechanical Workshop" },
      { slot: "CDC", code: "21PDM102L", name: "General Aptitude" },
      { slot: "NSS", code: "21GNM102L", name: "NSS" },
      { slot: "CHEL", code: "21CYB101J", name: "Chemistry Laboratory" },
      { slot: "PPSL", code: "21CSS101J", name: "Programming Laboratory" },
      { slot: "PCBL", code: "21BTB102J", name: "PCB / EC Laboratory" },
    ],
    grid: {
      Mon: f("CDC", "F", "CHEL", "CHEL", null, "E", "E", "B", "A"),
      Tue: f("WS", "WS", "WS", "WS", null, "C", "B", "A", "D"),
      Wed: f("F", "PPSL", "CDC", "CDC", null, null, "B", "E", "D"),
      Thu: f("NSS", "NSS", "C", "A", null, "D", "GER", "GER", "GER"),
      Fri: f("PCBL", "PCBL", null, "GER", "GER", "GER", null, "B", "A"),
    },
  },
  {
    id: "i-ece-ds",
    name: "I ECE-DS",
    detail: "I Year · ECE Data Science · I Semester",
    venue: "IST 502",
    subjects: [
      { slot: "A", code: "21MAB102T", name: "Advanced Calculus and Complex Analysis" },
      { slot: "B", code: "21CYB101J", name: "Chemistry" },
      { slot: "C", code: "21BTB102J", name: "Electronic System and PCB Design" },
      { slot: "D", code: "21CSS101J", name: "Programming for Problem Solving" },
      { slot: "E", code: "21GNH101J", name: "Philosophy of Engineering" },
      { slot: "F", code: "21BTB103T", name: "Biology" },
      { slot: "GER", code: "21LEH104T", name: "German" },
      { slot: "WS", code: "21MES101L", name: "Basic Civil and Mechanical Workshop" },
      { slot: "CDC", code: "21PDM102L", name: "General Aptitude" },
      { slot: "NSS", code: "21GNM102L", name: "NSS" },
      { slot: "CHEL", code: "21CYB101J", name: "Chemistry Laboratory" },
      { slot: "PPSL", code: "21CSS101J", name: "Programming Laboratory" },
      { slot: "PCBL", code: "21BTB102J", name: "PCB Laboratory" },
    ],
    grid: {
      Mon: f("F", "CDC", "PCBL", "PCBL", null, "E", "E", "B", "A"),
      Tue: f("CHEL", "CHEL", "NSS", "NSS", null, "C", "B", "A", "D"),
      Wed: f("CDC", "CDC", "A", null, null, "PPSL", "B", "E", "D"),
      Thu: f("F", "A", "D", "GER", "GER", "GER", null, "C", "B"),
      Fri: f("GER", "GER", "GER", "PPSL", null, "WS", "WS", "WS", "WS"),
    },
  },
  {
    id: "i-biotech-b-bme",
    name: "I Biotech-B & Biomedical",
    detail: "I Year · Biotech B and Biomedical · I Semester",
    venue: "IST 702",
    subjects: [
      { slot: "A", code: "21MAB102T", name: "Advanced Calculus and Complex Analysis" },
      { slot: "B", code: "21CYB101J", name: "Chemistry" },
      { slot: "C", code: "21BTC105T", name: "Cell Biology" },
      { slot: "D", code: "21CSS101J", name: "Programming for Problem Solving" },
      { slot: "E", code: "21GNH101J", name: "Philosophy of Engineering" },
      { slot: "F", code: "21BTC101T", name: "Biochemistry" },
      { slot: "JAP", code: "21LEH105T", name: "Japanese" },
      { slot: "WS", code: "21MES101L", name: "Basic Civil and Mechanical Workshop" },
      { slot: "CDC", code: "21PDM102L", name: "General Aptitude" },
      { slot: "YOGA", code: "21GNM101L", name: "Physical and Mental Health using Yoga" },
      { slot: "CHEL", code: "21CYB101J", name: "Chemistry Laboratory" },
      { slot: "PPSL", code: "21CSS101J", name: "Programming Laboratory" },
    ],
    grid: {
      Mon: f("C", "YOGA", "YOGA", "F", null, "E", "E", "A", "B"),
      Tue: f("CDC", "CDC", "C", "F", null, null, "B", "A", "D"),
      Wed: f("WS", "WS", "WS", "WS", null, "D", "B", "E", "D"),
      Thu: f("CHEL", "CHEL", "A", "C", null, "B", "JAP", "JAP"),
      Fri: f("F", "CDC", "A", "JAP", "JAP", "JAP", null, "PPSL", "PPSL"),
    },
  },
];

export const getSection = (id: string) => SECTIONS.find((s) => s.id === id);

export const weeklyPeriods = (section: Section, slot: string) =>
  DAY_KEYS.reduce(
    (total, day) => total + section.grid[day].filter((cell) => cell === slot).length,
    0,
  );
