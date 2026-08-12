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
  MapPin
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
  name: '',
  slug: '',
  country: 'Georgia',
  city: '',

  course: 'MBBS',
  duration: '',
  medium: 'English',
  intake: '',

  currency: 'USD',

  tuition_fee_year: '',
  hostel_fee_year: '',
  food_fee_year: '',
  first_year_total: '',
  total_course_cost: '',

  neet_requirement: '',
  eligibility: '',

  overview: '',
  recognition: '',
  internship: '',
  hostel: '',
  indian_food: '',
  student_life: '',

  prosText: '',
  consText: '',
  documentsText: '',
  admissionText: '',
  faqsText: '',

  website: '',
  apply_link: '',

  featured: false,

  seo_title: '',
  meta_description: '',
  keywordsText: '',

  status: 'draft'
};


function fmt(dt) {
  if (!dt) return '—';

  try {
    const d = new Date(dt);

    return d.toLocaleString('en-IN', {
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
    .map((item) => item.trim())
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

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
}


function faqTextToArray(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separator =
        line.indexOf('|');

      if (separator === -1) {
        return {
          question: line,
          answer: ''
        };
      }

      return {
        question:
          line
            .slice(0, separator)
            .trim(),

        answer:
          line
            .slice(separator + 1)
            .trim()
      };
    })
    .filter((item) => item.question);
}


function faqArrayToText(faqs) {
  if (!Array.isArray(faqs)) {
    return '';
  }

  return faqs
    .map(
      (faq) =>
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
      const data =
        await response.json();

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

  if (
    response.status === 204
  ) {
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

  if (type === 'paragraph') {
    return {
      type: 'paragraph',
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
    useState(
      'dashboard'
    );


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
  ] = useState(
    EMPTY_UNIVERSITY
  );

  const [
    universityError,
    setUniversityError
  ] = useState('');

  const [
    savingUniversity,
    setSavingUniversity
  ] = useState(false);

  const [
    universitySlugTouched,
    setUniversitySlugTouched
  ] = useState(false);

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
          const [
            ls,
            st
          ] =
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
          if (
            e?.response?.status === 401 ||
            e?.response?.status === 403
          ) {
            nav(
              '/admin/login',
              {
                replace: true
              }
            );
          }

        } finally {
          setLoadingLeads(
            false
          );
        }
      },
      [
        leadTab,
        user,
        nav
      ]
    );


  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  // =====================================================
  // LOAD NEWSLETTER
  // =====================================================

  const loadNewsletter =
    useCallback(
      async () => {
        if (!user) return;

        setLoadingNewsletter(
          true
        );

        try {
          const data =
            await adminNewsletter();

          setNewsletter(
            Array.isArray(data)
              ? data
              : []
          );

        } catch (e) {
          if (
            e?.response?.status === 401 ||
            e?.response?.status === 403
          ) {
            nav(
              '/admin/login',
              {
                replace: true
              }
            );
          }

        } finally {
          setLoadingNewsletter(
            false
          );
        }
      },
      [
        user,
        nav
      ]
    );


  // =====================================================
  // LOAD BLOGS
  // =====================================================

  const loadBlogs =
    useCallback(
      async () => {
        if (!user) return;

        setLoadingBlogs(true);
        setBlogError('');

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
          console.error(
            'Admin blogs error:',
            e
          );

          setBlogError(
            e.message ||
            'Could not load blogs.'
          );

          if (
            e.status === 401 ||
            e.status === 403
          ) {
            nav(
              '/admin/login',
              {
                replace: true
              }
            );
          }

        } finally {
          setLoadingBlogs(
            false
          );
        }
      },
      [
        user,
        nav
      ]
    );


  // =====================================================
  // LOAD UNIVERSITIES
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
          console.error(
            'University load error:',
            e
          );

          setUniversityError(
            e.message ||
            'Could not load universities.'
          );

          if (
            e.status === 401 ||
            e.status === 403
          ) {
            nav(
              '/admin/login',
              {
                replace: true
              }
            );
          }

        } finally {
          setLoadingUniversities(
            false
          );
        }
      },
      [
        user,
        nav
      ]
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
  // LEAD SEARCH
  // =====================================================

  const filteredLeads =
    useMemo(() => {
      if (!q.trim()) {
        return leads;
      }

      const s =
        q.toLowerCase();

      return leads.filter(
        (lead) =>
          [
            lead.name,
            lead.phone,
            lead.email,
            lead.country,
            lead.neet_score,
            lead.source,
            lead.message
          ].some(
            (value) =>
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
  // BLOG COUNTS
  // =====================================================

  const publishedBlogCount =
    blogs.filter(
      (blog) =>
        blog.status ===
        'published'
    ).length;

  const draftBlogCount =
    blogs.filter(
      (blog) =>
        blog.status ===
        'draft'
    ).length;


  // =====================================================
  // UNIVERSITY COUNTS
  // =====================================================

  const publishedUniversityCount =
    universities.filter(
      (item) =>
        item.status ===
        'published'
    ).length;

  const draftUniversityCount =
    universities.filter(
      (item) =>
        item.status ===
        'draft'
    ).length;

  const featuredUniversityCount =
    universities.filter(
      (item) =>
        item.featured
    ).length;


  // =====================================================
  // UNIVERSITY COUNTRIES
  // =====================================================

  const universityCountries =
    useMemo(() => {
      const countries = [
        ...new Set(
          universities
            .map(
              (item) =>
                item.country
            )
            .filter(Boolean)
        )
      ].sort();

      return [
        'All',
        ...countries
      ];

    }, [universities]);


  const filteredUniversities =
    useMemo(() => {
      let list =
        [...universities];

      if (
        universityCountryFilter !==
        'All'
      ) {
        list =
          list.filter(
            (item) =>
              item.country ===
              universityCountryFilter
          );
      }

      if (
        universitySearch.trim()
      ) {
        const search =
          universitySearch
            .trim()
            .toLowerCase();

        list =
          list.filter(
            (item) =>
              [
                item.name,
                item.country,
                item.city,
                item.course
              ].some(
                (value) =>
                  String(
                    value || ''
                  )
                    .toLowerCase()
                    .includes(
                      search
                    )
              )
          );
      }

      return list;

    }, [
      universities,
      universityCountryFilter,
      universitySearch
    ]);


  // =====================================================
  // CSV
  // =====================================================

  const copyAll = () => {
    const csv = [
      'id,name,phone,email,country,neet,type,source,message,created_at',

      ...filteredLeads.map(
        (lead) =>
          [
            lead.id,
            lead.name,
            lead.phone,
            lead.email,
            lead.country,
            lead.neet_score,
            lead.type,
            lead.source,
            (
              lead.message ||
              ''
            ).replace(
              /,/g,
              ';'
            ),
            lead.created_at
          ]
            .map(
              (x) =>
                `"${String(
                  x ?? ''
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


  const copyNewsletter = () => {
    const text =
      newsletter
        .map(
          (item) =>
            item.email
        )
        .filter(Boolean)
        .join('\n');

    navigator.clipboard.writeText(
      text
    );
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const signOut = async () => {
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
  // BLOG EDITOR
  // =====================================================

  const openNewBlog = () => {
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
    setBlogError('');
    setBlogEditorOpen(true);
  };


  const openEditBlog = (blog) => {
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
        blog.category ||
        'MBBS',

      author:
        blog.author ||
        'RYC Editorial',

      read_time:
        blog.read_time ||
        5,

      excerpt:
        blog.excerpt ||
        '',

      body:
        Array.isArray(
          blog.body
        )
          ? blog.body.filter(
              (block) =>
                block.type !==
                'image'
            )
          : [],

      cta:
        blog.cta ||
        'mbbs',

      seo_title:
        blog.seo_title ||
        '',

      meta_description:
        blog.meta_description ||
        '',

      keywordsText:
        Array.isArray(
          blog.keywords
        )
          ? blog.keywords.join(
              ', '
            )
          : '',

      status:
        blog.status ||
        'draft'
    });

    setBlogError('');
    setBlogEditorOpen(true);
  };


  const closeBlogEditor = () => {
    if (savingBlog) return;

    setBlogEditorOpen(false);
    setEditingBlogId(null);
    setBlogError('');
  };


  const changeBlogField =
    (
      field,
      value
    ) => {

      setBlogForm(
        (old) => ({
          ...old,
          [field]: value
        })
      );
    };


  const handleTitleChange =
    (value) => {

      setBlogForm(
        (old) => ({
          ...old,

          title:
            value,

          slug:
            slugTouched
              ? old.slug
              : slugify(
                  value
                )
        })
      );
    };


  const updateBodyBlock =
    (
      index,
      values
    ) => {

      setBlogForm(
        (old) => {
          const body = [
            ...old.body
          ];

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


  const addBodyBlock =
    (type) => {

      setBlogForm(
        (old) => ({
          ...old,

          body: [
            ...old.body,
            blankBlock(type)
          ]
        })
      );
    };


  const removeBodyBlock =
    (index) => {

      setBlogForm(
        (old) => ({
          ...old,

          body:
            old.body.filter(
              (_, i) =>
                i !== index
            )
        })
      );
    };


  const moveBodyBlock =
    (
      index,
      direction
    ) => {

      setBlogForm(
        (old) => {
          const body = [
            ...old.body
          ];

          const nextIndex =
            index +
            direction;

          if (
            nextIndex < 0 ||
            nextIndex >=
            body.length
          ) {
            return old;
          }

          const temp =
            body[index];

          body[index] =
            body[nextIndex];

          body[nextIndex] =
            temp;

          return {
            ...old,
            body
          };
        }
      );
    };


  const saveBlog =
    async (
      statusOverride
    ) => {

      setBlogError('');

      if (
        !blogForm.title.trim()
      ) {
        setBlogError(
          'Blog title is required.'
        );

        return;
      }

      if (
        !blogForm.category.trim()
      ) {
        setBlogError(
          'Category is required.'
        );

        return;
      }

      if (
        !blogForm.excerpt.trim()
      ) {
        setBlogError(
          'Excerpt is required.'
        );

        return;
      }


      const cleanBody =
        blogForm.body
          .map((block) => {

            if (
              block.type ===
              'heading'
            ) {
              return {
                type:
                  'heading',

                text:
                  block.text ||
                  ''
              };
            }

            if (
              block.type ===
              'paragraph'
            ) {
              return {
                type:
                  'paragraph',

                text:
                  block.text ||
                  ''
              };
            }

            if (
              block.type ===
              'list'
            ) {
              return {
                type:
                  'list',

                items:
                  (
                    block.items ||
                    []
                  )
                    .map(
                      (x) =>
                        String(
                          x ||
                          ''
                        ).trim()
                    )
                    .filter(
                      Boolean
                    )
              };
            }

            return null;

          })
          .filter(Boolean);


      const payload = {
        title:
          blogForm.title.trim(),

        slug:
          slugify(
            blogForm.slug ||
            blogForm.title
          ),

        category:
          blogForm.category.trim(),

        author:
          blogForm.author.trim() ||
          'RYC Editorial',

        read_time:
          Number(
            blogForm.read_time
          ) || 5,

        excerpt:
          blogForm.excerpt.trim(),

        body:
          cleanBody,

        cta:
          blogForm.cta,

        seo_title:
          blogForm.seo_title.trim() ||
          blogForm.title.trim(),

        meta_description:
          blogForm.meta_description.trim() ||
          blogForm.excerpt.trim(),

        keywords:
          blogForm.keywordsText
            .split(',')
            .map(
              (keyword) =>
                keyword.trim()
            )
            .filter(
              Boolean
            ),

        status:
          statusOverride ||
          blogForm.status
      };


      setSavingBlog(true);

      try {
        if (editingBlogId) {
          await adminFetch(
            `/api/admin/blogs/${editingBlogId}`,
            {
              method:
                'PUT',

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
              method:
                'POST',

              body:
                JSON.stringify(
                  payload
                )
            }
          );
        }

        await loadBlogs();

        setBlogEditorOpen(
          false
        );

        setEditingBlogId(
          null
        );

        setSection(
          'blogs'
        );

      } catch (e) {
        setBlogError(
          e.message ||
          'Could not save blog.'
        );

      } finally {
        setSavingBlog(
          false
        );
      }
    };


  const toggleBlogStatus =
    async (blog) => {

      const nextStatus =
        blog.status ===
        'published'
          ? 'draft'
          : 'published';

      try {
        await adminFetch(
          `/api/admin/blogs/${blog.id}`,
          {
            method:
              'PUT',

            body:
              JSON.stringify({
                status:
                  nextStatus
              })
          }
        );

        await loadBlogs();

      } catch (e) {
        alert(
          e.message ||
          'Could not update blog.'
        );
      }
    };


  const deleteBlog =
    async (blog) => {

      const ok =
        window.confirm(
          `Delete "${blog.title}" permanently?`
        );

      if (!ok) return;

      try {
        await adminFetch(
          `/api/admin/blogs/${blog.id}`,
          {
            method:
              'DELETE'
          }
        );

        await loadBlogs();

      } catch (e) {
        alert(
          e.message ||
          'Could not delete blog.'
        );
      }
    };


  // =====================================================
  // UNIVERSITY EDITOR
  // =====================================================

  const openNewUniversity =
    () => {

      setEditingUniversityId(
        null
      );

      setUniversityForm(
        EMPTY_UNIVERSITY
      );

      setUniversitySlugTouched(
        false
      );

      setUniversityError(
        ''
      );

      setUniversityEditorOpen(
        true
      );
    };


  const openEditUniversity =
    (item) => {

      setEditingUniversityId(
        item.id
      );

      setUniversitySlugTouched(
        true
      );

      setUniversityForm({
        name:
          item.name ||
          '',

        slug:
          item.slug ||
          '',

        country:
          item.country ||
          'Georgia',

        city:
          item.city ||
          '',

        course:
          item.course ||
          'MBBS',

        duration:
          item.duration ||
          '',

        medium:
          item.medium ||
          'English',

        intake:
          item.intake ||
          '',

        currency:
          item.currency ||
          'USD',

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

        neet_requirement:
          item.neet_requirement ||
          '',

        eligibility:
          item.eligibility ||
          '',

        overview:
          item.overview ||
          '',

        recognition:
          item.recognition ||
          '',

        internship:
          item.internship ||
          '',

        hostel:
          item.hostel ||
          '',

        indian_food:
          item.indian_food ||
          '',

        student_life:
          item.student_life ||
          '',

        prosText:
          Array.isArray(
            item.pros
          )
            ? item.pros.join(
                '\n'
              )
            : '',

        consText:
          Array.isArray(
            item.cons
          )
            ? item.cons.join(
                '\n'
              )
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
          item.website ||
          '',

        apply_link:
          item.apply_link ||
          '',

        featured:
          Boolean(
            item.featured
          ),

        seo_title:
          item.seo_title ||
          '',

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
          item.status ||
          'draft'
      });

      setUniversityError(
        ''
      );

      setUniversityEditorOpen(
        true
      );
    };


  const closeUniversityEditor =
    () => {

      if (
        savingUniversity
      ) {
        return;
      }

      setUniversityEditorOpen(
        false
      );

      setEditingUniversityId(
        null
      );

      setUniversityError(
        ''
      );
    };


  const changeUniversityField =
    (
      field,
      value
    ) => {

      setUniversityForm(
        (old) => ({
          ...old,
          [field]: value
        })
      );
    };


  const handleUniversityNameChange =
    (value) => {

      setUniversityForm(
        (old) => ({
          ...old,

          name:
            value,

          slug:
            universitySlugTouched
              ? old.slug
              : slugify(
                  value
                )
        })
      );
    };


  const saveUniversity =
    async (
      statusOverride
    ) => {

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


      const payload = {
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
          universityForm.course.trim() ||
          'MBBS',

        duration:
          universityForm.duration.trim() ||
          null,

        medium:
          universityForm.medium.trim() ||
          null,

        intake:
          universityForm.intake.trim() ||
          null,

        currency:
          universityForm.currency.trim() ||
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

        neet_requirement:
          universityForm.neet_requirement.trim() ||
          null,

        eligibility:
          universityForm.eligibility.trim() ||
          null,

        overview:
          universityForm.overview.trim() ||
          null,

        recognition:
          universityForm.recognition.trim() ||
          null,

        internship:
          universityForm.internship.trim() ||
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
          Boolean(
            universityForm.featured
          ),

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
            .map(
              (item) =>
                item.trim()
            )
            .filter(
              Boolean
            ),

        status:
          statusOverride ||
          universityForm.status
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
              method:
                'PUT',

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
              method:
                'POST',

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

        setEditingUniversityId(
          null
        );

        setSection(
          'universities'
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
    async (item) => {

      const nextStatus =
        item.status ===
        'published'
          ? 'draft'
          : 'published';

      try {
        await adminFetch(
          `/api/admin/universities/${item.id}`,
          {
            method:
              'PUT',

            body:
              JSON.stringify({
                status:
                  nextStatus
              })
          }
        );

        await loadUniversities();

      } catch (e) {
        alert(
          e.message ||
          'Could not update university.'
        );
      }
    };


  const toggleFeatured =
    async (item) => {

      try {
        await adminFetch(
          `/api/admin/universities/${item.id}`,
          {
            method:
              'PUT',

            body:
              JSON.stringify({
                featured:
                  !item.featured
              })
          }
        );

        await loadUniversities();

      } catch (e) {
        alert(
          e.message ||
          'Could not update featured status.'
        );
      }
    };


  const deleteUniversity =
    async (item) => {

      const ok =
        window.confirm(
          `Delete "${item.name}" permanently?`
        );

      if (!ok) return;

      try {
        await adminFetch(
          `/api/admin/universities/${item.id}`,
          {
            method:
              'DELETE'
          }
        );

        await loadUniversities();

      } catch (e) {
        alert(
          e.message ||
          'Could not delete university.'
        );
      }
    };


  // =====================================================
  // AUTH LOADING
  // =====================================================

  if (checking) {
    return (
      <div className="min-h-screen bg-cream grid place-items-center text-ink/60">
        Loading…
      </div>
    );
  }


  if (!user) {
    return null;
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="min-h-screen bg-cream text-ink">


      {/* HEADER */}

      <header className="sticky top-0 z-40 bg-ink text-cream border-b border-cream/10">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">

          <Link
            to="/"
            className="flex items-center gap-2"
          >

            <div className="h-8 w-8 rounded-full bg-cream text-ink grid place-items-center serif italic font-medium">
              r
            </div>

            <div className="hidden sm:block">

              <div className="serif text-[15px] font-medium">
                Route Your Career
              </div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                Admin Console
              </div>

            </div>

          </Link>


          <div className="ml-auto flex items-center gap-3">

            {user.picture && (

              <img
                src={
                  user.picture
                }
                alt=""
                className="h-8 w-8 rounded-full"
              />

            )}


            <div className="hidden sm:block leading-tight">

              <div className="text-[13px] font-medium">
                {user.name}
              </div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                Administrator
              </div>

            </div>


            <button
              onClick={
                signOut
              }
              className="inline-flex items-center gap-1 rounded-full border border-cream/25 px-3 py-1.5 text-[12px] font-semibold hover:bg-cream/10"
            >

              <LogOut className="h-3.5 w-3.5" />

              Sign out

            </button>

          </div>

        </div>

      </header>


      {/* MAIN ADMIN NAV */}

      <div className="border-b border-ink/10 bg-white sticky top-[57px] z-30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1 overflow-x-auto">

          {[
            {
              key: 'dashboard',
              label: 'Dashboard',
              icon: LayoutDashboard
            },
            {
              key: 'leads',
              label: 'Leads',
              icon: Users
            },
            {
              key: 'newsletter',
              label: 'Newsletter',
              icon: Mail
            },
            {
              key: 'blogs',
              label: 'Blogs',
              icon: BookOpen
            },
            {
              key: 'universities',
              label: 'Universities',
              icon: GraduationCap
            }

          ].map(
            (item) => {

              const Icon =
                item.icon;

              return (
                <button
                  key={
                    item.key
                  }
                  onClick={() =>
                    setSection(
                      item.key
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold whitespace-nowrap ${
                    section ===
                    item.key
                      ? 'bg-ink text-cream'
                      : 'text-ink/60 hover:text-ink hover:bg-cream'
                  }`}
                >

                  <Icon className="h-4 w-4" />

                  {item.label}

                </button>
              );
            }
          )}

        </div>

      </div>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">


        {/* ================================================= */}
        {/* DASHBOARD */}
        {/* ================================================= */}

        {section === 'dashboard' && (

          <>

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Route Your Career
                </div>

                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  Admin dashboard.
                </h1>

              </div>


              <button
                onClick={() => {
                  loadLeads();
                  loadNewsletter();
                  loadBlogs();
                  loadUniversities();
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2 text-[12px] font-semibold"
              >

                <RefreshCw className="h-4 w-4" />

                Refresh

              </button>

            </div>


            <div className="mt-8 grid grid-cols-2 lg:grid-cols-5 gap-3">

              {[
                {
                  label:
                    'Total Leads',

                  value:
                    stats?.total_leads ??
                    '–',

                  icon:
                    Users
                },
                {
                  label:
                    'Last 7 Days',

                  value:
                    stats?.last_7_days ??
                    '–',

                  icon:
                    Sparkles
                },
                {
                  label:
                    'Newsletter',

                  value:
                    stats?.newsletter_subscribers ??
                    newsletter.length,

                  icon:
                    Mail
                },
                {
                  label:
                    'Blogs',

                  value:
                    publishedBlogCount,

                  icon:
                    BookOpen
                },
                {
                  label:
                    'Universities',

                  value:
                    publishedUniversityCount,

                  icon:
                    GraduationCap
                }

              ].map(
                (card) => {

                  const Icon =
                    card.icon;

                  return (

                    <div
                      key={
                        card.label
                      }
                      className="rounded-3xl border border-ink/10 bg-white p-5"
                    >

                      <div className="flex items-center justify-between">

                        <div className="text-[10px] mono uppercase tracking-widest text-ink/50">
                          {card.label}
                        </div>

                        <div className="h-9 w-9 rounded-xl bg-coral/10 text-coral grid place-items-center">

                          <Icon className="h-4 w-4" />

                        </div>

                      </div>


                      <div className="mt-3 serif text-4xl">
                        {card.value}
                      </div>

                    </div>

                  );
                }
              )}

            </div>


            <div className="mt-5 grid lg:grid-cols-3 gap-5">

              <div className="rounded-3xl bg-white border border-ink/10 p-6">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Leads
                </div>

                <h2 className="serif text-2xl mt-1">
                  Lead breakdown
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-2">

                  {Object.entries(
                    stats?.by_type ||
                    {}
                  ).map(
                    ([key, value]) => (

                      <div
                        key={
                          key
                        }
                        className="rounded-2xl bg-cream p-3"
                      >

                        <div className="text-[9px] mono uppercase tracking-widest text-ink/50">
                          {key}
                        </div>

                        <div className="serif text-2xl mt-1">
                          {value}
                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>


              <div className="rounded-3xl bg-ink text-cream p-6">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  RYC Journal
                </div>

                <h2 className="serif text-3xl mt-2">
                  Blog manager.
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-2">

                  <div className="rounded-2xl border border-cream/10 p-4">

                    <div className="text-[10px] text-cream/50">
                      Published
                    </div>

                    <div className="serif text-3xl">
                      {publishedBlogCount}
                    </div>

                  </div>

                  <div className="rounded-2xl border border-cream/10 p-4">

                    <div className="text-[10px] text-cream/50">
                      Drafts
                    </div>

                    <div className="serif text-3xl">
                      {draftBlogCount}
                    </div>

                  </div>

                </div>

                <button
                  onClick={() => {
                    setSection(
                      'blogs'
                    );

                    openNewBlog();
                  }}
                  className="mt-5 rounded-full bg-coral text-white px-5 py-2.5 text-[12px] font-bold"
                >
                  + New Blog
                </button>

              </div>


              <div className="rounded-3xl bg-white border border-ink/10 p-6">

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Universities
                </div>

                <h2 className="serif text-3xl mt-2">
                  University manager.
                </h2>

                <div className="mt-5 grid grid-cols-3 gap-2">

                  <div className="rounded-2xl bg-cream p-3">
                    <div className="text-[9px] text-ink/40">
                      Published
                    </div>
                    <div className="serif text-2xl">
                      {publishedUniversityCount}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cream p-3">
                    <div className="text-[9px] text-ink/40">
                      Draft
                    </div>
                    <div className="serif text-2xl">
                      {draftUniversityCount}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-cream p-3">
                    <div className="text-[9px] text-ink/40">
                      Featured
                    </div>
                    <div className="serif text-2xl">
                      {featuredUniversityCount}
                    </div>
                  </div>

                </div>

                <button
                  onClick={() => {
                    setSection(
                      'universities'
                    );

                    openNewUniversity();
                  }}
                  className="mt-5 rounded-full bg-ink text-cream px-5 py-2.5 text-[12px] font-bold"
                >
                  + Add University
                </button>

              </div>

            </div>

          </>

        )}


        {/* ================================================= */}
        {/* LEADS */}
        {/* ================================================= */}

        {section === 'leads' && (

          <>

            <div>

              <div className="text-[10px] mono uppercase tracking-widest text-coral">
                CRM
              </div>

              <h1 className="serif text-4xl mt-1">
                Student leads.
              </h1>

            </div>


            <div className="mt-6 flex flex-wrap items-center gap-2">

              <div className="inline-flex rounded-full bg-white border border-ink/10 p-1 overflow-x-auto">

                {LEAD_TABS.map(
                  (tab) => (

                    <button
                      key={
                        tab.k
                      }
                      onClick={() =>
                        setLeadTab(
                          tab.k
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${
                        leadTab === tab.k
                          ? 'bg-ink text-cream'
                          : 'text-ink/60'
                      }`}
                    >
                      {tab.l}
                    </button>

                  )
                )}

              </div>


              <div className="ml-auto flex flex-wrap items-center gap-2">

                <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5">

                  <Filter className="h-3.5 w-3.5" />

                  <input
                    value={
                      q
                    }
                    onChange={
                      (e) =>
                        setQ(
                          e.target.value
                        )
                    }
                    placeholder="Search leads…"
                    className="bg-transparent text-[13px] w-48 focus:outline-none"
                  />

                </div>


                <button
                  onClick={
                    copyAll
                  }
                  className="rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-semibold inline-flex items-center gap-1"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy CSV
                </button>

              </div>

            </div>


            <div className="mt-4 rounded-3xl border border-ink/10 bg-white overflow-x-auto">

              <div className="min-w-[1000px]">

                <div className="grid grid-cols-12 px-5 py-3 bg-cream/60 text-[10px] mono uppercase tracking-widest text-ink/60">

                  <div className="col-span-3">
                    Student
                  </div>

                  <div className="col-span-2">
                    Phone / Email
                  </div>

                  <div className="col-span-2">
                    Country / NEET
                  </div>

                  <div className="col-span-2">
                    Type / Source
                  </div>

                  <div className="col-span-2">
                    Message
                  </div>

                  <div className="col-span-1 text-right">
                    When
                  </div>

                </div>


                {loadingLeads && (
                  <div className="py-10 text-center">
                    Loading…
                  </div>
                )}


                <div className="divide-y divide-ink/5">

                  {filteredLeads.map(
                    (lead) => (

                      <div
                        key={
                          lead.id
                        }
                        className="grid grid-cols-12 px-5 py-4"
                      >

                        <div className="col-span-3">
                          <div className="font-semibold text-[14px]">
                            {lead.name}
                          </div>
                        </div>

                        <div className="col-span-2 text-[13px]">

                          {lead.phone &&
                            lead.phone !== '-' && (

                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-1"
                              >
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </a>

                            )}

                          {lead.email && (

                            <a
                              href={`mailto:${lead.email}`}
                              className="mt-1 flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </a>

                          )}

                        </div>

                        <div className="col-span-2 text-[13px]">
                          <div>
                            {lead.country || '—'}
                          </div>
                          <div className="text-[11px] text-ink/40">
                            NEET: {lead.neet_score || '—'}
                          </div>
                        </div>

                        <div className="col-span-2 text-[12px]">
                          {lead.type}
                          <div className="text-ink/40">
                            {lead.source}
                          </div>
                        </div>

                        <div className="col-span-2 text-[12px]">
                          {lead.message || '—'}
                        </div>

                        <div className="col-span-1 text-right text-[11px]">

                          {fmt(
                            lead.created_at
                          )}

                          {lead.phone &&
                            lead.phone !== '-' && (

                              <div className="mt-2">

                                <a
                                  href={`https://wa.me/${String(
                                    lead.phone
                                  ).replace(
                                    /[^0-9]/g,
                                    ''
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-700 inline-flex gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  WA
                                </a>

                              </div>

                            )}

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          </>

        )}


        {/* ================================================= */}
        {/* NEWSLETTER */}
        {/* ================================================= */}

        {section === 'newsletter' && (

          <>

            <div className="flex items-end justify-between gap-4">

              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Audience
                </div>

                <h1 className="serif text-4xl mt-1">
                  Newsletter subscribers.
                </h1>
              </div>

              <button
                onClick={
                  copyNewsletter
                }
                className="rounded-full bg-ink text-cream px-4 py-2 text-[12px]"
              >
                Copy Emails
              </button>

            </div>


            <div className="mt-6 rounded-3xl bg-white border border-ink/10">

              {newsletter.map(
                (item) => (

                  <div
                    key={
                      item.id ||
                      item.email
                    }
                    className="p-4 border-b border-ink/5 flex items-center gap-3"
                  >

                    <Mail className="h-4 w-4 text-coral" />

                    <div>
                      {item.email}
                    </div>

                    <div className="ml-auto text-[11px] text-ink/40">
                      {fmt(
                        item.created_at
                      )}
                    </div>

                  </div>

                )
              )}

            </div>

          </>

        )}


        {/* ================================================= */}
        {/* BLOGS */}
        {/* ================================================= */}

        {section === 'blogs' && (

          <>

            <div className="flex items-end justify-between gap-4">

              <div>
                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  RYC Journal
                </div>

                <h1 className="serif text-4xl">
                  Blog manager.
                </h1>
              </div>

              <button
                onClick={
                  openNewBlog
                }
                className="rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
              >
                + New Blog
              </button>

            </div>


            <div className="mt-6 rounded-3xl bg-white border border-ink/10 divide-y divide-ink/5">

              {blogs.map(
                (blog) => (

                  <div
                    key={
                      blog.id
                    }
                    className="p-5 flex flex-wrap items-center gap-4"
                  >

                    <img
                      src="/blog-default.png"
                      alt=""
                      className="h-16 w-24 rounded-xl object-cover"
                    />

                    <div className="flex-1">

                      <div className="text-[10px] uppercase text-coral">
                        {blog.status} · {blog.category}
                      </div>

                      <div className="serif text-xl mt-1">
                        {blog.title}
                      </div>

                    </div>

                    {blog.status === 'published' && (

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
                      className="text-[11px] border rounded-full px-3 py-2"
                    >
                      {blog.status === 'published'
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


        {/* ================================================= */}
        {/* UNIVERSITIES */}
        {/* ================================================= */}

        {section === 'universities' && (

          <>

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  MBBS Database
                </div>

                <h1 className="serif text-4xl sm:text-5xl mt-1">
                  University manager.
                </h1>

                <p className="mt-2 text-[13px] text-ink/60">
                  Manage universities country-wise without editing GitHub.
                </p>

              </div>

              <button
                onClick={
                  openNewUniversity
                }
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
              >
                <Plus className="h-4 w-4" />
                Add University
              </button>

            </div>


            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">

              {[
                ['Total', universities.length],
                ['Published', publishedUniversityCount],
                ['Drafts', draftUniversityCount],
                ['Featured', featuredUniversityCount]

              ].map(
                ([label, value]) => (

                  <div
                    key={
                      label
                    }
                    className="rounded-3xl bg-white border border-ink/10 p-5"
                  >
                    <div className="text-[10px] mono uppercase text-ink/40">
                      {label}
                    </div>

                    <div className="serif text-4xl mt-2">
                      {value}
                    </div>
                  </div>

                )
              )}

            </div>


            {/* COUNTRY FILTER */}

            <div className="mt-6 flex flex-wrap gap-2 items-center">

              <div className="inline-flex rounded-full bg-white border border-ink/10 p-1 overflow-x-auto">

                {universityCountries.map(
                  (country) => (

                    <button
                      key={
                        country
                      }
                      onClick={() =>
                        setUniversityCountryFilter(
                          country
                        )
                      }
                      className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap ${
                        universityCountryFilter === country
                          ? 'bg-ink text-cream'
                          : 'text-ink/60'
                      }`}
                    >
                      {country}
                    </button>

                  )
                )}

              </div>


              <div className="ml-auto inline-flex items-center gap-2 bg-white border border-ink/10 rounded-full px-3 py-2">

                <Search className="h-4 w-4 text-ink/40" />

                <input
                  value={
                    universitySearch
                  }
                  onChange={
                    (e) =>
                      setUniversitySearch(
                        e.target.value
                      )
                  }
                  placeholder="Search university..."
                  className="bg-transparent outline-none text-[13px] w-52"
                />

              </div>

            </div>


            {universityError && (

              <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-[13px]">
                {universityError}
              </div>

            )}


            <div className="mt-5 rounded-3xl bg-white border border-ink/10 overflow-hidden">

              {loadingUniversities && (

                <div className="py-12 text-center">
                  Loading universities…
                </div>

              )}


              {!loadingUniversities &&
                filteredUniversities.length === 0 && (

                  <div className="py-14 text-center">

                    <GraduationCap className="h-10 w-10 mx-auto text-coral" />

                    <div className="serif text-2xl mt-3">
                      No universities yet.
                    </div>

                    <button
                      onClick={
                        openNewUniversity
                      }
                      className="mt-4 rounded-full bg-ink text-cream px-5 py-2"
                    >
                      Add first university
                    </button>

                  </div>

                )}


              <div className="divide-y divide-ink/5">

                {filteredUniversities.map(
                  (item) => (

                    <div
                      key={
                        item.id
                      }
                      className="p-5 flex flex-col md:flex-row md:items-center gap-4"
                    >

                      <div className="h-14 w-14 rounded-2xl bg-coral/10 text-coral grid place-items-center shrink-0">

                        <GraduationCap className="h-6 w-6" />

                      </div>


                      <div className="flex-1">

                        <div className="flex flex-wrap gap-2 items-center">

                          <span className={`text-[10px] uppercase font-bold rounded-full px-2 py-1 ${
                            item.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>


                          {item.featured && (

                            <span className="text-[10px] uppercase bg-coral/10 text-coral rounded-full px-2 py-1">
                              Featured
                            </span>

                          )}

                        </div>


                        <div className="serif text-xl mt-2">
                          {item.name}
                        </div>


                        <div className="text-[12px] text-ink/50 mt-1 flex flex-wrap gap-3">

                          <span className="flex gap-1 items-center">
                            <Globe2 className="h-3 w-3" />
                            {item.country}
                          </span>

                          {item.city && (
                            <span className="flex gap-1 items-center">
                              <MapPin className="h-3 w-3" />
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
                          onClick={() =>
                            toggleFeatured(
                              item
                            )
                          }
                          title="Featured"
                          className={`h-9 w-9 rounded-full border grid place-items-center ${
                            item.featured
                              ? 'bg-coral text-white border-coral'
                              : 'border-ink/10'
                          }`}
                        >
                          <Star className="h-4 w-4" />
                        </button>


                        <button
                          onClick={() =>
                            openEditUniversity(
                              item
                            )
                          }
                          className="h-9 w-9 rounded-full border border-ink/10 grid place-items-center"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>


                        <button
                          onClick={() =>
                            toggleUniversityStatus(
                              item
                            )
                          }
                          className="rounded-full border border-ink/15 px-3 py-2 text-[11px]"
                        >
                          {item.status === 'published'
                            ? 'Unpublish'
                            : 'Publish'}
                        </button>


                        <button
                          onClick={() =>
                            deleteUniversity(
                              item
                            )
                          }
                          className="h-9 w-9 rounded-full border border-red-200 text-red-600 grid place-items-center"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </>

        )}

      </main>


      {/* ================================================= */}
      {/* BLOG EDITOR */}
      {/* ================================================= */}

      {blogEditorOpen && (

        <div className="fixed inset-0 z-[100] bg-black/60 overflow-y-auto">

          <div className="min-h-screen py-6 px-3">

            <div className="max-w-5xl mx-auto bg-cream rounded-3xl overflow-hidden">

              <div className="sticky top-0 bg-ink text-cream p-5 flex items-center z-20">

                <div className="serif text-xl">
                  {editingBlogId
                    ? 'Edit Blog'
                    : 'New Blog'}
                </div>

                <button
                  onClick={
                    closeBlogEditor
                  }
                  className="ml-auto"
                >
                  <X />
                </button>

              </div>


              <div className="p-6 space-y-5">

                {blogError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-xl">
                    {blogError}
                  </div>
                )}


                <input
                  value={
                    blogForm.title
                  }
                  onChange={
                    (e) =>
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
                    (e) => {
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


                <div className="grid sm:grid-cols-2 gap-4">

                  <input
                    value={
                      blogForm.category
                    }
                    onChange={
                      (e) =>
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
                      (e) =>
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
                    (e) =>
                      changeBlogField(
                        'excerpt',
                        e.target.value
                      )
                  }
                  placeholder="Excerpt"
                  rows="3"
                  className="w-full border rounded-xl p-3"
                />


                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      addBodyBlock(
                        'heading'
                      )
                    }
                    className="border rounded-full px-3 py-2 flex gap-1"
                  >
                    <Heading2 className="h-4 w-4" />
                    Heading
                  </button>

                  <button
                    onClick={() =>
                      addBodyBlock(
                        'paragraph'
                      )
                    }
                    className="border rounded-full px-3 py-2 flex gap-1"
                  >
                    <FileText className="h-4 w-4" />
                    Paragraph
                  </button>

                  <button
                    onClick={() =>
                      addBodyBlock(
                        'list'
                      )
                    }
                    className="border rounded-full px-3 py-2 flex gap-1"
                  >
                    <List className="h-4 w-4" />
                    List
                  </button>

                </div>


                {blogForm.body.map(
                  (block, index) => (

                    <div
                      key={
                        index
                      }
                      className="bg-white border rounded-xl p-4"
                    >

                      {block.type === 'heading' && (
                        <input
                          value={
                            block.text ||
                            ''
                          }
                          onChange={
                            (e) =>
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


                      {block.type === 'paragraph' && (
                        <textarea
                          value={
                            block.text ||
                            ''
                          }
                          onChange={
                            (e) =>
                              updateBodyBlock(
                                index,
                                {
                                  text:
                                    e.target.value
                                }
                              )
                          }
                          rows="5"
                          className="w-full border rounded-xl p-3"
                        />
                      )}


                      {block.type === 'list' && (
                        <textarea
                          value={
                            (
                              block.items ||
                              []
                            ).join(
                              '\n'
                            )
                          }
                          onChange={
                            (e) =>
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
                          rows="5"
                          className="w-full border rounded-xl p-3"
                        />
                      )}


                      <div className="mt-2 flex gap-2">

                        <button
                          onClick={() =>
                            moveBodyBlock(
                              index,
                              -1
                            )
                          }
                        >
                          ↑
                        </button>

                        <button
                          onClick={() =>
                            moveBodyBlock(
                              index,
                              1
                            )
                          }
                        >
                          ↓
                        </button>

                        <button
                          onClick={() =>
                            removeBodyBlock(
                              index
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>

                      </div>

                    </div>

                  )
                )}


                <input
                  value={
                    blogForm.seo_title
                  }
                  onChange={
                    (e) =>
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
                    (e) =>
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
                    (e) =>
                      changeBlogField(
                        'keywordsText',
                        e.target.value
                      )
                  }
                  placeholder="Keywords separated by commas"
                  className="w-full border rounded-xl p-3"
                />


                <div className="flex gap-3">

                  <button
                    onClick={() =>
                      saveBlog(
                        'draft'
                      )
                    }
                    className="border rounded-full px-5 py-3"
                  >
                    <Save className="inline h-4 w-4 mr-1" />
                    Save Draft
                  </button>

                  <button
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

        </div>

      )}


      {/* ================================================= */}
      {/* UNIVERSITY EDITOR */}
      {/* ================================================= */}

      {universityEditorOpen && (

        <div className="fixed inset-0 z-[110] bg-black/60 overflow-y-auto">

          <div className="min-h-screen py-6 px-3 sm:px-6">

            <div className="max-w-6xl mx-auto bg-cream rounded-3xl overflow-hidden shadow-2xl">


              {/* HEADER */}

              <div className="sticky top-0 z-30 bg-ink text-cream px-6 py-4 flex items-center">

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
                  onClick={
                    closeUniversityEditor
                  }
                  className="ml-auto h-10 w-10 border border-cream/20 rounded-full grid place-items-center"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>


              <div className="p-6 sm:p-8 space-y-8">


                {universityError && (

                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
                    {universityError}
                  </div>

                )}


                {/* BASIC */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    01 — Basic Information
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 gap-4">

                    <input
                      value={
                        universityForm.name
                      }
                      onChange={
                        (e) =>
                          handleUniversityNameChange(
                            e.target.value
                          )
                      }
                      placeholder="University name *"
                      className="border rounded-xl p-3 bg-white sm:col-span-2"
                    />

                    <input
                      value={
                        universityForm.slug
                      }
                      onChange={
                        (e) => {
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
                      placeholder="URL slug"
                      className="border rounded-xl p-3 bg-white sm:col-span-2"
                    />


                    <input
                      value={
                        universityForm.country
                      }
                      onChange={
                        (e) =>
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
                        (e) =>
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
                    02 — Course
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <input
                      value={
                        universityForm.course
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'course',
                            e.target.value
                          )
                      }
                      placeholder="Course"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      value={
                        universityForm.duration
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'duration',
                            e.target.value
                          )
                      }
                      placeholder="Duration e.g. 6 Years"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      value={
                        universityForm.medium
                      }
                      onChange={
                        (e) =>
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
                        (e) =>
                          changeUniversityField(
                            'intake',
                            e.target.value
                          )
                      }
                      placeholder="Intake e.g. September"
                      className="border rounded-xl p-3 bg-white"
                    />

                  </div>

                </section>


                {/* FEES */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    03 — Fees
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    <select
                      value={
                        universityForm.currency
                      }
                      onChange={
                        (e) =>
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
                      <option>GEL</option>
                      <option>UZS</option>
                    </select>


                    <input
                      type="number"
                      value={
                        universityForm.tuition_fee_year
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'tuition_fee_year',
                            e.target.value
                          )
                      }
                      placeholder="Tuition / year"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      type="number"
                      value={
                        universityForm.hostel_fee_year
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'hostel_fee_year',
                            e.target.value
                          )
                      }
                      placeholder="Hostel / year"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      type="number"
                      value={
                        universityForm.food_fee_year
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'food_fee_year',
                            e.target.value
                          )
                      }
                      placeholder="Food / year"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      type="number"
                      value={
                        universityForm.first_year_total
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'first_year_total',
                            e.target.value
                          )
                      }
                      placeholder="First-year total"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      type="number"
                      value={
                        universityForm.total_course_cost
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'total_course_cost',
                            e.target.value
                          )
                      }
                      placeholder="Estimated total course cost"
                      className="border rounded-xl p-3 bg-white"
                    />

                  </div>

                </section>


                {/* ELIGIBILITY */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    04 — Eligibility
                  </div>

                  <div className="mt-4 space-y-4">

                    <input
                      value={
                        universityForm.neet_requirement
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'neet_requirement',
                            e.target.value
                          )
                      }
                      placeholder="NEET requirement"
                      className="border rounded-xl p-3 bg-white w-full"
                    />

                    <textarea
                      rows="3"
                      value={
                        universityForm.eligibility
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'eligibility',
                            e.target.value
                          )
                      }
                      placeholder="Eligibility details"
                      className="border rounded-xl p-3 bg-white w-full"
                    />

                  </div>

                </section>


                {/* DETAILS */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    05 — Detailed Information
                  </div>

                  <div className="mt-4 space-y-4">

                    {[
                      ['overview', 'Overview'],
                      ['recognition', 'Recognition / Accreditation'],
                      ['internship', 'Internship details'],
                      ['hostel', 'Hostel information'],
                      ['indian_food', 'Indian food availability'],
                      ['student_life', 'Student life']

                    ].map(
                      ([field, label]) => (

                        <textarea
                          key={
                            field
                          }
                          rows="4"
                          value={
                            universityForm[
                              field
                            ]
                          }
                          onChange={
                            (e) =>
                              changeUniversityField(
                                field,
                                e.target.value
                              )
                          }
                          placeholder={
                            label
                          }
                          className="border rounded-xl p-3 bg-white w-full"
                        />

                      )
                    )}

                  </div>

                </section>


                {/* LISTS */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    06 — Lists
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
                        (e) =>
                          changeUniversityField(
                            'prosText',
                            e.target.value
                          )
                      }
                      placeholder={'Pros\nAffordable tuition\nEnglish medium'}
                      className="border rounded-xl p-3 bg-white"
                    />

                    <textarea
                      rows="6"
                      value={
                        universityForm.consText
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'consText',
                            e.target.value
                          )
                      }
                      placeholder={'Cons\nCold winter\nLonger travel'}
                      className="border rounded-xl p-3 bg-white"
                    />

                    <textarea
                      rows="7"
                      value={
                        universityForm.documentsText
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'documentsText',
                            e.target.value
                          )
                      }
                      placeholder={'Documents required\nPassport\nNEET scorecard\n10th marksheet\n12th marksheet'}
                      className="border rounded-xl p-3 bg-white"
                    />

                    <textarea
                      rows="7"
                      value={
                        universityForm.admissionText
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'admissionText',
                            e.target.value
                          )
                      }
                      placeholder={'Admission process\nSubmit documents\nUniversity review\nAdmission letter\nVisa'}
                      className="border rounded-xl p-3 bg-white"
                    />

                  </div>

                </section>


                {/* FAQ */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    07 — FAQs
                  </div>

                  <p className="text-[11px] text-ink/50 mt-1">
                    One FAQ per line. Use: Question | Answer
                  </p>

                  <textarea
                    rows="8"
                    value={
                      universityForm.faqsText
                    }
                    onChange={
                      (e) =>
                        changeUniversityField(
                          'faqsText',
                          e.target.value
                        )
                    }
                    placeholder={
                      'Is NEET required? | Yes, qualifying NEET is required.\nIs hostel available? | Yes, university hostel options are available.'
                    }
                    className="mt-3 border rounded-xl p-3 bg-white w-full"
                  />

                </section>


                {/* LINKS */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    08 — Links
                  </div>

                  <div className="mt-4 grid sm:grid-cols-2 gap-4">

                    <input
                      value={
                        universityForm.website
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'website',
                            e.target.value
                          )
                      }
                      placeholder="Official university website"
                      className="border rounded-xl p-3 bg-white"
                    />

                    <input
                      value={
                        universityForm.apply_link
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'apply_link',
                            e.target.value
                          )
                      }
                      placeholder="Apply / consultation link"
                      className="border rounded-xl p-3 bg-white"
                    />

                  </div>

                </section>


                {/* SEO */}

                <section>

                  <div className="text-[10px] uppercase tracking-widest text-coral">
                    09 — Google SEO
                  </div>

                  <div className="mt-4 space-y-4">

                    <input
                      value={
                        universityForm.seo_title
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'seo_title',
                            e.target.value
                          )
                      }
                      placeholder="SEO title"
                      className="border rounded-xl p-3 bg-white w-full"
                    />

                    <textarea
                      rows="3"
                      value={
                        universityForm.meta_description
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'meta_description',
                            e.target.value
                          )
                      }
                      placeholder="Meta description"
                      className="border rounded-xl p-3 bg-white w-full"
                    />

                    <input
                      value={
                        universityForm.keywordsText
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'keywordsText',
                            e.target.value
                          )
                      }
                      placeholder="Keywords separated by commas"
                      className="border rounded-xl p-3 bg-white w-full"
                    />

                  </div>

                </section>


                {/* FEATURED */}

                <section className="rounded-2xl bg-white border border-ink/10 p-5">

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      checked={
                        universityForm.featured
                      }
                      onChange={
                        (e) =>
                          changeUniversityField(
                            'featured',
                            e.target.checked
                          )
                      }
                      className="h-5 w-5"
                    />

                    <div>

                      <div className="font-semibold">
                        Featured University
                      </div>

                      <div className="text-[11px] text-ink/50">
                        Featured universities can later appear prominently on the homepage.
                      </div>

                    </div>

                  </label>

                </section>


                {/* SAVE */}

                <div className="pt-6 border-t border-ink/10 flex flex-wrap gap-3">

                  <button
                    disabled={
                      savingUniversity
                    }
                    onClick={() =>
                      saveUniversity(
                        'draft'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-3 font-semibold disabled:opacity-50"
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
                    className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3 font-bold disabled:opacity-50"
                  >
                    <Globe2 className="h-4 w-4" />
                    Publish University
                  </button>


                  <button
                    onClick={
                      closeUniversityEditor
                    }
                    className="ml-auto px-5 py-3"
                  >
                    Cancel
                  </button>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
