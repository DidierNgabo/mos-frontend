'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  RefreshCw,
  Plus,
  Stethoscope,
  HeartPulse,
  HardHat,
  GraduationCap,
  TriangleAlert,
  UserCheck,
  MoreHorizontal,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} from '@/app/store/teams';
import { Team } from '@/app/store/teams/teams.types';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Can } from '@/app/components/auth/Can';
import { TeamModal } from '@/app/components/modals/TeamModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { toast } from 'sonner';

const TYPE_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    iconBg: string;
    dot: string;
  }
> = {
  CLINICAL: {
    label: 'Clinical Team',
    icon: Stethoscope,
    color: 'text-blue-600',
    iconBg: 'bg-blue-500/10',
    dot: 'bg-blue-500',
  },
  ALLIED_HEALTH: {
    label: 'Allied Health Professionals',
    icon: HeartPulse,
    color: 'text-purple-600',
    iconBg: 'bg-purple-500/10',
    dot: 'bg-purple-500',
  },
  SUPPORTING_STAFF: {
    label: 'Supporting Staff/Team',
    icon: HardHat,
    color: 'text-amber-600',
    iconBg: 'bg-amber-500/10',
    dot: 'bg-amber-500',
  },
  STUDENTS: {
    label: 'Students Team',
    icon: GraduationCap,
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-500/10',
    dot: 'bg-emerald-500',
  },
};

interface TeamsScreenProps {
  outreachId: string;
}

export default function TeamsScreen({ outreachId }: TeamsScreenProps) {
  const dispatch = useAppDispatch();
  const { list: teams, isLoading } = useAppSelector((s) => s.teams);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>(
    'create',
  );
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const load = () => {
    dispatch(fetchTeams({ outreachId, limit: 100 }));
  };

  useEffect(() => {
    if (outreachId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outreachId]);

  // Auto-expand categories that have matching sub-teams when searching
  useEffect(() => {
    if (!searchQuery) {
      setExpanded({});
      return;
    }
    const autoExpand: Record<string, boolean> = {};
    topLevelTeams.forEach((p) => {
      if (getSubTeams(p.id).length > 0) autoExpand[p.id] = true;
    });
    setExpanded(autoExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const topLevelTeams = teams.filter(
    (t) => t.parent === null && t.type !== null,
  );
  const allSubTeams = teams.filter((t) => t.parent !== null);

  const getSubTeams = (parentId: string) =>
    allSubTeams.filter(
      (t) =>
        t.parent?.id === parentId &&
        (!searchQuery ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase())),
    );

  // Stats
  const totalTeams = allSubTeams.length;
  const leadersAssigned = allSubTeams.filter((t) => t.leader !== null).length;
  const totalMembers = allSubTeams.reduce(
    (acc, t) => acc + (t.members?.length ?? 0),
    0,
  );
  const needingAttention = allSubTeams.filter(
    (t) => t.isActive && !t.leader,
  ).length;

  const handleOpenModal = (
    mode: 'create' | 'edit' | 'view',
    team: Team | null = null,
  ) => {
    setModalMode(mode);
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    try {
      if (modalMode === 'create') {
        await dispatch(createTeam(values)).unwrap();
        toast.success('Team created successfully');
      } else if (modalMode === 'edit' && selectedTeam) {
        await dispatch(
          updateTeam({ id: selectedTeam.id, data: values }),
        ).unwrap();
        toast.success('Team updated successfully');
      }
      load();
    } catch (err: unknown) {
      toast.error(typeof err === 'string' ? err : `Failed to ${modalMode} team`);
      throw err;
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete "${team.name}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteTeam(team.id)).unwrap();
      toast.success('Team deleted');
      load();
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const toggleExpanded = (parentId: string) => {
    setExpanded((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  if (!outreachId) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No outreach selected.
      </div>
    );
  }

  const visibleCategories = topLevelTeams.filter(
    (parent) => !searchQuery || getSubTeams(parent.id).length > 0,
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 w-52 rounded-xl bg-white/50 dark:bg-black/50 border-border text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl h-9"
            onClick={load}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          <Can do="create" on="Team">
            <Button
              size="sm"
              className="rounded-xl h-9 shadow-lg shadow-primary/20"
              onClick={() => handleOpenModal('create')}
            >
              <Plus className="w-4 h-4 mr-1" />
              New Team
            </Button>
          </Can>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          value={totalTeams}
          label="Total Teams"
        />
        <StatCard
          icon={UserCheck}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600"
          value={leadersAssigned}
          label="Leaders Assigned"
        />
        <StatCard
          icon={Users}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600"
          value={totalMembers}
          label="Total Members"
        />
        <StatCard
          icon={TriangleAlert}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600"
          value={needingAttention}
          label="Needing Attention"
        />
      </div>

      {/* Category sections */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : visibleCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
          <Users className="w-8 h-8 opacity-40" />
          <p>
            {searchQuery
              ? 'No teams match your search.'
              : 'No teams found for this outreach.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {visibleCategories.map((parent) => {
            const config = TYPE_CONFIG[parent.type!] ?? TYPE_CONFIG['CLINICAL'];
            const Icon = config.icon;
            const subTeams = getSubTeams(parent.id);
            const isExpanded = expanded[parent.id] ?? false;
            const categoryLeaders = subTeams.filter((t) => t.leader !== null).length;

            return (
              <div
                key={parent.id}
                className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-sm overflow-hidden"
              >
                {/* Category header — fully clickable accordion trigger */}
                <button
                  type="button"
                  onClick={() => toggleExpanded(parent.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/20 transition-colors select-none text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config.iconBg}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <span className={`font-bold text-base ${config.color}`}>
                        {config.label}
                      </span>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {subTeams.length} teams · {categoryLeaders} leader{categoryLeaders !== 1 ? 's' : ''} assigned
                        </p>
                      )}
                      <p className="text-xs mt-0.5">
                        {parent.leader ? (
                          <span className="text-muted-foreground">
                            Leader:{' '}
                            <span className="font-medium text-foreground">
                              {parent.leader.firstName} {parent.leader.lastName}
                            </span>
                          </span>
                        ) : (
                          <span className="text-destructive/70">No parent leader assigned</span>
                        )}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-muted/60 text-muted-foreground ml-1"
                    >
                      {subTeams.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Can do="update" on="Team">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', parent); }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), handleOpenModal('edit', parent))}
                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                        title="Edit parent team"
                      >
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </span>
                    </Can>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-muted-foreground transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </div>
                </button>

                {/* Expandable body */}
                {isExpanded && (
                  <>
                    {/* Column headers */}
                    <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 px-5 py-2 bg-muted/30 border-y border-border/30">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Leader</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Members</span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pr-2">Actions</span>
                    </div>

                    {/* Sub-team rows */}
                    {subTeams.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-6">No sub-teams.</p>
                    ) : (
                      <div className="divide-y divide-border/30">
                        {subTeams.map((sub) => (
                          <SubTeamRow
                            key={sub.id}
                            team={sub}
                            config={config}
                            onView={() => handleOpenModal('view', sub)}
                            onEdit={() => handleOpenModal('edit', sub)}
                            onDelete={() => handleDelete(sub)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <TeamModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedTeam(null);
        }}
        mode={modalMode}
        initialData={selectedTeam}
        outreachId={outreachId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function StatCard({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white/60 dark:bg-black/40 backdrop-blur-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </div>
    </div>
  );
}

function SubTeamRow({
  team,
  config,
  onView,
  onEdit,
  onDelete,
}: {
  team: Team;
  config: { dot: string; color: string };
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="grid grid-cols-[2fr_2fr_1fr_auto] gap-4 items-center px-5 py-3.5 hover:bg-muted/20 transition-colors group">
      {/* Team */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />
        <div className="min-w-0">
          <span className="font-medium text-sm truncate block">
            {team.name}
          </span>
          {!team.isActive && (
            <Badge
              variant="secondary"
              className="text-xs bg-rose-500/10 text-rose-600 border-rose-500/20 mt-0.5"
            >
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Leader */}
      <div className="min-w-0">
        {team.leader ? (
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-sm">
                {team.leader.firstName} {team.leader.lastName}
              </span>
              <Badge className="text-xs bg-primary/10 text-primary border-primary/20 font-medium">
                Team Lead
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5 mt-1">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3 shrink-0" />
                <span className="truncate">{team.leader.email}</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="w-3 h-3 shrink-0" />
                <span>{team.leader.phone ?? '—'}</span>
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm text-destructive/80 font-medium">
            No Leader Assigned
          </span>
        )}
      </div>

      {/* Members */}
      <div>
        <span className="text-sm text-muted-foreground">
          {team.members?.length ?? 0} members
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 rounded-lg text-xs opacity-80 hover:opacity-100"
          onClick={onView}
        >
          <Eye className="w-3.5 h-3.5 mr-1" />
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <Can do="update" on="Team">
              <DropdownMenuItem
                onClick={onEdit}
                className="gap-2 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </DropdownMenuItem>
            </Can>
            <Can do="delete" on="Team">
              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </DropdownMenuItem>
            </Can>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
