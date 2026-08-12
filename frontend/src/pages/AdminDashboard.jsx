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
  Globe2
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


async function adminFetch(path, options = {}) {
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
    let detail = `Request failed (${response.status})`;

    try {
      const data = await response.json();
      detail = data?.detail || detail;
    } catch {
      // ignore
    }

    const error = new Error(detail);
    error.status = response.status;

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
  const location = useLocation();
  const nav = useNavigate();

  const [user, setUser] = useState(
    location.state?.user || null
  );

  const [checking, setChecking] = useState(
    !location.state?.user
  );

  const [section, setSection] = useState(
    'dashboard'
  );


  // =====================================================
  // LEADS
  // =====================================================

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);

  const [leadTab, setLeadTab] = useState('');
  const [q, setQ] = useState('');

  const [loadingLeads, setLoadingLeads] =
    useState(false);


  // =====================================================
  // NEWSLETTER
  // =====================================================

  const [newsletter, setNewsletter] = useState([]);

  const [loadingNewsletter, setLoadingNewsletter] =
    useState(false);


  // =====================================================
  // BLOGS
  // =====================================================

  const [blogs, setBlogs] = useState([]);

  const [loadingBlogs, setLoadingBlogs] =
    useState(false);

  const [blogEditorOpen, setBlogEditorOpen] =
    useState(false);

  const [editingBlogId, setEditingBlogId] =
    useState(null);

  const [blogForm, setBlogForm] =
    useState(EMPTY_BLOG);

  const [savingBlog, setSavingBlog] =
    useState(false);

  const [blogError, setBlogError] =
    useState('');

  const [slugTouched, setSlugTouched] =
    useState(false);


  // =====================================================
  // AUTH CHECK
  // =====================================================

  useEffect(() => {
    if (user) return;

    (async () => {
      try {
        const u = await me();

        if (!u?.is_admin) {
          nav(
            '/admin/login?e=Not%20authorised',
            { replace: true }
          );

          return;
        }

        setUser(u);

      } catch {
        nav(
          '/admin/login',
          { replace: true }
        );

      } finally {
        setChecking(false);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // =====================================================
  // LOAD LEADS + STATS
  // =====================================================

  const loadLeads = useCallback(async () => {
    if (!user) return;

    setLoadingLeads(true);

    try {
      const [ls, st] =
        await Promise.all([
          adminLeads(
            leadTab || undefined
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
          { replace: true }
        );
      }

    } finally {
      setLoadingLeads(false);
    }
  }, [
    leadTab,
    user,
    nav
  ]);


  useEffect(() => {
    loadLeads();
  }, [loadLeads]);


  // =====================================================
  // LOAD NEWSLETTER
  // =====================================================

  const loadNewsletter = useCallback(async () => {
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
      if (
        e?.response?.status === 401 ||
        e?.response?.status === 403
      ) {
        nav(
          '/admin/login',
          { replace: true }
        );
      }

    } finally {
      setLoadingNewsletter(false);
    }
  }, [
    user,
    nav
  ]);


  // =====================================================
  // LOAD BLOGS
  // =====================================================

  const loadBlogs = useCallback(async () => {
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
          { replace: true }
        );
      }

    } finally {
      setLoadingBlogs(false);
    }
  }, [
    user,
    nav
  ]);


  useEffect(() => {
    if (!user) return;

    loadNewsletter();
    loadBlogs();

  }, [
    user,
    loadNewsletter,
    loadBlogs
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
  // DASHBOARD BLOG COUNTS
  // =====================================================

  const publishedBlogCount =
    blogs.filter(
      (blog) =>
        blog.status === 'published'
    ).length;


  const draftBlogCount =
    blogs.filter(
      (blog) =>
        blog.status === 'draft'
    ).length;


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
              lead.message || ''
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
        { replace: true }
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
              (block) =>
                block.type !== 'image'
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


  const changeBlogField = (
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


  const handleTitleChange = (
    value
  ) => {
    setBlogForm(
      (old) => ({
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


  const updateBodyBlock = (
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


  const addBodyBlock = (
    type
  ) => {
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


  const removeBodyBlock = (
    index
  ) => {
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


  const moveBodyBlock = (
    index,
    direction
  ) => {
    setBlogForm(
      (old) => {

        const body = [
          ...old.body
        ];

        const nextIndex =
          index + direction;

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


  // =====================================================
  // SAVE BLOG
  // =====================================================

  const saveBlog = async (
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
                block.text || ''
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
                block.text || ''
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
                  block.items || []
                )
                  .map(
                    (x) =>
                      String(
                        x || ''
                      ).trim()
                  )
                  .filter(Boolean)
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
          .filter(Boolean),

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
      console.error(
        'Save blog error:',
        e
      );

      setBlogError(
        e.message ||
        'Could not save blog.'
      );

    } finally {
      setSavingBlog(false);
    }
  };


  // =====================================================
  // PUBLISH / UNPUBLISH
  // =====================================================

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
            method: 'PUT',

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


  // =====================================================
  // DELETE BLOG
  // =====================================================

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
  // LOADING AUTH
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
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-cream text-ink">


      {/* =============================================== */}
      {/* HEADER */}
      {/* =============================================== */}

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
                src={user.picture}
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
              onClick={signOut}
              className="inline-flex items-center gap-1 rounded-full border border-cream/25 px-3 py-1.5 text-[12px] font-semibold hover:bg-cream/10"
            >

              <LogOut className="h-3.5 w-3.5" />

              Sign out

            </button>

          </div>

        </div>

      </header>


      {/* =============================================== */}
      {/* NAVIGATION */}
      {/* =============================================== */}

      <div className="border-b border-ink/10 bg-white sticky top-[57px] z-30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-1 overflow-x-auto">

          {[
            {
              key:
                'dashboard',
              label:
                'Dashboard',
              icon:
                LayoutDashboard
            },

            {
              key:
                'leads',
              label:
                'Leads',
              icon:
                Users
            },

            {
              key:
                'newsletter',
              label:
                'Newsletter',
              icon:
                Mail
            },

            {
              key:
                'blogs',
              label:
                'Blogs',
              icon:
                BookOpen
            }

          ].map((item) => {

            const Icon =
              item.icon;

            return (
              <button
                key={item.key}
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
          })}

        </div>

      </div>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">


        {/* =============================================== */}
        {/* DASHBOARD */}
        {/* =============================================== */}

        {section ===
          'dashboard' && (

          <>

            <div className="flex items-end justify-between gap-4">

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
                }}
                className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2 text-[12px] font-semibold"
              >

                <RefreshCw className="h-4 w-4" />

                Refresh

              </button>

            </div>


            <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3">

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
                    'Published Blogs',

                  value:
                    publishedBlogCount,

                  icon:
                    BookOpen
                }

              ].map((card) => {

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
              })}

            </div>


            <div className="mt-5 grid lg:grid-cols-2 gap-5">

              <div className="rounded-3xl bg-white border border-ink/10 p-6">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Leads
                    </div>

                    <h2 className="serif text-2xl mt-1">
                      Lead breakdown
                    </h2>

                  </div>

                  <button
                    onClick={() =>
                      setSection(
                        'leads'
                      )
                    }
                    className="text-[12px] font-semibold hover:text-coral"
                  >
                    View all →
                  </button>

                </div>


                <div className="mt-5 grid grid-cols-2 gap-2">

                  {Object.entries(
                    stats?.by_type ||
                    {}
                  ).map(
                    ([key, value]) => (

                      <div
                        key={key}
                        className="rounded-2xl bg-cream p-4"
                      >

                        <div className="text-[10px] mono uppercase tracking-widest text-ink/50">
                          {key}
                        </div>

                        <div className="serif text-3xl mt-1">
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
                  Publish your next article.
                </h2>

                <p className="mt-2 text-[13px] text-cream/60">
                  Blogs are saved directly to MongoDB.
                  No GitHub editing required.
                </p>


                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl border border-cream/10 p-4">

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/50">
                      Published
                    </div>

                    <div className="serif text-4xl mt-1">
                      {publishedBlogCount}
                    </div>

                  </div>


                  <div className="rounded-2xl border border-cream/10 p-4">

                    <div className="text-[10px] mono uppercase tracking-widest text-cream/50">
                      Drafts
                    </div>

                    <div className="serif text-4xl mt-1">
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
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
                >

                  <Plus className="h-4 w-4" />

                  New Blog

                </button>

              </div>

            </div>

          </>

        )}


        {/* =============================================== */}
        {/* LEADS */}
        {/* =============================================== */}

        {section ===
          'leads' && (

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
                        leadTab ===
                        tab.k
                          ? 'bg-ink text-cream'
                          : 'text-ink/60 hover:text-ink'
                      }`}
                    >
                      {tab.l}
                    </button>

                  )
                )}

              </div>


              <div className="ml-auto flex flex-wrap items-center gap-2">

                <div className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5">

                  <Filter className="h-3.5 w-3.5 text-ink/50" />

                  <input
                    value={q}
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
                  className="inline-flex items-center gap-1 rounded-full border border-ink/15 bg-white px-3 py-1.5 text-[12px] font-semibold"
                >

                  <Copy className="h-3.5 w-3.5" />

                  Copy CSV

                </button>


                <button
                  onClick={
                    loadLeads
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-ink text-cream px-3 py-1.5 text-[12px] font-semibold"
                >

                  <RefreshCw className={`h-3.5 w-3.5 ${
                    loadingLeads
                      ? 'animate-spin'
                      : ''
                  }`} />

                  Refresh

                </button>

              </div>

            </div>


            <div className="mt-4 rounded-3xl border border-ink/10 bg-white overflow-x-auto">

              <div className="min-w-[1000px]">

                <div className="grid grid-cols-12 px-5 py-3 bg-cream/60 text-[10px] mono uppercase tracking-widest text-ink/60 border-b border-ink/10">

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

                  <div className="px-5 py-10 text-center text-ink/50 text-[13px]">
                    Loading…
                  </div>

                )}


                {!loadingLeads &&
                  filteredLeads.length ===
                    0 && (

                    <div className="px-5 py-10 text-center text-ink/50 text-[13px]">
                      No leads yet.
                    </div>

                  )}


                <div className="divide-y divide-ink/5">

                  {filteredLeads.map(
                    (lead) => (

                      <div
                        key={
                          lead.id
                        }
                        className="grid grid-cols-12 px-5 py-4 items-start hover:bg-cream/30"
                      >

                        <div className="col-span-3">

                          <div className="font-semibold text-[14px]">
                            {lead.name}
                          </div>

                          <div className="text-[10px] mono text-ink/40">
                            {lead.id?.slice(
                              0,
                              8
                            )}
                          </div>

                        </div>


                        <div className="col-span-2 text-[13px]">

                          {lead.phone &&
                            lead.phone !==
                              '-' && (

                              <a
                                href={`tel:${lead.phone}`}
                                className="flex items-center gap-1 hover:text-coral"
                              >

                                <Phone className="h-3 w-3" />

                                {lead.phone}

                              </a>

                            )}


                          {lead.email && (

                            <a
                              href={`mailto:${lead.email}`}
                              className="mt-1 flex items-center gap-1 hover:text-coral"
                            >

                              <Mail className="h-3 w-3" />

                              {lead.email}

                            </a>

                          )}

                        </div>


                        <div className="col-span-2 text-[13px]">

                          <div>
                            {lead.country ||
                              '—'}
                          </div>

                          <div className="text-[10px] mono text-ink/40">
                            NEET:{' '}
                            {lead.neet_score ||
                              '—'}
                          </div>

                        </div>


                        <div className="col-span-2">

                          <span className="inline-flex rounded-full bg-cream border border-ink/10 text-[10px] font-bold uppercase px-2 py-0.5">
                            {lead.type}
                          </span>

                          <div className="text-[11px] text-ink/50 mt-1">
                            {lead.source ||
                              '—'}
                          </div>

                        </div>


                        <div className="col-span-2 text-[12px] text-ink/70">
                          {lead.message ||
                            '—'}
                        </div>


                        <div className="col-span-1 text-right text-[11px] text-ink/50">

                          {fmt(
                            lead.created_at
                          )}


                          {lead.phone &&
                            lead.phone !==
                              '-' && (

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
                                  className="inline-flex items-center gap-1 text-emerald-700 font-semibold"
                                >

                                  <Send className="h-3 w-3" />

                                  WhatsApp

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


        {/* =============================================== */}
        {/* NEWSLETTER */}
        {/* =============================================== */}

        {section ===
          'newsletter' && (

          <>

            <div className="flex flex-wrap items-end justify-between gap-4">

              <div>

                <div className="text-[10px] mono uppercase tracking-widest text-coral">
                  Audience
                </div>

                <h1 className="serif text-4xl mt-1">
                  Newsletter subscribers.
                </h1>

              </div>


              <div className="flex gap-2">

                <button
                  onClick={
                    copyNewsletter
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-4 py-2 text-[12px] font-semibold"
                >

                  <Copy className="h-4 w-4" />

                  Copy Emails

                </button>


                <button
                  onClick={
                    loadNewsletter
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-ink text-cream px-4 py-2 text-[12px] font-semibold"
                >

                  <RefreshCw className={`h-4 w-4 ${
                    loadingNewsletter
                      ? 'animate-spin'
                      : ''
                  }`} />

                  Refresh

                </button>

              </div>

            </div>


            <div className="mt-6 rounded-3xl bg-white border border-ink/10 overflow-hidden">

              {loadingNewsletter && (

                <div className="py-12 text-center text-ink/50">
                  Loading…
                </div>

              )}


              {!loadingNewsletter &&
                newsletter.length ===
                  0 && (

                  <div className="py-12 text-center text-ink/50">
                    No newsletter subscribers yet.
                  </div>

                )}


              <div className="divide-y divide-ink/5">

                {newsletter.map(
                  (item) => (

                    <div
                      key={
                        item.id ||
                        item.email
                      }
                      className="px-5 py-4 flex flex-wrap items-center gap-4"
                    >

                      <div className="h-10 w-10 rounded-full bg-coral/10 text-coral grid place-items-center">

                        <Mail className="h-4 w-4" />

                      </div>


                      <div>

                        <a
                          href={`mailto:${item.email}`}
                          className="font-semibold text-[14px] hover:text-coral"
                        >
                          {item.email}
                        </a>

                        <div className="text-[11px] text-ink/40 mt-0.5">
                          {item.source ||
                            'website'}
                        </div>

                      </div>


                      <div className="ml-auto text-[11px] text-ink/50">
                        {fmt(
                          item.created_at
                        )}
                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </>

        )}


        {/* =============================================== */}
        {/* BLOG MANAGER */}
        {/* =============================================== */}

        {section ===
          'blogs' && (

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
                  Create, edit, publish and delete articles without touching GitHub.
                </p>

              </div>


              <button
                onClick={
                  openNewBlog
                }
                className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-5 py-3 text-[13px] font-bold"
              >

                <Plus className="h-4 w-4" />

                New Blog

              </button>

            </div>


            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">

              <div className="rounded-3xl bg-white border border-ink/10 p-5">

                <div className="text-[10px] mono uppercase tracking-widest text-ink/50">
                  Total
                </div>

                <div className="serif text-4xl mt-2">
                  {blogs.length}
                </div>

              </div>


              <div className="rounded-3xl bg-white border border-ink/10 p-5">

                <div className="text-[10px] mono uppercase tracking-widest text-ink/50">
                  Published
                </div>

                <div className="serif text-4xl mt-2">
                  {publishedBlogCount}
                </div>

              </div>


              <div className="rounded-3xl bg-white border border-ink/10 p-5">

                <div className="text-[10px] mono uppercase tracking-widest text-ink/50">
                  Drafts
                </div>

                <div className="serif text-4xl mt-2">
                  {draftBlogCount}
                </div>

              </div>

            </div>


            {blogError &&
              !blogEditorOpen && (

                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 text-red-700 px-5 py-4 text-[13px]">
                  {blogError}
                </div>

              )}


            <div className="mt-6 rounded-3xl bg-white border border-ink/10 overflow-hidden">

              <div className="px-5 py-4 flex items-center justify-between border-b border-ink/10">

                <div className="font-semibold">
                  All Articles
                </div>

                <button
                  onClick={
                    loadBlogs
                  }
                  className="inline-flex items-center gap-1 text-[12px] font-semibold"
                >

                  <RefreshCw className={`h-3.5 w-3.5 ${
                    loadingBlogs
                      ? 'animate-spin'
                      : ''
                  }`} />

                  Refresh

                </button>

              </div>


              {loadingBlogs && (

                <div className="py-12 text-center text-ink/50">
                  Loading blogs…
                </div>

              )}


              {!loadingBlogs &&
                blogs.length ===
                  0 && (

                  <div className="py-16 px-6 text-center">

                    <BookOpen className="h-10 w-10 mx-auto text-coral" />

                    <h3 className="serif text-2xl mt-3">
                      No blogs yet.
                    </h3>

                    <p className="mt-2 text-[13px] text-ink/50">
                      Create your first RYC Journal article.
                    </p>

                    <button
                      onClick={
                        openNewBlog
                      }
                      className="mt-5 rounded-full bg-ink text-cream px-5 py-2.5 text-[13px] font-semibold"
                    >
                      Create first blog
                    </button>

                  </div>

                )}


              <div className="divide-y divide-ink/5">

                {blogs.map(
                  (blog) => (

                    <div
                      key={
                        blog.id
                      }
                      className="p-5 flex flex-col md:flex-row md:items-center gap-4"
                    >


                      {/* DEFAULT BLOG IMAGE */}

                      <div className="w-full md:w-32 h-20 rounded-xl bg-cream overflow-hidden shrink-0">

                        <img
                          src="/blog-default.png"
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />

                      </div>


                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            blog.status ===
                            'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {blog.status}
                          </span>

                          <span className="text-[10px] mono uppercase tracking-widest text-ink/40">
                            {blog.category}
                          </span>

                        </div>


                        <div className="serif text-xl mt-2 truncate">
                          {blog.title}
                        </div>


                        <div className="text-[11px] text-ink/40 mt-1">
                          /blog/{blog.slug}
                          {' · '}
                          Updated{' '}
                          {fmt(
                            blog.updated_at
                          )}
                        </div>

                      </div>


                      <div className="flex flex-wrap gap-2">

                        {blog.status ===
                          'published' && (

                          <Link
                            to={`/blog/${blog.slug}`}
                            target="_blank"
                            className="h-9 w-9 rounded-full border border-ink/10 grid place-items-center hover:bg-cream"
                            title="View"
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
                          className="h-9 w-9 rounded-full border border-ink/10 grid place-items-center hover:bg-cream"
                          title="Edit"
                        >

                          <Pencil className="h-4 w-4" />

                        </button>


                        <button
                          onClick={() =>
                            toggleBlogStatus(
                              blog
                            )
                          }
                          className={`rounded-full px-3 py-2 text-[11px] font-semibold ${
                            blog.status ===
                            'published'
                              ? 'border border-ink/15'
                              : 'bg-ink text-cream'
                          }`}
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
                          className="h-9 w-9 rounded-full border border-red-200 text-red-600 grid place-items-center hover:bg-red-50"
                          title="Delete"
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


      {/* =============================================== */}
      {/* BLOG EDITOR MODAL */}
      {/* =============================================== */}

      {blogEditorOpen && (

        <div className="fixed inset-0 z-[100] bg-black/60 overflow-y-auto">

          <div className="min-h-screen py-6 px-3 sm:px-6">

            <div className="max-w-5xl mx-auto bg-cream rounded-3xl overflow-hidden shadow-2xl">


              {/* EDITOR HEADER */}

              <div className="sticky top-0 z-20 bg-ink text-cream px-5 sm:px-7 py-4 flex items-center gap-4">

                <div>

                  <div className="text-[10px] mono uppercase tracking-widest text-coral">
                    RYC Journal
                  </div>

                  <div className="serif text-xl">
                    {editingBlogId
                      ? 'Edit Blog'
                      : 'New Blog'}
                  </div>

                </div>


                <button
                  onClick={
                    closeBlogEditor
                  }
                  className="ml-auto h-9 w-9 rounded-full border border-cream/20 grid place-items-center"
                >

                  <X className="h-4 w-4" />

                </button>

              </div>


              <div className="p-5 sm:p-7">


                {blogError && (

                  <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-[13px]">
                    {blogError}
                  </div>

                )}


                {/* MAIN DETAILS */}

                <div className="grid sm:grid-cols-2 gap-4">

                  <div className="sm:col-span-2">

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      Blog Title *
                    </label>

                    <input
                      value={
                        blogForm.title
                      }
                      onChange={(e) =>
                        handleTitleChange(
                          e.target.value
                        )
                      }
                      placeholder="Example: NEET 2026 Qualifying Marks Explained"
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[15px] focus:outline-none focus:border-coral"
                    />

                  </div>


                  <div className="sm:col-span-2">

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      URL Slug
                    </label>

                    <div className="mt-2 flex items-center rounded-xl border border-ink/15 bg-white overflow-hidden">

                      <div className="px-3 text-[12px] text-ink/40">
                        /blog/
                      </div>

                      <input
                        value={
                          blogForm.slug
                        }
                        onChange={(e) => {
                          setSlugTouched(
                            true
                          );

                          changeBlogField(
                            'slug',
                            slugify(
                              e.target.value
                            )
                          );
                        }}
                        className="flex-1 py-3 pr-4 text-[13px] focus:outline-none"
                      />

                    </div>

                  </div>


                  <div>

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      Category *
                    </label>

                    <input
                      value={
                        blogForm.category
                      }
                      onChange={(e) =>
                        changeBlogField(
                          'category',
                          e.target.value
                        )
                      }
                      placeholder="MBBS / NEET / Georgia"
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                    />

                  </div>


                  <div>

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      Author
                    </label>

                    <input
                      value={
                        blogForm.author
                      }
                      onChange={(e) =>
                        changeBlogField(
                          'author',
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                    />

                  </div>


                  <div>

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      Read Time
                    </label>

                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={
                        blogForm.read_time
                      }
                      onChange={(e) =>
                        changeBlogField(
                          'read_time',
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                    />

                  </div>


                  <div>

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      CTA
                    </label>

                    <select
                      value={
                        blogForm.cta
                      }
                      onChange={(e) =>
                        changeBlogField(
                          'cta',
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                    >

                      <option value="mbbs">
                        MBBS
                      </option>

                      <option value="georgia">
                        Georgia
                      </option>

                      <option value="italy">
                        Italy
                      </option>

                      <option value="management">
                        Management
                      </option>

                      <option value="quiz">
                        Course Finder Quiz
                      </option>

                    </select>

                  </div>


                  <div className="sm:col-span-2">

                    <div className="rounded-2xl bg-white border border-ink/10 p-4 flex items-center gap-4">

                      <img
                        src="/blog-default.png"
                        alt="Default blog"
                        className="h-16 w-24 object-cover rounded-xl"
                      />

                      <div>

                        <div className="text-[10px] mono uppercase tracking-widest text-coral">
                          Blog Image
                        </div>

                        <div className="text-[13px] font-semibold mt-1">
                          Default RYC image
                        </div>

                        <div className="text-[11px] text-ink/50 mt-1">
                          Used automatically on every blog.
                        </div>

                      </div>

                    </div>

                  </div>


                  <div className="sm:col-span-2">

                    <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                      Short Description / Excerpt *
                    </label>

                    <textarea
                      rows="3"
                      value={
                        blogForm.excerpt
                      }
                      onChange={(e) =>
                        changeBlogField(
                          'excerpt',
                          e.target.value
                        )
                      }
                      placeholder="Short summary shown on the blog card..."
                      className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px] resize-y"
                    />

                  </div>

                </div>


                {/* ===================================== */}
                {/* ARTICLE BUILDER */}
                {/* ===================================== */}

                <div className="mt-8 border-t border-ink/10 pt-7">

                  <div>

                    <div className="text-[10px] mono uppercase tracking-widest text-coral">
                      Article Builder
                    </div>

                    <h3 className="serif text-2xl mt-1">
                      Article content
                    </h3>

                  </div>


                  <div className="mt-4 flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={() =>
                        addBodyBlock(
                          'heading'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-2 text-[12px] font-semibold"
                    >

                      <Heading2 className="h-4 w-4" />

                      Heading

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        addBodyBlock(
                          'paragraph'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-2 text-[12px] font-semibold"
                    >

                      <FileText className="h-4 w-4" />

                      Paragraph

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        addBodyBlock(
                          'list'
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-2 text-[12px] font-semibold"
                    >

                      <List className="h-4 w-4" />

                      Bullet List

                    </button>

                  </div>


                  <div className="mt-5 space-y-4">

                    {blogForm.body.length ===
                      0 && (

                      <div className="rounded-2xl border border-dashed border-ink/20 py-10 text-center text-[13px] text-ink/50">
                        Add a heading, paragraph or bullet list above.
                      </div>

                    )}


                    {blogForm.body.map(
                      (
                        block,
                        index
                      ) => (

                        <div
                          key={index}
                          className="rounded-2xl bg-white border border-ink/10 p-4"
                        >

                          <div className="flex items-center gap-2 mb-3">

                            <span className="text-[10px] mono uppercase tracking-widest text-coral">
                              {block.type}
                            </span>


                            <div className="ml-auto flex gap-1">

                              <button
                                type="button"
                                onClick={() =>
                                  moveBodyBlock(
                                    index,
                                    -1
                                  )
                                }
                                className="rounded-lg border border-ink/10 px-2 py-1 text-[11px]"
                              >
                                ↑
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  moveBodyBlock(
                                    index,
                                    1
                                  )
                                }
                                className="rounded-lg border border-ink/10 px-2 py-1 text-[11px]"
                              >
                                ↓
                              </button>


                              <button
                                type="button"
                                onClick={() =>
                                  removeBodyBlock(
                                    index
                                  )
                                }
                                className="rounded-lg border border-red-200 text-red-600 px-2 py-1"
                              >

                                <Trash2 className="h-3.5 w-3.5" />

                              </button>

                            </div>

                          </div>


                          {block.type ===
                            'heading' && (

                            <input
                              value={
                                block.text ||
                                ''
                              }
                              onChange={(e) =>
                                updateBodyBlock(
                                  index,
                                  {
                                    text:
                                      e.target.value
                                  }
                                )
                              }
                              placeholder="Section heading"
                              className="w-full rounded-xl border border-ink/15 px-4 py-3 text-[15px]"
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
                              onChange={(e) =>
                                updateBodyBlock(
                                  index,
                                  {
                                    text:
                                      e.target.value
                                  }
                                )
                              }
                              placeholder="Write your paragraph here..."
                              className="w-full rounded-xl border border-ink/15 px-4 py-3 text-[14px] leading-relaxed"
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
                                ).join(
                                  '\n'
                                )
                              }
                              onChange={(e) =>
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
                              placeholder={
                                'One bullet per line\nSecond bullet\nThird bullet'
                              }
                              className="w-full rounded-xl border border-ink/15 px-4 py-3 text-[14px]"
                            />

                          )}

                        </div>

                      )
                    )}

                  </div>

                </div>


                {/* ===================================== */}
                {/* SEO */}
                {/* ===================================== */}

                <div className="mt-8 border-t border-ink/10 pt-7">

                  <div className="flex items-center gap-2">

                    <Globe2 className="h-4 w-4 text-coral" />

                    <div>

                      <div className="text-[10px] mono uppercase tracking-widest text-coral">
                        Google SEO
                      </div>

                      <h3 className="serif text-2xl">
                        Search settings
                      </h3>

                    </div>

                  </div>


                  <div className="mt-4 space-y-4">

                    <div>

                      <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                        SEO Title
                      </label>

                      <input
                        value={
                          blogForm.seo_title
                        }
                        onChange={(e) =>
                          changeBlogField(
                            'seo_title',
                            e.target.value
                          )
                        }
                        placeholder={blogForm.title}
                        className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                      />

                    </div>


                    <div>

                      <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                        Meta Description
                      </label>

                      <textarea
                        rows="3"
                        value={
                          blogForm.meta_description
                        }
                        onChange={(e) =>
                          changeBlogField(
                            'meta_description',
                            e.target.value
                          )
                        }
                        placeholder="Google search description..."
                        className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                      />

                    </div>


                    <div>

                      <label className="text-[10px] mono uppercase tracking-widest text-ink/50">
                        Keywords
                      </label>

                      <input
                        value={
                          blogForm.keywordsText
                        }
                        onChange={(e) =>
                          changeBlogField(
                            'keywordsText',
                            e.target.value
                          )
                        }
                        placeholder="NEET 2026, MBBS abroad, Georgia MBBS"
                        className="mt-2 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-[13px]"
                      />

                      <div className="text-[10px] text-ink/40 mt-1">
                        Separate keywords with commas.
                      </div>

                    </div>

                  </div>

                </div>


                {/* ===================================== */}
                {/* SAVE */}
                {/* ===================================== */}

                <div className="mt-8 pt-6 border-t border-ink/10 flex flex-wrap gap-3">

                  <button
                    disabled={
                      savingBlog
                    }
                    onClick={() =>
                      saveBlog(
                        'draft'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-3 text-[13px] font-semibold disabled:opacity-50"
                  >

                    <Save className="h-4 w-4" />

                    {savingBlog
                      ? 'Saving…'
                      : 'Save Draft'}

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
                    className="inline-flex items-center gap-2 rounded-full bg-coral text-white px-6 py-3 text-[13px] font-bold disabled:opacity-50"
                  >

                    <Globe2 className="h-4 w-4" />

                    {savingBlog
                      ? 'Publishing…'
                      : 'Publish Blog'}

                  </button>


                  <button
                    onClick={
                      closeBlogEditor
                    }
                    className="ml-auto rounded-full px-5 py-3 text-[13px] font-semibold text-ink/60"
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
