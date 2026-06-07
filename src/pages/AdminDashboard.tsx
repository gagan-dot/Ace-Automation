import React, { useEffect, useState } from 'react';
import { 
  Download, 
  Search, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  RefreshCw, 
  Database,
  Phone,
  Mail,
  FileText,
  LayoutDashboard,
  Users,
  Calendar,
  CalendarClock,
  PlusCircle,
  BarChart3,
  X,
  Check,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  Edit,
  Eye,
  Menu,
  LogOut,
  MapPin
} from 'lucide-react';
import styles from './AdminDashboard.module.css';

interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  service: string;
  budget: string;
  followupDate: string;
  message: string;
  source: 'Form' | 'Consultation' | 'WhatsApp' | 'Call' | 'Manual';
  status: 'New' | 'Interested' | 'Hot Lead' | 'Not Interested' | 'Follow Up';
  notes: string;
  timestamp: string;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const AdminDashboard: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Tabs & Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'hot' | 'followup' | 'addlead' | 'analytics'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<keyof Lead>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Selection state for bulk actions
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Modals & Details editing state
  const [detailedLead, setDetailedLead] = useState<Lead | null>(null);
  const [modalNotes, setModalNotes] = useState<string>('');
  const [modalStatus, setModalStatus] = useState<Lead['status']>('New');

  // Toasts list state
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Note auto-save indicator per row
  const [savingNoteId, setSavingNoteId] = useState<string>('');

  // Lead Form state
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formService, setFormService] = useState('AI Automation');
  const [formBudget, setFormBudget] = useState('');
  const [formFollowupDate, setFormFollowupDate] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSource, setFormSource] = useState<Lead['source']>('Manual');
  const [formStatus, setFormStatus] = useState<Lead['status']>('New');
  const [formNotes, setFormNotes] = useState('');

  // Show customized toast notifications
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch all leads from the database
  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/leads');
      if (!response.ok) {
        throw new Error('Failed to fetch leads from CRM backend.');
      }
      const data = await response.json();
      setLeads(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not connect to CRM backend.');
      showToast('Error loading leads. Check backend status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Reset page number on search filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sourceFilter, statusFilter, pageSize]);

  // Update lead status
  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
      showToast(`Lead status updated to "${newStatus}"`);
    } catch (err) {
      showToast('Error updating lead status.', 'error');
    }
  };

  // Save notes inline from leads table
  const handleNotesChange = async (id: string, newNotes: string) => {
    setSavingNoteId(id);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: newNotes })
      });
      if (!response.ok) throw new Error('Failed to update notes');
      
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, notes: newNotes } : lead));
      setTimeout(() => setSavingNoteId(''), 1000);
      showToast('Admin notes auto-saved');
    } catch (err) {
      setSavingNoteId('');
      showToast('Error saving lead notes.', 'error');
    }
  };

  // Delete a single lead
  const handleDeleteLead = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete lead for "${name}"?`)) return;

    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete lead');
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
      setSelectedLeads(prev => prev.filter(selectedId => selectedId !== id));
      showToast('Lead deleted successfully');
    } catch (err) {
      showToast('Error deleting lead.', 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open('/api/leads/export', '_blank');
    showToast('Export file downloaded successfully');
  };

  // Bulk Status change
  const handleBulkStatusChange = async (status: Lead['status']) => {
    if (selectedLeads.length === 0 || !status) return;
    try {
      const response = await fetch('/api/leads/bulk-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedLeads, status })
      });
      if (!response.ok) throw new Error('Bulk update failed');
      
      setLeads(prev => prev.map(lead => selectedLeads.includes(lead.id) ? { ...lead, status } : lead));
      showToast(`Successfully updated ${selectedLeads.length} leads to "${status}"`);
      setSelectedLeads([]);
      setBulkStatus('');
    } catch (err) {
      showToast('Bulk status update failed.', 'error');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedLeads.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${selectedLeads.length} selected leads?`)) return;

    try {
      const response = await fetch('/api/leads/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedLeads })
      });
      if (!response.ok) throw new Error('Bulk delete failed');
      
      setLeads(prev => prev.filter(lead => !selectedLeads.includes(lead.id)));
      showToast(`Successfully deleted ${selectedLeads.length} leads`);
      setSelectedLeads([]);
    } catch (err) {
      showToast('Bulk delete operation failed.', 'error');
    }
  };

  // Lead Creation & Modification submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Lead Name is required.', 'error');
      return;
    }

    const payload = {
      name: formName,
      company: formCompany || 'N/A',
      phone: formPhone || 'N/A',
      email: formEmail || 'N/A',
      city: formCity || '',
      service: formService,
      budget: formBudget || '',
      followupDate: formFollowupDate || '',
      message: formMessage || '',
      source: formSource,
      status: formStatus,
      notes: formNotes || ''
    };

    try {
      if (editingLead) {
        // Update route
        const response = await fetch(`/api/leads/${editingLead.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Update failed');
        const updated = await response.json();
        
        setLeads(prev => prev.map(lead => lead.id === editingLead.id ? updated : lead));
        showToast('Lead updated successfully');
        setEditingLead(null);
      } else {
        // Create route
        const response = await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Creation failed');
        const created = await response.json();
        
        setLeads(prev => [created, ...prev]);
        showToast('New lead added successfully');
      }

      resetForm();
      setActiveTab('leads');
    } catch (err) {
      showToast('Failed to save lead info.', 'error');
    }
  };

  // Prefill form for editing
  const startEditing = (lead: Lead) => {
    setEditingLead(lead);
    setFormName(lead.name);
    setFormCompany(lead.company === 'N/A' ? '' : lead.company);
    setFormPhone(lead.phone === 'N/A' ? '' : lead.phone);
    setFormEmail(lead.email === 'N/A' ? '' : lead.email);
    setFormCity(lead.city || '');
    setFormService(lead.service === 'N/A' ? 'AI Automation' : lead.service);
    setFormBudget(lead.budget || '');
    setFormFollowupDate(lead.followupDate || '');
    setFormMessage(lead.message || '');
    setFormSource(lead.source);
    setFormStatus(lead.status);
    setFormNotes(lead.notes || '');
    setActiveTab('addlead');
    setSidebarOpen(false);
  };

  // Reset form inputs
  const resetForm = () => {
    setFormName('');
    setFormCompany('');
    setFormPhone('');
    setFormEmail('');
    setFormCity('');
    setFormService('AI Automation');
    setFormBudget('');
    setFormFollowupDate('');
    setFormMessage('');
    setFormSource('Manual');
    setFormStatus('New');
    setFormNotes('');
    setEditingLead(null);
  };

  // Detail view Modal
  const openDetailedView = (lead: Lead) => {
    setDetailedLead(lead);
    setModalNotes(lead.notes || '');
    setModalStatus(lead.status);
  };

  // Save edits inside modal
  const saveModalChanges = async () => {
    if (!detailedLead) return;
    try {
      const response = await fetch(`/api/leads/${detailedLead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: modalStatus, notes: modalNotes })
      });
      if (!response.ok) throw new Error('Modal save failed');
      
      setLeads(prev => prev.map(lead => lead.id === detailedLead.id ? { ...lead, status: modalStatus, notes: modalNotes } : lead));
      showToast('Lead details updated');
      setDetailedLead(null);
    } catch (err) {
      showToast('Failed to update lead.', 'error');
    }
  };

  // Sort columns
  const requestSort = (field: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortField === field && sortDirection === 'asc') {
      direction = 'desc';
    }
    setSortField(field);
    setSortDirection(direction);
  };

  // Filters & Sorting logic
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.city && lead.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.notes.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSource = sourceFilter === 'all' || lead.source.toLowerCase() === sourceFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSource && matchesStatus;
  });

  const sortedLeads = [...filteredLeads].sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc' 
        ? valA.localeCompare(valB) 
        : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc' 
        ? (valA > valB ? 1 : -1) 
        : (valB > valA ? 1 : -1);
    }
  });

  // Pagination slicing
  const pageCount = Math.ceil(sortedLeads.length / pageSize) || 1;
  const paginatedLeads = sortedLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Checkbox multi selection
  const allIdsOnPage = paginatedLeads.map(l => l.id);
  const isAllSelected = allIdsOnPage.length > 0 && allIdsOnPage.every(id => selectedLeads.includes(id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeads(prev => prev.filter(id => !allIdsOnPage.includes(id)));
    } else {
      setSelectedLeads(prev => {
        const newSelections = allIdsOnPage.filter(id => !prev.includes(id));
        return [...prev, ...newSelections];
      });
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeads(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Calculations for Badges and Stats
  const totalLeads = leads.length;
  const hotLeadsCount = leads.filter(l => l.status === 'Hot Lead').length;
  const followupLeadsCount = leads.filter(l => l.status === 'Follow Up' || l.followupDate).length;
  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const interestedLeadsCount = leads.filter(l => l.status === 'Interested').length;

  // Source percentages for donut chart
  const sourceFormCount = leads.filter(l => l.source === 'Form').length;
  const sourceConsultationCount = leads.filter(l => l.source === 'Consultation').length;
  const sourceWhatsAppCount = leads.filter(l => l.source === 'WhatsApp').length;
  const sourceCallCount = leads.filter(l => l.source === 'Call').length;
  const sourceManualCount = leads.filter(l => l.source === 'Manual').length;

  const totalVal = totalLeads || 1;
  const pctForm = (sourceFormCount / totalVal) * 100;
  const pctConsultation = (sourceConsultationCount / totalVal) * 100;
  const pctWhatsApp = (sourceWhatsAppCount / totalVal) * 100;
  const pctCall = (sourceCallCount / totalVal) * 100;
  const pctManual = (sourceManualCount / totalVal) * 100;

  // Monthly trend chart computations
  const getMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      
      const count = leads.filter(lead => {
        const leadDate = new Date(lead.timestamp);
        return leadDate.getMonth() === d.getMonth() && leadDate.getFullYear() === d.getFullYear();
      }).length;
      
      data.push({
        label: `${monthName} '${year.toString().slice(-2)}`,
        count
      });
    }
    return data;
  };

  const monthlyData = getMonthlyData();
  const maxMonthlyCount = Math.max(...monthlyData.map(d => d.count), 1);

  // Check if follow-up lead is overdue
  const isFollowUpOverdue = (dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    const date = new Date(dateStr);
    return date < today;
  };

  return (
    <div className={styles.adminLayout}>
      {/* Background Ambient Orbs */}
      <div className={styles.ambientOrb} style={{ top: '10%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}></div>
      <div className={styles.ambientOrb} style={{ bottom: '20%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }}></div>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Panel */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandDot}></div>
          <span className={styles.brandText}>Ace CRM Admin</span>
        </div>
        
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            <span className={styles.navItemLeft}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'leads' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('leads'); setSidebarOpen(false); }}
          >
            <span className={styles.navItemLeft}>
              <Users size={18} />
              <span>All Leads</span>
            </span>
            {totalLeads > 0 && <span className={styles.navBadge}>{totalLeads}</span>}
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'hot' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('hot'); setSidebarOpen(false); }}
          >
            <span className={styles.navItemLeft}>
              <Flame size={18} style={{ color: '#ef4444' }} />
              <span>Hot Leads</span>
            </span>
            {hotLeadsCount > 0 && <span className={`${styles.navBadge} ${styles.navBadgeHot}`}>{hotLeadsCount}</span>}
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'followup' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('followup'); setSidebarOpen(false); }}
          >
            <span className={styles.navItemLeft}>
              <CalendarClock size={18} style={{ color: '#c084fc' }} />
              <span>Follow Up</span>
            </span>
            {followupLeadsCount > 0 && <span className={`${styles.navBadge} ${styles.navBadgeFollow}`}>{followupLeadsCount}</span>}
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'addlead' ? styles.navItemActive : ''}`}
            onClick={() => { 
              if (!editingLead) resetForm();
              setActiveTab('addlead'); 
              setSidebarOpen(false); 
            }}
          >
            <span className={styles.navItemLeft}>
              <PlusCircle size={18} />
              <span>{editingLead ? 'Edit Lead' : 'Add Lead'}</span>
            </span>
          </button>

          <button 
            className={`${styles.navItem} ${activeTab === 'analytics' ? styles.navItemActive : ''}`}
            onClick={() => { setActiveTab('analytics'); setSidebarOpen(false); }}
          >
            <span className={styles.navItemLeft}>
              <BarChart3 size={18} />
              <span>Analytics</span>
            </span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" className={styles.btnBackToSite}>
            <LogOut size={18} />
            <span>Return to Site</span>
          </a>
        </div>
      </aside>

      {/* Main View Area */}
      <main className={styles.mainContent}>
        {/* Mobile Header Toggle */}
        <div className={styles.mobileHeader}>
          <button className={styles.menuBtn} onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className={styles.brandText} style={{ fontSize: '1.1rem' }}>Ace CRM</span>
          <button className={styles.btnRefresh} onClick={fetchLeads} style={{ width: '36px', height: '36px' }}>
            <RefreshCw size={16} />
          </button>
        </div>

        <div className={styles.pageBody}>
          
          {/* Header Row */}
          <div className={styles.header}>
            <div className={styles.titleArea}>
              <h1>
                {activeTab === 'dashboard' && 'CRM Dashboard'}
                {activeTab === 'leads' && 'All Customer Leads'}
                {activeTab === 'hot' && 'Priority Hot Leads'}
                {activeTab === 'followup' && 'Scheduled Follow Ups'}
                {activeTab === 'addlead' && (editingLead ? 'Modify Lead Record' : 'Create New Lead')}
                {activeTab === 'analytics' && 'Performance Analytics'}
              </h1>
              <p className={styles.subtitle}>
                {activeTab === 'dashboard' && 'Welcome back, Admin. Real-time updates & channel tracking.'}
                {activeTab === 'leads' && 'Manage, sort, and process bulk actions for lead entries.'}
                {activeTab === 'hot' && 'High-priority inquiries that require immediate response.'}
                {activeTab === 'followup' && 'Track scheduled callbacks, appointments, and feedback dates.'}
                {activeTab === 'addlead' && 'Enter custom prospect data to add directly to database.'}
                {activeTab === 'analytics' && 'Visual breakdown of monthly conversions, statuses & sources.'}
              </p>
            </div>
            
            <div className={styles.actionsArea}>
              <button className={styles.btnRefresh} onClick={fetchLeads} title="Refresh lead database">
                <RefreshCw size={18} />
              </button>
              <button className={styles.btnExport} onClick={handleExportCSV}>
                <Download size={18} /> Export CSV
              </button>
            </div>
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Banner */}
              <div className={styles.welcomeBanner}>
                <h2>Systems Operational & Synced</h2>
                <p>
                  We are currently tracking <strong>{totalLeads} total leads</strong> from the web platforms.
                  There are <strong>{newLeadsCount} new unchecked inquiries</strong> in the queue. Complete follow ups on time to maximize automation sales!
                </p>
              </div>

              {/* Stats Row */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statValue}>{totalLeads}</span>
                    <span className={styles.statLabel}>Total Contacts</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.totalIcon}`}>
                    <Database size={24} />
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statValue} style={{ color: '#ef4444' }}>{hotLeadsCount}</span>
                    <span className={styles.statLabel}>Hot Leads</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.hotIcon}`}>
                    <Flame size={24} />
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statValue} style={{ color: '#c084fc' }}>{followupLeadsCount}</span>
                    <span className={styles.statLabel}>Follow Ups Scheduled</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.newIcon}`}>
                    <CalendarClock size={24} />
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statValue} style={{ color: '#06b6d4' }}>{interestedLeadsCount}</span>
                    <span className={styles.statLabel}>Interested Buyers</span>
                  </div>
                  <div className={`${styles.statIcon} ${styles.interestedIcon}`}>
                    <CheckCircle2 size={24} />
                  </div>
                </div>
              </div>

              {/* Summary Charts Row */}
              <div className={styles.chartsRow}>
                {/* SVG Donut representation */}
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Lead Channel Distribution</h3>
                  <div className={styles.sourceDonut}>
                    <div className={styles.donutVisual}>
                      <svg width="100%" height="100%" viewBox="0 0 42 42">
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4"></circle>
                        {/* Form Leads - Purple */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#a855f7" strokeWidth="4" 
                          strokeDasharray={`${pctForm} ${100 - pctForm}`} 
                          strokeDashoffset="25">
                        </circle>
                        {/* Consultation - Indigo */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#6366f1" strokeWidth="4" 
                          strokeDasharray={`${pctConsultation} ${100 - pctConsultation}`} 
                          strokeDashoffset={`${25 - pctForm}`}>
                        </circle>
                        {/* WhatsApp - Green */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#22c55e" strokeWidth="4" 
                          strokeDasharray={`${pctWhatsApp} ${100 - pctWhatsApp}`} 
                          strokeDashoffset={`${25 - pctForm - pctConsultation}`}>
                        </circle>
                        {/* Call - Yellow */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eab308" strokeWidth="4" 
                          strokeDasharray={`${pctCall} ${100 - pctCall}`} 
                          strokeDashoffset={`${25 - pctForm - pctConsultation - pctWhatsApp}`}>
                        </circle>
                        {/* Manual - Rose */}
                        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#fb7185" strokeWidth="4" 
                          strokeDasharray={`${pctManual} ${100 - pctManual}`} 
                          strokeDashoffset={`${25 - pctForm - pctConsultation - pctWhatsApp - pctCall}`}>
                        </circle>
                      </svg>
                    </div>
                    <div className={styles.donutLegend}>
                      <div className={styles.legendItem}>
                        <span className={styles.legendLabel}><span className={styles.legendColor} style={{ backgroundColor: '#a855f7' }}></span>Contact Form</span>
                        <span className={styles.legendValue}>{sourceFormCount}</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendLabel}><span className={styles.legendColor} style={{ backgroundColor: '#6366f1' }}></span>Consultations</span>
                        <span className={styles.legendValue}>{sourceConsultationCount}</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendLabel}><span className={styles.legendColor} style={{ backgroundColor: '#22c55e' }}></span>WhatsApp Link</span>
                        <span className={styles.legendValue}>{sourceWhatsAppCount}</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendLabel}><span className={styles.legendColor} style={{ backgroundColor: '#eab308' }}></span>Direct Call Link</span>
                        <span className={styles.legendValue}>{sourceCallCount}</span>
                      </div>
                      <div className={styles.legendItem}>
                        <span className={styles.legendLabel}><span className={styles.legendColor} style={{ backgroundColor: '#fb7185' }}></span>Manual Input</span>
                        <span className={styles.legendValue}>{sourceManualCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horizontal progress representation */}
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Inquiry Status Breakdown</h3>
                  <div className={styles.chartGrid}>
                    <div className={styles.chartItem}>
                      <div className={styles.chartLabelRow}>
                        <span>Hot Lead 🔥</span>
                        <span>{hotLeadsCount} ({totalLeads > 0 ? Math.round((hotLeadsCount / totalLeads) * 100) : 0}%)</span>
                      </div>
                      <div className={styles.chartBarBg}>
                        <div className={styles.chartBarFill} style={{ width: `${totalLeads > 0 ? (hotLeadsCount / totalLeads) * 100 : 0}%`, backgroundColor: '#ef4444' }}></div>
                      </div>
                    </div>

                    <div className={styles.chartItem}>
                      <div className={styles.chartLabelRow}>
                        <span>Follow Up 📅</span>
                        <span>{leads.filter(l => l.status === 'Follow Up').length} ({totalLeads > 0 ? Math.round((leads.filter(l => l.status === 'Follow Up').length / totalLeads) * 100) : 0}%)</span>
                      </div>
                      <div className={styles.chartBarBg}>
                        <div className={styles.chartBarFill} style={{ width: `${totalLeads > 0 ? (leads.filter(l => l.status === 'Follow Up').length / totalLeads) * 100 : 0}%`, backgroundColor: '#c084fc' }}></div>
                      </div>
                    </div>

                    <div className={styles.chartItem}>
                      <div className={styles.chartLabelRow}>
                        <span>Interested Inquiries</span>
                        <span>{interestedLeadsCount} ({totalLeads > 0 ? Math.round((interestedLeadsCount / totalLeads) * 100) : 0}%)</span>
                      </div>
                      <div className={styles.chartBarBg}>
                        <div className={styles.chartBarFill} style={{ width: `${totalLeads > 0 ? (interestedLeadsCount / totalLeads) * 100 : 0}%`, backgroundColor: '#06b6d4' }}></div>
                      </div>
                    </div>

                    <div className={styles.chartItem}>
                      <div className={styles.chartLabelRow}>
                        <span>New (Unprocessed)</span>
                        <span>{newLeadsCount} ({totalLeads > 0 ? Math.round((newLeadsCount / totalLeads) * 100) : 0}%)</span>
                      </div>
                      <div className={styles.chartBarBg}>
                        <div className={styles.chartBarFill} style={{ width: `${totalLeads > 0 ? (newLeadsCount / totalLeads) * 100 : 0}%`, backgroundColor: '#a855f7' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Leads list */}
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <h2>Recent Web Platform Inquiries</h2>
                  <button className={styles.btnCardActionPrimary} onClick={() => setActiveTab('leads')}>View All Leads</button>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Lead Name & Company</th>
                        <th>Contact Info</th>
                        <th>Service Requested</th>
                        <th>Channel Source</th>
                        <th>Timestamp</th>
                        <th>Status</th>
                        <th>Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leads.slice(0, 5).map(lead => (
                        <tr key={lead.id} className={styles.leadRow}>
                          <td>
                            <div className={styles.primaryDetail}>
                              <span className={styles.leadName}>{lead.name}</span>
                              <span className={styles.leadCompany}>{lead.company}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.leadContact}>
                              <span className={styles.contactLink}>{lead.phone !== 'N/A' ? lead.phone : 'No Phone'}</span>
                              <span className={styles.contactLink} style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{lead.email !== 'N/A' ? lead.email : 'No Email'}</span>
                            </div>
                          </td>
                          <td>
                            <div className={styles.primaryDetail}>
                              <span className={styles.leadName} style={{ color: '#818cf8', fontWeight: 600 }}>{lead.service}</span>
                              {lead.budget && <span className={styles.budgetVal}>{lead.budget}</span>}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.badge} ${styles[`source_${lead.source}`]}`}>{lead.source}</span>
                          </td>
                          <td>
                            <span className={styles.timestamp}>
                              {new Date(lead.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td>
                            <select 
                              className={`${styles.statusSelector} ${styles[`status_${lead.status.replace(' ', '_')}`]}`}
                              value={lead.status}
                              onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                            >
                              <option value="New">New</option>
                              <option value="Interested">Interested</option>
                              <option value="Hot Lead">Hot Lead 🔥</option>
                              <option value="Follow Up">Follow Up 📅</option>
                              <option value="Not Interested">Not Interested</option>
                            </select>
                          </td>
                          <td>
                            <div className={styles.rowActions}>
                              <button className={`${styles.btnAction} ${styles.btnView}`} onClick={() => openDetailedView(lead)} title="View Detail Details"><Eye size={16} /></button>
                              <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => startEditing(lead)} title="Modify Lead Record"><Edit size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {leads.length === 0 && (
                        <tr>
                          <td colSpan={7} className={styles.noLeads}>No inquiries found in database.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LEADS LIST TABLE */}
          {activeTab === 'leads' && (
            <>
              {/* Filter controls */}
              <div className={styles.filterBar}>
                <div className={styles.searchWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input 
                    type="text" 
                    placeholder="Search name, company, email, phone, notes..." 
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className={styles.filtersGroup}>
                  <select 
                    className={styles.filterSelect}
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                  >
                    <option value="all">All Sources</option>
                    <option value="form">Contact Form</option>
                    <option value="consultation">Consultations</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Call Link</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                  <select 
                    className={styles.filterSelect}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New</option>
                    <option value="interested">Interested</option>
                    <option value="hot lead">Hot Lead 🔥</option>
                    <option value="follow up">Follow Up 📅</option>
                    <option value="not interested">Not Interested</option>
                  </select>
                  
                  <select
                    className={styles.filterSelect}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>
              </div>

              {/* Table list */}
              <div className={styles.tableCard}>
                <div className={styles.tableHeader}>
                  <h2>Leads Ledger ({filteredLeads.length} items found)</h2>
                </div>

                <div className={styles.tableWrapper}>
                  {loading ? (
                    <div className={styles.noLeads}>
                      <RefreshCw className={styles.noLeadsIcon} style={{ animation: 'spin 2s linear infinite' }} size={36} />
                      <p>Loading inquiries from CRM database...</p>
                    </div>
                  ) : error ? (
                    <div className={styles.noLeads}>
                      <p style={{ color: '#ef4444' }}>Error: {error}</p>
                      <button className={styles.btnCardActionPrimary} onClick={fetchLeads}>Retry Connection</button>
                    </div>
                  ) : (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th style={{ padding: '1rem', width: '40px' }}>
                            <div className={styles.checkboxContainer}>
                              <input 
                                type="checkbox" 
                                className={styles.tableCheckbox}
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                              />
                            </div>
                          </th>
                        <th className={styles.sortableHeader} onClick={() => requestSort('name')}>
                          <div className={styles.sortHeaderContent}>
                            <span>Name & Company</span>
                            <ChevronsUpDown size={14} />
                          </div>
                        </th>
                        <th>Contact Details</th>
                        <th className={styles.sortableHeader} onClick={() => requestSort('service')}>
                          <div className={styles.sortHeaderContent}>
                            <span>Service & Budget</span>
                            <ChevronsUpDown size={14} />
                          </div>
                        </th>
                        <th className={styles.sortableHeader} onClick={() => requestSort('source')}>
                          <div className={styles.sortHeaderContent}>
                            <span>Source</span>
                            <ChevronsUpDown size={14} />
                          </div>
                        </th>
                        <th className={styles.sortableHeader} onClick={() => requestSort('status')}>
                          <div className={styles.sortHeaderContent}>
                            <span>CRM Status</span>
                            <ChevronsUpDown size={14} />
                          </div>
                        </th>
                        <th>Admin Progress Notes (Auto-saves on blur)</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLeads.map(lead => {
                        const isSelected = selectedLeads.includes(lead.id);
                        return (
                          <tr key={lead.id} className={`${styles.leadRow} ${isSelected ? styles.leadRowSelected : ''}`}>
                            <td style={{ padding: '1.25rem 1rem' }}>
                              <div className={styles.checkboxContainer}>
                                <input 
                                  type="checkbox" 
                                  className={styles.tableCheckbox}
                                  checked={isSelected}
                                  onChange={() => handleSelectLead(lead.id)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className={styles.primaryDetail}>
                                <span className={styles.leadName}>{lead.name}</span>
                                <span className={styles.leadCompany}>{lead.company}</span>
                                {lead.city && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                    <MapPin size={12} /> {lead.city}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className={styles.leadContact}>
                                {lead.phone !== 'N/A' && (
                                  <a href={`tel:${lead.phone}`} className={styles.contactLink}>
                                    <Phone size={12} style={{ display: 'inline', marginRight: '0.25rem' }} /> {lead.phone}
                                  </a>
                                )}
                                {lead.email !== 'N/A' && (
                                  <a href={`mailto:${lead.email}`} className={styles.contactLink} style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                    <Mail size={12} style={{ display: 'inline', marginRight: '0.25rem' }} /> {lead.email}
                                  </a>
                                )}
                                {lead.phone === 'N/A' && lead.email === 'N/A' && <span className={styles.subtitle}>No Contact Details</span>}
                              </div>
                            </td>
                            <td>
                              <div className={styles.primaryDetail}>
                                <span className={styles.leadName} style={{ color: '#818cf8', fontWeight: 600 }}>{lead.service}</span>
                                {lead.budget && <span className={styles.budgetVal}>{lead.budget}</span>}
                                {lead.followupDate && (
                                  <span className={styles.timestamp} style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Calendar size={12} /> {lead.followupDate}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className={`${styles.badge} ${styles[`source_${lead.source}`]}`}>{lead.source}</span>
                            </td>
                            <td>
                              <select 
                                className={`${styles.statusSelector} ${styles[`status_${lead.status.replace(' ', '_')}`]}`}
                                value={lead.status}
                                onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                              >
                                <option value="New">New</option>
                                <option value="Interested">Interested</option>
                                <option value="Hot Lead">Hot Lead 🔥</option>
                                <option value="Follow Up">Follow Up 📅</option>
                                <option value="Not Interested">Not Interested</option>
                              </select>
                            </td>
                            <td>
                              <div className={styles.notesArea}>
                                <textarea 
                                  className={styles.notesTextarea}
                                  defaultValue={lead.notes}
                                  placeholder="Update lead progress..."
                                  onBlur={(e) => handleNotesChange(lead.id, e.target.value)}
                                />
                                {savingNoteId === lead.id && (
                                  <span className={styles.notesSaveIndicator}>
                                    <CheckCircle2 size={12} /> Syncing note...
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className={styles.rowActions}>
                                <button className={`${styles.btnAction} ${styles.btnView}`} onClick={() => openDetailedView(lead)} title="View Detail Details"><Eye size={16} /></button>
                                <button className={`${styles.btnAction} ${styles.btnEdit}`} onClick={() => startEditing(lead)} title="Modify Lead Record"><Edit size={16} /></button>
                                <button className={`${styles.btnAction} ${styles.btnDelete}`} onClick={() => handleDeleteLead(lead.id, lead.name)} title="Delete Lead Record"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {paginatedLeads.length === 0 && (
                        <tr>
                          <td colSpan={8} className={styles.noLeads}>
                            <FileText className={styles.noLeadsIcon} size={48} />
                            <p>No lead records found match current query criteria.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  )}
                </div>

                {/* Pagination footer */}
                {filteredLeads.length > 0 && (
                  <div className={styles.paginationRow}>
                    <div className={styles.paginationLeft}>
                      <span>Showing {Math.min(filteredLeads.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredLeads.length, currentPage * pageSize)} of {filteredLeads.length} leads</span>
                    </div>
                    <div className={styles.paginationButtons}>
                      <button 
                        className={styles.btnPage} 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      
                      {Array.from({ length: pageCount }).map((_, idx) => (
                        <button 
                          key={idx}
                          className={`${styles.btnPage} ${currentPage === idx + 1 ? styles.btnPageActive : ''}`}
                          onClick={() => setCurrentPage(idx + 1)}
                        >
                          {idx + 1}
                        </button>
                      ))}

                      <button 
                        className={styles.btnPage} 
                        disabled={currentPage === pageCount}
                        onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Bulk Operations Toolbar */}
              {selectedLeads.length > 0 && (
                <div className={styles.bulkActionsPanel}>
                  <span className={styles.bulkInfo}>{selectedLeads.length} leads selected</span>
                  <div className={styles.bulkControls}>
                    <select 
                      className={styles.bulkSelect}
                      value={bulkStatus}
                      onChange={(e) => {
                        setBulkStatus(e.target.value);
                        if (e.target.value) handleBulkStatusChange(e.target.value as Lead['status']);
                      }}
                    >
                      <option value="">Bulk Update Status</option>
                      <option value="New">Set to New</option>
                      <option value="Interested">Set to Interested</option>
                      <option value="Hot Lead">Set to Hot Lead 🔥</option>
                      <option value="Follow Up">Set to Follow Up 📅</option>
                      <option value="Not Interested">Set to Not Interested</option>
                    </select>

                    <button 
                      className={`${styles.btnBulkAction} ${styles.btnBulkDelete}`}
                      onClick={handleBulkDelete}
                    >
                      <Trash2 size={14} /> Bulk Delete
                    </button>

                    <button 
                      className={styles.btnBulkClear}
                      onClick={() => setSelectedLeads([])}
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 3: HOT LEADS GRID */}
          {activeTab === 'hot' && (
            <div className={styles.cardGrid}>
              {leads.filter(l => l.status === 'Hot Lead').map(lead => (
                <div key={lead.id} className={`${styles.leadCard} ${styles.leadCardHot}`}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h4 className={styles.cardTitle}>{lead.name}</h4>
                      <span className={styles.cardSubtitle}>{lead.company}</span>
                    </div>
                    <span className={`${styles.badge} ${styles.status_Hot_Lead}`} style={{ border: 'none' }}>Hot 🔥</span>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.cardContactInfo}>
                      {lead.phone !== 'N/A' && (
                        <a href={`tel:${lead.phone}`} className={styles.cardContactItem}>
                          <Phone size={12} /> {lead.phone}
                        </a>
                      )}
                      {lead.email !== 'N/A' && (
                        <a href={`mailto:${lead.email}`} className={styles.cardContactItem}>
                          <Mail size={12} /> {lead.email}
                        </a>
                      )}
                      {lead.city && (
                        <div className={styles.cardContactItem}>
                          <MapPin size={12} /> {lead.city}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <span className={styles.infoLabel}>Service Requested</span>
                      <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{lead.service}</span>
                        {lead.budget && <span className={styles.budgetVal}>{lead.budget}</span>}
                      </div>
                    </div>

                    {lead.message && (
                      <div>
                        <span className={styles.infoLabel}>Initial Inquiry Message</span>
                        <p className={styles.cardMessage}>{lead.message}</p>
                      </div>
                    )}

                    {lead.notes && (
                      <div>
                        <span className={styles.infoLabel}>Current Admin Notes</span>
                        <p className={styles.cardMessage} style={{ borderColor: 'rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}>{lead.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.timestamp}>
                      {new Date(lead.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </span>
                    <div className={styles.cardActions}>
                      <button className={styles.btnCardActionPrimary} onClick={() => openDetailedView(lead)}>View Profile</button>
                      <button className={styles.btnCardAction} onClick={() => startEditing(lead)} title="Edit Lead Details"><Edit size={14} /></button>
                      <button className={styles.btnCardAction} onClick={() => handleDeleteLead(lead.id, lead.name)} title="Remove Lead"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              {leads.filter(l => l.status === 'Hot Lead').length === 0 && (
                <div className={styles.noLeads} style={{ gridColumn: '1 / -1' }}>
                  <Flame size={48} className={styles.noLeadsIcon} />
                  <p>Great job! There are currently no unresolved Hot Leads in CRM.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOW UP LEADS GRID */}
          {activeTab === 'followup' && (
            <div className={styles.cardGrid}>
              {leads.filter(l => l.status === 'Follow Up' || l.followupDate).map(lead => {
                const overdue = isFollowUpOverdue(lead.followupDate);
                return (
                  <div key={lead.id} className={`${styles.leadCard} ${styles.leadCardFollowUp}`}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h4 className={styles.cardTitle}>{lead.name}</h4>
                        <span className={styles.cardSubtitle}>{lead.company}</span>
                      </div>
                      <span className={`${styles.badge} ${styles.status_Follow_Up}`} style={{ border: 'none' }}>Follow Up 📅</span>
                    </div>
                    <div className={styles.cardBody}>
                      {lead.followupDate && (
                        <div className={`${styles.cardFollowUpDate} ${overdue ? styles.cardFollowUpOverdue : ''}`}>
                          <Calendar size={14} />
                          <span>Follow Up: {lead.followupDate} {overdue ? '(OVERDUE)' : ''}</span>
                        </div>
                      )}

                      <div className={styles.cardContactInfo}>
                        {lead.phone !== 'N/A' && (
                          <a href={`tel:${lead.phone}`} className={styles.cardContactItem}>
                            <Phone size={12} /> {lead.phone}
                          </a>
                        )}
                        {lead.email !== 'N/A' && (
                          <a href={`mailto:${lead.email}`} className={styles.cardContactItem}>
                            <Mail size={12} /> {lead.email}
                          </a>
                        )}
                      </div>
                      
                      <div>
                        <span className={styles.infoLabel}>Requested Project</span>
                        <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span>{lead.service}</span>
                          {lead.budget && <span className={styles.budgetVal}>{lead.budget}</span>}
                        </div>
                      </div>

                      {lead.notes && (
                        <div>
                          <span className={styles.infoLabel}>Follow Up Context Notes</span>
                          <p className={styles.cardMessage}>{lead.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.timestamp}>
                        Created: {new Date(lead.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      <div className={styles.cardActions}>
                        <button className={styles.btnCardActionPrimary} onClick={() => openDetailedView(lead)}>View Profile</button>
                        <button className={styles.btnCardAction} onClick={() => startEditing(lead)} title="Edit Lead Details"><Edit size={14} /></button>
                        <button className={styles.btnCardAction} onClick={() => handleDeleteLead(lead.id, lead.name)} title="Remove Lead"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {leads.filter(l => l.status === 'Follow Up' || l.followupDate).length === 0 && (
                <div className={styles.noLeads} style={{ gridColumn: '1 / -1' }}>
                  <Calendar size={48} className={styles.noLeadsIcon} />
                  <p>No follow ups scheduled. Set follow up dates in lead profiles to track them here.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ADD / EDIT LEAD FORM */}
          {activeTab === 'addlead' && (
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <h2>{editingLead ? `Edit Profile: ${editingLead.name}` : 'Add New Client Inquiry'}</h2>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Client Name *</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="e.g. Rajesh Kumar"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Company / Business Name</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="e.g. RK Industries"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="e.g. 9876543210"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input 
                      type="email" 
                      className={styles.formInput} 
                      placeholder="e.g. info@rkindustries.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>City / Location</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="e.g. Mumbai"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Service Interest</label>
                    <select 
                      className={styles.formSelect}
                      value={formService}
                      onChange={(e) => setFormService(e.target.value)}
                    >
                      <option value="AI Automation">AI Automation</option>
                      <option value="WhatsApp Automation">WhatsApp Automation</option>
                      <option value="Website Development">Website Development</option>
                      <option value="Custom CRM Solutions">Custom CRM Solutions</option>
                      <option value="Other Technology">Other Tech Support</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Estimated Budget</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      placeholder="e.g. ₹50k - ₹1L"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Follow-Up Scheduled Date</label>
                    <input 
                      type="date" 
                      className={styles.formInput} 
                      value={formFollowupDate}
                      onChange={(e) => setFormFollowupDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lead Source Channel</label>
                    <select 
                      className={styles.formSelect}
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value as Lead['source'])}
                    >
                      <option value="Manual">Manual (Internal CRM Input)</option>
                      <option value="Form">Contact Form Submission</option>
                      <option value="Consultation">AI Consultation Hub</option>
                      <option value="WhatsApp">WhatsApp Message Link</option>
                      <option value="Call">Direct Call Action</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>CRM Lead Status</label>
                    <select 
                      className={styles.formSelect}
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as Lead['status'])}
                    >
                      <option value="New">New Inbound</option>
                      <option value="Interested">Interested / Contacted</option>
                      <option value="Hot Lead">Priority Hot Lead 🔥</option>
                      <option value="Follow Up">Follow Up Needed 📅</option>
                      <option value="Not Interested">Not Interested / Closed</option>
                    </select>
                  </div>

                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel}>Initial Inquiry Description / Message</label>
                    <textarea 
                      className={styles.formTextarea} 
                      placeholder="Enter details of what project the client wants to automate..."
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                    />
                  </div>

                  <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                    <label className={styles.formLabel}>Internal CRM Progress Notes</label>
                    <textarea 
                      className={styles.formTextarea} 
                      placeholder="Add status updates, callbacks, constraints or notes..."
                      value={formNotes}
                      onChange={(e) => setFormNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button 
                    type="button" 
                    className={styles.btnCancel}
                    onClick={() => { resetForm(); setActiveTab('leads'); }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className={styles.btnSubmit}
                  >
                    {editingLead ? 'Update Lead Details' : 'Create Lead Record'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className={styles.analyticsGrid}>
              
              {/* Metric stats card */}
              <div className={styles.analyticsCard}>
                <h3 className={styles.chartTitle}>Key Performance Indicators</h3>
                <div className={styles.metricGrid}>
                  <div className={styles.metricCard}>
                    <div className={styles.metricVal}>
                      {totalLeads > 0 ? Math.round(((hotLeadsCount + interestedLeadsCount) / totalLeads) * 100) : 0}%
                    </div>
                    <div className={styles.metricLabel}>Total Positive Interest Rate</div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricVal}>
                      {totalLeads > 0 ? Math.round((hotLeadsCount / totalLeads) * 100) : 0}%
                    </div>
                    <div className={styles.metricLabel}>Hot Lead Conversion Ratio</div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricVal}>
                      {leads.filter(l => l.source === 'WhatsApp' || l.source === 'Call').length}
                    </div>
                    <div className={styles.metricLabel}>Direct Mobile Conversions</div>
                  </div>
                  <div className={styles.metricCard}>
                    <div className={styles.metricVal}>
                      {leads.filter(l => l.notes && l.notes.trim().length > 0).length}
                    </div>
                    <div className={styles.metricLabel}>Leads with Active Progress Notes</div>
                  </div>
                </div>

                <h3 className={styles.chartTitle} style={{ borderLeftColor: '#10b981', marginTop: '1rem' }}>Service Breakdown</h3>
                <div className={styles.chartGrid}>
                  {['AI Automation', 'WhatsApp Automation', 'Website Development', 'Custom CRM Solutions'].map((serv, i) => {
                    const count = leads.filter(l => l.service === serv).length;
                    const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                    const colors = ['#6366f1', '#10b981', '#06b6d4', '#a855f7'];
                    return (
                      <div key={serv} className={styles.chartItem}>
                        <div className={styles.chartLabelRow}>
                          <span>{serv}</span>
                          <span>{count} ({pct}%)</span>
                        </div>
                        <div className={styles.chartBarBg}>
                          <div className={styles.chartBarFill} style={{ width: `${pct}%`, backgroundColor: colors[i % colors.length] }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Trend bar chart */}
              <div className={styles.analyticsCard}>
                <h3 className={styles.chartTitle}>Monthly Lead volume trend (Last 6 Months)</h3>
                <div className={styles.monthlyChartContainer}>
                  {monthlyData.map((d, index) => {
                    const pct = (d.count / maxMonthlyCount) * 80;
                    return (
                      <div key={index} className={styles.chartColumn}>
                        <div className={styles.chartColumnBar} style={{ height: `${pct || 5}%` }}>
                          <span className={styles.chartTooltip}>{d.count} Leads</span>
                        </div>
                        <span className={styles.chartColumnLabel}>{d.label}</span>
                      </div>
                    );
                  })}
                </div>
                
                <h3 className={styles.chartTitle} style={{ borderLeftColor: '#fb7185', marginTop: '2rem' }}>Source Efficiency</h3>
                <div className={styles.chartGrid}>
                  <div className={styles.chartItem}>
                    <div className={styles.chartLabelRow}>
                      <span>Contact Form Submission</span>
                      <span>{sourceFormCount} Inquiries</span>
                    </div>
                    <div className={styles.chartBarBg}>
                      <div className={styles.chartBarFill} style={{ width: `${pctForm}%`, backgroundColor: '#a855f7' }}></div>
                    </div>
                  </div>
                  <div className={styles.chartItem}>
                    <div className={styles.chartLabelRow}>
                      <span>AI Consultation Hub</span>
                      <span>{sourceConsultationCount} Inquiries</span>
                    </div>
                    <div className={styles.chartBarBg}>
                      <div className={styles.chartBarFill} style={{ width: `${pctConsultation}%`, backgroundColor: '#6366f1' }}></div>
                    </div>
                  </div>
                  <div className={styles.chartItem}>
                    <div className={styles.chartLabelRow}>
                      <span>WhatsApp Link clicks</span>
                      <span>{sourceWhatsAppCount} Inquiries</span>
                    </div>
                    <div className={styles.chartBarBg}>
                      <div className={styles.chartBarFill} style={{ width: `${pctWhatsApp}%`, backgroundColor: '#22c55e' }}></div>
                    </div>
                  </div>
                  <div className={styles.chartItem}>
                    <div className={styles.chartLabelRow}>
                      <span>Direct Calls clicks</span>
                      <span>{sourceCallCount} Inquiries</span>
                    </div>
                    <div className={styles.chartBarBg}>
                      <div className={styles.chartBarFill} style={{ width: `${pctCall}%`, backgroundColor: '#eab308' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* LEAD PROFILE DETAIL MODAL */}
      {detailedLead && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2>Client File: {detailedLead.name}</h2>
              <button className={styles.modalCloseBtn} onClick={() => setDetailedLead(null)}>
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Left Pane - Profile */}
              <div className={styles.modalLeftPane}>
                <div className={styles.infoSection}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Inquiry Reference</span>
                    <span className={styles.infoValue} style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{detailedLead.id}</span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Company / Org</span>
                    <span className={styles.infoValue}>{detailedLead.company}</span>
                  </div>
                  {detailedLead.city && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Location</span>
                      <span className={styles.infoValue} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={14} style={{ color: '#ef4444' }} /> {detailedLead.city}
                      </span>
                    </div>
                  )}
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Phone Contact</span>
                    {detailedLead.phone !== 'N/A' ? (
                      <a href={`tel:${detailedLead.phone}`} className={styles.contactLink} style={{ fontWeight: 600 }}>
                        <Phone size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> {detailedLead.phone}
                      </a>
                    ) : (
                      <span className={styles.infoValue}>N/A</span>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Email Contact</span>
                    {detailedLead.email !== 'N/A' ? (
                      <a href={`mailto:${detailedLead.email}`} className={styles.contactLink}>
                        <Mail size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> {detailedLead.email}
                      </a>
                    ) : (
                      <span className={styles.infoValue}>N/A</span>
                    )}
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Creation Date</span>
                    <span className={styles.infoValue} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} /> 
                      {new Date(detailedLead.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Marketing Channel Source</span>
                    <span className={`${styles.badge} ${styles[`source_${detailedLead.source}`]}`} style={{ width: 'fit-content' }}>
                      {detailedLead.source}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Pane - Inquiry */}
              <div className={styles.modalRightPane}>
                <div className={styles.infoSection}>
                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Automation Solution Requested</span>
                    <span className={styles.infoValue} style={{ color: '#818cf8', fontSize: '1.1rem', fontWeight: 700 }}>
                      {detailedLead.service}
                    </span>
                  </div>
                  
                  {detailedLead.budget && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Assigned Project Budget</span>
                      <span className={styles.budgetVal} style={{ width: 'fit-content', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                        {detailedLead.budget}
                      </span>
                    </div>
                  )}

                  {detailedLead.followupDate && (
                    <div className={styles.infoBlock}>
                      <span className={styles.infoLabel}>Scheduled Follow-Up callback</span>
                      <span className={styles.infoValue} style={{ color: '#c084fc', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                        <Calendar size={14} /> {detailedLead.followupDate}
                      </span>
                    </div>
                  )}

                  <div className={styles.infoBlock}>
                    <span className={styles.infoLabel}>Inquiry Message Details</span>
                    <p className={styles.infoValueParagraph}>
                      {detailedLead.message || 'No description message provided by client.'}
                    </p>
                  </div>

                  <div className={styles.infoBlock}>
                    <label className={styles.infoLabel}>Modify CRM Sales Status</label>
                    <select 
                      className={`${styles.formSelect} ${styles[`status_${modalStatus.replace(' ', '_')}`]}`}
                      value={modalStatus}
                      onChange={(e) => setModalStatus(e.target.value as Lead['status'])}
                      style={{ marginTop: '0.25rem', width: '200px' }}
                    >
                      <option value="New">New</option>
                      <option value="Interested">Interested</option>
                      <option value="Hot Lead">Hot Lead 🔥</option>
                      <option value="Follow Up">Follow Up 📅</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </div>

                  <div className={styles.modalNotesArea}>
                    <label className={styles.infoLabel}>Update Progress Notes</label>
                    <textarea 
                      className={styles.modalNotesTextarea}
                      value={modalNotes}
                      placeholder="Add follow-up notes, callback information, custom requirements..."
                      onChange={(e) => setModalNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={`${styles.modalBtn} ${styles.modalBtnCancel}`} onClick={() => setDetailedLead(null)}>
                Cancel
              </button>
              <button className={`${styles.modalBtn} ${styles.modalBtnSave}`} onClick={saveModalChanges}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST ALERTS */}
      <div className={styles.toastList}>
        {toasts.map(toast => (
          <div key={toast.id} className={styles.toastItem}>
            {toast.type === 'success' && <Check className={styles.toastIconSuccess} size={16} />}
            {toast.type === 'error' && <AlertTriangle className={styles.toastIconError} size={16} />}
            {toast.type === 'info' && <Clock className={styles.toastIconInfo} size={16} />}
            <span className={styles.toastContent}>{toast.message}</span>
            <button className={styles.toastCloseBtn} onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}>
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminDashboard;
