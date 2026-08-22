import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  adminLeads,
  adminStats,
  adminNewsletter,
  logout,
  me
} from '../lib/api';

import {
  BookOpen,
  ChevronDown,
  Copy,
  Eye,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Link2,
  CheckCircle2
} from 'lucide-react';

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  'https://routeyourcareer.onrender.com';

const LEAD_TABS = [
  { k: '', l: 'All' },
  { k: 'apply', l: 'Apply' },
  { k: 'callback', l: 'Callback' },
  { k: 'quick', l: 'Quick / Calculator' },
  { k: 'chat_lead', l: 'Chat leads' },
  { k: 'newsletter', l: 'Newsletter' }
];


const APPLICATION_STAGES = [
  { key: 'started', label: 'Started' },
  { key: 'route_built', label: 'Route Built' },
  { key: 'university_selected', label: 'University Selected' },
  { key: 'contacted', label: 'Contacted' },
  { key: 'documents', label: 'Documents' },
  { key: 'applied', label: 'Applied' },
  { key: 'offer_received', label: 'Offer Received' },
  { key: 'visa', label: 'Visa' },
  { key: 'enrolled', label: 'Enrolled' }
];

function applicationStageLabel(value) {
  const stage = APPLICATION_STAGES.find(x => x.key === value);
  return stage?.label || value || 'Started';
}

const EMPTY_BLOG = {
  title: '',
  slug: '',
  category: 'MBBS',
  author: 'RYC Editorial',
  read_time: 5,
  excerpt: '',
  body: [{ type: 'paragraph', text: '' }],
  cta: 'mbbs',
  seo_title: '',
  meta_description: '',
  keywordsText: '',
  status: 'draft'
};

const EMPTY_UNIVERSITY = {
  name: '',
  slug: '',
  country: 'Georgia',
  city: '',
  stream: 'MBBS',
  website: '',
  image_url: '',
  overview: '',
  featured: false,
  status: 'draft'
};

const EMPTY_COURSE = {
  university_id: '',
  stream: 'MBBS',
  name: '',
  slug: '',
  level: 'Medical',
  duration: '',
  medium: 'English',
  currency: 'USD',
  tuition_fee_year: '',
  hostel_fee_year: '',
  living_cost_year: '',
  other_costs_total: '',
  total_course_cost: '',
  intake: '',
  application_deadline: '',
  eligibility: '',
  neet_requirement: '',
  pcb_requirement: '',
  academic_requirement: '',
  english_requirement: '',
  ielts_requirement: '',
  gmat_gre_requirement: '',
  work_experience: '',
  featured: false,
  recommended: false,
  budget_option: false,
  last_verified: '',
  source_url: '',
  status: 'draft'
};

function fmt(dt) {
  if (!dt) return '—';
  try {
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(dt || '');
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function optionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function durationYears(value) {
  const match = String(value || '').match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const years = Number(match[1]);
  return Number.isFinite(years) ? years : null;
}

function formatMoney(value, currency = 'USD') {
  if (value === '' || value === null || value === undefined) return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${currency} ${n.toLocaleString()}`;
}

function dateInputValue(value) {
  if (!value) return '';
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

function toIsoOrNull(value) {
  if (!value) return null;
  try {
    return new Date(`${value}T00:00:00Z`).toISOString();
  } catch {
    return null;
  }
}


function isRecentVerification(value) {
  if (!value) return false;
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return false;
  return Date.now() - dt.getTime() <= 90 * 24 * 60 * 60 * 1000;
}

function courseVerification(item) {
  const missing = [];

  if (item.tuition_fee_year == null || item.tuition_fee_year === '') {
    missing.push('tuition');
  }

  if (!String(item.duration || '').trim()) {
    missing.push('duration');
  }

  if (!String(item.medium || '').trim()) {
    missing.push('medium');
  }

  if (!String(item.intake || '').trim()) {
    missing.push('intake');
  }

  if (!String(item.source_url || '').trim()) {
    missing.push('source');
  }

  if (!item.last_verified) {
    missing.push('verification_date');
  } else if (!isRecentVerification(item.last_verified)) {
    missing.push('stale');
  }

  if (item.stream === 'MBBS') {
    if (!String(item.neet_requirement || '').trim()) {
      missing.push('neet');
    }

    if (!String(item.pcb_requirement || '').trim()) {
      missing.push('pcb');
    }

    if (!String(item.eligibility || '').trim()) {
      missing.push('eligibility');
    }
  } else {
    if (
      !String(item.academic_requirement || '').trim() &&
      !String(item.eligibility || '').trim()
    ) {
      missing.push('academic_eligibility');
    }
  }

  const critical = [
    'tuition',
    'duration',
    'medium',
    'intake',
    'source',
    'verification_date',
    'stale',
    'neet',
    'pcb',
    'eligibility',
    'academic_eligibility'
  ];

  const verified = !missing.some(x => critical.includes(x));

  return {
    verified,
    missing,
    missingFees: missing.includes('tuition'),
    missingEligibility:
      missing.includes('neet') ||
      missing.includes('pcb') ||
      missing.includes('eligibility') ||
      missing.includes('academic_eligibility'),
    missingSource: missing.includes('source'),
    missingVerificationDate:
      missing.includes('verification_date') ||
      missing.includes('stale'),
    missingIntake: missing.includes('intake')
  };
}

function verificationLabel(key) {
  const labels = {
    tuition: 'Tuition',
    duration: 'Duration',
    medium: 'Medium',
    intake: 'Intake',
    source: 'Source URL',
    verification_date: 'Last verified',
    stale: 'Verification older than 90 days',
    neet: 'NEET requirement',
    pcb: 'PCB requirement',
    eligibility: 'General eligibility',
    academic_eligibility: 'Academic eligibility'
  };

  return labels[key] || key;
}

async function adminFetch(path, options = {}) {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // ignore
    }
    const err = new Error(detail);
    err.status = response.status;
    throw err;
  }

  if (response.status === 204) return null;
  return response.json();
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <div className="text-[10px] mono uppercase tracking-widest text-ink/50 mb-2">
        {label}
      </div>
      {children}
      {hint && (
        <div className="text-[10px] text-ink/40 mt-1.5 leading-relaxed">
          {hint}
        </div>
      )}
    </label>
  );
}

const inputClass =
  'w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-coral';

const textareaClass =
  'w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-[13px] outline-none focus:border-coral min-h-[110px]';

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] bg-ink/65 p-3 sm:p-6 overflow-y-auto">
      <div className="max-w-5xl mx-auto rounded-3xl bg-cream shadow-2xl overflow-hidden">
        <div className="sticky top-0 z-10 bg-ink text-cream px-5 sm:px-7 py-4 flex items-start gap-4">
          <div>
            <div className="serif text-2xl">{title}</div>
            {subtitle && (
              <div className="text-[11px] text-cream/60 mt-1">{subtitle}</div>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto h-9 w-9 rounded-full border border-cream/20 grid place-items-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const nav = useNavigate();

  const [user, setUser] = useState(location.state?.user || null);
  const [checking, setChecking] = useState(!location.state?.user);
  const [section, setSection] = useState('dashboard');

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [leadTab, setLeadTab] = useState('');
  const [q, setQ] = useState('');
  const [loadingLeads, setLoadingLeads] = useState(false);

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationSearch, setApplicationSearch] = useState('');
  const [applicationStageFilter, setApplicationStageFilter] = useState('All');
  const [applicationDetailOpen, setApplicationDetailOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationError, setApplicationError] = useState('');
  const [updatingApplicationId, setUpdatingApplicationId] = useState('');

  const [applicationDocuments, setApplicationDocuments] = useState([]);
  const [applicationDocumentSummary, setApplicationDocumentSummary] = useState(null);
  const [loadingApplicationDocuments, setLoadingApplicationDocuments] = useState(false);
  const [updatingDocumentKey, setUpdatingDocumentKey] = useState('');
  const [documentError, setDocumentError] = useState('');

  const [newsletter, setNewsletter] = useState([]);
  const [loadingNewsletter, setLoadingNewsletter] = useState(false);

  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogEditorOpen, setBlogEditorOpen] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState(EMPTY_BLOG);
  const [blogError, setBlogError] = useState('');
  const [savingBlog, setSavingBlog] = useState(false);

  const [universities, setUniversities] = useState([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [universityEditorOpen, setUniversityEditorOpen] = useState(false);
  const [editingUniversityId, setEditingUniversityId] = useState(null);
  const [universityForm, setUniversityForm] = useState(EMPTY_UNIVERSITY);
  const [universityError, setUniversityError] = useState('');
  const [savingUniversity, setSavingUniversity] = useState(false);
  const [findingUniversityImage, setFindingUniversityImage] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [universityCountryFilter, setUniversityCountryFilter] = useState('All');
  const [openUniversityGroups, setOpenUniversityGroups] = useState({
    MBBS: true,
    Management: true,
    Other: true
  });
  const [openUniversityCountries, setOpenUniversityCountries] = useState({});

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseEditorOpen, setCourseEditorOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [courseError, setCourseError] = useState('');
  const [savingCourse, setSavingCourse] = useState(false);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseStreamFilter, setCourseStreamFilter] = useState('All');
  const [courseCountryFilter, setCourseCountryFilter] = useState('All');
  const [courseUniversityFilter, setCourseUniversityFilter] = useState('All');
  const [courseVerificationFilter, setCourseVerificationFilter] =
    useState('All');

  const [quickVerifyOpen, setQuickVerifyOpen] = useState(false);
  const [quickVerifyItem, setQuickVerifyItem] = useState(null);
  const [quickVerifyForm, setQuickVerifyForm] = useState({
    currency: 'USD',
    tuition_fee_year: '',
    hostel_fee_year: '',
    living_cost_year: '',
    other_costs_total: '',
    duration: '',
    medium: 'English',
    intake: '',
    eligibility: '',
    neet_requirement: '',
    pcb_requirement: '',
    academic_requirement: '',
    source_url: '',
    last_verified: '',
    recommended: false,
    budget_option: false,
    status: 'draft'
  });
  const [quickVerifyError, setQuickVerifyError] = useState('');
  const [savingQuickVerify, setSavingQuickVerify] = useState(false);


  useEffect(() => {
    if (user) return;

    (async () => {
      try {
        const u = await me();
        if (!u?.is_admin) {
          nav('/admin/login?e=Not%20authorised', { replace: true });
          return;
        }
        setUser(u);
      } catch {
        nav('/admin/login', { replace: true });
      } finally {
        setChecking(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadLeads = useCallback(async () => {
    if (!user) return;
    setLoadingLeads(true);
    try {
      const [ls, st] = await Promise.all([
        adminLeads(leadTab || undefined),
        adminStats()
      ]);
      setLeads(Array.isArray(ls) ? ls : []);
      setStats(st || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeads(false);
    }
  }, [leadTab, user]);

  const loadApplications = useCallback(async () => {
    if (!user) return;

    setLoadingApplications(true);
    setApplicationError('');

    try {
      const data = await adminFetch('/api/admin/applications?limit=1000');
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setApplicationError(
        e.message || 'Could not load applications.'
      );
    } finally {
      setLoadingApplications(false);
    }
  }, [user]);

  const loadNewsletter = useCallback(async () => {
    if (!user) return;
    setLoadingNewsletter(true);
    try {
      const data = await adminNewsletter();
      setNewsletter(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNewsletter(false);
    }
  }, [user]);

  const loadBlogs = useCallback(async () => {
    if (!user) return;
    setLoadingBlogs(true);
    try {
      const data = await adminFetch('/api/admin/blogs');
      setBlogs(Array.isArray(data) ? data : []);
    } catch (e) {
      setBlogError(e.message || 'Could not load blogs.');
    } finally {
      setLoadingBlogs(false);
    }
  }, [user]);

  const loadUniversities = useCallback(async () => {
    if (!user) return;
    setLoadingUniversities(true);
    setUniversityError('');
    try {
      const data = await adminFetch('/api/admin/universities');
      setUniversities(Array.isArray(data) ? data : []);
    } catch (e) {
      setUniversityError(e.message || 'Could not load universities.');
    } finally {
      setLoadingUniversities(false);
    }
  }, [user]);

  const loadCourses = useCallback(async () => {
    if (!user) return;
    setLoadingCourses(true);
    setCourseError('');
    try {
      const data = await adminFetch('/api/admin/courses');
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) {
      setCourseError(e.message || 'Could not load courses.');
    } finally {
      setLoadingCourses(false);
    }
  }, [user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    if (!user) return;
    loadApplications();
    loadNewsletter();
    loadBlogs();
    loadUniversities();
    loadCourses();
  }, [
    user,
    loadApplications,
    loadNewsletter,
    loadBlogs,
    loadUniversities,
    loadCourses
  ]);

  const filteredLeads = useMemo(() => {
    if (!q.trim()) return leads;
    const s = q.toLowerCase().trim();
    return leads.filter(lead =>
      [
        lead.name,
        lead.phone,
        lead.email,
        lead.country,
        lead.neet_score,
        lead.source,
        lead.message
      ].some(value =>
        String(value || '').toLowerCase().includes(s)
      )
    );
  }, [q, leads]);

  const filteredApplications = useMemo(() => {
    let rows = [...applications];

    if (applicationStageFilter !== 'All') {
      rows = rows.filter(
        item =>
          (item.stage || item.application_status || item.journey_stage) ===
          applicationStageFilter
      );
    }

    if (applicationSearch.trim()) {
      const s = applicationSearch.toLowerCase().trim();

      rows = rows.filter(item => {
        const selectedRoute = item.selected_route || {};
        const profile = item.route_profile || {};

        return [
          item.application_id,
          item.name,
          item.phone,
          item.email,
          item.state,
          item.country,
          item.stream,
          item.source,
          selectedRoute.university_name,
          selectedRoute.course_name,
          selectedRoute.country,
          profile.neet_score,
          profile.pcb_percentage
        ].some(value =>
          String(value || '').toLowerCase().includes(s)
        );
      });
    }

    return rows;
  }, [
    applications,
    applicationStageFilter,
    applicationSearch
  ]);

  const applicationSummary = useMemo(() => {
    const counts = Object.fromEntries(
      APPLICATION_STAGES.map(stage => [stage.key, 0])
    );

    applications.forEach(item => {
      const stage =
        item.stage ||
        item.application_status ||
        item.journey_stage ||
        'started';

      if (Object.prototype.hasOwnProperty.call(counts, stage)) {
        counts[stage] += 1;
      }
    });

    return {
      total: applications.length,
      ...counts
    };
  }, [applications]);

  const universityCountries = useMemo(() => {
    return [
      'All',
      ...new Set(
        universities.map(x => x.country).filter(Boolean).sort()
      )
    ];
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    let rows = [...universities];

    if (universityCountryFilter !== 'All') {
      rows = rows.filter(x => x.country === universityCountryFilter);
    }

    if (universitySearch.trim()) {
      const s = universitySearch.toLowerCase().trim();
      rows = rows.filter(x =>
        [x.name, x.country, x.city].some(v =>
          String(v || '').toLowerCase().includes(s)
        )
      );
    }

    return rows;
  }, [universities, universityCountryFilter, universitySearch]);

  const universityGroups = useMemo(() => {
    const grouped = {
      MBBS: {},
      Management: {},
      Other: {}
    };

    filteredUniversities.forEach(item => {
      const stream =
        item.stream === 'MBBS'
          ? 'MBBS'
          : item.stream === 'Management'
          ? 'Management'
          : 'Other';

      const country = item.country || 'Country not set';

      if (!grouped[stream][country]) {
        grouped[stream][country] = [];
      }

      grouped[stream][country].push(item);
    });

    Object.values(grouped).forEach(countryMap => {
      Object.values(countryMap).forEach(list => {
        list.sort((a, b) =>
          String(a.name || '').localeCompare(String(b.name || ''))
        );
      });
    });

    return grouped;
  }, [filteredUniversities]);

  const universitySummary = useMemo(() => {
    const medical = universities.filter(x => x.stream === 'MBBS').length;
    const management = universities.filter(x => x.stream === 'Management').length;
    const other = universities.length - medical - management;

    return {
      total: universities.length,
      medical,
      management,
      other
    };
  }, [universities]);

  const courseSummary = useMemo(() => {
    const published = courses.filter(x => x.status === 'published').length;
    const draft = courses.filter(x => x.status !== 'published').length;

    const checks = courses.map(courseVerification);

    const verified = checks.filter(x => x.verified).length;
    const needsVerification = checks.filter(x => !x.verified).length;
    const missingFees = checks.filter(x => x.missingFees).length;
    const missingEligibility = checks.filter(x => x.missingEligibility).length;
    const missingSource = checks.filter(x => x.missingSource).length;
    const missingVerificationDate =
      checks.filter(x => x.missingVerificationDate).length;

    return {
      total: courses.length,
      published,
      draft,
      verified,
      needsVerification,
      missingFees,
      missingEligibility,
      missingSource,
      missingVerificationDate
    };
  }, [courses]);

  const toggleUniversityGroup = key => {
    setOpenUniversityGroups(old => ({
      ...old,
      [key]: !old[key]
    }));
  };

  const toggleUniversityCountry = (stream, country) => {
    const key = `${stream}::${country}`;

    setOpenUniversityCountries(old => ({
      ...old,
      [key]: !old[key]
    }));
  };

  const courseCountries = useMemo(() => {
    return [
      'All',
      ...new Set(courses.map(x => x.country).filter(Boolean).sort())
    ];
  }, [courses]);

  const courseUniversities = useMemo(() => {
    let rows = [...courses];

    if (courseStreamFilter !== 'All') {
      rows = rows.filter(x => x.stream === courseStreamFilter);
    }

    if (courseCountryFilter !== 'All') {
      rows = rows.filter(x => x.country === courseCountryFilter);
    }

    const names = [
      ...new Set(
        rows
          .map(x => x.university_name)
          .filter(Boolean)
          .sort()
      )
    ];

    return ['All', ...names];
  }, [courses, courseStreamFilter, courseCountryFilter]);


  const filteredCourses = useMemo(() => {
    let rows = [...courses];

    if (courseStreamFilter !== 'All') {
      rows = rows.filter(x => x.stream === courseStreamFilter);
    }

    if (courseCountryFilter !== 'All') {
      rows = rows.filter(x => x.country === courseCountryFilter);
    }

    if (courseUniversityFilter !== 'All') {
      rows = rows.filter(
        x => x.university_name === courseUniversityFilter
      );
    }

    if (courseVerificationFilter !== 'All') {
      rows = rows.filter(item => {
        const check = courseVerification(item);

        if (courseVerificationFilter === 'Verified') {
          return check.verified;
        }

        if (courseVerificationFilter === 'Needs verification') {
          return !check.verified;
        }

        if (courseVerificationFilter === 'Missing tuition') {
          return check.missingFees;
        }

        if (courseVerificationFilter === 'Missing eligibility') {
          return check.missingEligibility;
        }

        if (courseVerificationFilter === 'Missing source') {
          return check.missingSource;
        }

        if (courseVerificationFilter === 'Missing / stale verification') {
          return check.missingVerificationDate;
        }

        if (courseVerificationFilter === 'Missing intake') {
          return check.missingIntake;
        }

        return true;
      });
    }

    if (courseSearch.trim()) {
      const s = courseSearch.toLowerCase().trim();
      rows = rows.filter(x =>
        [x.name, x.university_name, x.country, x.city].some(v =>
          String(v || '').toLowerCase().includes(s)
        )
      );
    }

    return rows;
  }, [
    courses,
    courseStreamFilter,
    courseCountryFilter,
    courseUniversityFilter,
    courseVerificationFilter,
    courseSearch
  ]);

  const loadApplicationDocuments = async applicationId => {
    if (!applicationId) return;

    setLoadingApplicationDocuments(true);
    setDocumentError('');

    try {
      const data = await adminFetch(
        `/api/admin/applications/${encodeURIComponent(
          applicationId
        )}/documents`
      );

      setApplicationDocuments(
        Array.isArray(data?.documents)
          ? data.documents
          : []
      );

      setApplicationDocumentSummary(
        data?.summary || null
      );
    } catch (e) {
      setApplicationDocuments([]);
      setApplicationDocumentSummary(null);
      setDocumentError(
        e.message || 'Could not load document checklist.'
      );
    } finally {
      setLoadingApplicationDocuments(false);
    }
  };

  const updateApplicationDocument = async (
    applicationId,
    documentKey,
    status,
    note
  ) => {
    if (!applicationId || !documentKey) return;

    setUpdatingDocumentKey(documentKey);
    setDocumentError('');

    try {
      const data = await adminFetch(
        `/api/admin/applications/${encodeURIComponent(
          applicationId
        )}/documents/${encodeURIComponent(
          documentKey
        )}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            note: note?.trim() || null
          })
        }
      );

      setApplicationDocuments(
        Array.isArray(data?.documents)
          ? data.documents
          : []
      );

      setApplicationDocumentSummary(
        data?.summary || null
      );

      // A meaningful document action can automatically move
      // the backend journey into Documents. Refresh the CRM
      // so the visible pipeline stays in sync.
      await loadApplications();

      if (status !== 'pending') {
        setSelectedApplication(old => {
          if (!old) return old;

          const current =
            old.stage ||
            old.application_status ||
            old.journey_stage ||
            'started';

          const order =
            APPLICATION_STAGES.map(x => x.key);

          if (
            !order.includes(current) ||
            order.indexOf(current) <
              order.indexOf('documents')
          ) {
            return {
              ...old,
              stage: 'documents',
              application_status: 'documents',
              journey_stage: 'documents'
            };
          }

          return old;
        });
      }
    } catch (e) {
      setDocumentError(
        e.message || 'Could not update document status.'
      );
    } finally {
      setUpdatingDocumentKey('');
    }
  };

  const updateDocumentNote = (
    documentKey,
    note
  ) => {
    setApplicationDocuments(old =>
      old.map(item =>
        item.key === documentKey
          ? { ...item, note }
          : item
      )
    );
  };

  const openApplicationDetail = async item => {
    setApplicationError('');

    try {
      const detail = await adminFetch(
        `/api/admin/applications/${encodeURIComponent(
          item.application_id
        )}`
      );

      const resolved = detail || item;

      setSelectedApplication(resolved);
      setApplicationDetailOpen(true);

      await loadApplicationDocuments(
        resolved.application_id ||
        item.application_id
      );
    } catch (e) {
      setApplicationError(
        e.message || 'Could not load application details.'
      );
    }
  };

  const updateApplicationStage = async (
    applicationId,
    stage
  ) => {
    if (!applicationId || !stage) return;

    setUpdatingApplicationId(applicationId);
    setApplicationError('');

    try {
      const data = await adminFetch(
        `/api/admin/applications/${encodeURIComponent(
          applicationId
        )}/stage`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            stage
          })
        }
      );

      const updated =
        data?.application || null;

      setApplications(old =>
        old.map(item =>
          item.application_id === applicationId
            ? {
                ...item,
                ...(updated || {}),
                stage,
                application_status: stage,
                journey_stage: stage
              }
            : item
        )
      );

      if (
        selectedApplication?.application_id ===
        applicationId
      ) {
        setSelectedApplication(old => ({
          ...old,
          ...(updated || {}),
          stage,
          application_status: stage,
          journey_stage: stage
        }));
      }
    } catch (e) {
      setApplicationError(
        e.message || 'Could not update application stage.'
      );
    } finally {
      setUpdatingApplicationId('');
    }
  };

  const signOut = async () => {
    try {
      await logout();
    } finally {
      nav('/admin/login', { replace: true });
    }
  };

  const copyNewsletter = () => {
    navigator.clipboard.writeText(
      newsletter.map(x => x.email).filter(Boolean).join('\n')
    );
  };

  const copyAll = () => {
    const csv = [
      'name,phone,email,country,neet,type,source',
      ...filteredLeads.map(lead =>
        [
          lead.name,
          lead.phone,
          lead.email,
          lead.country,
          lead.neet_score,
          lead.type,
          lead.source
        ]
          .map(x => `"${String(x || '').replace(/"/g, '""')}"`)
          .join(',')
      )
    ].join('\n');

    navigator.clipboard.writeText(csv);
  };

  // =====================================================
  // BLOGS
  // =====================================================

  const openNewBlog = () => {
    setEditingBlogId(null);
    setBlogForm({ ...EMPTY_BLOG, body: [{ type: 'paragraph', text: '' }] });
    setBlogError('');
    setBlogEditorOpen(true);
  };

  const openEditBlog = blog => {
    setEditingBlogId(blog.id);
    setBlogError('');
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      category: blog.category || 'MBBS',
      author: blog.author || 'RYC Editorial',
      read_time: blog.read_time || 5,
      excerpt: blog.excerpt || '',
      body: Array.isArray(blog.body) && blog.body.length
        ? blog.body.filter(x => x.type !== 'image')
        : [{ type: 'paragraph', text: '' }],
      cta: blog.cta || 'mbbs',
      seo_title: blog.seo_title || '',
      meta_description: blog.meta_description || '',
      keywordsText: Array.isArray(blog.keywords)
        ? blog.keywords.join(', ')
        : '',
      status: blog.status || 'draft'
    });
    setBlogEditorOpen(true);
  };

  const addBlogBlock = type => {
    setBlogForm(old => ({
      ...old,
      body: [
        ...old.body,
        type === 'list'
          ? { type: 'list', items: [''] }
          : { type, text: '' }
      ]
    }));
  };

  const updateBlogBlock = (index, patch) => {
    setBlogForm(old => {
      const body = [...old.body];
      body[index] = { ...body[index], ...patch };
      return { ...old, body };
    });
  };

  const removeBlogBlock = index => {
    setBlogForm(old => ({
      ...old,
      body: old.body.filter((_, i) => i !== index)
    }));
  };

  const saveBlog = async status => {
    setBlogError('');

    if (!blogForm.title.trim()) {
      setBlogError('Blog title is required.');
      return;
    }

    const payload = {
      title: blogForm.title.trim(),
      slug: slugify(blogForm.slug || blogForm.title),
      category: blogForm.category,
      author: blogForm.author || 'RYC Editorial',
      read_time: Number(blogForm.read_time) || 5,
      excerpt: blogForm.excerpt,
      body: blogForm.body,
      cta: blogForm.cta,
      seo_title: blogForm.seo_title || blogForm.title,
      meta_description:
        blogForm.meta_description || blogForm.excerpt,
      keywords: blogForm.keywordsText
        .split(',')
        .map(x => x.trim())
        .filter(Boolean),
      status
    };

    setSavingBlog(true);
    try {
      if (editingBlogId) {
        await adminFetch(`/api/admin/blogs/${editingBlogId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await adminFetch('/api/admin/blogs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      await loadBlogs();
      setBlogEditorOpen(false);
    } catch (e) {
      setBlogError(e.message || 'Could not save blog.');
    } finally {
      setSavingBlog(false);
    }
  };

  const toggleBlogStatus = async blog => {
    await adminFetch(`/api/admin/blogs/${blog.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: blog.status === 'published' ? 'draft' : 'published'
      })
    });
    await loadBlogs();
  };

  const deleteBlog = async blog => {
    if (!window.confirm(`Delete "${blog.title}"?`)) return;
    await adminFetch(`/api/admin/blogs/${blog.id}`, {
      method: 'DELETE'
    });
    await loadBlogs();
  };

  // =====================================================
  // UNIVERSITY MASTER
  // =====================================================

  const openNewUniversity = () => {
    setEditingUniversityId(null);
    setUniversityForm({ ...EMPTY_UNIVERSITY });
    setUniversityError('');
    setUniversityEditorOpen(true);
  };

  const openEditUniversity = item => {
    setEditingUniversityId(item.id);
    setUniversityError('');
    setUniversityForm({
      name: item.name || '',
      slug: item.slug || '',
      country: item.country || '',
      city: item.city || '',
      stream: item.stream || 'MBBS',
      website: item.website || '',
      image_url: item.image_url || '',
      overview: item.overview || '',
      featured: Boolean(item.featured),
      status: item.status || 'draft'
    });
    setUniversityEditorOpen(true);
  };

  const findUniversityImage = async () => {
    const name = universityForm.name.trim();

    if (!name) {
      setUniversityError('Enter the university name first.');
      return;
    }

    setFindingUniversityImage(true);
    setUniversityError('');

    try {
      const searchCommons = async query => {
        const params = new URLSearchParams({
          action: 'query',
          generator: 'search',
          gsrsearch: query,
          gsrnamespace: '6',
          gsrlimit: '10',
          prop: 'imageinfo',
          iiprop: 'url|mime',
          iiurlwidth: '1200',
          format: 'json',
          origin: '*'
        });

        const response = await fetch(
          `https://commons.wikimedia.org/w/api.php?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error('Wikimedia image search failed.');
        }

        const data = await response.json();
        const pages = Object.values(data?.query?.pages || {});

        return pages
          .map(page => ({
            title: page.title || '',
            ...(page.imageinfo?.[0] || {})
          }))
          .filter(item =>
            item.url &&
            String(item.mime || '').startsWith('image/') &&
            !/svg/i.test(item.mime || '') &&
            !/logo|seal|flag|map|coat of arms|emblem/i.test(item.title || '')
          );
      };

      let results = await searchCommons(`${name} building`);

      if (!results.length) {
        results = await searchCommons(name);
      }

      if (!results.length) {
        setUniversityError(
          'No suitable Wikimedia image was found. Paste a public image URL manually.'
        );
        return;
      }

      const best = results[0];
      const imageUrl = best.thumburl || best.url;

      setUniversityForm(old => ({
        ...old,
        image_url: imageUrl
      }));
    } catch (e) {
      setUniversityError(
        e.message || 'Could not find an image automatically.'
      );
    } finally {
      setFindingUniversityImage(false);
    }
  };

  const saveUniversity = async status => {
    setUniversityError('');

    if (!universityForm.name.trim()) {
      setUniversityError('University name is required.');
      return;
    }

    if (!universityForm.country.trim()) {
      setUniversityError('Country is required.');
      return;
    }

    // Legacy university fields are still supplied to keep the
    // existing website/API backward compatible. Actual programme
    // data now belongs in the separate Courses collection.
    const payload = {
      stream: universityForm.stream || 'MBBS',
      name: universityForm.name.trim(),
      slug: slugify(universityForm.slug || universityForm.name),
      country: universityForm.country.trim(),
      city: universityForm.city.trim() || null,
      course:
        universityForm.stream === 'Management'
          ? 'Management'
          : 'MBBS',
      website: universityForm.website.trim() || null,
      image_url: universityForm.image_url.trim() || null,
      overview: universityForm.overview.trim() || null,
      featured: Boolean(universityForm.featured),
      status
    };

    setSavingUniversity(true);
    try {
      if (editingUniversityId) {
        await adminFetch(
          `/api/admin/universities/${editingUniversityId}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload)
          }
        );
      } else {
        await adminFetch('/api/admin/universities', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      await loadUniversities();
      setUniversityEditorOpen(false);
    } catch (e) {
      setUniversityError(e.message || 'Could not save university.');
    } finally {
      setSavingUniversity(false);
    }
  };

  const toggleUniversityStatus = async item => {
    await adminFetch(`/api/admin/universities/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: item.status === 'published' ? 'draft' : 'published'
      })
    });
    await loadUniversities();
  };

  const deleteUniversity = async item => {
    if (
      !window.confirm(
        `Delete "${item.name}"? Courses linked to it should be reviewed first.`
      )
    ) {
      return;
    }

    await adminFetch(`/api/admin/universities/${item.id}`, {
      method: 'DELETE'
    });
    await loadUniversities();
  };

  // =====================================================
  // COURSE MASTER
  // =====================================================

  const openNewCourse = () => {
    setEditingCourseId(null);
    setCourseForm({
      ...EMPTY_COURSE,
      university_id: universities[0]?.id || ''
    });
    setCourseError('');
    setCourseEditorOpen(true);
  };

  const openEditCourse = item => {
    setEditingCourseId(item.id);
    setCourseError('');
    setCourseForm({
      university_id: item.university_id || '',
      stream: item.stream || 'MBBS',
      name: item.name || '',
      slug: item.slug || '',
      level: item.level || '',
      duration: item.duration || '',
      medium: item.medium || 'English',
      currency: item.currency || 'USD',
      tuition_fee_year: item.tuition_fee_year ?? '',
      hostel_fee_year: item.hostel_fee_year ?? '',
      living_cost_year: item.living_cost_year ?? '',
      other_costs_total: item.other_costs_total ?? '',
      total_course_cost: item.total_course_cost ?? '',
      intake: item.intake || '',
      application_deadline: item.application_deadline || '',
      eligibility: item.eligibility || '',
      neet_requirement: item.neet_requirement || '',
      pcb_requirement: item.pcb_requirement || '',
      academic_requirement: item.academic_requirement || '',
      english_requirement: item.english_requirement || '',
      ielts_requirement: item.ielts_requirement || '',
      gmat_gre_requirement: item.gmat_gre_requirement || '',
      work_experience: item.work_experience || '',
      featured: Boolean(item.featured),
      recommended: Boolean(item.recommended),
      budget_option: Boolean(item.budget_option),
      last_verified: dateInputValue(item.last_verified),
      source_url: item.source_url || '',
      status: item.status || 'draft'
    });
    setCourseEditorOpen(true);
  };

  const saveCourse = async status => {
    setCourseError('');

    if (!courseForm.university_id) {
      setCourseError('Select a university.');
      return;
    }

    if (!courseForm.name.trim()) {
      setCourseError('Course name is required.');
      return;
    }

    const payload = {
      university_id: courseForm.university_id,
      stream: courseForm.stream,
      name: courseForm.name.trim(),
      slug: slugify(courseForm.slug || courseForm.name),
      level: courseForm.level.trim() || null,
      duration: courseForm.duration.trim() || null,
      medium: courseForm.medium.trim() || null,
      currency: courseForm.currency || 'USD',
      tuition_fee_year: optionalNumber(courseForm.tuition_fee_year),
      hostel_fee_year: optionalNumber(courseForm.hostel_fee_year),
      living_cost_year: optionalNumber(courseForm.living_cost_year),
      other_costs_total: optionalNumber(courseForm.other_costs_total),
      total_course_cost: calculatedTuitionTotal,
      intake: courseForm.intake.trim() || null,
      application_deadline:
        courseForm.application_deadline.trim() || null,
      eligibility: courseForm.eligibility.trim() || null,
      neet_requirement:
        courseForm.stream === 'MBBS'
          ? courseForm.neet_requirement.trim() || null
          : null,
      pcb_requirement:
        courseForm.stream === 'MBBS'
          ? courseForm.pcb_requirement.trim() || null
          : null,
      academic_requirement:
        courseForm.stream !== 'MBBS'
          ? courseForm.academic_requirement.trim() || null
          : null,
      english_requirement:
        courseForm.stream !== 'MBBS'
          ? courseForm.english_requirement.trim() || null
          : null,
      ielts_requirement:
        courseForm.stream !== 'MBBS'
          ? courseForm.ielts_requirement.trim() || null
          : null,
      gmat_gre_requirement:
        courseForm.stream !== 'MBBS'
          ? courseForm.gmat_gre_requirement.trim() || null
          : null,
      work_experience:
        courseForm.stream !== 'MBBS'
          ? courseForm.work_experience.trim() || null
          : null,
      featured: Boolean(courseForm.featured),
      recommended: Boolean(courseForm.recommended),
      budget_option: Boolean(courseForm.budget_option),
      last_verified: toIsoOrNull(courseForm.last_verified),
      source_url: courseForm.source_url.trim() || null,
      status
    };

    setSavingCourse(true);
    try {
      if (editingCourseId) {
        await adminFetch(`/api/admin/courses/${editingCourseId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await adminFetch('/api/admin/courses', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }

      await loadCourses();
      setCourseEditorOpen(false);
    } catch (e) {
      setCourseError(e.message || 'Could not save course.');
    } finally {
      setSavingCourse(false);
    }
  };

  const toggleCourseStatus = async item => {
    await adminFetch(`/api/admin/courses/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: item.status === 'published' ? 'draft' : 'published'
      })
    });
    await loadCourses();
  };

  const deleteCourse = async item => {
    if (
      !window.confirm(
        `Delete "${item.name}" at ${item.university_name}?`
      )
    ) {
      return;
    }

    await adminFetch(`/api/admin/courses/${item.id}`, {
      method: 'DELETE'
    });
    await loadCourses();
  };


  const openQuickVerify = item => {
    setQuickVerifyItem(item);
    setQuickVerifyError('');

    setQuickVerifyForm({
      currency: item.currency || 'USD',
      tuition_fee_year: item.tuition_fee_year ?? '',
      hostel_fee_year: item.hostel_fee_year ?? '',
      living_cost_year: item.living_cost_year ?? '',
      other_costs_total: item.other_costs_total ?? '',
      duration: item.duration || '',
      medium: item.medium || 'English',
      intake: item.intake || '',
      eligibility: item.eligibility || '',
      neet_requirement: item.neet_requirement || '',
      pcb_requirement: item.pcb_requirement || '',
      academic_requirement: item.academic_requirement || '',
      source_url: item.source_url || '',
      last_verified:
        dateInputValue(item.last_verified) ||
        new Date().toISOString().slice(0, 10),
      recommended: Boolean(item.recommended),
      budget_option: Boolean(item.budget_option),
      status: item.status || 'draft'
    });

    setQuickVerifyOpen(true);
  };

  const saveQuickVerify = async () => {
    if (!quickVerifyItem) return;

    setQuickVerifyError('');

    if (!quickVerifyForm.tuition_fee_year) {
      setQuickVerifyError('Tuition / year is required for verification.');
      return;
    }

    if (!quickVerifyForm.duration.trim()) {
      setQuickVerifyError('Duration is required for verification.');
      return;
    }

    if (!quickVerifyForm.source_url.trim()) {
      setQuickVerifyError('Official source URL is required for verification.');
      return;
    }

    if (!quickVerifyForm.last_verified) {
      setQuickVerifyError('Last verified date is required.');
      return;
    }

    if (quickVerifyItem.stream === 'MBBS') {
      if (!quickVerifyForm.neet_requirement.trim()) {
        setQuickVerifyError('NEET requirement is required for MBBS verification.');
        return;
      }

      if (!quickVerifyForm.pcb_requirement.trim()) {
        setQuickVerifyError('PCB requirement is required for MBBS verification.');
        return;
      }

      if (!quickVerifyForm.eligibility.trim()) {
        setQuickVerifyError('General eligibility is required for MBBS verification.');
        return;
      }
    }

    setSavingQuickVerify(true);

    try {
      const payload = {
        currency: quickVerifyForm.currency || 'USD',
        tuition_fee_year: optionalNumber(
          quickVerifyForm.tuition_fee_year
        ),
        hostel_fee_year: optionalNumber(
          quickVerifyForm.hostel_fee_year
        ),
        living_cost_year: optionalNumber(
          quickVerifyForm.living_cost_year
        ),
        other_costs_total: optionalNumber(
          quickVerifyForm.other_costs_total
        ),
        duration: quickVerifyForm.duration.trim() || null,
        medium: quickVerifyForm.medium.trim() || null,
        intake: quickVerifyForm.intake.trim() || null,
        eligibility: quickVerifyForm.eligibility.trim() || null,
        neet_requirement:
          quickVerifyItem.stream === 'MBBS'
            ? quickVerifyForm.neet_requirement.trim() || null
            : null,
        pcb_requirement:
          quickVerifyItem.stream === 'MBBS'
            ? quickVerifyForm.pcb_requirement.trim() || null
            : null,
        academic_requirement:
          quickVerifyItem.stream !== 'MBBS'
            ? quickVerifyForm.academic_requirement.trim() || null
            : null,
        source_url: quickVerifyForm.source_url.trim() || null,
        last_verified: toIsoOrNull(quickVerifyForm.last_verified),
        recommended: Boolean(quickVerifyForm.recommended),
        budget_option: Boolean(quickVerifyForm.budget_option),
        status: quickVerifyForm.status
      };

      await adminFetch(
        `/api/admin/courses/${quickVerifyItem.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      );

      await loadCourses();
      setQuickVerifyOpen(false);
      setQuickVerifyItem(null);
    } catch (e) {
      setQuickVerifyError(
        e.message || 'Could not save verification.'
      );
    } finally {
      setSavingQuickVerify(false);
    }
  };

  const refreshAll = () => {
    loadLeads();
    loadApplications();
    loadNewsletter();
    loadBlogs();
    loadUniversities();
    loadCourses();
  };

  const courseDurationYears = durationYears(courseForm.duration);
  const courseTuitionYear = optionalNumber(courseForm.tuition_fee_year);
  const courseHostelYear = optionalNumber(courseForm.hostel_fee_year);
  const courseLivingYear = optionalNumber(courseForm.living_cost_year);
  const courseOtherTotal = optionalNumber(courseForm.other_costs_total);

  const calculatedTuitionTotal =
    courseDurationYears != null && courseTuitionYear != null
      ? courseDurationYears * courseTuitionYear
      : null;

  const calculatedEstimatedTotal =
    courseDurationYears != null
      ? (
          (courseTuitionYear || 0) +
          (courseHostelYear || 0) +
          (courseLivingYear || 0)
        ) * courseDurationYears +
        (courseOtherTotal || 0)
      : null;

  if (checking) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['applications', 'Applications', CheckCircle2],
    ['leads', 'Leads', Users],
    ['newsletter', 'Newsletter', Mail],
    ['blogs', 'Blogs', BookOpen],
    ['universities', 'Universities', GraduationCap],
    ['courses', 'Courses', FileText]
  ];

  return (
    <div className="min-h-screen bg-cream text-ink">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-ink text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-cream text-ink grid place-items-center serif italic">
              r
            </div>
            <div>
              <div className="serif text-[15px]">Route Your Career</div>
              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                V2 Admin
              </div>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block">
              <div className="text-[13px]">{user.name}</div>
              <div className="text-[10px] mono uppercase text-coral">
                Administrator
              </div>
            </div>

            <button
              onClick={signOut}
              className="rounded-full border border-cream/20 px-3 py-2 text-[12px] flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* NAV */}
      <div className="sticky top-[56px] z-30 bg-white border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex gap-1 overflow-x-auto">
          {navItems.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`rounded-full px-4 py-2 flex gap-2 items-center text-[12px] font-semibold whitespace-nowrap ${
                section === key
                  ? 'bg-ink text-cream'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* DASHBOARD */}
        {section === 'dashboard' && (
          <>
            <div className="flex flex-wrap justify-between gap-4 items-end">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  RYC V2
                </div>
                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Control room.
                </h1>
                <p className="mt-2 text-[13px] text-ink/60">
                  Universities are institutions. Courses contain the changing programme data.
                </p>
              </div>

              <button
                onClick={refreshAll}
                className="bg-ink text-cream rounded-full px-4 py-2.5 flex gap-2 items-center text-[12px] font-semibold"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                ['Applications', applicationSummary.total],
                ['University selected', applicationSummary.university_selected],
                ['Applied', applicationSummary.applied],
                ['Enrolled', applicationSummary.enrolled],
                ['Universities', universitySummary.total],
                ['Courses', courseSummary.total],
                ['Verified courses', courseSummary.verified],
                ['Need verification', courseSummary.needsVerification]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-3xl bg-white border border-ink/10 p-5"
                >
                  <div className="text-[10px] mono uppercase tracking-widest text-ink/45">
                    {label}
                  </div>
                  <div className="serif text-4xl mt-2">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-3xl bg-ink text-cream p-6">
              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                V2 rule
              </div>
              <div className="serif text-2xl mt-2">
                Add a university once. Add all changing programmes under Courses.
              </div>
              <p className="text-[13px] text-cream/65 mt-2 max-w-3xl leading-relaxed">
                Build My Route will use the Courses database for fees, eligibility,
                intakes and matching. This prevents duplicating one university dozens
                of times when it offers many programmes.
              </p>
            </div>
          </>
        )}

        {/* APPLICATIONS CRM */}
        {section === 'applications' && (
          <>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Admissions CRM
                </div>

                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Applications.
                </h1>

                <p className="mt-2 text-[13px] text-ink/60 max-w-3xl">
                  Follow each student from first contact through route building,
                  university selection, application, visa and enrolment.
                </p>
              </div>

              <button
                onClick={loadApplications}
                className="rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] flex gap-2 items-center"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {/* PIPELINE COUNTERS */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {APPLICATION_STAGES.map(stage => (
                <button
                  key={stage.key}
                  onClick={() =>
                    setApplicationStageFilter(
                      applicationStageFilter === stage.key
                        ? 'All'
                        : stage.key
                    )
                  }
                  className={`rounded-2xl border p-4 text-left transition ${
                    applicationStageFilter === stage.key
                      ? 'bg-ink text-cream border-ink'
                      : 'bg-white border-ink/10 hover:border-ink/25'
                  }`}
                >
                  <div
                    className={`text-[9px] mono uppercase tracking-widest ${
                      applicationStageFilter === stage.key
                        ? 'text-cream/50'
                        : 'text-ink/40'
                    }`}
                  >
                    {stage.label}
                  </div>

                  <div className="serif text-3xl mt-1">
                    {applicationSummary[stage.key] || 0}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 grid lg:grid-cols-[1fr_240px] gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink/35" />

                <input
                  value={applicationSearch}
                  onChange={e =>
                    setApplicationSearch(e.target.value)
                  }
                  placeholder="Search application ID, student, phone, university..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <select
                value={applicationStageFilter}
                onChange={e =>
                  setApplicationStageFilter(e.target.value)
                }
                className={inputClass}
              >
                <option value="All">
                  All stages
                </option>

                {APPLICATION_STAGES.map(stage => (
                  <option
                    key={stage.key}
                    value={stage.key}
                  >
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            {applicationError && (
              <div className="mt-4 rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-[12px]">
                {applicationError}
              </div>
            )}

            <div className="mt-5 space-y-3">
              {loadingApplications && (
                <div className="rounded-3xl bg-white border border-ink/10 p-8 text-center text-ink/50">
                  Loading applications…
                </div>
              )}

              {!loadingApplications &&
               filteredApplications.length === 0 && (
                <div className="rounded-3xl bg-white border border-ink/10 p-8 text-center text-ink/50">
                  No applications found.
                </div>
              )}

              {filteredApplications.map(item => {
                const route = item.selected_route || {};
                const profile = item.route_profile || {};
                const stage =
                  item.stage ||
                  item.application_status ||
                  item.journey_stage ||
                  'started';

                return (
                  <div
                    key={item.application_id || item.id}
                    className="rounded-3xl bg-white border border-ink/10 p-5"
                  >
                    <div className="flex flex-wrap gap-4 items-start">
                      <div className="flex-1 min-w-[240px]">
                        <div className="flex flex-wrap gap-2 items-center">
                          <div className="text-[10px] mono uppercase tracking-widest text-coral">
                            {item.application_id || 'Application'}
                          </div>

                          <span className="rounded-full bg-cream border border-ink/10 px-2.5 py-1 text-[9px] font-semibold">
                            {item.stream || profile.stream || '—'}
                          </span>
                        </div>

                        <div className="serif text-2xl mt-2">
                          {item.name || 'Unnamed student'}
                        </div>

                        <div className="text-[11px] text-ink/50 mt-1">
                          {item.phone || 'No phone'}
                          {item.email ? ` · ${item.email}` : ''}
                          {item.state ? ` · ${item.state}` : ''}
                        </div>
                      </div>

                      <div className="min-w-[210px]">
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35">
                          Selected route
                        </div>

                        <div className="text-[12px] font-semibold mt-1">
                          {route.university_name || 'Not selected yet'}
                        </div>

                        <div className="text-[10px] text-ink/45 mt-1">
                          {route.course_name || ''}
                          {route.country
                            ? `${route.course_name ? ' · ' : ''}${route.country}`
                            : ''}
                        </div>

                        {route.route_score != null && (
                          <div className="text-[10px] text-forest font-semibold mt-1">
                            Route score: {route.route_score}/100
                          </div>
                        )}
                      </div>

                      <div className="min-w-[180px]">
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35 mb-1">
                          Pipeline stage
                        </div>

                        <select
                          value={stage}
                          disabled={
                            updatingApplicationId === item.application_id
                          }
                          onChange={e =>
                            updateApplicationStage(
                              item.application_id,
                              e.target.value
                            )
                          }
                          className="w-full rounded-xl border border-ink/15 bg-cream px-3 py-2 text-[11px] font-semibold outline-none focus:border-coral"
                        >
                          {APPLICATION_STAGES.map(option => (
                            <option
                              key={option.key}
                              value={option.key}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="text-[10px] text-ink/40 min-w-[120px]">
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35">
                          Updated
                        </div>

                        <div className="mt-1">
                          {fmt(item.updated_at || item.created_at)}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openApplicationDetail(item)
                        }
                        className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2.5 text-[11px] font-semibold hover:bg-ink hover:text-cream transition"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                    </div>

                    {/* QUICK PROFILE STRIP */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {profile.neet_score != null && (
                        <span className="rounded-full bg-cream border border-ink/10 px-3 py-1 text-[9px]">
                          NEET {profile.neet_score}
                        </span>
                      )}

                      {profile.pcb_percentage != null && (
                        <span className="rounded-full bg-cream border border-ink/10 px-3 py-1 text-[9px]">
                          PCB {profile.pcb_percentage}%
                        </span>
                      )}

                      {profile.budget_total != null && (
                        <span className="rounded-full bg-cream border border-ink/10 px-3 py-1 text-[9px]">
                          Budget {profile.budget_currency || 'USD'}{' '}
                          {Number(profile.budget_total).toLocaleString()}
                        </span>
                      )}

                      {Array.isArray(profile.preferred_countries) &&
                       profile.preferred_countries.length > 0 && (
                        <span className="rounded-full bg-cream border border-ink/10 px-3 py-1 text-[9px]">
                          {profile.preferred_countries.join(', ')}
                        </span>
                      )}

                      <span className="rounded-full bg-forest/10 text-forest px-3 py-1 text-[9px] font-semibold">
                        {applicationStageLabel(stage)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LEADS */}
        {section === 'leads' && (
          <>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Enquiries
                </div>
                <h1 className="serif text-4xl sm:text-5xl mt-1">Leads.</h1>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyAll}
                  className="rounded-full border border-ink/15 px-4 py-2.5 text-[12px] flex gap-2 items-center"
                >
                  <Copy className="h-4 w-4" />
                  Copy CSV
                </button>
                <button
                  onClick={loadLeads}
                  className="rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] flex gap-2 items-center"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto">
              {LEAD_TABS.map(tab => (
                <button
                  key={tab.l}
                  onClick={() => setLeadTab(tab.k)}
                  className={`rounded-full px-4 py-2 text-[12px] whitespace-nowrap ${
                    leadTab === tab.k
                      ? 'bg-ink text-cream'
                      : 'bg-white border border-ink/10'
                  }`}
                >
                  {tab.l}
                </button>
              ))}
            </div>

            <div className="mt-4 relative">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink/35" />
              <input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search name, phone, email, country..."
                className={`${inputClass} pl-11`}
              />
            </div>

            <div className="mt-5 bg-white rounded-3xl border border-ink/10 divide-y divide-ink/5 overflow-hidden">
              {loadingLeads && (
                <div className="p-8 text-center text-ink/50">Loading…</div>
              )}

              {!loadingLeads && filteredLeads.length === 0 && (
                <div className="p-8 text-center text-ink/50">
                  No leads found.
                </div>
              )}

              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  className="p-5 grid sm:grid-cols-4 gap-4 text-[13px]"
                >
                  <div>
                    <div className="font-semibold">{lead.name}</div>
                    <div className="text-ink/45 text-[11px] mt-1">
                      {lead.type || 'lead'} · {lead.source || 'website'}
                    </div>
                  </div>
                  <div>
                    <div>{lead.phone}</div>
                    <div className="text-ink/55">{lead.email}</div>
                  </div>
                  <div>
                    <div>{lead.country || '—'}</div>
                    <div className="text-ink/55">
                      NEET: {lead.neet_score || '—'}
                    </div>
                  </div>
                  <div className="text-ink/50">{fmt(lead.created_at)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* NEWSLETTER */}
        {section === 'newsletter' && (
          <>
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Audience
                </div>
                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Newsletter.
                </h1>
              </div>

              <button
                onClick={copyNewsletter}
                className="rounded-full bg-ink text-cream px-4 py-2.5 text-[12px] flex gap-2 items-center"
              >
                <Copy className="h-4 w-4" />
                Copy emails
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-white border border-ink/10 divide-y divide-ink/5 overflow-hidden">
              {loadingNewsletter && (
                <div className="p-8 text-center text-ink/50">Loading…</div>
              )}

              {newsletter.map(item => (
                <div
                  key={item.id || item.email}
                  className="px-5 py-4 flex gap-4 items-center"
                >
                  <Mail className="h-4 w-4 text-coral" />
                  <div className="font-semibold text-[13px]">{item.email}</div>
                  <div className="ml-auto text-[11px] text-ink/45">
                    {fmt(item.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* BLOGS */}
        {section === 'blogs' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  RYC Journal
                </div>
                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Blog manager.
                </h1>
                <p className="mt-2 text-[13px] text-ink/60">
                  Create and publish without touching GitHub.
                </p>
              </div>

              <button
                onClick={openNewBlog}
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
              >
                <Plus className="h-4 w-4" />
                New Blog
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-white border border-ink/10 overflow-hidden divide-y divide-ink/5">
              {loadingBlogs && (
                <div className="p-8 text-center text-ink/50">Loading…</div>
              )}

              {blogs.map(blog => (
                <div
                  key={blog.id}
                  className="p-5 flex flex-wrap gap-4 items-center"
                >
                  <img
                    src="/blog-default.png"
                    alt=""
                    className="h-16 w-24 rounded-xl object-cover"
                  />

                  <div className="flex-1 min-w-[220px]">
                    <div className="text-[10px] mono uppercase text-coral">
                      {blog.status} · {blog.category}
                    </div>
                    <div className="serif text-xl mt-1">{blog.title}</div>
                  </div>

                  {blog.status === 'published' && (
                    <Link to={`/blog/${blog.slug}`} target="_blank">
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}

                  <button onClick={() => openEditBlog(blog)}>
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => toggleBlogStatus(blog)}
                    className="text-[11px] font-semibold"
                  >
                    {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>

                  <button onClick={() => deleteBlog(blog)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* UNIVERSITIES */}
        {section === 'universities' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Institution Master
                </div>

                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Universities.
                </h1>

                <p className="mt-2 text-[13px] text-ink/60">
                  Organized automatically by study type and country.
                </p>
              </div>

              <button
                onClick={openNewUniversity}
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
              >
                <Plus className="h-4 w-4" />
                Add University
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total', universitySummary.total],
                ['MBBS / Medical', universitySummary.medical],
                ['Management', universitySummary.management],
                ['Other', universitySummary.other]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl bg-white border border-ink/10 p-4"
                >
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                    {label}
                  </div>
                  <div className="serif text-3xl mt-1">{value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid sm:grid-cols-[1fr_220px] gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink/35" />
                <input
                  value={universitySearch}
                  onChange={e => setUniversitySearch(e.target.value)}
                  placeholder="Search university, city or country..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <select
                value={universityCountryFilter}
                onChange={e => setUniversityCountryFilter(e.target.value)}
                className={inputClass}
              >
                {universityCountries.map(country => (
                  <option key={country}>{country}</option>
                ))}
              </select>
            </div>

            {universityError && !universityEditorOpen && (
              <div className="mt-4 rounded-xl bg-red-50 text-red-700 p-3 text-[12px]">
                {universityError}
              </div>
            )}

            {loadingUniversities && (
              <div className="mt-5 rounded-3xl bg-white border border-ink/10 p-8 text-center text-ink/50">
                Loading…
              </div>
            )}

            {!loadingUniversities && filteredUniversities.length === 0 && (
              <div className="mt-5 rounded-3xl bg-white border border-ink/10 p-8 text-center text-ink/50">
                No universities found.
              </div>
            )}

            {!loadingUniversities && filteredUniversities.length > 0 && (
              <div className="mt-5 space-y-4">
                {[
                  ['MBBS', 'MBBS / Medical'],
                  ['Management', 'Management'],
                  ['Other', 'Other']
                ].map(([streamKey, streamLabel]) => {
                  const countries = Object.keys(
                    universityGroups[streamKey] || {}
                  ).sort();

                  const streamCount = countries.reduce(
                    (sum, country) =>
                      sum + universityGroups[streamKey][country].length,
                    0
                  );

                  if (streamCount === 0) return null;

                  const streamOpen = Boolean(
                    openUniversityGroups[streamKey]
                  );

                  return (
                    <div
                      key={streamKey}
                      className="rounded-3xl bg-white border border-ink/10 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleUniversityGroup(streamKey)}
                        className="w-full px-5 py-5 flex items-center gap-4 text-left bg-white hover:bg-cream/60"
                      >
                        <div>
                          <div className="text-[10px] mono uppercase tracking-widest text-coral">
                            Study type
                          </div>
                          <div className="serif text-2xl mt-1">
                            {streamLabel}
                          </div>
                        </div>

                        <div className="ml-auto flex items-center gap-3">
                          <span className="rounded-full bg-cream border border-ink/10 px-3 py-1 text-[11px] font-semibold">
                            {streamCount}
                          </span>

                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              streamOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      {streamOpen && (
                        <div className="border-t border-ink/10">
                          {countries.map(country => {
                            const list =
                              universityGroups[streamKey][country] || [];

                            const countryKey = `${streamKey}::${country}`;
                            const countryOpen = Boolean(
                              openUniversityCountries[countryKey]
                            );

                            return (
                              <div
                                key={country}
                                className="border-b last:border-b-0 border-ink/5"
                              >
                                <button
                                  onClick={() =>
                                    toggleUniversityCountry(
                                      streamKey,
                                      country
                                    )
                                  }
                                  className="w-full px-5 py-4 flex items-center gap-3 text-left hover:bg-cream/60"
                                >
                                  <div className="font-semibold text-[13px]">
                                    {country}
                                  </div>

                                  <span className="rounded-full bg-cream border border-ink/10 px-2.5 py-1 text-[10px]">
                                    {list.length}
                                  </span>

                                  <ChevronDown
                                    className={`ml-auto h-4 w-4 transition-transform ${
                                      countryOpen ? 'rotate-180' : ''
                                    }`}
                                  />
                                </button>

                                {countryOpen && (
                                  <div className="bg-cream/35 divide-y divide-ink/5">
                                    {list.map(item => {
                                      const linkedCourses = courses.filter(
                                        c =>
                                          c.university_id === item.id
                                      ).length;

                                      return (
                                        <div
                                          key={item.id}
                                          className="px-5 py-4 flex flex-wrap gap-4 items-center"
                                        >
                                          <div className="flex-1 min-w-[240px]">
                                            <div className="serif text-lg">
                                              {item.name}
                                            </div>

                                            <div className="text-[11px] text-ink/45 mt-1">
                                              {item.city || 'City not set'}
                                              {' · '}
                                              {item.status}
                                            </div>
                                          </div>

                                          <div className="text-[10px] rounded-full bg-white border border-ink/10 px-3 py-1.5">
                                            {linkedCourses} courses
                                          </div>

                                          <button
                                            onClick={() =>
                                              openEditUniversity(item)
                                            }
                                            title="Edit university"
                                            className="h-9 w-9 rounded-full border border-ink/10 bg-white grid place-items-center"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </button>

                                          <button
                                            onClick={() =>
                                              toggleUniversityStatus(item)
                                            }
                                            className="text-[11px] font-semibold rounded-full border border-ink/10 bg-white px-3 py-2"
                                          >
                                            {item.status === 'published'
                                              ? 'Unpublish'
                                              : 'Publish'}
                                          </button>

                                          <button
                                            onClick={() =>
                                              deleteUniversity(item)
                                            }
                                            title="Delete university"
                                            className="h-9 w-9 rounded-full border border-red-100 bg-white grid place-items-center"
                                          >
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* COURSES */}
        {section === 'courses' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Programme Verification
                </div>

                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Courses.
                </h1>

                <p className="mt-2 text-[13px] text-ink/60 max-w-3xl">
                  Build My Route reads these records directly. A course is only marked
                  verified when the important matching fields are present and the
                  verification date is current.
                </p>
              </div>

              <button
                onClick={openNewCourse}
                disabled={universities.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-coral disabled:bg-ink/20 text-white px-5 py-3 text-[13px] font-bold"
              >
                <Plus className="h-4 w-4" />
                Add Course
              </button>
            </div>

            {universities.length === 0 && (
              <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-[12px] text-amber-900">
                Add at least one university first. Every course must belong to a university.
              </div>
            )}

            {/* COURSE QUALITY COUNTERS */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {[
                ['Total courses', courseSummary.total, 'all'],
                ['Verified', courseSummary.verified, 'verified'],
                ['Need verification', courseSummary.needsVerification, 'needs'],
                ['Missing tuition', courseSummary.missingFees, 'fees'],
                ['Missing eligibility', courseSummary.missingEligibility, 'eligibility'],
                ['Missing source', courseSummary.missingSource, 'source']
              ].map(([label, value, kind]) => (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 ${
                    kind === 'verified'
                      ? 'bg-green-50 border-green-200'
                      : kind === 'needs'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-white border-ink/10'
                  }`}
                >
                  <div className="text-[9px] mono uppercase tracking-widest text-ink/45">
                    {label}
                  </div>
                  <div className="serif text-3xl mt-1">
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* COURSE FILTERS */}
            <div className="mt-5 grid lg:grid-cols-[1.25fr_150px_180px_1fr_220px] gap-3">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-ink/35" />
                <input
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  placeholder="Search course or university..."
                  className={`${inputClass} pl-11`}
                />
              </div>

              <select
                value={courseStreamFilter}
                onChange={e => {
                  setCourseStreamFilter(e.target.value);
                  setCourseUniversityFilter('All');
                }}
                className={inputClass}
              >
                {['All', 'MBBS', 'Management', 'Other'].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <select
                value={courseCountryFilter}
                onChange={e => {
                  setCourseCountryFilter(e.target.value);
                  setCourseUniversityFilter('All');
                }}
                className={inputClass}
              >
                {courseCountries.map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <select
                value={courseUniversityFilter}
                onChange={e => setCourseUniversityFilter(e.target.value)}
                className={inputClass}
              >
                {courseUniversities.map(x => (
                  <option key={x} value={x}>
                    {x === 'All' ? 'All universities' : x}
                  </option>
                ))}
              </select>

              <select
                value={courseVerificationFilter}
                onChange={e => setCourseVerificationFilter(e.target.value)}
                className={inputClass}
              >
                {[
                  'All',
                  'Verified',
                  'Needs verification',
                  'Missing tuition',
                  'Missing eligibility',
                  'Missing source',
                  'Missing / stale verification',
                  'Missing intake'
                ].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </div>

            {courseError && !courseEditorOpen && (
              <div className="mt-4 rounded-xl bg-red-50 text-red-700 p-3 text-[12px]">
                {courseError}
              </div>
            )}

            <div className="mt-5 rounded-3xl bg-white border border-ink/10 overflow-hidden divide-y divide-ink/5">
              {loadingCourses && (
                <div className="p-8 text-center text-ink/50">
                  Loading…
                </div>
              )}

              {!loadingCourses && filteredCourses.length === 0 && (
                <div className="p-8 text-center text-ink/50">
                  No courses match these filters.
                </div>
              )}

              {filteredCourses.map(item => {
                const check = courseVerification(item);

                return (
                  <div
                    key={item.id}
                    className="p-5"
                  >
                    <div className="flex flex-wrap gap-4 items-start">
                      <div className="flex-1 min-w-[260px]">
                        <div className="text-[10px] mono uppercase text-coral">
                          {item.stream} · {item.country}
                        </div>

                        <div className="serif text-xl mt-1">
                          {item.name}
                        </div>

                        <div className="text-[12px] text-ink/55 mt-1">
                          {item.university_name}
                          {item.city ? ` · ${item.city}` : ''}
                        </div>
                      </div>

                      <div className="text-[12px] min-w-[145px]">
                        <div className="text-[9px] mono uppercase text-ink/35">
                          Tuition / year
                        </div>

                        <div className="font-semibold mt-1">
                          {formatMoney(
                            item.tuition_fee_year,
                            item.currency
                          )}
                        </div>

                        <div className="text-[10px] text-ink/40 mt-1">
                          {item.duration || 'Duration missing'}
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 text-[10px] rounded-full px-3 py-1.5 ${
                          check.verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {check.verified ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        )}

                        {check.verified
                          ? 'Verified'
                          : 'Needs verification'}
                      </div>

                      <div className="text-[10px] uppercase rounded-full bg-cream border border-ink/10 px-3 py-1.5">
                        {item.status}
                      </div>

                      <button
                        onClick={() => openQuickVerify(item)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ink text-cream px-3 py-2 text-[11px] font-semibold"
                        title="Quick verify"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Quick Verify
                      </button>

                      <button
                        onClick={() => openEditCourse(item)}
                        title="Full edit"
                        className="h-9 w-9 rounded-full border border-ink/10 bg-white grid place-items-center"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => toggleCourseStatus(item)}
                        className="text-[11px] font-semibold rounded-full border border-ink/10 bg-white px-3 py-2"
                      >
                        {item.status === 'published'
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>

                      <button
                        onClick={() => deleteCourse(item)}
                        className="h-9 w-9 rounded-full border border-red-100 bg-white grid place-items-center"
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </button>
                    </div>

                    {/* DATA QUALITY STRIP */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        ['Tuition', item.tuition_fee_year != null && item.tuition_fee_year !== ''],
                        ['Duration', Boolean(String(item.duration || '').trim())],
                        ['Medium', Boolean(String(item.medium || '').trim())],
                        ['Intake', Boolean(String(item.intake || '').trim())],
                        [
                          item.stream === 'MBBS' ? 'NEET' : 'Academic',
                          item.stream === 'MBBS'
                            ? Boolean(String(item.neet_requirement || '').trim())
                            : Boolean(
                                String(
                                  item.academic_requirement ||
                                  item.eligibility ||
                                  ''
                                ).trim()
                              )
                        ],
                        [
                          item.stream === 'MBBS' ? 'PCB' : 'Eligibility',
                          item.stream === 'MBBS'
                            ? Boolean(String(item.pcb_requirement || '').trim())
                            : Boolean(String(item.eligibility || '').trim())
                        ],
                        ['Source', Boolean(String(item.source_url || '').trim())],
                        ['Verified date', isRecentVerification(item.last_verified)]
                      ].map(([label, ok]) => (
                        <span
                          key={label}
                          className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
                            ok
                              ? 'bg-green-50 text-green-800 border border-green-100'
                              : 'bg-red-50 text-red-700 border border-red-100'
                          }`}
                        >
                          {ok ? '✓' : '!'} {label}
                        </span>
                      ))}
                    </div>

                    {!check.verified && check.missing.length > 0 && (
                      <div className="mt-3 text-[10px] text-ink/45">
                        Missing / stale:{' '}
                        {check.missing
                          .map(verificationLabel)
                          .join(' · ')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* APPLICATION DETAIL */}
      {applicationDetailOpen && selectedApplication && (
        <Modal
          title={selectedApplication.name || 'Application'}
          subtitle={selectedApplication.application_id}
          onClose={() => {
            setApplicationDetailOpen(false);
            setSelectedApplication(null);
          }}
        >
          {(() => {
            const item = selectedApplication;
            const route = item.selected_route || {};
            const profile = item.route_profile || {};
            const stage =
              item.stage ||
              item.application_status ||
              item.journey_stage ||
              'started';

            return (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    ['Application ID', item.application_id || '—'],
                    ['Stage', applicationStageLabel(stage)],
                    ['Track', item.stream || profile.stream || '—'],
                    ['Created', fmt(item.created_at)]
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl bg-white border border-ink/10 p-4"
                    >
                      <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                        {label}
                      </div>

                      <div className="text-[12px] font-semibold mt-1 break-words">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid lg:grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white border border-ink/10 p-5">
                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Student
                    </div>

                    <div className="mt-4 space-y-3 text-[12px]">
                      <div>
                        <span className="text-ink/45">Name:</span>{' '}
                        <strong>{item.name || '—'}</strong>
                      </div>

                      <div>
                        <span className="text-ink/45">Phone:</span>{' '}
                        <strong>{item.phone || '—'}</strong>
                      </div>

                      <div>
                        <span className="text-ink/45">Email:</span>{' '}
                        <strong>{item.email || '—'}</strong>
                      </div>

                      <div>
                        <span className="text-ink/45">State:</span>{' '}
                        <strong>{item.state || '—'}</strong>
                      </div>

                      <div>
                        <span className="text-ink/45">Preferred contact:</span>{' '}
                        <strong>{item.preferred_contact || '—'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-ink/10 p-5">
                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Selected route
                    </div>

                    <div className="serif text-2xl mt-4">
                      {route.university_name || 'No university selected'}
                    </div>

                    <div className="text-[12px] text-ink/55 mt-1">
                      {route.course_name || '—'}
                      {route.country ? ` · ${route.country}` : ''}
                      {route.city ? ` · ${route.city}` : ''}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-cream p-3">
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35">
                          Route score
                        </div>
                        <div className="font-semibold mt-1">
                          {route.route_score != null
                            ? `${route.route_score}/100`
                            : '—'}
                        </div>
                      </div>

                      <div className="rounded-xl bg-cream p-3">
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35">
                          Match
                        </div>
                        <div className="font-semibold mt-1">
                          {route.match_type
                            ? String(route.match_type).replaceAll('_', ' ')
                            : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-5">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    Build My Route profile
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      ['Preferred countries',
                        Array.isArray(profile.preferred_countries) &&
                        profile.preferred_countries.length
                          ? profile.preferred_countries.join(', ')
                          : '—'],
                      ['Budget',
                        profile.budget_total != null
                          ? `${profile.budget_currency || 'USD'} ${Number(
                              profile.budget_total
                            ).toLocaleString()}`
                          : 'Flexible / not entered'],
                      ['NEET status',
                        profile.neet_status
                          ? String(profile.neet_status).replaceAll('_', ' ')
                          : '—'],
                      ['NEET score', profile.neet_score ?? '—'],
                      ['PCB %', profile.pcb_percentage ?? '—'],
                      ['Desired level', profile.desired_level || '—'],
                      ['Academic %', profile.academic_percentage ?? '—'],
                      ['IELTS', profile.ielts_score ?? '—']
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-cream border border-ink/5 p-3"
                      >
                        <div className="text-[9px] mono uppercase tracking-widest text-ink/35">
                          {label}
                        </div>
                        <div className="text-[11px] font-semibold mt-1">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {Array.isArray(item.shortlisted_routes) &&
                 item.shortlisted_routes.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-5">
                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Shortlisted routes
                    </div>

                    <div className="mt-4 space-y-2">
                      {item.shortlisted_routes.map((short, index) => (
                        <div
                          key={`${short.course_id || index}-${index}`}
                          className="rounded-xl bg-cream p-3 flex flex-wrap gap-3 items-center"
                        >
                          <div className="flex-1">
                            <div className="text-[12px] font-semibold">
                              {short.university_name || 'University'}
                            </div>
                            <div className="text-[10px] text-ink/45 mt-1">
                              {short.course_name || 'Course'}
                              {short.country ? ` · ${short.country}` : ''}
                            </div>
                          </div>

                          {short.score != null && (
                            <div className="text-[11px] font-semibold">
                              {short.score}/100
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-5 rounded-2xl bg-ink text-cream p-5">
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    Update admissions stage
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {APPLICATION_STAGES.map(option => (
                      <button
                        key={option.key}
                        disabled={
                          updatingApplicationId === item.application_id
                        }
                        onClick={() =>
                          updateApplicationStage(
                            item.application_id,
                            option.key
                          )
                        }
                        className={`rounded-full px-3 py-2 text-[10px] font-semibold transition ${
                          stage === option.key
                            ? 'bg-coral text-white'
                            : 'bg-white/10 text-cream hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 text-[10px] text-ink/40 leading-relaxed">
                  Last updated: {fmt(item.updated_at || item.created_at)}
                </div>
              </>
            );
          })()}
        
            {/* DOCUMENT CHECKLIST */}
            <div className="mt-7 rounded-3xl bg-white border border-ink/10 overflow-hidden">

              <div className="p-5 sm:p-6 border-b border-ink/10 flex flex-wrap items-start gap-4">

                <div>
                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    Document management
                  </div>

                  <div className="serif text-2xl mt-1">
                    Student documents.
                  </div>

                  <p className="mt-1 text-[11px] text-ink/50 max-w-2xl">
                    Record whether each required document is pending, received, verified or rejected. Notes remain internal to the admin CRM.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    loadApplicationDocuments(
                      selectedApplication.application_id
                    )
                  }
                  className="ml-auto inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-[11px] font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh documents
                </button>

              </div>

              {applicationDocumentSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-5 border-b border-ink/10">

                  {[
                    ['Total', applicationDocumentSummary.total || 0],
                    ['Pending', applicationDocumentSummary.pending || 0],
                    ['Received', applicationDocumentSummary.received || 0],
                    ['Verified', applicationDocumentSummary.verified || 0],
                    ['Rejected', applicationDocumentSummary.rejected || 0]
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="p-4 border-r last:border-r-0 border-ink/10"
                    >
                      <div className="text-[8px] mono uppercase tracking-widest text-ink/35">
                        {label}
                      </div>
                      <div className="serif text-2xl mt-1">
                        {value}
                      </div>
                    </div>
                  ))}

                </div>
              )}

              {documentError && (
                <div className="m-5 rounded-xl bg-red-50 border border-red-100 p-3 text-[11px] text-red-700">
                  {documentError}
                </div>
              )}

              {loadingApplicationDocuments ? (
                <div className="p-8 text-center text-[12px] text-ink/45">
                  Loading document checklist…
                </div>
              ) : applicationDocuments.length === 0 ? (
                <div className="p-8 text-center text-[12px] text-ink/45">
                  No document checklist available.
                </div>
              ) : (
                <div className="divide-y divide-ink/5">

                  {applicationDocuments.map(item => {

                    const status =
                      item.status || 'pending';

                    return (
                      <div
                        key={item.key}
                        className="p-5 grid lg:grid-cols-[1.1fr_170px_1.5fr_auto] gap-4 items-start"
                      >

                        <div>
                          <div className="text-[12px] font-semibold">
                            {item.label}
                          </div>

                          <div className="text-[9px] mono uppercase tracking-widest text-ink/35 mt-1">
                            {item.key}
                          </div>

                          {item.updated_at && (
                            <div className="text-[9px] text-ink/35 mt-1">
                              Updated {fmt(item.updated_at)}
                            </div>
                          )}
                        </div>

                        <select
                          value={status}
                          disabled={
                            updatingDocumentKey ===
                            item.key
                          }
                          onChange={e =>
                            updateApplicationDocument(
                              selectedApplication.application_id,
                              item.key,
                              e.target.value,
                              item.note || ''
                            )
                          }
                          className={`w-full rounded-xl border px-3 py-2.5 text-[11px] font-semibold outline-none ${
                            status === 'verified'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : status === 'received'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : status === 'rejected'
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-cream border-ink/15 text-ink/60'
                          }`}
                        >
                          <option value="pending">
                            Pending
                          </option>
                          <option value="received">
                            Received
                          </option>
                          <option value="verified">
                            Verified
                          </option>
                          <option value="rejected">
                            Rejected
                          </option>
                        </select>

                        <div>
                          <input
                            value={item.note || ''}
                            onChange={e =>
                              updateDocumentNote(
                                item.key,
                                e.target.value
                              )
                            }
                            placeholder="Internal note — optional"
                            className={inputClass}
                          />

                          <div className="text-[9px] text-ink/35 mt-1">
                            This note is not exposed on public tracking.
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={
                            updatingDocumentKey ===
                            item.key
                          }
                          onClick={() =>
                            updateApplicationDocument(
                              selectedApplication.application_id,
                              item.key,
                              status,
                              item.note || ''
                            )
                          }
                          className="rounded-full bg-ink text-cream px-4 py-2.5 text-[10px] font-semibold disabled:opacity-50 whitespace-nowrap"
                        >
                          {updatingDocumentKey ===
                          item.key
                            ? 'Saving…'
                            : 'Save'}
                        </button>

                      </div>
                    );
                  })}

                </div>
              )}

            </div>

</Modal>
      )}

      {/* BLOG EDITOR */}
      {blogEditorOpen && (
        <Modal
          title={editingBlogId ? 'Edit blog' : 'New blog'}
          subtitle="The public blog system stays exactly database-driven."
          onClose={() => setBlogEditorOpen(false)}
        >
          {blogError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-[12px]">
              {blogError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Title">
              <input
                value={blogForm.title}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    title: e.target.value,
                    slug:
                      old.slug && editingBlogId
                        ? old.slug
                        : slugify(e.target.value)
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Slug">
              <input
                value={blogForm.slug}
                onChange={e =>
                  setBlogForm(old => ({ ...old, slug: e.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Category">
              <select
                value={blogForm.category}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    category: e.target.value
                  }))
                }
                className={inputClass}
              >
                {['MBBS', 'Management', 'Italy', 'Germany', 'Guidance'].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>

            <Field label="Read time (minutes)">
              <input
                type="number"
                value={blogForm.read_time}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    read_time: e.target.value
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Excerpt">
              <textarea
                value={blogForm.excerpt}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    excerpt: e.target.value
                  }))
                }
                className={textareaClass}
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {['paragraph', 'heading', 'list'].map(type => (
              <button
                key={type}
                onClick={() => addBlogBlock(type)}
                className="rounded-full border border-ink/15 bg-white px-3 py-2 text-[11px] font-semibold capitalize"
              >
                + {type}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {blogForm.body.map((block, index) => (
              <div
                key={index}
                className="rounded-2xl bg-white border border-ink/10 p-4"
              >
                <div className="flex justify-between gap-3 mb-3">
                  <div className="text-[10px] mono uppercase text-coral">
                    {block.type}
                  </div>
                  <button onClick={() => removeBlogBlock(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>

                {block.type === 'list' ? (
                  <textarea
                    value={(block.items || []).join('\n')}
                    onChange={e =>
                      updateBlogBlock(index, {
                        items: e.target.value.split('\n')
                      })
                    }
                    placeholder="One list item per line"
                    className={textareaClass}
                  />
                ) : (
                  <textarea
                    value={block.text || ''}
                    onChange={e =>
                      updateBlogBlock(index, { text: e.target.value })
                    }
                    className={textareaClass}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <Field label="SEO title">
              <input
                value={blogForm.seo_title}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    seo_title: e.target.value
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Keywords">
              <input
                value={blogForm.keywordsText}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    keywordsText: e.target.value
                  }))
                }
                placeholder="NEET, MBBS abroad, Georgia"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Meta description">
              <textarea
                value={blogForm.meta_description}
                onChange={e =>
                  setBlogForm(old => ({
                    ...old,
                    meta_description: e.target.value
                  }))
                }
                className={textareaClass}
              />
            </Field>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              onClick={() => saveBlog('draft')}
              disabled={savingBlog}
              className="rounded-full border border-ink/15 px-5 py-3 text-[12px] font-semibold"
            >
              Save draft
            </button>
            <button
              onClick={() => saveBlog('published')}
              disabled={savingBlog}
              className="rounded-full bg-coral text-white px-5 py-3 text-[12px] font-bold"
            >
              {savingBlog ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </Modal>
      )}

      {/* UNIVERSITY EDITOR */}
      {universityEditorOpen && (
        <Modal
          title={editingUniversityId ? 'Edit university' : 'Add university'}
          subtitle="Institution data only. Do not enter fees or eligibility here."
          onClose={() => setUniversityEditorOpen(false)}
        >
          {universityError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-[12px]">
              {universityError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="University name *">
              <input
                value={universityForm.name}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    name: e.target.value,
                    slug:
                      editingUniversityId && old.slug
                        ? old.slug
                        : slugify(e.target.value)
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Country *">
              <input
                value={universityForm.country}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    country: e.target.value
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="City">
              <input
                value={universityForm.city}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    city: e.target.value
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field
              label="Primary track"
              hint="Compatibility field for the old website. Courses can still be MBBS, Management or Other independently."
            >
              <select
                value={universityForm.stream}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    stream: e.target.value
                  }))
                }
                className={inputClass}
              >
                <option>MBBS</option>
                <option>Management</option>
              </select>
            </Field>

            <Field label="Slug">
              <input
                value={universityForm.slug}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    slug: e.target.value
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Official website">
              <input
                value={universityForm.website}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    website: e.target.value
                  }))
                }
                placeholder="https://..."
                className={inputClass}
              />
            </Field>

            <Field
              label="University Image URL"
              hint="Paste a public image URL of the university building. No upload/storage is required."
            >
              <input
                value={universityForm.image_url}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    image_url: e.target.value
                  }))
                }
                placeholder="https://example.com/university-building.jpg"
                className={inputClass}
              />

              <button
                type="button"
                onClick={findUniversityImage}
                disabled={findingUniversityImage || !universityForm.name.trim()}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2 text-[11px] font-semibold disabled:opacity-40"
              >
                <Search className="h-3.5 w-3.5" />
                {findingUniversityImage
                  ? 'Finding image…'
                  : 'Find Image Automatically'}
              </button>
            </Field>
          </div>

          {universityForm.image_url && (
            <div className="mt-4 rounded-2xl border border-ink/10 bg-cream overflow-hidden">
              <div className="px-4 py-3 text-[9px] mono uppercase tracking-widest text-ink/40">
                Image preview
              </div>

              <div className="aspect-[16/7] bg-ink/5">
                <img
                  src={universityForm.image_url}
                  alt="University preview"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <Field label="Short university overview">
              <textarea
                value={universityForm.overview}
                onChange={e =>
                  setUniversityForm(old => ({
                    ...old,
                    overview: e.target.value
                  }))
                }
                className={textareaClass}
              />
            </Field>
          </div>

          <label className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold">
            <input
              type="checkbox"
              checked={universityForm.featured}
              onChange={e =>
                setUniversityForm(old => ({
                  ...old,
                  featured: e.target.checked
                }))
              }
            />
            Featured university
          </label>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              onClick={() => saveUniversity('draft')}
              disabled={savingUniversity}
              className="rounded-full border border-ink/15 px-5 py-3 text-[12px] font-semibold"
            >
              Save draft
            </button>
            <button
              onClick={() => saveUniversity('published')}
              disabled={savingUniversity}
              className="rounded-full bg-coral text-white px-5 py-3 text-[12px] font-bold"
            >
              {savingUniversity ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </Modal>
      )}


      {/* QUICK VERIFY */}
      {quickVerifyOpen && quickVerifyItem && (
        <Modal
          title={`Quick Verify · ${quickVerifyItem.university_name}`}
          subtitle={`${quickVerifyItem.name} · ${quickVerifyItem.country}`}
          onClose={() => {
            setQuickVerifyOpen(false);
            setQuickVerifyItem(null);
          }}
        >
          {quickVerifyError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 p-3 text-[12px]">
              {quickVerifyError}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-ink/10 p-4">
            <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-coral mb-4">
              <ShieldCheck className="h-4 w-4" />
              Build My Route essentials
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Currency">
                <select
                  value={quickVerifyForm.currency}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      currency: e.target.value
                    }))
                  }
                  className={inputClass}
                >
                  {['USD', 'EUR', 'GBP', 'AUD', 'INR'].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tuition / year *">
                <input
                  type="number"
                  value={quickVerifyForm.tuition_fee_year}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      tuition_fee_year: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Duration *">
                <input
                  value={quickVerifyForm.duration}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      duration: e.target.value
                    }))
                  }
                  placeholder="6 years"
                  className={inputClass}
                />
              </Field>

              <Field label="Hostel / year">
                <input
                  type="number"
                  value={quickVerifyForm.hostel_fee_year}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      hostel_fee_year: e.target.value
                    }))
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Living / year">
                <input
                  type="number"
                  value={quickVerifyForm.living_cost_year}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      living_cost_year: e.target.value
                    }))
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Other one-time costs">
                <input
                  type="number"
                  value={quickVerifyForm.other_costs_total}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      other_costs_total: e.target.value
                    }))
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Medium *">
                <input
                  value={quickVerifyForm.medium}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      medium: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Intake">
                <input
                  value={quickVerifyForm.intake}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      intake: e.target.value
                    }))
                  }
                  placeholder="Fall / September"
                  className={inputClass}
                />
              </Field>

              <Field label="Last verified *">
                <input
                  type="date"
                  value={quickVerifyForm.last_verified}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      last_verified: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-4">
            <div className="text-[10px] mono uppercase tracking-widest text-coral mb-4">
              Eligibility
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {quickVerifyItem.stream === 'MBBS' ? (
                <>
                  <Field label="NEET requirement *">
                    <input
                      value={quickVerifyForm.neet_requirement}
                      onChange={e =>
                        setQuickVerifyForm(old => ({
                          ...old,
                          neet_requirement: e.target.value
                        }))
                      }
                      placeholder="Required for Indian students subject to applicable regulations."
                      className={inputClass}
                    />
                  </Field>

                  <Field label="PCB requirement *">
                    <input
                      value={quickVerifyForm.pcb_requirement}
                      onChange={e =>
                        setQuickVerifyForm(old => ({
                          ...old,
                          pcb_requirement: e.target.value
                        }))
                      }
                      placeholder="Example: 50% PCB"
                      className={inputClass}
                    />
                  </Field>
                </>
              ) : (
                <Field label="Academic requirement">
                  <input
                    value={quickVerifyForm.academic_requirement}
                    onChange={e =>
                      setQuickVerifyForm(old => ({
                        ...old,
                        academic_requirement: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              )}
            </div>

            <div className="mt-4">
              <Field
                label={
                  quickVerifyItem.stream === 'MBBS'
                    ? 'General eligibility *'
                    : 'General eligibility'
                }
              >
                <textarea
                  value={quickVerifyForm.eligibility}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      eligibility: e.target.value
                    }))
                  }
                  className={textareaClass}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-4">
            <div className="flex items-center gap-2 text-[10px] mono uppercase tracking-widest text-coral mb-4">
              <Link2 className="h-4 w-4" />
              Evidence & publishing
            </div>

            <Field
              label="Official source URL *"
              hint="Use the university programme, tuition or official admissions page used to verify this record."
            >
              <input
                value={quickVerifyForm.source_url}
                onChange={e =>
                  setQuickVerifyForm(old => ({
                    ...old,
                    source_url: e.target.value
                  }))
                }
                placeholder="https://..."
                className={inputClass}
              />
            </Field>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <label className="rounded-xl border border-ink/10 bg-cream p-3 flex items-center gap-2 text-[12px] font-semibold">
                <input
                  type="checkbox"
                  checked={quickVerifyForm.recommended}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      recommended: e.target.checked
                    }))
                  }
                />
                RYC recommended
              </label>

              <label className="rounded-xl border border-ink/10 bg-cream p-3 flex items-center gap-2 text-[12px] font-semibold">
                <input
                  type="checkbox"
                  checked={quickVerifyForm.budget_option}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      budget_option: e.target.checked
                    }))
                  }
                />
                Budget option
              </label>

              <Field label="Public status">
                <select
                  value={quickVerifyForm.status}
                  onChange={e =>
                    setQuickVerifyForm(old => ({
                      ...old,
                      status: e.target.value
                    }))
                  }
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              onClick={() => {
                setQuickVerifyOpen(false);
                setQuickVerifyItem(null);
              }}
              className="rounded-full border border-ink/15 px-5 py-3 text-[12px] font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={saveQuickVerify}
              disabled={savingQuickVerify}
              className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[12px] font-bold disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              {savingQuickVerify ? 'Saving…' : 'Save verification'}
            </button>
          </div>
        </Modal>
      )}

      {/* COURSE EDITOR */}
      {courseEditorOpen && (
        <Modal
          title={editingCourseId ? 'Edit course' : 'Add course'}
          subtitle="Changing programme information belongs here. Build My Route will read these records."
          onClose={() => setCourseEditorOpen(false)}
        >
          {courseError && (
            <div className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-[12px]">
              {courseError}
            </div>
          )}

          <div className="rounded-2xl bg-white border border-ink/10 p-4">
            <div className="text-[10px] mono uppercase tracking-widest text-coral mb-4">
              1 · Programme identity
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="University *">
                <select
                  value={courseForm.university_id}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      university_id: e.target.value
                    }))
                  }
                  className={inputClass}
                >
                  <option value="">Select university</option>
                  {[...universities]
                    .sort((a, b) =>
                      `${a.country}${a.name}`.localeCompare(
                        `${b.country}${b.name}`
                      )
                    )
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.country} — {u.name}
                      </option>
                    ))}
                </select>
              </Field>

              <Field label="Stream *">
                <select
                  value={courseForm.stream}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      stream: e.target.value,
                      level:
                        e.target.value === 'MBBS'
                          ? 'Medical'
                          : old.level
                    }))
                  }
                  className={inputClass}
                >
                  <option>MBBS</option>
                  <option>Management</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field label="Course name *">
                <input
                  value={courseForm.name}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      name: e.target.value,
                      slug:
                        editingCourseId && old.slug
                          ? old.slug
                          : slugify(e.target.value)
                    }))
                  }
                  placeholder="General Medicine / MSc Data Science"
                  className={inputClass}
                />
              </Field>

              <Field label="Level">
                <input
                  value={courseForm.level}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      level: e.target.value
                    }))
                  }
                  placeholder="Medical / Bachelor / Master"
                  className={inputClass}
                />
              </Field>

              <Field label="Duration">
                <input
                  value={courseForm.duration}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      duration: e.target.value
                    }))
                  }
                  placeholder="6 years / 2 years"
                  className={inputClass}
                />
              </Field>

              <Field label="Medium">
                <input
                  value={courseForm.medium}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      medium: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-4">
            <div className="text-[10px] mono uppercase tracking-widest text-coral mb-4">
              2 · Cost & intake
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Currency">
                <select
                  value={courseForm.currency}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      currency: e.target.value
                    }))
                  }
                  className={inputClass}
                >
                  {['USD', 'EUR', 'GBP', 'AUD', 'INR'].map(x => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>

              <Field label="Tuition / year">
                <input
                  type="number"
                  value={courseForm.tuition_fee_year}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      tuition_fee_year: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Hostel / year">
                <input
                  type="number"
                  value={courseForm.hostel_fee_year}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      hostel_fee_year: e.target.value
                    }))
                  }
                  placeholder="Optional"
                  className={inputClass}
                />
              </Field>

              <Field label="Living / year">
                <input
                  type="number"
                  value={courseForm.living_cost_year}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      living_cost_year: e.target.value
                    }))
                  }
                  placeholder="Food + local living estimate"
                  className={inputClass}
                />
              </Field>

              <Field label="Other one-time costs">
                <input
                  type="number"
                  value={courseForm.other_costs_total}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      other_costs_total: e.target.value
                    }))
                  }
                  placeholder="Application / processing / misc."
                  className={inputClass}
                />
              </Field>

              <Field
                label="Total course tuition"
                hint="Calculated automatically from duration × tuition/year. You do not need to maintain this field."
              >
                <input
                  type="text"
                  value={formatMoney(calculatedTuitionTotal, courseForm.currency)}
                  readOnly
                  className={`${inputClass} bg-cream text-ink/60 cursor-not-allowed`}
                />
              </Field>

              <Field label="Intake">
                <input
                  value={courseForm.intake}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      intake: e.target.value
                    }))
                  }
                  placeholder="September 2027"
                  className={inputClass}
                />
              </Field>

              <Field label="Application deadline">
                <input
                  value={courseForm.application_deadline}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      application_deadline: e.target.value
                    }))
                  }
                  placeholder="30 April 2027"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <div className="rounded-2xl bg-cream border border-ink/10 p-4">
                <div className="text-[9px] mono uppercase tracking-widest text-ink/40">
                  Auto tuition estimate
                </div>
                <div className="serif text-2xl mt-1">
                  {formatMoney(calculatedTuitionTotal, courseForm.currency)}
                </div>
                <div className="text-[10px] text-ink/45 mt-1">
                  Duration × tuition/year
                </div>
              </div>

              <div className="rounded-2xl bg-ink text-cream p-4">
                <div className="text-[9px] mono uppercase tracking-widest text-coral">
                  Auto total study estimate
                </div>
                <div className="serif text-2xl mt-1">
                  {formatMoney(calculatedEstimatedTotal, courseForm.currency)}
                </div>
                <div className="text-[10px] text-cream/55 mt-1">
                  Tuition + hostel + living for duration + one-time costs
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-4">
            <div className="text-[10px] mono uppercase tracking-widest text-coral mb-4">
              3 · Eligibility
            </div>

            <Field label="General eligibility">
              <textarea
                value={courseForm.eligibility}
                onChange={e =>
                  setCourseForm(old => ({
                    ...old,
                    eligibility: e.target.value
                  }))
                }
                className={textareaClass}
              />
            </Field>

            {courseForm.stream === 'MBBS' ? (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="NEET requirement">
                  <input
                    value={courseForm.neet_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        neet_requirement: e.target.value
                      }))
                    }
                    placeholder="Required / Qualifying NEET"
                    className={inputClass}
                  />
                </Field>

                <Field label="PCB requirement">
                  <input
                    value={courseForm.pcb_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        pcb_requirement: e.target.value
                      }))
                    }
                    placeholder="50% PCB"
                    className={inputClass}
                  />
                </Field>
              </div>
            ) : (
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <Field label="Academic requirement">
                  <input
                    value={courseForm.academic_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        academic_requirement: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="English requirement">
                  <input
                    value={courseForm.english_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        english_requirement: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="IELTS requirement">
                  <input
                    value={courseForm.ielts_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        ielts_requirement: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="GMAT / GRE">
                  <input
                    value={courseForm.gmat_gre_requirement}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        gmat_gre_requirement: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Work experience">
                  <input
                    value={courseForm.work_experience}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        work_experience: e.target.value
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-2xl bg-white border border-ink/10 p-4">
            <div className="text-[10px] mono uppercase tracking-widest text-coral mb-4">
              4 · Matching & verification
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Last verified">
                <input
                  type="date"
                  value={courseForm.last_verified}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      last_verified: e.target.value
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Official source URL">
                <input
                  value={courseForm.source_url}
                  onChange={e =>
                    setCourseForm(old => ({
                      ...old,
                      source_url: e.target.value
                    }))
                  }
                  placeholder="University programme / fee page"
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-5 text-[12px] font-semibold">
              {[
                ['featured', 'Featured'],
                ['recommended', 'Recommended'],
                ['budget_option', 'Budget option']
              ].map(([key, label]) => (
                <label key={key} className="inline-flex gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={Boolean(courseForm[key])}
                    onChange={e =>
                      setCourseForm(old => ({
                        ...old,
                        [key]: e.target.checked
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button
              onClick={() => saveCourse('draft')}
              disabled={savingCourse}
              className="rounded-full border border-ink/15 px-5 py-3 text-[12px] font-semibold"
            >
              Save draft
            </button>

            <button
              onClick={() => saveCourse('published')}
              disabled={savingCourse}
              className="rounded-full bg-coral text-white px-5 py-3 text-[12px] font-bold"
            >
              {savingCourse ? 'Saving…' : 'Publish'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
