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
  FileText
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
    loadNewsletter();
    loadBlogs();
    loadUniversities();
    loadCourses();
  }, [user, loadNewsletter, loadBlogs, loadUniversities, loadCourses]);

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
    const stale = courses.filter(x => {
      if (!x.last_verified) return true;
      const age = Date.now() - new Date(x.last_verified).getTime();
      return age > 90 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      total: courses.length,
      published,
      draft,
      stale
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

  const filteredCourses = useMemo(() => {
    let rows = [...courses];

    if (courseStreamFilter !== 'All') {
      rows = rows.filter(x => x.stream === courseStreamFilter);
    }

    if (courseCountryFilter !== 'All') {
      rows = rows.filter(x => x.country === courseCountryFilter);
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
  }, [courses, courseStreamFilter, courseCountryFilter, courseSearch]);

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
      overview: item.overview || '',
      featured: Boolean(item.featured),
      status: item.status || 'draft'
    });
    setUniversityEditorOpen(true);
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

  const refreshAll = () => {
    loadLeads();
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
                ['Universities', universitySummary.total],
                ['Medical', universitySummary.medical],
                ['Management', universitySummary.management],
                ['Courses', courseSummary.total],
                ['Published courses', courseSummary.published],
                ['Draft courses', courseSummary.draft],
                ['Need verification', courseSummary.stale],
                ['Blogs', blogs.length]
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
                  Programme Master
                </div>
                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Courses.
                </h1>
                <p className="mt-2 text-[13px] text-ink/60">
                  This is the database Build My Route will match students against.
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

            <div className="mt-5 grid lg:grid-cols-[1fr_180px_200px] gap-3">
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
                onChange={e => setCourseStreamFilter(e.target.value)}
                className={inputClass}
              >
                {['All', 'MBBS', 'Management', 'Other'].map(x => (
                  <option key={x}>{x}</option>
                ))}
              </select>

              <select
                value={courseCountryFilter}
                onChange={e => setCourseCountryFilter(e.target.value)}
                className={inputClass}
              >
                {courseCountries.map(x => (
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
                <div className="p-8 text-center text-ink/50">Loading…</div>
              )}

              {!loadingCourses && filteredCourses.length === 0 && (
                <div className="p-8 text-center text-ink/50">
                  No courses yet. Start with your MBBS partner universities.
                </div>
              )}

              {filteredCourses.map(item => {
                const stale = !item.last_verified ||
                  Date.now() - new Date(item.last_verified).getTime() >
                    90 * 24 * 60 * 60 * 1000;

                return (
                  <div
                    key={item.id}
                    className="p-5 flex flex-wrap gap-4 items-center"
                  >
                    <div className="flex-1 min-w-[260px]">
                      <div className="text-[10px] mono uppercase text-coral">
                        {item.stream} · {item.country}
                      </div>
                      <div className="serif text-xl mt-1">{item.name}</div>
                      <div className="text-[12px] text-ink/55 mt-1">
                        {item.university_name}
                      </div>
                    </div>

                    <div className="text-[12px] min-w-[150px]">
                      <div className="text-[9px] mono uppercase text-ink/35">
                        Tuition / year
                      </div>
                      <div className="font-semibold mt-1">
                        {formatMoney(item.tuition_fee_year, item.currency)}
                      </div>
                      <div className="text-[10px] text-ink/40 mt-1">
                        Total: {formatMoney(
                          item.total_course_cost ??
                            (
                              durationYears(item.duration) != null &&
                              item.tuition_fee_year != null
                                ? durationYears(item.duration) *
                                  Number(item.tuition_fee_year)
                                : null
                            ),
                          item.currency
                        )}
                      </div>
                    </div>

                    <div
                      className={`text-[10px] rounded-full px-3 py-1.5 ${
                        stale
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {stale ? 'Needs verification' : 'Verified'}
                    </div>

                    <div className="text-[10px] uppercase">
                      {item.status}
                    </div>

                    <button onClick={() => openEditCourse(item)}>
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => toggleCourseStatus(item)}
                      className="text-[11px] font-semibold"
                    >
                      {item.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>

                    <button onClick={() => deleteCourse(item)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

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
          </div>

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
