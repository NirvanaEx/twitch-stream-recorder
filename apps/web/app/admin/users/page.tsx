"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet, apiSend } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useLanguage } from "../../providers";
import { TrashIcon } from "../../components/icons";

type UserRow = {
  id: string;
  username: string;
  isSuperadmin: boolean;
  roleId: string | null;
  roleName: string | null;
  createdAt: string;
  updatedAt: string;
};

type RoleOption = {
  id: string;
  name: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

export default function AdminUsersPage() {
  const { t } = useLanguage();
  const { user: currentUser, hasPermission } = useAuth();
  const canManageRoles = hasPermission("manage_roles");

  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoleId, setNewRoleId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiGet<{ items: UserRow[] }>("users"),
        canManageRoles
          ? apiGet<{ items: RoleOption[] }>("roles")
          : Promise.resolve({ items: [] }),
      ]);
      setUsers(usersResponse.items);
      setRoles(rolesResponse.items.map((r) => ({ id: r.id, name: r.name })));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    }
  }, [canManageRoles, t.errors.requestFailed]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newUsername.trim() || !newPassword) return;

    setCreating(true);
    setError(null);
    setNotice(null);
    try {
      await apiSend("users", "POST", {
        username: newUsername.trim(),
        password: newPassword,
        roleId: newRoleId || null,
      });
      setNewUsername("");
      setNewPassword("");
      setNewRoleId("");
      await load();
      setNotice(t.users.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(user: UserRow, roleId: string) {
    if (user.isSuperadmin) return;
    setBusyId(user.id);
    setError(null);
    try {
      await apiSend(`users/${user.id}`, "PATCH", {
        roleId: roleId || null,
      });
      await load();
      setNotice(t.users.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function handleResetPassword(user: UserRow) {
    const newPwd = window.prompt(t.users.resetPasswordPrompt);
    if (!newPwd || newPwd.length < 4) return;

    setBusyId(user.id);
    setError(null);
    try {
      await apiSend(`users/${user.id}`, "PATCH", { password: newPwd });
      setNotice(t.users.saved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(user: UserRow) {
    if (currentUser?.id === user.id) {
      setError(t.users.cannotDeleteSelf);
      return;
    }
    if (!window.confirm(t.users.deleteConfirm)) return;

    setBusyId(user.id);
    setError(null);
    try {
      await apiSend(`users/${user.id}`, "DELETE");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.requestFailed);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="page-shell">
      <section className="page-header">
        <div>
          <h2 className="page-title">{t.users.title}</h2>
          <p className="page-copy">{t.users.subtitle}</p>
        </div>
      </section>

      {error ? <div className="notice error">{error}</div> : null}
      {notice ? <div className="notice success">{notice}</div> : null}

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.users.addTitle}</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreate}>
          <label className="form-row">
            <span className="form-label">{t.users.usernameLabel}</span>
            <input
              type="text"
              autoComplete="off"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
          </label>
          <label className="form-row">
            <span className="form-label">{t.users.passwordLabel}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
            />
          </label>
          <label className="form-row">
            <span className="form-label">{t.users.roleLabel}</span>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
            >
              <option value="">{t.users.roleNone}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </label>
          <div className="form-row form-row-actions">
            <button type="submit" className="btn primary" disabled={creating}>
              {creating ? t.common.loading : t.users.addButton}
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h3 className="section-title">{t.users.title}</h3>
        </div>
        {users.length === 0 ? (
          <div className="empty-state">{t.users.empty}</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{t.users.columnUsername}</th>
                  <th>{t.users.columnRole}</th>
                  <th className="col-meta">{t.users.columnCreated}</th>
                  <th className="col-actions">{t.users.columnActions}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.username}</strong>
                      {user.isSuperadmin ? (
                        <span className="badge live" style={{ marginLeft: 6 }}>
                          {t.users.superadminBadge}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {user.isSuperadmin ? (
                        <span style={{ color: "var(--text-faint)" }}>—</span>
                      ) : (
                        <select
                          value={user.roleId ?? ""}
                          onChange={(e) =>
                            void handleRoleChange(user, e.target.value)
                          }
                          disabled={busyId === user.id}
                        >
                          <option value="">{t.users.roleNone}</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="col-meta">{formatDate(user.createdAt)}</td>
                    <td className="col-actions">
                      <div className="action-row">
                        <button
                          type="button"
                          className="btn"
                          onClick={() => void handleResetPassword(user)}
                          disabled={busyId === user.id}
                        >
                          {t.users.resetPassword}
                        </button>
                        {!user.isSuperadmin ? (
                          <button
                            type="button"
                            className="icon-btn danger"
                            title={t.common.delete}
                            onClick={() => void handleDelete(user)}
                            disabled={busyId === user.id || currentUser?.id === user.id}
                          >
                            <TrashIcon />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
