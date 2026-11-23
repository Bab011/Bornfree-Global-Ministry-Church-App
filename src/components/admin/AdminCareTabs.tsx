import React, { useState } from 'react';
import {
  assignUserRole,
  moderatePrayerResponse,
  publishToPrayerWall,
  reviewTestimony,
  savePrayerAssignment,
  updatePastoralRequestStatus,
  updateVisitorStatusAndLog,
} from '@/src/services/firestoreService';
import {
  PastoralRequest,
  PrayerAssignment,
  PrayerRequest,
  PrayerResponse,
  PrayerStatus,
  RoleAssignment,
  Testimony,
  UserProfile,
  UserRole,
  Visitor,
  VisitorFollowUp,
  VisitorStatus,
} from '@/src/types/ministry';
import { ROLE_LABELS, STAFF_ROLES } from '@/src/constants/ministry';
import { useAuth } from '@/src/contexts/AuthContext';

export const AdminPrayerTab: React.FC<{
  requests: PrayerRequest[];
  assignments: PrayerAssignment[];
  responses: PrayerResponse[];
}> = ({ requests, assignments, responses }) => {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<PrayerStatus>('Assigned');
  const [assignedPastorName, setAssignedPastorName] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [pastoralNotes, setPastoralNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openEditor = (req: PrayerRequest) => {
    const existingAssign = assignments.find((a) => a.requestId === req.id);
    setSelectedId(req.id);
    setStatus(req.status);
    setAssignedPastorName(req.assignedPastorName || profile?.displayName || '');
    setFollowUpDate(req.followUpDate || existingAssign?.followUpDate || '');
    setPastoralNotes(existingAssign?.pastoralNotes || '');
    setNotice(null);
  };

  const handleSave = async (req: PrayerRequest) => {
    const existingAssign = assignments.find((a) => a.requestId === req.id);
    setSaving(true);
    try {
      await savePrayerAssignment({
        requestId: req.id,
        status,
        assignedPastorId: user?.uid,
        assignedPastorName: assignedPastorName || profile?.displayName || 'Assigned Pastor',
        followUpDate,
        pastoralNotes,
        existingAssignmentId: existingAssign?.id,
        existingHistory: existingAssign?.statusHistory,
      });
      setNotice('Prayer request assignment and private pastoral notes saved.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishWall = async (req: PrayerRequest) => {
    await publishToPrayerWall({
      sourceRequestId: req.id,
      displayName: req.name || 'Ministry Member',
      category: req.category,
      requestSummary: req.description,
    });
    setNotice('Published anonymized entry to the moderated Public Prayer Wall.');
  };

  const pendingEncouragements = responses.filter(
    (r) => r.type === 'encouragement' && !r.isApproved
  );

  return (
    <div className="space-y-6">
      {notice && (
        <div className="rounded-[2px] bg-white border border-[#151515]/20 p-3 text-xs font-medium text-[#151515]">
          {notice}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="font-display font-light text-2xl text-[#151515]">
          Incoming Prayer Requests
        </h2>
        {requests.length === 0 ? (
          <p className="text-sm text-[#6B6A67]">No prayer requests submitted yet.</p>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-[#151515]/12 p-5 space-y-3 rounded-[2px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6A67]">
                  <span>
                    <strong className="text-[#151515]">{req.category}</strong> · Privacy:{' '}
                    {req.privacy} · Status: <strong className="text-[#151515]">{req.status}</strong>
                  </span>
                  <span>
                    {req.name || 'Anonymous'} · {req.preferredContact}
                  </span>
                </div>
                <p className="text-sm text-[#151515]">{req.description}</p>
                {(req.email || req.phone) && (
                  <p className="text-xs text-[#6B6A67]">
                    Contact: {[req.email, req.phone].filter(Boolean).join(' · ')}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => (selectedId === req.id ? setSelectedId(null) : openEditor(req))}
                    className="btn-press rounded-[2px] bg-[#151515] hover:bg-[#1F1D1C] px-3.5 py-2 text-xs font-semibold text-white min-h-[38px]"
                  >
                    {selectedId === req.id ? 'Close Panel' : 'Assign / Update'}
                  </button>
                  {req.privacy === 'public_wall' && (
                    <button
                      type="button"
                      onClick={() => handlePublishWall(req)}
                      className="btn-press rounded-[2px] bg-[#F0F0EE] border border-[#151515]/15 hover:bg-[#E9DFC6] px-3.5 py-2 text-xs font-semibold text-[#151515] min-h-[38px]"
                    >
                      Approve to Prayer Wall
                    </button>
                  )}
                </div>

                {selectedId === req.id && (
                  <div className="mt-3 pt-4 border-t border-[#151515]/12 space-y-3 bg-[#F0F0EE] rounded-[2px] p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#151515] mb-1">
                          Status
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value as PrayerStatus)}
                          className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                        >
                          <option value="Received">Received</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#151515] mb-1">
                          Assigned Pastor
                        </label>
                        <input
                          type="text"
                          value={assignedPastorName}
                          onChange={(e) => setAssignedPastorName(e.target.value)}
                          placeholder="Pastor name"
                          className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#151515] mb-1">
                          Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={followUpDate}
                          onChange={(e) => setFollowUpDate(e.target.value)}
                          className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#151515] mb-1">
                        Private Pastoral Notes (Never visible to requester)
                      </label>
                      <textarea
                        rows={3}
                        value={pastoralNotes}
                        onChange={(e) => setPastoralNotes(e.target.value)}
                        className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none"
                        placeholder="Confidential pastoral observations..."
                      />
                    </div>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSave(req)}
                      className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-4 py-2 text-xs font-semibold text-[#151515] min-h-[40px]"
                    >
                      {saving ? 'Saving...' : 'Save Assignment & Notes'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {pendingEncouragements.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-[#151515]/12">
          <h3 className="font-display font-normal text-xl text-[#151515]">
            Pending Prayer Wall Encouragements
          </h3>
          {pendingEncouragements.map((resp) => (
            <div
              key={resp.id}
              className="bg-white border border-[#151515]/12 p-4 flex items-center justify-between gap-4 rounded-[2px]"
            >
              <div className="text-xs">
                <p className="font-semibold text-[#151515]">{resp.authorName}</p>
                <p className="text-[#6B6A67] mt-0.5">{resp.message}</p>
              </div>
              <button
                type="button"
                onClick={() => moderatePrayerResponse(resp.id, true)}
                className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-3.5 py-2 text-xs font-semibold text-[#151515] shrink-0"
              >
                Approve
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminVisitorsTab: React.FC<{
  visitors: Visitor[];
  followUps: VisitorFollowUp[];
}> = ({ visitors, followUps }) => {
  const { user, profile } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<VisitorStatus>('Assigned');
  const [channel, setChannel] = useState('Phone / WhatsApp');
  const [outcome, setOutcome] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async (visitor: Visitor) => {
    setSaving(true);
    try {
      await updateVisitorStatusAndLog({
        visitorId: visitor.id,
        status,
        assignedToUid: user?.uid,
        assignedToName: profile?.displayName || user?.email || 'Follow-Up Team',
        channel,
        outcome,
        nextFollowUpDate,
        internalNotes,
      });
      setOutcome('');
      setInternalNotes('');
      setSelectedId(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-light text-2xl text-[#151515]">
        First-Time Visitor Follow-Up
      </h2>
      {visitors.length === 0 ? (
        <p className="text-sm text-[#6B6A67]">No first-time visitors registered yet.</p>
      ) : (
        <div className="space-y-3">
          {visitors.map((v) => {
            const logs = followUps.filter((f) => f.visitorId === v.id);
            return (
              <div
                key={v.id}
                className="bg-white border border-[#151515]/12 p-5 space-y-3 rounded-[2px]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <h3 className="text-sm font-medium text-[#151515]">{v.fullName}</h3>
                    <p className="text-[#6B6A67]">
                      {v.city}, {v.country} · Wants contact: {v.wantsContact ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <span className="font-semibold text-[#151515]">{v.status}</span>
                </div>

                {(v.email || v.phone) && (
                  <p className="text-xs text-[#6B6A67]">
                    {[v.email, v.phone].filter(Boolean).join(' · ')}
                  </p>
                )}

                {logs.length > 0 && (
                  <div className="bg-[#F0F0EE] border border-[#151515]/12 p-3 space-y-1.5 text-xs rounded-[2px]">
                    <p className="font-semibold text-[#151515]">Follow-Up History</p>
                    {logs.map((l) => (
                      <p key={l.id} className="text-[#6B6A67]">
                        <strong className="text-[#151515]">{l.staffName}:</strong> {l.outcome}
                        {l.nextFollowUpDate ? ` (Next: ${l.nextFollowUpDate})` : ''}
                      </p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(selectedId === v.id ? null : v.id);
                    setStatus(v.status);
                  }}
                  className="btn-press rounded-[2px] bg-[#151515] hover:bg-[#1F1D1C] px-3.5 py-2 text-xs font-semibold text-white min-h-[38px]"
                >
                  {selectedId === v.id ? 'Close' : 'Log Follow-Up'}
                </button>

                {selectedId === v.id && (
                  <div className="mt-2 p-4 bg-[#F0F0EE] border border-[#151515]/12 space-y-3 rounded-[2px]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as VisitorStatus)}
                        className="rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                      >
                        <option value="New Visitor">New Visitor</option>
                        <option value="Assigned">Assigned</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Engaging">Engaging</option>
                        <option value="Connected">Connected</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <input
                        type="text"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value)}
                        placeholder="Channel (Call, Email...)"
                        className="rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                      />
                      <input
                        type="date"
                        value={nextFollowUpDate}
                        onChange={(e) => setNextFollowUpDate(e.target.value)}
                        className="rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                      />
                    </div>
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      placeholder="Contact attempt outcome (optional)"
                      className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                    />
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Internal follow-up notes..."
                      className="w-full rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs text-[#151515] focus:border-[#151515] focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleSave(v)}
                      className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-4 py-2 text-xs font-semibold text-[#151515] min-h-[40px]"
                    >
                      {saving ? 'Saving...' : 'Save Visitor Update'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const AdminTestimoniesTab: React.FC<{ testimonies: Testimony[] }> = ({ testimonies }) => (
  <div className="space-y-4">
    <h2 className="font-display font-light text-2xl text-[#151515]">Testimony Moderation</h2>
    {testimonies.length === 0 ? (
      <p className="text-sm text-[#6B6A67]">No testimonies submitted yet.</p>
    ) : (
      <div className="space-y-3">
        {testimonies.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-[#151515]/12 p-5 space-y-2.5 rounded-[2px]"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6B6A67]">
              <span>
                <strong className="text-[#151515]">{t.category}</strong> ·{' '}
                {t.isAnonymous ? 'Anonymous' : t.authorName} · Permission:{' '}
                {t.permissionToPublish ? 'Yes' : 'No'}
              </span>
              <span className="font-semibold capitalize text-[#151515]">{t.status}</span>
            </div>
            <p className="text-sm text-[#151515]">{t.description}</p>
            <div className="flex gap-2">
              {t.permissionToPublish && t.status !== 'approved' && (
                <button
                  type="button"
                  onClick={() => reviewTestimony(t.id, 'approved')}
                  className="btn-press rounded-[2px] bg-[#FCDC00] hover:bg-[#ffe32e] px-3.5 py-2 text-xs font-semibold text-[#151515]"
                >
                  Approve & Publish
                </button>
              )}
              {t.status !== 'rejected' && (
                <button
                  type="button"
                  onClick={() => reviewTestimony(t.id, 'rejected')}
                  className="btn-press rounded-[2px] border border-[#151515]/20 bg-white hover:bg-[#F0F0EE] px-3.5 py-2 text-xs font-medium text-[#151515]"
                >
                  Decline
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const AdminPastoralFollowUpTab: React.FC<{ requests: PastoralRequest[] }> = ({ requests }) => {
  const { user, profile } = useAuth();
  return (
    <div className="space-y-4">
      <h2 className="font-display font-light text-2xl text-[#151515]">
        Pastoral Follow-Up & Counselling
      </h2>
      {requests.length === 0 ? (
        <p className="text-sm text-[#6B6A67]">No pastoral requests submitted yet.</p>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="bg-white border border-[#151515]/12 p-5 space-y-2.5 rounded-[2px]"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-[#151515]">{r.requestType}</span>
                <span className="font-semibold text-[#151515]">{r.status}</span>
              </div>
              <p className="text-sm font-medium text-[#151515]">{r.fullName}</p>
              <p className="text-xs text-[#6B6A67]">
                {[r.email, r.phone, `Preferred: ${r.preferredContact}`].filter(Boolean).join(' · ')}
              </p>
              <p className="text-sm text-[#151515]">{r.message}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(['Assigned', 'In Progress', 'Closed'] as const).map((nextStatus) => (
                  <button
                    key={nextStatus}
                    type="button"
                    onClick={() =>
                      updatePastoralRequestStatus({
                        requestId: r.id,
                        status: nextStatus,
                        assignedPastorUid: user?.uid,
                        assignedPastorName: profile?.displayName || user?.email || 'Pastor',
                      })
                    }
                    className={`btn-press rounded-[2px] px-3 py-1.5 text-xs font-semibold ${
                      r.status === nextStatus
                        ? 'bg-[#FCDC00] text-[#151515]'
                        : 'bg-[#F0F0EE] border border-[#151515]/15 text-[#151515] hover:bg-[#E9DFC6]'
                    }`}
                  >
                    Mark {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminMembersTab: React.FC<{
  users: UserProfile[];
  roles: RoleAssignment[];
}> = ({ users, roles }) => {
  const { isSuperAdmin } = useAuth();
  const [notice, setNotice] = useState<string | null>(null);

  const getRoleForUid = (uid: string): UserRole =>
    roles.find((r) => r.uid === uid)?.role || 'MEMBER';

  const handleAssign = async (u: UserProfile, nextRole: Exclude<UserRole, 'GUEST'>) => {
    await assignUserRole({
      targetUid: u.uid,
      email: u.email,
      displayName: u.displayName,
      role: nextRole,
    });
    setNotice(`Updated ${u.displayName} to ${ROLE_LABELS[nextRole]}.`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display font-light text-2xl text-[#151515]">
          Member & Role Management
        </h2>
        <p className="text-xs text-[#6B6A67]">
          Only Super Admins can assign or modify staff roles. Permissions are enforced in Cloud Firestore rules.
        </p>
      </div>
      {notice && (
        <div className="rounded-[2px] bg-white border border-[#151515]/20 p-3 text-xs font-medium text-[#151515]">
          {notice}
        </div>
      )}
      {users.length === 0 ? (
        <p className="text-sm text-[#6B6A67]">No registered user profiles yet.</p>
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => {
            const currentRole = getRoleForUid(u.uid);
            return (
              <div
                key={u.uid}
                className="bg-white border border-[#151515]/12 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[2px]"
              >
                <div>
                  <p className="text-sm font-medium text-[#151515]">{u.displayName}</p>
                  <p className="text-xs text-[#6B6A67]">{u.email || u.uid}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin ? (
                    <select
                      value={currentRole}
                      onChange={(e) =>
                        handleAssign(u, e.target.value as Exclude<UserRole, 'GUEST'>)
                      }
                      className="rounded-[2px] border border-[#151515]/20 bg-white px-3 py-2 text-xs font-medium text-[#151515] focus:border-[#151515] focus:outline-none min-h-[40px]"
                    >
                      <option value="MEMBER">Member</option>
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs font-semibold text-[#151515]">
                      {ROLE_LABELS[currentRole]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
