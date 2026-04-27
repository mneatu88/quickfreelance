import { useState, useEffect, useMemo, useCallback, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FolderOpen,
  FileText,
  Users,
  TrendingUp,
  Sparkles,
  Store,
  Star,
  Mail,
  Pencil,
  Trash2,
  ChevronRight,
  Search,
  Upload,
  Download,
  UserPlus,
  Loader2,
  BarChart3,
  Gift,
  Linkedin,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/DashboardLayout';
import UpgradeBanner from '@/components/dashboard/UpgradeBanner';
import SellerDashboardHome from '@/components/dashboard/SellerDashboardHome';
import InvoiceForm from '@/components/dashboard/InvoiceForm';
import InvoiceList from '@/components/dashboard/InvoiceList';
import EditProjectModal from '@/components/dashboard/EditProjectModal';
import DeleteProjectDialog from '@/components/dashboard/DeleteProjectDialog';
import ProjectFiles from '@/components/dashboard/ProjectFiles';
import AnimatedCounter from '@/components/dashboard/AnimatedCounter';
import CreateGigModal from '@/components/dashboard/CreateGigModal';
import SellerOrders from '@/components/dashboard/SellerOrders';
import InboxMessages from '@/components/dashboard/InboxMessages';
import LifeAdminAI from '@/components/dashboard/LifeAdminAI';
import MyCourses from '@/components/dashboard/MyCourses';
import MyLearning from '@/components/dashboard/MyLearning';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Project {
  id: string;
  name: string;
  description: string | null;
  client_email: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceMetric {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  client_id: string | null;
}

interface GlobalFile {
  id: string;
  project_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  created_at: string;
}

interface ClientSummary {
  email: string;
  activeProjects: number;
  totalProjects: number;
  lastActivity: string;
}

type DashboardTab = 'dashboard' | 'projects' | 'invoices' | 'clients' | 'files' | 'reports' | 'team' | 'gigs' | 'orders' | 'messages' | 'life-admin' | 'referrals' | 'courses' | 'learning';

const tabs: DashboardTab[] = ['dashboard', 'projects', 'invoices', 'clients', 'files', 'reports', 'team', 'gigs', 'orders', 'messages', 'life-admin', 'referrals', 'courses', 'learning'];
const ease = [0.16, 1, 0.3, 1] as const;

const statusConfig: Record<string, { color: string; label: string; progress: number; dot: string }> = {
  active: { color: 'bg-secondary text-secondary-foreground border-border', label: 'Active', progress: 25, dot: 'bg-primary' },
  in_progress: { color: 'bg-accent text-accent-foreground border-border', label: 'In Progress', progress: 60, dot: 'bg-primary' },
  completed: { color: 'bg-primary/10 text-primary border-primary/20', label: 'Completed', progress: 100, dot: 'bg-primary' },
  paused: { color: 'bg-muted text-muted-foreground border-border', label: 'Paused', progress: 40, dot: 'bg-muted-foreground' },
};

const avatarColors = [
  'bg-primary/15 text-primary',
  'bg-accent text-accent-foreground',
  'bg-secondary text-secondary-foreground',
  'bg-muted text-muted-foreground',
];

function GigsTab({ userId }: { userId?: string }) {
  const { toast: gigToast } = useToast();
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editGig, setEditGig] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteGig, setDeleteGig] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchGigs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('gigs')
      .select('*')
      .eq('seller_id', userId)
      .order('created_at', { ascending: false });
    setGigs(data || []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const openEdit = (gig: any) => {
    setEditGig(gig);
    setEditTitle(gig.title);
    setEditDesc(gig.description || '');
    setEditCategory(gig.category || 'other');
    setEditActive(gig.is_active ?? true);
  };

  const handleEditSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!editGig) return;
    setSaving(true);
    const { error } = await supabase.from('gigs').update({
      title: editTitle,
      description: editDesc || null,
      category: editCategory as any,
      is_active: editActive,
      updated_at: new Date().toISOString(),
    }).eq('id', editGig.id);
    if (error) {
      gigToast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      gigToast({ title: 'Gig updated ✓' });
      setEditGig(null);
      fetchGigs();
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteGig) return;
    setDeleting(true);
    // Delete related data first
    await Promise.all([
      supabase.from('gig_packages').delete().eq('gig_id', deleteGig.id),
      supabase.from('gig_images').delete().eq('gig_id', deleteGig.id),
      supabase.from('gig_faqs').delete().eq('gig_id', deleteGig.id),
    ]);
    const { error } = await supabase.from('gigs').delete().eq('id', deleteGig.id);
    if (error) {
      gigToast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
    } else {
      gigToast({ title: 'Gig deleted' });
      setDeleteGig(null);
      fetchGigs();
    }
    setDeleting(false);
  };

  const categories = [
    'web-development', 'logo-design', 'social-media-marketing', 'ai-services',
    'video-editing', 'copywriting', 'book-cover-design', 'graphic-design',
    'mobile-apps', 'seo', 'translation', 'data-entry', 'virtual-assistant', 'other',
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Your Gigs</h3>
        <Button onClick={() => setShowCreate(true)} className="gap-2 active:scale-[0.97]">
          <Plus className="h-4 w-4" /> Create New Gig
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <Skeleton className="h-5 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : gigs.length === 0 ? (
        <div className="glass rounded-2xl p-14 text-center">
          <Store className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No gigs yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first gig to start selling on the marketplace.</p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Your First Gig
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gigs.map((gig) => (
            <motion.div
              key={gig.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl p-5 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.12)] transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-foreground line-clamp-2 flex-1 mr-2">{gig.title}</h4>
                <Badge variant="outline" className={gig.is_active ? 'bg-primary/10 text-primary border-primary/20' : 'bg-muted text-muted-foreground'}>
                  {gig.is_active ? 'Active' : 'Paused'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground capitalize mb-2">{(gig.category || '').replace('-', ' ')}</p>
              <div className="flex items-center gap-2 text-sm mb-3">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="tabular-nums font-medium">{Number(gig.rating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({gig.review_count || 0} reviews)</span>
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-border/20">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => openEdit(gig)}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive" onClick={() => setDeleteGig(gig)}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <CreateGigModal open={showCreate} onOpenChange={setShowCreate} onCreated={fetchGigs} />

      {/* Edit Gig Modal */}
      <Dialog open={!!editGig} onOpenChange={(open) => { if (!open) setEditGig(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" /> Edit Gig
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSave} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Title</Label>
              <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c.replace(/-/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={editActive ? 'active' : 'paused'} onValueChange={v => setEditActive(v === 'active')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditGig(null)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Gig Confirmation */}
      <Dialog open={!!deleteGig} onOpenChange={(open) => { if (!open) setDeleteGig(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-4 w-4" /> Delete Gig
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong className="text-foreground">"{deleteGig?.title}"</strong>? This will also remove all packages, images, and FAQs. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGig(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="gap-2">
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              {deleting ? 'Deleting...' : 'Delete Gig'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ReferralDashboardSection() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ invited: 0, signedUp: 0, monthsEarned: 0 });

  const referralCode = user?.id?.slice(0, 8) || "guest";
  const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;

  useEffect(() => {
    if (user) fetchReferralStats();
  }, [user]);

  const fetchReferralStats = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("referrals" as any)
        .select("id, status, reward_granted")
        .eq("referrer_id", user.id);
      if (!error && data) {
        const all = data as any[];
        const completed = all.filter((r: any) => r.status === "completed");
        setStats({
          invited: all.length,
          signedUp: completed.length,
          monthsEarned: completed.filter((r: any) => r.reward_granted).length,
        });
      }
    } catch {}
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareText = "Join me on QuickFreelance — the easiest way to hire freelancers or sell your services. Sign up with my link and we both get 1 month FREE at Starter plan! 🚀";

  const shareLinks = [
    { label: "LinkedIn", icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}` },
    { label: "X (Twitter)", icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(referralLink)}` },
    { label: "Email", icon: Mail, href: `mailto:?subject=${encodeURIComponent("Join QuickFreelance — 1 month FREE!")}&body=${encodeURIComponent(shareText + "\n\n" + referralLink)}` },
    { label: "WhatsApp", icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(shareText + " " + referralLink)}` },
  ];

  return (
    <section className="space-y-6">
      <div className="glass rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-lg">Your Referral Link</h3>
            <p className="text-sm text-muted-foreground">Share and both get 1 month FREE at Starter plan (£9.99 value)</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input readOnly value={referralLink} className="text-xs bg-muted/50 font-mono" />
          <Button onClick={handleCopy} size="sm" className="shrink-0 gap-1.5 min-w-[100px]">
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground mb-2">Share via</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {shareLinks.map((s) => (
              <Button key={s.label} variant="outline" size="sm" className="gap-2 text-xs" asChild>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  <s.icon className="h-4 w-4" />
                  {s.label}
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 text-center">
          <Users className="h-5 w-5 mx-auto text-muted-foreground mb-2" />
          <p className="text-3xl font-bold tabular-nums text-foreground">{stats.invited}</p>
          <p className="text-sm text-muted-foreground">Friends Invited</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <UserPlus className="h-5 w-5 mx-auto text-primary mb-2" />
          <p className="text-3xl font-bold tabular-nums text-foreground">{stats.signedUp}</p>
          <p className="text-sm text-muted-foreground">Successful Signups</p>
        </div>
        <div className="glass rounded-2xl p-5 text-center col-span-2 md:col-span-1">
          <Gift className="h-5 w-5 mx-auto text-emerald-500 mb-2" />
          <p className="text-3xl font-bold tabular-nums text-foreground">{stats.monthsEarned}</p>
          <p className="text-sm text-muted-foreground">Months Earned</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Maximum 10 successful referrals per account · Rewards applied automatically · Both you and your friend get 1 month free at Starter plan
      </p>
    </section>
  );
}


const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { tier, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [invoiceMetrics, setInvoiceMetrics] = useState<InvoiceMetric[]>([]);
  const [stats, setStats] = useState({ projects: 0, invoices: 0, clients: 0, revenue: 0 });

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectStatus, setProjectStatus] = useState('active');
  const [clientEmail, setClientEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);

  const [globalFiles, setGlobalFiles] = useState<GlobalFile[]>([]);
  const [loadingGlobalFiles, setLoadingGlobalFiles] = useState(false);
  const [globalFileQuery, setGlobalFileQuery] = useState('');
  const [selectedUploadProject, setSelectedUploadProject] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const rawTab = searchParams.get('tab') ?? 'dashboard';
  const currentTab: DashboardTab = tabs.includes(rawTab as DashboardTab) ? (rawTab as DashboardTab) : 'dashboard';

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoadingProjects(true);
    const { data } = await supabase
      .from('projects')
      .select('id, name, description, client_email, status, created_at, updated_at')
      .eq('freelancer_id', user.id)
      .order('updated_at', { ascending: false });
    setProjects((data as Project[]) ?? []);
    setLoadingProjects(false);
  }, [user]);

  const fetchStatsAndMetrics = useCallback(async () => {
    if (!user) return;
    setLoadingStats(true);
    const [projectsRes, pendingInvoicesRes, paidInvoicesRes, metricsRes] = await Promise.all([
      supabase.from('projects').select('id, client_id', { count: 'exact' }).eq('freelancer_id', user.id),
      supabase.from('invoices').select('id', { count: 'exact' }).eq('freelancer_id', user.id).eq('status', 'pending'),
      supabase.from('invoices').select('amount').eq('freelancer_id', user.id).eq('status', 'paid'),
      supabase.from('invoices').select('id, amount, status, created_at, client_id').eq('freelancer_id', user.id),
    ]);

    const uniqueClients = new Set((projectsRes.data ?? []).map((project) => project.client_id).filter(Boolean));
    const totalRevenue = (paidInvoicesRes.data ?? []).reduce((sum, invoice) => sum + Number(invoice.amount), 0);

    setStats({
      projects: projectsRes.count ?? 0,
      invoices: pendingInvoicesRes.count ?? 0,
      clients: uniqueClients.size,
      revenue: totalRevenue,
    });
    setInvoiceMetrics((metricsRes.data as InvoiceMetric[]) ?? []);
    setLoadingStats(false);
  }, [user]);

  const refreshDashboardData = useCallback(async () => {
    await Promise.all([fetchProjects(), fetchStatsAndMetrics()]);
  }, [fetchProjects, fetchStatsAndMetrics]);

  const fetchGlobalFiles = useCallback(async () => {
    if (!user) return;
    setLoadingGlobalFiles(true);
    const { data } = await supabase
      .from('project_files')
      .select('id, project_id, file_name, file_path, file_size, created_at')
      .order('created_at', { ascending: false });
    setGlobalFiles((data as GlobalFile[]) ?? []);
    setLoadingGlobalFiles(false);
  }, [user]);

  useEffect(() => {
    if (searchParams.get('checkout') === 'success') {
      checkSubscription().then(() => {
        toast({ title: 'Upgrade successful! 🎉', description: 'Enjoy Life Admin AI and all premium features.' });
      });
      const url = new URL(window.location.href);
      url.searchParams.delete('checkout');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    refreshDashboardData();
  }, [user, refreshDashboardData]);

  useEffect(() => {
    if (projects.length > 0 && !selectedUploadProject) {
      setSelectedUploadProject(projects[0].id);
    }
  }, [projects, selectedUploadProject]);

  useEffect(() => {
    if (currentTab === 'files') {
      fetchGlobalFiles();
    }
  }, [currentTab, fetchGlobalFiles]);

  const handleCreateProject = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setCreating(true);
    try {
      const { error } = await supabase.from('projects').insert({
        name: projectName,
        description: projectDesc || null,
        freelancer_id: user.id,
        client_email: clientEmail || null,
        status: projectStatus,
      });
      if (error) throw error;

      toast({ title: 'Project created!', description: `"${projectName}" is ready.` });
      setProjectName('');
      setProjectDesc('');
      setClientEmail('');
      setProjectStatus('active');
      setShowCreateModal(false);
      await refreshDashboardData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleTeamInvite = async () => {
    if (!inviteEmail.trim()) {
      toast({ title: 'Invite email required', variant: 'destructive' });
      return;
    }

    setInviting(true);
    setTimeout(() => {
      toast({ title: 'Invite drafted', description: `Invite prepared for ${inviteEmail}.` });
      setInviteEmail('');
      setInviting(false);
    }, 500);
  };

  const getFileUrl = (path: string) => supabase.storage.from('project-files').getPublicUrl(path).data.publicUrl;

  const uploadFilesToSelectedProject = async (filesToUpload: File[]) => {
    if (!user) return;
    if (!selectedUploadProject) {
      toast({ title: 'Select a project first', variant: 'destructive' });
      return;
    }

    setUploadingFiles(true);
    setUploadProgress(0);

    let succeeded = 0;
    let failed = 0;

    for (let index = 0; index < filesToUpload.length; index += 1) {
      const file = filesToUpload[index];
      const path = `${user.id}/${selectedUploadProject}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage.from('project-files').upload(path, file);
      if (uploadError) {
        failed += 1;
        setUploadProgress(Math.round(((index + 1) / filesToUpload.length) * 100));
        continue;
      }

      const { error: insertError } = await supabase.from('project_files').insert({
        project_id: selectedUploadProject,
        file_name: file.name,
        file_path: path,
        file_size: file.size,
        uploaded_by: user.id,
      });

      if (insertError) {
        failed += 1;
      } else {
        succeeded += 1;
      }

      setUploadProgress(Math.round(((index + 1) / filesToUpload.length) * 100));
    }

    await fetchGlobalFiles();

    if (succeeded > 0) {
      toast({ title: 'Upload complete', description: `${succeeded} file${succeeded > 1 ? 's' : ''} uploaded.` });
    }
    if (failed > 0) {
      toast({ title: 'Some files failed', description: `${failed} file${failed > 1 ? 's' : ''} could not be uploaded.`, variant: 'destructive' });
    }

    setUploadingFiles(false);
    setUploadProgress(0);
  };

  const handleGlobalUploadInput = async (event: ChangeEvent<HTMLInputElement>) => {
    const filesToUpload = event.target.files ? Array.from(event.target.files) : [];
    if (filesToUpload.length > 0) {
      await uploadFilesToSelectedProject(filesToUpload);
    }
    event.target.value = '';
  };

  const handleDeleteGlobalFile = async (file: GlobalFile) => {
    const { error: storageError } = await supabase.storage.from('project-files').remove([file.file_path]);
    if (storageError) {
      toast({ title: 'Delete failed', description: storageError.message, variant: 'destructive' });
      return;
    }

    const { error: dbError } = await supabase.from('project_files').delete().eq('id', file.id);
    if (dbError) {
      toast({ title: 'Delete failed', description: dbError.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'File deleted' });
    fetchGlobalFiles();
  };

  const clients = useMemo<ClientSummary[]>(() => {
    const map = new Map<string, ClientSummary>();

    projects.forEach((project) => {
      if (!project.client_email) return;

      const existing = map.get(project.client_email);
      const isActive = project.status !== 'completed';

      if (!existing) {
        map.set(project.client_email, {
          email: project.client_email,
          activeProjects: isActive ? 1 : 0,
          totalProjects: 1,
          lastActivity: project.updated_at,
        });
        return;
      }

      map.set(project.client_email, {
        ...existing,
        activeProjects: existing.activeProjects + (isActive ? 1 : 0),
        totalProjects: existing.totalProjects + 1,
        lastActivity: new Date(project.updated_at) > new Date(existing.lastActivity) ? project.updated_at : existing.lastActivity,
      });
    });

    return Array.from(map.values()).sort((a, b) => +new Date(b.lastActivity) - +new Date(a.lastActivity));
  }, [projects]);

  const filteredGlobalFiles = useMemo(() => {
    const query = globalFileQuery.trim().toLowerCase();
    if (!query) return globalFiles;

    return globalFiles.filter((file) => {
      const projectName = projects.find((project) => project.id === file.project_id)?.name ?? '';
      return file.file_name.toLowerCase().includes(query) || projectName.toLowerCase().includes(query);
    });
  }, [globalFileQuery, globalFiles, projects]);

  const monthlyRevenue = useMemo(() => {
    const paidInvoices = invoiceMetrics.filter((invoice) => invoice.status === 'paid');
    const labels = Array.from({ length: 6 }).map((_, index) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString('en-US', { month: 'short' }),
      };
    });

    return labels.map(({ key, label }) => {
      const total = paidInvoices
        .filter((invoice) => {
          const invoiceDate = new Date(invoice.created_at);
          return `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}` === key;
        })
        .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

      return { label, total };
    });
  }, [invoiceMetrics]);

  const statusBreakdown = useMemo(() => {
    return projects.reduce<Record<string, number>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const maxRevenue = Math.max(...monthlyRevenue.map((month) => month.total), 1);

  const statCards = [
    { label: 'Active Projects', value: stats.projects, icon: FolderOpen, iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { label: 'Pending Invoices', value: stats.invoices, icon: FileText, iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { label: 'Total Clients', value: stats.clients, icon: Users, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { label: 'Revenue', value: stats.revenue, icon: TrendingUp, prefix: '£', iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  ];

  const pageConfig: Record<DashboardTab, { title: string; description: string; showCreateProject: boolean }> = {
    dashboard: {
      title: `Welcome back, ${user?.user_metadata?.full_name || 'Freelancer'}`,
      description: "Here's your business overview at a glance.",
      showCreateProject: true,
    },
    projects: {
      title: 'Projects',
      description: 'Manage all client projects and keep delivery on track.',
      showCreateProject: true,
    },
    invoices: {
      title: 'Invoices',
      description: 'Create invoices and share secure payment links instantly.',
      showCreateProject: false,
    },
    clients: {
      title: 'Clients',
      description: 'Monitor client relationships and recent activity.',
      showCreateProject: false,
    },
    files: {
      title: 'Files',
      description: 'Search and manage project files in one place.',
      showCreateProject: false,
    },
    reports: {
      title: 'Reports',
      description: 'Track revenue, project outcomes, and client momentum.',
      showCreateProject: false,
    },
    team: {
      title: 'Team',
      description: 'Invite and coordinate your agency team.',
      showCreateProject: false,
    },
    gigs: {
      title: 'My Gigs',
      description: 'Create and manage your marketplace listings.',
      showCreateProject: false,
    },
    orders: {
      title: 'Orders',
      description: 'Manage incoming orders from buyers.',
      showCreateProject: false,
    },
    messages: {
      title: 'Messages',
      description: 'Chat with buyers and sellers on active orders.',
      showCreateProject: false,
    },
    'life-admin': {
      title: 'Life Admin AI',
      description: 'AI-powered bill tracking, subscriptions, and spending insights.',
      showCreateProject: false,
    },
    referrals: {
      title: 'Invite & Earn',
      description: 'Share your referral link and earn free months.',
      showCreateProject: false,
    },
    courses: {
      title: 'My Courses',
      description: 'Manage your Academy drafts and published courses.',
      showCreateProject: false,
    },
    learning: {
      title: 'My Learning',
      description: 'Continue the courses you have enrolled in.',
      showCreateProject: false,
    },
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const projectNameById = (projectId: string) => projects.find((project) => project.id === projectId)?.name ?? 'Unknown project';
  const getInitials = (email: string | null) => (email ? email.charAt(0).toUpperCase() : '?');

  const renderProjectsGrid = () => {
    if (loadingProjects) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="glass rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <Skeleton className="h-11 w-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-full mb-2" />
              <Skeleton className="h-2 w-full rounded-full mb-3" />
              <div className="flex gap-2 pt-3 border-t border-border/20">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass rounded-2xl p-16 text-center">
          <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <FolderOpen className="h-10 w-10 text-primary/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Create your first project to manage files, invoices, and client communication in one place.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2">
            <Plus className="h-4 w-4" /> Create Project
          </Button>
        </motion.div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project, index) => {
          const config = statusConfig[project.status] ?? statusConfig.active;
          const isExpanded = expandedProject === project.id;

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: index * 0.05, duration: 0.4, ease }}
              className="glass rounded-[20px] hover:shadow-xl hover:shadow-primary/10 transition-all"
            >
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColors[index % avatarColors.length]} ring-2 ring-background`}>
                      {getInitials(project.client_email)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-base truncate">{project.name}</h3>
                      {project.client_email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{project.client_email}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 text-[11px] gap-1.5 ${config.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </Badge>
                </div>

                {project.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>}

                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span className="font-medium">Progress</span>
                    <span className="tabular-nums font-medium">{config.progress}%</span>
                  </div>
                  <Progress value={config.progress} className="h-1.5" />
                </div>

                <p className="text-xs text-muted-foreground/70 mb-4">Updated {formatDate(project.updated_at)}</p>

                <div className="flex items-center gap-1.5 pt-3 border-t border-border/20">
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={() => setEditProject(project)}>
                    <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteProject(project)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-3 text-xs ml-auto" onClick={() => setExpandedProject(isExpanded ? null : project.id)}>
                    Files
                    <ChevronRight className={`h-3.5 w-3.5 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden border-t border-border/20"
                  >
                    <div className="p-6 pt-5">
                      <ProjectFiles projectId={project.id} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">{pageConfig[currentTab].title}</h1>
            <p className="text-muted-foreground mt-1.5 text-sm">{pageConfig[currentTab].description}</p>
          </motion.div>
          {pageConfig[currentTab].showCreateProject && (
            <Button onClick={() => setShowCreateModal(true)} size="lg" className="gap-2 w-full sm:w-auto shadow-lg shadow-primary/20 rounded-xl">
              <Plus className="h-4 w-4" /> New Project
            </Button>
          )}
        </div>

        <UpgradeBanner />

        {currentTab === 'dashboard' && <SellerDashboardHome />}

        {currentTab === 'projects' && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">All Projects</h2>
              <Button variant="outline" size="sm" onClick={() => setShowCreateModal(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Quick Create
              </Button>
            </div>
            {renderProjectsGrid()}
          </section>
        )}

        {currentTab === 'invoices' && (
          <section className="space-y-6">
            {projects.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Create a project first</h3>
                <p className="text-sm text-muted-foreground mb-5">Invoices are linked to projects, so add a project before sending your first invoice.</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </div>
            ) : (
              <>
                <InvoiceForm
                  projects={projects.map((project) => ({ id: project.id, name: project.name }))}
                  onCreated={() => {
                    setInvoiceRefreshKey((key) => key + 1);
                    fetchStatsAndMetrics();
                  }}
                />
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-4">Invoice History</h2>
                  <InvoiceList projects={projects.map((project) => ({ id: project.id, name: project.name }))} refreshKey={invoiceRefreshKey} />
                </div>
              </>
            )}
          </section>
        )}

        {currentTab === 'clients' && (
          <section className="space-y-4">
            {clients.length === 0 ? (
              <div className="glass rounded-2xl p-14 text-center">
                <Users className="h-10 w-10 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No clients yet</h3>
                <p className="text-sm text-muted-foreground">Add a client email to a project to start tracking activity here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clients.map((client, index) => (
                  <motion.div
                    key={client.email}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.35 }}
                    className="glass rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                        {getInitials(client.email)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{client.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg border border-border/40 p-3">
                        <p className="text-muted-foreground text-xs">Active Projects</p>
                        <p className="text-lg font-semibold text-foreground tabular-nums">{client.activeProjects}</p>
                      </div>
                      <div className="rounded-lg border border-border/40 p-3">
                        <p className="text-muted-foreground text-xs">Last Activity</p>
                        <p className="text-sm font-semibold text-foreground">{formatDate(client.lastActivity)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        )}

        {currentTab === 'files' && (
          <section className="space-y-5">
            {projects.length === 0 ? (
              <div className="glass rounded-2xl p-14 text-center">
                <FolderOpen className="h-10 w-10 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No project files yet</h3>
                <p className="text-sm text-muted-foreground mb-5">Create a project first, then upload files to build your shared workspace.</p>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" /> New Project
                </Button>
              </div>
            ) : (
              <>
                <div className="glass rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_auto] gap-3">
                    <div className="relative">
                      <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        value={globalFileQuery}
                        onChange={(event) => setGlobalFileQuery(event.target.value)}
                        placeholder="Search files or project name..."
                        className="pl-9"
                      />
                    </div>

                    <Select value={selectedUploadProject} onValueChange={setSelectedUploadProject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleGlobalUploadInput} />
                      <Button onClick={() => fileInputRef.current?.click()} disabled={uploadingFiles} className="w-full lg:w-auto gap-2">
                        {uploadingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        {uploadingFiles ? 'Uploading...' : 'Upload Files'}
                      </Button>
                    </div>
                  </div>

                  {uploadingFiles && (
                    <div className="space-y-1.5">
                      <Progress value={uploadProgress} className="h-1.5" />
                      <p className="text-xs text-muted-foreground tabular-nums">{uploadProgress}%</p>
                    </div>
                  )}
                </div>

                {loadingGlobalFiles ? (
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="glass rounded-xl p-4">
                        <Skeleton className="h-5 w-2/5 mb-2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : filteredGlobalFiles.length === 0 ? (
                  <div className="glass rounded-2xl p-14 text-center">
                    <FileText className="h-10 w-10 text-primary/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No matching files</h3>
                    <p className="text-sm text-muted-foreground">Try a different search or upload new files.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredGlobalFiles.map((file) => (
                      <div key={file.id} className="glass rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{file.file_name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {projectNameById(file.project_id)} • {formatDate(file.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild className="gap-1.5">
                            <a href={getFileUrl(file.file_path)} target="_blank" rel="noreferrer">
                              <Download className="h-3.5 w-3.5" /> Download
                            </a>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteGlobalFile(file)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}

        {currentTab === 'reports' && (
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-5 xl:col-span-2">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 className="h-4 w-4 text-primary" />
                <h2 className="font-semibold text-foreground">Revenue Overview</h2>
              </div>
              <div className="grid grid-cols-6 gap-3 items-end h-44">
                {monthlyRevenue.map((month) => (
                  <div key={month.label} className="flex flex-col items-center justify-end gap-2">
                    <div className="w-full bg-primary/10 rounded-md relative overflow-hidden" style={{ height: '120px' }}>
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary rounded-md transition-all duration-500"
                        style={{ height: `${Math.max((month.total / maxRevenue) * 100, month.total > 0 ? 10 : 4)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{month.label}</p>
                    <p className="text-[11px] font-medium text-foreground tabular-nums">£{month.total.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Project Stats</h3>
              {Object.entries(statusBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">No project data yet.</p>
              ) : (
                Object.entries(statusBreakdown).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
                    <span className="font-semibold text-foreground tabular-nums">{count}</span>
                  </div>
                ))
              )}

              <div className="pt-3 border-t border-border/30">
                <h4 className="font-medium text-foreground mb-2">Client Activity</h4>
                {clients.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No client activity yet.</p>
                ) : (
                  <div className="space-y-2">
                    {clients.slice(0, 4).map((client) => (
                      <div key={client.email} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground truncate max-w-[65%]">{client.email}</span>
                        <span className="text-foreground font-medium">{formatDate(client.lastActivity)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {currentTab === 'team' && (
          <section>
            {tier !== 'agency' ? (
              <div className="glass rounded-2xl p-14 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Team is available on Agency</h3>
                <p className="text-sm text-muted-foreground">Upgrade to Agency to invite teammates and collaborate from one workspace.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-4">Members</h3>
                  <div className="rounded-xl border border-border/40 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Badge variant="outline">Owner</Badge>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5">
                  <h3 className="font-semibold text-foreground mb-3">Invite Team Member</h3>
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <Input value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="teammate@company.com" type="email" />
                    <Button onClick={handleTeamInvite} disabled={inviting} className="gap-2 sm:w-auto w-full">
                      {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {currentTab === 'gigs' && <GigsTab userId={user?.id} />}

        {currentTab === 'orders' && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Incoming Orders</h2>
            <SellerOrders />
          </section>
        )}

        {currentTab === 'messages' && <InboxMessages />}

        {currentTab === 'life-admin' && <LifeAdminAI />}

        {currentTab === 'referrals' && <ReferralDashboardSection />}

        {currentTab === 'courses' && <MyCourses />}

        {currentTab === 'learning' && <MyLearning />}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              New Project
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" value={projectName} onChange={(event) => setProjectName(event.target.value)} required placeholder="Website redesign" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={projectDesc}
                onChange={(event) => setProjectDesc(event.target.value)}
                placeholder="Project scope and goals"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial Status</Label>
                <Select value={projectStatus} onValueChange={setProjectStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Client Email</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientEmail}
                  onChange={(event) => setClientEmail(event.target.value)}
                  placeholder="client@company.com"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {creating ? 'Creating...' : 'Create Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {editProject && (
        <EditProjectModal
          project={editProject}
          open={!!editProject}
          onOpenChange={(open) => !open && setEditProject(null)}
          onSaved={refreshDashboardData}
        />
      )}

      {deleteProject && (
        <DeleteProjectDialog
          projectId={deleteProject.id}
          projectName={deleteProject.name}
          open={!!deleteProject}
          onOpenChange={(open) => !open && setDeleteProject(null)}
          onDeleted={() => {
            refreshDashboardData();
            fetchGlobalFiles();
            setInvoiceRefreshKey((key) => key + 1);
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
