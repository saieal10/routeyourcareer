import React, {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  Link,
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  adminLeads,
  adminStats,
  adminNewsletter,
  logout,
  me
} from '../lib/api';

import {
  Copy,
  RefreshCw,
  LogOut,
  Users,
  Phone,
  Mail,
  Filter,
  Send,
  Sparkles,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Save,
  X,
  LayoutDashboard,
  FileText,
  Heading2,
  List,
  Globe2,
  GraduationCap,
  Search,
  Star,
  MapPin,
  BriefcaseBusiness,
  Stethoscope,
  BadgeCheck,
  WalletCards
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
  body: [],
  cta: 'mbbs',
  seo_title: '',
  meta_description: '',
  keywordsText: '',
  status: 'draft'
};


const EMPTY_UNIVERSITY = {

  // Main classification
  stream: 'MBBS',

  // Basic
  name: '',
  slug: '',
  country: 'Georgia',
  city: '',

  // Course
  course: 'MBBS',
  course_level: '',
  duration: '',
  medium: 'English',
  intake: '',
  application_deadline: '',

  // Fees
  currency: 'USD',
  tuition_fee_year: '',
  hostel_fee_year: '',
  food_fee_year: '',
  first_year_total: '',
  total_course_cost: '',
  application_fee: '',
  scholarship_info: '',

  // General eligibility
  eligibility: '',

  // MBBS
  neet_requirement: '',
  pcb_requirement: '',
  internship: '',
  recognition: '',
  nmc_notes: '',
  fmge_next_notes: '',

  // Management
  academic_requirement: '',
  english_requirement: '',
  ielts_requirement: '',
  toefl_requirement: '',
  gmat_gre_requirement: '',
  work_experience: '',
  specializationsText: '',
  internship_opportunities: '',
  placement_info: '',
  post_study_opportunities: '',

  // Institution
  overview: '',
  accreditation: '',
  ranking: '',
  established_year: '',
  campus: '',

  // Student life
  hostel: '',
  indian_food: '',
  student_life: '',
  climate: '',
  airport_distance: '',

  // Lists
  prosText: '',
  consText: '',
  documentsText: '',
  admissionText: '',
  faqsText: '',

  // Links
  website: '',
  apply_link: '',

  // Display
  featured: false,
  popular: false,
  budget_option: false,
  recommended: false,

  // SEO
  seo_title: '',
  meta_description: '',
  keywordsText: '',

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


function linesToArray(text) {
  return String(text || '')
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean);
}


function optionalNumber(value) {
  if (
    value === '' ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const n = Number(value);

  return Number.isFinite(n)
    ? n
    : null;
}


function faqTextToArray(text) {
  return String(text || '')
    .split('\n')
    .map(x => x.trim())
    .filter(Boolean)
    .map(line => {
      const pos = line.indexOf('|');

      if (pos === -1) {
        return {
          question: line,
          answer: ''
        };
      }

      return {
        question:
          line.slice(0, pos).trim(),

        answer:
          line.slice(pos + 1).trim()
      };
    })
    .filter(x => x.question);
}


function faqArrayToText(faqs) {
  if (!Array.isArray(faqs)) {
    return '';
  }

  return faqs
    .map(
      faq =>
        `${faq.question || ''} | ${faq.answer || ''}`
    )
    .join('\n');
}


async function adminFetch(
  path,
  options = {}
) {

  const response = await fetch(
    `${BACKEND_URL}${path}`,
    {
      credentials: 'include',
      ...options,

      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok) {

    let detail =
      `Request failed (${response.status})`;

    try {
      const data = await response.json();

      detail =
        data?.detail ||
        detail;
    } catch {
      // ignore
    }

    const error =
      new Error(detail);

    error.status =
      response.status;

    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


function blankBlock(type) {

  if (type === 'heading') {
    return {
      type: 'heading',
      text: ''
    };
  }

  if (type === 'list') {
    return {
      type: 'list',
      items: ['']
    };
  }

  return {
    type: 'paragraph',
    text: ''
  };
}


export default function AdminDashboard() {

  const location =
    useLocation();

  const nav =
    useNavigate();


  // =====================================================
  // AUTH
  // =====================================================

  const [user, setUser] =
    useState(
      location.state?.user ||
      null
    );

  const [checking, setChecking] =
    useState(
      !location.state?.user
    );

  const [section, setSection] =
    useState('dashboard');


  // =====================================================
  // LEADS
  // =====================================================

  const [leads, setLeads] =
    useState([]);

  const [stats, setStats] =
    useState(null);

  const [leadTab, setLeadTab] =
    useState('');

  const [q, setQ] =
    useState('');

  const [
    loadingLeads,
    setLoadingLeads
  ] = useState(false);


  // =====================================================
  // NEWSLETTER
  // =====================================================

  const [
    newsletter,
    setNewsletter
  ] = useState([]);

  const [
    loadingNewsletter,
    setLoadingNewsletter
  ] = useState(false);


  // =====================================================
  // BLOGS
  // =====================================================

  const [blogs, setBlogs] =
    useState([]);

  const [
    loadingBlogs,
    setLoadingBlogs
  ] = useState(false);

  const [
    blogEditorOpen,
    setBlogEditorOpen
  ] = useState(false);

  const [
    editingBlogId,
    setEditingBlogId
  ] = useState(null);

  const [
    blogForm,
    setBlogForm
  ] = useState(EMPTY_BLOG);

  const [
    savingBlog,
    setSavingBlog
  ] = useState(false);

  const [
    blogError,
    setBlogError
  ] = useState('');

  const [
    slugTouched,
    setSlugTouched
  ] = useState(false);


  // =====================================================
  // UNIVERSITIES
  // =====================================================

  const [
    universities,
    setUniversities
  ] = useState([]);

  const [
    loadingUniversities,
    setLoadingUniversities
  ] = useState(false);

  const [
    universityEditorOpen,
    setUniversityEditorOpen
  ] = useState(false);

  const [
    editingUniversityId,
    setEditingUniversityId
  ] = useState(null);

  const [
    universityForm,
    setUniversityForm
  ] = useState(EMPTY_UNIVERSITY);

  const [
    savingUniversity,
    setSavingUniversity
  ] = useState(false);

  const [
    universityError,
    setUniversityError
  ] = useState('');

  const [
    universitySlugTouched,
    setUniversitySlugTouched
  ] = useState(false);

  const [
    universityStreamFilter,
    setUniversityStreamFilter
  ] = useState('All');

  const [
    universityCountryFilter,
    setUniversityCountryFilter
  ] = useState('All');

  const [
    universitySearch,
    setUniversitySearch
  ] = useState('');


  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {

    if (user) return;

    (async () => {

      try {

        const u =
          await me();

        if (!u?.is_admin) {

          nav(
            '/admin/login?e=Not%20authorised',
            {
              replace: true
            }
          );

          return;
        }

        setUser(u);

      } catch {

        nav(
          '/admin/login',
          {
            replace: true
          }
        );

      } finally {

        setChecking(false);
      }

    })();

    // eslint-disable-next-line
  }, []);


  // =====================================================
  // LOAD LEADS
  // =====================================================

  const loadLeads =
    useCallback(
      async () => {

        if (!user) return;

        setLoadingLeads(true);

        try {

          const [ls, st] =
            await Promise.all([
              adminLeads(
                leadTab ||
                undefined
              ),
              adminStats()
            ]);

          setLeads(
            Array.isArray(ls)
              ? ls
              : []
          );

          setStats(st);

        } catch (e) {

          console.error(e);

        } finally {

          setLoadingLeads(false);
        }
      },
      [
        leadTab,
        user
      ]
    );


  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  // =====================================================
  // NEWSLETTER
  // =====================================================

  const loadNewsletter =
    useCallback(
      async () => {

        if (!user) return;

        setLoadingNewsletter(true);

        try {

          const data =
            await adminNewsletter();

          setNewsletter(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (e) {

          console.error(e);

        } finally {

          setLoadingNewsletter(false);
        }
      },
      [user]
    );


  // =====================================================
  // BLOGS
  // =====================================================

  const loadBlogs =
    useCallback(
      async () => {

        if (!user) return;

        setLoadingBlogs(true);

        try {

          const data =
            await adminFetch(
              '/api/admin/blogs'
            );

          setBlogs(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (e) {

          setBlogError(
            e.message
          );

        } finally {

          setLoadingBlogs(false);
        }
      },
      [user]
    );


  // =====================================================
  // UNIVERSITIES
  // =====================================================

  const loadUniversities =
    useCallback(
      async () => {

        if (!user) return;

        setLoadingUniversities(
          true
        );

        setUniversityError('');

        try {

          const data =
            await adminFetch(
              '/api/admin/universities'
            );

          setUniversities(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (e) {

          setUniversityError(
            e.message ||
            'Could not load universities.'
          );

        } finally {

          setLoadingUniversities(
            false
          );
        }
      },
      [user]
    );


  useEffect(() => {

    if (!user) return;

    loadNewsletter();
    loadBlogs();
    loadUniversities();

  }, [
    user,
    loadNewsletter,
    loadBlogs,
    loadUniversities
  ]);


  // =====================================================
  // COUNTS
  // =====================================================

  const publishedBlogCount =
    blogs.filter(
      x =>
        x.status ===
        'published'
    ).length;


  const draftBlogCount =
    blogs.filter(
      x =>
        x.status ===
        'draft'
    ).length;


  const publishedUniversityCount =
    universities.filter(
      x =>
        x.status ===
        'published'
    ).length;


  const draftUniversityCount =
    universities.filter(
      x =>
        x.status ===
        'draft'
    ).length;


  const mbbsCount =
    universities.filter(
      x =>
        x.stream ===
        'MBBS'
    ).length;


  const managementCount =
    universities.filter(
      x =>
        x.stream ===
        'Management'
    ).length;


  // =====================================================
  // UNIVERSITY FILTERS
  // =====================================================

  const universityCountries =
    useMemo(() => {

      const countries = [
        ...new Set(
          universities
            .filter(item =>
              universityStreamFilter === 'All' ||
              item.stream === universityStreamFilter
            )
            .map(item =>
              item.country
            )
            .filter(Boolean)
        )
      ].sort();

      return [
        'All',
        ...countries
      ];

    }, [
      universities,
      universityStreamFilter
    ]);


  const filteredUniversities =
    useMemo(() => {

      let result =
        [...universities];


      if (
        universityStreamFilter !==
        'All'
      ) {

        result =
          result.filter(
            x =>
              x.stream ===
              universityStreamFilter
          );
      }


      if (
        universityCountryFilter !==
        'All'
      ) {

        result =
          result.filter(
            x =>
              x.country ===
              universityCountryFilter
          );
      }


      if (
        universitySearch.trim()
      ) {

        const search =
          universitySearch
            .toLowerCase()
            .trim();

        result =
          result.filter(
            x =>
              [
                x.name,
                x.country,
                x.city,
                x.course,
                x.stream
              ].some(
                value =>
                  String(
                    value || ''
                  )
                    .toLowerCase()
                    .includes(search)
              )
          );
      }

      return result;

    }, [
      universities,
      universityStreamFilter,
      universityCountryFilter,
      universitySearch
    ]);


  // =====================================================
  // LEAD FILTER
  // =====================================================

  const filteredLeads =
    useMemo(() => {

      if (!q.trim()) {
        return leads;
      }

      const s =
        q.toLowerCase();

      return leads.filter(
        lead =>
          [
            lead.name,
            lead.phone,
            lead.email,
            lead.country,
            lead.neet_score,
            lead.source,
            lead.message
          ].some(
            value =>
              String(
                value || ''
              )
                .toLowerCase()
                .includes(s)
          )
      );

    }, [
      q,
      leads
    ]);


  // =====================================================
  // LOGOUT
  // =====================================================

  const signOut =
    async () => {

      try {
        await logout();
      } finally {
        nav(
          '/admin/login',
          {
            replace: true
          }
        );
      }
    };


  // =====================================================
  // COPY
  // =====================================================

  const copyNewsletter =
    () => {

      navigator.clipboard.writeText(
        newsletter
          .map(x => x.email)
          .filter(Boolean)
          .join('\n')
      );
    };


  const copyAll =
    () => {

      const csv = [

        'name,phone,email,country,neet,type,source',

        ...filteredLeads.map(
          lead =>
            [
              lead.name,
              lead.phone,
              lead.email,
              lead.country,
              lead.neet_score,
              lead.type,
              lead.source
            ]
              .map(
                x =>
                  `"${String(
                    x || ''
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(',')
        )

      ].join('\n');

      navigator.clipboard.writeText(
        csv
      );
    };


  // =====================================================
  // BLOG EDITOR
  // =====================================================

  const changeBlogField =
    (field, value) => {

      setBlogForm(
        old => ({
          ...old,
          [field]: value
        })
      );
    };


  const openNewBlog =
    () => {

      setEditingBlogId(null);

      setBlogForm({
        ...EMPTY_BLOG,
        body: [
          blankBlock(
            'paragraph'
          )
        ]
      });

      setSlugTouched(false);
      setBlogEditorOpen(true);
    };


  const openEditBlog =
    blog => {

      setEditingBlogId(
        blog.id
      );

      setSlugTouched(true);

      setBlogForm({

        title:
          blog.title || '',

        slug:
          blog.slug || '',

        category:
          blog.category || 'MBBS',

        author:
          blog.author ||
          'RYC Editorial',

        read_time:
          blog.read_time || 5,

        excerpt:
          blog.excerpt || '',

        body:
          Array.isArray(
            blog.body
          )
            ? blog.body.filter(
                x =>
                  x.type !==
                  'image'
              )
            : [],

        cta:
          blog.cta || 'mbbs',

        seo_title:
          blog.seo_title || '',

        meta_description:
          blog.meta_description || '',

        keywordsText:
          Array.isArray(
            blog.keywords
          )
            ? blog.keywords.join(
                ', '
              )
            : '',

        status:
          blog.status || 'draft'
      });

      setBlogEditorOpen(true);
    };


  const handleTitleChange =
    value => {

      setBlogForm(
        old => ({
          ...old,

          title:
            value,

          slug:
            slugTouched
              ? old.slug
              : slugify(value)
        })
      );
    };


  const addBodyBlock =
    type => {

      setBlogForm(
        old => ({
          ...old,

          body: [
            ...old.body,
            blankBlock(type)
          ]
        })
      );
    };


  const updateBodyBlock =
    (index, values) => {

      setBlogForm(
        old => {

          const body =
            [...old.body];

          body[index] = {
            ...body[index],
            ...values
          };

          return {
            ...old,
            body
          };
        }
      );
    };


  const removeBodyBlock =
    index => {

      setBlogForm(
        old => ({
          ...old,

          body:
            old.body.filter(
              (_, i) =>
                i !== index
            )
        })
      );
    };


  const saveBlog =
    async status => {

      if (!blogForm.title.trim()) {
        setBlogError(
          'Blog title is required.'
        );
        return;
      }


      const payload = {

        title:
          blogForm.title.trim(),

        slug:
          slugify(
            blogForm.slug ||
            blogForm.title
          ),

        category:
          blogForm.category,

        author:
          blogForm.author,

        read_time:
          Number(
            blogForm.read_time
          ) || 5,

        excerpt:
          blogForm.excerpt,

        body:
          blogForm.body,

        cta:
          blogForm.cta,

        seo_title:
          blogForm.seo_title ||
          blogForm.title,

        meta_description:
          blogForm.meta_description ||
          blogForm.excerpt,

        keywords:
          blogForm.keywordsText
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),

        status
      };


      setSavingBlog(true);

      try {

        if (editingBlogId) {

          await adminFetch(
            `/api/admin/blogs/${editingBlogId}`,
            {
              method: 'PUT',
              body:
                JSON.stringify(
                  payload
                )
            }
          );

        } else {

          await adminFetch(
            '/api/admin/blogs',
            {
              method: 'POST',
              body:
                JSON.stringify(
                  payload
                )
            }
          );
        }

        await loadBlogs();

        setBlogEditorOpen(false);

      } catch (e) {

        setBlogError(
          e.message
        );

      } finally {

        setSavingBlog(false);
      }
    };


  const deleteBlog =
    async blog => {

      if (
        !window.confirm(
          `Delete "${blog.title}"?`
        )
      ) {
        return;
      }

      await adminFetch(
        `/api/admin/blogs/${blog.id}`,
        {
          method: 'DELETE'
        }
      );

      await loadBlogs();
    };


  const toggleBlogStatus =
    async blog => {

      await adminFetch(
        `/api/admin/blogs/${blog.id}`,
        {
          method: 'PUT',

          body:
            JSON.stringify({
              status:
                blog.status ===
                'published'
                  ? 'draft'
                  : 'published'
            })
        }
      );

      await loadBlogs();
    };


  // =====================================================
  // UNIVERSITY EDITOR
  // =====================================================

  const changeUniversityField =
    (field, value) => {

      setUniversityForm(
        old => ({
          ...old,
          [field]: value
        })
      );
    };


  const changeUniversityStream =
    stream => {

      setUniversityForm(
        old => ({
          ...old,

          stream,

          course:
            stream === 'MBBS'
              ? (
                  old.stream ===
                  'Management'
                    ? 'MBBS'
                    : old.course
                )
              : (
                  old.stream ===
                  'MBBS'
                    ? 'MBA'
                    : old.course
                )
        })
      );
    };


  const openNewUniversity =
    () => {

      setEditingUniversityId(null);

      setUniversityForm({
        ...EMPTY_UNIVERSITY
      });

      setUniversitySlugTouched(
        false
      );

      setUniversityError('');

      setUniversityEditorOpen(
        true
      );
    };


  const openEditUniversity =
    item => {

      setEditingUniversityId(
        item.id
      );

      setUniversitySlugTouched(
        true
      );

      setUniversityForm({

        stream:
          item.stream ||
          'MBBS',

        name:
          item.name || '',

        slug:
          item.slug || '',

        country:
          item.country || '',

        city:
          item.city || '',

        course:
          item.course || '',

        course_level:
          item.course_level || '',

        duration:
          item.duration || '',

        medium:
          item.medium || 'English',

        intake:
          item.intake || '',

        application_deadline:
          item.application_deadline ||
          '',

        currency:
          item.currency || 'USD',

        tuition_fee_year:
          item.tuition_fee_year ??
          '',

        hostel_fee_year:
          item.hostel_fee_year ??
          '',

        food_fee_year:
          item.food_fee_year ??
          '',

        first_year_total:
          item.first_year_total ??
          '',

        total_course_cost:
          item.total_course_cost ??
          '',

        application_fee:
          item.application_fee ??
          '',

        scholarship_info:
          item.scholarship_info ||
          '',

        eligibility:
          item.eligibility || '',

        neet_requirement:
          item.neet_requirement ||
          '',

        pcb_requirement:
          item.pcb_requirement ||
          '',

        internship:
          item.internship || '',

        recognition:
          item.recognition || '',

        nmc_notes:
          item.nmc_notes || '',

        fmge_next_notes:
          item.fmge_next_notes ||
          '',

        academic_requirement:
          item.academic_requirement ||
          '',

        english_requirement:
          item.english_requirement ||
          '',

        ielts_requirement:
          item.ielts_requirement ||
          '',

        toefl_requirement:
          item.toefl_requirement ||
          '',

        gmat_gre_requirement:
          item.gmat_gre_requirement ||
          '',

        work_experience:
          item.work_experience ||
          '',

        specializationsText:
          Array.isArray(
            item.specializations
          )
            ? item.specializations.join(
                '\n'
              )
            : '',

        internship_opportunities:
          item.internship_opportunities ||
          '',

        placement_info:
          item.placement_info ||
          '',

        post_study_opportunities:
          item.post_study_opportunities ||
          '',

        overview:
          item.overview || '',

        accreditation:
          item.accreditation ||
          '',

        ranking:
          item.ranking || '',

        established_year:
          item.established_year ||
          '',

        campus:
          item.campus || '',

        hostel:
          item.hostel || '',

        indian_food:
          item.indian_food || '',

        student_life:
          item.student_life || '',

        climate:
          item.climate || '',

        airport_distance:
          item.airport_distance ||
          '',

        prosText:
          Array.isArray(item.pros)
            ? item.pros.join('\n')
            : '',

        consText:
          Array.isArray(item.cons)
            ? item.cons.join('\n')
            : '',

        documentsText:
          Array.isArray(
            item.documents_required
          )
            ? item.documents_required.join(
                '\n'
              )
            : '',

        admissionText:
          Array.isArray(
            item.admission_process
          )
            ? item.admission_process.join(
                '\n'
              )
            : '',

        faqsText:
          faqArrayToText(
            item.faqs
          ),

        website:
          item.website || '',

        apply_link:
          item.apply_link || '',

        featured:
          Boolean(
            item.featured
          ),

        popular:
          Boolean(
            item.popular
          ),

        budget_option:
          Boolean(
            item.budget_option
          ),

        recommended:
          Boolean(
            item.recommended
          ),

        seo_title:
          item.seo_title || '',

        meta_description:
          item.meta_description ||
          '',

        keywordsText:
          Array.isArray(
            item.keywords
          )
            ? item.keywords.join(
                ', '
              )
            : '',

        status:
          item.status || 'draft'
      });

      setUniversityEditorOpen(
        true
      );
    };


  const handleUniversityName =
    value => {

      setUniversityForm(
        old => ({
          ...old,

          name:
            value,

          slug:
            universitySlugTouched
              ? old.slug
              : slugify(value)
        })
      );
    };


  const saveUniversity =
    async status => {

      setUniversityError('');


      if (
        !universityForm.name.trim()
      ) {

        setUniversityError(
          'University name is required.'
        );

        return;
      }


      if (
        !universityForm.country.trim()
      ) {

        setUniversityError(
          'Country is required.'
        );

        return;
      }


      if (
        !universityForm.course.trim()
      ) {

        setUniversityError(
          'Course is required.'
        );

        return;
      }


      const payload = {

        stream:
          universityForm.stream,

        name:
          universityForm.name.trim(),

        slug:
          slugify(
            universityForm.slug ||
            universityForm.name
          ),

        country:
          universityForm.country.trim(),

        city:
          universityForm.city.trim() ||
          null,

        course:
          universityForm.course.trim(),

        course_level:
          universityForm.course_level.trim() ||
          null,

        duration:
          universityForm.duration.trim() ||
          null,

        medium:
          universityForm.medium.trim() ||
          null,

        intake:
          universityForm.intake.trim() ||
          null,

        application_deadline:
          universityForm.application_deadline.trim() ||
          null,

        currency:
          universityForm.currency ||
          'USD',

        tuition_fee_year:
          optionalNumber(
            universityForm.tuition_fee_year
          ),

        hostel_fee_year:
          optionalNumber(
            universityForm.hostel_fee_year
          ),

        food_fee_year:
          optionalNumber(
            universityForm.food_fee_year
          ),

        first_year_total:
          optionalNumber(
            universityForm.first_year_total
          ),

        total_course_cost:
          optionalNumber(
            universityForm.total_course_cost
          ),

        application_fee:
          optionalNumber(
            universityForm.application_fee
          ),

        scholarship_info:
          universityForm.scholarship_info.trim() ||
          null,

        eligibility:
          universityForm.eligibility.trim() ||
          null,

        // MBBS
        neet_requirement:
          universityForm.neet_requirement.trim() ||
          null,

        pcb_requirement:
          universityForm.pcb_requirement.trim() ||
          null,

        internship:
          universityForm.internship.trim() ||
          null,

        recognition:
          universityForm.recognition.trim() ||
          null,

        nmc_notes:
          universityForm.nmc_notes.trim() ||
          null,

        fmge_next_notes:
          universityForm.fmge_next_notes.trim() ||
          null,

        // Management
        academic_requirement:
          universityForm.academic_requirement.trim() ||
          null,

        english_requirement:
          universityForm.english_requirement.trim() ||
          null,

        ielts_requirement:
          universityForm.ielts_requirement.trim() ||
          null,

        toefl_requirement:
          universityForm.toefl_requirement.trim() ||
          null,

        gmat_gre_requirement:
          universityForm.gmat_gre_requirement.trim() ||
          null,

        work_experience:
          universityForm.work_experience.trim() ||
          null,

        specializations:
          linesToArray(
            universityForm.specializationsText
          ),

        internship_opportunities:
          universityForm.internship_opportunities.trim() ||
          null,

        placement_info:
          universityForm.placement_info.trim() ||
          null,

        post_study_opportunities:
          universityForm.post_study_opportunities.trim() ||
          null,

        // General
        overview:
          universityForm.overview.trim() ||
          null,

        accreditation:
          universityForm.accreditation.trim() ||
          null,

        ranking:
          universityForm.ranking.trim() ||
          null,

        established_year:
          universityForm.established_year.trim() ||
          null,

        campus:
          universityForm.campus.trim() ||
          null,

        hostel:
          universityForm.hostel.trim() ||
          null,

        indian_food:
          universityForm.indian_food.trim() ||
          null,

        student_life:
          universityForm.student_life.trim() ||
          null,

        climate:
          universityForm.climate.trim() ||
          null,

        airport_distance:
          universityForm.airport_distance.trim() ||
          null,

        pros:
          linesToArray(
            universityForm.prosText
          ),

        cons:
          linesToArray(
            universityForm.consText
          ),

        documents_required:
          linesToArray(
            universityForm.documentsText
          ),

        admission_process:
          linesToArray(
            universityForm.admissionText
          ),

        faqs:
          faqTextToArray(
            universityForm.faqsText
          ),

        website:
          universityForm.website.trim() ||
          null,

        apply_link:
          universityForm.apply_link.trim() ||
          null,

        featured:
          universityForm.featured,

        popular:
          universityForm.popular,

        budget_option:
          universityForm.budget_option,

        recommended:
          universityForm.recommended,

        seo_title:
          universityForm.seo_title.trim() ||
          universityForm.name.trim(),

        meta_description:
          universityForm.meta_description.trim() ||
          universityForm.overview.trim() ||
          null,

        keywords:
          universityForm.keywordsText
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),

        status
      };


      setSavingUniversity(
        true
      );


      try {

        if (
          editingUniversityId
        ) {

          await adminFetch(
            `/api/admin/universities/${editingUniversityId}`,
            {
              method: 'PUT',

              body:
                JSON.stringify(
                  payload
                )
            }
          );

        } else {

          await adminFetch(
            '/api/admin/universities',
            {
              method: 'POST',

              body:
                JSON.stringify(
                  payload
                )
            }
          );
        }


        await loadUniversities();

        setUniversityEditorOpen(
          false
        );

      } catch (e) {

        setUniversityError(
          e.message ||
          'Could not save university.'
        );

      } finally {

        setSavingUniversity(
          false
        );
      }
    };


  const toggleUniversityStatus =
    async item => {

      await adminFetch(
        `/api/admin/universities/${item.id}`,
        {
          method: 'PUT',

          body:
            JSON.stringify({
              status:
                item.status ===
                'published'
                  ? 'draft'
                  : 'published'
            })
        }
      );

      await loadUniversities();
    };


  const updateUniversityFlag =
    async (
      item,
      field
    ) => {

      await adminFetch(
        `/api/admin/universities/${item.id}`,
        {
          method: 'PUT',

          body:
            JSON.stringify({
              [field]:
                !item[field]
            })
        }
      );

      await loadUniversities();
    };


  const deleteUniversity =
    async item => {

      if (
        !window.confirm(
          `Delete "${item.name}" permanently?`
        )
      ) {
        return;
      }

      await adminFetch(
        `/api/admin/universities/${item.id}`,
        {
          method: 'DELETE'
        }
      );

      await loadUniversities();
    };


  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (checking) {

    return (
      <div className="min-h-screen bg-cream grid place-items-center">
        Loading…
      </div>
    );
  }


  if (!user) {
    return null;
  }


  return (

    <div className="min-h-screen bg-cream text-ink">


      {/* HEADER */}

      <header className="sticky top-0 z-40 bg-ink text-cream">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          <Link
            to="/"
            className="flex items-center gap-2"
          >

            <div className="h-8 w-8 rounded-full bg-cream text-ink grid place-items-center serif italic">
              r
            </div>

            <div>

              <div className="serif text-[15px]">
                Route Your Career
              </div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                Admin Console
              </div>

            </div>

          </Link>


          <div className="ml-auto flex items-center gap-3">

            <div className="hidden sm:block">

              <div className="text-[13px]">
                {user.name}
              </div>

              <div className="text-[10px] mono uppercase text-coral">
                Administrator
              </div>

            </div>


            <button
              onClick={
                signOut
              }
              className="rounded-full border border-cream/20 px-3 py-2 text-[12px] flex items-center gap-1"
            >

              <LogOut className="h-4 w-4" />

              Sign out

            </button>

          </div>

        </div>

      </header>


      {/* ADMIN NAV */}

      <div className="sticky top-[56px] z-30 bg-white border-b border-ink/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex gap-1 overflow-x-auto">

          {[
            [
              'dashboard',
              'Dashboard',
              LayoutDashboard
            ],
            [
              'leads',
              'Leads',
              Users
            ],
            [
              'newsletter',
              'Newsletter',
              Mail
            ],
            [
              'blogs',
              'Blogs',
              BookOpen
            ],
            [
              'universities',
              'Universities',
              GraduationCap
            ]

          ].map(
            ([key, label, Icon]) => (

              <button
                key={
                  key
                }
                onClick={() =>
                  setSection(
                    key
                  )
                }
                className={`rounded-full px-4 py-2 flex gap-2 items-center text-[12px] font-semibold ${
                  section === key
                    ? 'bg-ink text-cream'
                    : 'text-ink/60'
                }`}
              >

                <Icon className="h-4 w-4" />

                {label}

              </button>

            )
          )}

        </div>

      </div>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">


        {/* DASHBOARD */}

        {section === 'dashboard' && (

          <>

            <div className="flex justify-between items-end">

              <h1 className="serif text-5xl">
                Admin dashboard.
              </h1>


              <button
                onClick={() => {
                  loadLeads();
                  loadBlogs();
                  loadNewsletter();
                  loadUniversities();
                }}
                className="bg-ink text-cream rounded-full px-4 py-2 flex gap-2"
              >

                <RefreshCw className="h-4 w-4" />

                Refresh

              </button>

            </div>


            <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">

              {[
                [
                  'Total Leads',
                  stats?.total_leads ??
                  0
                ],
                [
                  'Last 7 Days',
                  stats?.last_7_days ??
                  0
                ],
                [
                  'Newsletter',
                  newsletter.length
                ],
                [
                  'Blogs',
                  publishedBlogCount
                ],
                [
                  'Universities',
                  publishedUniversityCount
                ]

              ].map(
                ([label, value]) => (

                  <div
                    key={
                      label
                    }
                    className="bg-white rounded-3xl border border-ink/10 p-5"
                  >

                    <div className="text-[10px] mono uppercase text-ink/50">
                      {label}
                    </div>

                    <div className="serif text-4xl mt-3">
                      {value}
                    </div>

                  </div>

                )
              )}

            </div>


            <div className="mt-5 grid lg:grid-cols-2 gap-5">

              <div className="bg-ink text-cream rounded-3xl p-6">

                <div className="text-coral text-[10px] uppercase">
                  RYC Journal
                </div>

                <h2 className="serif text-3xl mt-2">
                  Blog Manager
                </h2>

                <p className="mt-2 text-cream/60">
                  {publishedBlogCount} published · {draftBlogCount} drafts
                </p>

              </div>


              <div className="bg-white border border-ink/10 rounded-3xl p-6">

                <div className="text-coral text-[10px] uppercase">
                  University Database
                </div>

                <h2 className="serif text-3xl mt-2">
                  MBBS + Management
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="bg-cream rounded-xl p-4">

                    <Stethoscope className="h-4 w-4 text-coral" />

                    <div className="serif text-3xl mt-2">
                      {mbbsCount}
                    </div>

                    <div className="text-[11px]">
                      MBBS
                    </div>

                  </div>


                  <div className="bg-cream rounded-xl p-4">

                    <BriefcaseBusiness className="h-4 w-4 text-coral" />

                    <div className="serif text-3xl mt-2">
                      {managementCount}
                    </div>

                    <div className="text-[11px]">
                      Management
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </>

        )}


        {/* LEADS */}

        {section === 'leads' && (

          <>

            <h1 className="serif text-4xl">
              Student leads.
            </h1>


            <div className="mt-5 flex flex-wrap gap-2">

              {LEAD_TABS.map(
                tab => (

                  <button
                    key={
                      tab.k
                    }
                    onClick={() =>
                      setLeadTab(
                        tab.k
                      )
                    }
                    className={`rounded-full px-3 py-2 text-[12px] ${
                      leadTab ===
                      tab.k
                        ? 'bg-ink text-cream'
                        : 'bg-white'
                    }`}
                  >
                    {tab.l}
                  </button>

                )
              )}


              <input
                value={
                  q
                }
                onChange={
                  e =>
                    setQ(
                      e.target.value
                    )
                }
                placeholder="Search leads"
                className="ml-auto border rounded-full px-4"
              />


              <button
                onClick={
                  copyAll
                }
                className="bg-white border rounded-full px-4"
              >
                Copy CSV
              </button>

            </div>


            <div className="mt-5 bg-white rounded-3xl border border-ink/10 divide-y">

              {loadingLeads && (
                <div className="p-8">
                  Loading…
                </div>
              )}


              {filteredLeads.map(
                lead => (

                  <div
                    key={
                      lead.id
                    }
                    className="p-5 grid sm:grid-cols-4 gap-4"
                  >

                    <div>
                      <strong>
                        {lead.name}
                      </strong>
                    </div>

                    <div>
                      {lead.phone}
                      <br />
                      {lead.email}
                    </div>

                    <div>
                      {lead.country}
                      <br />
                      NEET: {lead.neet_score}
                    </div>

                    <div>
                      {fmt(
                        lead.created_at
                      )}
                    </div>

                  </div>

                )
              )}

            </div>

          </>

        )}


        {/* NEWSLETTER */}

        {section === 'newsletter' && (

          <>

            <div className="flex justify-between">

              <h1 className="serif text-4xl">
                Newsletter subscribers.
              </h1>

              <button
                onClick={
                  copyNewsletter
                }
                className="bg-ink text-cream rounded-full px-4"
              >
                Copy Emails
              </button>

            </div>


            <div className="mt-6 bg-white rounded-3xl border divide-y">

              {loadingNewsletter && (
                <div className="p-8">
                  Loading…
                </div>
              )}


              {newsletter.map(
                item => (

                  <div
                    key={
                      item.id ||
                      item.email
                    }
                    className="p-4 flex justify-between"
                  >
                    {item.email}

                    <span>
                      {fmt(
                        item.created_at
                      )}
                    </span>
                  </div>

                )
              )}

            </div>

          </>

        )}


        {/* BLOGS */}

        {section === 'blogs' && (

          <>

            <div className="flex justify-between items-end">

              <h1 className="serif text-4xl">
                Blog manager.
              </h1>

              <button
                onClick={
                  openNewBlog
                }
                className="bg-coral text-white rounded-full px-5 py-3"
              >
                + New Blog
              </button>

            </div>


            <div className="mt-6 bg-white rounded-3xl border divide-y">

              {loadingBlogs && (
                <div className="p-8">
                  Loading…
                </div>
              )}


              {blogs.map(
                blog => (

                  <div
                    key={
                      blog.id
                    }
                    className="p-5 flex gap-4 items-center"
                  >

                    <img
                      src="/blog-default.png"
                      alt=""
                      className="w-24 h-16 rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <div className="text-[10px] text-coral uppercase">
                        {blog.status} · {blog.category}
                      </div>

                      <div className="serif text-xl">
                        {blog.title}
                      </div>

                    </div>


                    {blog.status ===
                      'published' && (

                      <Link
                        to={`/blog/${blog.slug}`}
                        target="_blank"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                    )}


                    <button
                      onClick={() =>
                        openEditBlog(
                          blog
                        )
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </button>


                    <button
                      onClick={() =>
                        toggleBlogStatus(
                          blog
                        )
                      }
                    >
                      {blog.status ===
                      'published'
                        ? 'Unpublish'
                        : 'Publish'}
                    </button>


                    <button
                      onClick={() =>
                        deleteBlog(
                          blog
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>

                  </div>

                )
              )}

            </div>

          </>

        )}


        {/* UNIVERSITIES */}

        {section === 'universities' && (

          <>

            <div className="flex flex-wrap justify-between gap-4 items-end">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  RYC Institutions
                </div>

                <h1 className="serif text-5xl">
                  University manager.
                </h1>

              </div>


              <button
                onClick={
                  openNewUniversity
                }
                className="bg-coral text-white rounded-full px-5 py-3 flex items-center gap-2 font-bold"
              >

                <Plus className="h-4 w-4" />

                Add University

              </button>

            </div>


            {/* STREAM FILTER */}

            <div className="mt-6">

              <div className="text-[10px] mono uppercase text-ink/40 mb-2">
                Stream
              </div>

              <div className="inline-flex bg-white border rounded-full p-1">

                {[
                  'All',
                  'MBBS',
                  'Management'
                ].map(
                  stream => (

                    <button
                      key={
                        stream
                      }
                      onClick={() => {

                        setUniversityStreamFilter(
                          stream
                        );

                        setUniversityCountryFilter(
                          'All'
                        );
                      }}
                      className={`rounded-full px-4 py-2 text-[12px] font-semibold ${
                        universityStreamFilter ===
                        stream
                          ? 'bg-ink text-cream'
                          : ''
                      }`}
                    >
                      {stream}
                    </button>

                  )
                )}

              </div>

            </div>


            {/* COUNTRY + SEARCH */}

            <div className="mt-4 flex flex-wrap gap-2">

              {universityCountries.map(
                country => (

                  <button
                    key={
                      country
                    }
                    onClick={() =>
                      setUniversityCountryFilter(
                        country
                      )
                    }
                    className={`rounded-full px-3 py-2 text-[11px] ${
                      universityCountryFilter ===
                      country
                        ? 'bg-coral text-white'
                        : 'bg-white border'
                    }`}
                  >
                    {country}
                  </button>

                )
              )}


              <div className="ml-auto flex bg-white border rounded-full px-3 items-center">

                <Search className="h-4 w-4" />

                <input
                  value={
                    universitySearch
                  }
                  onChange={
                    e =>
                      setUniversitySearch(
                        e.target.value
                      )
                  }
                  placeholder="Search university..."
                  className="outline-none p-2 bg-transparent"
                />

              </div>

            </div>


            {/* COUNTS */}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">

              {[
                [
                  'Total',
                  universities.length
                ],
                [
                  'MBBS',
                  mbbsCount
                ],
                [
                  'Management',
                  managementCount
                ],
                [
                  'Published',
                  publishedUniversityCount
                ]

              ].map(
                ([label, value]) => (

                  <div
                    key={
                      label
                    }
                    className="bg-white border rounded-3xl p-5"
                  >

                    <div className="text-[10px] uppercase text-ink/40">
                      {label}
                    </div>

                    <div className="serif text-4xl mt-2">
                      {value}
                    </div>

                  </div>

                )
              )}

            </div>


            {universityError && (

              <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                {universityError}
              </div>

            )}


            <div className="mt-6 bg-white border rounded-3xl divide-y">

              {loadingUniversities && (

                <div className="p-10 text-center">
                  Loading universities…
                </div>

              )}


              {!loadingUniversities &&
                filteredUniversities.length ===
                  0 && (

                  <div className="p-14 text-center">

                    <GraduationCap className="mx-auto h-10 w-10 text-coral" />

                    <div className="serif text-2xl mt-3">
                      No universities found.
                    </div>

                  </div>

                )}


              {filteredUniversities.map(
                item => (

                  <div
                    key={
                      item.id
                    }
                    className="p-5 flex flex-col md:flex-row md:items-center gap-4"
                  >

                    <div className={`h-14 w-14 rounded-2xl grid place-items-center ${
                      item.stream ===
                      'MBBS'
                        ? 'bg-coral/10 text-coral'
                        : 'bg-ink/10 text-ink'
                    }`}>

                      {item.stream ===
                      'MBBS'
                        ? (
                          <Stethoscope className="h-6 w-6" />
                        )
                        : (
                          <BriefcaseBusiness className="h-6 w-6" />
                        )}

                    </div>


                    <div className="flex-1">

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-ink text-cream px-2 py-1 text-[9px] uppercase">
                          {item.stream}
                        </span>

                        <span className={`rounded-full px-2 py-1 text-[9px] uppercase ${
                          item.status ===
                          'published'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>

                        {item.featured && (
                          <span className="text-[9px] text-coral">
                            Featured
                          </span>
                        )}

                        {item.recommended && (
                          <span className="text-[9px] text-coral">
                            Recommended
                          </span>
                        )}

                      </div>


                      <div className="serif text-xl mt-2">
                        {item.name}
                      </div>


                      <div className="text-[12px] text-ink/50 flex flex-wrap gap-3">

                        <span>
                          {item.course}
                        </span>

                        <span>
                          {item.country}
                        </span>

                        {item.city && (
                          <span>
                            {item.city}
                          </span>
                        )}

                        {item.tuition_fee_year != null && (
                          <span>
                            {item.currency} {item.tuition_fee_year}/yr
                          </span>
                        )}

                      </div>

                    </div>


                    <div className="flex flex-wrap gap-2">

                      <button
                        title="Featured"
                        onClick={() =>
                          updateUniversityFlag(
                            item,
                            'featured'
                          )
                        }
                        className={`h-9 w-9 rounded-full border grid place-items-center ${
                          item.featured
                            ? 'bg-coral text-white'
                            : ''
                        }`}
                      >
                        <Star className="h-4 w-4" />
                      </button>


                      <button
                        title="Edit"
                        onClick={() =>
                          openEditUniversity(
                            item
                          )
                        }
                        className="h-9 w-9 rounded-full border grid place-items-center"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>


                      <button
                        onClick={() =>
                          toggleUniversityStatus(
                            item
                          )
                        }
                        className="border rounded-full px-3 py-2 text-[11px]"
                      >
                        {item.status ===
                        'published'
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>


                      <button
                        onClick={() =>
                          deleteUniversity(
                            item
                          )
                        }
                        className="h-9 w-9 rounded-full border border-red-200 grid place-items-center text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </>

        )}

      </main>


      {/* BLOG EDITOR */}

      {blogEditorOpen && (

        <div className="fixed inset-0 z-[100] bg-black/60 overflow-y-auto">

          <div className="max-w-5xl mx-auto my-6 bg-cream rounded-3xl overflow-hidden">

            <div className="bg-ink text-cream p-5 flex">

              <div className="serif text-xl">
                {editingBlogId
                  ? 'Edit Blog'
                  : 'New Blog'}
              </div>

              <button
                className="ml-auto"
                onClick={() =>
                  setBlogEditorOpen(
                    false
                  )
                }
              >
                <X />
              </button>

            </div>


            <div className="p-6 space-y-4">

              {blogError && (
                <div className="bg-red-50 text-red-700 p-3">
                  {blogError}
                </div>
              )}


              <input
                value={
                  blogForm.title
                }
                onChange={
                  e =>
                    handleTitleChange(
                      e.target.value
                    )
                }
                placeholder="Blog title"
                className="w-full border rounded-xl p-3"
              />


              <input
                value={
                  blogForm.slug
                }
                onChange={
                  e => {
                    setSlugTouched(
                      true
                    );

                    changeBlogField(
                      'slug',
                      slugify(
                        e.target.value
                      )
                    );
                  }
                }
                placeholder="Slug"
                className="w-full border rounded-xl p-3"
              />


              <div className="grid sm:grid-cols-2 gap-3">

                <input
                  value={
                    blogForm.category
                  }
                  onChange={
                    e =>
                      changeBlogField(
                        'category',
                        e.target.value
                      )
                  }
                  placeholder="Category"
                  className="border rounded-xl p-3"
                />

                <input
                  value={
                    blogForm.author
                  }
                  onChange={
                    e =>
                      changeBlogField(
                        'author',
                        e.target.value
                      )
                  }
                  placeholder="Author"
                  className="border rounded-xl p-3"
                />

              </div>


              <textarea
                value={
                  blogForm.excerpt
                }
                onChange={
                  e =>
                    changeBlogField(
                      'excerpt',
                      e.target.value
                    )
                }
                placeholder="Excerpt"
                className="w-full border rounded-xl p-3"
              />


              <div className="flex gap-2">

                <button
                  onClick={() =>
                    addBodyBlock(
                      'heading'
                    )
                  }
                  className="border rounded-full px-3 py-2"
                >
                  Heading
                </button>

                <button
                  onClick={() =>
                    addBodyBlock(
                      'paragraph'
                    )
                  }
                  className="border rounded-full px-3 py-2"
                >
                  Paragraph
                </button>

                <button
                  onClick={() =>
                    addBodyBlock(
                      'list'
                    )
                  }
                  className="border rounded-full px-3 py-2"
                >
                  List
                </button>

              </div>


              {blogForm.body.map(
                (block, index) => (

                  <div
                    key={
                      index
                    }
                    className="bg-white p-4 rounded-xl border"
                  >

                    {block.type ===
                      'heading' && (

                      <input
                        value={
                          block.text ||
                          ''
                        }
                        onChange={
                          e =>
                            updateBodyBlock(
                              index,
                              {
                                text:
                                  e.target.value
                              }
                            )
                        }
                        className="w-full border rounded-xl p-3"
                      />

                    )}


                    {block.type ===
                      'paragraph' && (

                      <textarea
                        rows="5"
                        value={
                          block.text ||
                          ''
                        }
                        onChange={
                          e =>
                            updateBodyBlock(
                              index,
                              {
                                text:
                                  e.target.value
                              }
                            )
                        }
                        className="w-full border rounded-xl p-3"
                      />

                    )}


                    {block.type ===
                      'list' && (

                      <textarea
                        rows="5"
                        value={
                          (
                            block.items ||
                            []
                          ).join('\n')
                        }
                        onChange={
                          e =>
                            updateBodyBlock(
                              index,
                              {
                                items:
                                  e.target.value.split(
                                    '\n'
                                  )
                              }
                            )
                        }
                        className="w-full border rounded-xl p-3"
                      />

                    )}


                    <button
                      onClick={() =>
                        removeBodyBlock(
                          index
                        )
                      }
                      className="mt-2 text-red-600"
                    >
                      Delete block
                    </button>

                  </div>

                )
              )}


              <input
                value={
                  blogForm.seo_title
                }
                onChange={
                  e =>
                    changeBlogField(
                      'seo_title',
                      e.target.value
                    )
                }
                placeholder="SEO title"
                className="w-full border rounded-xl p-3"
              />


              <textarea
                value={
                  blogForm.meta_description
                }
                onChange={
                  e =>
                    changeBlogField(
                      'meta_description',
                      e.target.value
                    )
                }
                placeholder="Meta description"
                className="w-full border rounded-xl p-3"
              />


              <input
                value={
                  blogForm.keywordsText
                }
                onChange={
                  e =>
                    changeBlogField(
                      'keywordsText',
                      e.target.value
                    )
                }
                placeholder="Keywords"
                className="w-full border rounded-xl p-3"
              />


              <div className="flex gap-3">

                <button
                  disabled={
                    savingBlog
                  }
                  onClick={() =>
                    saveBlog(
                      'draft'
                    )
                  }
                  className="border rounded-full px-5 py-3"
                >
                  Save Draft
                </button>

                <button
                  disabled={
                    savingBlog
                  }
                  onClick={() =>
                    saveBlog(
                      'published'
                    )
                  }
                  className="bg-coral text-white rounded-full px-5 py-3"
                >
                  Publish
                </button>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* UNIVERSITY EDITOR */}

      {universityEditorOpen && (

        <div className="fixed inset-0 z-[120] bg-black/60 overflow-y-auto">

          <div className="max-w-6xl mx-auto my-6 bg-cream rounded-3xl overflow-hidden shadow-2xl">


            {/* HEADER */}

            <div className="sticky top-0 z-30 bg-ink text-cream px-6 py-4 flex">

              <div>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  University Manager
                </div>

                <div className="serif text-2xl">
                  {editingUniversityId
                    ? 'Edit University'
                    : 'Add University'}
                </div>

              </div>


              <button
                onClick={() =>
                  setUniversityEditorOpen(
                    false
                  )
                }
                className="ml-auto"
              >
                <X />
              </button>

            </div>


            <div className="p-6 sm:p-8 space-y-9">

              {universityError && (

                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
                  {universityError}
                </div>

              )}


              {/* STREAM */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  01 — Select Stream
                </div>


                <div className="mt-4 grid sm:grid-cols-2 gap-4">

                  <button
                    type="button"
                    onClick={() =>
                      changeUniversityStream(
                        'MBBS'
                      )
                    }
                    className={`rounded-2xl border p-5 text-left ${
                      universityForm.stream ===
                      'MBBS'
                        ? 'bg-ink text-cream border-ink'
                        : 'bg-white'
                    }`}
                  >

                    <Stethoscope className="h-6 w-6" />

                    <div className="serif text-2xl mt-3">
                      MBBS
                    </div>

                    <div className="text-[12px] opacity-60">
                      Medical universities & MBBS programs
                    </div>

                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      changeUniversityStream(
                        'Management'
                      )
                    }
                    className={`rounded-2xl border p-5 text-left ${
                      universityForm.stream ===
                      'Management'
                        ? 'bg-ink text-cream border-ink'
                        : 'bg-white'
                    }`}
                  >

                    <BriefcaseBusiness className="h-6 w-6" />

                    <div className="serif text-2xl mt-3">
                      Management
                    </div>

                    <div className="text-[12px] opacity-60">
                      MBA, BBA, MSc Management & business programs
                    </div>

                  </button>

                </div>

              </section>


              {/* BASIC */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  02 — University
                </div>


                <div className="mt-4 grid sm:grid-cols-2 gap-4">

                  <input
                    value={
                      universityForm.name
                    }
                    onChange={
                      e =>
                        handleUniversityName(
                          e.target.value
                        )
                    }
                    placeholder="University Name *"
                    className="sm:col-span-2 border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.slug
                    }
                    onChange={
                      e => {

                        setUniversitySlugTouched(
                          true
                        );

                        changeUniversityField(
                          'slug',
                          slugify(
                            e.target.value
                          )
                        );
                      }
                    }
                    placeholder="URL Slug"
                    className="sm:col-span-2 border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.country
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'country',
                          e.target.value
                        )
                    }
                    placeholder="Country *"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.city
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'city',
                          e.target.value
                        )
                    }
                    placeholder="City"
                    className="border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* COURSE */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  03 — Course
                </div>


                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <input
                    value={
                      universityForm.course
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'course',
                          e.target.value
                        )
                    }
                    placeholder={
                      universityForm.stream ===
                      'MBBS'
                        ? 'MBBS / MD'
                        : 'MBA / BBA / MSc Management'
                    }
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.course_level
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'course_level',
                          e.target.value
                        )
                    }
                    placeholder="UG / PG / Masters"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.duration
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'duration',
                          e.target.value
                        )
                    }
                    placeholder="Duration"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.medium
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'medium',
                          e.target.value
                        )
                    }
                    placeholder="Medium"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.intake
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'intake',
                          e.target.value
                        )
                    }
                    placeholder="Intake"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.application_deadline
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'application_deadline',
                          e.target.value
                        )
                    }
                    placeholder="Application deadline"
                    className="border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* FEES */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  04 — Fees & Scholarship
                </div>


                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  <select
                    value={
                      universityForm.currency
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'currency',
                          e.target.value
                        )
                    }
                    className="border rounded-xl p-3 bg-white"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>INR</option>
                    <option>GBP</option>
                    <option>AUD</option>
                    <option>GEL</option>
                  </select>


                  {[
                    [
                      'tuition_fee_year',
                      'Tuition Fee / Year'
                    ],
                    [
                      'hostel_fee_year',
                      'Hostel / Year'
                    ],
                    [
                      'food_fee_year',
                      'Food / Year'
                    ],
                    [
                      'first_year_total',
                      'First Year Total'
                    ],
                    [
                      'total_course_cost',
                      'Total Course Cost'
                    ],
                    [
                      'application_fee',
                      'Application Fee'
                    ]

                  ].map(
                    ([field, label]) => (

                      <input
                        key={
                          field
                        }
                        type="number"
                        value={
                          universityForm[field]
                        }
                        onChange={
                          e =>
                            changeUniversityField(
                              field,
                              e.target.value
                            )
                        }
                        placeholder={
                          label
                        }
                        className="border rounded-xl p-3 bg-white"
                      />

                    )
                  )}

                </div>


                <textarea
                  rows="3"
                  value={
                    universityForm.scholarship_info
                  }
                  onChange={
                    e =>
                      changeUniversityField(
                        'scholarship_info',
                        e.target.value
                      )
                  }
                  placeholder="Scholarship information"
                  className="mt-4 w-full border rounded-xl p-3 bg-white"
                />

              </section>


              {/* GENERAL ELIGIBILITY */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  05 — Eligibility
                </div>

                <textarea
                  rows="4"
                  value={
                    universityForm.eligibility
                  }
                  onChange={
                    e =>
                      changeUniversityField(
                        'eligibility',
                        e.target.value
                      )
                  }
                  placeholder="General eligibility"
                  className="mt-4 w-full border rounded-xl p-3 bg-white"
                />

              </section>


              {/* MBBS ONLY */}

              {universityForm.stream ===
                'MBBS' && (

                <section className="rounded-3xl border border-coral/20 bg-coral/5 p-5">

                  <div className="flex items-center gap-2">

                    <Stethoscope className="h-5 w-5 text-coral" />

                    <div className="text-[10px] uppercase tracking-widest text-coral">
                      06 — MBBS Specific
                    </div>

                  </div>


                  <div className="mt-4 space-y-4">

                    <input
                      value={
                        universityForm.neet_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'neet_requirement',
                            e.target.value
                          )
                      }
                      placeholder="NEET requirement"
                      className="w-full border rounded-xl p-3 bg-white"
                    />


                    <input
                      value={
                        universityForm.pcb_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'pcb_requirement',
                            e.target.value
                          )
                      }
                      placeholder="PCB / Class 12 requirement"
                      className="w-full border rounded-xl p-3 bg-white"
                    />


                    {[
                      [
                        'recognition',
                        'Recognition / Medical accreditation'
                      ],
                      [
                        'nmc_notes',
                        'NMC-related notes'
                      ],
                      [
                        'fmge_next_notes',
                        'FMGE / NExT preparation information'
                      ],
                      [
                        'internship',
                        'Internship information'
                      ]

                    ].map(
                      ([field, label]) => (

                        <textarea
                          key={
                            field
                          }
                          rows="3"
                          value={
                            universityForm[field]
                          }
                          onChange={
                            e =>
                              changeUniversityField(
                                field,
                                e.target.value
                              )
                          }
                          placeholder={
                            label
                          }
                          className="w-full border rounded-xl p-3 bg-white"
                        />

                      )
                    )}

                  </div>

                </section>

              )}


              {/* MANAGEMENT ONLY */}

              {universityForm.stream ===
                'Management' && (

                <section className="rounded-3xl border border-ink/10 bg-white p-5">

                  <div className="flex items-center gap-2">

                    <BriefcaseBusiness className="h-5 w-5 text-coral" />

                    <div className="text-[10px] uppercase tracking-widest text-coral">
                      06 — Management Specific
                    </div>

                  </div>


                  <div className="mt-4 grid sm:grid-cols-2 gap-4">

                    <input
                      value={
                        universityForm.academic_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'academic_requirement',
                            e.target.value
                          )
                      }
                      placeholder="Academic requirement"
                      className="border rounded-xl p-3"
                    />


                    <input
                      value={
                        universityForm.work_experience
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'work_experience',
                            e.target.value
                          )
                      }
                      placeholder="Work experience requirement"
                      className="border rounded-xl p-3"
                    />


                    <input
                      value={
                        universityForm.english_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'english_requirement',
                            e.target.value
                          )
                      }
                      placeholder="English requirement"
                      className="border rounded-xl p-3"
                    />


                    <input
                      value={
                        universityForm.ielts_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'ielts_requirement',
                            e.target.value
                          )
                      }
                      placeholder="IELTS requirement"
                      className="border rounded-xl p-3"
                    />


                    <input
                      value={
                        universityForm.toefl_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'toefl_requirement',
                            e.target.value
                          )
                      }
                      placeholder="TOEFL requirement"
                      className="border rounded-xl p-3"
                    />


                    <input
                      value={
                        universityForm.gmat_gre_requirement
                      }
                      onChange={
                        e =>
                          changeUniversityField(
                            'gmat_gre_requirement',
                            e.target.value
                          )
                      }
                      placeholder="GMAT / GRE requirement"
                      className="border rounded-xl p-3"
                    />

                  </div>


                  <textarea
                    rows="6"
                    value={
                      universityForm.specializationsText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'specializationsText',
                          e.target.value
                        )
                    }
                    placeholder={
                      'Specializations — one per line\nFinance\nMarketing\nBusiness Analytics\nInternational Business'
                    }
                    className="mt-4 w-full border rounded-xl p-3"
                  />


                  {[
                    [
                      'internship_opportunities',
                      'Internship opportunities'
                    ],
                    [
                      'placement_info',
                      'Placement / career information'
                    ],
                    [
                      'post_study_opportunities',
                      'Post-study opportunities'
                    ]

                  ].map(
                    ([field, label]) => (

                      <textarea
                        key={
                          field
                        }
                        rows="3"
                        value={
                          universityForm[field]
                        }
                        onChange={
                          e =>
                            changeUniversityField(
                              field,
                              e.target.value
                            )
                        }
                        placeholder={
                          label
                        }
                        className="mt-4 w-full border rounded-xl p-3"
                      />

                    )
                  )}

                </section>

              )}


              {/* UNIVERSITY INFORMATION */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  07 — University Information
                </div>


                <div className="mt-4 space-y-4">

                  {[
                    [
                      'overview',
                      'University overview'
                    ],
                    [
                      'accreditation',
                      'Accreditation'
                    ],
                    [
                      'ranking',
                      'Ranking / reputation'
                    ],
                    [
                      'campus',
                      'Campus & facilities'
                    ]

                  ].map(
                    ([field, label]) => (

                      <textarea
                        key={
                          field
                        }
                        rows="4"
                        value={
                          universityForm[field]
                        }
                        onChange={
                          e =>
                            changeUniversityField(
                              field,
                              e.target.value
                            )
                        }
                        placeholder={
                          label
                        }
                        className="w-full border rounded-xl p-3 bg-white"
                      />

                    )
                  )}


                  <input
                    value={
                      universityForm.established_year
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'established_year',
                          e.target.value
                        )
                    }
                    placeholder="Established year"
                    className="w-full border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* STUDENT LIFE */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  08 — Student Life
                </div>


                <div className="mt-4 space-y-4">

                  {[
                    [
                      'hostel',
                      'Hostel details'
                    ],
                    [
                      'indian_food',
                      'Indian food availability'
                    ],
                    [
                      'student_life',
                      'Student life'
                    ],
                    [
                      'climate',
                      'Climate'
                    ],
                    [
                      'airport_distance',
                      'Airport / travel information'
                    ]

                  ].map(
                    ([field, label]) => (

                      <textarea
                        key={
                          field
                        }
                        rows="3"
                        value={
                          universityForm[field]
                        }
                        onChange={
                          e =>
                            changeUniversityField(
                              field,
                              e.target.value
                            )
                        }
                        placeholder={
                          label
                        }
                        className="w-full border rounded-xl p-3 bg-white"
                      />

                    )
                  )}

                </div>

              </section>


              {/* LISTS */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  09 — Pros, Cons & Admission
                </div>


                <p className="text-[11px] text-ink/50 mt-1">
                  Enter one item per line.
                </p>


                <div className="mt-4 grid lg:grid-cols-2 gap-4">

                  <textarea
                    rows="6"
                    value={
                      universityForm.prosText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'prosText',
                          e.target.value
                        )
                    }
                    placeholder="Pros"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <textarea
                    rows="6"
                    value={
                      universityForm.consText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'consText',
                          e.target.value
                        )
                    }
                    placeholder="Cons"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <textarea
                    rows="7"
                    value={
                      universityForm.documentsText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'documentsText',
                          e.target.value
                        )
                    }
                    placeholder="Documents required — one per line"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <textarea
                    rows="7"
                    value={
                      universityForm.admissionText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'admissionText',
                          e.target.value
                        )
                    }
                    placeholder="Admission steps — one per line"
                    className="border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* FAQ */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  10 — FAQs
                </div>


                <p className="text-[11px] text-ink/50 mt-1">
                  Use: Question | Answer
                </p>


                <textarea
                  rows="8"
                  value={
                    universityForm.faqsText
                  }
                  onChange={
                    e =>
                      changeUniversityField(
                        'faqsText',
                        e.target.value
                      )
                  }
                  placeholder={
                    'Is IELTS required? | It depends on the university.\nIs hostel available? | Yes.'
                  }
                  className="mt-3 w-full border rounded-xl p-3 bg-white"
                />

              </section>


              {/* LINKS */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  11 — Links
                </div>


                <div className="mt-4 grid sm:grid-cols-2 gap-4">

                  <input
                    value={
                      universityForm.website
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'website',
                          e.target.value
                        )
                    }
                    placeholder="Official website"
                    className="border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.apply_link
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'apply_link',
                          e.target.value
                        )
                    }
                    placeholder="Application / consultation URL"
                    className="border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* DISPLAY FLAGS */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  12 — Website Display
                </div>


                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">

                  {[
                    [
                      'featured',
                      'Featured',
                      Star
                    ],
                    [
                      'popular',
                      'Popular',
                      Sparkles
                    ],
                    [
                      'recommended',
                      'Recommended',
                      BadgeCheck
                    ],
                    [
                      'budget_option',
                      'Budget Option',
                      WalletCards
                    ]

                  ].map(
                    ([field, label, Icon]) => (

                      <label
                        key={
                          field
                        }
                        className={`rounded-2xl border p-4 cursor-pointer ${
                          universityForm[field]
                            ? 'bg-ink text-cream'
                            : 'bg-white'
                        }`}
                      >

                        <input
                          type="checkbox"
                          checked={
                            universityForm[field]
                          }
                          onChange={
                            e =>
                              changeUniversityField(
                                field,
                                e.target.checked
                              )
                          }
                          className="hidden"
                        />

                        <Icon className="h-5 w-5" />

                        <div className="font-semibold mt-2">
                          {label}
                        </div>

                      </label>

                    )
                  )}

                </div>

              </section>


              {/* SEO */}

              <section>

                <div className="text-[10px] uppercase tracking-widest text-coral">
                  13 — Google SEO
                </div>


                <div className="mt-4 space-y-4">

                  <input
                    value={
                      universityForm.seo_title
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'seo_title',
                          e.target.value
                        )
                    }
                    placeholder="SEO title"
                    className="w-full border rounded-xl p-3 bg-white"
                  />


                  <textarea
                    rows="3"
                    value={
                      universityForm.meta_description
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'meta_description',
                          e.target.value
                        )
                    }
                    placeholder="Google meta description"
                    className="w-full border rounded-xl p-3 bg-white"
                  />


                  <input
                    value={
                      universityForm.keywordsText
                    }
                    onChange={
                      e =>
                        changeUniversityField(
                          'keywordsText',
                          e.target.value
                        )
                    }
                    placeholder="Keywords separated by commas"
                    className="w-full border rounded-xl p-3 bg-white"
                  />

                </div>

              </section>


              {/* SAVE */}

              <div className="border-t pt-6 flex flex-wrap gap-3">

                <button
                  disabled={
                    savingUniversity
                  }
                  onClick={() =>
                    saveUniversity(
                      'draft'
                    )
                  }
                  className="border bg-white rounded-full px-5 py-3 flex items-center gap-2"
                >

                  <Save className="h-4 w-4" />

                  Save Draft

                </button>


                <button
                  disabled={
                    savingUniversity
                  }
                  onClick={() =>
                    saveUniversity(
                      'published'
                    )
                  }
                  className="bg-coral text-white rounded-full px-6 py-3 flex items-center gap-2 font-bold"
                >

                  <Globe2 className="h-4 w-4" />

                  Publish University

                </button>


                <button
                  onClick={() =>
                    setUniversityEditorOpen(
                      false
                    )
                  }
                  className="ml-auto px-5 py-3"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
